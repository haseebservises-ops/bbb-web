// lib/env.ts
export const ENV =
  process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development"; // "production" | "preview" | "development"

export const IS_PROD = ENV === "production";
export const IS_PREVIEW = ENV === "preview";
export const IS_DEV = !IS_PROD && !IS_PREVIEW;

export const PICKAXE_URL = process.env.NEXT_PUBLIC_PICKAXE_URL ?? "";

// tiny helper
function bool(v?: string, fallback = false) {
  if (v == null) return fallback;
  const s = v.toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

/** All feature gates live here */
export const FEATURES = {
  // Prod shows Pickaxe by default. You can force either side locally with the env var if needed.
  usePickaxe: IS_PROD || bool(process.env.NEXT_PUBLIC_USE_PICKAXE, false),

  // Hide top/bottom chrome in prod; show app sidebar in non-prod.
  hideChrome: IS_PROD,
  showSidebar: !IS_PROD,
} as const;
