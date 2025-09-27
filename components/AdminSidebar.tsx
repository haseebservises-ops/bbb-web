"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/studio", label: "Studio details" },
    { href: "/admin/knowledge", label: "Knowledge base" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/mailing", label: "Mailing" },
    { href: "/admin/history", label: "History" },
    { href: "/admin/domain", label: "Domain" },
    { href: "/admin/access", label: "Access" },
    { href: "/admin/products", label: "Products & Paywalls" },
  ];

  return (
    <aside className="w-64 shrink-0 border-r" style={{ borderColor: "var(--bbb-lines)" }}>
      <div className="p-4">
        <div className="text-sm font-semibold mb-3">Admin</div>
        <nav className="space-y-1">
          {items.map(i => (
            <Link key={i.href} href={i.href}
              className={`block rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 ${
                pathname === i.href ? "font-semibold" : ""
              }`}>
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
