"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [tags, setTags] = useState<string>(""); // comma separated

  useEffect(() => {
    const e = localStorage.getItem("bbb_email") || "";
    const n = localStorage.getItem("bbb_profile_name") || "";
    const u = (localStorage.getItem("bbb_units") as "metric" | "imperial") || "metric";
    const t = localStorage.getItem("bbb_diet_tags") || "";
    setEmail(e);
    setName(n);
    setUnits(u);
    setTags(t);
  }, []);

  function save() {
    localStorage.setItem("bbb_profile_name", name);
    localStorage.setItem("bbb_units", units);
    localStorage.setItem("bbb_diet_tags", tags);
    alert("Saved!");
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-extrabold mb-4">Profile</h1>

      <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
      <input value={email} readOnly className="w-full rounded-xl border p-3 bg-slate-50 mb-4" />

      <label className="block text-sm font-semibold text-slate-600 mb-1">Display name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full rounded-xl border p-3 mb-4"
      />

      <label className="block text-sm font-semibold text-slate-600 mb-1">Units</label>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setUnits("metric")}
          className={`rounded-xl border px-3 py-2 ${units === "metric" ? "ring-4 ring-violet-200 border-violet-400 font-bold" : ""}`}
        >
          Metric (cm, kg)
        </button>
        <button
          onClick={() => setUnits("imperial")}
          className={`rounded-xl border px-3 py-2 ${units === "imperial" ? "ring-4 ring-violet-200 border-violet-400 font-bold" : ""}`}
        >
          Imperial (ft/in, lb)
        </button>
      </div>

      <label className="block text-sm font-semibold text-slate-600 mb-1">
        Dietary tags (comma separated)
      </label>
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="e.g. high-protein, gluten-free"
        className="w-full rounded-xl border p-3 mb-6"
      />

      <button onClick={save} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">
        Save
      </button>
    </div>
  );
}




// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// type Prof = {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   image?: string; // data URL
// };

// export default function ProfilePage() {
//   const [p, setP] = useState<Prof>({});
//   const [preview, setPreview] = useState<string | undefined>();

//   useEffect(() => {
//     try {
//       const stored = localStorage.getItem("bbb_profile");
//       if (stored) {
//         const obj = JSON.parse(stored) as Prof;
//         setP(obj);
//         setPreview(obj.image);
//       }
//     } catch {}
//   }, []);

//   function onFile(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => setPreview(reader.result as string);
//     reader.readAsDataURL(file);
//   }

//   function save(e: React.FormEvent) {
//     e.preventDefault();
//     const next = { ...p, image: preview };
//     try { localStorage.setItem("bbb_profile", JSON.stringify(next)); } catch {}
//     window.dispatchEvent(new Event("bbb:profile-updated"));
//     alert("Profile saved");
//   }

//   return (
//     <main className="mx-auto max-w-3xl px-4 py-8">
//       <div className="bbb-card p-6">
//         <h1 className="text-xl font-semibold mb-4">Edit profile</h1>

//         <form onSubmit={save} className="space-y-5">
//           <div className="flex items-center gap-4">
//             <div className="h-16 w-16 rounded-full overflow-hidden border"
//                  style={{ borderColor: "var(--bbb-lines)", background: "var(--bbb-elev1)" }}>
//               {preview ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img src={preview} alt="avatar" className="h-full w-full object-cover" />
//               ) : (
//                 <div className="grid place-items-center h-full w-full text-sm" style={{ color: "var(--bbb-ink-dim)" }}>
//                   No photo
//                 </div>
//               )}
//             </div>
//             <label className="btn btn-ghost cursor-pointer">
//               Upload photo
//               <input type="file" accept="image/*" className="hidden" onChange={onFile} />
//             </label>
//           </div>

//           <div className="grid sm:grid-cols-2 gap-3">
//             <div>
//               <label className="block text-xs mb-1" style={{ color: "var(--bbb-ink-dim)" }}>First name</label>
//               <input className="input" value={p.firstName || ""} onChange={e => setP({ ...p, firstName: e.target.value })} />
//             </div>
//             <div>
//               <label className="block text-xs mb-1" style={{ color: "var(--bbb-ink-dim)" }}>Last name</label>
//               <input className="input" value={p.lastName || ""} onChange={e => setP({ ...p, lastName: e.target.value })} />
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs mb-1" style={{ color: "var(--bbb-ink-dim)" }}>Email (read-only)</label>
//             <input className="input opacity-70" value={p.email || ""} readOnly />
//           </div>

//           <div className="flex items-center gap-2">
//             <Link href="/" className="btn btn-ghost">Cancel</Link>
//             <button type="submit" className="btn btn-primary">Save changes</button>
//           </div>
//         </form>
//       </div>
//     </main>
//   );
// }
