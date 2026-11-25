"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import useApi from "@/hooks/useApi";
import SearchForm from "@/components/search/SearchForm";
import SearchFilters from "@/components/search/SearchFilters";
import DateStrip from "@/components/search/DateStrip";
import TripCard from "@/components/search/TripCard";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";
import { applyFilters, formatDayLong, groupByDate, sortTrips } from "@/lib/trips";

const emptyFilters = { types: [], dep: [], arr: [], buses: [] };

const SORTS = [
  ["time_asc", "Earliest first"],
  ["time_desc", "Latest first"],
  ["price_asc", "Price: Low to High"],
  ["price_desc", "Price: High to Low"],
];

function SearchResults({ from, to, start, end }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState("time_asc");
  const [day, setDay] = useState(""); // "" means all dates
  const [showFilters, setShowFilters] = useState(false);

  const ready = from && to && start;
  const qs = new URLSearchParams({ from, to, dateFrom: start, dateTo: end });
  const { data, loading } = useApi(ready ? `/trips/search?${qs.toString()}` : null, false);

  const all = data?.data ?? [];
  const busNames = [...new Set(all.map((t) => t.bus.name))].sort();

  const filtered = applyFilters(all, filters);
  const visible = day ? filtered.filter((t) => t.travelDate === day) : filtered;
  const groups = groupByDate(visible).map((g) => ({ ...g, trips: sortTrips(g.trips, sort) }));

  const dateText = start === end ? formatDate(start) : `${formatDate(start)} - ${formatDate(end)}`;

  return (
    <div className="space-y-6">
      <SearchForm
        key={`${from}|${to}|${start}|${end}`}
        initial={{ from, to, dateFrom: start, dateTo: end !== start ? end : "" }}
      />

      {!ready ? (
        <p className="text-slate-500">Choose your cities and dates to see available buses.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-4">
          {/* Filters */}
          <aside className={`${showFilters ? "block" : "hidden"} md:col-span-1 md:block`}>
            <SearchFilters
              filters={filters}
              setFilters={setFilters}
              busNames={busNames}
              onReset={() => setFilters(emptyFilters)}
            />
          </aside>

          {/* Results */}
          <section className="space-y-4 md:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-semibold">
                  {from} to {to}
                </h1>
                <p className="text-sm text-slate-500">
                  {dateText}
                  {!loading && ` - ${visible.length} bus(es) found`}
                </p>
              </div>
              <Button variant="outline" size="sm" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
                {showFilters ? "Hide filters" : "Show filters"}
              </Button>
            </div>

            {!loading && start !== end && (
              <DateStrip start={start} end={end} trips={all} selected={day} onSelect={setDay} />
            )}

            <div className="flex flex-wrap gap-2">
              {SORTS.map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={sort === key ? "default" : "outline"}
                  className={sort === key ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setSort(key)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {loading ? (
              <p className="text-slate-500">Searching...</p>
            ) : all.length === 0 ? (
              <div className="rounded-lg border bg-white p-8 text-center text-slate-500">
                No trips found for these dates. Try a different date range or route.
              </div>
            ) : visible.length === 0 ? (
              <div className="space-y-3 rounded-lg border bg-white p-8 text-center text-slate-500">
                <p>No trips match your filters.</p>
                <Button variant="outline" onClick={() => setFilters(emptyFilters)}>
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {groups.map((g) => (
                  <div key={g.date} className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <h2 className="font-semibold">{formatDayLong(g.date)}</h2>
                      <p className="text-xs text-slate-500">
                        {g.trips.length} trip(s), from {formatPrice(Math.min(...g.trips.map((t) => t.price)))}
                      </p>
                    </div>
                    {g.trips.map((t) => (
                      <TripCard key={t.id} trip={t} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

// Reads the URL. The key resets filters and the day selection on every new search.
function SearchRoot() {
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const start = params.get("dateFrom") || params.get("date") || "";
  const end = params.get("dateTo") || start;

  return <SearchResults key={`${from}|${to}|${start}|${end}`} from={from} to={to} start={start} end={end} />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading...</p>}>
      <SearchRoot />
    </Suspense>
  );
}
