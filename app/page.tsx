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
      {/* On mobile (default), this is STATIC with bottom padding so the bar never covers the composer.
          On ≥sm, it becomes absolute/inset-0 to keep your desktop layout untouched. */}
      <div className="pb-[calc(56px+env(safe-area-inset-bottom,0px))] sm:pb-0 sm:absolute sm:inset-0">
        <PickaxeEmbed />
      </div>

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

      {/* Mobile bottom bar + Desktop FAB */}
      <MobileUpgradeBar />
      <UpgradeFab />
    </main>
  );
}
