"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import useApi from "@/hooks/useApi";
import useRequireAuth from "@/hooks/useRequireAuth";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDate, formatTime, formatPrice } from "@/lib/format";

export default function MyBookingsPage() {
  const { ready } = useRequireAuth();
  const { data, loading, reload } = useApi(ready ? "/bookings/my" : null);
  const [cancelling, setCancelling] = useState(null);
  const [busy, setBusy] = useState(false);

  async function confirmCancel() {
    setBusy(true);
    try {
      await api(`/bookings/${cancelling.id}/cancel`, { method: "PATCH" });
      toast.success("Booking cancelled");
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(null);
      setBusy(false);
    }
  }

  if (!ready || loading) return <p className="text-slate-500">Loading...</p>;

  const bookings = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My bookings</h1>

      {bookings.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-slate-500">
          <p>You have no bookings yet.</p>
          <Link href="/" className="text-green-600 hover:underline">
            Search for a trip
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-semibold">
                  {b.trip.route.fromCity} to {b.trip.route.toCity}
                  <StatusBadge status={b.status} />
                </p>
                <p className="text-sm text-slate-600">
                  {formatDate(b.trip.travelDate)}, {formatTime(b.trip.departureTime)} - {b.trip.bus.name}
                </p>
                <p className="text-sm text-slate-500">
                  Booking #{b.id}
                  {b.seats.length > 0 && ` - Seats: ${b.seats.map((s) => s.seatNumber).join(", ")}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="font-bold">{formatPrice(b.totalAmount)}</p>
                <Link href={`/tickets/${b.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Ticket
                </Link>
                {b.canCancel && (
                  <Button variant="destructive" size="sm" onClick={() => setCancelling(b)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(o) => !o && setCancelling(null)}
        title="Cancel this booking?"
        description="Your seats will be released. This cannot be undone."
        confirmText="Cancel booking"
        onConfirm={confirmCancel}
        loading={busy}
      />
    </div>
  );
}
