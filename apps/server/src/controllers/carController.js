const { z } = require("zod");
const mongoose = require("mongoose");
const Car = require("../models/Car");

// Validation schema for creating/updating a car
const carUpsertSchema = z.object({
  brand: z.string().min(1).max(60),
  model: z.string().min(1).max(60),
  year: z.number().int().min(1990).max(2050),
  category: z.string().min(1).max(40),
  pricePerDay: z.number().min(1),
  transmission: z.string().min(1).max(20),
  fuelType: z.string().min(1).max(20),
  seats: z.number().int().min(1).max(12),
  isActive: z.boolean().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

async function listCars(req, res, next) {
  try {
    // Query params example:
    // /api/cars?search=toyota&category=SUV&minPrice=50&maxPrice=120&page=1&limit=10
    const {
      search = "",
      category,
      minPrice,
      maxPrice,
      isActive,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const filter = {};

    // Text-like search on brand/model (simple regex)
    if (search) {
      filter.$or = [
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    if (category) filter.category = category;

    // Price range
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    // isActive filter (default: show only active cars)
    if (typeof isActive === "undefined") {
      filter.isActive = true; // ✅ default behavior for public listing
    } else {
      filter.isActive = isActive === "true";
    }


    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Car.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Car.countDocuments(filter),
    ]);

    res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

async function listCarsAdmin(req, res, next) {
  try {
    const { page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Car.find({}).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Car.countDocuments({}),
    ]);

    res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

async function getCarById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid car id" });
    }

    const car = await Car.findById(id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    res.json(car);
  } catch (err) {
    next(err);
  }
}

async function createCar(req, res, next) {
  try {
    const payload = carUpsertSchema.parse(req.body);

    const car = await Car.create(payload);
    res.status(201).json(car);
  } catch (err) {
    next(err);
  }
}

async function updateCar(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid car id" });
    }

    // partial updates allowed
    const payload = carUpsertSchema.partial().parse(req.body);

    const updated = await Car.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Car not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteCar(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid car id" });
    }

    const deleted = await Car.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Car not found" });

    res.json({ message: "Car deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCars, listCarsAdmin, getCarById, createCar, updateCar, deleteCar };