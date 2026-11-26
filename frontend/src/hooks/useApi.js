"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// const { data, loading, reload } = useApi("/admin/buses");
// Public pages:   useApi("/cities", false)   (does not send the login token)
// Wait for later: useApi(ready ? "/bookings/my" : null)   (null = do not load yet)
export default function useApi(path, auth = true) {
  const [result, setResult] = useState({ key: null, data: null });
  const [nonce, setNonce] = useState(0);
  const requestKey = path ? `${path}|${auth}|${nonce}` : null;

  useEffect(() => {
    if (!requestKey) return;
    let cancelled = false;
    api(path, { auth })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ key: requestKey, data: null });
          toast.error(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey, path, auth]);

  const loading = Boolean(requestKey) && result.key !== requestKey;
  const data = requestKey && result.key === requestKey ? result.data : null;
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, reload };
}
