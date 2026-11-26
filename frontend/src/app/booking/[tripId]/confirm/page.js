"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import useApi from "@/hooks/useApi";
import useRequireAuth from "@/hooks/useRequireAuth";
import TripSummary from "@/components/trips/TripSummary";
import FareSummary from "@/components/trips/FareSummary";
import Field from "@/components/admin/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";

const GENDERS = [
  ["M", "Male"],
  ["F", "Female"],
  ["O", "Other"],
];

// Three buttons. Click the selected one again to clear it.
function GenderPick({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {GENDERS.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(value === v ? "" : v)}
          className={`h-9 flex-1 rounded-md border text-sm ${
            value === v ? "border-green-600 bg-green-50 text-green-700" : "bg-white hover:border-green-600"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ConfirmContent() {
  const { tripId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, ready } = useRequireAuth();
  const { data, loading } = useApi(ready ? `/trips/${tripId}` : null, false);
  const trip = data?.data;

  const [passengers, setPassengers] = useState({}); // { A1: { name, phone, gender } }
  const [submitting, setSubmitting] = useState(false);

  if (!ready || loading) return <p className="text-slate-500">Loading...</p>;
  if (!trip) return <p className="text-slate-600">This trip could not be found.</p>;

  const requested = (searchParams.get("seats") || "").split(",").filter(Boolean);
  const seats = requested.filter((s) => trip.seatLayout.includes(s) && !trip.bookedSeats.includes(s));

  if (seats.length === 0 || seats.length !== requested.length) {
    return (
      <div className="space-y-3">
        <p className="text-slate-600">
          Some of the selected seats are no longer available. Please choose your seats again.
        </p>
        <Link href={`/trips/${tripId}`} className="text-green-600 hover:underline">
          Back to seat selection
        </Link>
      </div>
    );
  }

  // The first passenger is prefilled with the logged-in user
  const get = (seat, i) =>
    passengers[seat] ?? (i === 0 ? { name: user.name, phone: user.phone, gender: "" } : { name: "", phone: "", gender: "" });

  const update = (seat, i, key, value) => setPassengers({ ...passengers, [seat]: { ...get(seat, i), [key]: value } });

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        tripId: Number(tripId),
        passengers: seats.map((seat, i) => {
          const p = get(seat, i);
          const out = { seatNumber: seat, name: p.name };
          if (p.phone) out.phone = p.phone;
          if (p.gender) out.gender = p.gender;
          return out;
        }),
      };
      const res = await api("/bookings", { method: "POST", body });
      toast.success("Booking confirmed");
      router.replace(`/tickets/${res.data.id}`);
    } catch (err) {
      toast.error(err.errors?.length ? `${err.message}: ${err.errors[0].message}` : err.message);
      if (err.status === 409) router.push(`/trips/${tripId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {/* Passenger forms */}
      <form id="passenger-form" onSubmit={onSubmit} className="space-y-4 md:col-span-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Passenger details</h1>
            <p className="text-sm text-slate-500">
              Passenger 1 is filled with your account details. Change it if someone else is travelling.
            </p>
          </div>
          <Link href={`/trips/${tripId}`} className="shrink-0 text-sm text-green-600 hover:underline">
            Change seats
          </Link>
        </div>

        {seats.map((seat, i) => {
          const p = get(seat, i);
          return (
            <div key={seat} className="rounded-lg border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">
                  Passenger {i + 1}
                  {i === 0 && <span className="font-normal text-slate-400"> (you)</span>}
                </p>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Seat {seat}
                </span>
              </div>

              <div className="space-y-3">
                <Field label="Full name" htmlFor={`name-${seat}`}>
                  <Input
                    id={`name-${seat}`}
                    value={p.name}
                    onChange={(e) => update(seat, i, "name", e.target.value)}
                    required
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Phone (optional)" htmlFor={`phone-${seat}`}>
                    <Input
                      id={`phone-${seat}`}
                      value={p.phone}
                      onChange={(e) => update(seat, i, "phone", e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </Field>
                  <Field label="Gender (optional)">
                    <GenderPick value={p.gender} onChange={(v) => update(seat, i, "gender", v)} />
                  </Field>
                </div>
              </div>
            </div>
          );
        })}
      </form>

      {/* Summary */}
      <aside className="md:col-span-2">
        <div className="space-y-4 rounded-lg border bg-white p-4 md:sticky md:top-24">
          <h2 className="font-semibold">Booking summary</h2>
          <TripSummary trip={trip} />

          <div className="border-t pt-3">
            <FareSummary seats={seats} price={trip.price} />
          </div>

          <Button type="submit" form="passenger-form" disabled={submitting} className="w-full bg-green-600 hover:bg-green-700">
            {submitting ? "Booking..." : `Confirm booking - ${formatPrice(trip.price * seats.length)}`}
          </Button>

          <ul className="space-y-1 text-xs text-slate-500">
            <li>Your ticket will appear in My Bookings.</li>
            <li>Free cancellation any time before departure.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default function ConfirmBookingPage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading...</p>}>
      <ConfirmContent />
    </Suspense>
  );
}