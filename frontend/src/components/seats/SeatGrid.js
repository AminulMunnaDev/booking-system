"use client";

const styles = {
  available: "bg-white border-slate-300 hover:border-green-600",
  selected: "bg-green-600 border-green-600 text-white",
  booked: "cursor-not-allowed bg-slate-200 border-slate-200 text-slate-400",
};

function Seat({ label, state, onClick }) {
  return (
    <button
      type="button"
      disabled={state === "booked"}
      onClick={onClick}
      aria-label={`Seat ${label}, ${state}`}
      className={`h-10 w-12 rounded-md border text-sm font-medium transition-colors ${styles[state]}`}
    >
      {label}
    </button>
  );
}

function LegendItem({ className, label, count }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-4 w-4 rounded border ${className}`} />
      {label} <span className="text-slate-400">({count})</span>
    </span>
  );
}

// seatLayout: ["A1","A2",...]  bookedSeats: ["A1"]  selected: ["B2"]
// Each row: 2 seats, an aisle, 2 seats.
export default function SeatGrid({ seatLayout, bookedSeats, selected, onToggle }) {
  const booked = new Set(bookedSeats);
  const rows = [];
  for (let i = 0; i < seatLayout.length; i += 4) rows.push(seatLayout.slice(i, i + 4));

  const stateOf = (seat) => (booked.has(seat) ? "booked" : selected.includes(seat) ? "selected" : "available");

  const bookedCount = seatLayout.filter((s) => booked.has(s)).length;
  const selectedCount = selected.length;
  const availableCount = seatLayout.length - bookedCount - selectedCount;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
        <LegendItem className="border-slate-300 bg-white" label="Available" count={availableCount} />
        <LegendItem className="border-green-600 bg-green-600" label="Selected" count={selectedCount} />
        <LegendItem className="border-slate-200 bg-slate-200" label="Booked" count={bookedCount} />
      </div>

      <div className="mx-auto w-fit rounded-2xl border-2 border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between border-b pb-2 text-xs text-slate-400">
          <span>Front</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-500">Driver</span>
        </div>

        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              {row.slice(0, 2).map((s) => (
                <Seat key={s} label={s} state={stateOf(s)} onClick={() => onToggle(s)} />
              ))}
              <div className="w-8" />
              {row.slice(2).map((s) => (
                <Seat key={s} label={s} state={stateOf(s)} onClick={() => onToggle(s)} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
