import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { isExternal, NavItem, useNav, useSettings } from './Nav'

const A = ({ to, children, ...p }: { to: string; children: React.ReactNode } & React.HTMLAttributes<HTMLElement>) =>
  isExternal(to) ? <a href={to} rel="noopener noreferrer" {...(p as any)}>{children}</a> : <Link to={to} {...(p as any)}>{children}</Link>

function Dropdown({ item, close }: { item: NavItem; close?: () => void }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [])
  const kids = item.children ?? []
  const cols = kids.length > 6 ? 'grid-cols-2' : 'grid-cols-1'
  return (
    <li ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="flex items-center gap-1">
        <NavLink to={item.url} className={({ isActive }) => `py-6 text-sm font-semibold hover:text-teal ${isActive ? 'text-teal' : ''}`}>{item.label}</NavLink>
        <button aria-expanded={open} aria-label={`${item.label} menu`} onClick={() => setOpen(!open)} className="p-1">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></button>
      </div>
      {open && (
        <div className={`absolute left-1/2 top-full z-50 w-max max-w-[44rem] -translate-x-1/2 rounded-2xl border border-white/10 bg-navy-950 p-3 shadow-2xl`}>
          <ul className={`grid gap-1 ${cols}`}>
            {kids.map((k) => (
              <li key={k.url + k.label}><A to={k.url} onClick={() => { setOpen(false); close?.() }} className="block min-w-[16rem] rounded-xl px-4 py-3 hover:bg-white/10">
                <span className="block font-display text-sm font-semibold">{k.label}</span>
                {k.description && <span className="mt-0.5 block text-xs text-white/60">{k.description.slice(0, 80)}</span>}
              </A></li>))}
          </ul>
          <Link to={item.url} onClick={() => setOpen(false)} className="mt-2 block rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-teal hover:bg-white/10">View all {item.label.toLowerCase()}</Link>
        </div>)}
    </li>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false); const [exp, setExp] = useState<string | null>(null)
  const nav = useNav(); const s = useSettings(); const loc = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  const top = nav.header.filter((i) => i.desktop !== false)
  const logo = s.logo || '/brand/logo.png'
  const legal = [s.privacy_url && ['Privacy', s.privacy_url], s.terms_url && ['Terms', s.terms_url]].filter(Boolean) as string[][]
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-amber focus:p-3">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900/90 text-white backdrop-blur-lg">
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-3"><img src={logo} alt="" width={44} height={44} className="rounded-full" />
            <span className="font-display text-lg font-extrabold tracking-tight">Sindbad <span className="text-amber">Solution</span></span></Link>
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {top.map((i) => i.children?.length ? <Dropdown key={i.id} item={i} /> :
                <li key={i.id}><NavLink to={i.url} end={i.url === '/'} className={({ isActive }) => `py-6 text-sm font-semibold hover:text-teal ${isActive ? 'text-teal' : ''}`}>{i.label}</NavLink></li>)}
            </ul>
          </nav>
          <div className="hidden lg:block"><Link to="/demo" className="btn-amber !py-2.5">Get a demo</Link></div>
          <button className="lg:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg></button>
        </div>
        {open && (
          <nav aria-label="Mobile" className="container-x max-h-[80vh] overflow-y-auto pb-6 lg:hidden">
            {nav.header.filter((i) => i.mobile !== false).map((i) => (
              <div key={i.id} className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <Link to={i.url} className="block flex-1 py-3.5 font-semibold">{i.label}</Link>
                  {!!i.children?.length && <button aria-expanded={exp === i.id} aria-label={`${i.label} submenu`} className="p-3" onClick={() => setExp(exp === i.id ? null : (i.id ?? null))}>{exp === i.id ? '−' : '+'}</button>}
                </div>
                {exp === i.id && <ul className="pb-3 pl-3">{i.children!.map((k) => <li key={k.url}><A to={k.url} className="block py-2 text-white/75">{k.label}</A></li>)}</ul>}
              </div>))}
            <Link to="/demo" className="btn-amber mt-5 w-full">Get a demo</Link>
          </nav>)}
      </header>
      <main id="main"><Outlet /></main>
      <footer className="bg-navy-950 text-white/75">
        <div className="container-x grid gap-12 py-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <img src={logo} alt="Sindbad Solution" width={80} height={80} className="rounded-full" />
            <p className="mt-5 max-w-xs">{s.description || 'Business software, cloud and automation.'}</p>
            <p className="mt-3 font-arabic text-lg text-amber" lang="ar" dir="rtl">نبحر بأعمالك نحو آفاق رقمية جديدة</p>
            <ul className="mt-5 space-y-1.5 text-sm">
              {s.email && <li><a className="hover:text-teal" href={`mailto:${s.email}`}>{s.email}</a></li>}
              {s.phone && <li><a className="hover:text-teal" href={`tel:${s.phone}`}>{s.phone}</a></li>}
              {s.whatsapp && <li><a className="hover:text-teal" href={`https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}`}>WhatsApp</a></li>}
              {s.address && <li>{s.address}</li>}
            </ul>
            <p className="mt-4 flex gap-4 text-sm">{(['linkedin', 'facebook', 'instagram', 'x'] as const).filter((k) => s[k]).map((k) => <a key={k} href={s[k]} rel="noopener noreferrer" className="capitalize hover:text-teal">{k === 'x' ? 'X' : k}</a>)}</p>
          </div>
          <FooterGroup className="md:col-span-2" title="Quick links" items={nav.footer_quick} />
          <FooterGroup className="md:col-span-4" title="Our services" items={nav.footer_services} />
          <FooterGroup className="md:col-span-2" title="Explore" items={nav.footer_explore} />
        </div>
        <div className="border-t border-white/10">
          <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-sm">
            <span>{s.copyright || `© ${new Date().getFullYear()} Sindbad Solution. All rights reserved.`}</span>
            <span className="flex gap-5">{legal.map(([l, u]) => <a key={l} href={u} className="hover:text-teal">{l}</a>)}</span>
          </div>
        </div>
      </footer>
    </>
  )
}
function FooterGroup({ title, items, className = '' }: { title: string; items: NavItem[]; className?: string }) {
  if (!items.length) return <div className={className} />
  return (
    <div className={className}>
      <h2 className="font-display text-base font-bold text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">{items.map((i) => <li key={i.url + i.label}><A to={i.url} className="hover:text-teal">{i.label}</A></li>)}</ul>
    </div>
  )
}
