// lib/env.ts

// "production" | "preview" | "development"
export const ENV =
  process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";

export const IS_PROD = ENV === "production";

// tiny helper: env string -> boolean (with a default)
function bool(v: string | undefined, fallback: boolean) {
  if (v == null) return fallback;
  const s = v.toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

/** Feature toggles (generic defaults, can override via env) */
export const FEATURES = {
  // Prod shows Pickaxe by default; preview/dev shows native chat by default
  usePickaxe: bool(process.env.NEXT_PUBLIC_USE_PICKAXE, IS_PROD),

  // Optional: hide header/footer when we’re in “prod view”
  hideChrome: bool(process.env.NEXT_PUBLIC_HIDE_HEADER_FOOTER, IS_PROD),
};

// Public Pickaxe URL (iframe src)
export const PICKAXE_URL = process.env.NEXT_PUBLIC_PICKAXE_URL ?? "";
