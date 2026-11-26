// Seats stay held for this long while the customer pays. After that the booking expires.
const PAYMENT_WINDOW_MINUTES = 10;

const PAYMENT_METHODS = ["CARD", "BKASH", "NAGAD", "ROCKET", "UPAY"];

// Fake transaction id, e.g. TXN-LZ3K9A-4F2Q
function makePaymentRef() {
  const part = (n) => Math.random().toString(36).slice(2, 2 + n).toUpperCase().padEnd(n, "0");
  return `TXN-${Date.now().toString(36).toUpperCase()}-${part(4)}`;
}

module.exports = { PAYMENT_WINDOW_MINUTES, PAYMENT_METHODS, makePaymentRef };
