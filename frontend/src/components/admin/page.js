"use client";

import useApi from "@/hooks/useApi";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const { data, loading } = useApi("/admin/stats");
  const s = data?.data;

  return (
    <div>
      <PageHeader title="Dashboard" />

      {loading && <p className="text-slate-500">Loading...</p>}

      {s && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard title="Total bookings" value={s.totalBookings} />
            <StatCard title="Revenue" value={`BDT ${s.totalRevenue.toLocaleString()}`} />
            <StatCard title="Bookings today" value={s.bookingsToday} />
            <StatCard title="Cancelled" value={s.cancelledBookings} />
            <StatCard title="Users" value={s.totalUsers} />
            <StatCard title="Total trips" value={s.totalTrips} />
            <StatCard title="Upcoming trips" value={s.upcomingTrips} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Popular routes</CardTitle>
            </CardHeader>
            <CardContent>
              {s.popularRoutes.length === 0 ? (
                <p className="text-sm text-slate-500">No bookings yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {s.popularRoutes.map((r) => (
                    <li key={r.routeId} className="flex justify-between border-b pb-2">
                      <span>
                        {r.fromCity} to {r.toCity}
                      </span>
                      <span className="font-medium">{r.bookingCount} bookings</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
