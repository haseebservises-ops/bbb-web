// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import OnboardingGate from "@/app/components/OnboardingGate";
import PickaxeEmbed from "@/app/components/PickaxeEmbed";

export default function Page() {
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (window as any).bbbOpenOnboarding = () => {
      localStorage.removeItem("bbb_onboarding_dismissed");
      setShowGate(true);
    };

    const onboarded = localStorage.getItem("bbb_onboarded") === "1";
    const dismissed = localStorage.getItem("bbb_onboarding_dismissed") === "1";
    setShowGate(!onboarded && !dismissed);
  }, []);

  return (
    <main className="relative min-h-screen">
      {/* Pickaxe takes the whole center panel */}
      <PickaxeEmbed className="absolute inset-0" />

      {showGate && (
        <OnboardingGate
          onComplete={() => {
            localStorage.setItem("bbb_onboarded", "1");
            localStorage.removeItem("bbb_onboarding_dismissed");
            window.dispatchEvent(new Event("bbb:onboarded"));
            setShowGate(false);
          }}
        />
      )}
    </main>
  );
}
