"use client";

import React, { useEffect, useState } from "react";
import PickaxeEmbed from "./components/PickaxeEmbed";
import OnboardingGate, { BBBProfile } from "./components/OnboardingGate";
import ReopenSetupButton from "./components/ReopenSetupButton";
import { FEATURES } from "@/lib/env";
import NativeChat from "@/components/NativeChat"; // you'll use this in preview



/* -------------------------------------------------------
   Single main panel: header + Pickaxe chat
-------------------------------------------------------- */
function CoachApp({ profile }: { profile: BBBProfile }) {
  return (
    <div className="bbb-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold">Better Bite Buddy</div>
        <div className="hidden sm:flex gap-2">
          <a href="/upgrade" className="btn btn-ghost">Upgrade: Starter</a>
          <a href="/upgrade" className="btn btn-primary">Upgrade: Pro</a>
        </div>
      </div>

      <PickaxeEmbed />
    </div>
  );
}

/* -------------------------------------------------------
   Page
-------------------------------------------------------- */
export default function Page() {

  
  const [profile, setProfile] = useState<BBBProfile | null>(null);

  // If user already onboarded, restore a profile so chat shows after nav/refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("bbb_onboarded") === "1") {
      // If we stored a full profile earlier, use it; else create a minimal one
      const stored = localStorage.getItem("bbb_profile");
      if (stored) {
        try {
          setProfile(JSON.parse(stored) as BBBProfile);
          return;
        } catch {
          // fall through to minimal
        }
      }
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
          try { localStorage.setItem("bbb_profile", JSON.stringify(p)); } catch {}
          setProfile(p);
        }}
      />

      {!profile ? (
        <div className="p-6">
          <h1 className="text-xl font-bold">Welcome to Better Bite Buddy</h1>
          <p className="text-sm mt-2" style={{ color: "var(--bbb-ink-dim)" }}>
            Complete the quick setup to personalize your coach.
          </p>

          {/* Only shows if user closed the form without finishing */}
          <ReopenSetupButton />
        </div>
      ) : (
        <CoachApp profile={profile} />
      )}

    </>
  );
}
