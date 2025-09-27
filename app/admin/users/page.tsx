"use client";
import { Suspense, useEffect, useState } from "react";

type ThreadRow = { id: string; email: string; title: string | null; updated_at: string; message_count: number };
type MemoryRow = { id: string; goal: string | null; prompt: string | null; mode: string; created_at: string };
type UserRow = {
  user_id: string; name: string; plan: string; spent_cents: number; remaining_credits: number;
  current_uses: number; extra_uses: number; files: number; feedback: number;
  total_uses: number; created_at: string; active_at: string | null;
};

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <UsersAdmin />
    </Suspense>
  );
}

function UsersAdmin() {
  const [tab, setTab] = useState<"activity"|"memory"|"manage">("activity");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>

      <div className="flex gap-2">
        <button className={`px-3 py-2 border rounded-xl ${tab==="activity"?"bg-black/5 dark:bg-white/10":""}`} onClick={()=>setTab("activity")}>Activity</button>
        <button className={`px-3 py-2 border rounded-xl ${tab==="memory"?"bg-black/5 dark:bg-white/10":""}`} onClick={()=>setTab("memory")}>User Memory</button>
        <button className={`px-3 py-2 border rounded-xl ${tab==="manage"?"bg-black/5 dark:bg-white/10":""}`} onClick={()=>setTab("manage")}>Manage Users</button>
      </div>

      {tab === "activity" && <ActivityTab />}
      {tab === "memory" && <MemoryTab />}
      {tab === "manage" && <ManageTab />}
    </div>
  );
}

/* ===== Activity ===== */
function ActivityTab() {
  const [q, setQ] = useState("");
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [emailAlertsSignup, setEmailAlertsSignup] = useState(false);
  const [emailAlertsAccess, setEmailAlertsAccess] = useState(false);

  async function load() {
    const r = await fetch(`/api/admin/users/activity?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    const j = await r.json();
    setThreads(j.threads ?? []);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input placeholder="Search by user, pickaxe, conversation" value={q} onChange={e=>setQ(e.target.value)} className="border rounded px-3 py-2"/>
          <button onClick={load} className="px-3 py-2 border rounded-xl">Search</button>
          <button onClick={()=>{ setQ(""); load(); }} className="px-3 py-2 border rounded-xl">Refresh</button>
          <button onClick={()=>exportCSV(threads)} className="px-3 py-2 border rounded-xl">Export</button>
        </div>
        <div className="relative">
          <details>
            <summary className="px-3 py-2 border rounded-xl cursor-pointer select-none">🔔 Alerts</summary>
            <div className="absolute right-0 mt-2 w-72 border rounded-xl bg-white shadow p-3 space-y-2 z-10">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={emailAlertsSignup} onChange={e=>setEmailAlertsSignup(e.target.checked)} />
                Send me an email when someone signs up
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={emailAlertsAccess} onChange={e=>setEmailAlertsAccess(e.target.checked)} />
                Send me an email when someone requests access
              </label>
              <div className="text-xs text-neutral-500">UI only (hook up your mailer later).</div>
            </div>
          </details>
        </div>
      </div>

      <div className="border rounded-xl divide-y">
        {threads.map(t=>(
          <div key={t.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{t.title || "Untitled"}</div>
              <div className="text-sm text-neutral-500">{new Date(t.updated_at).toLocaleString()}</div>
            </div>
            <div className="text-sm text-neutral-600">{t.email} • {t.message_count} messages</div>
            <div className="mt-2 text-sm">
              <SummaryButton threadId={t.id} />
            </div>
          </div>
        ))}
        {threads.length === 0 && <div className="p-6 text-center text-neutral-500">No activity.</div>}
      </div>
    </div>
  );
}

function SummaryButton({ threadId }: { threadId: string }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);

  async function summarize() {
    setLoading(true);
    try {
      const r = await fetch(`/api/threads/${threadId}`);
      const j = await r.json();
      const msgs: any[] = j.messages ?? [];
      const snippet = msgs.slice(-6).map(m=>`${m.role}: ${m.content}`).join("\n");
      setText(snippet.length ? `Summary: ${snippet.slice(0, 220)}…` : "No messages.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={summarize} className="px-2 py-1 border rounded">{loading ? "Summarizing..." : "AI summary"}</button>
      {text && <div className="mt-2 text-neutral-700">{text}</div>}
    </div>
  );
}

function exportCSV(rows: ThreadRow[]) {
  const csv = [
    ["thread_id","email","title","updated_at","message_count"].join(","),
    ...rows.map(r=>[r.id, r.email, JSON.stringify(r.title||""), r.updated_at, r.message_count].join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "activity.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ===== User Memory ===== */
function MemoryTab() {
  const [userId, setUserId] = useState("");
  const [mems, setMems] = useState<MemoryRow[]>([]);
  const [goal, setGoal] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("inactive");

  async function load() {
    const r = await fetch(`/api/admin/users/memories?user_id=${encodeURIComponent(userId)}`);
    const j = await r.json();
    setMems(j.memories ?? []);
  }
  useEffect(()=>{ load(); }, []);

  async function add() {
    const r = await fetch("/api/admin/users/memories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user_id: userId || undefined, goal, prompt, mode }),
    });
    if (r.ok) { setGoal(""); setPrompt(""); await load(); }
  }

  async function del(id: string) {
    await fetch("/api/admin/users/memories", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input placeholder="Search by user (email)…" value={userId} onChange={e=>setUserId(e.target.value)} className="border rounded px-3 py-2"/>
        <button onClick={load} className="px-3 py-2 border rounded-xl">Search</button>
      </div>

      <div className="border rounded-xl p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="block">
            <div className="text-sm">Goal</div>
            <input value={goal} onChange={e=>setGoal(e.target.value)} className="border rounded px-3 py-2 w-full"/>
          </label>
          <label className="block">
            <div className="text-sm">Behavior</div>
            <select value={mode} onChange={e=>setMode(e.target.value)} className="border rounded px-3 py-2 w-full">
              <option value="inactive">Inactive</option>
              <option value="collect">Collect</option>
              <option value="collect_use">Collect &amp; Use</option>
              <option value="collect_use_display">Collect, Use &amp; Display</option>
            </select>
          </label>
        </div>
        <label className="block">
          <div className="text-sm">Prompt</div>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} className="border rounded px-3 py-2 w-full h-28"/>
        </label>
        <button onClick={add} className="px-3 py-2 border rounded-xl">Add instruction</button>
      </div>

      <div className="border rounded-xl divide-y">
        {mems.map(m=>(
          <div key={m.id} className="p-3">
            <div className="text-sm text-neutral-500">{new Date(m.created_at).toLocaleString()} • {m.mode}</div>
            <div className="font-medium">{m.goal}</div>
            <div className="whitespace-pre-wrap">{m.prompt}</div>
            <div className="mt-2">
              <button onClick={()=>del(m.id)} className="px-2 py-1 border rounded text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {mems.length === 0 && <div className="p-6 text-center text-neutral-500">No memories yet.</div>}
      </div>
    </div>
  );
}

/* ===== Manage Users ===== */
function ManageTab() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<UserRow[]>([]);

  async function load() {
    const r = await fetch(`/api/admin/users/list?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    const j = await r.json();
    setRows(j.users ?? []);
  }
  useEffect(()=>{ load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input placeholder="Search by email or user ID" value={q} onChange={e=>setQ(e.target.value)} className="border rounded px-3 py-2"/>
        <button onClick={load} className="px-3 py-2 border rounded-xl">Search</button>
        <button onClick={()=>{ setQ(""); load(); }} className="px-3 py-2 border rounded-xl">Refresh</button>
        <button onClick={()=>exportUsers(rows)} className="px-3 py-2 border rounded-xl">Export</button>
        <button onClick={()=>alert("Add user coming soon")} className="px-3 py-2 border rounded-xl">Add user</button>
      </div>

      <div className="overflow-auto border rounded-xl">
        <table className="min-w-[1000px] text-sm">
          <thead className="text-left border-b">
            <tr>
              <th className="p-2"><input type="checkbox" disabled /></th>
              <th className="p-2">User</th>
              <th className="p-2">Memories</th>
              <th className="p-2">Spent</th>
              <th className="p-2">Remaining</th>
              <th className="p-2">Total uses</th>
              <th className="p-2">Files</th>
              <th className="p-2">Feedback</th>
              <th className="p-2">Active</th>
              <th className="p-2">Created</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(u=>(
              <tr key={u.user_id} className="border-b">
                <td className="p-2"><input type="checkbox" /></td>
                <td className="p-2">
                  <div className="font-medium">{u.user_id}</div>
                  <div className="text-neutral-500">{u.plan}</div>
                </td>
                <td className="p-2">–</td>
                <td className="p-2">${(u.spent_cents/100).toFixed(2)}</td>
                <td className="p-2">{u.remaining_credits}</td>
                <td className="p-2">{u.total_uses}</td>
                <td className="p-2">{u.files}</td>
                <td className="p-2">{u.feedback}</td>
                <td className="p-2">{u.active_at ? new Date(u.active_at).toLocaleDateString() : "-"}</td>
                <td className="p-2">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-2">
                  <details>
                    <summary className="px-2 py-1 border rounded cursor-pointer select-none">Manage</summary>
                    <div className="p-3 border rounded mt-2 bg-white shadow space-y-2 w-[360px]">
                      <div className="font-medium">{u.user_id}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <a className="px-2 py-1 border rounded text-center" href={`/history?q=${encodeURIComponent(u.user_id)}`}>See chats</a>
                        <a className="px-2 py-1 border rounded text-center" href={`/admin/users?tab=memory&user=${encodeURIComponent(u.user_id)}`}>See memories</a>
                      </div>
                      <div className="divide-y">
                        <div className="py-2">
                          <div className="font-medium">Usage & credits</div>
                          <div className="text-sm text-neutral-600">Remaining: {u.remaining_credits}</div>
                          <div className="text-sm text-neutral-600">Current uses: {u.current_uses}</div>
                          <div className="text-sm text-neutral-600">Extra uses: {u.extra_uses}</div>
                        </div>
                        <div className="py-2">
                          <div className="font-medium">Products owned</div>
                          <div className="text-sm text-neutral-500">Hook up to Stripe later.</div>
                        </div>
                        <div className="py-2">
                          <div className="font-medium">Uploaded files</div>
                          <div className="text-sm">{u.files} files</div>
                        </div>
                        <div className="py-2">
                          <div className="font-medium">Additional stats</div>
                          <div className="text-sm text-neutral-600">Feedback: {u.feedback}</div>
                          <div className="text-sm text-neutral-600">Total uses: {u.total_uses}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 border rounded text-red-600" onClick={()=>alert("Delete user coming soon")}>Delete user</button>
                        <button className="px-2 py-1 border rounded" onClick={()=>alert("Save changes coming soon")}>Save</button>
                      </div>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={11} className="p-6 text-center text-neutral-500">No users.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function exportUsers(rows: UserRow[]) {
  const csv = [
    ["user","plan","spent","remaining","total_uses","files","feedback","created","active"].join(","),
    ...rows.map(r=>[
      r.user_id, r.plan, (r.spent_cents/100).toFixed(2), r.remaining_credits, r.total_uses, r.files, r.feedback,
      new Date(r.created_at).toISOString(), r.active_at ? new Date(r.active_at).toISOString() : ""
    ].join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "users.csv"; a.click();
  URL.revokeObjectURL(url);
}
