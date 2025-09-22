// app/upgrade/page.tsx
"use client";

import Link from "next/link";

type Plan = {
  id: string;
  name: string;
  price: string;
  cadence: "mo" | "yr";
  bullets: string[];
  credits: string; // display only for now
};

const plans: Plan[] = [
  {
    id: "core-monthly",
    name: "Better Bite Buddy™ Core (Monthly)",
    price: "$10",
    cadence: "mo",
    credits: "90/mo",
    bullets: [
      "Personalized nutrition insights",
      "Evidence-based food scoring",
      "Basic habit tips & progress",
      "Cancel anytime",
    ],
  },
  {
    id: "core-annual",
    name: "Better Bite Buddy™ Core (Annual)",
    price: "$100",
    cadence: "yr",
    credits: "1100/yr",
    bullets: [
      "All Core features",
      "Save vs monthly",
      "One payment, no fuss",
    ],
  },
  {
    id: "premium-monthly",
    name: "Better Bite Coach™ Premium (Monthly)",
    price: "$20",
    cadence: "mo",
    credits: "200/mo",
    bullets: [
      "Deeper analyses & extra uploads",
      "Goal-specific coaching",
      "6 evidence-based scoring criteria",
      "Mood & metabolism insights",
      "Priority support",
    ],
  },
  {
    id: "premium-annual",
    name: "Better Bite Buddy™ Premium (Annual)",
    price: "$150",
    cadence: "yr",
    credits: "2400/yr",
    bullets: [
      "Ultimate full access",
      "Best price for the year",
      "Use credits anytime",
      "Save ~38% vs monthly",
    ],
  },
];

export default function UpgradePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">Choose your plan</h1>
      <p className="text-sm mb-8" style={{ color: "var(--bbb-ink-dim)" }}>
        Pick a plan that fits your goals. You can switch or cancel anytime.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <article key={p.id} className="bbb-card p-5 flex flex-col">
            <h2 className="text-base font-semibold mb-1">{p.name}</h2>
            <div className="text-2xl font-bold mb-1">
              {p.price}
              <span className="text-sm font-medium" style={{ color: "var(--bbb-ink-dim)" }}>
                /{p.cadence}
              </span>
            </div>
            <div className="text-xs mb-4" style={{ color: "var(--bbb-ink-dim)" }}>
              CREDITS: {p.credits}
            </div>

            <ul className="text-sm space-y-2 mb-6" style={{ color: "var(--bbb-ink-dim)" }}>
              {p.bullets.map((b, i) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>

            {/* For now, route to a placeholder checkout route.
               In Step 2 (Stripe), we'll swap this to create a session. */}
            <Link
              href={`/upgrade/checkout/${p.id}`}
              className="btn btn-primary mt-auto text-center"
            >
              Upgrade
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-10 text-xs" style={{ color: "var(--bbb-ink-dim)" }}>
        Have questions? <Link href="/contact" className="underline">Contact support</Link>.
      </div>
    </main>
  );
}
