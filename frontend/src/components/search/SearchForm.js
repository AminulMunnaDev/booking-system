"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useApi from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Field, { selectClass } from "@/components/admin/FormField";
import { todayDhaka } from "@/lib/format";

// initial = { from, to, date } (optional, used to prefill on the results page)
export default function SearchForm({ initial = {} }) {
  const router = useRouter();
  const { data } = useApi("/cities", false);
  const cities = data?.data ?? [];

  const [from, setFrom] = useState(initial.from || "");
  const [to, setTo] = useState(initial.to || "");
  const [date, setDate] = useState(initial.date || todayDhaka());

  function onSubmit(e) {
    e.preventDefault();
    if (!from || !to) return toast.error("Please choose both cities");
    if (from === to) return toast.error("From and To cities must be different");
    const qs = new URLSearchParams({ from, to, date });
    router.push(`/search?${qs.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-4 sm:items-end">
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

      <Field label="Date" htmlFor="s-date">
        <Input id="s-date" type="date" min={todayDhaka()} value={date} onChange={(e) => setDate(e.target.value)} required />
      </Field>

      <Button type="submit" className="bg-green-600 hover:bg-green-700">
        Search buses
      </Button>
    </form>
  );
}
