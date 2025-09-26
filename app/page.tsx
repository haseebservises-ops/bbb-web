// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FEATURES } from "@/lib/env";
import PickaxeEmbed from "@/components/PickaxeEmbed";
import NativeChat from "@/components/NativeChat";
import OnboardingGate, { BBBProfile } from "./components/OnboardingGate";
import ReopenSetupButton from "./components/ReopenSetupButton";

export default function Page() {
  // One-time debug (remove later). Also visible badge at bottom-right.
  if (typeof window !== "undefined") {
    console.log("[BBB] FEATURES.usePickaxe =", FEATURES.usePickaxe);
  }

  // If Pickaxe is active, show it full-screen and return early.
  if (FEATURES.usePickaxe) {
    return (
      <>
        <PickaxeEmbed />
        <div className="fixed bottom-2 right-2 z-50 text-xs opacity-70 bg-black/30 dark:bg-white/10 px-2 py-1 rounded">
          usePickaxe: {String(FEATURES.usePickaxe)}
        </div>
      </>
    );
  }

  // Otherwise (non-prod default) show our Native path with onboarding
  const [profile, setProfile] = useState<BBBProfile | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("bbb_onboarded") === "1") {
      const stored = localStorage.getItem("bbb_profile");
      if (stored) {
        try {
          setProfile(JSON.parse(stored) as BBBProfile);
          return;
        } catch {}
      }
      // Minimal fallback profile
      setProfile({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        archetype: "",
        heightInches: "",
        weightLbs: "",
        goals: [],
        agreed: true,
      });
    }
  }, []);

  return (
    <>
      <OnboardingGate
        onComplete={(p) => {
          try {
            localStorage.setItem("bbb_profile", JSON.stringify(p));
            localStorage.setItem("bbb_onboarded", "1");
          } catch {}
          setProfile(p);
        }}
      />

      {!profile ? (
        <div className="p-6">
          <h1 className="text-xl font-bold">Welcome to Better Bite Buddy</h1>
          <p className="text-sm mt-2" style={{ color: "var(--bbb-ink-dim)" }}>
            Complete the quick setup to personalize your coach.
          </p>
          <ReopenSetupButton />
        </div>
      ) : (
        <div className="h-dvh">
          <NativeChat />
        </div>
      )}

      {/* Small badge so you can verify at a glance; remove later */}
      <div className="fixed bottom-2 right-2 z-50 text-xs opacity-70 bg-black/30 dark:bg-white/10 px-2 py-1 rounded">
        usePickaxe: {String(FEATURES.usePickaxe)}
      </div>
    </>
  );
}
