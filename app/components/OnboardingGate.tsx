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

const LS_ONBOARDED  = "bbb_onboarded";
const LS_DISMISSED  = "bbb_onboarding_dismissed";

/** Endpoints */
const WORKER_BASE = "https://black-heart-1c00.haseebservises.workers.dev"; // Cloudflare Worker
const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/ROvsrlVUnHQifEIiaP7S/webhook-trigger/fae99c6b-f44a-4264-a7b1-81fd6a5037a4";

declare global { interface Window { bbbOpenOnboarding?: () => void; } }

/** Browser SHA-256 (hex) */
async function sha256Hex(s: string) {
  const buf = new TextEncoder().encode(s.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function OnboardingGate({ onComplete }: { onComplete: (p: BBBProfile) => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signup" | "login">("signup");

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

  const [form, setForm] = useState<BBBProfile>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    archetype: "",
    heightInches: "",
    weightLbs: "",
    goals: [],
    agreed: false,
  });

  function toggleGoal(g: string) {
    setForm(f => {
      const next = [...f.goals];
      const i = next.indexOf(g);
      if (i >= 0) next.splice(i, 1); else next.push(g);
      return { ...f, goals: next };
    });
  }

  function close() {
    setOpen(false);
    if (localStorage.getItem(LS_ONBOARDED) !== "1") {
      localStorage.setItem(LS_DISMISSED, "1");
    }
  }

  /** Auto-switch to Login if KV already has this email */
  async function handleEmailBlur() {
    const email = form.email?.trim().toLowerCase();
    if (!email) return;
    try {
      const hash = await sha256Hex(email);
      const res = await fetch(`${WORKER_BASE}/exists`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hash }),
      });
      const { exists } = await res.json();
      if (exists) setMode("login");
    } catch { /* silent */ }
  }

  function finishAndEnter() {
    localStorage.setItem(LS_ONBOARDED, "1");
    localStorage.removeItem(LS_DISMISSED);
    window.dispatchEvent(new Event("bbb:onboarded"));
    onComplete(form);
    setOpen(false);
  }

  /** SIGNUP keeps your validation + sends Worker + GHL (fire-and-forget) */
  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.archetype || !form.weightLbs || !form.agreed) {
      alert("Please fill all required fields.");
      return;
    }

    // hit Worker to store hash immediately (Pickaxe also does this later — idempotent)
    fetch(`${WORKER_BASE}/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    }).catch(() => {});

    // send to GHL
    fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});

    finishAndEnter();
  }

  /** LOGIN: verify existence via Worker, then let them in */
  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    const email = form.email?.trim().toLowerCase();
    if (!email) { alert("Enter your email to log in."); return; }

    try {
      const hash = await sha256Hex(email);
      const res = await fetch(`${WORKER_BASE}/exists`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hash }),
      });
      const { exists } = await res.json();
      if (!exists) {
        alert("We didn’t find that email. Please sign up.");
        setMode("signup");
        return;
      }
    } catch { /* allow fallback if Worker unreachable */ }

    finishAndEnter();
  }

  if (!open) return null;

  return (
    /* Force perfect centering even if custom CSS hasn’t loaded */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div className="bbb-modal-bg" onClick={close} />

      {/* panel */}
      <div className="bbb-modal-panel w-full max-w-3xl p-5 md:p-6 relative">
        {/* Header with LOGO (no top-right Close) */}
        <div className="flex items-start gap-3 mb-4">
          <img
            src="https://storage.googleapis.com/msgsndr/ROvsrlVUnHQifEIiaP7S/media/68b8a556bd7b76c153bb1800.png"
            alt="Better Bite Buddy"
            className="h-10 w-10 rounded-lg"
          />
          <div className="flex-1">
            <div className="text-lg font-semibold">Better Bite Buddy™</div>
            <div className="text-xs" style={{ color: "var(--bbb-ink-dim)" }}>
              {mode === "signup" ? "Create your free profile so we tailor coaching to you." : "Log in to access your coach."}
            </div>
            <div className="mt-2 text-xs">
              {mode === "signup" ? (
                <>Already have an account?{" "}
                  <button type="button" className="underline text-[var(--bbb-primary)]" onClick={() => setMode("login")}>
                    Log in
                  </button>
                </>
              ) : (
                <>Don’t have an account?{" "}
                  <button type="button" className="underline text-[var(--bbb-primary)]" onClick={() => setMode("signup")}>
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="pill" data-active="true">Fast setup</span>
          <span className="pill" data-active="true">Personalized</span>
          <span className="pill" data-active="true">Science-based</span>
        </div>

        {/* Forms */}
        {mode === "login" ? (
          <form onSubmit={submitLogin} className="form-grid">
            <div className="form-span-2">
              <label className="block text-xs mb-1" style={{ color: "var(--bbb-ink-dim)" }}>Email*</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={handleEmailBlur}
              />
            </div>

            <div className="form-span-2 flex items-center justify-end gap-2 mt-1">
              <button type="button" className="btn btn-ghost" onClick={close}>Close</button>
              <button type="submit" className="btn btn-primary">Log in</button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitSignup} className="form-grid">
            {/* Names */}
            <div>
              <label className="block text-xs mb-1" style={{color:"var(--bbb-ink-dim)"}}>First name*</label>
              <input className="input" value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})}/>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{color:"var(--bbb-ink-dim)"}}>Last name*</label>
              <input className="input" value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})}/>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-xs mb-1" style={{color:"var(--bbb-ink-dim)"}}>Email*</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={e=>setForm({...form, email:e.target.value})}
                onBlur={handleEmailBlur}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{color:"var(--bbb-ink-dim)"}}>Mobile</label>
              <input className="input" value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})}/>
            </div>

            {/* Archetype + Height */}
            <div>
              <label className="block text-xs mb-1" style={{color:"var(--bbb-ink-dim)"}}>Archetype (pick one)*</label>
              <select className="input"
                value={form.archetype}
                onChange={e=>setForm({...form, archetype:e.target.value})}
              >
                <option value="">Choose…</option>
                <option>Burned-out leader — I’m successful in work but stuck when it comes to my health.</option>
                <option>Longevity seeker — I want more energy, control, and to feel younger, longer.</option>
                <option>Yo-yo dieter — I’ve tried diets, nothing sticks, and I feel trapped by cravings.</option>
                <option>Other — None of these sound like me.</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{color:"var(--bbb-ink-dim)"}}>Height (inches)</label>
              <input className="input" value={form.heightInches} onChange={e=>setForm({...form, heightInches:e.target.value})}/>
            </div>

            {/* Weight */}
            <div className="form-span-2">
              <label className="block text-xs mb-1" style={{color:"var(--bbb-ink-dim)"}}>Weight (lbs)*</label>
              <input className="input" value={form.weightLbs} onChange={e=>setForm({...form, weightLbs:e.target.value})}/>
            </div>

            {/* Goals */}
            <div className="form-span-2">
              <label className="block text-xs mb-2" style={{color:"var(--bbb-ink-dim)"}}>Goals (select one or more)*</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Lose weight — without burnout",
                  "Build muscle, strength, or stamina",
                  "Manage blood sugar, inflammation, or food sensitivities",
                  "Feel clear, focused, and energized again",
                  "Other"
                ].map(g => (
                  <button
                    type="button"
                    key={g}
                    onClick={()=>toggleGoal(g)}
                    className={`btn ${form.goals.includes(g) ? "btn-primary" : "btn-ghost"}`}
                    style={{ justifyContent: "flex-start" }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="form-span-2 flex items-center gap-2">
              <input id="agree" type="checkbox"
                checked={form.agreed}
                onChange={e=>setForm({...form, agreed:e.target.checked})}/>
              <label htmlFor="agree" className="text-sm" style={{color:"var(--bbb-ink-dim)"}}>
                I agree to the Terms/EULA and Privacy Policy.
              </label>
            </div>

            {/* Actions */}
            <div className="form-span-2 flex items-center justify-end gap-2 mt-1">
              <button type="button" className="btn btn-ghost" onClick={close}>Close</button>
              <button type="submit" className="btn btn-primary">Continue</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
