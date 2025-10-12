"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { MessageSquare, Settings, ChevronRight, ChevronLeft, User } from "lucide-react";
import { IS_PROD } from "@/lib/env";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const ses = useSession();
  const role = (ses?.data?.user as any)?.role ?? "user";
  const canSeeAdmin = role === "admin" || role === "superadmin";
  const isSuper = role === "superadmin";

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("bbb_sidebar_collapsed") : null;
    if (saved) setCollapsed(saved === "1");
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("bbb_sidebar_collapsed", next ? "1" : "0"); } catch {}
  }

  const items = [
    { href: "/", label: "New chat", icon: <MessageSquare size={18} /> },
    { href: "/settings", label: "Settings", icon: <Settings size={18} /> },
    { href: "/upgrade", label: "Upgrade", icon: <span className="text-violet-600">★</span> },
  ];

  return (
    <motion.aside
      initial={{ width: 256, opacity: 0 }}
      animate={{ width: collapsed ? 56 : 256, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="hidden sm:flex shrink-0 border-r bg-white/70 dark:bg-slate-900/40 backdrop-blur"
      style={{ borderColor: "var(--bbb-lines)" }}
    >
      <div className="p-3 w-full flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between mb-3">
          {!collapsed && <div className="text-sm font-semibold">Better Bite Buddy</div>}
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={toggle}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </motion.button>
        </div>

        {/* nav */}
        <nav className="space-y-1">
          {items.map((i) => {
            const active = pathname === i.href;
            return (
              <motion.div key={i.href} whileHover={{ x: 2 }}>
                <Link
                  href={i.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition
                              hover:bg-black/5 dark:hover:bg-white/5 ${active ? "font-semibold" : ""}`}
                >
                  <span className="shrink-0">{i.icon}</span>
                  {!collapsed && <span>{i.label}</span>}
                </Link>
              </motion.div>
            );
          })}

          {/* Admin shortcuts only in non-prod */}
          {!IS_PROD && canSeeAdmin && (
            <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
              <span className="shrink-0">🛠️</span>{!collapsed && <span>Admin</span>}
            </Link>
          )}
          {!IS_PROD && isSuper && (
            <Link href="/superadmin" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
              <span className="shrink-0">🧰</span>{!collapsed && <span>Superadmin</span>}
            </Link>
          )}
        </nav>

        {/* bottom */}
        <div className="mt-auto pt-3 border-t" style={{ borderColor: "var(--bbb-lines)" }}>
          <div className="flex items-center justify-between">
            <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5" title="Profile">
              <User size={18} />{!collapsed && <span>Profile</span>}
            </Link>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
