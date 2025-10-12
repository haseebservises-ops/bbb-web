// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import PickaxeEmbed from "@/app/components/PickaxeEmbed";
import OnboardingWizard from "@/components/OnboardingWizard";

export default function Page() {
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // allow manual open via console: window.bbbOpenOnboarding()
    (window as any).bbbOpenOnboarding = () => {
      localStorage.removeItem("bbb_onboarding_dismissed");
      setShowWizard(true);
    };

    const onboarded = localStorage.getItem("bbb_onboarded") === "1";
    const dismissed = localStorage.getItem("bbb_onboarding_dismissed") === "1";
    // auto-open via ?onboard=1
    const urlHasOnboard = /[?&]onboard=1/.test(window.location.search);

    setShowWizard(urlHasOnboard || (!onboarded && !dismissed));
  }, []);

  return (
    <main className="relative min-h-screen">
      <PickaxeEmbed className="absolute inset-0" />

      {showWizard && (
        <OnboardingWizard
          autoOpen
          onClose={() => {
            localStorage.setItem("bbb_onboarding_dismissed", "1");
            setShowWizard(false);
          }}
          onComplete={() => {
            localStorage.setItem("bbb_onboarded", "1");
            localStorage.removeItem("bbb_onboarding_dismissed");
            setShowWizard(false);
            // optional: window.location.reload();
          }}
        />
      )}
    </main>
  );
}
// app/page.tsx (near bottom of the component)
import UpgradeButton from "@/components/UpgradeButton";

export default function Page() {
  // ...your existing code
  return (
    <main className="relative min-h-screen">
      {/* BBB chat / Pickaxe embed */}
      <PickaxeEmbed className="absolute inset-0" />

      {/* Floating Upgrade */}
      <UpgradeButton />
    </main>
  );
}
import UpgradeFab from "@/components/UpgradeFab";

export default function Page() {
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onboarded = localStorage.getItem("bbb_onboarded") === "1";
    const dismissed = localStorage.getItem("bbb_onboarding_dismissed_v1") === "1";
    setShowGate(!onboarded && !dismissed);

    (window as any).bbbOpenOnboarding = () => {
      localStorage.removeItem("bbb_onboarding_dismissed_v1");
      setShowGate(true);
    };
  }, []);

  return (
    <main className="relative min-h-screen">
      <PickaxeEmbed className="absolute inset-0" />

      {showGate && (
        <OnboardingWizard
          autoOpen
          onClose={() => setShowGate(false)}
          onComplete={() => {
            localStorage.setItem("bbb_onboarded", "1");
            setShowGate(false);
          }}
        />
      )}

      <UpgradeFab />
    </main>
  );
}


// // app/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import PickaxeEmbed from "@/app/components/PickaxeEmbed";
// import OnboardingWizard from "@/components/OnboardingWizard";

// export default function Page() {
//   const [showWizard, setShowWizard] = useState(false);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     // allow manual open via console: window.bbbOpenOnboarding()
//     (window as any).bbbOpenOnboarding = () => {
//       localStorage.removeItem("bbb_onboarding_dismissed");
//       setShowWizard(true);
//     };

//     const onboarded = localStorage.getItem("bbb_onboarded") === "1";
//     const dismissed = localStorage.getItem("bbb_onboarding_dismissed") === "1";
//     // auto-open via ?onboard=1
//     const urlHasOnboard = /[?&]onboard=1/.test(window.location.search);

//     setShowWizard(urlHasOnboard || (!onboarded && !dismissed));
//   }, []);

//   return (
//     <main className="relative min-h-screen">
//       <PickaxeEmbed className="absolute inset-0" />

//       {showWizard && (
//         <OnboardingWizard
//           autoOpen
//           onClose={() => {
//             localStorage.setItem("bbb_onboarding_dismissed", "1");
//             setShowWizard(false);
//           }}
//           onComplete={() => {
//             localStorage.setItem("bbb_onboarded", "1");
//             localStorage.removeItem("bbb_onboarding_dismissed");
//             setShowWizard(false);
//             // optional: window.location.reload();
//           }}
//         />
//       )}
//     </main>
//   );
// }
// // app/page.tsx (near bottom of the component)
// import UpgradeButton from "@/components/UpgradeButton";

// export default function Page() {
//   // ...your existing code
//   return (
//     <main className="relative min-h-screen">
//       {/* BBB chat / Pickaxe embed */}
//       <PickaxeEmbed className="absolute inset-0" />

//       {/* Floating Upgrade */}
//       <UpgradeButton />
//     </main>
//   );
// }
// import UpgradeFab from "@/components/UpgradeFab";

// export default function Page() {
//   const [showGate, setShowGate] = useState(false);

//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     const onboarded = localStorage.getItem("bbb_onboarded") === "1";
//     const dismissed = localStorage.getItem("bbb_onboarding_dismissed_v1") === "1";
//     setShowGate(!onboarded && !dismissed);

//     (window as any).bbbOpenOnboarding = () => {
//       localStorage.removeItem("bbb_onboarding_dismissed_v1");
//       setShowGate(true);
//     };
//   }, []);

//   return (
//     <main className="relative min-h-screen">
//       <PickaxeEmbed className="absolute inset-0" />

//       {showGate && (
//         <OnboardingWizard
//           autoOpen
//           onClose={() => setShowGate(false)}
//           onComplete={() => {
//             localStorage.setItem("bbb_onboarded", "1");
//             setShowGate(false);
//           }}
//         />
//       )}

//       <UpgradeFab />
//     </main>
//   );
// }
