"use client";
export default function Error({
  error, reset,
}: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-[60vh] grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="opacity-70 mt-2">{error.message}</p>
        <button className="btn btn-primary mt-4" onClick={() => reset()}>Try again</button>
      </div>
    </main>
  );
}
