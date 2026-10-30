import { Link } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { DashboardPreview } from '../../components/DashboardPreview'
import { Badge, Wave } from '../../components/ui'
import { Section, Faqs, CtaBand } from '../../components/bits'

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
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="container-x grid items-center gap-12 pb-24 pt-16 lg:grid-cols-2 lg:pt-24">
          <div>
            <p className="font-arabic text-2xl text-amber" lang="ar" dir="rtl">نبحر بأعمالك نحو آفاق رقمية جديدة</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight !text-white md:text-6xl">{set.hero_title || 'Smart software for every business.'}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">{set.hero_text || 'Manage operations, automate repetitive work and grow with practical software built around the way you run your business.'}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/solutions" className="btn-primary">Explore solutions</Link>
              <Link to="/demo" className="btn-ghost">Book a free demo</Link>
            </div>
          </div>
          <DashboardPreview />
        </div>
        <Wave className="absolute bottom-0 drift" fill="#F4F1EA" />
      </section>

      <Section title="Solutions for the way your industry works" intro="Pick your industry to see the problems we solve and the features available.">
        {ind?.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ind.items.map((i) => (
              <Link key={i.id} to={`/solutions/${i.slug}`} className="rounded-xl border border-navy-900/10 bg-white p-6 transition-colors hover:border-teal">
                <h3 className="text-lg font-bold">{i.name}</h3><p className="mt-2 text-ink/75">{i.headline}</p>
              </Link>
            ))}
          </div>
        ) : <p className="text-ink/60">Industry solutions will appear here once published in the admin panel.</p>}
      </Section>

      {featured.length > 0 && (
        <Section title="Featured products" tone="white">
          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((p) => (
              <Link key={p.id} to={`/products/${p.slug}`} className="rounded-xl bg-cream p-7 hover:ring-2 hover:ring-teal">
                <div className="flex items-center justify-between"><h3 className="text-xl font-bold">{p.name}</h3><Badge value={p.status} /></div>
                <p className="mt-3 text-ink/80">{p.short}</p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="How we work with you">
        <ol className="grid gap-6 md:grid-cols-4">
          {steps.map(([t, d], i) => (
            <li key={t} className="border-t-4 border-teal pt-4"><span className="font-display text-sm font-bold text-teal-700">Step {i + 1}</span>
              <h3 className="mt-1 text-lg font-bold">{t}</h3><p className="mt-2 text-ink/75">{d}</p></li>
          ))}
        </ol>
      </Section>

      <Section title="What changes when your tools work together" tone="dark">
        <div className="grid gap-8 md:grid-cols-2">
          {benefits.map(([t, d]) => <div key={t}><h3 className="text-xl font-bold !text-amber">{t}</h3><p className="mt-2 text-white/80">{d}</p></div>)}
        </div>
      </Section>

      <Section title="Business automation and custom development" intro="If a ready-made product does not fit, we build around your process.">
        <div className="grid gap-3 sm:grid-cols-2">
          {svc?.items.slice(0, 6).map((x) => <Link key={x.id} to={`/services#${x.slug}`} className="rounded-lg bg-white px-5 py-4 font-semibold hover:text-teal-700">{x.name}</Link>)}
        </div>
        <Link to="/services" className="btn-outline mt-8">See all services</Link>
      </Section>

      {faq?.items.length ? <Section title="Frequently asked questions" tone="white"><Faqs items={faq.items} /></Section> : null}
      <CtaBand />
    </>
  )
}
