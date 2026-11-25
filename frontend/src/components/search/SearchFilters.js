"use client";

import { Button } from "@/components/ui/button";
import { TIME_BUCKETS } from "@/lib/trips";

function CheckGroup({ title, options, selected, onChange }) {
  const toggle = (value) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
          <span>{o.label}</span>
          {o.hint && <span className="text-xs text-slate-400">{o.hint}</span>}
        </label>
      ))}
    </div>
  );
}

// filters = { types, dep, arr, buses }
export default function SearchFilters({ filters, setFilters, busNames, onReset }) {
  const set = (key) => (value) => setFilters({ ...filters, [key]: value });
  const timeOptions = TIME_BUCKETS.map((b) => ({ value: b.key, label: b.label, hint: b.hint }));

  return (
    <div className="space-y-5 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Filters</p>
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <CheckGroup
        title="Bus type"
        options={[
          { value: "AC", label: "AC" },
          { value: "NON_AC", label: "Non-AC" },
        ]}
        selected={filters.types}
        onChange={set("types")}
      />

      <CheckGroup title="Departure time" options={timeOptions} selected={filters.dep} onChange={set("dep")} />
      <CheckGroup title="Arrival time" options={timeOptions} selected={filters.arr} onChange={set("arr")} />

      {busNames.length > 0 && (
        <CheckGroup
          title="Bus / operator"
          options={busNames.map((n) => ({ value: n, label: n }))}
          selected={filters.buses}
          onChange={set("buses")}
        />
      )}
    </div>
  );
}
