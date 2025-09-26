"use client";
import { useEffect, useState } from "react";

type Item = { title: string; text: string };
export default function AdminKnowledge() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  useEffect(() => { try { const raw = localStorage.getItem("bbb_studio_knowledge"); if (raw) setItems(JSON.parse(raw)); } catch {} }, []);
  function saveAll(){ try { localStorage.setItem("bbb_studio_knowledge", JSON.stringify(items)); alert("Saved"); } catch {} }
  function add(){ if (!title.trim() || !text.trim()) return; setItems((x)=>[...x, { title: title.trim(), text: text.trim() }]); setTitle(""); setText(""); }
  function del(i: number){ const copy=[...items]; copy.splice(i,1); setItems(copy); }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">Knowledge</h1>

      <div className="grid gap-2">
        <input className="rounded-md border px-3 py-2 text-sm bg-transparent" style={{ borderColor: "var(--bbb-lines)" }}
               placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="rounded-md border p-3 text-sm bg-transparent min-h-32" style={{ borderColor: "var(--bbb-lines)" }}
               placeholder="Paste text…" value={text} onChange={e=>setText(e.target.value)} />
        <button className="btn btn-primary w-fit" onClick={add}>Add</button>
      </div>

      <ul className="space-y-2">
        {items.map((it,i)=>(
          <li key={i} className="border rounded-md p-3" style={{ borderColor: "var(--bbb-lines)" }}>
            <div className="text-sm font-medium mb-1">{it.title}</div>
            <div className="text-sm opacity-90 whitespace-pre-wrap">{it.text}</div>
            <button className="btn btn-ghost mt-2" onClick={()=>del(i)}>Remove</button>
          </li>
        ))}
      </ul>

      <button className="btn btn-primary" onClick={saveAll}>Save</button>
    </div>
  );
}
