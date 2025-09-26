// lib/env.ts
export const ENV =
  (process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development") as
    | "production"
    | "preview"
    | "development";

export const IS_PROD = ENV === "production";
export const IS_PREVIEW = ENV === "preview";
export const IS_DEV = !IS_PROD && !IS_PREVIEW;

export const PICKAXE_URL = process.env.NEXT_PUBLIC_PICKAXE_URL ?? "";

// tiny helper
function bool(v?: string | null, fallback = false) {
  if (v == null) return fallback;
  const s = v.toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

/**
 * Overrides for non-prod only (handy for quick tests):
 *  - NEXT_PUBLIC_FORCE_NATIVE=1     → force NativeChat on preview/local
 *  - NEXT_PUBLIC_FORCE_PICKAXE=1    → force Pickaxe on preview/local
 *  - (legacy) NEXT_PUBLIC_USE_PICKAXE=1 → same as FORCE_PICKAXE
 *
 * In PRODUCTION these overrides are ignored — prod is always Pickaxe.
 */
const FORCE_NATIVE = bool(process.env.NEXT_PUBLIC_FORCE_NATIVE, true);
const FORCE_PICKAXE =
  bool(process.env.NEXT_PUBLIC_FORCE_PICKAXE, false) ||
  bool(process.env.NEXT_PUBLIC_USE_PICKAXE, false);

// Default: prod → Pickaxe; non-prod → Native
let usePickaxe = IS_PROD;

// Allow overrides only when NOT prod
if (!IS_PROD) {
  if (FORCE_NATIVE) usePickaxe = false;
  else if (FORCE_PICKAXE) usePickaxe = true;
}

/** All feature gates live here */
export const FEATURES = {
  usePickaxe,          // Prod locked; non-prod can be overridden via envs above
  hideChrome: IS_PROD, // hide header/footer in prod
  showSidebar: !IS_PROD,
} as const;
