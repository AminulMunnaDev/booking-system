"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import useApi from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import SeatGrid from "@/components/seats/SeatGrid";
import TripSummary from "@/components/trips/TripSummary";
import FareSummary from "@/components/trips/FareSummary";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

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
    <div className="space-y-6">
      <button type="button" onClick={() => router.back()} className="text-sm text-green-600 hover:underline">
        Back to results
      </button>

      {/* Trip overview */}
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="md:max-w-md md:flex-1">
          <TripSummary trip={trip} />
        </div>
        <div className="flex gap-6 text-sm md:text-right">
          <div>
            <p className="text-xs text-slate-500">Price per seat</p>
            <p className="text-lg font-bold">{formatPrice(trip.price)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Seats available</p>
            <p className="text-lg font-bold">
              {trip.seatsLeft} <span className="text-sm font-normal text-slate-400">of {trip.bus.totalSeats}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Seat map */}
        <div className="rounded-lg border bg-slate-50 p-4 md:col-span-3">
          <h1 className="mb-4 text-lg font-semibold">Select your seats</h1>
          <SeatGrid
            seatLayout={trip.seatLayout}
            bookedSeats={trip.bookedSeats}
            selected={selected}
            onToggle={toggle}
          />
        </div>

        {/* Selection */}
        <div className="md:col-span-2">
          <div className="space-y-4 rounded-lg border bg-white p-4 md:sticky md:top-24">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Your selection</h2>
              <span className="text-xs text-slate-500">
                {selected.length} of {MAX_SEATS} seats
              </span>
            </div>

            {sorted.length === 0 ? (
              <p className="text-sm text-slate-500">Tap a seat on the map to select it.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sorted.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-100"
                    aria-label={`Remove seat ${s}`}
                  >
                    {s} &times;
                  </button>
                ))}
              </div>
            )}

            <div className="border-t pt-3">
              <FareSummary seats={sorted} price={trip.price} />
            </div>

            {!trip.isBookable && <p className="text-sm font-medium text-red-600">This trip has already departed.</p>}

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={selected.length === 0 || !trip.isBookable}
              onClick={onContinue}
            >
              {user ? "Continue to passenger details" : "Login to continue"}
            </Button>

            <ul className="space-y-1 text-xs text-slate-500">
              <li>Up to {MAX_SEATS} seats per booking.</li>
              <li>Free cancellation any time before departure.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
