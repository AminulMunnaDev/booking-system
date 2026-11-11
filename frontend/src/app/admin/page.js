"use client";

import useRequireAuth from "@/hooks/useRequireAuth";

// Placeholder. The real dashboard is built in Step 7.
export default function AdminPage() {
  const { ready } = useRequireAuth("ADMIN");

  if (!ready) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <p className="text-slate-600">The admin area is protected. Dashboard coming in Step 7.</p>
    </div>
  );
}
