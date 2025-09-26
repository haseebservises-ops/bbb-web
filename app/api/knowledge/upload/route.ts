import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { embedTexts, chunk } from '@/lib/embed';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const bot_id = form.get('bot_id') as string;
  const file = form.get('file') as File;

  if (!bot_id || !file) return NextResponse.json({ error: 'bot_id and file required' }, { status: 400 });
  if (!file.name.match(/\.(txt|md)$/i)) return NextResponse.json({ error: 'Only .txt or .md for now' }, { status: 400 });

  const text = await file.text();
  const chs = chunk(text);
  const vectors = await embedTexts(chs);

  const [doc] = await db(
    `insert into kb_docs (bot_id, name) values ($1,$2) returning *`,
    [bot_id, file.name]
  );

  for (let i = 0; i < chs.length; i++) {
    const vec = `[${vectors[i].join(',')}]`; // pgvector literal
    await db(
      `insert into kb_chunks (doc_id, bot_id, chunk, embedding) values ($1,$2,$3,$4::vector)`,
      [doc.id, bot_id, chs[i], vec]
    );
  }

  return NextResponse.json({ ok: true, doc_id: doc.id, chunks: chs.length });
}
