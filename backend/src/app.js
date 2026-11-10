require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const prisma = require("./config/prisma");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(morgan("dev"));

// Health check (also tests the database connection)
app.get("/api/health", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    next(err);
  }
});

// Routes will be added in the next steps:
app.use("/api/auth", require("./routes/auth.routes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
