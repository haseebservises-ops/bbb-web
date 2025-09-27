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
    WITH t AS (
      SELECT user_id, COUNT(*) AS threads, MAX(updated_at) AS last_active
      FROM threads GROUP BY user_id
    ),
    m AS (
      SELECT t.user_id, COUNT(*) AS messages
      FROM messages t
      GROUP BY t.user_id
    ),
    kf AS (
      SELECT user_id, COUNT(*) AS files
      FROM knowledge_files GROUP BY user_id
    ),
    fb AS (
      SELECT user_id, COUNT(*) AS feedbacks
      FROM feedback GROUP BY user_id
    )
    SELECT
      COALESCE(p.user_id, t.user_id, kf.user_id) AS user_id,
      COALESCE(p.name,'') AS name,
      COALESCE(p.image,'') AS image,
      COALESCE(p.plan,'starter') AS plan,
      COALESCE(p.spent_cents,0) AS spent_cents,
      COALESCE(p.remaining_credits,0) AS remaining_credits,
      COALESCE(p.current_uses,0) AS current_uses,
      COALESCE(p.extra_uses,0) AS extra_uses,
      COALESCE(kf.files,0) AS files,
      COALESCE(fb.feedbacks,0) AS feedback,
      COALESCE(t.threads,0) AS total_uses,
      COALESCE(p.created_at, now()) AS created_at,
      COALESCE(p.active_at, t.last_active) AS active_at
    FROM user_profiles p
    FULL OUTER JOIN t ON t.user_id = p.user_id
    FULL OUTER JOIN kf ON kf.user_id = p.user_id
    FULL OUTER JOIN fb ON fb.user_id = p.user_id
    WHERE COALESCE(p.user_id, t.user_id, kf.user_id) ILIKE '%'||$1||'%'
    ORDER BY COALESCE(p.active_at, t.last_active) DESC NULLS LAST
    LIMIT 200
    `,
    [q]
  );

  return Response.json({ users: rows });
}
