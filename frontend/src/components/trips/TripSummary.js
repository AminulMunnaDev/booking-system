import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/format";
import { arrivalDateOf, durationMinutes, formatDuration } from "@/lib/trips";

// Compact trip overview: route, times with duration, bus.
// Used on the seat page and the passenger page.
export default function TripSummary({ trip }) {
  const mins = durationMinutes(trip.departureTime, trip.arrivalTime);
  const arrDate = arrivalDateOf(trip);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">
          {trip.route.fromCity} to {trip.route.toCity}
        </h2>
        <Badge variant="outline">{trip.bus.type === "AC" ? "AC" : "Non-AC"}</Badge>
      </div>

      <div className="flex items-center gap-3">
        <div>
          <p className="text-xl font-bold">{formatTime(trip.departureTime)}</p>
          <p className="text-xs text-slate-500">{formatDate(trip.travelDate)}</p>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1 text-xs text-slate-500">
          <span>{mins ? formatDuration(mins) : ""}</span>
          <div className="h-px w-full bg-slate-300" />
        </div>

        <div className="text-right">
          {trip.arrivalTime ? (
            <>
              <p className="text-xl font-bold">{formatTime(trip.arrivalTime)}</p>
              <p className="text-xs text-slate-500">{formatDate(arrDate)}</p>
            </>
          ) : (
            <p className="text-xs text-slate-400">Arrival not set</p>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-600">{trip.bus.name}</p>
    </div>
  );
}
