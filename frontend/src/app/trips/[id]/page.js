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

function TripStateCard({ title, description, actionLabel, actionHref }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm space-y-3">
      <p className="text-base font-bold text-slate-900">{title}</p>
      {description && <p className="text-sm text-slate-500">{description}</p>}
      {actionLabel && actionHref && (
        <div className="pt-1">
          <Link
            href={actionHref}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}

function TripOverviewBanner({ trip, onBack }) {
  const lowSeats = trip.seatsLeft > 0 && trip.seatsLeft < 10;

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-green-300 hover:bg-green-50/60 hover:text-green-700"
        >
          <span aria-hidden="true">←</span>
          <span>Back to results</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="md:max-w-xl md:flex-1">
          <TripSummary trip={trip} />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 md:flex md:gap-6 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-right">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Price per seat
            </p>
            <p className="mt-0.5 text-lg sm:text-xl font-extrabold text-green-700">
              {formatPrice(trip.price)}
            </p>
          </div>

          <div className="border-l border-slate-200 pl-3 md:border-l-0 md:pl-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Seats available
            </p>
            <p
              className={`mt-0.5 text-lg sm:text-xl font-extrabold ${
                lowSeats ? "text-rose-600" : "text-slate-900"
              }`}
            >
              {trip.seatsLeft}{" "}
              <span className="text-xs font-medium text-slate-400">
                / {trip.bus.totalSeats}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeatMapSection({ trip, selected, onToggle }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm lg:col-span-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">Select your seats</h1>
          <p className="text-xs text-slate-500">
            Tap any available seat to add or remove it.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
          {trip.bus.type === "AC" ? "AC Coach" : "Non-AC Coach"}
        </span>
      </div>

      <SeatGrid
        seatLayout={trip.seatLayout}
        bookedSeats={trip.bookedSeats}
        selected={selected}
        onToggle={onToggle}
      />
    </section>
  );
}

function SelectionSummaryCard({ trip, selectedSeats, onRemoveSeat, onContinue, isLoggedIn }) {
  return (
    <aside className="lg:col-span-5">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Your selection</h2>
          <span className="rounded-full border border-green-200/80 bg-green-50/70 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            {selectedSeats.length} of {MAX_SEATS} seats
          </span>
        </div>

        {selectedSeats.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center">
            <p className="text-sm font-medium text-slate-700">No seats selected yet</p>
            <p className="mt-0.5 text-xs text-slate-400">
              Choose up to {MAX_SEATS} seats from the coach map.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <button
                key={seat}
                type="button"
                onClick={() => onRemoveSeat(seat)}
                className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs sm:text-sm font-semibold text-green-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Remove seat ${seat}`}
              >
                <span>{seat}</span>
                <span aria-hidden="true" className="text-xs opacity-75">
                  &times;
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5">
          <FareSummary seats={selectedSeats} price={trip.price} />
        </div>

        {!trip.isBookable && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            This trip has already departed.
          </p>
        )}

        <Button
          className="h-11 w-full bg-green-600 text-white font-semibold shadow-sm transition-all hover:bg-green-700 hover:shadow-md hover:shadow-green-600/20 disabled:opacity-50"
          disabled={selectedSeats.length === 0 || !trip.isBookable}
          onClick={onContinue}
        >
          {isLoggedIn ? "Continue to passenger details" : "Login to continue"}
        </Button>

        <ul className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            <span>Up to {MAX_SEATS} seats per booking.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span>Free cancellation any time before departure.</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default function TripPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading } = useApi(`/trips/${id}`, false);
  const [selected, setSelected] = useState([]);
  const trip = data?.data;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
          Loading trip details...
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <TripStateCard
        title="This trip could not be found."
        description="The schedule may have changed or no longer be available."
        actionLabel="Back to home"
        actionHref="/"
      />
    );
  }

  const sortedSelected = [...selected].sort(
    (a, b) => trip.seatLayout.indexOf(a) - trip.seatLayout.indexOf(b)
  );

  function toggleSeat(seat) {
    if (selected.includes(seat)) {
      setSelected(selected.filter((s) => s !== seat));
    } else if (selected.length >= MAX_SEATS) {
      toast.error(`You can select at most ${MAX_SEATS} seats`);
    } else {
      setSelected([...selected, seat]);
    }
  }

  function handleContinue() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/trips/${id}`)}`);
      return;
    }
    router.push(`/booking/${id}/confirm?seats=${sortedSelected.join(",")}`);
  }

  return (
    <div className="space-y-6">
      <TripOverviewBanner trip={trip} onBack={() => router.back()} />

      <div className="grid gap-6 lg:grid-cols-12">
        <SeatMapSection trip={trip} selected={selected} onToggle={toggleSeat} />
        <SelectionSummaryCard
          trip={trip}
          selectedSeats={sortedSelected}
          onRemoveSeat={toggleSeat}
          onContinue={handleContinue}
          isLoggedIn={Boolean(user)}
        />
      </div>
    </div>
  );
}