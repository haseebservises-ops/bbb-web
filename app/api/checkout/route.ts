// app/api/checkout/route.ts
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const { priceId, planKey, email } = await req.json() as {
      priceId: string;              // Stripe price_***
      planKey?: string;             // your own label (optional)
      email?: string;               // prefill (optional)
    };

    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing priceId" }), { status: 400 });
    }

    const successBase = process.env.NEXT_PUBLIC_APP_URL!;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      allow_promotion_codes: true,
      customer_creation: "if_required",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${successBase}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${successBase}/upgrade/canceled`,
      // Keep anything you want to read in the webhook:
      metadata: {
        planKey: planKey ?? "",
        // if you want to grant a Pickaxe product later, put its id/slug here:
        pickaxe_product_id: process.env.PICKAXE_BONUS_PRODUCT_ID ?? "",
      },
    });

    return Response.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return new Response(JSON.stringify({ error: "Stripe error", details: err?.message }), { status: 500 });
  }
}
