import { useEffect } from 'react'
function meta(attr: 'name' | 'property', key: string, content?: string) {
  if (!content) return
  let m = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m) }
  m.content = content
}
/** Per-page title, description, Open Graph, canonical and optional JSON-LD. Structured data is only emitted from real database content. */
export function Seo({ title, description, image, jsonLd, type = 'website' }: { title?: string; description?: string; image?: string; jsonLd?: object; type?: string }) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : ''
  useEffect(() => {
    const t = title ? `${title} | Sindbad Solution` : 'Sindbad Solution | Software, cloud, AI and automation'
    document.title = t
    meta('name', 'description', description); meta('property', 'og:title', t); meta('property', 'og:description', description)
    meta('property', 'og:type', type); meta('property', 'og:url', window.location.origin + window.location.pathname); meta('name', 'twitter:card', 'summary_large_image')
    meta('property', 'og:image', image ? new URL(image, window.location.origin).href : undefined)
    let c = document.querySelector('link[rel=canonical]') as HTMLLinkElement | null
    if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c) }
    c.href = window.location.origin + window.location.pathname
    document.getElementById('ld-json')?.remove()
    if (ld) { const s = document.createElement('script'); s.id = 'ld-json'; s.type = 'application/ld+json'; s.text = ld; document.head.appendChild(s) }
    return () => { document.getElementById('ld-json')?.remove() }
  }, [title, description, image, ld, type])
  return null
}
