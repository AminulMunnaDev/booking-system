export const PAYMENT_WINDOW_MINUTES = 10;

export const DEMO_OTP = "123456";

export const PAYMENT_METHODS = [
  { value: "BKASH", label: "bKash", description: "Pay with bKash mobile wallet" },
  { value: "NAGAD", label: "Nagad", description: "Pay with Nagad mobile wallet" },
  { value: "ROCKET", label: "Rocket", description: "Pay with Rocket mobile banking" },
  { value: "UPAY", label: "Upay", description: "Pay with Upay digital wallet" },
  { value: "CARD", label: "Card", description: "Debit or credit card (Visa / Mastercard)" },
];

const METHOD_LABELS = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.value, m.label]));

export function methodLabel(method) {
  return METHOD_LABELS[method] || method || "-";
}

// Validates the entered mobile wallet number or card number for the demo checkout
export function validateAccountNumber(method, raw) {
  const digits = String(raw || "").replace(/[\s-]/g, "");
  if (method === "CARD") {
    if (!/^\d{12,19}$/.test(digits)) return "Enter a valid card number (12-19 digits)";
    return "";
  }
  if (!/^01\d{9}$/.test(digits)) return "Enter a valid 11-digit mobile number (01XXXXXXXXX)";
  return "";
}

// Formats an ISO timestamp in Bangladesh time (UTC+6)
export function formatDateTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  });
}

// Formats remaining seconds as MM:SS
export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
