import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    id, name, system_prompt, model, temperature, max_output,
    profile_image_url, chat_icon, placeholder, use_words = [], avoid_words = []
  } = body;

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const sql = id
    ? `update bots set
        name=$2, system_prompt=$3, model=$4, temperature=$5, max_output=$6,
        profile_image_url=$7, chat_icon=$8, placeholder=$9,
        use_words=$10, avoid_words=$11, updated_at=now()
       where id=$1 returning *`
    : `insert into bots
        (name, system_prompt, model, temperature, max_output,
         profile_image_url, chat_icon, placeholder, use_words, avoid_words)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *`;

  const params = id
    ? [id, name, system_prompt, model, temperature, max_output, profile_image_url, chat_icon, placeholder, use_words, avoid_words]
    : [name, system_prompt, model, temperature, max_output, profile_image_url, chat_icon, placeholder, use_words, avoid_words];

  const [row] = await db(sql, params);
  return NextResponse.json(row);
}
