"use client";

const styles = {
  available: "bg-white border-slate-300 hover:border-green-600",
  selected: "bg-green-600 border-green-600 text-white",
  booked: "cursor-not-allowed bg-slate-300 border-slate-300 text-slate-500",
};

function Seat({ label, state, onClick }) {
  return (
    <button
      type="button"
      disabled={state === "booked"}
      onClick={onClick}
      className={`h-10 w-12 rounded-md border text-sm font-medium ${styles[state]}`}
    >
      {label}
    </button>
  );
}

// seatLayout: ["A1","A2",...]  bookedSeats: ["A1"]  selected: ["B2"]
// Shows 2 seats, an aisle, then 2 seats in each row.
export default function SeatGrid({ seatLayout, bookedSeats, selected, onToggle }) {
  const booked = new Set(bookedSeats);
  const rows = [];
  for (let i = 0; i < seatLayout.length; i += 4) rows.push(seatLayout.slice(i, i + 4));

  const stateOf = (seat) => (booked.has(seat) ? "booked" : selected.includes(seat) ? "selected" : "available");

  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-4 w-4 rounded border border-slate-300 bg-white" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-4 w-4 rounded bg-green-600" /> Selected
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-4 w-4 rounded bg-slate-300" /> Booked
        </span>
      </div>

      <div className="mx-auto w-fit space-y-2 rounded-lg border bg-white p-4">
        <p className="text-center text-xs text-slate-400">Front of the bus</p>
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            {row.slice(0, 2).map((s) => (
              <Seat key={s} label={s} state={stateOf(s)} onClick={() => onToggle(s)} />
            ))}
            <div className="w-6" />
            {row.slice(2).map((s) => (
              <Seat key={s} label={s} state={stateOf(s)} onClick={() => onToggle(s)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
