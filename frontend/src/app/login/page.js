"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Ticket,
  Headphones,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fieldErrors } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}`);

      // Go back to the page the user came from (only local paths are allowed)
      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.push(safeNext || (user.role === "ADMIN" ? "/admin" : "/"));
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
  <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-8">
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
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
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter your registered email and password to manage your trips.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Email Field */}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-700 font-medium">
              Password
            </Label>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-green-600 text-white font-semibold hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/25 transition-all duration-200"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Footer Link */}
      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-semibold text-green-600 hover:text-green-700 transition"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  </div>
);
}
