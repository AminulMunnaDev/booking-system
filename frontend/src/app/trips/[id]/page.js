"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import useApi from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import SeatGrid from "@/components/seats/SeatGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime, formatPrice } from "@/lib/format";

const MAX_SEATS = 4;

export default function TripPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading } = useApi(`/trips/${id}`, false);
  const [selected, setSelected] = useState([]);
  const trip = data?.data;

  if (loading) return <p className="text-slate-500">Loading...</p>;

  if (!trip) {
    return (
      <div className="space-y-3">
        <p className="text-slate-600">This trip could not be found.</p>
        <Link href="/" className="text-green-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  // Keep selected seats in seat order (A1, A2, B1 ...)
  const sorted = [...selected].sort((a, b) => trip.seatLayout.indexOf(a) - trip.seatLayout.indexOf(b));
  const total = trip.price * selected.length;

  function toggle(seat) {
    if (selected.includes(seat)) setSelected(selected.filter((s) => s !== seat));
    else if (selected.length >= MAX_SEATS) toast.error(`You can select at most ${MAX_SEATS} seats`);
    else setSelected([...selected, seat]);
  }

  function onContinue() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/trips/${id}`)}`);
      return;
    }
    router.push(`/booking/${id}/confirm?seats=${sorted.join(",")}`);
  }

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-3">
        <h1 className="mb-4 text-xl font-semibold">Select your seats</h1>
        <SeatGrid
          seatLayout={trip.seatLayout}
          bookedSeats={trip.bookedSeats}
          selected={selected}
          onToggle={toggle}
        />
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {trip.route.fromCity} to {trip.route.toCity}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              {formatDate(trip.travelDate)}, {formatTime(trip.departureTime)}
              {trip.arrivalTime && ` to ${formatTime(trip.arrivalTime)}`}
            </p>
            <p className="flex items-center gap-2">
              {trip.bus.name}
              <Badge variant="outline">{trip.bus.type === "AC" ? "AC" : "Non-AC"}</Badge>
            </p>
            <p>{trip.seatsLeft} seats left</p>
            <p>Price per seat: {formatPrice(trip.price)}</p>

            <div className="border-t pt-3">
              <p className="font-medium">Selected seats: {sorted.length ? sorted.join(", ") : "none"}</p>
              <p className="text-lg font-bold">Total: {formatPrice(total)}</p>
            </div>

            {!trip.isBookable && <p className="font-medium text-red-600">This trip has already departed.</p>}

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={selected.length === 0 || !trip.isBookable}
              onClick={onContinue}
            >
              {user ? "Continue" : "Login to continue"}
            </Button>
            <p className="text-xs text-slate-500">You can book up to {MAX_SEATS} seats at a time.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
