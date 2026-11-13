"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import useApi from "@/hooks/useApi";
import useRequireAuth from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Field, { selectClass } from "@/components/admin/FormField";
import { formatDate, formatTime, formatPrice } from "@/lib/format";

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

  // First passenger is prefilled with the logged-in user
  const get = (seat, i) =>
    passengers[seat] ?? (i === 0 ? { name: user.name, phone: user.phone, gender: "" } : { name: "", phone: "", gender: "" });

  const setField = (seat, i, key) => (e) =>
    setPassengers({ ...passengers, [seat]: { ...get(seat, i), [key]: e.target.value } });

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
      <form onSubmit={onSubmit} className="space-y-4 md:col-span-3">
        <h1 className="text-xl font-semibold">Passenger details</h1>

        {seats.map((seat, i) => {
          const p = get(seat, i);
          return (
            <Card key={seat}>
              <CardHeader>
                <CardTitle className="text-base">Seat {seat}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Passenger name" htmlFor={`name-${seat}`}>
                  <Input id={`name-${seat}`} value={p.name} onChange={setField(seat, i, "name")} required />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone (optional)" htmlFor={`phone-${seat}`}>
                    <Input id={`phone-${seat}`} value={p.phone} onChange={setField(seat, i, "phone")} />
                  </Field>
                  <Field label="Gender (optional)" htmlFor={`gender-${seat}`}>
                    <select
                      id={`gender-${seat}`}
                      className={selectClass}
                      value={p.gender}
                      onChange={setField(seat, i, "gender")}
                    >
                      <option value="">Not set</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </Field>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button type="submit" disabled={submitting} className="w-full bg-green-600 hover:bg-green-700">
          {submitting ? "Booking..." : "Confirm booking"}
        </Button>
      </form>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Trip summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">
              {trip.route.fromCity} to {trip.route.toCity}
            </p>
            <p>
              {formatDate(trip.travelDate)}, {formatTime(trip.departureTime)}
            </p>
            <p>{trip.bus.name}</p>
            <p>Seats: {seats.join(", ")}</p>
            <p className="border-t pt-2 text-lg font-bold">Total: {formatPrice(trip.price * seats.length)}</p>
          </CardContent>
        </Card>
      </div>
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
