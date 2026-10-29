import { useEffect, useState, useCallback } from 'react'

export class ApiError extends Error {
  constructor(message: string, public status: number, public fields: Record<string, string> = {}) { super(message) }
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(path, {
    method: opts.method ?? 'GET',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'sindbad' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || 'Request failed', res.status, data.fields || {})
  return data as T
}

/** Public GETs are cached for the session and revalidated on every mount, so menus and settings are not refetched by every component. */
const cache = new Map<string, unknown>()
export function useApi<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(() => (path && !path.startsWith('/api/admin') && !path.includes('nocache') ? (cache.get(path) as T) ?? null : null))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!path && !(data))
  const load = useCallback(() => {
    if (!path) return
    setError(null)
    api<T>(path).then((d) => { cache.set(path, d); setData(d) }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [path])
  useEffect(() => { if (path) { const c = cache.get(path) as T | undefined; if (c && !path.startsWith('/api/admin') && !path.includes('nocache')) { setData(c); setLoading(false) } else setLoading(true) } load() }, [load, path])
  return { data, error, loading, reload: load }
}
