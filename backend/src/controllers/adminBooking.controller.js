const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const parseId = require("../utils/parseId");
const cancelBookingById = require("../utils/cancelBooking");
const { bookingInclude, formatBooking } = require("../utils/formatBooking");
const { adminBookingQuerySchema } = require("../validators/booking.validator");

// GET /api/admin/bookings?status=&date=&page=&limit=
async function listBookings(req, res, next) {
  try {
    const q = adminBookingQuerySchema.parse(req.query);

    const where = {};
    if (q.status) where.status = q.status;
    if (q.date) where.trip = { travelDate: new Date(`${q.date}T00:00:00.000Z`) };

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { ...bookingInclude, user: true },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);

    res.json({
      data: bookings.map(formatBooking),
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/bookings/:id/status   body: { "status": "CONFIRMED" | "CANCELLED" }
async function setBookingStatus(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const { status } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.status === status) throw new AppError(`Booking is already ${status}`, 400);

    if (status === "CANCELLED") {
      await cancelBookingById(id);
    } else {
      // Seats of a cancelled booking were released, so it cannot come back
      if (booking.status === "CANCELLED") {
        throw new AppError("A cancelled booking cannot be confirmed again. The user must book again.", 400);
      }
      await prisma.booking.update({ where: { id }, data: { status: "CONFIRMED" } });
    }

    const updated = await prisma.booking.findUnique({
      where: { id },
      include: { ...bookingInclude, user: true },
    });
    res.json({ message: `Booking ${status.toLowerCase()}`, data: formatBooking(updated) });
  } catch (err) {
    next(err);
  }
}

module.exports = { listBookings, setBookingStatus };
