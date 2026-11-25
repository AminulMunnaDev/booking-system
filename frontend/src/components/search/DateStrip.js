"use client";

import { eachDate, formatDayShort } from "@/lib/trips";
import { formatPrice } from "@/lib/format";

// Row of day buttons for a date range search, with the cheapest fare for each day.
export default function DateStrip({ start, end, trips, selected, onSelect }) {
  const days = eachDate(start, end);
  if (days.length < 2) return null;

  const chip = (active) =>
    `shrink-0 rounded-lg border px-3 py-2 text-left text-sm ${
      active ? "border-green-600 bg-green-50" : "bg-white hover:border-green-600"
    }`;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button type="button" className={chip(selected === "")} onClick={() => onSelect("")}>
        <p className="font-semibold">All dates</p>
        <p className="text-xs text-slate-500">{trips.length} trips</p>
      </button>

      {days.map((d) => {
        const list = trips.filter((t) => t.travelDate === d);
        const cheapest = list.length ? Math.min(...list.map((t) => t.price)) : null;
        return (
          <button
            key={d}
            type="button"
            disabled={list.length === 0}
            className={chip(selected === d) + (list.length === 0 ? " cursor-not-allowed opacity-50" : "")}
            onClick={() => onSelect(d)}
          >
            <p className="font-semibold">{formatDayShort(d)}</p>
            <p className="text-xs text-slate-500">{cheapest ? `from ${formatPrice(cheapest)}` : "No trips"}</p>
          </button>
        );
      })}
    </div>
  );
}
