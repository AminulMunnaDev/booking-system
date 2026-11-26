import { formatPrice } from "@/lib/format";

// One line per seat and the total.
export default function FareSummary({ seats, price }) {
  return (
    <div className="space-y-2 text-sm">
      {seats.length === 0 ? (
        <p className="text-slate-500">No seats selected yet</p>
      ) : (
        seats.map((s) => (
          <div key={s} className="flex justify-between">
            <span className="text-slate-600">Seat {s}</span>
            <span>{formatPrice(price)}</span>
          </div>
        ))
      )}
      <div className="flex justify-between border-t pt-2 text-base font-bold">
        <span>Total</span>
        <span>{formatPrice(price * seats.length)}</span>
      </div>
    </div>
  );
}
