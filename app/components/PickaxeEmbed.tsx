// app/components/PickaxeEmbed.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Props = { className?: string };

export default function PickaxeEmbed({ className = "" }: Props) {
  // Pickaxe embed you already had
  const BASE = "https://betterbitebuddy.com/_embed/MAQHKV3CSQ";
  const DEPLOY = "deployment-6ec59824-4391-48ae-87db-6452f60b4099";

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const html = document.documentElement;
    const get = () =>
      (html.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(get());
    const obs = new MutationObserver(() => setTheme(get()));
    obs.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const src = useMemo(() => {
    const url = new URL(BASE);
    url.searchParams.set("d", DEPLOY);
    url.searchParams.set("theme", theme);
    return url.toString();
  }, [theme]);

  // IMPORTANT: no card wrapper, no padding — just a container that can fill
  return (
    <div id="pickaxe-container" className={`w-full h-full ${className}`}>
      <iframe
        src={src}
        className="w-full h-full block"
        style={{ border: 0, borderRadius: 0, background: "transparent" }}
        allow="microphone"
      />
    </div>
  );
}
useEffect(() => {
  function onMsg(e: MessageEvent) {
    const d: any = e.data;
    // try common shapes
    const maybe =
      d?.email ||
      d?.user?.email ||
      (d?.type && /user/i.test(d.type) && (d?.payload?.email || d?.data?.email));
    if (maybe && typeof maybe === "string") {
      try { localStorage.setItem("bbb_email", maybe); } catch {}
    }
  }
  window.addEventListener("message", onMsg);
  return () => window.removeEventListener("message", onMsg);
}, []);
