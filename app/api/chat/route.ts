import { NextRequest } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const MODEL = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return new Response("Missing GROQ_API_KEY", { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const messages = (body?.messages ?? []) as { role: string; content: string }[];

  // minimal system; later we’ll inject your /admin “Prompt” text
  const sys = body?.system ?? "You are a friendly nutrition coach.";

  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages: [{ role: "system", content: sys }, ...messages],
      temperature: 0.6,
    }),
  });

  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => "");
    return new Response(text || "Groq error", { status: 500 });
  }

  // passthrough the SSE stream as plain text chunks
  const stream = new ReadableStream({
    async start(controller) {
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // parse SSE lines
        for (const line of buffer.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (!trimmed.startsWith("data:")) continue;
          const json = trimmed.slice(5).trim();
          if (json === "[DONE]") continue;

          try {
            const obj = JSON.parse(json);
            const delta = obj.choices?.[0]?.delta?.content ?? "";
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            /* ignore parse blips */
          }
        }
        buffer = "";
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
