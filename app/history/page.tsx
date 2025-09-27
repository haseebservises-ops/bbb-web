import Link from "next/link";
import { absoluteUrl } from "@/lib/absolute-url";

async function getThreads() {
  const res = await fetch(absoluteUrl("/api/threads"), { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.threads as Array<{ id: string; title: string | null }>;
}

export default async function HistoryPage() {
  const threads = await getThreads();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chat History</h1>
        <Link href="/chat/new" className="px-3 py-2 rounded-xl shadow border">New Chat</Link>
      </div>

      <ul className="divide-y">
        {threads.map((t) => (
          <li key={t.id} className="py-3">
            <Link href={`/chat/${t.id}`} className="hover:underline">
              {t.title ?? "Untitled"}
            </Link>
          </li>
        ))}
        {threads.length === 0 && <li className="text-sm text-neutral-500">No threads yet.</li>}
      </ul>
    </div>
  );
}
