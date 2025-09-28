// app/auth/signin/page.tsx
"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function loginWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      // Credentials provider id is "credentials"
      await signIn("credentials", { email, redirect: true, callbackUrl });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-black text-white">
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {/* Use <img> so we don't need image domain config */}
            <img
              src="https://storage.googleapis.com/msgsndr/ROvsrlVUnHQifEIiaP7S/media/68b8a556bd7b76c153bb1800.png"
              alt="Better Bite Buddy"
              width={56}
              height={56}
              className="mx-auto rounded-lg"
            />
            <p className="text-sm text-gray-400 mt-3">
              You are signing in to <b>Better Bite Buddy</b>.
            </p>
            <h1 className="text-2xl font-semibold mt-2">Log in</h1>
          </div>

          {/* Google (works only after you add GOOGLE_CLIENT_ID/SECRET and provider below) */}
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full rounded-full py-3 font-medium border border-gray-600 hover:bg-gray-900 mb-3"
          >
            Continue with Google
          </button>

          {/* Credentials text box */}
          <form onSubmit={loginWithEmail} className="space-y-2">
            <input
              className="w-full border rounded px-3 py-2 text-black"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="w-full rounded-full py-3 font-medium bg-white text-black hover:bg-gray-100" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Continue"}
            </button>
          </form>
        </div>
      </div>

      {/* Right: subtle glow */}
      <div className="hidden md:flex items-center justify-center">
        <div className="w-64 h-64 rounded-full blur-3xl opacity-20"
             style={{ background: "radial-gradient(#8a7cff, transparent 60%)" }} />
      </div>
    </div>
  );
}
