import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Empty, ErrorBox, Spinner } from './ui'
import { Icon } from './Icon'

export const Section = ({ title, intro, children, tone = 'light', id }: { title?: string; intro?: string; children: ReactNode; tone?: 'light' | 'white' | 'dark'; id?: string }) => (
  <section id={id} className={tone === 'dark' ? 'chart-grid bg-navy-900 text-white' : tone === 'white' ? 'bg-white' : ''}>
    <div className="container-x py-16 md:py-20">
      {title && <h2 className={`h-section max-w-3xl ${tone === 'dark' ? 'on-dark' : ''}`}>{title}</h2>}
      {intro && <p className="mt-4 max-w-2xl text-lg opacity-80">{intro}</p>}
      <div className={title ? 'mt-10' : ''}>{children}</div>
    </div>
  </section>
)

/** Dark page header with chart-paper grid, optional breadcrumb trail and actions. */
export function PageHead({ title, intro, crumbs, children }: { title: string; intro?: string; crumbs?: { to?: string; label: string }[]; children?: ReactNode }) {
  return (
    <div className="chart-grid bg-navy-900 text-white">
      <div className="container-x py-14 md:py-20">
        {crumbs && <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-white/60">
          {crumbs.map((c, i) => <span key={i} className="flex items-center gap-2">{i > 0 && <span aria-hidden>/</span>}{c.to ? <Link to={c.to} className="hover:text-teal">{c.label}</Link> : <span className="text-white/80">{c.label}</span>}</span>)}
        </nav>}
        <h1 className="on-dark max-w-4xl text-4xl font-extrabold leading-[1.05] md:text-6xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-white/75 md:text-xl">{intro}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  )
}

/** Handles loading / error / empty for a list fetched from the API */
export function State({ loading, error, empty, emptyText }: { loading: boolean; error: string | null; empty: boolean; emptyText: string }) {
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />
  if (empty) return <Empty>{emptyText}</Empty>
  return null
}

export function Faqs({ items }: { items: { q?: string; a?: string; question?: string; answer?: string }[] }) {
  if (!items?.length) return null
  return (
    <div className="divide-y divide-navy-900/10 overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/10">
      {items.map((f, i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-lg font-semibold text-navy-900 hover:text-teal-700 [&::-webkit-details-marker]:hidden">
            {f.q ?? f.question}<Icon name="chevron" className="shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <p className="px-5 pb-5 text-ink/80">{f.a ?? f.answer}</p>
        </details>
      ))}
    </div>
  )
}

export const Checks = ({ items }: { items?: string[] }) => (
  <ul className="space-y-2.5">{items?.map((t) => (
    <li key={t} className="flex gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal/20 text-teal-700"><Icon name="check" size={13} stroke={2.6} /></span>{t}</li>
  ))}</ul>
)

export const CtaBand = ({ title = 'Tell us how your business runs today', text = 'We will show you what can be improved, and what it would take.' }) => (
  <section className="chart-grid bg-navy-900">
    <div className="container-x flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center">
      <div><h2 className="on-dark max-w-xl text-3xl font-bold md:text-4xl">{title}</h2><p className="mt-3 max-w-xl text-white/75">{text}</p></div>
      <div className="flex flex-wrap gap-3"><Link to="/demo" className="btn-amber">Get a demo</Link><Link to="/contact" className="btn-ghost">Request a quote</Link></div>
    </div>
  </section>
)
