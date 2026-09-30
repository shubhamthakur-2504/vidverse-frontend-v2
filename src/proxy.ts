import { NextResponse, type NextRequest } from "next/server";
import { apiOrigin, API_PREFIX } from "@/lib/api/origin";

// Runs before every page request (Next.js 16 "proxy", formerly middleware):
// 1. refreshes an expired session before server components render, so pages render as the signed-in user
// 2. sends visitors without a session away from pages that need one

const PROTECTED_PREFIXES = [
  "/settings",
  "/studio",
  "/history",
  "/subscriptions",
  "/notifications",
];
// /playlists lists your own playlists, but /playlists/:id is a public page
const PROTECTED_PATHS = ["/playlists"];
// refresh a little early so the token does not expire halfway through rendering
const EXPIRY_MARGIN_SECONDS = 30;

const isProtected = (pathname: string) =>
  PROTECTED_PATHS.includes(pathname) ||
  PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

// reads exp from a JWT without verifying it (the API verifies; this only decides whether to refresh)
const secondsLeft = (token: string | undefined): number => {
  if (!token) return -1;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof payload.exp === "number"
      ? payload.exp - Date.now() / 1000
      : -1;
  } catch {
    return -1;
  }
};

// name=value pairs from Set-Cookie headers (attributes dropped)
const cookiePairs = (setCookies: string[]) =>
  Object.fromEntries(
    setCookies
      .map((c) => c.split(";")[0])
      .map((pair) => [
        pair.slice(0, pair.indexOf("=")),
        pair.slice(pair.indexOf("=") + 1),
      ])
  );

const redirectToLogin = (request: NextRequest) => {
  const url = new URL("/auth/login", request.url);
  url.searchParams.set(
    "redirect",
    request.nextUrl.pathname + request.nextUrl.search
  );
  return NextResponse.redirect(url);
};

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const needsSession = isProtected(request.nextUrl.pathname);

  if (secondsLeft(accessToken) > EXPIRY_MARGIN_SECONDS)
    return NextResponse.next();
  if (!refreshToken)
    return needsSession ? redirectToLogin(request) : NextResponse.next();

  let refreshed: Response | null = null;
  try {
    refreshed = await fetch(`${apiOrigin()}${API_PREFIX}/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: `refreshToken=${refreshToken}`,
        "user-agent": request.headers.get("user-agent") ?? "unknown",
        ...(request.headers.get("x-forwarded-for") && {
          "x-forwarded-for": request.headers.get("x-forwarded-for")!,
        }),
      },
      cache: "no-store",
    });
  } catch {
    // API unreachable: render anonymously rather than failing the page
    return needsSession ? redirectToLogin(request) : NextResponse.next();
  }

  if (!refreshed.ok) {
    // the session is over (expired, revoked or reused): drop the dead cookies
    const response = needsSession
      ? redirectToLogin(request)
      : NextResponse.next();
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  // hand the rotated cookies to the server components of this request, and to the browser
  const setCookies = refreshed.headers.getSetCookie();
  const fresh = cookiePairs(setCookies);
  const requestHeaders = new Headers(request.headers);
  const merged = {
    ...Object.fromEntries(
      request.cookies.getAll().map((c) => [c.name, c.value])
    ),
    ...fresh,
  };
  requestHeaders.set(
    "cookie",
    Object.entries(merged)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ")
  );

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const cookie of setCookies)
    response.headers.append("set-cookie", cookie);
  return response;
}

export const config = {
  // pages only: not the /api proxy, Next internals or static files
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
