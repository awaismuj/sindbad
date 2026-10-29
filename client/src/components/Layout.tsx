import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { isExternal, NavItem, useNav, useSettings } from './Nav'
import { Icon } from './Icon'

const A = ({ to, children, ...p }: { to: string; children: React.ReactNode } & React.HTMLAttributes<HTMLElement>) =>
  isExternal(to) ? <a href={to} rel="noopener noreferrer" {...(p as any)}>{children}</a> : <Link to={to} {...(p as any)}>{children}</Link>

const linkCls = ({ isActive }: { isActive: boolean }) => `relative py-7 text-[0.92rem] font-semibold transition-colors hover:text-teal ${isActive ? 'text-teal' : 'text-white/90'}`

function Dropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [])
  const kids = item.children ?? []
  const wide = kids.length > 5
  return (
    <li ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="flex items-center gap-1">
        <NavLink to={item.url} className={linkCls} onClick={() => setOpen(false)}>{item.label}</NavLink>
        <button aria-expanded={open} aria-label={`${item.label} menu`} onClick={() => setOpen(!open)} className="-ml-0.5 p-1 text-white/70 hover:text-teal"><Icon name="chevron" size={14} stroke={2.2} className={`transition-transform ${open ? 'rotate-180' : ''}`} /></button>
      </div>
      {open && (
        <div className={`absolute left-1/2 top-full z-50 -translate-x-1/2 rounded-2xl bg-white p-3 text-ink shadow-lift ring-1 ring-navy-900/10 ${wide ? 'w-[44rem] max-w-[92vw]' : 'w-[22rem]'}`}>
          <ul className={`grid gap-1 ${wide ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {kids.map((k) => (
              <li key={k.url + k.label}><A to={k.url} onClick={() => setOpen(false)} className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-teal-50">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-900 text-teal"><Icon name={k.icon} size={20} /></span>
                <span><span className="block font-display text-[0.95rem] font-semibold text-navy-900">{k.label}</span>
                  {k.description && <span className="mt-0.5 line-clamp-2 block text-[0.8rem] leading-snug text-ink/65">{k.description}</span>}</span>
              </A></li>))}
          </ul>
          <Link to={item.url} onClick={() => setOpen(false)} className="mt-2 flex items-center justify-between rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-700">View all {item.label.toLowerCase()}<Icon name="arrow" size={16} /></Link>
        </div>)}
    </li>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false); const [exp, setExp] = useState<string | null>(null)
  const nav = useNav(); const s = useSettings(); const loc = useLocation()
  useEffect(() => { setOpen(false); if (!loc.hash) window.scrollTo(0, 0) }, [loc.pathname])
  const top = nav.header.filter((i) => i.desktop !== false)
  const logo = s.logo || '/brand/logo.png'
  const name = s.company_name || 'Sindbad Solution'
  const [first, ...rest] = name.split(' ')
  const ctaLabel = s.cta_label || 'Get a demo'; const ctaUrl = s.cta_url || '/demo'
  const legal = [s.privacy_url && ['Privacy', s.privacy_url], s.terms_url && ['Terms', s.terms_url]].filter(Boolean) as string[][]
  const social = (['linkedin', 'facebook', 'instagram', 'x'] as const).filter((k) => s[k])
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-amber focus:p-3">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/90 text-white backdrop-blur-xl">
        <div className="container-x flex h-[76px] items-center justify-between gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label={`${name} home`}>
            <img src={logo} alt="" width={46} height={46} className="rounded-full ring-1 ring-white/20" />
            <span className="font-display text-xl font-extrabold tracking-tight">{first} <span className="text-amber">{rest.join(' ')}</span></span>
          </Link>
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {top.map((i) => i.children?.length ? <Dropdown key={i.id} item={i} /> :
                <li key={i.id}><NavLink to={i.url} end={i.url === '/'} className={linkCls}>{i.label}</NavLink></li>)}
            </ul>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/contact" className="text-[0.92rem] font-semibold text-white/80 hover:text-teal">Request a quote</Link>
            <A to={ctaUrl} className="btn-amber !py-2.5">{ctaLabel}</A>
          </div>
          <button className="-mr-2 p-2 lg:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} size={28} stroke={2} /></button>
        </div>
        {open && (
          <nav aria-label="Mobile" className="container-x max-h-[82vh] overflow-y-auto pb-8 lg:hidden">
            {nav.header.filter((i) => i.mobile !== false).map((i) => (
              <div key={i.id} className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <Link to={i.url} className="block flex-1 py-4 font-display text-lg font-semibold">{i.label}</Link>
                  {!!i.children?.length && <button aria-expanded={exp === i.id} aria-label={`${i.label} submenu`} className="p-3 text-teal" onClick={() => setExp(exp === i.id ? null : (i.id ?? null))}><Icon name="chevron" className={exp === i.id ? 'rotate-180' : ''} /></button>}
                </div>
                {exp === i.id && <ul className="pb-3 pl-3">{i.children!.map((k) => <li key={k.url}><A to={k.url} className="block py-2.5 text-white/75">{k.label}</A></li>)}</ul>}
              </div>))}
            <div className="mt-6 grid gap-3"><A to={ctaUrl} className="btn-amber w-full">{ctaLabel}</A><Link to="/contact" className="btn-ghost w-full">Request a quote</Link></div>
          </nav>)}
      </header>
      <main id="main"><Outlet /></main>
      <footer className="chart-grid bg-navy-950 text-white/75">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-14 md:flex-row md:items-center">
            <p className="font-display text-3xl font-bold leading-tight text-white md:max-w-xl md:text-4xl">Have a business problem? Let’s see what software can do about it.</p>
            <div className="flex flex-wrap gap-3"><A to={ctaUrl} className="btn-amber">{ctaLabel}</A><Link to="/contact" className="btn-ghost">Request a quote</Link></div>
          </div>
          <div className="grid gap-12 py-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3"><img src={logo} alt="" width={56} height={56} className="rounded-full ring-1 ring-white/20" /><span className="font-display text-xl font-extrabold text-white">{name}</span></div>
              <p className="mt-5 max-w-xs">{s.description || 'Business software, cloud and automation.'}</p>
              <p className="mt-3 font-arabic text-lg text-amber" lang="ar" dir="rtl">نبحر بأعمالك نحو آفاق رقمية جديدة</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {s.email && <li className="flex gap-2.5"><Icon name="mail" size={18} className="mt-0.5 text-teal" /><a className="hover:text-teal" href={`mailto:${s.email}`}>{s.email}</a></li>}
                {s.phone && <li className="flex gap-2.5"><Icon name="phone" size={18} className="mt-0.5 text-teal" /><a className="hover:text-teal" href={`tel:${s.phone}`}>{s.phone}</a></li>}
                {s.whatsapp && <li className="flex gap-2.5"><Icon name="phone" size={18} className="mt-0.5 text-teal" /><a className="hover:text-teal" href={`https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}`}>WhatsApp</a></li>}
                {s.address && <li className="flex gap-2.5"><Icon name="pin" size={18} className="mt-0.5 shrink-0 text-teal" />{s.address}</li>}
              </ul>
              {social.length > 0 && <p className="mt-5 flex flex-wrap gap-2">{social.map((k) => <a key={k} href={s[k]} rel="noopener noreferrer" className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm capitalize hover:border-teal hover:text-teal">{k === 'x' ? 'X' : k}</a>)}</p>}
            </div>
            <FooterGroup className="md:col-span-2" title="Quick links" items={nav.footer_quick} />
            <FooterGroup className="md:col-span-4" title="Our services" items={nav.footer_services} cols />
            <FooterGroup className="md:col-span-2" title="Explore" items={nav.footer_explore} />
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-sm">
            <span>{s.copyright || `© ${new Date().getFullYear()} ${name}. All rights reserved.`}{s.footer_note && <span className="ml-3 text-white/50">{s.footer_note}</span>}</span>
            <span className="flex gap-5">{legal.map(([l, u]) => <a key={l} href={u} className="hover:text-teal">{l}</a>)}</span>
          </div>
        </div>
      </footer>
    </>
  )
}
function FooterGroup({ title, items, className = '', cols = false }: { title: string; items: NavItem[]; className?: string; cols?: boolean }) {
  if (!items.length) return <div className={className} />
  return (
    <div className={className}>
      <h2 className="font-display text-base font-bold text-white">{title}</h2>
      <ul className={`mt-4 gap-x-8 space-y-2.5 text-sm ${cols ? 'sm:columns-1 xl:columns-1' : ''}`}>{items.map((i) => <li key={i.url + i.label}><A to={i.url} className="transition-colors hover:text-teal">{i.label}</A></li>)}</ul>
    </div>
  )
}
