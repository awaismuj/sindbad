import { useEffect } from 'react'
function meta(attr: 'name' | 'property', key: string, content?: string) {
  if (!content) return
  let m = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m) }
  m.content = content
}
export function Seo({ title, description, image }: { title?: string; description?: string; image?: string }) {
  useEffect(() => {
    // The server injects JSON-LD for the page that was first requested; drop it once the visitor navigates elsewhere
    const ld = document.getElementById('ld-json'); if (ld && ld.getAttribute('data-path') !== window.location.pathname) ld.remove()
    const t = title ? `${title} | Sindbad Solution` : 'Sindbad Solution | Software, cloud, AI and automation'
    document.title = t
    meta('name', 'description', description); meta('property', 'og:title', t); meta('property', 'og:description', description)
    meta('property', 'og:type', 'website'); meta('property', 'og:url', window.location.origin + window.location.pathname)
    meta('property', 'og:image', image ? new URL(image, window.location.origin).href : undefined)
    let c = document.querySelector('link[rel=canonical]') as HTMLLinkElement | null
    if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c) }
    c.href = window.location.origin + window.location.pathname
  }, [title, description, image])
  return null
}
