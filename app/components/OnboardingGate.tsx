// app/components/OnboardingGate.tsx
"use client";
import { useEffect, useMemo, useState } from "react";

export type BBBProfile = {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  archetype: string;
  heightInches?: string;
  weightLbs?: string;
  goals: string[];
  agreed: boolean;
};

const DEFAULT_PROFILE: BBBProfile = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  archetype: "",
  heightInches: "",
  weightLbs: "",
  goals: [],
  agreed: false,
};

const LS_ONBOARDED = "bbb_onboarded";
const LS_DISMISSED = "bbb_onboarding_dismissed";

const WORKER_BASE =
  "https://black-heart-1c00.haseebservises.workers.dev";
const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/ROvsrlVUnHQifEIiaP7S/webhook-trigger/fae99c6b-f44a-4264-a7b1-81fd6a5037a4";

declare global { interface Window { bbbOpenOnboarding?: () => void } }

async function sha256Hex(s: string) {
  const enc = new TextEncoder().encode(s.trim().toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function OnboardingGate(
  { onComplete }: { onComplete: (p: BBBProfile) => void }
) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [form, setForm] = useState<BBBProfile>(DEFAULT_PROFILE);

  const shouldShow = useMemo(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LS_ONBOARDED) !== "1";
  }, []);

  useEffect(() => {
    setOpen(shouldShow && localStorage.getItem(LS_DISMISSED) !== "1");
    window.bbbOpenOnboarding = () => {
      localStorage.removeItem(LS_DISMISSED);
      setOpen(true);
    };
  }, [shouldShow]);

  function toggleGoal(g: string) {
    setForm(prev => {
      const goals = prev.goals.includes(g)
        ? prev.goals.filter(x => x !== g)
        : [...prev.goals, g];
      return { ...prev, goals };
    });
  }

  function close() {
    setOpen(false);
    if (localStorage.getItem(LS_ONBOARDED) !== "1") {
      localStorage.setItem(LS_DISMISSED, "1");
    }
  }

  // Open the native Pickaxe login (requires the **script** embed)
  async function openNativeAuth(email?: string) {
    const findBtn = () =>
      Array.from(document.querySelectorAll<HTMLElement>('button,a,[role="button"]'))
        .find(n => /log in|sign in|sign up for full access|sign up/i.test(n.textContent || ""));

    let tries = 0; let btn: HTMLElement | undefined;
    while (!btn && tries++ < 15) {
      btn = findBtn(); if (!btn) await new Promise(r => setTimeout(r, 300));
    }
    btn?.click();

    const dlg = await new Promise<HTMLElement | null>(resolve => {
      const obs = new MutationObserver(() => {
        const d = document.querySelector<HTMLElement>('[role="dialog"]');
        if (d && /welcome/i.test(d.textContent || "")) { obs.disconnect(); resolve(d); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); resolve(null); }, 4000);
    });

    if (dlg && email) {
      const input = dlg.querySelector<HTMLInputElement>('input[type="email"],input[placeholder*="email" i]');
      if (input) {
        input.value = email;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }

  // If the email exists in KV, switch to login and open native auth
  async function handleEmailBlur() {
    const email = (form.email ?? "").trim().toLowerCase();
    if (!email) return;
    try {
      const hash = await sha256Hex(email);
      const res = await fetch(`${WORKER_BASE}/exists`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hash }),
      });
      const { exists } = await res.json();
      if (exists) {
        setMode("login");
        close();
        openNativeAuth(email);
      }
    } catch {}
  }

  function finishAndEnter() {
    localStorage.setItem(LS_ONBOARDED, "1");
    localStorage.removeItem(LS_DISMISSED);
    window.dispatchEvent(new Event("bbb:onboarded"));
    onComplete(form);
    setOpen(false);
  }

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    const ok =
      !!form.firstName &&
      !!form.lastName &&
      !!form.email &&
      !!form.archetype &&
      !!form.weightLbs &&
      !!form.agreed;
    if (!ok) { alert("Please fill all required fields and accept the terms."); return; }

    // fire-and-forget: mark known user + send to GHL
    fetch(`${WORKER_BASE}/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    }).catch(() => {});
    fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});

    finishAndEnter();
  }

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    const email = (form.email ?? "").trim().toLowerCase();
    if (!email) { alert("Enter your email to log in."); return; }
    close();
    await openNativeAuth(email);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[rgba(11,18,32,.86)] backdrop-blur-md" onClick={close} />
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-5 md:p-6">
        <div className="flex items-start gap-3 mb-4">
          <img
            src="https://storage.googleapis.com/msgsndr/ROvsrlVUnHQifEIiaP7S/media/68b8a556bd7b76c153bb1800.png"
            alt="Better Bite Buddy"
            className="h-10 w-10 rounded-lg"
          />
          <div className="flex-1">
            <div className="text-lg font-semibold">Better Bite Buddy™</div>
            <div className="text-xs text-slate-500">
              {mode === "signup" ? "Create your free profile so we tailor coaching to you." : "Log in to access your coach."}
            </div>
            <div className="mt-2 text-xs">
              {mode === "signup" ? (
                <>Already have an account?{" "}
                  <button
                    type="button"
                    className="underline text-violet-700"
                    onClick={() => { close(); openNativeAuth(form.email || ""); }}
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>Don’t have an account?{" "}
                  <button
                    type="button"
                    className="underline text-violet-700"
                    onClick={() => setMode("signup")}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {mode === "login" ? (
          <form onSubmit={submitLogin} className="grid gap-3">
            <div>
              <label className="block text-xs mb-1 text-slate-500">Email*</label>
              <input
                type="email"
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={handleEmailBlur}
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <button type="button" className="rounded-md border px-3 py-2" onClick={close}>Close</button>
              <button type="submit" className="rounded-md bg-violet-700 px-4 py-2 text-white">Open login</button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitSignup} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1 text-slate-500">First name*</label>
              <input className="w-full rounded-md border px-3 py-2"
                     value={form.firstName}
                     onChange={e=>setForm({ ...form, firstName:e.target.value})}
                     required />
            </div>
            <div>
              <label className="block text-xs mb-1 text-slate-500">Last name*</label>
              <input className="w-full rounded-md border px-3 py-2"
                     value={form.lastName}
                     onChange={e=>setForm({ ...form, lastName:e.target.value})}
                     required />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-500">Email*</label>
              <input type="email" className="w-full rounded-md border px-3 py-2"
                     value={form.email}
                     onChange={e=>setForm({ ...form, email:e.target.value })}
                     onBlur={handleEmailBlur}
                     required />
            </div>
            <div>
              <label className="block text-xs mb-1 text-slate-500">Mobile</label>
              <input className="w-full rounded-md border px-3 py-2"
                     value={form.mobile ?? ""}
                     onChange={e=>setForm({ ...form, mobile:e.target.value })} />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-500">Archetype (pick one)*</label>
              <select className="w-full rounded-md border px-3 py-2"
                      value={form.archetype}
                      onChange={e=>setForm({ ...form, archetype:e.target.value })}
                      required>
                <option value="">Choose…</option>
                <option>Burned-out leader — I’m successful in work but stuck when it comes to my health.</option>
                <option>Longevity seeker — I want more energy, control, and to feel younger, longer.</option>
                <option>Yo-yo dieter — I’ve tried diets, nothing sticks, and I feel trapped by cravings.</option>
                <option>Other — None of these sound like me.</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1 text-slate-500">Height (inches)</label>
              <input className="w-full rounded-md border px-3 py-2"
                     value={form.heightInches ?? ""}
                     onChange={e=>setForm({ ...form, heightInches:e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs mb-1 text-slate-500">Weight (lbs)*</label>
              <input className="w-full rounded-md border px-3 py-2"
                     value={form.weightLbs ?? ""}
                     onChange={e=>setForm({ ...form, weightLbs:e.target.value })}
                     required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs mb-2 text-slate-500">Goals (select one or more)*</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Lose weight — without burnout",
                  "Build muscle, strength, or stamina",
                  "Manage blood sugar, inflammation, or food sensitivities",
                  "Feel clear, focused, and energized again",
                  "Other",
                ].map(g => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className={`rounded-md border px-3 py-2 text-left ${form.goals.includes(g) ? "bg-violet-50 border-violet-400" : ""}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input id="agree" type="checkbox"
                     checked={form.agreed}
                     onChange={e=>setForm({ ...form, agreed:e.target.checked })}
                     required />
              <label htmlFor="agree" className="text-sm text-slate-600">
                I agree to the Terms/EULA and Privacy Policy.
              </label>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <button type="button" className="rounded-md border px-3 py-2" onClick={close}>Close</button>
              <button type="submit" className="rounded-md bg-violet-700 px-4 py-2 text-white">Continue</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
