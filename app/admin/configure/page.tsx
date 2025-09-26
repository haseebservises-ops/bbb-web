"use client";
import { useEffect, useState } from "react";

type Configure = { uploads: boolean; voice: boolean; imageGen: boolean };
const DEFAULTS: Configure = { uploads: true, voice: false, imageGen: false };

export default function AdminConfigure() {
  const [cfg, setCfg] = useState<Configure>(DEFAULTS);
  useEffect(() => { try { const raw = localStorage.getItem("bbb_studio_cfg"); if (raw) setCfg({ ...DEFAULTS, ...JSON.parse(raw) }); } catch {} }, []);
  function save(){ try { localStorage.setItem("bbb_studio_cfg", JSON.stringify(cfg)); alert("Saved"); } catch {} }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Configure</h1>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={cfg.uploads} onChange={e=>setCfg({ ...cfg, uploads: e.target.checked })} />
        Allow users to upload files
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={cfg.voice} onChange={e=>setCfg({ ...cfg, voice: e.target.checked })} />
        Allow voice input
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={cfg.imageGen} onChange={e=>setCfg({ ...cfg, imageGen: e.target.checked })} />
        Use default image generation
      </label>

      <button className="btn btn-primary" onClick={save}>Save</button>
    </div>
  );
}
