// lib/env.ts
export type AppEnv = "production" | "preview" | "development";

/**
 * Resolve the current environment in a way that works on Vercel:
 * - Prefer explicit NEXT_PUBLIC_APP_ENV (so Preview doesn't "look" like Prod)
 * - Fall back to VERCEL_ENV (production/preview/development)
 * - NODE_ENV is "production" for previews, so don't rely on it alone
 */
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV as AppEnv | undefined;
const FALLBACK_ENV =
  ((process.env.VERCEL_ENV as AppEnv | undefined) ??
    ((process.env.NODE_ENV === "production" ? "production" : "development") as AppEnv)) ??
  "development";

export const ENV: AppEnv = APP_ENV ?? FALLBACK_ENV;
export const IS_PROD = ENV === "production";

/**
 * Comma-separated list of superadmin emails.
 * Example (Preview branch-scoped in Vercel):
 *   ADMIN_EMAILS=haseebservises@gmail.com,owner@yourco.com
 */
export const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS ?? "")
  .toLowerCase()
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Optional: used only when Pickaxe is active
export const PICKAXE_URL = process.env.NEXT_PUBLIC_PICKAXE_URL ?? "";

// --- helpers ---
function bool(v?: string | null, fallback = false) {
  if (v == null) return fallback;
  const s = v.toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

// Non-prod overrides (handy for quick testing in Preview/Dev)
const FORCE_NATIVE = bool(process.env.NEXT_PUBLIC_FORCE_NATIVE, false);
const FORCE_PICKAXE =
  bool(process.env.NEXT_PUBLIC_FORCE_PICKAXE, false) || bool(process.env.NEXT_PUBLIC_USE_PICKAXE, false);

// Default: prod → Pickaxe; non-prod → Native
let usePickaxe = IS_PROD;
if (!IS_PROD) {
  if (FORCE_NATIVE) usePickaxe = false;
  else if (FORCE_PICKAXE) usePickaxe = true;
}

export const FEATURES = {
  usePickaxe,
  hideChrome: IS_PROD,
  showSidebar: !IS_PROD,
} as const;

// One-time debug in the browser (fine for Preview/Dev)
if (typeof window !== "undefined") {
  // @ts-ignore
  console.log(
    `[BBB env] ENV=${ENV} usePickaxe=${usePickaxe} FORCE_NATIVE=${FORCE_NATIVE} FORCE_PICKAXE=${FORCE_PICKAXE}`
  );
}
