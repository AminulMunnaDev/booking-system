require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const prisma = require("./config/prisma");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Build allowlist from CLIENT_URL (comma-separated allowed), defaulting to localhost:3000
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser / same-origin requests with no Origin header (e.g., curl, health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "32kb" }));
app.use(morgan("dev"));

// Rate limit auth endpoints to reduce brute-force / spam attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 auth requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again in 15 minutes." },
});

// Health check (also tests the database connection)
app.get("/api/health", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    next(err);
  }
});

// Routes
app.use("/api/auth", authLimiter, require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api", require("./routes/public.routes"));
app.use("/api/bookings", require("./routes/bookings.routes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;