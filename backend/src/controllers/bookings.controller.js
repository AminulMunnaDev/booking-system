const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const parseId = require("../utils/parseId");
const generateSeats = require("../utils/generateSeats");
const cancelBookingById = require("../utils/cancelBooking");
const { makePaymentRef } = require("../utils/payment");
const { hasDeparted } = require("../utils/dhakaTime");
const { bookingInclude, formatBooking } = require("../utils/formatBooking");

// POST /api/bookings
async function createBooking(req, res, next) {
  try {
    const { tripId, passengers, requirePayment } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { bus: true } });
    if (!trip || !trip.isActive) throw new AppError("Trip not found", 404);
    if (hasDeparted(trip.travelDate, trip.departureTime)) {
      throw new AppError("This trip has already departed", 400);
    }

    // Every seat must exist on this bus
    const validSeats = new Set(generateSeats(trip.bus.totalSeats));
    for (const p of passengers) {
      if (!validSeats.has(p.seatNumber)) {
        throw new AppError(`Seat ${p.seatNumber} does not exist on this bus`, 400);
      }
    }

    const status = requirePayment ? "PENDING" : "CONFIRMED";

    let bookingId;
    try {
      // All or nothing: if any seat is taken, the whole booking is rolled back
      bookingId = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            userId: req.user.id,
            tripId,
            totalAmount: trip.price * passengers.length,
            status,
          },
        });

        // The unique rule on (tripId, seatNumber) rejects a seat that is already booked
        await tx.bookingSeat.createMany({
          data: passengers.map((p) => ({
            bookingId: booking.id,
            tripId,
            seatNumber: p.seatNumber,
            passengerName: p.name,
            passengerPhone: p.phone,
            gender: p.gender,
          })),
        });

        return booking.id;
      });
    } catch (err) {
      if (err.code === "P2002") {
        throw new AppError("One or more seats are already booked. Please choose different seats.", 409);
      }
      throw err;
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
    res.status(201).json({
      message: requirePayment ? "Seats held. Complete the payment to confirm your booking." : "Booking confirmed",
      data: formatBooking(booking),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings/:id/pay   body: { "method": "CARD" | "BKASH" | "NAGAD" | "ROCKET" | "UPAY" }
// DEMO ONLY: no real payment happens. It just records the method and a fake transaction id.
async function payBooking(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const { method } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.userId !== req.user.id) throw new AppError("You cannot pay for this booking", 403);
    if (booking.status === "CANCELLED") {
      throw new AppError("This booking has expired or was cancelled. Please book again.", 400);
    }
    if (booking.status === "CONFIRMED") throw new AppError("This booking is already paid", 400);

    // updateMany only changes a booking that is still PENDING, so a double click cannot pay twice
    const result = await prisma.booking.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "CONFIRMED", paymentMethod: method, paymentRef: makePaymentRef(), paidAt: new Date() },
    });
    if (result.count === 0) throw new AppError("This booking can no longer be paid", 409);

    const updated = await prisma.booking.findUnique({ where: { id }, include: bookingInclude });
    res.json({ message: "Payment successful", data: formatBooking(updated) });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/my
async function myBookings(req, res, next) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: bookingInclude,
    });
    res.json({ data: bookings.map(formatBooking) });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/:id   (owner or admin)
async function getBooking(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { ...bookingInclude, user: true },
    });
    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.userId !== req.user.id && req.user.role !== "ADMIN") {
      throw new AppError("You cannot view this booking", 403);
    }
    res.json({ data: formatBooking(booking) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/bookings/:id/cancel   (owner or admin)
async function cancelBooking(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id }, include: { trip: true } });
    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.userId !== req.user.id && req.user.role !== "ADMIN") {
      throw new AppError("You cannot cancel this booking", 403);
    }
    if (booking.status === "CANCELLED") throw new AppError("This booking is already cancelled", 400);
    if (req.user.role !== "ADMIN" && hasDeparted(booking.trip.travelDate, booking.trip.departureTime)) {
      throw new AppError("This trip has already departed and cannot be cancelled", 400);
    }

    await cancelBookingById(id);

    const updated = await prisma.booking.findUnique({ where: { id }, include: bookingInclude });
    res.json({ message: "Booking cancelled", data: formatBooking(updated) });
  } catch (err) {
    next(err);
  }
}

module.exports = { createBooking, payBooking, myBookings, getBooking, cancelBooking };
