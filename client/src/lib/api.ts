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

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/admin/media', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-Requested-With': 'sindbad' },
    body,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || 'Image upload failed', res.status, data.fields || {})
  return data.url as string
}

export function useApi<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!path)
  const load = useCallback(() => {
    if (!path) return
    setLoading(true); setError(null)
    api<T>(path).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [path])
  useEffect(load, [load])
  return { data, error, loading, reload: load }
}
