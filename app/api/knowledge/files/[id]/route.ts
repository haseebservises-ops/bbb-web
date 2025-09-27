import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({} as any));
  const fields: string[] = [];
  const vals: any[] = [];

  if (typeof body.title === "string") { fields.push(`title=$${fields.length+2}`); vals.push(body.title); }
  if (typeof body.enable_citations === "boolean") { fields.push(`enable_citations=$${fields.length+2}`); vals.push(body.enable_citations); }
  if (typeof body.content === "string") {
    fields.push(`content=$${fields.length+2}`); vals.push(body.content);
    const size_bytes = Buffer.byteLength(body.content, "utf8");
    const chunks = Math.max(1, Math.ceil(body.content.length / 1500));
    fields.push(`size_bytes=$${fields.length+2}`); vals.push(size_bytes);
    fields.push(`chunks=$${fields.length+2}`); vals.push(chunks);
  }
  if (!fields.length) return Response.json({ ok: true });

  const { rowCount } = await pool.query(
    `UPDATE knowledge_files SET ${fields.join(", ")}, uploaded_at=uploaded_at WHERE id=$1 AND user_id=$${fields.length+2}`,
    [params.id, ...vals, session.user.id],
  );
  if (!rowCount) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { rowCount } = await pool.query(
    "DELETE FROM knowledge_files WHERE id=$1 AND user_id=$2",
    [params.id, session.user.id],
  );
  if (!rowCount) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
}
