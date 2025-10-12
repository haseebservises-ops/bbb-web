"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Settings, ChevronRight, ChevronLeft, User, Rocket } from "lucide-react";
import { IS_PROD } from "@/lib/env";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const ses = useSession();
  const role = (ses?.data?.user as any)?.role ?? "user";
  const canSeeAdmin = role === "admin" || role === "superadmin";
  const isSuper = role === "superadmin";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bbb_sidebar_collapsed");
      if (saved) setCollapsed(saved === "1");
    } catch {}
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("bbb_sidebar_collapsed", next ? "1" : "0");
    } catch {}
  }

  const items = [
    { href: "/", label: "New chat", icon: <MessageSquare size={18} /> },
    { href: "/settings", label: "Settings", icon: <Settings size={18} /> },
    // Upgrade goes to your in-app page that lists plans (or straight to a payment link)
    { href: "/upgrade", label: "Upgrade", icon: <Rocket size={18} />, accent: true },
  ];

  return (
    <aside
      className={`hidden sm:flex transition-[width] duration-200 ${collapsed ? "w-14" : "w-64"} shrink-0 border-r bg-white/70 backdrop-blur-md dark:bg-black/30`}
      style={{ borderColor: "var(--bbb-lines)" }}
    >
      <div className="p-3 w-full flex flex-col">
        {/* top row: app name + collapse */}
        <div className="flex items-center justify-between mb-3">
          {!collapsed && <div className="text-sm font-semibold tracking-wide">Better Bite Buddy</div>}
          <button
            className="rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5 transition"
            onClick={toggle}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* nav */}
        <nav className="space-y-1">
          {items.map((i) => {
            const active = pathname === i.href;
            return (
              <Link
                key={i.href}
                href={i.href}
                className={[
                  "group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                  "hover:bg-black/[.06] dark:hover:bg-white/[.06]",
                  active ? "font-semibold" : "",
                  i.accent ? "ring-1 ring-violet-300/50 hover:ring-violet-400/60" : "",
                ].join(" ")}
              >
                <span className="shrink-0 transition-transform group-hover:scale-[1.06]">{i.icon}</span>
                {!collapsed && <span>{i.label}</span>}
              </Link>
            );
          })}

          {/* Admin shortcuts (non-prod only) */}
          {!IS_PROD && canSeeAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="shrink-0">🛠️</span>
              {!collapsed && <span>Admin</span>}
            </Link>
          )}
          {!IS_PROD && isSuper && (
            <Link
              href="/superadmin"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="shrink-0">🧰</span>
              {!collapsed && <span>Superadmin</span>}
            </Link>
          )}
        </nav>

        {/* bottom controls */}
        <div className="mt-auto pt-3 border-t" style={{ borderColor: "var(--bbb-lines)" }}>
          <Link
            href="/settings"
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition"
            title="Profile"
          >
            <span className="flex items-center gap-2">
              <User size={18} />
              {!collapsed && <span>Profile</span>}
            </span>
            {/* tiny dot accent on hover */}
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
