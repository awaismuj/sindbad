import { Link } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { DashboardPreview } from '../../components/DashboardPreview'
import { Badge } from '../../components/ui'
import { Section, Faqs, CtaBand } from '../../components/bits'
import { ClientShowcase } from '../../components/ClientShowcase'

const steps = [
  ['Understand your workflow', 'We listen to how orders, stock, staff and reports work in your business today.'],
  ['Configure or build', 'We set up a ready-made product, or build the missing parts you need.'],
  ['Launch with your team', 'Setup, data import and training so your staff can use it from day one.'],
  ['Support and improve', 'Ongoing support, plus new features as your business grows.'],
]
const benefits = [
  ['Less repeated work', 'Replace re-typing and paper records with workflows that run themselves.'],
  ['One place for everything', 'Sales, stock and customers live in a single system instead of several files.'],
  ['Reports you can trust', 'See what sold, what is running low and what needs attention.'],
  ['Room to grow', 'Add branches, users and modules without starting over.'],
]
const Arrow = () => <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" /></svg>

export default function Home() {
  const { data: s } = useApi<{ settings: any }>('/api/settings')
  const { data: ind } = useApi<{ items: any[] }>('/api/industries')
  const { data: prod } = useApi<{ items: any[] }>('/api/products')
  const { data: svc } = useApi<{ items: any[] }>('/api/services')
  const { data: faq } = useApi<{ items: any[] }>('/api/faqs')
  const set = s?.settings ?? {}
  const featured = prod?.items.filter((p) => p.featured) ?? []
  return (
    <>
      <Seo description={set.seo_description || set.hero_text} title={set.seo_title} />
      <section className="hero" aria-label="Introduction">
        <div className="hero__copy">
          <div className="hero__reveal max-w-xl">
            <h1 className="text-4xl font-bold leading-[1.08] sm:text-5xl xl:text-[3.6rem]">{set.hero_title || 'Smart software for every business.'}</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-ink/75 sm:text-xl">
              {set.hero_text || 'Manage operations, automate repetitive work and grow with practical software built around the way you run your business.'}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/solutions" className="btn-primary !px-6 !py-3.5 text-base">Explore solutions <Arrow /></Link>
              <Link to="/demo" className="btn-outline !px-6 !py-3.5 text-base">Book a free demo</Link>
            </div>
            <div className="mt-12 flex items-center gap-4 border-t border-sea-100 pt-6">
              <img src={set.logo_url || '/brand/logo.png'} alt="" width={44} height={44} className="rounded-full" />
              <div>
                <p className="font-display text-sm font-semibold text-navy-900">{set.tagline || 'We sail your business toward new digital horizons'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="hero__blue">
          <svg className="absolute inset-y-0 left-0 hidden h-full w-14 lg:block" viewBox="0 0 56 800" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H18C58 130 -8 270 22 400S56 650 18 800H0Z" fill="#fff" /></svg>
          <svg className="absolute inset-x-0 top-0 h-7 w-full lg:hidden" viewBox="0 0 800 28" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H800V10C660 32 540 -2 400 12S130 30 0 10Z" fill="#fff" /></svg>
          <div className="hero__grid" aria-hidden="true" />
          <div className="hero__reveal relative w-full" style={{ animationDelay: '120ms' }}><DashboardPreview /></div>
        </div>
      </section>

      <ClientShowcase />

      <Section title="Solutions for the way your industry works" intro="Pick your industry to see the problems we solve and the features available.">
        {ind?.items.length ? (
          <div className="grid gap-px overflow-hidden rounded-2xl border border-sea-100 bg-sea-100 sm:grid-cols-2 lg:grid-cols-3">
            {ind.items.map((i) => (
              <Link key={i.id} to={`/solutions/${i.slug}`} className="group flex flex-col bg-white p-7 transition-colors hover:bg-sea-50">
                <h3 className="text-lg font-semibold">{i.name}</h3>
                <p className="mt-2 flex-1 text-ink/70">{i.headline}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-sea-700 transition-transform group-hover:translate-x-1">See the solution <Arrow /></span>
              </Link>
            ))}
          </div>
        ) : <p className="text-ink/60">Industry solutions will appear here once published in the admin panel.</p>}
      </Section>

      {featured.length > 0 && (
        <Section title="Featured products" tone="white">
          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((p) => (
              <Link key={p.id} to={`/products/${p.slug}`} className="card group p-7 transition hover:-translate-y-0.5 hover:border-sea-500">
                <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-semibold">{p.name}</h3><Badge value={p.status} /></div>
                <p className="mt-3 text-ink/75">{p.short}</p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="How we work with you" tone={featured.length ? 'light' : 'white'}>
        <ol className="relative grid gap-8 md:grid-cols-4">
          <span className="absolute left-0 right-0 top-[19px] hidden h-px bg-sea-200 md:block" aria-hidden="true" />
          {steps.map(([t, d], i) => (
            <li key={t} className="relative">
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-sea-600 font-display text-sm font-semibold text-white ring-8 ring-white">{i + 1}</span>
              <h3 className="mt-5 text-lg font-semibold">{t}</h3><p className="mt-2 text-ink/70">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="What changes when your tools work together" tone="dark">
        <div className="grid gap-x-12 gap-y-9 md:grid-cols-2">
          {benefits.map(([t, d]) => (
            <div key={t} className="border-l-2 border-teal pl-5"><h3 className="text-xl font-semibold !text-white">{t}</h3><p className="mt-2 text-white/80">{d}</p></div>
          ))}
        </div>
      </Section>

      <Section title="Business automation and custom development" intro="If a ready-made product does not fit, we build around your process.">
        <ul className="grid gap-x-10 md:grid-cols-2">
          {svc?.items.slice(0, 6).map((x) => (
            <li key={x.id} className="border-b border-sea-100">
              <Link to={`/services/${x.slug}`} className="group flex items-center justify-between gap-4 py-4 text-lg font-semibold text-navy-900 transition-colors hover:text-sea-700">
                {x.name}<span className="text-sea-500 transition-transform group-hover:translate-x-1"><Arrow /></span>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/services" className="btn-outline mt-9">See all services</Link>
      </Section>

      {faq?.items.length ? <Section title="Frequently asked questions" tone="white"><Faqs items={faq.items} /></Section> : null}
      <CtaBand />
    </>
  )
}
