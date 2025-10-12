// app/lib/plans.ts
export type PlanKey =
  | "core_monthly"
  | "core_annual"
  | "pro_annual"
  | "ultimate_annual"
  | "coach_power"
  | "coach_premium_monthly"
  | "premium_annual"
  | "starter_free"
  | "active_client";

export const PLANS: Record<PlanKey, {
  title: string;
  stripePriceId: string;      // from your Stripe “Price”
  pickaxeProductId: string;   // from Pickaxe Access product (or slug)
  description?: string;
}> = {
  core_monthly: {
    title: "Better Bite Buddy™ Core (Monthly)",
    stripePriceId: "price_XXXXXXXXXXXXXXXX",
    pickaxeProductId: "pkx_prod_core_monthly",
    description: "90 credits/mo • Cancel anytime",
  },
  core_annual: {
    title: "Better Bite Buddy™ Core (Annual)",
    stripePriceId: "price_YYYYYYYYYYYYYYYY",
    pickaxeProductId: "pkx_prod_core_annual",
  },
  pro_annual: {
    title: "Better Bite Buddy™ – Pro Annual Access",
    stripePriceId: "price_ZZZZZZZZZZZZZZZZ",
    pickaxeProductId: "pkx_prod_pro_annual",
  },
  ultimate_annual: {
    title: "Better Bite Buddy™ – Ultimate Annual Access",
    stripePriceId: "price_AAAAAAAAAAAAAAA",
    pickaxeProductId: "pkx_prod_ultimate_annual",
  },
  coach_power: {
    title: "Better Bite Coach™ – Power Plan",
    stripePriceId: "price_BBBBBBBBBBBBBBB",
    pickaxeProductId: "pkx_prod_power",
  },
  coach_premium_monthly: {
    title: "Better Bite Coach™ Premium (Monthly)",
    stripePriceId: "price_CCCCCCCCCCCCCCC",
    pickaxeProductId: "pkx_prod_premium_monthly",
  },
  premium_annual: {
    title: "Better Bite Buddy™ Premium (Annual)",
    stripePriceId: "price_DDDDDDDDDDDDDDD",
    pickaxeProductId: "pkx_prod_premium_annual",
  },
  starter_free: {
    title: "Starter Free",
    stripePriceId: "price_FREE_PLACEHOLDER",   // optional/no checkout
    pickaxeProductId: "pkx_prod_starter",
  },
  active_client: {
    title: "Active Client Full Access",
    stripePriceId: "price_COMPLIMENTARY_MANUAL",
    pickaxeProductId: "pkx_prod_active_client",
  },
};
