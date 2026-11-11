"use client";

import Link from "next/link";
import { Bus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-green-600">
          <Bus className="h-6 w-6" />
          BusGo
        </Link>

        <nav className="flex items-center gap-2">
          {!loading && !user && (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                Login
              </Link>
              <Link href="/register" className={buttonVariants() + " bg-green-600 hover:bg-green-700"}>
                Register
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin" className={buttonVariants({ variant: "ghost" })}>
                  Admin
                </Link>
              )}
              <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
