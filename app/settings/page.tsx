// app/settings/page.tsx
"use client";
import { useEffect, useState } from "react";

const LS = {
  reduced: "bbb_reduced_motion",
  neuro: "bbb_neuro_mode",
  reminder: "bbb_daily_reminder", // "08:30"
};

export default function SettingsPage() {
  const [reduced, setReduced] = useState(false);
  const [neuro, setNeuro] = useState(false);
  const [reminder, setReminder] = useState("");

  useEffect(() => {
    setReduced(localStorage.getItem(LS.reduced) === "1");
    setNeuro(localStorage.getItem(LS.neuro) === "1");
    setReminder(localStorage.getItem(LS.reminder) || "");
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--bbb-reduced-motion",
      reduced ? "reduce" : "no-preference"
    );
    localStorage.setItem(LS.reduced, reduced ? "1" : "0");
  }, [reduced]);

  useEffect(() => {
    document.documentElement.classList.toggle("bbb-neuro", neuro);
    localStorage.setItem(LS.neuro, neuro ? "1" : "0");
  }, [neuro]);

  useEffect(() => {
    if (reminder) localStorage.setItem(LS.reminder, reminder);
  }, [reminder]);

  return (
    <main className="mx-auto max-w-2xl p-6 grid gap-6">
      <h1 className="text-2xl font-extrabold">Settings</h1>

      <label className="flex items-center gap-3">
        <input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)} />
        <span>Reduce motion (accessibility)</span>
      </label>

      <label className="flex items-center gap-3">
        <input type="checkbox" checked={neuro} onChange={e=>setNeuro(e.target.checked)} />
        <span>Neuro-friendly reading (looser spacing)</span>
      </label>

      <div>
        <div className="mb-2 font-semibold">Daily check-in reminder</div>
        <input
          type="time"
          value={reminder}
          onChange={e=>setReminder(e.target.value)}
          className="rounded-lg border p-2"
        />
      </div>

      <div className="grid gap-2">
        <button
          onClick={() => {
            const data = {
              reduced, neuro, reminder,
              onboarding: JSON.parse(localStorage.getItem("bbb_onboarding_payload") || "{}")
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "bbb-settings.json"; a.click();
            URL.revokeObjectURL(url);
          }}
          className="rounded-lg bg-slate-900 text-white px-4 py-2"
        >
          Export my data (JSON)
        </button>

        <button
          onClick={() => {
            Object.values(LS).forEach(k => localStorage.removeItem(k));
            alert("Cleared local settings. Reload the page.");
          }}
          className="rounded-lg bg-slate-100 px-4 py-2"
        >
          Clear local settings
        </button>
      </div>
    </main>
  );
}
