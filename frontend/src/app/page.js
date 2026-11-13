"use client";

import Link from "next/link";
import useApi from "@/hooks/useApi";
import SearchForm from "@/components/search/SearchForm";
import { formatPrice, todayDhaka } from "@/lib/format";

export default function HomePage() {
  const { data } = useApi("/trips/popular-routes", false);
  const popular = data?.data ?? [];

  return (
    <div className="space-y-10">
      <section className="space-y-4 pt-6 text-center">
        <h1 className="text-4xl font-bold">Book your bus ticket</h1>
        <p className="text-slate-600">Search trips, pick your seats and travel with ease.</p>
      </section>

      <SearchForm />

      {popular.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Popular routes</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((r) => (
              <Link
                key={r.routeId}
                href={`/search?${new URLSearchParams({ from: r.fromCity, to: r.toCity, date: todayDhaka() }).toString()}`}
                className="rounded-lg border bg-white p-4 hover:border-green-600"
              >
                <p className="font-semibold">
                  {r.fromCity} to {r.toCity}
                </p>
                <p className="text-sm text-slate-500">Starting from {formatPrice(r.startingPrice)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
