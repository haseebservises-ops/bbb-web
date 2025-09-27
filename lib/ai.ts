// lib/ai.ts
// SERVER-ONLY utilities (no external SDKs)

// --- Your existing GROQ helper (kept as-is) ---
type Msg = { role: "system" | "user" | "assistant"; content: string };

export async function chatGroq({
  model = "llama-3.1-8b-instant",
  temperature = 0.7,
  max_tokens = 512,
  system,
  messages,
}: {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system: string;
  messages: Omit<Msg, "role">[] | { role: "user" | "assistant"; content: string }[];
}) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens,
      messages: [{ role: "system", content: system }, ...(messages as Msg[])],
    }),
  });

  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return (j.choices?.[0]?.message?.content ?? "") as string;
}

// --- Provider-agnostic helper (OpenAI / Gemini via fetch) ---
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type Provider =
  | { name: "openai"; apiKey?: string; model?: string }
  | { name: "gemini"; apiKey?: string; model?: string };

export async function runAI(provider: Provider, messages: ChatMessage[]): Promise<string> {
  if (provider.name === "openai") {
    const apiKey = provider.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model ?? "gpt-4o-mini",
        temperature: 0.7,
        messages,
      }),
    });
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    return j.choices?.[0]?.message?.content ?? "";
  }

  // Gemini (REST)
  const apiKey = provider.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  // Convert OAI-style messages to a single prompt (simple + reliable)
  const prompt = messages
    .map((m) => (m.role === "user" ? `User: ${m.content}` : m.role === "assistant" ? `Assistant: ${m.content}` : m.content))
    .join("\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${
    provider.model ?? "gemini-1.5-pro"
  }:generateContent?key=${apiKey}`;

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  const text =
    j.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ??
    j.candidates?.[0]?.content?.parts?.[0]?.text ??
    "";
  return text;
}
