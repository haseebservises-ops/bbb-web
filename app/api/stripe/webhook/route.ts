import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
// ✅ do this (no apiVersion)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function grantOnPickaxe(opts: {
  email: string;
  pickaxeProductId: string;
}) {
  // IMPORTANT: replace URL + payload to match Pickaxe’s “grant/gift product” endpoint.
  // Ask Pickaxe support for the exact endpoint if you don’t already have it.
  // The shape below is a reasonable starter.
  await fetch("https://api.pickaxe.co/v1/studio/memberships/grant", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${process.env.PICKAXE_API_TOKEN}`,
    },
    body: JSON.stringify({
      studioId: process.env.PICKAXE_STUDIO_ID,
      userEmail: opts.email,
      productId: opts.pickaxeProductId,
    }),
  });
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const buf = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook signature verification failed. ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email =
          (session.customer_details?.email ||
            (session.metadata?.email ?? "")).trim().toLowerCase();

        const pickaxeProductId = session.metadata?.pickaxeProductId;
        if (email && pickaxeProductId) {
          await grantOnPickaxe({ email, pickaxeProductId });
        }
        break;
      }

      // (optional) handle subscription updates/cancellations to downgrade
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        // You could revoke/downgrade here if you maintain entitlements.
        break;
      }
    }
  } catch (err: any) {
    // Return 200 so Stripe doesn’t keep retrying forever; log the error.
    console.error("Webhook error", err);
  }

  return NextResponse.json({ received: true });
}
