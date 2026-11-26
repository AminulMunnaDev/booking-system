"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import useApi from "@/hooks/useApi";
import useRequireAuth from "@/hooks/useRequireAuth";
import TripSummary from "@/components/trips/TripSummary";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { formatDateTime, methodLabel } from "@/lib/payment";

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { ready } = useRequireAuth();
  const { data, loading } = useApi(ready ? `/bookings/${bookingId}` : null);
  const b = data?.data;

  // Not paid yet: send the user back to the payment page
  useEffect(() => {
    if (b && b.status === "PENDING") router.replace(`/payment/${bookingId}`);
  }, [b, bookingId, router]);

  if (!ready || loading) return <p className="text-slate-500">Loading...</p>;
  if (!b) return <p className="text-slate-600">Booking not found.</p>;
  if (b.status !== "CONFIRMED") {
    return (
      <p className="text-slate-600">
        This booking is not confirmed.{" "}
        <Link href="/my-bookings" className="text-green-600 hover:underline">
          Go to my bookings
        </Link>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="text-2xl font-bold">Payment successful</h1>
        <p className="text-slate-600">Your booking is confirmed. Have a safe journey!</p>
      </div>

      <div className="space-y-2 rounded-lg border bg-white p-4">
        <Row label="Amount paid" value={formatPrice(b.totalAmount)} />
        <Row label="Payment method" value={methodLabel(b.paymentMethod)} />
        <Row label="Transaction ID" value={b.paymentRef || "-"} />
        <Row label="Paid on" value={formatDateTime(b.paidAt)} />
        <Row label="Booking number" value={`#${b.id}`} />
      </div>

      <div className="space-y-3 rounded-lg border bg-white p-4">
        <TripSummary trip={b.trip} />
        <div className="border-t pt-3 text-sm">
          <p className="mb-1 font-medium">Passengers</p>
          <ul className="space-y-1">
            {b.seats.map((s) => (
              <li key={s.seatNumber} className="flex justify-between">
                <span>{s.passengerName}</span>
                <span className="font-semibold">Seat {s.seatNumber}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={`/tickets/${b.id}`} className={buttonVariants() + " flex-1 bg-green-600 hover:bg-green-700"}>
          View ticket
        </Link>
        <Link href="/my-bookings" className={buttonVariants({ variant: "outline" }) + " flex-1"}>
          My bookings
        </Link>
        <Link href="/" className={buttonVariants({ variant: "ghost" }) + " flex-1"}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
