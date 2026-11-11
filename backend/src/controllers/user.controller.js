const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const parseId = require("../utils/parseId");

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  _count: { select: { bookings: true } },
};

// GET /api/admin/users?page=1&limit=10
async function listUsers(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        select: userSelect,
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({ data: users, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/users/:id/role   body: { "role": "USER" | "ADMIN" }
async function changeRole(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === req.user.id) throw new AppError("You cannot change your own role", 400);

    const user = await prisma.user.update({
      where: { id },
      data: { role: req.body.role },
      select: userSelect,
    });
    res.json({ message: "Role updated", data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, changeRole };
