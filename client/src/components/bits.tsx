import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Empty, ErrorBox, Spinner } from './ui'

export const Section = ({ title, intro, children, tone = 'light' }: { title?: string; intro?: string; children: ReactNode; tone?: 'light' | 'white' | 'dark' }) => (
  <section className={tone === 'dark' ? 'band-blue' : tone === 'white' ? 'bg-cream' : 'bg-white'}>
    <div className="container-x py-16 md:py-20">
      {title && <h2 className={`text-3xl font-bold md:text-4xl ${tone === 'dark' ? '!text-white' : ''}`}>{title}</h2>}
      {intro && <p className="mt-3 max-w-2xl text-lg opacity-80">{intro}</p>}
      <div className={title ? 'mt-10' : ''}>{children}</div>
    </div>
  </section>
)

export function PageHead({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="band-blue relative">
      <div className="container-x py-14 md:py-16">
        <h1 className="max-w-3xl text-4xl font-bold !text-white md:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-white/80">{intro}</p>}
      </div>
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="block h-6 w-full md:h-8" aria-hidden><path d="M0 22C200 -6 360 40 600 20S1000 -4 1200 22V40H0Z" fill="#fff" /></svg>
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
    <div className="divide-y divide-navy-900/10 rounded-2xl border border-navy-900/10 bg-white shadow-soft">
      {items.map((f, i) => (
        <details key={i} className="group p-5">
          <summary className="cursor-pointer font-display font-semibold text-navy-900">{f.q ?? f.question}</summary>
          <p className="mt-3 text-ink/80">{f.a ?? f.answer}</p>
        </details>
      ))}
    </div>
  )
}

export const Checks = ({ items }: { items?: string[] }) => (
  <ul className="space-y-2">{items?.map((t) => (
    <li key={t} className="flex gap-2"><svg className="mt-1 h-4 w-4 shrink-0 text-sea-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path d="M7.7 14.3 3.4 10l1.4-1.4 2.9 2.9 7.5-7.5 1.4 1.4z" /></svg>{t}</li>
  ))}</ul>
)

export const CtaBand = ({ title = 'Tell us how your business runs today', text = 'We will show you what can be automated, and what it would take.' }) => (
  <section className="band-blue">
    <div className="container-x flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center">
      <div><h2 className="text-3xl font-bold !text-white">{title}</h2><p className="mt-2 text-white/75">{text}</p></div>
      <div className="flex gap-3"><Link to="/demo" className="btn-amber">Book a free demo</Link><Link to="/contact" className="btn-ghost">Request a quote</Link></div>
    </div>
  </section>
)
