"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import useApi from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Field, { selectClass } from "@/components/admin/FormField";
import { todayDhaka } from "@/lib/format";

const MAX_DAYS = 14;

// initial = { from, to, dateFrom, dateTo }  (used to prefill on the results page)
export default function SearchForm({ initial = {} }) {
  const router = useRouter();
  const { data } = useApi("/cities", false);
  const cities = data?.data ?? [];

  const [from, setFrom] = useState(initial.from || "");
  const [to, setTo] = useState(initial.to || "");
  const [dateFrom, setDateFrom] = useState(initial.dateFrom || todayDhaka());
  const [dateTo, setDateTo] = useState(initial.dateTo || "");

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!from || !to) return toast.error("Please choose both cities");
    if (from === to) return toast.error("From and To cities must be different");

    if (dateTo) {
      const days = (Date.parse(dateTo) - Date.parse(dateFrom)) / 86400000;
      if (days < 0) return toast.error("The end date cannot be before the start date");
      if (days > MAX_DAYS - 1) return toast.error(`Date range cannot be more than ${MAX_DAYS} days`);
    }

    const qs = new URLSearchParams({ from, to, dateFrom });
    if (dateTo && dateTo !== dateFrom) qs.set("dateTo", dateTo);
    router.push(`/search?${qs.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[1fr_auto_1fr_1fr_1fr_auto] md:items-end"
    >
      <Field label="From" htmlFor="s-from">
        <select id="s-from" className={selectClass} value={from} onChange={(e) => setFrom(e.target.value)}>
          <option value="">Select city</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Button type="button" variant="outline" size="icon" onClick={swap} aria-label="Swap cities" className="mx-auto">
        <ArrowLeftRight className="h-4 w-4" />
      </Button>

      <Field label="To" htmlFor="s-to">
        <select id="s-to" className={selectClass} value={to} onChange={(e) => setTo(e.target.value)}>
          <option value="">Select city</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Date from" htmlFor="s-date-from">
        <Input
          id="s-date-from"
          type="date"
          min={todayDhaka()}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          required
        />
      </Field>

      <Field label="Date to (optional)" htmlFor="s-date-to">
        <Input
          id="s-date-to"
          type="date"
          min={dateFrom || todayDhaka()}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </Field>

      <Button type="submit" className="bg-green-600 hover:bg-green-700">
        Search
      </Button>
    </form>
  );
}
