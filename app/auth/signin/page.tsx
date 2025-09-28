// app/auth/signin/page.tsx
"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

/** Inner client UI (wrapped in Suspense below because of useSearchParams) */
function SignInInner() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  // Only show Google if you’ve configured it (NEXT_PUBLIC_GOOGLE_LOGIN=1)
  const canGoogle = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "1";

  async function emailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading("credentials");
    try {
      await signIn("credentials", { email, redirect: true, callbackUrl });
    } finally {
      setLoading(null);
    }
  }

  async function googleLogin() {
    setLoading("google");
    try {
      await signIn("google", { redirect: true, callbackUrl });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-black text-white">
      {/* Left: login card */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {/* Use <img> so we don’t depend on next/image config */}
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

          <div className="space-y-3">
            {/* Google (optional) */}
            {canGoogle && (
              <button
                onClick={googleLogin}
                disabled={loading === "google"}
                className="w-full rounded-full py-3 font-medium border border-gray-600 hover:bg-gray-900"
              >
                Continue with Google
              </button>
            )}

            {/* Email box + Continue */}
            <form onSubmit={emailLogin} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="you@example.com"
                className="w-full rounded-full px-4 py-3 bg-black border border-gray-800 focus:border-gray-600 outline-none"
              />
              <button
                type="submit"
                disabled={loading === "credentials"}
                className="w-full rounded-full py-3 font-medium bg-white text-black hover:bg-gray-200"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right: subtle glow */}
      <div className="hidden md:flex items-center justify-center">
        <div
          className="w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(#8a7cff, transparent 60%)" }}
        />
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}
