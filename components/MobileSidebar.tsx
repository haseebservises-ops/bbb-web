"use client";
import { useState, useEffect } from "react";

export default function MobileSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger */}
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden fixed left-3 top-3 z-50 rounded-full p-2 bg-white/90 shadow"
      >
        ☰
      </button>

      {/* Drawer + overlay */}
      <div className={`md:hidden fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl transition-transform duration-300
                      ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          {children}
        </aside>
      </div>
    </>
  );
}
