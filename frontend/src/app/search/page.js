"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import useApi from "@/hooks/useApi";
import SearchForm from "@/components/search/SearchForm";
import TripCard from "@/components/search/TripCard";
import { selectClass } from "@/components/admin/FormField";
import { formatDate } from "@/lib/format";

function SearchContent() {
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const date = params.get("date") || "";

  const [type, setType] = useState("");
  const [sort, setSort] = useState("time");

  const ready = from && to && date;
  const qs = new URLSearchParams({ from, to, date, sort });
  if (type) qs.set("type", type);
  const { data, loading } = useApi(ready ? `/trips/search?${qs.toString()}` : null, false);
  const trips = data?.data ?? [];

  return (
    <div className="space-y-6">
      <SearchForm key={`${from}|${to}|${date}`} initial={{ from, to, date }} />

      {!ready ? (
        <p className="text-slate-500">Choose your cities and date to see available buses.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">
              {from} to {to} on {formatDate(date)}
            </h1>
            <div className="flex gap-2">
              <select className={`${selectClass} w-32`} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All types</option>
                <option value="AC">AC</option>
                <option value="NON_AC">Non-AC</option>
              </select>
              <select className={`${selectClass} w-36`} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="time">Earliest first</option>
                <option value="price">Cheapest first</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-500">Searching...</p>
          ) : trips.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center text-slate-500">
              No trips found. Try another date or route.
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((t) => (
                <TripCard key={t.id} trip={t} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading...</p>}>
      <SearchContent />
    </Suspense>
  );
}
