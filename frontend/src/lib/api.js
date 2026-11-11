import { getToken, clearToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || [];
  }
}

// Turns the backend validation list into { fieldName: "message" }
export function fieldErrors(err) {
  const out = {};
  (err.errors || []).forEach((e) => {
    if (!out[e.field]) out[e.field] = e.message;
  });
  return out;
}

// Usage: const data = await api("/trips/search?from=Dhaka", { method: "GET" })
//        await api("/auth/login", { method: "POST", body: { email, password }, auth: false })
export async function api(path, { method = "GET", body, auth = true, redirectOn401 = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running?", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Expired or invalid token: clear it and send the user to login
    if (res.status === 401 && token) {
      clearToken();
      if (redirectOn401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw new ApiError(data?.message || "Something went wrong", res.status, data?.errors);
  }

  return data;
}
