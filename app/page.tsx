"use client";
import { useEffect, useState } from "react";

// ✅ default import (your file exports default)
import ReopenSetupButton from "@/app/components/ReopenSetupButton";
// ✅ your component takes { onComplete }
import OnboardingGate from "@/app/components/OnboardingGate";

// If you already have a Pickaxe script-embed component, keep importing it.
// Otherwise, paste the script embed snippet into this page (NOT an iframe).
import PickaxeEmbed from "@/app/components/PickaxeEmbed"; // if you have it

export default function Page() {
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // global to re-open the modal from the “Complete setup” button
    (window as any).bbbOpenOnboarding = () => {
      localStorage.removeItem("bbb_onboarding_dismissed");
      setShowGate(true);
    };

    const onboarded = localStorage.getItem("bbb_onboarded") === "1";
    const dismissed = localStorage.getItem("bbb_onboarding_dismissed") === "1";
    setShowGate(!onboarded && !dismissed);
  }, []);

  return (
    <>
      {/* IMPORTANT: use the Pickaxe **script embed**, not an iframe */}
      <PickaxeEmbed />
      <ReopenSetupButton />

      {showGate && (
        <OnboardingGate
          onComplete={() => {
            // when the form is finished, mark as onboarded and hide
            localStorage.setItem("bbb_onboarded", "1");
            localStorage.removeItem("bbb_onboarding_dismissed");
            window.dispatchEvent(new Event("bbb:onboarded"));
            setShowGate(false);
          }}
        />
      )}
    </>
  );
}
