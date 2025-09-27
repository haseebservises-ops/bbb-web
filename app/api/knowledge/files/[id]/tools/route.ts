import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({} as any));
  const tool_key = (body.tool_key ?? "").toString().trim();
  if (!tool_key) return Response.json({ error: "missing_tool_key" }, { status: 400 });

  // ensure ownership
  const { rows: f } = await pool.query("SELECT 1 FROM knowledge_files WHERE id=$1 AND user_id=$2", [params.id, session.user.id]);
  if (!f[0]) return Response.json({ error: "not found" }, { status: 404 });

  await pool.query(
    `INSERT INTO knowledge_file_tools (file_id, tool_key) VALUES ($1,$2)
     ON CONFLICT (file_id, tool_key) DO NOTHING`,
    [params.id, tool_key],
  );
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({} as any));
  const tool_key = (body.tool_key ?? "").toString().trim();
  if (!tool_key) return Response.json({ error: "missing_tool_key" }, { status: 400 });

  await pool.query(
    "DELETE FROM knowledge_file_tools WHERE file_id=$1 AND tool_key=$2",
    [params.id, tool_key],
  );
  return Response.json({ ok: true });
}
