// app/api/generate/route.ts
export const runtime = "edge"; // Faster on Vercel edge
export const dynamic = "force-dynamic"; // No caching

type ChatMsg =
  | string
  | { role?: "user" | "assistant" | "system"; content?: string; text?: string };

function readLast(messages: ChatMsg[]): string {
  const lastMsg = messages?.[messages.length - 1];
  if (!lastMsg) return "";
  if (typeof lastMsg === "string") return lastMsg;
  return (lastMsg.text ?? lastMsg.content ?? "").toString();
}

function demoStream(text: string, score: number): ReadableStream<Uint8Array> {
  const demo =
    `Quick take: fuel is about ${score}/100. ` +
    `Add ~25–30g lean protein and swap a refined carb for a veg/whole-grain to nudge it up. ` +
    `For “${text.slice(0, 80)}…”, try the “make this higher-fuel” tweak.`;

  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      let i = 0;
      const id = setInterval(() => {
        const chunk = demo.slice(i, i + 2);
        controller.enqueue(encoder.encode(chunk));
        i += 2;
        if (i >= demo.length) {
          clearInterval(id);
          controller.close();
        }
      }, 16);
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const messages: ChatMsg[] = body?.messages ?? [];
  const profile = body?.profile ?? {};
  const last = readLast(messages);
  const score = typeof profile?.score === "number" ? profile.score : 72;

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  // Fallback demo (no key or in local/dev)
  if (!apiKey) {
    const stream = demoStream(last, score);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  // Build a small system prompt to keep responses on-brand
  const system =
    "You are Better Bite Buddy, a warm, evidence-based nutrition & mindset coach. " +
    "Give concise, actionable guidance in 2–5 sentences. Assume the user is busy. " +
    `User fuel score context: ${score}/100.`;

  // Groq OpenAI-compatible streaming endpoint
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.6,
      max_tokens: 350,
      messages: [
        { role: "system", content: system },
        { role: "user", content: last || "Give me a one-minute better-fuel tip." },
      ],
    }),
  });

  if (!resp.ok || !resp.body) {
    // Fallback to demo on upstream error
    const stream = demoStream(last, score);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  // Parse OpenAI-style SSE and stream out only the text deltas
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const ln of lines) {
            const line = ln.trim();
            if (!line.startsWith("data:")) continue;
            const jsonStr = line.slice(5).trim();
            if (jsonStr === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(jsonStr);
              const delta: string = json?.choices?.[0]?.delta?.content ?? "";
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // ignore partials
            }
          }
        }
      } catch {
        // On network problem, end gracefully
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}