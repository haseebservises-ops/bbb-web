// app/api/generate/route.ts
export const runtime = "edge";

type ChatMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | string;

function demoStream(text: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      let i = 0;
      const id = setInterval(() => {
        const chunk = text.slice(i, i + 2);
        controller.enqueue(encoder.encode(chunk));
        i += 2;
        if (i >= text.length) {
          clearInterval(id);
          controller.close();
        }
      }, 16);
    },
  });
}

export async function POST(req: Request) {
  const { messages = [], profile } = await req.json();

  // --- compose a tiny default system prompt (optional)
  const sys =
    "You are Better Bite Buddy — concise, friendly, evidence-based nutrition + mindset coach. Keep replies short and immediately useful.";

  // Normalize incoming messages to OpenAI/Groq shape
  const chat: { role: "system" | "user" | "assistant"; content: string }[] = [];
  chat.push({ role: "system", content: sys });

  for (const m of messages as ChatMessage[]) {
    if (typeof m === "string") {
      chat.push({ role: "user", content: m });
    } else if (m && typeof m === "object") {
      // allow {text} or {content}
      const content =
        (m as any).content ??
        (m as any).text ??
        (typeof (m as any).message === "string" ? (m as any).message : "");
      const role = (m as any).role || "user";
      if (typeof content === "string") {
        chat.push({
          role: role === "assistant" ? "assistant" : role === "system" ? "system" : "user",
          content,
        });
      }
    }
  }

  // A tiny “coach context” using supplied profile if present
  const score =
    typeof profile?.score === "number" && Number.isFinite(profile.score)
      ? profile.score
      : 72;

  // If no Groq key, keep your current demo streamer (safe fallback)
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    const last = chat.at(-1)?.content ?? "";
    const demo =
      `Quick take: fuel is about ${score}/100. ` +
      `Add ~25–30g lean protein and swap a refined carb for a veg/whole-grain to nudge it up. ` +
      `For “${String(last).slice(0, 80)}…”, try the “make this higher-fuel” tweak.`;
    return new Response(demoStream(demo), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  // --- Groq (OpenAI-compatible) streaming
  const model =
    process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant"; // change later if you like

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      stream: true,
      messages: chat,
    }),
  });

  if (!res.ok || !res.body) {
    // hard fallback to demo if Groq errors out
    const last = chat.at(-1)?.content ?? "";
    const demo =
      `Quick take: fuel is about ${score}/100. ` +
      `Add ~25–30g lean protein and swap a refined carb for a veg/whole-grain to nudge it up. ` +
      `For “${String(last).slice(0, 80)}…”, try the “make this higher-fuel” tweak.`;
    return new Response(demoStream(demo), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  // Convert Groq SSE -> plain text stream (your UI expects raw text)
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith("data:")) continue;

          const data = line.slice(5).trim(); // after "data:"
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              controller.enqueue(encoder.encode(delta));
            }
          } catch {
            // ignore parse errors on heartbeats, etc.
          }
        }
      }
      // flush remaining
      if (buffer.length > 0) {
        try {
          const json = JSON.parse(buffer.replace(/^data:\s*/, "").trim());
          const delta = json?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length > 0) {
            controller.enqueue(encoder.encode(delta));
          }
        } catch {}
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
