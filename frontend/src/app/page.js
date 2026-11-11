"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { buttonVariants } from "@/components/ui/button";

// Temporary home page. The real search form is built in Step 8.
export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="space-y-6 py-16 text-center">
      <h1 className="text-4xl font-bold">Book your bus ticket</h1>
      <p className="text-slate-600">Search trips, pick your seats and travel with ease.</p>

      {!loading && user && (
        <p className="font-medium text-green-700">
          You are logged in as {user.name} ({user.role})
        </p>
      )}

      {!loading && !user && (
        <div className="flex justify-center gap-3">
          <Link href="/login" className={buttonVariants({ variant: "outline" })}>
            Login
          </Link>
          <Link href="/register" className={buttonVariants() + " bg-green-600 hover:bg-green-700"}>
            Create account
          </Link>
        </div>
      )}

      <p className="text-sm text-slate-400">Trip search coming in Step 8.</p>
    </div>
  );
}
