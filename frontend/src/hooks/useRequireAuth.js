"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Usage: const { ready } = useRequireAuth();          // any logged-in user
//        const { ready } = useRequireAuth("ADMIN");   // admins only
// Render the page only when ready is true.
export default function useRequireAuth(role) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (role && user.role !== role) {
      router.replace("/");
    }
  }, [user, loading, role, router, pathname]);

  const ready = !loading && !!user && (!role || user.role === role);
  return { user, loading, ready };
}
