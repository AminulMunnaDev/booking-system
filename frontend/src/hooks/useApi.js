"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// const { data, loading, reload } = useApi("/admin/buses");
// Public pages:   useApi("/cities", false)   (does not send the login token)
// Wait for later: useApi(ready ? "/bookings/my" : null)   (null = do not load yet)
export default function useApi(path, auth = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!path);

  const load = useCallback(async () => {
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setData(await api(path, { auth }));
    } catch (err) {
      setData(null);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, auth]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, reload: load };
}
