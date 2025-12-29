const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { env } = require("./config/env");
const { notFound, errorHandler } = require("./middlewares/error");
const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const stripeWebhookRoutes = require("./routes/stripeWebhookRoutes");
const { requestContext } = require("./middlewares/requestContext");
const auditLogRoutes = require("./routes/auditLogRoutes");

const app = express();

// Security headers
app.use(helmet());

app.use("/api/webhooks/stripe", stripeWebhookRoutes);

// JSON parsing
app.use(express.json({ limit: "10kb" })); // prevent huge payload abuse
app.use(cookieParser());

// CORS (lock it to your frontend origin)
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Rate limiter (especially important for auth endpoints)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Request logs (dev)
if (env.NODE_ENV !== "production" && env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(requestContext);

// Health check route
app.get("/", (req, res) => {
  res.json({ status: "ok", env: env.NODE_ENV });
});

app.use("/api/cars", carRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };