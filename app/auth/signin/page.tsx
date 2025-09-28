// app/auth/signin/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function loginWithEmail(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    try {
      setLoading("credentials");
      // Credentials provider id is "credentials"
      await signIn("credentials", { email: value, redirect: true, callbackUrl });
    } finally {
      setLoading(null);
    }
  }

  // If a provider isn't configured yet, keep its button disabled.
  const canGoogle = false;
  const canX = false;
  const canApple = false;
  const canEmailProvider = false;

  const btn = (enabled: boolean, active: boolean, extra = "") =>
    `w-full rounded-full py-3 font-medium border ${
      enabled ? "border-gray-600 hover:bg-gray-900" : "border-gray-800 text-gray-500 cursor-not-allowed"
    } ${active ? "opacity-60" : ""} ${extra}`;

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
            {/* X / Twitter */}
            <button
              disabled={!canX || loading === "x"}
              onClick={() => (canX ? signIn("twitter", { callbackUrl }) : undefined)}
              className={btn(canX, loading === "x")}
            >
              𝕏 &nbsp; Continue with X
            </button>

            {/* Email provider (magic link) — leave disabled until SMTP wired */}
            <button
              disabled={!canEmailProvider || loading === "email"}
              onClick={() => (canEmailProvider ? signIn("email", { callbackUrl }) : undefined)}
              className={btn(canEmailProvider, loading === "email")}
            >
              ✉️ &nbsp; Continue with Email
            </button>

            {/* Google */}
            <button
              disabled={!canGoogle || loading === "google"}
              onClick={() => (canGoogle ? signIn("google", { callbackUrl }) : undefined)}
              className={btn(canGoogle, loading === "google")}
            >
              <span className="inline-block mr-2 align-middle">
                <Image src="/google-icon.png" alt="Google" width={18} height={18} />
              </span>
              Continue with Google
            </button>

            {/* Apple */}
            <button
              disabled={!canApple || loading === "apple"}
              onClick={() => (canApple ? signIn("apple", { callbackUrl }) : undefined)}
              className={btn(canApple, loading === "apple")}
            >
              🍎 &nbsp; Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="h-px flex-1 bg-gray-800" />
            <div className="mx-3 text-xs text-gray-500">or</div>
            <div className="h-px flex-1 bg-gray-800" />
          </div>

          {/* Minimal credentials sign-in */}
          <form onSubmit={loginWithEmail} className="space-y-2">
            <input
              className="w-full rounded-full border border-gray-700 bg-transparent px-4 py-3 text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={loading === "credentials"}
              className={`w-full rounded-full py-3 font-medium ${
                loading === "credentials" ? "bg-gray-700" : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {loading === "credentials" ? "Signing in…" : "Continue"}
            </button>
          </form>
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
