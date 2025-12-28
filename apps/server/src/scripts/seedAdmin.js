const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { env } = require("../config/env");
const { connectDB } = require("../config/db");
const User = require("../models/User");

async function seedAdmin() {
  await connectDB();

  const email = env.ADMIN_SEED_EMAIL;
  const password = env.ADMIN_SEED_PASSWORD;
  const name = env.ADMIN_SEED_NAME;

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("✅ Admin already exists:", email);
    await mongoose.connection.close();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
  });

  console.log("✅ Admin created:", email);
  await mongoose.connection.close();
}

seedAdmin().catch(async (err) => {
  console.error("❌ Seed failed:", err.message);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});