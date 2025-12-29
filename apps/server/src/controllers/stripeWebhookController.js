const Booking = require("../models/Booking");
const { stripe } = require("../config/stripe");
const { env } = require("../config/env");
const { writeAuditLog } = require("../utils/audit");

async function stripeWebhook(req, res) {
  // IMPORTANT: req.body here is a Buffer because we will use express.raw()
  const sig = req.headers["stripe-signature"];

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send("Webhook secret not configured");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event types
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // extra safety
    if (session.payment_status !== "paid") {
      return res.json({ received: true });
    }

    const bookingId = session.metadata?.bookingId;
    const paymentIntentId = session.payment_intent;

    if (bookingId) {
      const booking = await Booking.findById(bookingId);

      // Idempotency: don't re-mark if already paid
      if (booking && booking.status !== "paid") {
        booking.status = "paid";
        booking.stripeSessionId = session.id || booking.stripeSessionId;
        booking.stripePaymentIntentId = paymentIntentId || booking.stripePaymentIntentId;
        await booking.save();

        await writeAuditLog({
          req,
          action: "PAYMENT_SUCCEEDED",
          entityType: "Booking",
          entityId: booking._id,
          message: "Stripe webhook marked booking as paid",
          metadata: {
            stripeSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
          },
        });

      }
    }
  }

  res.json({ received: true });
}

module.exports = { stripeWebhook };
