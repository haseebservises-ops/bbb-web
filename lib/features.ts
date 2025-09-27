// lib/features.ts
export const FEATURES = (() => {
  // Treat Production as Pickaxe by default
  const isProd =
    process.env.NEXT_PUBLIC_APP_ENV === "Production" ||
    process.env.NODE_ENV === "production";

  const forcePickaxe = process.env.NEXT_PUBLIC_FORCE_PICKAXE === "1";
  const forceNative  = process.env.NEXT_PUBLIC_FORCE_NATIVE  === "1";

  // Order of precedence:
  // 1) Production => Pickaxe
  // 2) Explicit FORCE flags on Preview
  // 3) Default for Preview = Native
  const usePickaxe = isProd ? true : forcePickaxe ? true : forceNative ? false : false;

  if (typeof window !== "undefined") {
    // one-time console hint while you verify
    // eslint-disable-next-line no-console
    console.log("[BBB] FEATURES.usePickaxe =", usePickaxe, {
      env: process.env.NEXT_PUBLIC_APP_ENV,
      forcePickaxe,
      forceNative,
      nodeEnv: process.env.NODE_ENV,
    });
  }

  return { usePickaxe };
})();
