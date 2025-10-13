"use client";
import Link from "next/link";

export default function UpgradeFab() {
  return (
    <Link
      href="/upgrade"
      className="hidden md:inline-flex fixed
                 bottom-[calc(env(safe-area-inset-bottom,0px)+20px)]
                 right-[calc(env(safe-area-inset-right,0px)+20px)]
                 z-40 rounded-full px-5 py-3 font-bold shadow-xl
                 bg-violet-600 text-white hover:brightness-110"
    >
      Upgrade
    </Link>
  );
}
