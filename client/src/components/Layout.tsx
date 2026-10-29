import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApi } from '../lib/api'

const nav = [['Products', '/products'], ['Solutions', '/solutions'], ['Services', '/services'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']]

export function Layout() {
  const [open, setOpen] = useState(false)
  const { data } = useApi<{ settings: any }>('/api/settings')
  const s = data?.settings ?? {}
  useLocation()
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-amber focus:p-3">Skip to content</a>
      <header className="sticky top-0 z-40 bg-navy-900/95 text-white backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <img src="/brand/logo.png" alt="" width={40} height={40} className="rounded-full" />
            <span className="font-display text-lg font-bold">Sindbad <span className="text-amber">Solution</span></span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
            {nav.map(([l, to]) => <NavLink key={to} to={to} className={({ isActive }) => `text-sm font-semibold hover:text-teal ${isActive ? 'text-teal' : ''}`}>{l}</NavLink>)}
            <Link to="/demo" className="btn-amber !py-2">Get a demo</Link>
          </nav>
          <button className="lg:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
          </button>
        </div>
        {open && (
          <nav aria-label="Mobile" className="container-x flex flex-col gap-1 pb-4 lg:hidden">
            {nav.map(([l, to]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-white/10">{l}</Link>)}
            <Link to="/demo" onClick={() => setOpen(false)} className="btn-amber mt-2">Get a demo</Link>
          </nav>
        )}
      </header>
      <main id="main"><Outlet /></main>
      <footer className="bg-navy-950 text-white/80">
        <div className="container-x grid gap-10 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <img src="/brand/logo.png" alt="Sindbad Solution" width={72} height={72} className="rounded-full" />
            <p className="mt-4 max-w-sm">{s.description || 'Business software, POS and ERP systems and automation.'}</p>
            <p className="mt-2 font-arabic text-amber">نبحر بأعمالك نحو آفاق رقمية جديدة</p>
          </div>
          <div>
            <h3 className="font-display text-white">Explore</h3>
            <ul className="mt-3 space-y-2">{nav.map(([l, to]) => <li key={to}><Link className="hover:text-teal" to={to}>{l}</Link></li>)}
              <li><Link className="hover:text-teal" to="/portfolio">Portfolio</Link></li><li><Link className="hover:text-teal" to="/blog">Blog</Link></li></ul>
          </div>
          <div>
            <h3 className="font-display text-white">Contact</h3>
            <ul className="mt-3 space-y-2">
              {s.email && <li><a className="hover:text-teal" href={`mailto:${s.email}`}>{s.email}</a></li>}
              {s.phone && <li><a className="hover:text-teal" href={`tel:${s.phone}`}>{s.phone}</a></li>}
              {s.whatsapp && <li><a className="hover:text-teal" href={`https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}`}>WhatsApp</a></li>}
              {s.address && <li>{s.address}</li>}
              {!s.email && !s.phone && !s.address && <li><Link className="hover:text-teal" to="/contact">Send us a message</Link></li>}
              {['linkedin', 'facebook', 'instagram', 'x'].filter((k) => s[k]).map((k) => <li key={k}><a className="capitalize hover:text-teal" href={s[k]} rel="noopener noreferrer">{k === 'x' ? 'X' : k}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-sm">© {new Date().getFullYear()} {s.company_name || 'Sindbad Solution'}. All rights reserved.</div>
      </footer>
    </>
  )
}
