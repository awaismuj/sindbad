import { Link } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { DashboardPreview } from '../../components/DashboardPreview'
import { Badge, Wave } from '../../components/ui'
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
      <section className="home-hero relative isolate overflow-hidden text-white">
        <div className="home-hero__glow home-hero__glow--one" aria-hidden="true" />
        <div className="home-hero__glow home-hero__glow--two" aria-hidden="true" />
        <div className="home-hero__grid" aria-hidden="true" />
        <div className="container-x relative grid min-h-[620px] items-center gap-14 pb-24 pt-16 lg:min-h-[690px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-28 lg:pt-20">
          <div className="home-hero__copy max-w-2xl">
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold tracking-wide text-white/80 shadow-lg shadow-black/10 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_12px_rgba(46,196,182,0.9)]" />
              SOFTWARE · SYSTEMS · AUTOMATION
            </div>
            <h1 className="mt-6 max-w-[16ch] text-5xl font-extrabold leading-[1.04] tracking-[-0.055em] !text-white sm:text-6xl lg:text-6xl xl:text-[4.5rem] 2xl:text-[5rem]">
              {set.hero_title || <>Smart software <span className="home-hero__headline-accent">for every business.</span></>}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200/85 sm:text-xl">
              {set.hero_text || 'Manage operations, automate repetitive work and grow with practical software built around the way you run your business.'}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/solutions" className="home-hero__primary">Explore solutions <span aria-hidden="true">→</span></Link>
              <Link to="/demo" className="home-hero__secondary">Book a free demo</Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300/80">
              <span className="inline-flex items-center gap-2"><span className="text-teal">✓</span> Built around your workflow</span>
              <span className="inline-flex items-center gap-2"><span className="text-teal">✓</span> Practical business solutions</span>
            </div>
          </div>
          <div className="home-hero__visual relative mx-auto w-full max-w-[590px] lg:mx-0 lg:ml-auto">
            <div className="home-hero__orbit home-hero__orbit--outer" aria-hidden="true" />
            <div className="home-hero__orbit home-hero__orbit--inner" aria-hidden="true" />
            <div className="home-hero__preview-frame">
              <div className="home-hero__frame-top">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber" />
                  <span className="h-2.5 w-2.5 rounded-full bg-teal" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/70" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">Connected business tools</span>
                <span className="rounded-full border border-teal/20 bg-teal/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-teal">Concept</span>
              </div>
              <DashboardPreview />
            </div>
            <div className="home-hero__visual-caption"><span /> An illustration of connected business workflows</div>
          </div>
          <div className="home-hero__arabic-strip lg:col-span-2" lang="ar" dir="rtl">
            <span className="home-hero__arabic-ornament" aria-hidden="true">✦</span>
            <p>نبحر بأعمالك نحو آفاق رقمية جديدة</p>
            <span className="home-hero__arabic-ornament" aria-hidden="true">✦</span>
          </div>
        </div>
        <div className="home-hero__bottom-line" aria-hidden="true" />
        <Wave className="absolute bottom-0 z-10 h-8 sm:h-10" fill="#F4F1EA" />
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

      <ClientShowcase />

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
