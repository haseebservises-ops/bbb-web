"use client";
import { useEffect, useState } from "react";

type Studio = { prompt: { role: string; intros: string[] } };
const DEFAULTS: Studio = { prompt: { role: "", intros: [] } };

export default function AdminPrompt() {
  const [cfg, setCfg] = useState<Studio>(DEFAULTS);
  const [intro, setIntro] = useState("");

  useEffect(() => {
    try { const raw = localStorage.getItem("bbb_studio"); if (raw) setCfg({ ...DEFAULTS, ...JSON.parse(raw) }); } catch {}
  }, []);

  function save() { try { localStorage.setItem("bbb_studio", JSON.stringify(cfg)); alert("Saved"); } catch {} }
  function addIntro() {
    const t = intro.trim(); if (!t) return;
    setCfg({ prompt: { role: cfg.prompt.role, intros: [...cfg.prompt.intros, t] } }); setIntro("");
  }
  function removeIntro(i: number) {
    const copy = [...cfg.prompt.intros]; copy.splice(i, 1);
    setCfg({ prompt: { role: cfg.prompt.role, intros: copy } });
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">Prompt</h1>
      <label className="text-sm block">
        Role (system prompt)
        <textarea className="mt-1 w-full min-h-48 rounded-md border p-3 text-sm bg-transparent"
                  style={{ borderColor: "var(--bbb-lines)" }}
                  value={cfg.prompt.role}
                  onChange={(e)=>setCfg({ prompt: { ...cfg.prompt, role: e.target.value } })} />
      </label>

      <div>
        <div className="text-sm font-medium mb-2">Introductions</div>
        <div className="flex gap-2 mb-2">
          <input className="flex-1 rounded-md border px-3 py-2 text-sm bg-transparent"
                 style={{ borderColor: "var(--bbb-lines)" }}
                 placeholder="Add an intro message…" value={intro} onChange={(e)=>setIntro(e.target.value)} />
          <button className="btn btn-primary" onClick={addIntro}>Add</button>
        </div>
        <ul className="text-sm">
          {cfg.prompt.intros.map((t, i)=>(
            <li key={i} className="flex items-center justify-between border rounded-md px-3 py-2 mb-2"
                style={{ borderColor: "var(--bbb-lines)" }}>
              <span className="opacity-90">{t}</span>
              <button className="btn btn-ghost" onClick={()=>removeIntro(i)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      <button className="btn btn-primary" onClick={save}>Save</button>
    </div>
  );
}
