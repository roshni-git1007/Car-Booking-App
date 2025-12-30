const express = require("express");
const {
  listCars,
  listCarsAdmin,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");

const { requireAuth, requireRole } = require("../middlewares/auth");

const router = express.Router();

// Public
router.get("/", listCars);
router.get("/admin/all", requireAuth, requireRole("admin"), listCarsAdmin);
router.get("/:id", getCarById);

// Admin only
router.post("/", requireAuth, requireRole("admin"), createCar);
router.patch("/:id", requireAuth, requireRole("admin"), updateCar);
router.delete("/:id", requireAuth, requireRole("admin"), deleteCar);

module.exports = router;