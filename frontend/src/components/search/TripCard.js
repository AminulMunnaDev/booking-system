import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatTime, formatPrice } from "@/lib/format";

export default function TripCard({ trip }) {
  const soldOut = trip.seatsLeft <= 0;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="flex items-center gap-2 font-semibold">
          {trip.bus.name}
          <Badge variant="outline">{trip.bus.type === "AC" ? "AC" : "Non-AC"}</Badge>
        </p>
        <p className="text-sm text-slate-600">
          {formatTime(trip.departureTime)}
          {trip.arrivalTime && ` to ${formatTime(trip.arrivalTime)}`}
        </p>
        <p className="text-sm text-slate-500">
          {trip.route.fromCity} to {trip.route.toCity}
        </p>
      </div>

      <p className={`text-sm ${trip.seatsLeft <= 5 ? "font-medium text-red-600" : "text-slate-600"}`}>
        {soldOut ? "No seats left" : `${trip.seatsLeft} seats left`}
      </p>

      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
        <p className="text-lg font-bold">{formatPrice(trip.price)}</p>
        {soldOut ? (
          <span className="text-sm font-medium text-slate-500">Sold out</span>
        ) : (
          <Link href={`/trips/${trip.id}`} className={buttonVariants() + " bg-green-600 hover:bg-green-700"}>
            Select seats
          </Link>
        )}
      </div>
    </div>
  );
}
