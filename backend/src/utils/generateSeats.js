// Builds seat labels for a bus: 4 seats per row (2 + 2 layout)
// 40 seats -> A1 A2 A3 A4 B1 ... J4
function generateSeats(totalSeats) {
  const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const seats = [];
  for (let i = 0; i < totalSeats; i++) {
    seats.push(`${rows[Math.floor(i / 4)]}${(i % 4) + 1}`);
  }
  return seats;
}

module.exports = generateSeats;
