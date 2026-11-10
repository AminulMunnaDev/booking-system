const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// Never send the password hash to the client
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  createdAt: u.createdAt,
});

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError("This email is already registered", 409);

    const hashed = await bcrypt.hash(password, 10);

    // Role is always USER here. Admin is created by the seed script only.
    const user = await prisma.user.create({
      data: { name, email, phone, password: hashed, role: "USER" },
    });

    res.status(201).json({ message: "Registered successfully", user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Same message for wrong email or wrong password (do not reveal which)
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) throw new AppError("Invalid email or password", 401);

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new AppError("User no longer exists", 401);
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
