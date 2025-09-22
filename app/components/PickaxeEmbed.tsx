"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Pickaxe chat iframe that follows your light/dark theme.
 * - We can’t style inside the iframe, but we pass ?theme=light|dark so Pickaxe
 *   can use it if supported. If not supported, it safely no-ops.
 * - Height is responsive; adjust the clamp if you want it taller/shorter.
 */
export default function PickaxeEmbed() {
  // Your embed base + deployment param (from your message)
  const BASE = "https://betterbitebuddy.com/_embed/MAQHKV3CSQ";
  const DEPLOY = "deployment-6ec59824-4391-48ae-87db-6452f60b4099";

  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // read theme from <html data-theme="...">
  useEffect(() => {
    const html = document.documentElement;
    const get = () =>
      (html.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(get());

    // Observe changes (your ThemeToggle flips data-theme)
    const obs = new MutationObserver(() => setTheme(get()));
    obs.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const src = useMemo(() => {
    const url = new URL(BASE);
    url.searchParams.set("d", DEPLOY);
    url.searchParams.set("theme", theme); // harmless if Pickaxe ignores it
    return url.toString();
  }, [theme]);

  return (
    <div
      className="bbb-card"
      style={{
        padding: 12,
        borderRadius: "var(--radius-2xl)",
        border: `1px solid var(--bbb-lines)`,
        background: "var(--bbb-surface)",
      }}
    >
      <iframe
        src={src}
        style={{
          width: "100%",
          height: "clamp(520px, 75vh, 720px)",
          maxWidth: 900,
          display: "block",
          marginInline: "auto",
          border: 0,
          borderRadius: "12px",
          background: "var(--bbb-elev1)",
        }}
        allow="microphone"
        // sandbox keeps it secure; loosen if Pickaxe needs more
        // sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
      />
    </div>
  );
}
