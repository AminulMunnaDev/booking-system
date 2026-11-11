const { hasDeparted } = require("./dhakaTime");

// Use this include whenever you load a booking
const bookingInclude = {
  trip: { include: { route: true, bus: true } },
  seats: true,
};

function formatBooking(b) {
  return {
    id: b.id,
    status: b.status,
    totalAmount: b.totalAmount,
    createdAt: b.createdAt,
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
