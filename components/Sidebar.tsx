"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ThemeToggle from "@/app/components/ThemeToggle";
import { MessageSquare, Clock, Settings, Crown, ChevronRight, ChevronLeft, User } from "lucide-react";
import { IS_PROD } from "@/lib/env";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // IMPORTANT: don't destructure from useSession() directly (can be undefined during SSG/404)
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
    try { localStorage.setItem("bbb_sidebar_collapsed", next ? "1" : "0"); } catch {}
  }

  const items = [
    { href: "/", label: "New chat", icon: <MessageSquare size={18} /> },
    { href: "/history", label: "Chat history", icon: <Clock size={18} /> },
    { href: "/settings", label: "Settings", icon: <Settings size={18} /> },
    { href: "/upgrade", label: "Upgrade", icon: <Crown size={18} /> },
  ];

  return (
    <aside
      className={`hidden sm:flex ${collapsed ? "w-14" : "w-64"} shrink-0 border-r`}
      style={{ borderColor: "var(--bbb-lines)" }}
    >
      <div className="p-3 w-full flex flex-col">
        {/* top row */}
        <div className="flex items-center justify-between mb-3">
          {!collapsed && <div className="text-sm font-semibold">Better Bite Buddy</div>}
          <button
            className="rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={toggle}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* nav */}
        <nav className="space-y-1">
          {items.map(i => {
            const active = pathname === i.href;
            return (
              <Link key={i.href} href={i.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 ${active ? "font-semibold" : ""}`}>
                <span className="shrink-0">{i.icon}</span>
                {!collapsed && <span>{i.label}</span>}
              </Link>
            );
          })}

          {/* Admin shortcuts (non‑prod only) */}
          {!IS_PROD && canSeeAdmin && (
            <Link href="/admin"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
              <span className="shrink-0">🛠️</span>
              {!collapsed && <span>Admin</span>}
            </Link>
          )}
          {!IS_PROD && isSuper && (
            <Link href="/superadmin"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
              <span className="shrink-0">🧰</span>
              {!collapsed && <span>Superadmin</span>}
            </Link>
          )}
        </nav>

        {/* bottom controls */}
        <div className="mt-auto pt-3 border-t" style={{ borderColor: "var(--bbb-lines)" }}>
          <div className="flex items-center justify-between">
            <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
              <User size={18} />
              {!collapsed && <span>Profile</span>}
            </Link>
            <div className="px-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
