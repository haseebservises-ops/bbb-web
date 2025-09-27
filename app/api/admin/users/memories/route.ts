import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("user_id") || session.user.id;
  const { rows } = await pool.query(
    "SELECT * FROM user_memories WHERE user_id=$1 ORDER BY created_at DESC",
    [email]
  );
  return Response.json({ memories: rows });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({} as any));
  const email = (body.user_id ?? session.user.id).toString();
  const goal = (body.goal ?? "").toString();
  const prompt = (body.prompt ?? "").toString();
  const mode = (body.mode ?? "inactive").toString();
  const { rows } = await pool.query(
    `INSERT INTO user_memories (user_id, goal, prompt, mode) VALUES ($1,$2,$3,$4) RETURNING *`,
    [email, goal, prompt, mode]
  );
  return Response.json({ memory: rows[0] });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({} as any));
  const id = (body.id ?? "").toString();
  if (!id) return Response.json({ error: "missing_id" }, { status: 400 });
  await pool.query("DELETE FROM user_memories WHERE id=$1", [id]);
  return Response.json({ ok: true });
}
