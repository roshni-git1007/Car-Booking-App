const request = require("supertest");
const { app } = require("../app");

async function registerAndLogin(email, role) {
  // register
  await request(app).post("/api/auth/register").send({
    name: "User",
    email,
    password: "Password@123",
  });

  // login
  const loginRes = await request(app).post("/api/auth/login").send({
    email,
    password: "Password@123",
  });

  return loginRes.body.accessToken;
}

describe("RBAC", () => {
  it("blocks non-admin from creating a car", async () => {
    const userToken = await registerAndLogin("user1@example.com");

    const res = await request(app)
      .post("/api/cars")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        brand: "Toyota",
        model: "Corolla",
        year: 2022,
        category: "Sedan",
        pricePerDay: 50,
        transmission: "Automatic",
        fuelType: "Petrol",
        seats: 5,
        isActive: true,
        imageUrl: "",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message");
  });
});
