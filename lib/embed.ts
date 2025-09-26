export async function embedTexts(texts: string[]): Promise<number[][]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/baai/bge-base-en-v1.5`;

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CF_AI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: texts }),
  });

  if (!r.ok) {
    throw new Error(`Embeddings failed: ${r.status} ${await r.text()}`);
  }

  const j = await r.json();
  // Cloudflare returns { result: { data: number[][] } }
  const vectors = (j?.result?.data ?? []) as number[][];
  return vectors;
}

export function chunk(text: string, size = 800, overlap = 150) {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    out.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return out;
}
