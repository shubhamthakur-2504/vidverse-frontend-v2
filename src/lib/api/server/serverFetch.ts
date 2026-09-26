import { cookies } from 'next/headers'
import { apiOrigin, API_PREFIX } from '../origin'

// server components call the API directly (not through the /api rewrite) and forward the visitor's cookies
export async function serverFetch<T>(path: string): Promise<T> {
  const cookieHeader = (await cookies()).toString()
  const res = await fetch(`${apiOrigin()}${API_PREFIX}${path}`, {
    cache: 'no-store',
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
  GET: () => serverFetch("/health")
}
