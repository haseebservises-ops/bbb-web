import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();

  const { rows } = await pool.query(
    `
    SELECT t.id, t.user_id AS email, t.title, t.updated_at,
           COUNT(m.*) AS message_count
    FROM threads t
    LEFT JOIN messages m ON m.thread_id=t.id
    WHERE t.user_id ILIKE '%'||$1||'%' OR COALESCE(t.title,'') ILIKE '%'||$1||'%'
    GROUP BY t.id
    ORDER BY t.updated_at DESC
    LIMIT 200
    `,
    [q]
  );
  return Response.json({ threads: rows });
}
