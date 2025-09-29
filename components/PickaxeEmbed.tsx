// components/PickaxeEmbed.tsx
"use client";

import { useMemo } from "react";
import { PICKAXE_URL } from "@/lib/env";

/**
 * Full-bleed, responsive Pickaxe iFrame.
 * - Accepts either /_embed/... or /embed/... and normalizes to /_embed/ to avoid redirect.
 * - Fills the parent container (so put it in a h-dvh wrapper).
 */
export default function PickaxeEmbed({ src }: { src?: string }) {
  const url = useMemo(() => {
    const raw = (src || PICKAXE_URL || "").trim();
    if (!raw) return "";

    // normalize /embed/ -> /_embed/ so it always stays inside the iframe
    try {
      const u = new URL(raw);
      u.pathname = u.pathname.replace(/\/embed\//, "/_embed/");
      return u.toString();
    } catch {
      // if NEXT_PUBLIC_PICKAXE_URL wasn't a full URL for some reason
      return raw.replace(/\/embed\//, "/_embed/");
    }
  }, [src]);

  if (!url) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm">
        <div className="max-w-md text-center space-y-2">
          <div className="font-semibold">Missing NEXT_PUBLIC_PICKAXE_URL</div>
          <div className="opacity-70">
            Paste your Pickaxe <code>Share → Embed</code> URL in Vercel as
            <code> NEXT_PUBLIC_PICKAXE_URL</code>.
            <br />
            Tip: both <code>/embed/…</code> and <code>/_embed/…</code> are accepted;
            we’ll normalize to <code>/_embed/</code> automatically.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-dvh">
      <iframe
        src={url}
        title="Better Bite Buddy"
        className="w-full h-full border-0 rounded-md"
        // feel free to add/remove capabilities
        allow="microphone; clipboard-read; clipboard-write; camera; display-capture; fullscreen"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
