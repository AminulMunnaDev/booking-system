"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fieldErrors } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});

    if (form.password !== form.confirm) {
      setErrors({ confirm: "Passwords do not match" });
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success("Account created. Please log in.");
      router.push("/login");
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

return (
  <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-8">
    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      {/* Top Navigation & Brand */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-green-600 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-green-600 font-bold tracking-tight hover:text-green-700 transition"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 border border-green-100">
            <Bus className="h-4 w-4" />
          </div>
          <span className="text-lg">BusGo</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Register to book bus tickets and manage your upcoming trips.
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-slate-700 font-medium">
            Full Name
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="name"
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Tanvir Ahmed"
              className={`h-11 pl-10 bg-slate-50/50 border-slate-200 focus-visible:bg-white focus-visible:ring-green-600 ${
                errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              required
            />
          </div>
          {errors.name && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email & Phone Row on Desktop */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700 font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className={`h-11 pl-10 bg-slate-50/50 border-slate-200 focus-visible:bg-white focus-visible:ring-green-600 ${
                  errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                required
              />
            </div>
            {errors.email && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-slate-700 font-medium">
              Mobile Number
            </Label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-sm font-medium select-none">
                +88
              </span>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="01XXXXXXXXX"
                className={`h-11 rounded-l-none bg-slate-50/50 border-slate-200 focus-visible:bg-white focus-visible:ring-green-600 ${
                  errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                required
              />
            </div>
            {errors.phone && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Password & Confirm Password Row on Desktop */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-700 font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
                placeholder="Create password"
                className={`h-11 pl-10 pr-10 bg-slate-50/50 border-slate-200 focus-visible:bg-white focus-visible:ring-green-600 ${
                  errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-slate-700 font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="Repeat password"
                className={`h-11 pl-10 pr-10 bg-slate-50/50 border-slate-200 focus-visible:bg-white focus-visible:ring-green-600 ${
                  errors.confirm ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.confirm}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/25 transition-all duration-200"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </form>

      {/* Footer Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-green-600 hover:text-green-700 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </div>
);
}