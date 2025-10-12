export default function UpgradeCanceled() {
  return (
    <main className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-3xl font-extrabold">Checkout canceled</h1>
      <p className="text-slate-600 mt-2">No problem — you haven’t been charged.</p>
      <a href="/upgrade" className="inline-block mt-6 rounded-xl px-4 py-2 bg-slate-900 text-white font-bold">
        Back to plans
      </a>
    </main>
  );
}
