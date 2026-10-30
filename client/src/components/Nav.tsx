import { useEffect, useState } from 'react'
import { useApi } from '../lib/api'
import { applyBrand } from '../lib/theme'
export interface NavItem { id?: string; label: string; url: string; description?: string; children?: NavItem[]; desktop?: boolean; mobile?: boolean }
export interface NavData { header: NavItem[]; footer_quick: NavItem[]; footer_explore: NavItem[]; footer_services: NavItem[] }
const empty: NavData = { header: [], footer_quick: [], footer_explore: [], footer_services: [] }
export function useNav(): NavData { const { data } = useApi<NavData>('/api/navigation'); return data ?? empty }
export const isExternal = (u: string) => /^https?:\/\//i.test(u)
export function useSettings() {
  const { data } = useApi<{ settings: any }>('/api/settings')
  const s = data?.settings ?? {}
  useEffect(() => {
    if (s.favicon) { let l = document.querySelector('link[rel=icon]') as HTMLLinkElement | null; if (l) l.href = s.favicon }
    if (/^G-[A-Z0-9]{4,}$/.test(s.analytics_id ?? '') && !document.getElementById('ga')) {
      const a = document.createElement('script'); a.id = 'ga'; a.async = true; a.src = `https://www.googletagmanager.com/gtag/js?id=${s.analytics_id}`; document.head.appendChild(a)
      const w = window as any; w.dataLayer = w.dataLayer || []; w.gtag = function () { w.dataLayer.push(arguments) }; w.gtag('js', new Date()); w.gtag('config', s.analytics_id)
    }
  }, [s.favicon, s.analytics_id])
  useEffect(() => { if (data) applyBrand(s) }, [data])
  return s
}
export const useOpen = () => useState<string | null>(null)
