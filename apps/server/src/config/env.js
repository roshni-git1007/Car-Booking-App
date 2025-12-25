const dotenv = require("dotenv");
dotenv.config();

const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(20, "JWT_ACCESS_SECRET must be at least 20 chars"),
  JWT_REFRESH_SECRET: z.string().min(20, "JWT_REFRESH_SECRET must be at least 20 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

const env = envSchema.parse(process.env);

module.exports = { env };