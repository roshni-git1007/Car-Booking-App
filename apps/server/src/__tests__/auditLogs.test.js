const request = require("supertest");
const {app} = require("../app");

const AuditLog = require("../models/AuditLog");
const Car = require("../models/Car");

async function registerAndLogin(email) {
  await request(app).post("/api/auth/register").send({
    name: "User",
    email,
    password: "Password@123",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email,
    password: "Password@123",
  });

  return {
    accessToken: loginRes.body.accessToken,
    user: loginRes.body.user,
  };
}

describe("Audit Logs", () => {
  it("creates BOOKING_CREATED audit log when booking is created", async () => {
    const { accessToken, user } = await registerAndLogin("audituser1@example.com");

    // Create a car directly in DB (no need for admin endpoint in tests)
    const car = await Car.create({
      brand: "Honda",
      model: "Civic",
      year: 2022,
      category: "Sedan",
      pricePerDay: 50,
      transmission: "Automatic",
      fuelType: "Petrol",
      seats: 5,
      isActive: true,
      imageUrl: "",
    });

    // Create booking via API (this should write an audit log)
    const bookingRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        carId: car._id.toString(),
        startDate: "2026-02-01T10:00:00.000Z",
        endDate: "2026-02-03T10:00:00.000Z",
      });

    expect(bookingRes.statusCode).toBe(201);

    const bookingId = bookingRes.body._id;

    // Verify audit log exists
    const log = await AuditLog.findOne({
      action: "BOOKING_CREATED",
      entityType: "Booking",
      entityId: bookingId,
    });

    expect(log).toBeTruthy();
    expect(log.actorUser?.toString()).toBe(user._id);
    expect(log.actorRole).toBe("user");
    expect(log.metadata).toHaveProperty("carId", car._id.toString());
  });

  it("creates BOOKING_OVERLAP_BLOCKED audit log when overlapping booking is attempted", async () => {
    const { accessToken } = await registerAndLogin("audituser2@example.com");

    const car = await Car.create({
      brand: "Toyota",
      model: "Camry",
      year: 2022,
      category: "Sedan",
      pricePerDay: 75,
      transmission: "Automatic",
      fuelType: "Petrol",
      seats: 5,
      isActive: true,
      imageUrl: "",
    });

    // First booking (ok)
    const first = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        carId: car._id.toString(),
        startDate: "2026-03-01T10:00:00.000Z",
        endDate: "2026-03-03T10:00:00.000Z",
      });

    expect(first.statusCode).toBe(201);

    // Second booking (overlaps) => 409 and audit log should be written
    const second = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        carId: car._id.toString(),
        startDate: "2026-03-02T10:00:00.000Z",
        endDate: "2026-03-04T10:00:00.000Z",
      });

    expect(second.statusCode).toBe(409);

    const overlapLog = await AuditLog.findOne({
      action: "BOOKING_OVERLAP_BLOCKED",
      entityType: "Car",
      entityId: car._id.toString(), // we logged carId string
    });

    expect(overlapLog).toBeTruthy();
  });
});
