const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const parseId = require("../utils/parseId");

async function listBuses(req, res, next) {
  try {
    const buses = await prisma.bus.findMany({
      orderBy: { id: "desc" },
      include: { _count: { select: { trips: true } } },
    });
    res.json({ data: buses });
  } catch (err) {
    next(err);
  }
}

async function createBus(req, res, next) {
  try {
    const bus = await prisma.bus.create({ data: req.body });
    res.status(201).json({ message: "Bus created", data: bus });
  } catch (err) {
    next(err);
  }
}

async function updateBus(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const bus = await prisma.bus.update({ where: { id }, data: req.body });
    res.json({ message: "Bus updated", data: bus });
  } catch (err) {
    next(err);
  }
}

async function deleteBus(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const tripCount = await prisma.trip.count({ where: { busId: id } });
    if (tripCount > 0) {
      throw new AppError("This bus has trips and cannot be deleted. Delete its trips first.", 409);
    }
    await prisma.bus.delete({ where: { id } });
    res.json({ message: "Bus deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listBuses, createBus, updateBus, deleteBus };
