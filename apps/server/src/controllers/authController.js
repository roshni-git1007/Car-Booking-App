const bcrypt = require("bcrypt");
const { z } = require("zod");
const User = require("../models/User");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/tokens");
const { env } = require("../config/env");

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/api/auth/refresh",
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: "user" });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions());
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions());
    res.json({ user: user.toJSON(), accessToken });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "Missing refresh token" });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "User not found" });

    const accessToken = signAccessToken(user);
    // Optional: rotate refresh token each time
    const newRefreshToken = signRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.json({ message: "Logged out" });
}

module.exports = { register, login, refresh, logout };
