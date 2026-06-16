import { cookies } from 'next/headers'

const BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export async function serverFetch<T>(path: string): Promise<T> {
  if (!BASE_URL) {
    throw new Error('API base URL is not configured')
  }

  if (BASE_URL.startsWith('/')) {
    throw new Error(
      `Server API base URL must be absolute, but got "${BASE_URL}". Set API_BASE_URL to your backend origin, for example http://localhost:8000/api.`
    )
  }

  const cookieHeader = (await cookies()).toString()
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: 'no-store',
    credentials: 'include',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

  if (!res.ok && res.status >= 500) {
    throw new Error(`Server fetch failed: ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const body = await res.text()
    throw new Error(
      `Expected JSON from ${path}, received ${contentType || 'unknown content type'}: ${body.slice(0, 120)}`
    )
  }

  return res.json();
}

export const healthCheckApi = {
  GET: () => serverFetch("/healthcheck")
}
