// Today in Bangladesh time (UTC+6), as "YYYY-MM-DD"
export function todayDhaka() {
  return new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// "2026-11-15" -> "15 Nov 2026"
export function formatDate(d) {
  if (!d) return "";
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// "22:30" -> "10:30 PM"
export function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatPrice(n) {
  return `BDT ${Number(n).toLocaleString()}`;
}
