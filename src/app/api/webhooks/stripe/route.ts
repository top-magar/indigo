import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/infrastructure/db";
import { orders } from "@/db/schema/orders";
import { eq } from "drizzle-orm";
import { createLogger } from "@/lib/logger";

const log = createLogger("api:webhooks:stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    log.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const [existingPaid] = await db.select({ paymentStatus: orders.paymentStatus })
          .from(orders).where(eq(orders.stripePaymentIntentId, pi.id)).limit(1);
        if (existingPaid?.paymentStatus === "paid") {
          log.info(`Skipping duplicate payment_intent.succeeded: ${pi.id}`);
          break;
        }
        await db.update(orders)
          .set({ paymentStatus: "paid", status: "confirmed", updatedAt: new Date() })
          .where(eq(orders.stripePaymentIntentId, pi.id));
        log.info(`Payment succeeded: ${pi.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const [existingFailed] = await db.select({ paymentStatus: orders.paymentStatus })
          .from(orders).where(eq(orders.stripePaymentIntentId, pi.id)).limit(1);
        if (existingFailed?.paymentStatus === "failed") {
          log.info(`Skipping duplicate payment_intent.payment_failed: ${pi.id}`);
          break;
        }
        await db.update(orders)
          .set({ paymentStatus: "failed", updatedAt: new Date() })
          .where(eq(orders.stripePaymentIntentId, pi.id));
        log.info(`Payment failed: ${pi.id}`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (piId) {
          const isFullRefund = charge.amount_refunded === charge.amount;
          const targetStatus = isFullRefund ? "refunded" : "partially_refunded";
          const [existingRefund] = await db.select({ paymentStatus: orders.paymentStatus })
            .from(orders).where(eq(orders.stripePaymentIntentId, piId)).limit(1);
          if (existingRefund?.paymentStatus === targetStatus) {
            log.info(`Skipping duplicate charge.refunded: ${piId}`);
            break;
          }
          await db.update(orders)
            .set({
              paymentStatus: targetStatus,
              ...(isFullRefund ? { status: 'refunded' as const } : {}),
              updatedAt: new Date(),
            })
            .where(eq(orders.stripePaymentIntentId, piId));
          log.info(`Refund processed: ${piId}, full=${isFullRefund}`);
        }
        break;
      }

      default:
        log.info(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    log.error(`Error processing ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
