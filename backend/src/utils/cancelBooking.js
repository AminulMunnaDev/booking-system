const prisma = require("../config/prisma");
const AppError = require("./AppError");

// Marks the booking CANCELLED and deletes its seat rows so the seats become free again.
// Both happen together or not at all, and only once even under concurrent requests.
async function cancelBookingById(bookingId) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.updateMany({
      where: {
        id: bookingId,
        status: { not: "CANCELLED" },
      },
      data: { status: "CANCELLED" },
    });

    if (updated.count === 0) {
      throw new AppError("This booking is already cancelled", 400);
    }

    await tx.bookingSeat.deleteMany({ where: { bookingId } });
  });
}

module.exports = cancelBookingById;