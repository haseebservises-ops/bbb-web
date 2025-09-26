// lib/env.ts
export const ENV =
  (process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development") as
    | "production"
    | "preview"
    | "development";

export const IS_PROD = ENV === "production";

/** tolerant bool helper: "1" | "true" | "yes" */
function bool(v?: string | null, fallback = false) {
  if (v == null) return fallback;
  const s = v.toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

/**
 * Quick overrides for NON-PROD only:
 *  - NEXT_PUBLIC_FORCE_NATIVE=1   → force NativeChat on preview/local
 *  - NEXT_PUBLIC_FORCE_PICKAXE=1  → force Pickaxe on preview/local
 *  - (legacy) NEXT_PUBLIC_USE_PICKAXE=1 is treated same as FORCE_PICKAXE
 *
 * In PRODUCTION these overrides are ignored — prod is always Pickaxe.
 */
const FORCE_NATIVE = bool(process.env.NEXT_PUBLIC_FORCE_NATIVE, false);
const FORCE_PICKAXE =
  bool(process.env.NEXT_PUBLIC_FORCE_PICKAXE, false) ||
  bool(process.env.NEXT_PUBLIC_USE_PICKAXE, false);

// Default: prod → Pickaxe; non-prod → Native
let usePickaxe = IS_PROD;

// Allow overrides only when NOT prod
if (!IS_PROD) {
  if (FORCE_NATIVE) usePickaxe = false;   // force Native
  if (FORCE_PICKAXE) usePickaxe = true;   // force Pickaxe
}

export const FEATURES = {
  usePickaxe,          // decides Pickaxe vs Native
  hideChrome: IS_PROD, // hide header/footer in prod
  showSidebar: !IS_PROD,
} as const;

// Pickaxe iframe URL (Share → Embed URL from Pickaxe)
export const PICKAXE_URL = process.env.NEXT_PUBLIC_PICKAXE_URL ?? "";
