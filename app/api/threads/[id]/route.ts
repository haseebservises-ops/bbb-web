// app/api/threads/[id]/route.ts
import { getServerSession } from "next-auth";
import { pool } from "@/lib/db";
import { authOptions } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { rows: t } = await pool.query(
    "SELECT id, title, archived, created_at, updated_at FROM threads WHERE id=$1 AND user_id=$2",
    [params.id, session.user.id],
  );
  if (!t[0]) return Response.json({ error: "not found" }, { status: 404 });
  const { rows: msgs } = await pool.query(
    "SELECT id, role, content, created_at FROM messages WHERE thread_id=$1 ORDER BY created_at ASC",
    [params.id],
  );
  return Response.json({ thread: t[0], messages: msgs });
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });
  await pool.query("UPDATE threads SET archived=true WHERE id=$1 AND user_id=$2", [
    params.id,
    session.user.id,
  ]);
  return Response.json({ ok: true });
}
