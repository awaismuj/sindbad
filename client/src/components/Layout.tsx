import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useApi } from '../lib/api'

export const DEFAULT_NAVIGATION = [
  { label: 'Home', path: '/', enabled: true, order: 0 },
  { label: 'Products', path: '/products', enabled: true, order: 1 },
  { label: 'Solutions', path: '/solutions', enabled: true, order: 2 },
  { label: 'Services', path: '/services', enabled: true, order: 3, children: [{ label: 'All services', path: '/services', enabled: true }] },
  { label: 'Pricing', path: '/pricing', enabled: true, order: 4 },
  { label: 'Portfolio', path: '/portfolio', enabled: true, order: 5 },
  { label: 'About Us', path: '/about', enabled: true, order: 6 },
  { label: 'Blog', path: '/blog', enabled: true, order: 7 },
  { label: 'Contact Us', path: '/contact', enabled: true, order: 8 },
]
export const DEFAULT_FOOTER_GROUPS = [
  { title: 'Quick Links', links: [
    { label: 'About Us', path: '/about', enabled: true }, { label: 'Blog', path: '/blog', enabled: true },
    { label: 'Careers', path: '/careers', enabled: true }, { label: 'Life at Sindbad', path: '/life-at-sindbad', enabled: true },
    { label: 'Contact Us', path: '/contact', enabled: true },
  ] },
  { title: 'Explore', links: [
    { label: 'Products', path: '/products', enabled: true }, { label: 'Solutions', path: '/solutions', enabled: true },
    { label: 'Services', path: '/services', enabled: true }, { label: 'Pricing', path: '/pricing', enabled: true },
    { label: 'About', path: '/about', enabled: true }, { label: 'Contact', path: '/contact', enabled: true },
    { label: 'Portfolio', path: '/portfolio', enabled: true }, { label: 'Blog', path: '/blog', enabled: true },
  ] },
]

export function Layout() {
  const [open, setOpen] = useState(false)
  const { data } = useApi<{ settings: any }>('/api/settings')
  const { data: services } = useApi<{ items: any[] }>('/api/services')
  const s = data?.settings ?? {}
  const allServices = services?.items ?? []
  const serviceLinks = allServices.filter((service) => service.menu_visible)
  const navigation = (Array.isArray(s.navigation) ? s.navigation : DEFAULT_NAVIGATION)
    .filter((item: any) => item.enabled !== false).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  const footerGroups = Array.isArray(s.footer_groups) ? s.footer_groups : DEFAULT_FOOTER_GROUPS
  const desktopNavigation = navigation.filter((item: any) => item.desktop_visible !== false)
  const mobileNavigation = navigation.filter((item: any) => item.mobile_visible !== false)
  const serviceChildren = serviceLinks.map((service) => ({ label: service.name, path: `/services/${service.slug}`, enabled: true }))
  const link = (item: any, className: string, onClick?: () => void) => /^https:\/\//i.test(item.path)
    ? <a href={item.path} key={`${item.label}-${item.path}`} rel="noopener noreferrer" className={className} onClick={onClick}>{item.label}</a>
    : <Link to={item.path} key={`${item.label}-${item.path}`} className={className} onClick={onClick}>{item.label}</Link>
  const menuItem = (item: any, mobile = false) => {
    const children = [...(Array.isArray(item.children) ? item.children.filter((child: any) =>
      child.enabled !== false && (mobile ? child.mobile_visible !== false : child.desktop_visible !== false)) : []),
      ...(item.path === '/services' ? serviceChildren : [])]
    if (children.length) return mobile
      ? <details key={item.path} className="rounded-lg">
          <summary className="cursor-pointer rounded-lg px-3 py-3 font-semibold hover:bg-sea-50">{item.label}</summary>
          <div className="pb-2">{children.map((child: any) => link(child, 'block rounded-lg px-6 py-2 text-sm hover:bg-sea-50', () => setOpen(false)))}</div>
        </details>
      : <details key={item.path} className="group relative">
          <summary className="cursor-pointer list-none text-sm font-semibold hover:text-sea-600">{item.label} <span aria-hidden="true">⌄</span></summary>
          <div className="absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-sea-100 bg-white p-2 shadow-soft">
            {link(item, 'block rounded-lg px-3 py-2 font-semibold text-sea-700 hover:bg-sea-50')}
            {children.map((child: any) => link(child, 'block rounded-lg px-3 py-2 text-sm hover:bg-sea-50'))}
          </div>
        </details>
    return link(item, mobile
      ? 'rounded-lg px-3 py-3 font-semibold hover:bg-sea-50'
      : 'text-sm font-semibold hover:text-white', mobile ? () => setOpen(false) : undefined)
  }
  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (favicon) favicon.href = s.favicon_url || '/favicon.png'
  }, [s.favicon_url])
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-sea-100 bg-white/90 text-navy-900 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <img src={s.logo_url || '/brand/logo.png'} alt="" width={40} height={40} className="rounded-full object-cover" />
            <span className="font-display text-lg font-semibold tracking-tight">{s.company_name || 'Sindbad Solution'}</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-4 lg:flex">
            {desktopNavigation.map((item: any) => menuItem(item))}
            <Link to="/demo" className="btn-primary !py-2">Get a demo</Link>
          </nav>
          <button className="lg:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
          </button>
        </div>
        {open && (
          <nav aria-label="Mobile" className="container-x flex flex-col gap-1 pb-4 lg:hidden">
            {mobileNavigation.map((item: any) => menuItem(item, true))}
            <Link to="/demo" onClick={() => setOpen(false)} className="btn-primary mt-2">Get a demo</Link>
          </nav>
        )}
      </header>
      <main id="main"><Outlet /></main>
      <footer className="bg-navy-950 text-white/75">
        <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
          <div className="md:col-span-2">
            <img src={s.logo_url || '/brand/logo.png'} alt={s.company_name || 'Sindbad Solution'} width={72} height={72} className="rounded-full object-cover" />
            <p className="mt-4 max-w-sm">{s.description || 'Business software, POS and ERP systems and automation.'}</p>
            <p className="mt-3 font-arabic text-lg text-amber">نبحر بأعمالك نحو آفاق رقمية جديدة</p>
          </div>
          {footerGroups.filter((group: any) => group.enabled !== false).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).map((group: any) => <div key={group.title}>
            <h3 className="font-display text-white">{group.title}</h3>
            <ul className="mt-3 space-y-2">{(group.links ?? []).filter((item: any) => item.enabled !== false).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).map((item: any) =>
              <li key={`${item.label}-${item.path}`}>{link(item, 'hover:text-white')}</li>)}</ul>
          </div>)}
          <div>
            <h3 className="font-display text-white">Our Services</h3>
            <ul className="mt-3 space-y-2">{allServices.filter((service) => service.footer_visible).map((service) =>
              <li key={service.id}><Link className="hover:text-sea-600" to={`/services/${service.slug}`}>{service.name}</Link></li>)}</ul>
          </div>
          <div>
            <h3 className="font-display text-white">Contact</h3>
            <ul className="mt-3 space-y-2">
              {s.email && <li><a className="hover:text-sea-600" href={`mailto:${s.email}`}>{s.email}</a></li>}
              {s.phone && <li><a className="hover:text-sea-600" href={`tel:${s.phone}`}>{s.phone}</a></li>}
              {s.whatsapp && <li><a className="hover:text-sea-600" href={`https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}`}>WhatsApp</a></li>}
              {s.address && <li>{s.address}</li>}
              {!s.email && !s.phone && !s.address && <li><Link className="hover:text-sea-600" to="/contact">Send us a message</Link></li>}
              {['linkedin', 'facebook', 'instagram', 'x'].filter((k) => s[k]).map((k) => <li key={k}><a className="capitalize hover:text-sea-600" href={s[k]} rel="noopener noreferrer">{k === 'x' ? 'X' : k}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-sm">{s.copyright_text || `© ${new Date().getFullYear()} ${s.company_name || 'Sindbad Solution'}. All rights reserved.`}</div>
      </footer>
    </>
  )
}
