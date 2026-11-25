// Helpers for the search page: time buckets, duration, filters, sorting, grouping.

export const TIME_BUCKETS = [
  { key: "night", label: "Night", hint: "12 AM - 6 AM", from: 0, to: 359 },
  { key: "morning", label: "Morning", hint: "6 AM - 12 PM", from: 360, to: 719 },
  { key: "afternoon", label: "Afternoon", hint: "12 PM - 6 PM", from: 720, to: 1079 },
  { key: "evening", label: "Evening", hint: "6 PM - 12 AM", from: 1080, to: 1439 },
];

export function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function bucketOf(t) {
  const m = toMinutes(t);
  return TIME_BUCKETS.find((b) => m >= b.from && m <= b.to).key;
}

// Trip length in minutes. If arrival is earlier than departure, the bus arrives the next day.
export function durationMinutes(dep, arr) {
  if (!arr) return null;
  let d = toMinutes(arr) - toMinutes(dep);
  if (d <= 0) d += 1440;
  return d;
}

export function formatDuration(mins) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// "2026-11-23" + 1 -> "2026-11-24"
export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function arrivalDateOf(trip) {
  if (!trip.arrivalTime) return null;
  return toMinutes(trip.arrivalTime) <= toMinutes(trip.departureTime) ? addDays(trip.travelDate, 1) : trip.travelDate;
}

// All dates from start to end, inclusive
export function eachDate(start, end) {
  const out = [];
  for (let d = start, i = 0; d <= end && i < 31; d = addDays(d, 1), i++) out.push(d);
  return out;
}

export function formatDayShort(d) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatDayLong(d) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// filters = { types: ["AC"], dep: ["morning"], arr: [], buses: ["Hanif Express"] }
export function applyFilters(trips, f) {
  return trips.filter((t) => {
    if (f.types.length && !f.types.includes(t.bus.type)) return false;
    if (f.dep.length && !f.dep.includes(bucketOf(t.departureTime))) return false;
    if (f.arr.length && !(t.arrivalTime && f.arr.includes(bucketOf(t.arrivalTime)))) return false;
    if (f.buses.length && !f.buses.includes(t.bus.name)) return false;
    return true;
  });
}

// key: time_asc | time_desc | price_asc | price_desc
export function sortTrips(list, key) {
  const copy = [...list];
  const byTime = (a, b) => toMinutes(a.departureTime) - toMinutes(b.departureTime);
  const byPrice = (a, b) => a.price - b.price;
  if (key === "time_desc") return copy.sort((a, b) => byTime(b, a));
  if (key === "price_asc") return copy.sort((a, b) => byPrice(a, b) || byTime(a, b));
  if (key === "price_desc") return copy.sort((a, b) => byPrice(b, a) || byTime(a, b));
  return copy.sort(byTime);
}

// [{ date: "2026-11-23", trips: [...] }, ...] in date order
export function groupByDate(trips) {
  const map = new Map();
  trips.forEach((t) => {
    if (!map.has(t.travelDate)) map.set(t.travelDate, []);
    map.get(t.travelDate).push(t);
  });
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([date, list]) => ({ date, trips: list }));
}
