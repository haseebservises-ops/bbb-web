// components/OnboardingWizard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// NEW: snacks + stats
const [snacksPerDay, setSnacksPerDay] = useState<number>(0); // 0..3
const [heightIn, setHeightIn]       = useState<number | "">("");
const [weightLb, setWeightLb]       = useState<number | "">("");
const [age, setAge]                 = useState<number | "">("");

// LS keys (additions are optional but nice to keep)
// whenever you save, mirror to localStorage

          // at top of the component, near other state/util vars
          const activityPresetMeals: Record<number, number> = {
            1: 2, // Low
            2: 3, // Light
            3: 4, // Moderate
            4: 5, // High
          };
/* ------------------------------- Props & Keys ------------------------------- */
type WizardProps = {
  autoOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
};

const LS_KEYS = {
  dismissed: "bbb_onboarding_dismissed_v1",
  email: "bbb_email",
};


/* --------------------------------- Types ---------------------------------- */
type ArchetypeSlug = "exec" | "yo_yo_ozempic" | "longevity_seeker" | "other";

type Scores = {
  exec: number;
  yo_yo_ozempic: number;
  longevity_seeker: number;
};

const baseScores: Scores = { exec: 0, yo_yo_ozempic: 0, longevity_seeker: 0 };

/* ------------------------------- Animations -------------------------------- */
const variants = {
  enter:  { opacity: 0,  y: 24,  filter: "blur(3px)", transition: { type: "spring", stiffness: 140, damping: 18 } },
  center: { opacity: 1,  y: 0,   filter: "blur(0px)", transition: { type: "spring", stiffness: 140, damping: 18 } },
  exit:   { opacity: 0,  y: -24, filter: "blur(2px)", transition: { type: "spring", stiffness: 140, damping: 18 } },
} as const;

/* --------------------------------- Quiz ----------------------------------- */
const questions = [
  {
    id: "q1",
    text: "When stress hits, what's your usual response?",
    options: [
      { label: "Push harder and power through", add: { exec: 1 } },
      { label: "I snack or fall off track", add: { yo_yo_ozempic: 1 } },
      { label: "Pause and monitor how I feel", add: { longevity_seeker: 1 } },
    ],
  },
  {
    id: "q2",
    text: "Pick the line that sounds most like you:",
    options: [
      { label: "I don't have time for myself", add: { exec: 1 } },
      { label: "I've tried every diet", add: { yo_yo_ozempic: 1 } },
      { label: "I want to feel younger, longer", add: { longevity_seeker: 1 } },
    ],
  },
  {
    id: "q3",
    text: "Your biggest blocker right now is…",
    options: [
      { label: "Inconsistent routine / long days", add: { exec: 1 } },
      { label: "Cravings and late-night eating", add: { yo_yo_ozempic: 1 } },
      { label: "Inflammation or blood sugar swings", add: { longevity_seeker: 1 } },
    ],
  },
  {
    id: "q4",
    text: "How do you usually choose meals?",
    options: [
      { label: "Whatever gets me moving fastest", add: { exec: 1 } },
      { label: "Good until a trigger… then I spiral", add: { yo_yo_ozempic: 1 } },
      { label: "Looking for clean and steady energy", add: { longevity_seeker: 1 } },
    ],
  },
  {
    id: "q5",
    text: "What would you like more of next month?",
    options: [
      { label: "Consistent focus + energy", add: { exec: 1 } },
      { label: "Control over hunger & cravings", add: { yo_yo_ozempic: 1 } },
      { label: "Calmer digestion + metrics trending right", add: { longevity_seeker: 1 } },
    ],
  },
  {
    id: "q6",
    text: "Pick the most helpful coach statement:",
    options: [
      { label: "You don't need to push harder, just steadier.", add: { exec: 1 } },
      { label: "Small resets beat all-or-nothing.", add: { yo_yo_ozempic: 1 } },
      { label: "Tiny data → tiny upgrades → long runway.", add: { longevity_seeker: 1 } },
    ],
  },
  {
    id: "q7",
    text: "A win this week would be…",
    options: [
      { label: "2 solid workdays without energy crashes", add: { exec: 1 } },
      { label: "3 evening cravings tamed", add: { yo_yo_ozempic: 1 } },
      { label: "1 inflammation trigger identified", add: { longevity_seeker: 1 } },
    ],
  },
  {
    id: "q8",
    text: "When travel or social events pop up…",
    options: [
      { label: "I adapt on the fly, sometimes skip meals", add: { exec: 1 } },
      { label: "I go off plan and restart later", add: { yo_yo_ozempic: 1 } },
      { label: "I anchor on protein/veggies, watch glucose", add: { longevity_seeker: 1 } },
    ],
  },
  {
    id: "q9",
    text: "How do you like to be coached?",
    options: [
      { label: "Direct, efficient nudges", add: { exec: 1 } },
      { label: "Warm encouragement + simple resets", add: { yo_yo_ozempic: 1 } },
      { label: "Evidence with practical experiments", add: { longevity_seeker: 1 } },
    ],
  },
  {
    id: "q10",
    text: "If BBB gave you one superpower, you'd pick…",
    options: [
      { label: "Steady workday performance", add: { exec: 1 } },
      { label: "Craving-proof evenings", add: { yo_yo_ozempic: 1 } },
      { label: "Youthful clarity all day", add: { longevity_seeker: 1 } },
    ],
  },
] as const;

type QOption = typeof questions[number]["options"][number];

/* --------------------------------- Utils ---------------------------------- */
function cn(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

function resultCopy(slug: ArchetypeSlug) {
  if (slug === "exec")
    return {
      critic: "Overdrive Samurai",
      coach: "Resilient Strategist",
      reframe: "You don’t need to push harder — just steadier. Two tiny anchors beat a perfect day.",
    };
    if (slug === "yo_yo_ozempic")
      return {
        critic: "All-or-Nothing (inner critic)",
        coach: "Calm Reset Coach",
        reframe: "Cravings lose when resets are easy and immediate. One small win tonight beats a restart next week.",
      };
  return {
    critic: "Longevity Perfectionist",
    coach: "Data-Wise Guide",
    reframe: "Tiny data → tiny upgrades. Protect energy today and your long runway gets longer.",
  };
}

/* ----------------------------- Main Component ----------------------------- */
export default function OnboardingWizard({ autoOpen = false, onClose, onComplete }: WizardProps) {
  const [open, setOpen] = useState<boolean>(autoOpen);
  const [step, setStep] = useState<number>(0);
  const [otherGoalText, setOtherGoalText] = useState("");

  // core state
  const [goal, setGoal] = useState<ArchetypeSlug | "">("");
  const [motivation, setMotivation] = useState<string>("");
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [activity, setActivity] = useState<number>(2); // 1..4
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [name, setName] = useState<string>(""); // optional
  const [submitting, setSubmitting] = useState<boolean>(false);

  // derived
  const email = (typeof window !== "undefined" && localStorage.getItem(LS_KEYS.email)) || "";

  // open logic (auto, query param)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(LS_KEYS.dismissed) === "1";
    const hasQuery = new URLSearchParams(window.location.search).get("onboard");
    if (autoOpen && !dismissed) setOpen(true);
    if (hasQuery) setOpen(true);
  }, [autoOpen]);

  // progress math
  const TOTAL = 4 + questions.length + 2; // welcome, goal, motivation, routine, 10Q, result, launch, gratitude
  const FINAL_RESULT_STEP = 4 + questions.length;   // 14
  const FINAL_LAUNCH_STEP = FINAL_RESULT_STEP + 1;  // 15
  const FINAL_GRAT_STEP   = FINAL_RESULT_STEP + 2;  // 16

  const progress = useMemo(() => {
    const clamped = Math.min(step, TOTAL - 1);
    return {
      value: clamped,
      total: TOTAL,
      pct: Math.round((clamped / (TOTAL - 1)) * 100),
    };
  }, [step]);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));
  const setAnswer = (qIndex: number, optIndex: number) => {
    const copy = [...answers];
    copy[qIndex] = optIndex;
    setAnswers(copy);
    next();
  };

  function computeScores(): { scores: Scores; dominant: ArchetypeSlug } {
    const s: Scores = { ...baseScores };
    answers.forEach((optIdx, idx) => {
      const opt: QOption | undefined = optIdx >= 0 ? questions[idx].options[optIdx] : undefined;
      if (!opt) return;
      const add = opt.add as Partial<Scores>;
      (Object.keys(add) as (keyof Scores)[]).forEach((k) => (s[k] += add[k] || 0));
    });
    if (goal === "exec") s.exec += 1;
    if (goal === "yo_yo_ozempic") s.yo_yo_ozempic += 1;
    if (goal === "longevity_seeker") s.longevity_seeker += 1;
    const dominant = (Object.entries(s).sort((a, b) => b[1] - a[1])[0]?.[0] || "other") as ArchetypeSlug;
    return { scores: s, dominant };
  }

  async function finish() {
  try {
    setSubmitting(true);

    // 1) compute result like before
    const { scores, dominant } = computeScores();

    // 2) build payload (nulls instead of "")
        const payload = {
          email,
          name,
          goal,
          otherGoalText: goal === "other" ? otherGoalText : null,
          motivation,

          mealsPerDay,
          snacksPerDay,
          activity,

          heightIn:  heightIn  === "" ? null : heightIn,
          weightLb:  weightLb  === "" ? null : weightLb,
          age:       age       === "" ? null : age,

          answers,
          scores,
          dominant,
        };

    // 3) persist to localStorage so Profile can read immediately
    try {
      localStorage.setItem("bbb_onboarded", "1");
      localStorage.setItem("bbb_meals", String(mealsPerDay));
      localStorage.setItem("bbb_snacks", String(snacksPerDay));
      localStorage.setItem("bbb_activity", String(activity));
      if (name)     localStorage.setItem("bbb_name", name);
      if (email)    localStorage.setItem("bbb_email", email);
      if (heightIn !== "") localStorage.setItem("bbb_height_in", String(heightIn));
      if (weightLb !== "") localStorage.setItem("bbb_weight_lb", String(weightLb));
      if (age      !== "") localStorage.setItem("bbb_age", String(age));
    } catch {}

    // 4) send to your API (you already had this route)
    await fetch("/api/pickaxe/onboarding-complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    // 5) stop auto-opening next time
    localStorage.setItem(LS_KEYS.dismissed, "1");

    // 6) advance to the “open login” step
    setStep(FINAL_LAUNCH_STEP);
    onComplete?.();
  } catch (e) {
    console.error(e);
    alert("Could not save onboarding. Please try again.");
  } finally {
    setSubmitting(false);
  }
}


  // Close automatically 3s after gratitude step appears
  useEffect(() => {
    if (step !== FINAL_GRAT_STEP) return;
    const t = setTimeout(() => {
      setOpen(false);
      onClose?.();
    }, 3000);
    return () => clearTimeout(t);
  }, [step, onClose]);

  const { scores, dominant } = computeScores();
  const copy = resultCopy(dominant);

  /* --------------------------------- Screens -------------------------------- */
  const screen = (() => {
    // 0: Welcome
    if (step === 0) return (
      <motion.div key="welcome" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4">
        <div className="text-2xl md:text-3xl font-extrabold">Hi there — I’m Better Bite Buddy™</div>
        <p className="text-slate-600">Let’s personalize your coaching in about a minute.</p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => setStep(0.5)} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold shadow">Let’s go</button>
          <button
            onClick={() => { localStorage.setItem(LS_KEYS.dismissed, "1"); setOpen(false); onClose?.(); }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    );

    // 0.5: Brand Promise
    if (step === 0.5) return (
      <motion.div key="promise" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4">
        <div className="text-2xl md:text-3xl font-extrabold">Clarity beats cravings.</div>
        <p className="text-slate-600">You’ve tried diets. This time you’ll build decisions. BBB makes the next bite easy.</p>
        <div>
          <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">Find my clarity</button>
        </div>
      </motion.div>
    );

// 1: Goal
if (step === 1) return (
  <motion.div key="goals" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4">
    <div className="text-xl md:text-2xl font-extrabold">Choose your focus</div>

    <div className="grid sm:grid-cols-3 gap-3">
      {[
        { slug: "exec",             title: "Steadier energy",     sub: "Busy exec / burned out" },
        { slug: "yo_yo_ozempic",    title: "Craving control",     sub: "Yo-yo dieter" },
        { slug: "longevity_seeker", title: "Longevity & clarity", sub: "Health span seeker" },
      ].map((g) => (
        <button
          key={g.slug}
          onClick={() => setGoal(g.slug as any)}
          className={cn(
            "text-left rounded-2xl p-4 border transition",
            goal === g.slug ? "ring-4 ring-violet-200 border-violet-400" : "hover:shadow-md"
          )}
        >
          <div className="font-bold">{g.title}</div>
          <div className="text-sm text-slate-600">{g.sub}</div>
        </button>
      ))}

      {/* NEW: Something else */}
      <button
        onClick={() => setGoal("other")}
        className={cn(
          "text-left rounded-2xl p-4 border transition",
          goal === "other" ? "ring-4 ring-violet-200 border-violet-400" : "hover:shadow-md"
        )}
      >
        <div className="font-bold">Something else</div>
        <div className="text-sm text-slate-600">Tell us what you’re after</div>

        {goal === "other" && (
          <input
            value={otherGoalText}
            onChange={(e) => setOtherGoalText(e.target.value)}
            placeholder="Briefly describe your focus"
            className="mt-3 w-full rounded-xl border p-2 text-sm"
          />
        )}
      </button>
    </div>

    <div className="flex justify-between pt-1">
      <button onClick={back} className="text-slate-500">Back</button>
      <button
        onClick={() => goal && next()}
        disabled={!goal || (goal === "other" && !otherGoalText.trim())}
        className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-40"
      >
        Next
      </button>
    </div>
  </motion.div>
);

    // 2: Motivation
    if (step === 2) return (
      <motion.div key="motivation" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4">
        <div className="text-xl md:text-2xl font-extrabold">
          What would better {goal === "exec" ? "energy" : goal === "yo_yo_ozempic" ? "control" : "clarity"} let you do?
        </div>
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          placeholder="Short sentence (optional)"
          className="w-full rounded-2xl border p-3 min-h-[100px]"
        />
        <div className="flex justify-between pt-1">
          <button onClick={back} className="text-slate-500">Back</button>
          <button onClick={next} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">
            Next
          </button>
        </div>
      </motion.div>
    );

    // 3: Routine (incl. Name)
    if (step === 3) return (
      <motion.div key="routine" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-6">
        <div className="text-xl md:text-2xl font-extrabold">Your current routine (quick)</div>

        <input
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-2xl border p-3"
        />
          // ...inside step === 3
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-600">
              Meals per day: <span className="font-bold text-slate-800">{mealsPerDay}</span>
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(+e.target.value)}
              className="w-full"
            />
          </div>

          {/* NEW: Snacks per day */}
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-600">
              Snacks per day: <span className="font-bold text-slate-800">{snacksPerDay}</span>
            </label>
            <input
              type="range"
              min={0}
              max={3}
              value={snacksPerDay}
              onChange={(e) => setSnacksPerDay(+e.target.value)}
              className="w-full"
            />
          </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-600">Activity level</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["Low", "Light", "Moderate", "High"].map((t, i) => {
                        const level = i + 1;
                        return (
                          <button
                            key={t}
                            onClick={() => setActivity(level)} // ← NO meals side-effect anymore
                            className={cn(
                              "rounded-xl p-3 border text-sm transition-all",
                              activity === level && "ring-4 ring-violet-200 border-violet-400 font-bold shadow-sm"
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-1">
                    <button onClick={back} className="text-slate-500">Back</button>
                    <button onClick={() => setStep(3.5 as any)} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">
                      Start 60-second quiz
                    </button>
                  </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-600">
            Meals per day: <span className="font-bold text-slate-800">{mealsPerDay}</span>
          </label>
          <input
            type="range"
            min={1}
            max={6}
            value={mealsPerDay}
            onChange={(e) => setMealsPerDay(+e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-600">Activity level</label>
          <div className="grid grid-cols-4 gap-2">
            {["Low", "Light", "Moderate", "High"].map((t, i) => {
              const level = i + 1;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setActivity(level);
                    setMealsPerDay(activityPresetMeals[level]); // <— keep slider in sync
                  }}
                  className={cn(
                    "rounded-xl p-3 border text-sm transition-all",
                    activity === level && "ring-4 ring-violet-200 border-violet-400 font-bold shadow-sm"
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between pt-1">
          <button onClick={back} className="text-slate-500">Back</button>
          <button onClick={next} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">
            Start 60-second quiz
          </button>
        </div>
      </motion.div>
    );
        const TOTAL = 5 + questions.length + 2;  // +1 for stats screen
        const FINAL_RESULT_STEP = 5 + questions.length;   // moved by +1
        const FINAL_LAUNCH_STEP = FINAL_RESULT_STEP + 1;
        const FINAL_GRAT_STEP   = FINAL_RESULT_STEP + 2;
        
// 3.5: Stats (height/weight/age in Imperial)
if (step === (3.5 as any)) return (
  <motion.div key="stats" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-6">
    <div className="text-xl md:text-2xl font-extrabold">Your stats</div>

    <div className="grid gap-2 sm:grid-cols-3">
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-slate-600">Height (inches)</span>
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
        <span className="text-sm font-semibold text-slate-600">Weight (lb)</span>
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
        <span className="text-sm font-semibold text-slate-600">Age</span>
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

    <div className="flex justify-between pt-1">
      <button onClick={() => setStep(3)} className="text-slate-500">Back</button>
      <button onClick={next} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">
        Continue
      </button>
    </div>
  </motion.div>
);

    // 4..13: 10 Questions
    const qIndex = step - 4;
    if (qIndex >= 0 && qIndex < questions.length) {
      const q = questions[qIndex];
      return (
        <motion.div key={q.id} variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-5">
          <div className="text-sm text-slate-500">
            Question {qIndex + 1} / {questions.length}
          </div>
          <div className="text-xl md:text-2xl font-extrabold leading-snug">{q.text}</div>
          <div className="grid gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswer(qIndex, i)}
                className="text-left rounded-2xl p-4 border hover:shadow-md transition"
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex justify-between pt-1">
            <button onClick={back} className="text-slate-500">Back</button>
            <button onClick={() => next()} className="text-slate-500">Skip</button>
          </div>
        </motion.div>
      );
    }

    // 14: Result
    if (step === FINAL_RESULT_STEP) return (
      <motion.div key="result" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-5">
        <div className="text-xl md:text-2xl font-extrabold">Meet your coach</div>
        <div className="rounded-2xl border p-4 grid gap-2">
          <div className="text-slate-500 text-sm">Your inner critic looked like</div>
          <div className="text-lg font-bold">{copy.critic}</div>
          <div className="text-slate-500 text-sm">We’ll pair you with</div>
          <div className="text-lg font-bold">{copy.coach}</div>
          <div className="text-slate-700">{copy.reframe}</div>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <div>
            Focus preview: <span className="font-semibold">{goal || "—"}</span>
          </div>
          <div>
            Scores → exec: {scores.exec} · yo-yo: {scores.yo_yo_ozempic} · longevity: {scores.longevity_seeker}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={submitting}
            onClick={finish}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-40"
          >
            {submitting ? "Saving…" : "Save & continue"}
          </button>
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
            Close
          </button>
        </div>
      </motion.div>
    );

    // 15: Final (launch)
    if (step === FINAL_LAUNCH_STEP) return (
      <motion.div key="launch" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4">
        <div className="text-xl md:text-2xl font-extrabold">All set ✨</div>
        <p className="text-slate-600">
          We saved your profile and added your onboarding bonus. Open the login window to start using Better Bite Buddy™.
        </p>
        <button
          onClick={() => {
            const portal = process.env.NEXT_PUBLIC_PICKAXE_PORTAL_URL;
            if (portal) {
              window.open(portal, "_blank", "noopener,noreferrer");
            } else {
              // Fallback: try to click an existing "Log in / Sign up" control on the page
              const btns = Array.from(document.querySelectorAll("button,a"));
              const t = btns.find((n: any) => /log in|sign up/i.test(n?.textContent || ""));
              (t as HTMLButtonElement | HTMLAnchorElement | undefined)?.click();
            }
            setStep(FINAL_GRAT_STEP);
          }}
          className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold"
        >
          Open login / sign up
        </button>
      </motion.div>
    );

    // 16: Gratitude
    if (step === FINAL_GRAT_STEP) return (
      <motion.div key="gratitude" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4 text-center">
        <div className="text-xl md:text-2xl font-extrabold">Nice work 🙌</div>
        <p className="text-slate-600">Take a 3-second breath: you already began.</p>
      </motion.div>
    );

    return null;
  })();

  /* --------------------------------- Shell --------------------------------- */
  return (
    <>
      {/* Optional floating trigger to reopen later */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-white/90 backdrop-blur px-4 py-2 rounded-xl border shadow"
        >
          Take the 60-second Clarity Quiz
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-[radial-gradient(800px_500px_at_15%_10%,rgba(122,99,254,.15),transparent),radial-gradient(700px_400px_at_85%_90%,rgba(116,225,240,.14),transparent),rgba(11,18,32,.86)] backdrop-blur"
          >
            <motion.div className="w-[min(720px,95vw)] max-h-[88vh] overflow-auto bg-white rounded-3xl shadow-2xl p-6 md:p-7 grid gap-6 relative">
              {/* Close */}
              <button
                onClick={() => {
                  localStorage.setItem(LS_KEYS.dismissed, "1");
                  setOpen(false);
                  onClose?.();
                }}
                className="absolute right-3 top-3 w-9 h-9 grid place-items-center rounded-full hover:bg-slate-100 text-xl"
                aria-label="Close"
              >
                ×
              </button>

              {/* Progress */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500" style={{ width: `${progress.pct}%` }} />
              </div>

              {screen}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}




// // components/OnboardingWizard.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";

// type WizardProps = {
//   autoOpen?: boolean;
//   onClose?: () => void;
//   onComplete?: () => void;
// };

// /* ------------------------------ Local Storage ------------------------------ */
// const LS_KEYS = {
//   dismissed: "bbb_onboarding_dismissed_v1",
//   email: "bbb_email",
// };

// /* --------------------------------- Types ---------------------------------- */
// type ArchetypeSlug = "exec" | "yo_yo_ozempic" | "longevity_seeker" | "other";

// type Scores = {
//   exec: number;
//   yo_yo_ozempic: number;
//   longevity_seeker: number;
// };

// const baseScores: Scores = { exec: 0, yo_yo_ozempic: 0, longevity_seeker: 0 };

// /* ------------------------------- Animations -------------------------------- */
// const variants = {
//   enter:  { opacity: 0,  y: 24,  filter: "blur(3px)", transition: { type: "spring", stiffness: 140, damping: 18 } },
//   center: { opacity: 1,  y: 0,   filter: "blur(0px)", transition: { type: "spring", stiffness: 140, damping: 18 } },
//   exit:   { opacity: 0,  y: -24, filter: "blur(2px)", transition: { type: "spring", stiffness: 140, damping: 18 } },
// } as const;

// /* --------------------------------- Quiz ----------------------------------- */
// const questions = [
//   {
//     id: "q1",
//     text: "When stress hits, what's your usual response?",
//     options: [
//       { label: "Push harder and power through", add: { exec: 1 } },
//       { label: "I snack or fall off track", add: { yo_yo_ozempic: 1 } },
//       { label: "Pause and monitor how I feel", add: { longevity_seeker: 1 } },
//     ],
//   },
//   {
//     id: "q2",
//     text: "Pick the line that sounds most like you:",
//     options: [
//       { label: "I don't have time for myself", add: { exec: 1 } },
//       { label: "I've tried every diet", add: { yo_yo_ozempic: 1 } },
//       { label: "I want to feel younger, longer", add: { longevity_seeker: 1 } },
//     ],
//   },
//   {
//     id: "q3",
//     text: "Your biggest blocker right now is…",
//     options: [
//       { label: "Inconsistent routine / long days", add: { exec: 1 } },
//       { label: "Cravings and late-night eating", add: { yo_yo_ozempic: 1 } },
//       { label: "Inflammation or blood sugar swings", add: { longevity_seeker: 1 } },
//     ],
//   },
//   {
//     id: "q4",
//     text: "How do you usually choose meals?",
//     options: [
//       { label: "Whatever gets me moving fastest", add: { exec: 1 } },
//       { label: "Good until a trigger… then I spiral", add: { yo_yo_ozempic: 1 } },
//       { label: "Looking for clean and steady energy", add: { longevity_seeker: 1 } },
//     ],
//   },
//   {
//     id: "q5",
//     text: "What would you like more of next month?",
//     options: [
//       { label: "Consistent focus + energy", add: { exec: 1 } },
//       { label: "Control over hunger & cravings", add: { yo_yo_ozempic: 1 } },
//       { label: "Calmer digestion + metrics trending right", add: { longevity_seeker: 1 } },
//     ],
//   },
//   {
//     id: "q6",
//     text: "Pick the most helpful coach statement:",
//     options: [
//       { label: "You don't need to push harder, just steadier.", add: { exec: 1 } },
//       { label: "Small resets beat all-or-nothing.", add: { yo_yo_ozempic: 1 } },
//       { label: "Tiny data → tiny upgrades → long runway.", add: { longevity_seeker: 1 } },
//     ],
//   },
//   {
//     id: "q7",
//     text: "A win this week would be…",
//     options: [
//       { label: "2 solid workdays without energy crashes", add: { exec: 1 } },
//       { label: "3 evening cravings tamed", add: { yo_yo_ozempic: 1 } },
//       { label: "1 inflammation trigger identified", add: { longevity_seeker: 1 } },
//     ],
//   },
//   {
//     id: "q8",
//     text: "When travel or social events pop up…",
//     options: [
//       { label: "I adapt on the fly, sometimes skip meals", add: { exec: 1 } },
//       { label: "I go off plan and restart later", add: { yo_yo_ozempic: 1 } },
//       { label: "I anchor on protein/veggies, watch glucose", add: { longevity_seeker: 1 } },
//     ],
//   },
//   {
//     id: "q9",
//     text: "How do you like to be coached?",
//     options: [
//       { label: "Direct, efficient nudges", add: { exec: 1 } },
//       { label: "Warm encouragement + simple resets", add: { yo_yo_ozempic: 1 } },
//       { label: "Evidence with practical experiments", add: { longevity_seeker: 1 } },
//     ],
//   },
//   {
//     id: "q10",
//     text: "If BBB gave you one superpower, you'd pick…",
//     options: [
//       { label: "Steady workday performance", add: { exec: 1 } },
//       { label: "Craving-proof evenings", add: { yo_yo_ozempic: 1 } },
//       { label: "Youthful clarity all day", add: { longevity_seeker: 1 } },
//     ],
//   },
// ] as const;

// type QOption = typeof questions[number]["options"][number];

// /* --------------------------------- Utils ---------------------------------- */
// function classNames(...xs: (string | false | null | undefined)[]) {
//   return xs.filter(Boolean).join(" ");
// }

// function resultCopy(slug: ArchetypeSlug) {
//   if (slug === "exec")
//     return {
//       critic: "Overdrive Samurai",
//       coach: "Resilient Strategist",
//       reframe: "You don’t need to push harder — just steadier. Two tiny anchors beat a perfect day.",
//     };
//   if (slug === "yo_yo_ozempic")
//     return {
//       critic: "All-or-Nothing Gremlin",
//       coach: "Calm Reset Navigator",
//       reframe: "Cravings lose when resets are easy and immediate. One small win tonight beats a restart next week.",
//     };
//   return {
//     critic: "Longevity Perfectionist",
//     coach: "Data-Wise Guide",
//     reframe: "Tiny data → tiny upgrades. Protect energy today and your long runway gets longer.",
//   };
// }

// /* ----------------------------- Main Component ----------------------------- */
// export default function OnboardingWizard({ autoOpen = false, onClose, onComplete }: WizardProps) {
//   const [open, setOpen] = useState<boolean>(autoOpen);
//   const [step, setStep] = useState<number>(0);

//   // core state
//   const [goal, setGoal] = useState<ArchetypeSlug | "">("");
//   const [motivation, setMotivation] = useState<string>("");
//   const [mealsPerDay, setMealsPerDay] = useState<number>(3);
//   const [activity, setActivity] = useState<number>(2); // 1..4
//   const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
//   const [submitting, setSubmitting] = useState<boolean>(false);

//   // derived
//   const email = (typeof window !== "undefined" && localStorage.getItem(LS_KEYS.email)) || "";

//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     const dismissed = localStorage.getItem(LS_KEYS.dismissed) === "1";
//     const hasQuery = new URLSearchParams(window.location.search).get("onboard");
//     if (autoOpen && !dismissed) setOpen(true);
//     if (hasQuery) setOpen(true);
//   }, [autoOpen]);

//   const progress = useMemo(() => {
//     const totalScreens = 4 + questions.length + 2; // welcome, goal, motivation, routine, 10Q, result, final
//     const clamped = Math.min(step, totalScreens - 1);
//     return {
//       value: clamped,
//       total: totalScreens,
//       pct: Math.round((clamped / (totalScreens - 1)) * 100),
//     };
//   }, [step]);

//   const next = () => setStep((s) => s + 1);
//   const back = () => setStep((s) => Math.max(0, s - 1));

//   function setAnswer(qIndex: number, optIndex: number) {
//     const copy = [...answers];
//     copy[qIndex] = optIndex;
//     setAnswers(copy);
//     next();
//   }

//   function computeScores(): { scores: Scores; dominant: ArchetypeSlug } {
//     const s: Scores = { ...baseScores };
//     answers.forEach((optIdx, idx) => {
//       const opt: QOption | undefined = optIdx >= 0 ? questions[idx].options[optIdx] : undefined;
//       if (!opt) return;
//       const add = opt.add as Partial<Scores>;
//       (Object.keys(add) as (keyof Scores)[]).forEach((k) => (s[k] += add[k] || 0));
//     });
//     if (goal === "exec") s.exec += 1;
//     if (goal === "yo_yo_ozempic") s.yo_yo_ozempic += 1;
//     if (goal === "longevity_seeker") s.longevity_seeker += 1;
//     const dominant = (Object.entries(s).sort((a, b) => b[1] - a[1])[0]?.[0] || "other") as ArchetypeSlug;
//     return { scores: s, dominant };
//   }

//   async function finish() {
//     try {
//       setSubmitting(true);
//       const { scores, dominant } = computeScores();
//       const payload = {
//         email,                 // will attach products/limits
//         goal, motivation,      // free text & selected slug
//         mealsPerDay, activity, // routine snapshot
//         answers, scores, dominant, // quiz result
//       };
//       await fetch("/api/pickaxe/onboarding-complete", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       localStorage.setItem(LS_KEYS.dismissed, "1");
//       next(); // go to “final” screen
//       onComplete?.();
//     } catch (e) {
//       console.error(e);
//       alert("Could not save onboarding. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   const { scores, dominant } = computeScores();
//   const copy = resultCopy(dominant);

//   /* --------------------------------- Screens -------------------------------- */
//           const FINAL_RESULT_STEP = 4 + questions.length;   // 14
//           const FINAL_LAUNCH_STEP = FINAL_RESULT_STEP + 1;  // 15
//           const FINAL_GRAT_STEP   = FINAL_RESULT_STEP + 2;  // 16

//         const screen = (() => {
//         // inside screen()
//         if (step === 0) return (
//           <motion.div key="welcome" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4">
//             <div className="text-2xl md:text-3xl font-extrabold">Hi there — I’m Better Bite Buddy™</div>
//             <p className="text-slate-600">Let’s personalize your coaching in about a minute.</p>
//             <div className="flex gap-2 mt-2">
//               <button onClick={() => setStep(0.5 as any)} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold shadow">Let’s go</button>
//               <button
//                 onClick={() => { localStorage.setItem(LS_KEYS.dismissed, "1"); setOpen(false); }}
//                 className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
//               >
//                 Skip for now
//               </button>
//             </div>
//           </motion.div>
//         );

//         if (step === 0.5 as any) return (
//           <motion.div key="promise" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4">
//             <div className="text-2xl md:text-3xl font-extrabold">Clarity beats cravings.</div>
//             <p className="text-slate-600">You’ve tried diets. This time you’ll build decisions. BBB makes the next bite easy.</p>
//             <div>
//               <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">Find my clarity</button>
//             </div>
//           </motion.div>
//         );

//     // 1: Goal
//     if (step === 1)
//       return (
//         <motion.div key="goals" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4">
//           <div className="text-xl md:text-2xl font-extrabold">Choose your focus</div>
//           <div className="grid sm:grid-cols-3 gap-3">
//             {[
//               { slug: "exec", title: "Steadier energy", sub: "Busy exec / burned out" },
//               { slug: "yo_yo_ozempic", title: "Craving control", sub: "Yo-yo dieter" },
//               { slug: "longevity_seeker", title: "Longevity & clarity", sub: "Health span seeker" },
//             ].map((g) => (
//               <button
//                 key={g.slug}
//                 onClick={() => setGoal(g.slug as ArchetypeSlug)}
//                 className={classNames(
//                   "text-left rounded-2xl p-4 border transition",
//                   goal === g.slug ? "ring-4 ring-violet-200 border-violet-400" : "hover:shadow-md"
//                 )}
//               >
//                 <div className="font-bold">{g.title}</div>
//                 <div className="text-sm text-slate-600">{g.sub}</div>
//               </button>
//             ))}
//           </div>
//           <div className="flex justify-between pt-1">
//             <button onClick={back} className="text-slate-500">
//               Back
//             </button>
//             <button
//               onClick={() => goal && next()}
//               disabled={!goal}
//               className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         </motion.div>
//       );

//     // 2: Motivation
//     if (step === 2)
//       return (
//         <motion.div key="motivation" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4">
//           <div className="text-xl md:text-2xl font-extrabold">
//             What would better {goal === "exec" ? "energy" : goal === "yo_yo_ozempic" ? "control" : "clarity"} let you do?
//           </div>
//           <textarea
//             value={motivation}
//             onChange={(e) => setMotivation(e.target.value)}
//             placeholder="Short sentence (optional)"
//             className="w-full rounded-2xl border p-3 min-h-[100px]"
//           />
//           <div className="flex justify-between pt-1">
//             <button onClick={back} className="text-slate-500">
//               Back
//             </button>
//             <button onClick={next} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">
//               Next
//             </button>
//           </div>
//         </motion.div>
//       );

//     // 3: Routine snapshot
//     if (step === 3)
//       return (
//         <motion.div key="routine" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-6">
//           <div className="text-xl md:text-2xl font-extrabold">Your current routine (quick)</div>
//           <div className="grid gap-2">
//             <label className="text-sm font-semibold text-slate-600">
//               Meals per day: <span className="font-bold text-slate-800">{mealsPerDay}</span>
//             </label>
//             <input type="range" min={1} max={6} value={mealsPerDay} onChange={(e) => setMealsPerDay(+e.target.value)} className="w-full" />
//           </div>
//           <div className="grid gap-2">
//             <label className="text-sm font-semibold text-slate-600">Activity level</label>
//             <div className="grid grid-cols-4 gap-2">
//               {["Low", "Light", "Moderate", "High"].map((t, i) => (
//                 <button
//                   key={t}
//                   onClick={() => setActivity(i + 1)}
//                   className={classNames(
//                     "rounded-xl p-3 border text-sm",
//                     activity === i + 1 && "ring-4 ring-violet-200 border-violet-400 font-bold"
//                   )}
//                 >
//                   {t}
//                 </button>
//               ))}
//             </div>
//           </div>
//           <div className="flex justify-between pt-1">
//             <button onClick={back} className="text-slate-500">
//               Back
//             </button>
//             <button onClick={next} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">
//               Start 60-second quiz
//             </button>
//           </div>
//         </motion.div>
//       );

//     // 4..13: 10 Questions
//     const qIndex = step - 4;
//     if (qIndex >= 0 && qIndex < questions.length) {
//       const q = questions[qIndex];
//       return (
//         <motion.div key={q.id} variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-5">
//           <div className="text-sm text-slate-500">
//             Question {qIndex + 1} / {questions.length}
//           </div>
//           <div className="text-xl md:text-2xl font-extrabold leading-snug">{q.text}</div>
//           <div className="grid gap-3">
//             {q.options.map((opt, i) => (
//               <button
//                 key={i}
//                 onClick={() => setAnswer(qIndex, i)}
//                 className="text-left rounded-2xl p-4 border hover:shadow-md transition"
//               >
//                 {opt.label}
//               </button>
//             ))}
//           </div>
//           <div className="flex justify-between pt-1">
//             <button onClick={back} className="text-slate-500">
//               Back
//             </button>
//             <button onClick={() => next()} className="text-slate-500">
//               Skip
//             </button>
//           </div>
//         </motion.div>
//       );
//     }

//     // 14: Result
//     if (step === 4 + questions.length)
//       return (
//         <motion.div key="result" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-5">
//           <div className="text-xl md:text-2xl font-extrabold">Meet your coach</div>
//           <div className="rounded-2xl border p-4 grid gap-2">
//             <div className="text-slate-500 text-sm">Your inner critic looked like</div>
//             <div className="text-lg font-bold">{copy.critic}</div>
//             <div className="text-slate-500 text-sm">We’ll pair you with</div>
//             <div className="text-lg font-bold">{copy.coach}</div>
//             <div className="text-slate-700">{copy.reframe}</div>
//           </div>
//           <div className="grid gap-2 text-sm text-slate-600">
//             <div>
//               Focus preview: <span className="font-semibold">{goal || "—"}</span>
//             </div>
//             <div>
//               Scores → exec: {scores.exec} · yo-yo: {scores.yo_yo_ozempic} · longevity: {scores.longevity_seeker}
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             <button
//               disabled={submitting}
//               onClick={finish}
//               className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-40"
//             >
//               {submitting ? "Saving…" : "Save & continue"}
//             </button>
//             <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
//               Close
//             </button>
//           </div>
//         </motion.div>
//       );

//     // 15: Final (launch)
//     return (
//       <motion.div key="launch" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4">
//         <div className="text-xl md:text-2xl font-extrabold">All set ✨</div>
//         <p className="text-slate-600">
//           We saved your profile and added your onboarding bonus. Open the login window to start using Better Bite Buddy™.
//         </p>
//         <button
//           onClick={() => {
//             // Try to programmatically click a "Log in / Sign up" element if present
//             const btns = Array.from(document.querySelectorAll("button,a"));
//             const t = btns.find((n: any) => /log in|sign up/i.test(n?.textContent || "")) as
//               | HTMLButtonElement
//               | HTMLAnchorElement
//               | undefined;
//             if (t) t.click();
//             setOpen(false);
//             onClose?.();
//           }}
//           className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold"
//         >
//           Open login / sign up
//         </button>
//       </motion.div>
//     );
//   })();
//   // 16 Gratitude moment (NEW, after launch)
// if (step === 4 + questions.length + 2) {
//   useEffect(() => {
//     const t = setTimeout(() => setOpen(false), 3000);
//     return () => clearTimeout(t);
//   }, []);
//   return (
//     <motion.div key="gratitude" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4 text-center">
//       <div className="text-xl md:text-2xl font-extrabold">Nice work 🙌</div>
//       <p className="text-slate-600">
//         Take a 3-second breath: you already began.
//       </p>
//     </motion.div>
//   );
// }
// useEffect(() => {
//   if (step === FINAL_GRAT_STEP) {
//     const t = setTimeout(() => setOpen(false), 3000);
//     return () => clearTimeout(t);
//   }
// }, [step]);


//   /* --------------------------------- Shell --------------------------------- */
//   return (
//     <>
//       {/* Optional floating trigger to reopen later */}
//       {!open && (
//         <button
//           onClick={() => setOpen(true)}
//           className="fixed bottom-5 right-5 z-40 bg-white/90 backdrop-blur px-4 py-2 rounded-xl border shadow"
//         >
//           Take the 60-second Clarity Quiz
//         </button>
//       )}

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 grid place-items-center bg-[radial-gradient(800px_500px_at_15%_10%,rgba(122,99,254,.15),transparent),radial-gradient(700px_400px_at_85%_90%,rgba(116,225,240,.14),transparent),rgba(11,18,32,.86)] backdrop-blur"
//           >
//             <motion.div className="w-[min(720px,95vw)] max-h-[88vh] overflow-auto bg-white rounded-3xl shadow-2xl p-6 md:p-7 grid gap-6 relative">
//               {/* Close */}
//               <button
//                 onClick={() => {
//                   localStorage.setItem(LS_KEYS.dismissed, "1");
//                   setOpen(false);
//                   onClose?.();
//                 }}
//                 className="absolute right-3 top-3 w-9 h-9 grid place-items-center rounded-full hover:bg-slate-100 text-xl"
//               >
//                 ×
//               </button>

//               {/* Progress */}
//               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
//                 <div className="h-full bg-violet-500" style={{ width: `${progress.pct}%` }} />
//               </div>

//               {screen}
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
// // in OnboardingWizard.tsx
// const [name, setName] = useState("");
// // ...in Routine screen JSX:
// <input
//   placeholder="Your name"
//   value={name}
//   onChange={e=>setName(e.target.value)}
//   className="rounded-xl border p-3"
// />

// // and pass it in finish():
// const payload = { email, name, goal, motivation, mealsPerDay, activity, answers, scores, dominant };

// const FINAL_RESULT_STEP = 4 + questions.length;  // 14
// const FINAL_LAUNCH_STEP = FINAL_RESULT_STEP + 1; // 15
// const FINAL_GRAT_STEP  = FINAL_RESULT_STEP + 2;  // 16
// useEffect(() => {
//   if (step === FINAL_GRAT_STEP) {
//     const t = setTimeout(() => setOpen(false), 3000);
//     return () => clearTimeout(t);
//   }
// }, [step]);
// const [name, setName] = useState("");
// <input
//   placeholder="Your name"
//   value={name}
//   onChange={(e) => setName(e.target.value)}
//   className="rounded-xl border p-3"
// />
// async function finish() {
//   try {
//     setSubmitting(true);
//     const { scores, dominant } = computeScores();
//     const payload = { email, name, goal, motivation, mealsPerDay, activity, answers, scores, dominant };

//     await fetch("/api/pickaxe/onboarding-complete", {
//       method: "POST",
//       headers: { "content-type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     localStorage.setItem(LS_KEYS.dismissed, "1");
//     setStep(FINAL_LAUNCH_STEP); // go to “All set / open login”
//   } catch (e) {
//     console.error(e);
//     alert("Could not save onboarding. Please try again.");
//   } finally {
//     setSubmitting(false);
//   }
// }
// onClick={() => {
//   const portal = process.env.NEXT_PUBLIC_PICKAXE_PORTAL_URL;
//   if (portal) window.open(portal, "_blank", "noopener,noreferrer");
//   else {
//     const btns = Array.from(document.querySelectorAll("button,a"));
//     const t = btns.find((n:any)=>/log in|sign up/i.test(n?.textContent||""));
//     (t as HTMLButtonElement | HTMLAnchorElement | undefined)?.click();
//   }
//   setStep(FINAL_GRAT_STEP);
// }}
// if (step === FINAL_GRAT_STEP) return (
//   <motion.div key="gratitude" variants={variants} initial="enter" animate="center" exit="exit" className="grid gap-4 text-center">
//     <div className="text-xl md:text-2xl font-extrabold">Nice work 🙌</div>
//     <p className="text-slate-600">Take a 3-second breath: you already began.</p>
//   </motion.div>
// );
