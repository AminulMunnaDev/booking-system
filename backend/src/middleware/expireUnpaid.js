const prisma = require("../config/prisma");
const cancelBookingById = require("../utils/cancelBooking");
const { PAYMENT_WINDOW_MINUTES } = require("../utils/payment");

// Runs before every API request. Any PENDING booking older than the payment window
// is cancelled and its seats are released. No cron job needed.
async function expireUnpaid(req, res, next) {
  try {
    const cutoff = new Date(Date.now() - PAYMENT_WINDOW_MINUTES * 60 * 1000);
    const stale = await prisma.booking.findMany({
      where: { status: "PENDING", createdAt: { lt: cutoff } },
      select: { id: true },
    });
    for (const b of stale) await cancelBookingById(b.id);
  } catch (err) {
    // Never block a request because of cleanup
    console.error("Could not expire unpaid bookings:", err.message);
  }
  next();
}

module.exports = expireUnpaid;
