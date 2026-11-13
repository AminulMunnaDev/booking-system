"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useApi from "@/hooks/useApi";
import useRequireAuth from "@/hooks/useRequireAuth";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime, formatPrice } from "@/lib/format";

export default function TicketPage() {
  const { bookingId } = useParams();
  const { ready } = useRequireAuth();
  const { data, loading } = useApi(ready ? `/bookings/${bookingId}` : null);
  const b = data?.data;

  if (!ready || loading) return <p className="text-slate-500">Loading...</p>;
  if (!b) return <p className="text-slate-600">Ticket not found.</p>;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href="/my-bookings" className="text-sm text-green-600 hover:underline">
          Back to my bookings
        </Link>
        <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700">
          Print ticket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">BusGo e-ticket</CardTitle>
            <StatusBadge status={b.status} />
          </div>
          <p className="text-sm text-slate-500">Booking #{b.id}</p>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-lg font-semibold">
              {b.trip.route.fromCity} to {b.trip.route.toCity}
            </p>
            <p>
              {formatDate(b.trip.travelDate)}, departs {formatTime(b.trip.departureTime)}
              {b.trip.arrivalTime && `, arrives ${formatTime(b.trip.arrivalTime)}`}
            </p>
            <p>
              {b.trip.bus.name} ({b.trip.bus.type === "AC" ? "AC" : "Non-AC"})
            </p>
          </div>

          {b.status === "CANCELLED" ? (
            <p className="rounded-md bg-red-50 p-3 font-medium text-red-700">
              This booking was cancelled. The ticket is no longer valid.
            </p>
          ) : (
            <div>
              <p className="mb-2 font-medium">Passengers</p>
              <ul className="space-y-1">
                {b.seats.map((s) => (
                  <li key={s.seatNumber} className="flex justify-between border-b pb-1">
                    <span>{s.passengerName}</span>
                    <span className="font-semibold">Seat {s.seatNumber}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="border-t pt-3 text-lg font-bold">Total paid: {formatPrice(b.totalAmount)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
