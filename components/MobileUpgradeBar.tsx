"use client";
import Link from "next/link";

export default function MobileUpgradeBar() {
  return (
    <div className="fixed md:hidden left-0 right-0 bottom-0 z-40
                    bg-white/95 backdrop-blur border-t">
      <div className="mx-auto max-w-3xl px-3 py-2 flex justify-end">
        <Link
          href="/upgrade"
          className="rounded-full px-4 py-2 text-sm font-semibold bg-violet-600 text-white"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
