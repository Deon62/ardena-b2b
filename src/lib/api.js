// Ardena B2B API client. Auth + onboarding endpoints are live; the other
// modules keep local stores until their endpoints ship (docs/backend-api.md).
//
// The backend is FastAPI: errors come back as { detail: string } or
// { detail: [{ loc, msg }, ...] } for validation failures.
import { getSession, setSession, clearSession } from "./authStore";

const BASE =
  import.meta.env.VITE_API_BASE_URL || "https://api.ardena.xyz/api/v1/b2b";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function messageFrom(data, status) {
  const detail = data?.detail;
  if (typeof detail === "string" && detail !== "Internal server error") {
    return detail;
  }
  if (Array.isArray(detail) && detail.length) {
    const d = detail[0];
    const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : null;
    return field ? `${field}: ${d.msg}` : d.msg;
  }
  if (status === 401) return "Your session has expired. Please sign in again.";
  return "Something went wrong. Please try again.";
}

// One refresh at a time; concurrent 401s all wait on the same attempt.
let refreshing = null;

function refreshSession() {
  if (!refreshing) {
    refreshing = (async () => {
      const { refreshToken } = getSession();
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        setSession({
          token: data.access_token || data.token,
          refreshToken: data.refresh_token || refreshToken,
        });
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function request(path, { method = "GET", body, auth = true } = {}, retried = false) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const { token } = getSession();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0, null);
  }

  if (res.status === 401 && auth) {
    if (!retried && (await refreshSession())) {
      return request(path, { method, body, auth }, true);
    }
    clearSession(); // bounces the app back to /login via RequireAuth
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(messageFrom(data, res.status), res.status, data);
  return data;
}

/* ---- Auth ---- */

export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setSession({
    token: data.access_token || data.token,
    refreshToken: data.refresh_token || null,
    user: data.user || null,
    business: data.business || null,
  });
  return data;
}

// { business_name, contact_name, email, phone, fleet_size, town?, website? }
// fleet_size is one of: "3–10" | "11–30" | "31–100" | "100+"
export function requestAccess(payload) {
  return request("/auth/access-requests", { method: "POST", body: payload, auth: false });
}

export async function logout() {
  const { refreshToken } = getSession();
  try {
    await request("/auth/logout", {
      method: "POST",
      body: refreshToken ? { refresh_token: refreshToken } : {},
    });
  } catch {
    /* the local session is cleared regardless */
  }
  clearSession();
}

/* ---- Me & onboarding ---- */

export async function fetchMe() {
  const data = await request("/me");
  const user = data?.user || data;
  const business = data?.business || user?.business || null;
  setSession({ user, business });
  return { user, business };
}

export function fetchOnboarding() {
  return request("/onboarding");
}
