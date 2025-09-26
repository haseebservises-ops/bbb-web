// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FEATURES } from "@/lib/env";
import PickaxeEmbed from "@/components/PickaxeEmbed";
import NativeChat from "@/components/NativeChat";
import OnboardingGate, { BBBProfile } from "./components/OnboardingGate";
import ReopenSetupButton from "./components/ReopenSetupButton";

export default function Page() {
  // Production → full-screen Pickaxe, nothing else
  if (FEATURES.usePickaxe) {
    return <PickaxeEmbed />;
  }

  // Staging/Preview/Local path
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
      setProfile({
        firstName: "", lastName: "", email: "", mobile: "",
        archetype: "", heightInches: "", weightLbs: "",
        goals: [], agreed: true,
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
        // Minimal message until onboarding is done. No box, no duplicate buttons.
        <div className="p-6">
          <h1 className="text-xl font-bold">Welcome to Better Bite Buddy</h1>
          <p className="text-sm mt-2" style={{ color: "var(--bbb-ink-dim)" }}>
            Complete the quick setup to personalize your coach.
          </p>
          <ReopenSetupButton />
        </div>
      ) : (
        // Full-height native chat, clean
        <div className="h-dvh">
          <NativeChat />
        </div>
      )}
    </>
  );
}
