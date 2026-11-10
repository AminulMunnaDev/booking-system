// Bangladesh is UTC+6 all year (no daylight saving)
function dhakaNow() {
  const iso = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) }; // "2026-11-10", "14:30"
}

// travelDate is a Date (from the database), departureTime is "HH:MM"
function hasDeparted(travelDate, departureTime) {
  const now = dhakaNow();
  const tripDate = travelDate.toISOString().slice(0, 10);
  return tripDate < now.date || (tripDate === now.date && departureTime <= now.time);
}

module.exports = { dhakaNow, hasDeparted };
