const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    car: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Car", 
        required: true 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    status: {
      type: String,
      enum: ["pending_payment", "paid", "cancelled"],
      default: "pending_payment",
    },
    // snapshot pricing for audit + correctness
    pricePerDaySnapshot: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    totalAmount: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    // reserved fields for Stripe later
    stripeSessionId: { 
        type: String, 
        default: "" 
    },
    stripePaymentIntentId: { 
        type: String, 
        default: "" 
    },
  },
  { timestamps: true }
);
// Useful for fast lookups
bookingSchema.index({ car: 1, startDate: 1, endDate: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);