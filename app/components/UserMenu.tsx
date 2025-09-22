"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signIn, signOut } from "next-auth/react";


type Profile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string; // data URL
};

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [profile, setProfile] = useState<Profile>({});
  const ref = useRef<HTMLDivElement>(null);

  function load() {
    const ob = typeof window !== "undefined" && localStorage.getItem("bbb_onboarded") === "1";
    setOnboarded(ob);
    try {
      const stored = localStorage.getItem("bbb_profile");
      setProfile(stored ? JSON.parse(stored) : {});
    } catch {
      setProfile({});
    }
  }

  useEffect(() => {
    load();
    const onUpdate = () => load();
    const onStorage = () => load();
    const clickAway = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener("bbb:profile-updated", onUpdate as EventListener);
    window.addEventListener("bbb:onboarded", onUpdate as EventListener);
    window.addEventListener("storage", onStorage);
    document.addEventListener("click", clickAway);

    return () => {
      window.removeEventListener("bbb:profile-updated", onUpdate as EventListener);
      window.removeEventListener("bbb:onboarded", onUpdate as EventListener);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("click", clickAway);
    };
  }, [open]);

        if (!onboarded) {
          return (
            <button
              className="btn btn-ghost"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              Sign in with Google
            </button>
          );
        }



  const initials = (profile.firstName?.[0] || "") + (profile.lastName?.[0] || "");

  return (
    <div ref={ref} className="relative">
      <button
        className="h-8 w-8 rounded-full overflow-hidden border"
        style={{ borderColor: "var(--bbb-lines)", background: "var(--bbb-elev1)" }}
        onClick={() => setOpen(v => !v)}
        aria-label="Profile"
      >
        {profile.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.image} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-semibold grid place-items-center h-full w-full" style={{ color: "var(--bbb-ink)" }}>
            {initials || "🙂"}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-xl border shadow-lg text-sm"
          style={{ background: "var(--bbb-surface)", borderColor: "var(--bbb-lines)" }}
        >
          <Link href="/profile" className="block px-3 py-2 hover:bg-black/5">Edit profile</Link>
          <button
            className="block w-full text-left px-3 py-2 hover:bg-black/5"
            onClick={async () => {
              try {
                localStorage.removeItem("bbb_onboarded");
                localStorage.removeItem("bbb_profile");
                localStorage.removeItem("bbb_onboarding_dismissed");
              } catch {}
              await signOut({ callbackUrl: "/" });
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
