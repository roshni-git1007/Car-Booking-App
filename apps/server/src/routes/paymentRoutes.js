const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const { createCheckoutSession } = require("../controllers/paymentController");

const router = express.Router();

router.post("/checkout", requireAuth, createCheckoutSession);

module.exports = router;
