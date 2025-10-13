// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import PickaxeEmbed from "@/components/PickaxeEmbed";
import OnboardingWizard from "@/components/OnboardingWizard";
import UpgradeFab from "@/components/UpgradeFab";
import MobileUpgradeBar from "@/components/MobileUpgradeBar";

export default function Page() {
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // manual open via console:
    (window as any).bbbOpenOnboarding = () => {
      localStorage.removeItem("bbb_onboarding_dismissed_v1");
      setShowWizard(true);
    };

    const onboarded = localStorage.getItem("bbb_onboarded") === "1";
    const dismissed = localStorage.getItem("bbb_onboarding_dismissed_v1") === "1";
    const urlHasOnboard = /[?&]onboard=1/.test(window.location.search);

    setShowWizard(urlHasOnboard || (!onboarded && !dismissed));
  }, []);

  return (
    <main className="relative min-h-[100svh]">
      {/* CONTENT: on mobile we add bottom padding so the mobile bar never covers the iframe composer.
         On desktop we keep it absolute/full-bleed. */}
      <div className="pb-[calc(56px+env(safe-area-inset-bottom,0px))] md:pb-0 md:absolute md:inset-0">
        <PickaxeEmbed />
      </div>

      {/* Onboarding overlay */}
      {showWizard && (
        <OnboardingWizard
          autoOpen
          onClose={() => {
            localStorage.setItem("bbb_onboarding_dismissed_v1", "1");
            setShowWizard(false);
          }}
          onComplete={() => {
            localStorage.setItem("bbb_onboarded", "1");
            localStorage.removeItem("bbb_onboarding_dismissed_v1");
            setShowWizard(false);
          }}
        />
      )}

      {/* mobile-only bottom bar + desktop-only FAB */}
      <MobileUpgradeBar />
      <UpgradeFab />
    </main>
  );
}
