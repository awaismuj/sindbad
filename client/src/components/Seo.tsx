import { useEffect } from 'react'
export function Seo({ title, description, image }: { title?: string; description?: string; image?: string }) {
  useEffect(() => {
    const pageTitle = title ? `${title} | Sindbad Solution` : 'Sindbad Solution — Smart software for every business'
    document.title = pageTitle
    if (description) document.querySelector('meta[name=description]')?.setAttribute('content', description)
    const setProperty = (property: string, value?: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      if (!value) { tag?.remove(); return }
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.appendChild(tag) }
      tag.content = value
    }
    setProperty('og:title', pageTitle)
    setProperty('og:description', description)
    setProperty('og:image', image ? new URL(image, window.location.origin).href : undefined)
    let c = document.querySelector('link[rel=canonical]') as HTMLLinkElement | null
    if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c) }
    c.href = window.location.origin + window.location.pathname
  }, [title, description, image])
  return null
}
