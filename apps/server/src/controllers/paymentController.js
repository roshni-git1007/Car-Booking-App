const { z } = require("zod");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const { stripe } = require("../config/stripe");
const { env } = require("../config/env");

const checkoutSchema = z.object({
  bookingId: z.string().min(1),
});

async function createCheckoutSession(req, res, next) {
  try {
    const { bookingId } = checkoutSchema.parse(req.body);

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    const booking = await Booking.findById(bookingId).populate("car", "brand model");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    if (booking.status !== "pending_payment") {
      return res.status(400).json({ message: "Booking is not pending payment" });
    }

    // Stripe expects amount in the smallest currency unit: cents for USD
    const amountInCents = booking.totalAmount * 100;

    console.log("Stripe key starts with:", (env.STRIPE_SECRET_KEY || "").slice(0, 10));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountInCents,
            product_data: {
              name: `Car booking: ${booking.car.brand} ${booking.car.model}`,
              description: `Booking ${booking._id.toString()}`,
            },
          },
        },
      ],

      // These URLs are where Stripe redirects the user AFTER checkout
      success_url: `${env.APP_BASE_URL}/payment-success?bookingId=${booking._id.toString()}`,
      cancel_url: `${env.APP_BASE_URL}/payment-cancelled?bookingId=${booking._id.toString()}`,

      // This metadata is super useful in webhook so we can find the booking
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { createCheckoutSession };
