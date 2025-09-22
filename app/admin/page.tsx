"use client";

import { useEffect, useState } from "react";
import type { BBBProfile } from "../components/OnboardingGate";

export default function AdminPage(){
  const [profile, setProfile] = useState<BBBProfile | null>(null);
  const [dismisses, setDismisses] = useState(0);

  useEffect(()=>{
    const p = localStorage.getItem("bbb_profile");
    setProfile(p ? JSON.parse(p) : null);
    setDismisses(Number(localStorage.getItem("bbb_upgrade_dismiss") || "0"));
  },[]);

  return (
    <div className="bbb-card p-5">
      <h1 className="text-lg font-semibold mb-3">Admin (dev-only)</h1>
      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify({ profile, upgrade_dismisses: dismisses }, null, 2)}</pre>
    </div>
  );
}
