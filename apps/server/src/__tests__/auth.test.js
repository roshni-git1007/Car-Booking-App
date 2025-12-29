const request = require("supertest");
const {app} = require("../app");

describe("Auth", () => {

  it("registers and logs in a user", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "Password@123",
      });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body).toHaveProperty("user");
    expect(registerRes.body.user.email).toBe("test@example.com");

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "Password@123",
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");
  });
});
