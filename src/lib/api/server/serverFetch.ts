import { cookies, headers } from "next/headers";
import { apiOrigin, API_PREFIX } from "../origin";

// server components call the API directly (not through the /api rewrite) and forward the visitor's cookies.
// They also forward X-Forwarded-For (set by the edge proxy in front of this app) and the user agent, so the
// API rate-limits and logs the visitor rather than treating every server render as one client.
export async function serverFetch<T>(path: string): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const incoming = await headers();
  const forwarded: Record<string, string> = {};
  if (cookieHeader) forwarded.cookie = cookieHeader;
  const forwardedFor = incoming.get("x-forwarded-for");
  if (forwardedFor) forwarded["x-forwarded-for"] = forwardedFor;
  const userAgent = incoming.get("user-agent");
  if (userAgent) forwarded["user-agent"] = userAgent;

  const res = await fetch(`${apiOrigin()}${API_PREFIX}${path}`, {
    cache: "no-store",
    headers: forwarded,
  });

  if (!res.ok && res.status >= 500) {
    throw new Error(`Server fetch failed: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const body = await res.text();
    throw new Error(
      `Expected JSON from ${path}, received ${contentType || "unknown content type"}: ${body.slice(0, 120)}`
    );
  }

  return res.json();
}

export const healthCheckApi = {
  GET: () => serverFetch("/health"),
};
