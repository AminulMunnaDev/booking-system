"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useRequireAuth from "@/hooks/useRequireAuth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/buses", label: "Buses" },
  { href: "/admin/routes", label: "Routes" },
  { href: "/admin/trips", label: "Trips" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/users", label: "Users" },
];

// Protects every page under /admin and adds the sidebar
export default function AdminLayout({ children }) {
  const { ready } = useRequireAuth("ADMIN");
  const pathname = usePathname();

  if (!ready) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <aside className="md:w-48 md:shrink-0">
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {links.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                  active ? "bg-green-600 text-white" : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
