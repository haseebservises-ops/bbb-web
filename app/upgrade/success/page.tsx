export default function UpgradeSuccess() {
  return (
    <main className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-3xl font-extrabold">You’re all set ✨</h1>
      <p className="text-slate-600 mt-2">
        Your purchase was successful. You’ll receive an email receipt from Stripe.
      </p>
      <p className="text-slate-600">
        If you used a different email than your BBB login, let us know so we can link them.
      </p>
      <a href="/" className="inline-block mt-6 rounded-xl px-4 py-2 bg-violet-600 text-white font-bold">
        Go to app
      </a>
    </main>
  );
}
