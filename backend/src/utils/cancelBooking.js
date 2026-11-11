const prisma = require("../config/prisma");

// Marks the booking CANCELLED and deletes its seat rows so the seats become free again.
// Both happen together or not at all.
function cancelBookingById(bookingId) {
  return prisma.$transaction([
    prisma.bookingSeat.deleteMany({ where: { bookingId } }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } }),
  ]);
}

module.exports = cancelBookingById;
