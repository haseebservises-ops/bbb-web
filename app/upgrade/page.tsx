// app/upgrade/page.tsx
export default function UpgradePage() {
  const plans = [
    {
      name: "Better Bite Buddy™ Core (Monthly)",
      price: "$10/mo",
      url: process.env.NEXT_PUBLIC_CORE_MONTHLY, // Stripe Payment Link URL
    },
    {
      name: "Better Bite Buddy™ Core (Annual)",
      price: "$100/yr",
      url: process.env.NEXT_PUBLIC_CORE_ANNUAL,
    },
    {
      name: "Better Bite Coach™ Premium (Monthly)",
      price: "$20/mo",
      url: process.env.NEXT_PUBLIC_CORE_PREMIUM_MONTHLY,
    },
    {
      name: "Better Bite Coach™ Premium (Annual)",
      price: "$150/yr",
      url: process.env.NEXT_PUBLIC_CORE_PREMIUM_ANNUAL,
    },
  ].filter((p) => !!p.url);

  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-extrabold">Pricing</h1>
      <div className="grid sm:grid-cols-2 gap-5">
        {plans.map((p) => (
          <div key={p.name} className="rounded-2xl border p-5 shadow-sm">
            <div className="text-lg font-bold">{p.name}</div>
            <div className="text-slate-600 mb-4">{p.price}</div>

            {/* No onClick here; just an anchor to Stripe */}
            <a
              href={p.url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-xl bg-violet-600 text-white font-bold hover:brightness-110"
            >
              Checkout with Stripe
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
