const { ZodError } = require("zod");

// 404 for unknown routes
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  // Prisma unique constraint
  if (err.code === "P2002") {
    return res.status(409).json({ message: "Duplicate value, this record already exists" });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }

  const status = err.statusCode || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    message: status === 500 ? "Internal server error" : err.message,
  });
}

module.exports = { notFound, errorHandler };
