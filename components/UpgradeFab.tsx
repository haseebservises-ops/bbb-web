"use client";
import Link from "next/link";

export default function UpgradeFab() {
  return (
    <Link
      href="/upgrade"
      className="fixed bottom-5 right-5 z-[9999] rounded-full px-5 py-3 font-bold shadow-xl
                 bg-violet-600 text-white hover:brightness-110"
    >
      Upgrade
    </Link>
  );
}
