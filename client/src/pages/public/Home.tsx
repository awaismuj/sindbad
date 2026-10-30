import { Link } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { HeroArabic, HeroScene } from '../../components/DashboardPreview'
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
        <div className="hero__blue">
          <div className="hero__grid" aria-hidden="true" />
          <svg className="absolute inset-x-0 bottom-[-1px] z-20 h-8 w-full md:h-12" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 24C200 -4 400 40 640 20S1040 0 1200 24V40H0Z" fill="#fff" /></svg>
          <div className="container-x hero__reveal relative z-10 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="order-2 lg:order-1"><HeroScene /></div>
            <div className="order-1 lg:order-2"><HeroArabic /></div>
          </div>
        </div>
        <div className="hero__copy">
          <div className="container-x hero__reveal grid items-center gap-8 lg:grid-cols-2 lg:gap-14" style={{ animationDelay: '120ms' }}>
            <h1 className="text-[2.4rem] font-semibold leading-[1.12] tracking-[-0.025em] sm:text-5xl xl:text-[3.5rem]">{set.hero_title || 'Smart software for every business.'}</h1>
            <div>
              <p className="max-w-lg text-lg leading-8 text-ink/70">
                {set.hero_text || 'Manage operations, automate repetitive work and grow with practical software built around the way you run your business.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/solutions" className="btn-primary !px-6 !py-3.5 text-base">Explore solutions <Arrow /></Link>
                <Link to="/demo" className="btn-outline !px-6 !py-3.5 text-base">Book a free demo</Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold text-navy-800">
                {['POS & business management', 'ERP systems', 'Business automation', 'AI & machine learning'].map((t) => (
                  <li key={t} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-teal/15 text-teal-700"><svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M7.7 14.3 3.4 10l1.4-1.4 2.9 2.9 7.5-7.5 1.4 1.4z" /></svg></span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
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
