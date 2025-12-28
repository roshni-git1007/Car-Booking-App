const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const { createBooking, myBookings, getBookingById } = require("../controllers/bookingController");

const router = express.Router();

router.post("/", requireAuth, createBooking);
router.get("/me", requireAuth, myBookings);
router.get("/:id", requireAuth, getBookingById);

module.exports = router;