"use client";
import { useEffect, useMemo, useState } from "react";

/* =========================
   API-backed knowledge files
   ========================= */
type KFile = {
  id: string;
  title: string | null;
  source_type: "upload" | "url" | "notion_page" | "notion_db" | "gdrive";
  source_url: string | null;
  mime: string | null;
  size_bytes: number;
  chunks: number;
  enable_citations: boolean;
  uploaded_at: string;
  tools?: string[];
};

const ADD_OPTIONS = [
  { key: "upload", label: "Upload text snippet" }, // MVP
  { key: "url", label: "Link web page" },
  { key: "notion_page", label: "Link Notion page (placeholder)" },
  { key: "notion_db", label: "Link Notion database (placeholder)" },
  { key: "gdrive", label: "Select from Google Drive (placeholder)" },
] as const;

/* =========================
   Local notes (your original)
   ========================= */
type LocalItem = { title: string; text: string };

export default function AdminKnowledge() {
  // ---- API-backed files state
  const [files, setFiles] = useState<KFile[]>([]);
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [addMode, setAddMode] = useState<(typeof ADD_OPTIONS)[number]["key"]>("url");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [snippet, setSnippet] = useState("");
  const allChecked = useMemo(
    () => files.length > 0 && files.every((f) => checked[f.id]),
    [files, checked]
  );

  async function loadFiles() {
    const r = await fetch("/api/knowledge/files", { cache: "no-store" });
    const j = await r.json();
    setFiles(j.files ?? []);
    setChecked({});
  }
  useEffect(() => { loadFiles(); }, []);

  async function addFile() {
    const body: any = { source_type: addMode, title: title || null };
    if (addMode === "url" || addMode === "notion_page" || addMode === "notion_db" || addMode === "gdrive") {
      body.source_url = url || null;
    } else if (addMode === "upload") {
      body.content = snippet || "";
      body.mime = "text/plain";
    }
    const r = await fetch("/api/knowledge/files", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      setTitle(""); setUrl(""); setSnippet(""); setAddMode("url");
      await loadFiles();
    } else {
      alert(await r.text());
    }
  }

  async function toggleCite(f: KFile) {
    await fetch(`/api/knowledge/files/${f.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enable_citations: !f.enable_citations }),
    });
    await loadFiles();
  }

  async function removeFile(id: string) {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/knowledge/files/${id}`, { method: "DELETE" });
    await loadFiles();
  }

  async function addTool(id: string) {
    const tool_key = prompt("Enter tool key (e.g., coach, intake, demo):", "coach");
    if (!tool_key) return;
    await fetch(`/api/knowledge/files/${id}/tools`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool_key }),
    });
    await loadFiles();
  }

  async function removeTool(id: string, tool_key: string) {
    await fetch(`/api/knowledge/files/${id}/tools`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool_key }),
    });
    await loadFiles();
  }

  const filtered = files.filter(
    (f) =>
      (f.title ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (f.source_url ?? "").toLowerCase().includes(query.toLowerCase())
  );

  // ---- Local notes state (your original UI/behavior)
  const [items, setItems] = useState<LocalItem[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bbb_studio_knowledge");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  function saveAllNotes() {
    try {
      localStorage.setItem("bbb_studio_knowledge", JSON.stringify(items));
      alert("Saved");
    } catch {}
  }
  function addNote() {
    if (!noteTitle.trim() || !noteText.trim()) return;
    setItems((x) => [...x, { title: noteTitle.trim(), text: noteText.trim() }]);
    setNoteTitle("");
    setNoteText("");
  }
  function delNote(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="p-6 space-y-8">
      {/* Integrations */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Knowledge Base</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-xl p-4">
            <div className="font-medium">Notion</div>
            <div className="text-sm text-neutral-600">
              Connect your Notion workspace to import pages or databases.
            </div>
            <button
              disabled
              className="mt-3 px-3 py-2 rounded-lg border shadow-sm opacity-60 cursor-not-allowed"
            >
              Connect (coming soon)
            </button>
          </div>
          <div className="border rounded-xl p-4">
            <div className="font-medium">Google</div>
            <div className="text-sm text-neutral-600">Connect Drive or Sheets.</div>
            <button
              disabled
              className="mt-3 px-3 py-2 rounded-lg border shadow-sm opacity-60 cursor-not-allowed"
            >
              Connect (coming soon)
            </button>
          </div>
        </div>
      </section>

      {/* Add file (API-backed) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">All files</h2>
          <div className="flex items-center gap-2">
            <input
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="border rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {ADD_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => setAddMode(o.key)}
                className={`px-3 py-1.5 rounded-lg border ${
                  addMode === o.key ? "bg-black/5 dark:bg-white/10" : ""
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            <input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded px-3 py-2"
            />

            {(addMode === "url" ||
              addMode === "notion_page" ||
              addMode === "notion_db" ||
              addMode === "gdrive") && (
              <input
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="border rounded px-3 py-2"
              />
            )}
            {addMode === "upload" && (
              <textarea
                placeholder="Paste text snippet…"
                value={snippet}
                onChange={(e) => setSnippet(e.target.value)}
                className="border rounded px-3 py-2 h-32 font-mono"
              />
            )}

            <div>
              <button onClick={addFile} className="px-3 py-2 rounded-xl border shadow-sm">
                Add file
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Files table */}
      <section className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left border-b">
            <tr>
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={!!allChecked}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setChecked(Object.fromEntries(files.map((f) => [f.id, on])));
                  }}
                />
              </th>
              <th className="p-2">Document</th>
              <th className="p-2">Tools</th>
              <th className="p-2">Type</th>
              <th className="p-2">Chunks</th>
              <th className="p-2">Uploaded</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-b">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={!!checked[f.id]}
                    onChange={(e) =>
                      setChecked((p) => ({ ...p, [f.id]: e.target.checked }))
                    }
                  />
                </td>
                <td className="p-2">
                  <div className="font-medium">{f.title || f.source_url || "Untitled"}</div>
                  {f.source_url && <div className="text-neutral-500">{f.source_url}</div>}
                </td>
                <td className="p-2">
                  <div className="flex gap-2 flex-wrap">
                    {(f.tools ?? []).map((t) => (
                      <span key={t} className="px-2 py-0.5 border rounded-full">
                        {t}
                        <button
                          onClick={() => removeTool(f.id, t)}
                          className="ml-1 text-neutral-500"
                          title="Remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => addTool(f.id)}
                      className="px-2 py-0.5 border rounded-full"
                    >
                      + Add
                    </button>
                  </div>
                </td>
                <td className="p-2">{f.source_type}</td>
                <td className="p-2">{f.chunks}</td>
                <td className="p-2">{new Date(f.uploaded_at).toLocaleString()}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {f.source_url && (
                      <a
                        href={f.source_url}
                        target="_blank"
                        className="px-2 py-1 border rounded"
                      >
                        View source
                      </a>
                    )}
                    <button
                      onClick={() => toggleCite(f)}
                      className="px-2 py-1 border rounded"
                    >
                      {f.enable_citations ? "Disable citing" : "Enable citing"}
                    </button>
                    <button
                      onClick={() => removeFile(f.id)}
                      className="px-2 py-1 border rounded text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-neutral-500">
                  No files yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Divider */}
      <hr className="border-t" />

      {/* Local notes (your original UI) */}
      <section className="max-w-3xl space-y-4">
        <h2 className="text-xl font-semibold">Local notes (private to this browser)</h2>

        <div className="grid gap-2">
          <input
            className="rounded-md border px-3 py-2 text-sm bg-transparent"
            style={{ borderColor: "var(--bbb-lines)" }}
            placeholder="Title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
          <textarea
            className="rounded-md border p-3 text-sm bg-transparent min-h-32"
            style={{ borderColor: "var(--bbb-lines)" }}
            placeholder="Paste text…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button className="btn btn-primary w-fit" onClick={addNote}>
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {items.map((it, i) => (
            <li
              key={i}
              className="border rounded-md p-3"
              style={{ borderColor: "var(--bbb-lines)" }}
            >
              <div className="text-sm font-medium mb-1">{it.title}</div>
              <div className="text-sm opacity-90 whitespace-pre-wrap">{it.text}</div>
              <button className="btn btn-ghost mt-2" onClick={() => delNote(i)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <button className="btn btn-primary" onClick={saveAllNotes}>
          Save
        </button>
      </section>
    </div>
  );
}
