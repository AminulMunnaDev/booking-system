"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatTime, formatPrice } from "@/lib/format";
import { arrivalDateOf, durationMinutes, formatDuration } from "@/lib/trips";
import { AlertCircle } from "lucide-react";

export default function TripCard({ trip }) {
  const [showPolicy, setShowPolicy] = useState(false);
  const soldOut = trip.seatsLeft <= 0;
  const mins = durationMinutes(trip.departureTime, trip.arrivalTime);
  const arrDate = arrivalDateOf(trip);
  const hasDiscount = trip.originalPrice && trip.originalPrice > trip.price; // ready for discounts later
// Helper for dynamic seat-availability badge styling (put right above return)
const getSeatGlowStyle = (seatsLeft, soldOut) => {
  if (soldOut) {
    return {
      box: "bg-slate-100/80",
      number: "text-slate-400",
      sub: "text-slate-400",
      dot: "bg-slate-400",
    };
  }
  if (seatsLeft < 10) {
    // Under 10 seats -> Red glow
    return {
      box: "bg-red-50/70 ring-1 ring-inset ring-red-200 shadow-[0_0_15px_rgba(239,68,68,0.28)]",
      number: "text-red-600",
      sub: "font-semibold text-red-600",
      dot: "bg-red-500 animate-pulse",
    };
  }
  if (seatsLeft <= 20) {
    // 10–20 seats -> Yellow/Amber glow
    return {
      box: "bg-amber-50/70 ring-1 ring-inset ring-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.28)]",
      number: "text-amber-700",
      sub: "font-semibold text-amber-600",
      dot: "bg-amber-500",
    };
  }
  // Above 20 seats (e.g., 40-seat bus with plenty of seats) -> Fresh green/neutral
  return {
    box: "bg-green-50/50",
    number: "text-slate-900",
    sub: "text-green-700 font-medium",
    dot: "bg-green-500",
  };
};

const seatStyle = getSeatGlowStyle(trip.seatsLeft, soldOut);

 return (
  <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-green-300 hover:shadow-md transition-all">
    <div className="grid gap-5 md:grid-cols-[1.2fr_1.8fr_1.2fr] md:items-center">
      {/* 1. Bus Info */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-bold text-slate-900">{trip.bus.name}</p>
          <Badge
            variant="outline"
            className={
              trip.bus.type === "AC"
                ? "border-green-200 bg-green-50 text-green-700 font-semibold"
                : "border-slate-200 bg-slate-50 text-slate-600 font-medium"
            }
          >
            {trip.bus.type === "AC" ? "AC" : "Non-AC"}
          </Badge>
        </div>
        <p className="text-xs font-medium text-slate-500">
          {trip.route.fromCity} → {trip.route.toCity}
        </p>
      </div>

      {/* 2. Departure & Arrival Timeline */}
      <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50/70 px-3.5 py-2.5 border border-slate-100">
        <div>
          <p className="text-lg sm:text-xl font-bold text-slate-900">
            {formatTime(trip.departureTime)}
          </p>
          <p className="text-xs font-medium text-slate-700">{trip.route.fromCity}</p>
          <p className="text-[11px] text-slate-400">{formatDate(trip.travelDate)}</p>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1 px-2 text-center">
          <span className="text-[11px] font-medium text-slate-500">
            {mins ? formatDuration(mins) : "Direct"}
          </span>
          <div className="relative flex w-full items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            <div className="h-[1.5px] w-full bg-slate-300" />
            <span className="h-1.5 w-1.5 rounded-full border border-green-600 bg-white" />
          </div>
        </div>

        <div className="text-right">
          {trip.arrivalTime ? (
            <>
              <p className="text-lg sm:text-xl font-bold text-slate-900">
                {formatTime(trip.arrivalTime)}
              </p>
              <p className="text-xs font-medium text-slate-700">{trip.route.toCity}</p>
              <p className="text-[11px] text-slate-400">{formatDate(arrDate)}</p>
            </>
          ) : (
            <p className="text-xs text-slate-400">Arrival TBD</p>
          )}
        </div>
      </div>

      {/* 3. Symmetrical Price + Seat Availability & CTA */}
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 md:border-t-0 md:border-l md:pl-5 md:pt-0">
        {/* Symmetrical 2-Column Metric Box */}
        <div className="grid grid-cols-2 divide-x divide-slate-200 rounded-lg border border-slate-200/80 bg-slate-50/60 py-2 text-center">
          <div className="px-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Fare
            </span>
            <div className="mt-0.5 flex flex-col items-center justify-center">
              <span className="text-base sm:text-lg font-extrabold text-green-700 leading-tight">
                {formatPrice(trip.price)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] text-slate-400 line-through leading-none">
                  {formatPrice(trip.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="px-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Seats Left
            </span>
            <div className="mt-0.5 flex flex-col items-center justify-center">
              <span
                className={`text-base sm:text-lg font-extrabold leading-tight ${
                  soldOut
                    ? "text-slate-400"
                    : trip.seatsLeft <= 5
                    ? "text-red-600"
                    : "text-slate-900"
                }`}
              >
                {soldOut ? "0" : trip.seatsLeft}
              </span>
              <span
                className={`text-[11px] leading-none ${
                  soldOut
                    ? "text-slate-400"
                    : trip.seatsLeft <= 5
                    ? "font-medium text-red-500"
                    : "text-slate-500"
                }`}
              >
                {soldOut ? "Sold out" : "Available"}
              </span>
            </div>
          </div>
        </div>

        {/* Full-width Action Button aligned with the symmetrical metric box */}
        {soldOut ? (
          <span className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-semibold text-slate-400 cursor-not-allowed">
            Sold Out
          </span>
        ) : (
          <Link
            href={`/trips/${trip.id}`}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md hover:shadow-green-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            View Seats
          </Link>
        )}
      </div>
    </div>

{/* Footer Info & Policy Bar */}
<div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
  {/* Departure Info Pill */}
  <div className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-green-50/70 border border-green-200/70 px-3 py-1.5 text-xs text-slate-700">
    <span className="h-2 w-2 shrink-0 rounded-full bg-green-600" />
    <span>
      Departs from <strong className="font-semibold text-slate-900">{trip.route.fromCity}</strong> on{" "}
      <strong className="font-semibold text-slate-900">{formatDate(trip.travelDate)}</strong> at{" "}
      <strong className="font-semibold text-green-700">{formatTime(trip.departureTime)}</strong>
    </span>
  </div>

  {/* Subtle Rose-Danger Cancellation Policy Toggle */}
  <button
    type="button"
    onClick={() => setShowPolicy(!showPolicy)}
    aria-expanded={showPolicy}
    className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
      showPolicy
        ? "border-rose-300 bg-rose-100/80 text-rose-700 shadow-xs"
        : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50/60 hover:text-rose-600"
    }`}
  >
    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
    <span>Cancellation policy</span>
    <span
      className={`text-[10px] text-slate-400 transition-transform duration-200 ${
        showPolicy ? "rotate-180" : "rotate-0"
      }`}
    >
      ▼
    </span>
  </button>
</div>

{/* Smooth In & Out Policy Drawer */}
<div
  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
    showPolicy ? "mt-2.5 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0 pointer-events-none"
  }`}
>
  <div className="overflow-hidden">
    <div className="flex items-start gap-2.5 rounded-lg border border-rose-200/80 border-l-4 border-l-rose-500 bg-rose-50/40 p-3 text-xs leading-relaxed text-slate-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
      <p>
        You can cancel a booking any time before the bus departs. Your seats are released immediately and the
        booking is marked as cancelled. Trips that have already departed cannot be cancelled.
      </p>
    </div>
  </div>
</div>
  </div>
);
}
