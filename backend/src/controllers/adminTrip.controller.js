const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const parseId = require("../utils/parseId");

// "2026-11-15" -> Date at midnight UTC (matches the DATE column)
const toDate = (s) => new Date(`${s}T00:00:00.000Z`);

const formatTrip = (t) => ({
  id: t.id,
  routeId: t.routeId,
  busId: t.busId,
  travelDate: t.travelDate.toISOString().slice(0, 10),
  departureTime: t.departureTime,
  arrivalTime: t.arrivalTime,
  price: t.price,
  isActive: t.isActive,
  route: t.route,
  bus: t.bus,
  bookedSeats: t._count ? t._count.seats : 0,
  seatsLeft: t._count && t.bus ? t.bus.totalSeats - t._count.seats : undefined,
});

const tripInclude = {
  route: true,
  bus: true,
  _count: { select: { seats: true } },
};

// GET /api/admin/trips?page=1&limit=10&date=2026-11-15&routeId=1
async function listTrips(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const where = {};
    if (req.query.date) where.travelDate = toDate(String(req.query.date));
    if (req.query.routeId) where.routeId = parseId(req.query.routeId);

    const [total, trips] = await Promise.all([
      prisma.trip.count({ where }),
      prisma.trip.findMany({
        where,
        include: tripInclude,
        orderBy: [{ travelDate: "desc" }, { departureTime: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      data: trips.map(formatTrip),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

async function createTrip(req, res, next) {
  try {
    const { routeId, busId, travelDate, departureTime, arrivalTime, price, isActive } = req.body;

    const [route, bus] = await Promise.all([
      prisma.route.findUnique({ where: { id: routeId } }),
      prisma.bus.findUnique({ where: { id: busId } }),
    ]);
    if (!route) throw new AppError("Route not found", 404);
    if (!bus) throw new AppError("Bus not found", 404);

    const date = toDate(travelDate);

    // Do not allow trips in the past (compares dates only)
    const today = toDate(new Date().toISOString().slice(0, 10));
    if (date < today) throw new AppError("Travel date cannot be in the past", 400);

    // Same bus cannot run two trips at the same date and time
    const clash = await prisma.trip.findFirst({
      where: { busId, travelDate: date, departureTime },
    });
    if (clash) throw new AppError("This bus already has a trip at that date and time", 409);

    const trip = await prisma.trip.create({
      data: { routeId, busId, travelDate: date, departureTime, arrivalTime, price, isActive },
      include: tripInclude,
    });

    res.status(201).json({ message: "Trip created", data: formatTrip(trip) });
  } catch (err) {
    next(err);
  }
}

async function updateTrip(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const { routeId, busId, travelDate, departureTime, arrivalTime, price, isActive } = req.body;

    const existing = await prisma.trip.findUnique({
      where: { id },
      include: { _count: { select: { seats: true } } },
    });
    if (!existing) throw new AppError("Trip not found", 404);

    // Changing the bus after seats are booked would break seat numbers
    if (existing._count.seats > 0 && busId !== existing.busId) {
      throw new AppError("This trip already has booked seats, so its bus cannot be changed", 409);
    }

    const [route, bus] = await Promise.all([
      prisma.route.findUnique({ where: { id: routeId } }),
      prisma.bus.findUnique({ where: { id: busId } }),
    ]);
    if (!route) throw new AppError("Route not found", 404);
    if (!bus) throw new AppError("Bus not found", 404);

    const date = toDate(travelDate);

    const clash = await prisma.trip.findFirst({
      where: { busId, travelDate: date, departureTime, NOT: { id } },
    });
    if (clash) throw new AppError("This bus already has a trip at that date and time", 409);

    const trip = await prisma.trip.update({
      where: { id },
      data: { routeId, busId, travelDate: date, departureTime, arrivalTime, price, isActive },
      include: tripInclude,
    });

    res.json({ message: "Trip updated", data: formatTrip(trip) });
  } catch (err) {
    next(err);
  }
}

async function deleteTrip(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const bookingCount = await prisma.booking.count({ where: { tripId: id } });
    if (bookingCount > 0) {
      throw new AppError(
        "This trip has bookings and cannot be deleted. Set isActive to false to hide it instead.",
        409
      );
    }
    await prisma.trip.delete({ where: { id } });
    res.json({ message: "Trip deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTrips, createTrip, updateTrip, deleteTrip };
