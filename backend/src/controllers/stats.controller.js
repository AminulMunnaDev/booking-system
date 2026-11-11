const prisma = require("../config/prisma");
const { dhakaNow } = require("../utils/dhakaTime");

// GET /api/admin/stats
async function getStats(req, res, next) {
  try {
    const today = dhakaNow().date;
    const startOfToday = new Date(`${today}T00:00:00+06:00`); // midnight in Dhaka

    const [
      totalBookings,
      cancelledBookings,
      revenue,
      bookingsToday,
      totalUsers,
      totalTrips,
      upcomingTrips,
      routes,
    ] = await Promise.all([
      prisma.booking.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.trip.count(),
      prisma.trip.count({
        where: { isActive: true, travelDate: { gte: new Date(`${today}T00:00:00.000Z`) } },
      }),
      prisma.route.findMany({
        include: {
          trips: {
            select: {
              _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
            },
          },
        },
      }),
    ]);

    const popularRoutes = routes
      .map((r) => ({
        routeId: r.id,
        fromCity: r.fromCity,
        toCity: r.toCity,
        bookingCount: r.trips.reduce((sum, t) => sum + t._count.bookings, 0),
      }))
      .filter((r) => r.bookingCount > 0)
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);

    res.json({
      data: {
        totalBookings,
        cancelledBookings,
        totalRevenue: revenue._sum.totalAmount || 0,
        bookingsToday,
        totalUsers,
        totalTrips,
        upcomingTrips,
        popularRoutes,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
