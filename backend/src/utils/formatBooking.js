const { hasDeparted } = require("./dhakaTime");
const { PAYMENT_WINDOW_MINUTES } = require("./payment");

// Use this include whenever you load a booking
const bookingInclude = {
  trip: { include: { route: true, bus: true } },
  seats: true,
};

function formatBooking(b) {
  const expiresAtMs = new Date(b.createdAt).getTime() + PAYMENT_WINDOW_MINUTES * 60 * 1000;
  // Only unpaid (PENDING) bookings have a countdown
  const expiresAt = b.status === "PENDING" ? new Date(expiresAtMs).toISOString() : null;
  const secondsLeft = b.status === "PENDING" ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000)) : null;

  return {
    id: b.id,
    status: b.status,
    totalAmount: b.totalAmount,
    createdAt: b.createdAt,
    expiresAt,
    paymentMethod: b.paymentMethod ?? null,
    paymentRef: b.paymentRef ?? null,
    paidAt: b.paidAt ?? null,
    secondsLeft,
    canPay: b.status === "PENDING" && secondsLeft > 0,
    canCancel:
      b.status !== "CANCELLED" && b.trip ? !hasDeparted(b.trip.travelDate, b.trip.departureTime) : false,
    user: b.user
      ? { id: b.user.id, name: b.user.name, email: b.user.email, phone: b.user.phone }
      : undefined,
    trip: b.trip
      ? {
          id: b.trip.id,
          travelDate: b.trip.travelDate.toISOString().slice(0, 10),
          departureTime: b.trip.departureTime,
          arrivalTime: b.trip.arrivalTime,
          price: b.trip.price,
          route: { fromCity: b.trip.route.fromCity, toCity: b.trip.route.toCity },
          bus: { name: b.trip.bus.name, type: b.trip.bus.type },
        }
      : undefined,
    seats: (b.seats || []).map((s) => ({
      seatNumber: s.seatNumber,
      passengerName: s.passengerName,
      passengerPhone: s.passengerPhone,
      gender: s.gender,
    })),
  };
}

module.exports = { bookingInclude, formatBooking };
