import { useEffect } from 'react'
export function Seo({ title, description }: { title?: string; description?: string }) {
  useEffect(() => {
    document.title = title ? `${title} | Sindbad Solution` : 'Sindbad Solution — Smart software for every business'
    if (description) document.querySelector('meta[name=description]')?.setAttribute('content', description)
    let c = document.querySelector('link[rel=canonical]') as HTMLLinkElement | null
    if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c) }
    c.href = window.location.origin + window.location.pathname
  }, [title, description])
  return null
}
