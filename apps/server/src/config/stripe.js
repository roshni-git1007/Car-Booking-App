const Stripe = require("stripe");
const { env } = require("./env");

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20", // ok even if Stripe updates; we can adjust later
});

module.exports = { stripe };
