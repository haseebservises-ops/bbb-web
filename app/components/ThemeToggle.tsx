// app/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";
const KEY = "bbb_theme";

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");

  // Initialize from <html data-theme> that the init script set
  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Mode) || "light";
    setMode(current);
    // sync meta theme-color once on mount
    updateThemeColor(current);
  }, []);

  function updateThemeColor(next: Mode) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#0b1422" : "#ffffff");
  }

  function apply(next: Mode) {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    updateThemeColor(next);
    setMode(next);
  }

  const nextMode: Mode = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={() => apply(nextMode)}
      aria-pressed={mode === "dark"}
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span aria-hidden>{mode === "dark" ? "🌙" : "☀️"}</span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
