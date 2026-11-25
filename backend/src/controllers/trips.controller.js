const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const parseId = require("../utils/parseId");
const generateSeats = require("../utils/generateSeats");
const { dhakaNow, hasDeparted } = require("../utils/dhakaTime");
const { searchSchema } = require("../validators/trip.validator");

const toDate = (s) => new Date(`${s}T00:00:00.000Z`);

// GET /api/cities  -> ["Chattogram", "Dhaka", ...]
async function getCities(req, res, next) {
  try {
    const routes = await prisma.route.findMany({ select: { fromCity: true, toCity: true } });
    const set = new Set();
    routes.forEach((r) => {
      set.add(r.fromCity);
      set.add(r.toCity);
    });
    res.json({ data: [...set].sort() });
  } catch (err) {
    next(err);
  }
}

// GET /api/trips/search?from=Dhaka&to=Rangpur&dateFrom=2026-11-23&dateTo=2026-11-27
// Also accepts a single day: ?date=2026-11-23   Optional: type=AC|NON_AC, sort=time|price
// Results are ordered by date first, then by time (or price) inside each day.
async function searchTrips(req, res, next) {
  try {
    const q = searchSchema.parse(req.query);
    const start = q.dateFrom || q.date;
    const end = q.dateTo || start;
    const now = dhakaNow();

    // The whole range is in the past: nothing to show
    if (end < now.date) {
      return res.json({ data: [], total: 0, dateFrom: start, dateTo: end });
    }

    // Never search before today
    const effectiveStart = start < now.date ? now.date : start;

    const where = {
      isActive: true,
      travelDate: { gte: toDate(effectiveStart), lte: toDate(end) },
      route: { fromCity: q.from, toCity: q.to },
      // Today: hide trips that already left. Later days: show everything.
      OR: [{ travelDate: { gt: toDate(now.date) } }, { departureTime: { gt: now.time } }],
    };
    if (q.type) where.bus = { type: q.type };

    const orderBy = [
      { travelDate: "asc" },
      ...(q.sort === "price" ? [{ price: "asc" }, { departureTime: "asc" }] : [{ departureTime: "asc" }]),
    ];

    const trips = await prisma.trip.findMany({
      where,
      orderBy,
      include: {
        route: true,
        bus: { select: { id: true, name: true, type: true, totalSeats: true } },
        _count: { select: { seats: true } },
      },
    });

    const data = trips.map((t) => ({
      id: t.id,
      travelDate: t.travelDate.toISOString().slice(0, 10),
      departureTime: t.departureTime,
      arrivalTime: t.arrivalTime,
      price: t.price,
      route: { id: t.route.id, fromCity: t.route.fromCity, toCity: t.route.toCity, distanceKm: t.route.distanceKm },
      bus: t.bus,
      bookedSeats: t._count.seats,
      seatsLeft: t.bus.totalSeats - t._count.seats,
    }));

    res.json({ data, total: data.length, dateFrom: start, dateTo: end });
  } catch (err) {
    next(err);
  }
}

// GET /api/trips/:id  -> trip details + seat layout + booked seats
async function getTripDetails(req, res, next) {
  try {
    const id = parseId(req.params.id);

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        route: true,
        bus: { select: { id: true, name: true, type: true, totalSeats: true } },
      },
    });
    if (!trip || !trip.isActive) throw new AppError("Trip not found", 404);

    const booked = await prisma.bookingSeat.findMany({
      where: { tripId: id },
      select: { seatNumber: true },
    });
    const bookedSeats = booked.map((b) => b.seatNumber);

    res.json({
      data: {
        id: trip.id,
        travelDate: trip.travelDate.toISOString().slice(0, 10),
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        price: trip.price,
        route: trip.route,
        bus: trip.bus,
        seatLayout: generateSeats(trip.bus.totalSeats),
        bookedSeats,
        seatsLeft: trip.bus.totalSeats - bookedSeats.length,
        isBookable: !hasDeparted(trip.travelDate, trip.departureTime),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/trips/popular-routes  -> top routes by number of bookings
async function popularRoutes(req, res, next) {
  try {
    const routes = await prisma.route.findMany({
      include: {
        trips: {
          where: { isActive: true },
          select: {
            price: true,
            _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
          },
        },
      },
    });

    const data = routes
      .filter((r) => r.trips.length > 0)
      .map((r) => ({
        routeId: r.id,
        fromCity: r.fromCity,
        toCity: r.toCity,
        distanceKm: r.distanceKm,
        tripCount: r.trips.length,
        bookingCount: r.trips.reduce((sum, t) => sum + t._count.bookings, 0),
        startingPrice: Math.min(...r.trips.map((t) => t.price)),
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount || b.tripCount - a.tripCount)
      .slice(0, 6);

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCities, searchTrips, getTripDetails, popularRoutes };
