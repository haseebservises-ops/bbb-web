"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Units = "imperial" | "metric";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [units, setUnits] = useState<Units>("imperial");

  const [heightIn, setHeightIn] = useState<number | "">("");
  const [weightLb, setWeightLb] = useState<number | "">("");
  const [age, setAge] = useState<number | "">("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    // email
    const lsEmail = typeof window !== "undefined" ? localStorage.getItem("bbb_email") || "" : "";
    setEmail((session?.user?.email as string) || lsEmail || "");

    // name
    const lsName = localStorage.getItem("bbb_name") || "";
    setDisplayName(lsName);

    // units
    setUnits((localStorage.getItem("bbb_units") as Units) || "imperial");

    // stats
    const toNum = (x: string | null) => (x && !isNaN(+x) ? +x : "");
    setHeightIn(toNum(localStorage.getItem("bbb_height_in")));
    setWeightLb(toNum(localStorage.getItem("bbb_weight_lb")));
    setAge(toNum(localStorage.getItem("bbb_age")));

    // tags
    setTags(localStorage.getItem("bbb_tags") || "");
  }, [session?.user?.email]);

  function save() {
    if (email) localStorage.setItem("bbb_email", email);
    localStorage.setItem("bbb_name", displayName || "");
    localStorage.setItem("bbb_units", units);
    if (heightIn !== "") localStorage.setItem("bbb_height_in", String(heightIn));
    if (weightLb !== "") localStorage.setItem("bbb_weight_lb", String(weightLb));
    if (age      !== "") localStorage.setItem("bbb_age", String(age));
    localStorage.setItem("bbb_tags", tags || "");

    alert("Saved.");
  }

  return (
    <div className="max-w-3xl mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-extrabold">Profile</h1>

      <label className="grid gap-1">
        <span className="text-sm font-semibold">Email</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-2xl border p-3"
          placeholder="name@example.com"
        />
        <span className="text-xs text-slate-500">Pulled from Pickaxe/Sign-in when available.</span>
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-semibold">Display name</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-2xl border p-3"
          placeholder="Your name"
        />
      </label>

      <div className="grid gap-2">
        <span className="text-sm font-semibold">Units</span>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 rounded-full border ${units === "metric" ? "bg-violet-600 text-white" : ""}`}
            onClick={() => setUnits("metric")}
          >
            Metric (cm, kg)
          </button>
          <button
            className={`px-3 py-1.5 rounded-full border ${units === "imperial" ? "bg-violet-600 text-white" : ""}`}
            onClick={() => setUnits("imperial")}
          >
            Imperial (ft/in, lb)
          </button>
        </div>
      </div>

      {/* Stats (Imperial primary) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-sm font-semibold">Height (inches)</span>
          <input
            type="number"
            min={48} max={84}
            value={heightIn}
            onChange={(e) => setHeightIn(e.target.value === "" ? "" : +e.target.value)}
            className="rounded-2xl border p-3"
            placeholder="e.g. 70"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-semibold">Weight (lb)</span>
          <input
            type="number"
            min={70} max={600}
            value={weightLb}
            onChange={(e) => setWeightLb(e.target.value === "" ? "" : +e.target.value)}
            className="rounded-2xl border p-3"
            placeholder="e.g. 180"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-semibold">Age</span>
          <input
            type="number"
            min={13} max={100}
            value={age}
            onChange={(e) => setAge(e.target.value === "" ? "" : +e.target.value)}
            className="rounded-2xl border p-3"
            placeholder="e.g. 42"
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm font-semibold">Dietary tags (comma separated)</span>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="rounded-2xl border p-3"
          placeholder="e.g. high-protein, gluten-free"
        />
      </label>

      <div>
        <button onClick={save} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">
          Save
        </button>
      </div>
    </div>
  );
}
