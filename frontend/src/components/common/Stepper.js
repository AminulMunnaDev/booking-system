"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const steps = ["Choose Trip", "Select Seats", "Passenger Details", "Payment", "Ticket"];

function currentStep(pathname) {
  if (pathname.startsWith("/search")) return 0;
  if (pathname.startsWith("/trips/")) return 1;
  if (pathname.startsWith("/booking/")) return 2;
  if (pathname.startsWith("/payment/")) return pathname.endsWith("/success") ? 4 : 3;
  if (pathname.startsWith("/tickets/")) return 4;
  return -1; // not a booking page: show nothing
}

// Green progress bar under the navbar. It picks the current step from the URL.
export default function Stepper() {
  const current = currentStep(usePathname());
  if (current < 0) return null;

  return (
    <div className="bg-green-600 text-white print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2 text-sm">
        {steps.map((s, i) => (
          <span key={s} className="flex items-center gap-1">
            <span className={i === current ? "font-bold" : "opacity-70"}>{s}</span>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 opacity-70" />}
          </span>
        ))}
      </div>
    </div>
  );
}
