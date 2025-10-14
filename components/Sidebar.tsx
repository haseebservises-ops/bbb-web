"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronLeft,
  User,
  Rocket,
} from "lucide-react";
import { IS_PROD } from "@/lib/env";

type IconProps = { size?: number; className?: string };
type IconComp = ComponentType<IconProps>;
type NavItem = { href: string; label: string; Icon: IconComp; accent?: boolean };

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

  const items: NavItem[] = [
    { href: "/",        label: "New chat", Icon: MessageSquare },
    { href: "/profile", label: "Profile",  Icon: User },
    { href: "/settings",label: "Settings", Icon: Settings },
    { href: "/upgrade", label: "Upgrade",  Icon: Rocket, accent: true },
  ];

  return (
    <aside
      className={[
        "hidden sm:flex shrink-0 transition-[width] duration-300 ease-out border-r backdrop-blur",
        collapsed ? "w-16" : "w-64",
        // light: soft gradient; dark: richer gradient
        "bg-gradient-to-b from-white to-slate-50",
        "dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950",
      ].join(" ")}
      style={{ borderColor: "var(--bbb-lines)" }}
    >
      <div className="p-3 w-full flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between mb-3">
          {!collapsed && (
        <div className="text-sm font-semibold tracking-wide">
          Better Bite Buddy<span className="align-super text-[10px] ml-0.5">TM</span>
        </div>
          )}
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
          {items.map(({ href, label, Icon, accent }) => {
            const active = pathname === href;

            const base =
              "group relative flex items-center gap-2 rounded-xl px-3 py-2 transition-all";
            const inactive =
              "text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5";
            const activePill =
              "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_8px_24px_-8px_rgba(124,58,237,.55)]";

            return (
              <Link
                key={href}
                href={href}
                className={[
                  base,
                  active ? activePill : inactive,
                  accent && !active
                    ? "ring-1 ring-violet-300/60 hover:ring-violet-400/70"
                    : "",
                ].join(" ")}
              >
                {/* left indicator (only visible when active) */}
                <span
                  className={[
                    "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded",
                    active ? "bg-white/90" : "bg-violet-500/0",
                  ].join(" ")}
                />
                <Icon
                  size={18}
                  className={[
                    "transition-colors",
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400",
                  ].join(" ")}
                />
                {!collapsed && (
                  <span className="translate-x-0 group-hover:translate-x-[1px] transition-transform">
                    {label}
                  </span>
                )}

                {/* tiny “NEW” tag for Upgrade when not active */}
                {accent && !active && !collapsed && (
                  <span className="ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin shortcuts (non-prod only) */}
          {!IS_PROD && canSeeAdmin && (
            <Link
              href="/admin"
              className="group relative flex items-center gap-2 rounded-xl px-3 py-2 transition-all text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="text-slate-400 group-hover:text-violet-600 transition-colors">
                🛠️
              </span>
              {!collapsed && <span>Admin</span>}
            </Link>
          )}
          {!IS_PROD && isSuper && (
            <Link
              href="/superadmin"
              className="group relative flex items-center gap-2 rounded-xl px-3 py-2 transition-all text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="text-slate-400 group-hover:text-violet-600 transition-colors">
                🧰
              </span>
              {!collapsed && <span>Superadmin</span>}
            </Link>
          )}
        </nav>

        {/* footer spacer */}
        <div className="mt-auto pt-3 border-t" style={{ borderColor: "var(--bbb-lines)" }} />
      </div>
    </aside>
  );
}
<div className="text-sm font-semibold tracking-wide">
  Better Bite Buddy
</div>
