"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, Clock, CreditCard, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import useApi from "@/hooks/useApi";
import useRequireAuth from "@/hooks/useRequireAuth";
import StatusBadge from "@/components/common/StatusBadge";
import TripSummary from "@/components/trips/TripSummary";
import FareSummary from "@/components/trips/FareSummary";
import Field from "@/components/admin/FormField";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import {
  DEMO_OTP,
  PAYMENT_METHODS,
  PAYMENT_WINDOW_MINUTES,
  formatCountdown,
  methodLabel,
  validateAccountNumber,
} from "@/lib/payment";

export default function PaymentPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { ready } = useRequireAuth();
  const { data, loading, reload } = useApi(ready && bookingId ? `/bookings/${bookingId}` : null);
  const b = data?.data;

  const [method, setMethod] = useState("BKASH");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountError, setAccountError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [paying, setPaying] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const expiresAtMs = b?.expiresAt
    ? new Date(b.expiresAt).getTime()
    : b?.createdAt
      ? new Date(b.createdAt).getTime() + PAYMENT_WINDOW_MINUTES * 60 * 1000
      : 0;
  const secondsLeft =
    b?.status === "PENDING" && expiresAtMs > 0 ? Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000)) : 0;

  // Already confirmed: send user straight to the success page
  useEffect(() => {
    if (b?.status === "CONFIRMED") {
      router.replace(`/payment/${bookingId}/success`);
    }
  }, [b?.status, bookingId, router]);

  // Tick every second while the payment hold is active
  useEffect(() => {
    if (b?.status !== "PENDING" || secondsLeft <= 0) return;
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [b?.status, secondsLeft]);

  function selectMethod(nextMethod) {
    setMethod(nextMethod);
    setAccountNumber("");
    setAccountError("");
    setOtpSent(false);
    setOtp("");
    setOtpError("");
  }

  function handleSendOtp() {
    const err = validateAccountNumber(method, accountNumber);
    if (err) {
      setAccountError(err);
      return;
    }
    setAccountError("");
    setOtpSent(true);
    setOtp("");
    setOtpError("");
    toast.success(`Demo OTP sent to ${accountNumber.trim()} (Use ${DEMO_OTP})`);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!b || paying || secondsLeft <= 0) return;

    if (!otpSent) {
      handleSendOtp();
      return;
    }

    if (otp.trim() !== DEMO_OTP) {
      const msg = `Invalid OTP. Please enter demo OTP ${DEMO_OTP}.`;
      setOtpError(msg);
      toast.error(msg);
      return;
    }

    setOtpError("");
    setPaying(true);
    try {
      await api(`/bookings/${bookingId}/pay`, {
        method: "POST",
        body: { method },
      });
      toast.success("Payment successful! Ticket confirmed.");
      router.replace(`/payment/${bookingId}/success`);
    } catch (err) {
      toast.error(err.message);
      reload();
    } finally {
      setPaying(false);
    }
  }

  if (!ready || loading) return <p className="text-slate-500">Loading...</p>;
  if (!b) {
    return (
      <div className="space-y-3">
        <p className="text-slate-600">Booking not found.</p>
        <Link href="/my-bookings" className="text-green-600 hover:underline">
          Back to my bookings
        </Link>
      </div>
    );
  }

  if (b.status === "CONFIRMED") {
    return <p className="text-slate-500">Redirecting to payment confirmation...</p>;
  }

  const expired = b.status === "CANCELLED" || secondsLeft <= 0 || !b.canPay;
  const seatNumbers = (b.seats || []).map((s) => s.seatNumber);
  const isCard = method === "CARD";

  if (expired) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Payment window expired
              </CardTitle>
              <StatusBadge status={b.status === "CANCELLED" ? "CANCELLED" : "PENDING"} />
            </div>
            <p className="text-sm text-slate-500">Booking #{b.id}</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>
              This booking was cancelled or its {PAYMENT_WINDOW_MINUTES}-minute seat hold expired. Your seats have been
              released.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/" className={buttonVariants() + " bg-green-600 hover:bg-green-700"}>
                Search trips again
              </Link>
              <Link href="/my-bookings" className={buttonVariants({ variant: "outline" })}>
                My bookings
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {/* Payment method, number, and OTP form */}
      <form id="payment-form" onSubmit={onSubmit} className="space-y-4 md:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Complete your payment</h1>
            <p className="text-sm text-slate-500">Booking #{b.id} - Choose a method, verify OTP, and confirm.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
            <Clock className="h-4 w-4" />
            <span>Hold expires in {formatCountdown(secondsLeft)}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div>
            <p className="font-medium">Demo payment gateway</p>
            <p className="text-xs text-blue-800">
              No real money is charged. Enter any valid {isCard ? "card" : "mobile wallet"} number and verify with
              dummy OTP <span className="font-semibold">{DEMO_OTP}</span> to confirm your ticket.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Choose payment method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {PAYMENT_METHODS.map((item) => {
              const selected = method === item.value;
              const Icon = item.value === "CARD" ? CreditCard : Smartphone;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => selectMethod(item.value)}
                  aria-pressed={selected}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
                    selected
                      ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                      : "bg-white hover:border-green-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${selected ? "text-green-700" : "text-slate-500"}`} />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border ${
                      selected ? "border-4 border-green-600 bg-white" : "border-slate-300"
                    }`}
                  />
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Enter {isCard ? "card" : methodLabel(method)} details & OTP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label={isCard ? "Card number" : `${methodLabel(method)} account number`}
              htmlFor="payment-account"
              error={accountError}
            >
              <div className="flex gap-2">
                <Input
                  id="payment-account"
                  inputMode="numeric"
                  value={accountNumber}
                  disabled={otpSent}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    if (accountError) setAccountError("");
                  }}
                  placeholder={isCard ? "4242 4242 4242 4242" : "01XXXXXXXXX"}
                  required
                />
                {otpSent ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setOtpError("");
                    }}
                  >
                    Change
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSendOtp} className="shrink-0 bg-green-600 hover:bg-green-700">
                    Send OTP
                  </Button>
                )}
              </div>
            </Field>

            {otpSent && (
              <div className="space-y-3 rounded-lg border border-green-200 bg-green-50/60 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                  <KeyRound className="h-4 w-4" />
                  <span>Enter verification OTP</span>
                </div>

                <Field label="6-digit OTP" htmlFor="payment-otp" error={otpError}>
                  <Input
                    id="payment-otp"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      if (otpError) setOtpError("");
                    }}
                    placeholder={`Enter ${DEMO_OTP}`}
                    className="bg-white tracking-widest"
                    required
                  />
                </Field>

                <p className="text-xs text-slate-600">
                  Demo OTP for testing: <span className="font-mono font-semibold text-slate-900">{DEMO_OTP}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm">
          <Link href="/my-bookings" className="text-slate-600 hover:underline">
            Pay later from My Bookings
          </Link>
        </div>
      </form>

      {/* Booking summary */}
      <aside className="md:col-span-2">
        <div className="space-y-4 rounded-lg border bg-white p-4 md:sticky md:top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Booking summary</h2>
            <StatusBadge status={b.status} />
          </div>

          <TripSummary trip={b.trip} />

          <div className="border-t pt-3 text-sm">
            <p className="mb-1.5 font-medium">Passengers</p>
            <ul className="space-y-1">
              {b.seats.map((s) => (
                <li key={s.seatNumber} className="flex justify-between text-slate-600">
                  <span>{s.passengerName}</span>
                  <span className="font-medium text-slate-900">Seat {s.seatNumber}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-3">
            <FareSummary seats={seatNumbers} price={b.trip.price} />
          </div>

          <Button
            type="submit"
            form="payment-form"
            disabled={paying || secondsLeft <= 0}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {paying
              ? "Confirming payment..."
              : otpSent
                ? `Verify OTP & Pay ${formatPrice(b.totalAmount)}`
                : `Continue with ${methodLabel(method)}`}
          </Button>
        </div>
      </aside>
    </div>
  );
}
