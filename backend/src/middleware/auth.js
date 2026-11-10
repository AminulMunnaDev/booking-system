const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

// Reads "Authorization: Bearer <token>", verifies it, sets req.user = { id, role }
function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Not logged in", 401));
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    next(new AppError("Invalid or expired token", 401));
  }
}

// Usage: router.get("/x", verifyToken, requireRole("ADMIN"), controller)
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError("Not logged in", 401));
  if (!roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to do this", 403));
  }
  next();
};

module.exports = { verifyToken, requireRole };
