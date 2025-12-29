const { z } = require("zod");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const { writeAuditLog } = require("../utils/audit");

const createBookingSchema = z.object({
  carId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// helper: calculate days between dates (end is exclusive)
function diffDays(start, end) {
  const ms = end.getTime() - start.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

async function createBooking(req, res, next) {
  try {
    const { carId, startDate, endDate } = createBookingSchema.parse(req.body);

    if (!mongoose.isValidObjectId(carId)) {
      return res.status(400).json({ message: "Invalid carId" });
    }

    const car = await Car.findById(carId);
    if (!car || !car.isActive) {
      return res.status(404).json({ message: "Car not found or unavailable" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid startDate or endDate" });
    }

    // business rule: start must be before end
    if (start >= end) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }

    const days = diffDays(start, end);
    if (days <= 0) {
      return res.status(400).json({ message: "Invalid booking duration" });
    }

    const pricePerDaySnapshot = car.pricePerDay;
    const totalAmount = pricePerDaySnapshot * days;

    // Overlap check for the same car
    // Overlap condition: (existing.start < new.end) AND (new.start < existing.end)
    const overlap = await Booking.findOne({
      car: car._id,
      status: { $in: ["pending_payment", "paid"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (overlap) {
      await writeAuditLog({
        req,
        action: "BOOKING_OVERLAP_BLOCKED",
        entityType: "Car",
        entityId: carId,
        message: "Attempted overlapping booking",
        metadata: { start, end },
      });
      return res.status(409).json({
        message: "Car is already booked for the selected dates",
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      car: car._id,
      startDate: start,
      endDate: end,
      status: "pending_payment",
      pricePerDaySnapshot,
      totalAmount,
    });
    await writeAuditLog({
      req,
      action: "BOOKING_CREATED",
      entityType: "Booking",
      entityId: booking._id,
      message: "Booking created (pending payment)",
      metadata: {
        carId: booking.car.toString(),
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

async function myBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("car", "brand model category pricePerDay imageUrl")
      .sort({ createdAt: -1 });

    res.json({ items: bookings });
  } catch (err) {
    next(err);
  }
}

async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id).populate("car", "brand model category pricePerDay imageUrl");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Authorization rule:
    // user can only view their own booking, admin can view any
    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
}

module.exports = { createBooking, myBookings, getBookingById };
