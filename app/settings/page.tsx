"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bbb_profile_basic");
      if (raw) {
        const p = JSON.parse(raw);
        setFirst(p.first || "");
        setLast(p.last || "");
        setEmail(p.email || "");
        setAvatar(p.avatar || "");
      }
    } catch {}
  }, []);

  function save() {
    try {
      localStorage.setItem("bbb_profile_basic", JSON.stringify({ first, last, email, avatar }));
      alert("Saved");
    } catch {}
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Profile</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm">
          First name
          <input className="mt-1 w-full rounded-md border px-3 py-2 bg-transparent"
                 style={{ borderColor: "var(--bbb-lines)" }} value={first} onChange={e=>setFirst(e.target.value)} />
        </label>

        <label className="text-sm">
          Last name
          <input className="mt-1 w-full rounded-md border px-3 py-2 bg-transparent"
                 style={{ borderColor: "var(--bbb-lines)" }} value={last} onChange={e=>setLast(e.target.value)} />
        </label>

        <label className="text-sm sm:col-span-2">
          Email
          <input className="mt-1 w-full rounded-md border px-3 py-2 bg-transparent"
                 style={{ borderColor: "var(--bbb-lines)" }} value={email} onChange={e=>setEmail(e.target.value)} />
        </label>

        <label className="text-sm sm:col-span-2">
          Avatar URL (optional)
          <input className="mt-1 w-full rounded-md border px-3 py-2 bg-transparent"
                 style={{ borderColor: "var(--bbb-lines)" }} value={avatar} onChange={e=>setAvatar(e.target.value)} />
        </label>
      </div>

      <button className="btn btn-primary mt-4" onClick={save}>Save</button>
    </div>
  );
}
