"use client";
import { useEffect, useState } from "react";

export default function AdminActions() {
  const [enabled, setEnabled] = useState(false);
  useEffect(()=>{ try{ const raw = localStorage.getItem("bbb_studio_actions"); if (raw) setEnabled(JSON.parse(raw).enabled); } catch {} },[]);
  function save(){ try{ localStorage.setItem("bbb_studio_actions", JSON.stringify({ enabled })); alert("Saved"); } catch {} }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Actions</h1>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)} />
        Enable custom actions
      </label>
      <button className="btn btn-primary" onClick={save}>Save</button>
    </div>
  );
}
