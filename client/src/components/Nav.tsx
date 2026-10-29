import { useEffect } from 'react'
import { useApi } from '../lib/api'
export interface NavItem { id?: string; label: string; url: string; description?: string; icon?: string; children?: NavItem[]; desktop?: boolean; mobile?: boolean }
export interface NavData { header: NavItem[]; footer_quick: NavItem[]; footer_explore: NavItem[]; footer_services: NavItem[] }
const empty: NavData = { header: [], footer_quick: [], footer_explore: [], footer_services: [] }
export function useNav(): NavData { const { data } = useApi<NavData>('/api/navigation'); return data ?? empty }
export const isExternal = (u: string) => /^https?:\/\//i.test(u)

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]
const mix = (a: [number, number, number], b: [number, number, number], t: number) => a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(' ')
const HEX = /^#[0-9a-f]{6}$/i

/** Applies the admin-chosen brand colours as CSS variables, deriving the shades the design uses. */
function applyBrand(s: any) {
  const r = document.documentElement.style
  const black: [number, number, number] = [0, 0, 0], white: [number, number, number] = [255, 255, 255]
  if (HEX.test(s.brand_dark ?? '')) {
    const d = rgb(s.brand_dark)
    r.setProperty('--navy-900', d.join(' ')); r.setProperty('--navy-950', mix(d, black, 0.35)); r.setProperty('--navy-800', mix(d, white, 0.08))
    r.setProperty('--navy-700', mix(d, white, 0.16)); r.setProperty('--navy-600', mix(d, white, 0.26)); r.setProperty('--ink', mix(d, black, 0.1))
  }
  if (HEX.test(s.brand_primary ?? '')) {
    const t = rgb(s.brand_primary)
    r.setProperty('--teal', t.join(' ')); r.setProperty('--teal-600', mix(t, black, 0.2)); r.setProperty('--teal-700', mix(t, black, 0.38)); r.setProperty('--teal-50', mix(t, white, 0.9))
  }
  if (HEX.test(s.brand_accent ?? '')) { const a = rgb(s.brand_accent); r.setProperty('--amber', a.join(' ')); r.setProperty('--amber-600', mix(a, black, 0.2)) }
}

export function useSettings() {
  const { data } = useApi<{ settings: any }>('/api/settings')
  const s = data?.settings ?? {}
  useEffect(() => {
    applyBrand(s)
    if (s.favicon) { const l = document.querySelector('link[rel=icon]') as HTMLLinkElement | null; if (l) l.href = s.favicon }
    if (/^G-[A-Z0-9]{4,}$/.test(s.analytics_id ?? '') && !document.getElementById('ga')) {
      const a = document.createElement('script'); a.id = 'ga'; a.async = true; a.src = `https://www.googletagmanager.com/gtag/js?id=${s.analytics_id}`; document.head.appendChild(a)
      const w = window as any; w.dataLayer = w.dataLayer || []; w.gtag = function () { w.dataLayer.push(arguments) }; w.gtag('js', new Date()); w.gtag('config', s.analytics_id)
    }
  }, [s.favicon, s.analytics_id, s.brand_dark, s.brand_primary, s.brand_accent])
  return s
}
