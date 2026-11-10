const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const parseId = require("../utils/parseId");

async function listRoutes(req, res, next) {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { id: "desc" },
      include: { _count: { select: { trips: true } } },
    });
    res.json({ data: routes });
  } catch (err) {
    next(err);
  }
}

async function createRoute(req, res, next) {
  try {
    const route = await prisma.route.create({ data: req.body });
    res.status(201).json({ message: "Route created", data: route });
  } catch (err) {
    next(err);
  }
}

async function updateRoute(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const route = await prisma.route.update({ where: { id }, data: req.body });
    res.json({ message: "Route updated", data: route });
  } catch (err) {
    next(err);
  }
}

async function deleteRoute(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const tripCount = await prisma.trip.count({ where: { routeId: id } });
    if (tripCount > 0) {
      throw new AppError("This route has trips and cannot be deleted. Delete its trips first.", 409);
    }
    await prisma.route.delete({ where: { id } });
    res.json({ message: "Route deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listRoutes, createRoute, updateRoute, deleteRoute };
