// app/components/ReopenSetupButton.tsx
"use client";
import { useEffect, useState } from "react";

const LS_ONBOARDED = "bbb_onboarded";

export default function ReopenSetupButton() {
  const [show, setShow] = useState(false);

  function refresh() {
    setShow(typeof window !== "undefined" && localStorage.getItem(LS_ONBOARDED) !== "1");
  }

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("storage", onChange);
    window.addEventListener("bbb:onboarded" as any, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("bbb:onboarded" as any, onChange);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="bbb-card p-3 md:p-4 flex items-center justify-between gap-3">
      <div className="text-sm">
        <div className="font-medium">Welcome to Better Bite Buddy</div>
        <div className="opacity-80">Complete the quick setup to personalize your coach.</div>
      </div>
      <button className="btn btn-primary" onClick={() => window.bbbOpenOnboarding?.()}>
        Complete setup
      </button>
    </div>
  );
}
