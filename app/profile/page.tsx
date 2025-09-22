"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Prof = {
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string; // data URL
};

export default function ProfilePage() {
  const [p, setP] = useState<Prof>({});
  const [preview, setPreview] = useState<string | undefined>();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bbb_profile");
      if (stored) {
        const obj = JSON.parse(stored) as Prof;
        setP(obj);
        setPreview(obj.image);
      }
    } catch {}
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const next = { ...p, image: preview };
    try { localStorage.setItem("bbb_profile", JSON.stringify(next)); } catch {}
    window.dispatchEvent(new Event("bbb:profile-updated"));
    alert("Profile saved");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="bbb-card p-6">
        <h1 className="text-xl font-semibold mb-4">Edit profile</h1>

        <form onSubmit={save} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border"
                 style={{ borderColor: "var(--bbb-lines)", background: "var(--bbb-elev1)" }}>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="grid place-items-center h-full w-full text-sm" style={{ color: "var(--bbb-ink-dim)" }}>
                  No photo
                </div>
              )}
            </div>
            <label className="btn btn-ghost cursor-pointer">
              Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--bbb-ink-dim)" }}>First name</label>
              <input className="input" value={p.firstName || ""} onChange={e => setP({ ...p, firstName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--bbb-ink-dim)" }}>Last name</label>
              <input className="input" value={p.lastName || ""} onChange={e => setP({ ...p, lastName: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--bbb-ink-dim)" }}>Email (read-only)</label>
            <input className="input opacity-70" value={p.email || ""} readOnly />
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </main>
  );
}
