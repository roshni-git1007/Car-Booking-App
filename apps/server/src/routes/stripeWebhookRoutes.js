const express = require("express");
const { stripeWebhook } = require("../controllers/stripeWebhookController");

const router = express.Router();

// Stripe webhook must use raw body
router.post("/", express.raw({ type: "application/json" }), stripeWebhook);

module.exports = router;
