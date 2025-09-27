// app/api/threads/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { pool } from "@/lib/db"; // your existing pg Pool
import { authOptions } from "@/lib/auth"; // your NextAuth options

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { rows } = await pool.query(
    `SELECT id, title, archived, created_at, updated_at
     FROM threads
     WHERE user_id = $1 AND archived = false
     ORDER BY updated_at DESC`,
    [session.user.id],
  );
  return Response.json({ threads: rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { title } = await req.json().catch(() => ({}));
  const { rows } = await pool.query(
    `INSERT INTO threads (user_id, title)
     VALUES ($1, COALESCE($2,'New chat'))
     RETURNING id, title, archived, created_at, updated_at`,
    [session.user.id, title],
  );
  return Response.json({ thread: rows[0] });
}
