import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs"; // make sure this runs on Node, not Edge

// Keep exactly ONE Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    // Verify signature if the secret is set
    event = endpointSecret
      ? stripe.webhooks.constructEvent(body, sig, endpointSecret)
      : (JSON.parse(body) as Stripe.Event); // (fallback for local mocks)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return new NextResponse(`Webhook Error: ${err?.message ?? "invalid signature"}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // TODO: grant entitlement (Pickaxe, DB, etc.) using session.customer / metadata
        break;
      }
      case "invoice.payment_succeeded": {
        // TODO: ensure user retains access
        break;
      }
      case "customer.subscription.deleted": {
        // TODO: revoke/adjust access
        break;
      }
      default:
        // no-op
        break;
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return NextResponse.json({ received: true, handled: false }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
