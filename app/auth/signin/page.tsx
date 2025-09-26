"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function SignIn() {
  const [loading, setLoading] = useState<string | null>(null);

  const go = async (provider: string) => {
    try {
      setLoading(provider);
      // Send user back to home (or /dashboard) after login
      await signIn(provider, { callbackUrl: "/" });
    } finally {
      setLoading(null);
    }
  };

  // If a provider isn't configured yet, we disable its button.
  const canGoogle = true; // set to false if GOOGLE_ID/SECRET not set
  const canX = false;     // flip to true after you add the Twitter/X provider
  const canApple = false; // flip to true after Apple provider is configured
  const canEmail = false; // flip to true after you wire Email provider (SMTP)

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
            {/* X */}
            <button
              disabled={!canX || loading === "x"}
              onClick={() => canX ? go("twitter") : null}
              className={`w-full rounded-full py-3 font-medium
                ${canX ? "bg-white text-black hover:bg-gray-200" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
            >
              𝕏 &nbsp; Continue with X
            </button>

            {/* Email */}
            <button
              disabled={!canEmail || loading === "email"}
              onClick={() => canEmail ? go("email") : null}
              className={`w-full rounded-full py-3 font-medium border
                ${canEmail ? "border-gray-600 hover:bg-gray-900" : "border-gray-800 text-gray-500 cursor-not-allowed"}`}
            >
              ✉️ &nbsp; Continue with Email
            </button>

            {/* Google */}
            <button
              disabled={!canGoogle || loading === "google"}
              onClick={() => canGoogle ? go("google") : null}
              className={`w-full rounded-full py-3 font-medium border
                ${canGoogle ? "border-gray-600 hover:bg-gray-900" : "border-gray-800 text-gray-500 cursor-not-allowed"}`}
            >
              <span className="inline-block mr-2 align-middle">
                <Image src="/google-icon.png" alt="Google" width={18} height={18} />
              </span>
              Continue with Google
            </button>

            {/* Apple */}
            <button
              disabled={!canApple || loading === "apple"}
              onClick={() => canApple ? go("apple") : null}
              className={`w-full rounded-full py-3 font-medium border
                ${canApple ? "border-orange-500 hover:bg-gray-900" : "border-gray-800 text-gray-500 cursor-not-allowed"}`}
            >
              🍎 &nbsp; Continue with Apple
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don’t have an account? <a className="text-blue-400 hover:underline" href="/auth/signin">Create one</a>
          </p>
        </div>
      </div>

      {/* Right: subtle glow like Grok */}
      <div className="hidden md:flex items-center justify-center">
        <div className="w-64 h-64 rounded-full blur-3xl opacity-20"
             style={{ background: "radial-gradient(#8a7cff, transparent 60%)" }} />
      </div>
    </div>
  );
}
