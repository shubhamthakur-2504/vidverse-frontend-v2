const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL;

export async function serverFetch<T>(path: string): Promise<T> {
  if (!BASE_URL) {
    throw new Error('API base URL is not configured')
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    credentials: "include",
  });
  
  if (!res.ok && res.status >= 500) {
    throw new Error(`Server fetch failed: ${res.status}`);
  }

  return res.json();
}

export const healthCheckApi = {
  GET: () => serverFetch("/healthcheck")
}
