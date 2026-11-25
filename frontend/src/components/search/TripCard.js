"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatTime, formatPrice } from "@/lib/format";
import { arrivalDateOf, durationMinutes, formatDuration } from "@/lib/trips";

export default function TripCard({ trip }) {
  const [showPolicy, setShowPolicy] = useState(false);
  const soldOut = trip.seatsLeft <= 0;
  const mins = durationMinutes(trip.departureTime, trip.arrivalTime);
  const arrDate = arrivalDateOf(trip);
  const hasDiscount = trip.originalPrice && trip.originalPrice > trip.price; // ready for discounts later

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1.2fr_2fr_1fr] md:items-center">
        {/* Bus */}
        <div className="space-y-1">
          <p className="text-lg font-semibold">{trip.bus.name}</p>
          <Badge variant="outline">{trip.bus.type === "AC" ? "AC" : "Non-AC"}</Badge>
          <p className="text-xs text-slate-500">
            Route: {trip.route.fromCity} - {trip.route.toCity}
          </p>
        </div>

        {/* Times */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xl font-bold">{formatTime(trip.departureTime)}</p>
            <p className="text-xs text-slate-500">{formatDate(trip.travelDate)}</p>
            <p className="text-xs">{trip.route.fromCity}</p>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1 text-xs text-slate-500">
            <span>{mins ? formatDuration(mins) : ""}</span>
            <div className="h-px w-full bg-slate-300" />
          </div>

          <div className="text-right">
            {trip.arrivalTime ? (
              <>
                <p className="text-xl font-bold">{formatTime(trip.arrivalTime)}</p>
                <p className="text-xs text-slate-500">{formatDate(arrDate)}</p>
                <p className="text-xs">{trip.route.toCity}</p>
              </>
            ) : (
              <p className="text-xs text-slate-400">Arrival time not set</p>
            )}
          </div>
        </div>

        {/* Price and action */}
        <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
          <div className="md:text-right">
            {hasDiscount && (
              <p className="text-sm text-slate-400 line-through">{formatPrice(trip.originalPrice)}</p>
            )}
            <p className="text-xl font-bold">{formatPrice(trip.price)}</p>
            <p className={`text-xs ${trip.seatsLeft <= 5 ? "font-medium text-red-600" : "text-slate-500"}`}>
              {soldOut ? "No seats left" : `${trip.seatsLeft} seat(s) available`}
            </p>
          </div>

          {soldOut ? (
            <span className="text-sm font-medium text-slate-500">Sold out</span>
          ) : (
            <Link href={`/trips/${trip.id}`} className={buttonVariants() + " bg-green-600 hover:bg-green-700"}>
              Book ticket
            </Link>
          )}
        </div>
      </div>

      {/* Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        <button
          type="button"
          onClick={() => setShowPolicy(!showPolicy)}
          className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
        >
          Cancellation policy
        </button>
        <span className="rounded-full border border-green-600 px-3 py-1 text-xs font-medium text-green-700">
          Departs from {trip.route.fromCity} on {formatDate(trip.travelDate)} at {formatTime(trip.departureTime)}
        </span>
      </div>

      {showPolicy && (
        <p className="mt-2 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          You can cancel a booking any time before the bus departs. Your seats are released immediately and the
          booking is marked as cancelled. Trips that have already departed cannot be cancelled.
        </p>
      )}
    </div>
  );
}
