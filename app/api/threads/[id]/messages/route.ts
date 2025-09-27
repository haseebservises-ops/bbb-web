// app/api/threads/[id]/messages/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { pool } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { runAI, type ChatMessage } from "@/lib/ai";

type Params = { params: { id: string } };

async function getCollectHistory(userId: string) {
  const { rows } = await pool.query(
    "SELECT collect_history FROM studio_settings WHERE user_id=$1",
    [userId],
  );
  return rows[0]?.collect_history !== false; // default true
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });
  const threadId = params.id;

  // Ensure ownership
  const { rows: t } = await pool.query(
    "SELECT id FROM threads WHERE id=$1 AND user_id=$2 AND archived=false",
    [threadId, session.user.id],
  );
  if (!t[0]) return Response.json({ error: "not found" }, { status: 404 });

  const body = await req.json();
  const content = (body?.content ?? "").toString();
  const providerName = (body?.provider ?? "openai") as "openai" | "gemini";
  const model = body?.model as string | undefined;

  if (!content.trim()) return Response.json({ error: "empty" }, { status: 400 });

  const historyOn = await getCollectHistory(session.user.id);

  // Save user message (if collecting)
  if (historyOn) {
    await pool.query(
      "INSERT INTO messages (thread_id, role, content) VALUES ($1,'user',$2)",
      [threadId, content],
    );
  }

  // Load last N messages to build context
  const { rows: prior } = await pool.query(
    `SELECT role, content FROM messages
     WHERE thread_id=$1
     ORDER BY created_at DESC
     LIMIT 20`,
    [threadId],
  );
  const context: ChatMessage[] = prior
    .reverse()
    .map((m) => ({ role: m.role as ChatMessage["role"], content: m.content }));

  context.push({ role: "user", content });

  // Call model
  const aiKey =
    providerName === "openai" ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY;
  if (!aiKey) return Response.json({ error: "missing_api_key" }, { status: 500 });

  const reply = await runAI(
    providerName === "openai"
      ? { name: "openai", apiKey: aiKey, model }
      : { name: "gemini", apiKey: aiKey, model },
    context,
  );

  if (historyOn) {
    await pool.query(
      "INSERT INTO messages (thread_id, role, content) VALUES ($1,'assistant',$2)",
      [threadId, reply],
    );
    await pool.query("UPDATE threads SET updated_at=now() WHERE id=$1", [threadId]);
  }

  return Response.json({ reply });
}
