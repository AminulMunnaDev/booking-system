"use client";

const styles = {
  available:
    "bg-white border-slate-300 text-slate-700 hover:border-green-600 hover:bg-green-50/60 hover:text-green-700 active:scale-95",
  selected:
    "bg-green-600 border-green-600 text-white shadow-sm shadow-green-600/25 hover:bg-green-700 hover:border-green-700 active:scale-95",
  booked:
    "cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400 line-through decoration-slate-300",
};

function Seat({ label, state, onClick }) {
  return (
    <button
      type="button"
      disabled={state === "booked"}
      onClick={onClick}
      aria-label={`Seat ${label}, ${state}`}
      aria-pressed={state === "selected"}
      className={`h-10 w-12 rounded-lg border text-xs sm:text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1 ${styles[state]}`}
    >
      {label}
    </button>
  );
}

function LegendItem({ className, label, count }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
      <span className={`inline-block h-4 w-4 rounded border ${className}`} />
      <span>{label}</span>
      <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200/80">
        {count}
      </span>
    </span>
  );
}

// seatLayout: ["A1","A2",...]  bookedSeats: ["A1"]  selected: ["B2"]
// Each row: 2 seats, an aisle, 2 seats.
export default function SeatGrid({ seatLayout, bookedSeats, selected, onToggle }) {
  const booked = new Set(bookedSeats);
  const rows = [];
  for (let i = 0; i < seatLayout.length; i += 4) rows.push(seatLayout.slice(i, i + 4));

  const stateOf = (seat) =>
    booked.has(seat) ? "booked" : selected.includes(seat) ? "selected" : "available";

  const bookedCount = seatLayout.filter((s) => booked.has(s)).length;
  const selectedCount = selected.length;
  const availableCount = seatLayout.length - bookedCount - selectedCount;

  return (
    <div className="space-y-4">
      {/* Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5">
        <LegendItem className="border-slate-300 bg-white" label="Available" count={availableCount} />
        <LegendItem className="border-green-600 bg-green-600" label="Selected" count={selectedCount} />
        <LegendItem className="border-slate-200 bg-slate-100" label="Booked" count={bookedCount} />
      </div>

      {/* Bus Seat Cabin */}
      <div className="mx-auto w-fit rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        {/* Front & Driver Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
          <span className="font-semibold uppercase tracking-wider text-slate-400">Front</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            Driver
          </span>
        </div>

        {/* Seat Rows */}
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              {row.slice(0, 2).map((s) => (
                <Seat key={s} label={s} state={stateOf(s)} onClick={() => onToggle(s)} />
              ))}

              {/* Center Aisle */}
              <div className="flex w-8 sm:w-10 items-center justify-center">
                {i === 0 ? (
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-300">
                    Aisle
                  </span>
                ) : (
                  <span className="h-4 w-px bg-slate-100" />
                )}
              </div>

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
