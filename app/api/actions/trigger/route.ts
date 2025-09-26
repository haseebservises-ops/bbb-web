import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { bot_id, kind, payload } = await req.json();
  const [action] = await db(`select * from actions where bot_id=$1 and kind=$2`, [bot_id, kind]);
  if (!action) return NextResponse.json({ error: 'action not found' }, { status: 404 });

  // For kind='webhook', expect { url, headers }
  const { url, headers } = action.config || {};
  if (!url) return NextResponse.json({ error: 'webhook url missing' }, { status: 400 });

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: JSON.stringify(payload || {}),
  });

  const text = await r.text();
  return NextResponse.json({ ok: r.ok, status: r.status, body: text });
}
