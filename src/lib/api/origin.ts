// Where the Next.js server reaches the API (e.g. http://localhost:5000, or http://backend:5000 in docker compose).
// The browser never uses it: browser requests go to this app's own /api/*, which next.config rewrites to the API,
// so auth cookies are first-party and no CORS is involved.
// API_ORIGIN is preferred; the origin of the older API_BASE_URL is accepted so existing .env files keep working.
export function apiOrigin(): string {
  if (process.env.API_ORIGIN) return process.env.API_ORIGIN.replace(/\/+$/, "");
  if (process.env.API_BASE_URL) return new URL(process.env.API_BASE_URL).origin;
  return "http://localhost:5000";
}

// path prefix of the API version this app talks to (same-origin in the browser, absolute on the server)
export const API_PREFIX = "/api/v2";
