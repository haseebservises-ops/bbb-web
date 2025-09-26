// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const nav = [
    { href: "/", label: "New chat" },
    { href: "/history", label: "Chat history" },
    { href: "/settings", label: "Settings" },
    { href: "/upgrade", label: "Upgrade" },
  ];

  return (
    <aside
      className="hidden sm:flex w-64 shrink-0 border-r"
      style={{ borderColor: "var(--bbb-lines)" }}
    >
      <div className="p-4 w-full">
        <div className="text-sm font-semibold mb-3">Better Bite Buddy</div>

        <nav className="space-y-1">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`block rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 ${
                pathname === i.href ? "font-semibold" : ""
              }`}
            >
              {i.label}
            </Link>
          ))}
        </nav>

        <div
          className="mt-4 pt-4 border-t"
          style={{ borderColor: "var(--bbb-lines)" }}
        >
          <Link
            href="/auth/signin"
            className="block rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>
      </div>
    </aside>
  );
}
