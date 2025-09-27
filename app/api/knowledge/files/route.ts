import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { rows } = await pool.query(
    `SELECT f.*, ARRAY(SELECT kft.tool_key FROM knowledge_file_tools kft WHERE kft.file_id=f.id) AS tools
     FROM knowledge_files f
     WHERE user_id=$1
     ORDER BY uploaded_at DESC`,
    [session.user.id],
  );
  return Response.json({ files: rows });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const source_type = (body.source_type ?? "url") as "upload"|"url"|"notion_page"|"notion_db"|"gdrive";
  const title = (body.title ?? "").toString().trim() || null;
  const source_url = (body.source_url ?? "").toString().trim() || null;
  const content = (body.content ?? "").toString() || null;
  const mime = (body.mime ?? null) as string | null;

  // basic size/chunks
  const size_bytes = content ? Buffer.byteLength(content, "utf8") : 0;
  const chunks = content ? Math.max(1, Math.ceil(content.length / 1500)) : 0;

  const { rows } = await pool.query(
    `INSERT INTO knowledge_files (user_id, title, source_type, source_url, mime, size_bytes, chunks, content)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [session.user.id, title, source_type, source_url, mime, size_bytes, chunks, content],
  );
  return Response.json({ file: rows[0] });
}
