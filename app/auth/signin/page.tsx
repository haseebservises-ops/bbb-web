// app/auth/signin/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  async function loginWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      // IMPORTANT: our only working provider is "credentials"
      await signIn("credentials", { email, redirect: true, callbackUrl });
    } finally {
      setBusy(false);
    }
  }

  // These are placeholders for when you wire real OAuth providers later.
  const canGoogle = false;
  const canX = false;
  const canApple = false;

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-black text-white">
      {/* Left: login card */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="https://storage.googleapis.com/msgsndr/ROvsrlVUnHQifEIiaP7S/media/68b8a556bd7b76c153bb1800.png"
              alt="Better Bite Buddy"
              width={56}
              height={56}
              className="mx-auto rounded-lg"
            />
            <p className="text-sm text-gray-400 mt-3">
              You are signing in to <b>Better Bite Buddy</b>.
            </p>
            <h1 className="text-2xl font-semibold mt-2">Log into your account</h1>
          </div>

          <div className="space-y-3">
            {/* ✅ Email via Credentials (works today) */}
            <form onSubmit={loginWithEmail} className="space-y-2">
              <input
                className="w-full rounded-full px-4 py-3 bg-transparent border border-gray-700 placeholder-gray-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={!email.trim() || busy}
                className={`w-full rounded-full py-3 font-medium border border-gray-600 hover:bg-gray-900 ${
                  busy ? "opacity-60 cursor-wait" : ""
                }`}
              >
                {busy ? "Signing in…" : "Continue with Email"}
              </button>
            </form>

            {/* Placeholders for future providers */}
            <button
              disabled={!canX}
              className="w-full rounded-full py-3 font-medium bg-gray-800 text-gray-500 cursor-not-allowed"
              title="X login not configured yet"
            >
              𝕏 &nbsp; Continue with X
            </button>

            <button
              disabled={!canGoogle}
              className="w-full rounded-full py-3 font-medium border border-gray-800 text-gray-500 cursor-not-allowed"
              title="Google login not configured yet"
            >
              <span className="inline-block mr-2 align-middle">
                <Image src="/google-icon.png" alt="Google" width={18} height={18} />
              </span>
              Continue with Google
            </button>

            <button
              disabled={!canApple}
              className="w-full rounded-full py-3 font-medium border border-gray-800 text-gray-500 cursor-not-allowed"
              title="Apple login not configured yet"
            >
              🍎 &nbsp; Continue with Apple
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don’t have an account? <a className="text-blue-400 hover:underline" href="/auth/signin">Create one</a>
          </p>
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
