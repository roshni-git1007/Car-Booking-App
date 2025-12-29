const request = require("supertest");
const { app } = require("../app");

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

  return loginRes.body.accessToken;
}

describe("Booking", () => {
  it("prevents overlapping bookings for same car (409)", async () => {
    const token = await registerAndLogin("booker@example.com");

    // Create a car directly via admin endpoint would require admin token.
    // So for test simplicity, create an admin user first IF your register supports role,
    // otherwise we can insert a car via the Car model (we’ll do that next if needed).
  });
});
