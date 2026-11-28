"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useApi from "@/hooks/useApi";
import useRequireAuth from "@/hooks/useRequireAuth";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime, formatPrice } from "@/lib/format";
import { formatDateTime, methodLabel } from "@/lib/payment";

export default function TicketPage() {
  const { bookingId } = useParams();
  const { ready } = useRequireAuth();
  const { data, loading } = useApi(ready ? `/bookings/${bookingId}` : null);
  const b = data?.data;

  if (!ready || loading) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <span className="inline-block rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-500 shadow-2xs">
          Loading e-ticket...
        </span>
      </div>
    );
  }

  if (!b) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm space-y-3">
        <p className="text-base font-semibold text-slate-900">Ticket not found.</p>
        <Link
          href="/my-bookings"
          className="inline-flex text-sm font-semibold text-green-600 hover:text-green-700 hover:underline"
        >
          Back to my bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-2 py-2 sm:px-0">
      {/* Top Bar Actions */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-green-300 hover:bg-green-50/50 hover:text-green-700"
        >
          <span aria-hidden="true">←</span>
          <span>Back to my bookings</span>
        </Link>

        {b.status === "CONFIRMED" && (
          <Button
            onClick={() => window.print()}
            className="h-9 bg-green-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md hover:shadow-green-600/20"
          >
            Print ticket
          </Button>
        )}
      </div>

      {/* Pending Payment Alert */}
      {b.status === "PENDING" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs sm:text-sm text-amber-900 print:hidden">
          <span className="font-medium">Payment pending. Pay to confirm your seats.</span>
          {b.canPay && (
            <Link
              href={`/payment/${b.id}`}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-green-600 px-3.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-green-700"
            >
              Pay now
            </Link>
          )}
        </div>
      )}

      {/* E-Ticket Card */}
      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
        <CardHeader className="border-b border-green-100 bg-green-50/50 pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
              BusGo e-ticket
            </CardTitle>
            <StatusBadge status={b.status} />
          </div>
          <p className="text-xs font-medium text-slate-500">
            Booking <span className="font-semibold text-slate-700">#{b.id}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-5 text-sm">
          {/* Route & Schedule */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-1">
            <p className="text-lg font-bold text-slate-900">
              {b.trip.route.fromCity} → {b.trip.route.toCity}
            </p>
            <p className="text-xs font-medium text-slate-700">
              {formatDate(b.trip.travelDate)} · Departs{" "}
              <span className="font-semibold text-green-700">{formatTime(b.trip.departureTime)}</span>
              {b.trip.arrivalTime && (
                <>
                  {" "}
                  · Arrives <span className="font-semibold text-slate-900">{formatTime(b.trip.arrivalTime)}</span>
                </>
              )}
            </p>
            <p className="text-xs text-slate-500">
              {b.trip.bus.name} ·{" "}
              <span className="font-semibold text-slate-700">
                {b.trip.bus.type === "AC" ? "AC" : "Non-AC"}
              </span>
            </p>
          </div>

          {/* Perforated Ticket Divider */}
          <div className="border-t border-dashed border-slate-200" />

          {/* Cancelled State or Passenger Seat List */}
          {b.status === "CANCELLED" ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs sm:text-sm font-medium text-rose-700">
              This booking was cancelled. The ticket is no longer valid.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Passengers
                </p>
                <span className="text-xs font-medium text-slate-500">
                  {b.seats.length} {b.seats.length === 1 ? "seat" : "seats"}
                </span>
              </div>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white px-3.5">
                {b.seats.map((s) => (
                  <li key={s.seatNumber} className="flex items-center justify-between py-2.5 text-xs sm:text-sm">
                    <span className="font-medium text-slate-800">{s.passengerName}</span>
                    <span className="rounded-md border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      Seat {s.seatNumber}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Total & Payment Receipt */}
          <div className="space-y-1.5 border-t border-slate-200/80 pt-3.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {b.status === "CONFIRMED" ? "Total paid" : "Total"}
              </span>
              <span className="text-xl font-extrabold text-green-700">
                {formatPrice(b.totalAmount)}
              </span>
            </div>

            {b.paymentRef && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
                Paid via <strong className="font-semibold text-slate-700">{methodLabel(b.paymentMethod)}</strong> on{" "}
                {formatDateTime(b.paidAt)} · Txn ID:{" "}
                <span className="font-mono font-semibold text-slate-700">{b.paymentRef}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
