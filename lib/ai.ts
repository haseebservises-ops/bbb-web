type Msg = { role: 'system'|'user'|'assistant'; content: string };

export async function chatGroq({
  model = 'llama-3.1-8b-instant',
  temperature = 0.7,
  max_tokens = 512,
  system,
  messages,
}: {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system: string;
  messages: Omit<Msg, 'role'>[] | { role:'user'|'assistant'; content:string }[];
}) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model, temperature, max_tokens,
      messages: [{ role: 'system', content: system }, ...messages as Msg[]],
    }),
  });

  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return (j.choices?.[0]?.message?.content ?? '') as string;
}
