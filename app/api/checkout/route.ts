// app/api/checkout/route.ts
import Stripe from "stripe";

// Keep exactly ONE Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const priceId = body.priceId as string | undefined;
    const mode = (body.mode as "payment" | "subscription" | undefined) ?? "subscription";

    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing priceId" }), { status: 400 });
    }

    const successUrl =
      body.success_url ??
      `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/?upgrade=success`;
    const cancelUrl =
      body.cancel_url ??
      `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/?upgrade=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return Response.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return new Response(
      JSON.stringify({ error: "Stripe error", details: err?.message ?? "unknown" }),
      { status: 500 }
    );
  }
}




// // app/api/checkout/route.ts
// import Stripe from "stripe";
// import { NextRequest, NextResponse } from "next/server";
// import { PLANS, PlanKey } from "@/app/lib/plans";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20",
// });
// // ✅ do this (no apiVersion)
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// export async function POST(req: NextRequest) {
//   try {
//     const { planKey, email, redirectTo } = await req.json() as {
//       planKey: PlanKey;
//       email?: string;
//       redirectTo?: "app" | "pickaxe"; // choose where to land after
//     };

//     const plan = PLANS[planKey];
//     if (!plan) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

//     const successBase =
//       redirectTo === "pickaxe"
//         ? "https://betterbitebuddy.com"      // native Pickaxe portal
//         : process.env.APP_URL!;              // your Vercel app

//     const session = await stripe.checkout.sessions.create({
//       mode: "subscription",
//       allow_promotion_codes: true,
//       customer_creation: "if_required",
//       customer_email: email, // prefectch if we have it
//       line_items: [{ price: plan.priceId, quantity: 1 }],
//       success_url: `${successBase}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${successBase}/upgrade/canceled`,
//       metadata: {
//         planKey,                    // we’ll need this in the webhook
//         pickaxeProduct: plan.pickaxeProduct,
//       },
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (err: any) {
//     console.error("checkout error", err);
//     return NextResponse.json({ error: err.message ?? "Checkout error" }, { status: 500 });
//   }
// }
