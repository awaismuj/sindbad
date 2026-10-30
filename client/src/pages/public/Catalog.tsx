import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { Badge } from '../../components/ui'
import { Checks, CtaBand, Faqs, PageHead, Section, State } from '../../components/bits'
import { LeadForm } from '../../components/LeadForm'
import NotFound from './NotFound'

export function Solutions() {
  const { data, loading, error } = useApi<{ items: any[] }>('/api/industries')
  return (
    <>
      <Seo title="Industry solutions" description="Software solutions for restaurants, pharmacies, retail, warehouses and more." />
      <PageHead title="Solutions by industry" intro="Each solution is built around the daily workflow of that business type." />
      <Section>
        <State loading={loading} error={error} empty={!data?.items.length} emptyText="No industries published yet." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((i) => (
            <Link key={i.id} to={`/solutions/${i.slug}`} className="card p-6 transition hover:-translate-y-0.5 hover:border-sea-500">
              <h2 className="text-lg font-bold">{i.name}</h2><p className="mt-2 text-ink/75">{i.headline}</p>
            </Link>
          ))}
        </div>
      </Section>
      <CtaBand title="Do not see your industry?" text="We build custom business systems too." />
    </>
  )
}

export function IndustryDetail() {
  const { slug } = useParams()
  const { data, loading, error } = useApi<{ item: any }>(`/api/industries/${slug}`)
  if (loading || error) return error ? <NotFound /> : <State loading error={null} empty={false} emptyText="" />
  const i = data!.item
  return (
    <>
      <Seo title={i.seo_title || i.name} description={i.seo_description || i.headline} />
      <PageHead title={i.name} intro={i.headline} />
      <Section>
        <p className="max-w-3xl text-lg">{i.description}</p>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          <div><h2 className="text-xl font-bold">Common problems</h2><div className="mt-3"><Checks items={i.problems} /></div></div>
          <div><h2 className="text-xl font-bold">How the software helps</h2><div className="mt-3"><Checks items={i.features} /></div></div>
          <div><h2 className="text-xl font-bold">Benefits</h2><div className="mt-3"><Checks items={i.benefits} /></div></div>
        </div>
        <div className="mt-10 flex gap-3">
          <Link to={`/demo?interest=${encodeURIComponent(i.name)}`} className="btn-primary">Request a demo</Link>
          <Link to="/contact" className="btn-outline">Get a custom solution</Link>
        </div>
      </Section>
      {i.faqs?.length > 0 && <Section title="Questions about this solution" tone="white"><Faqs items={i.faqs} /></Section>}
      <CtaBand />
    </>
  )
}

export function Products() {
  const { data, loading, error } = useApi<{ items: any[] }>('/api/products')
  return (
    <>
      <Seo title="Products" description="Ready-made business software from Sindbad Solution." />
      <PageHead title="Products" intro="Ready-made software for common business types. Status shows what you can use today." />
      <Section>
        <State loading={loading} error={error} empty={!data?.items.length} emptyText="No products published yet." />
        <div className="grid gap-6 md:grid-cols-2">
          {data?.items.map((p) => (
            <Link key={p.id} to={`/products/${p.slug}`} className="card p-7 transition hover:-translate-y-0.5 hover:border-sea-500">
              <div className="flex items-start justify-between gap-3"><h2 className="text-xl font-bold">{p.name}</h2><Badge value={p.status} /></div>
              <p className="mt-1 text-sm text-ink/60">{p.category}</p><p className="mt-3 text-ink/80">{p.short}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  )
}

export function ProductDetail() {
  const { slug } = useParams()
  const { data, loading, error } = useApi<{ item: any }>(`/api/products/${slug}`)
  const { data: plans } = useApi<{ items: any[] }>('/api/plans')
  if (loading || error) return error ? <NotFound /> : <State loading error={null} empty={false} emptyText="" />
  const p = data!.item
  const mine = plans?.items.filter((x) => x.product_slug === p.slug) ?? []
  return (
    <>
      <Seo title={p.seo_title || p.name} description={p.seo_description || p.short} />
      <PageHead title={p.name} intro={p.short} />
      <Section>
        <div className="mb-6 flex items-center gap-3"><Badge value={p.status} />{p.category && <span className="text-ink/60">{p.category}</span>}</div>
        {p.image && <img src={p.image} alt={`${p.name} preview`} loading="lazy" className="mb-8 w-full max-w-3xl rounded-xl" />}
        <p className="max-w-3xl whitespace-pre-line text-lg">{p.description}</p>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div><h2 className="text-xl font-bold">Features</h2><div className="mt-3"><Checks items={p.features} /></div></div>
          <div><h2 className="text-xl font-bold">Benefits</h2><div className="mt-3"><Checks items={p.benefits} /></div></div>
        </div>
      </Section>
      <Section title="Plans" tone="white">
        {mine.length ? <PlanGrid plans={mine} /> : <p className="text-lg">Contact us for pricing. {p.pricing_model && <span className="text-ink/60">({p.pricing_model})</span>}</p>}
      </Section>
      {p.faqs?.length > 0 && <Section title="Frequently asked questions"><Faqs items={p.faqs} /></Section>}
      <Section title={p.status === 'available' || p.demo ? 'Request a demo' : 'Talk to our team'} tone="white">
        <LeadForm kind="demos" defaultInterest={p.name} />
      </Section>
    </>
  )
}

export const money = (n: number, cur = 'USD') => new Intl.NumberFormat('en', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n)
const INTERVAL: Record<string, string> = { one_time: 'one-time', monthly: 'per month', annual: 'per year', custom: '' }

export function PlanGrid({ plans }: { plans: any[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((pl) => (
        <div key={pl.id} className="flex flex-col card p-7">
          <h3 className="text-xl font-bold">{pl.name}</h3>
          <p className="mt-3 font-display text-3xl font-bold text-navy-900">
            {pl.contact_sales || pl.price == null ? 'Contact us for pricing' : <>{money(pl.price, pl.currency || 'USD')} <span className="text-base font-normal text-ink/60">{INTERVAL[pl.interval] ?? ''}</span></>}
          </p>
          {pl.setup_fee > 0 && <p className="mt-1 text-sm text-ink/60">Setup fee: {money(pl.setup_fee, pl.currency || 'USD')}</p>}
          <div className="mt-5 flex-1"><Checks items={pl.features} /></div>
          {pl.optional_features?.length > 0 && <p className="mt-4 text-sm text-ink/70">Optional add-ons: {pl.optional_features.join(', ')}</p>}
          <Link to={`/contact?interest=${encodeURIComponent(pl.name)}`} className="btn-primary mt-6">{pl.contact_sales || pl.price == null ? 'Talk to sales' : 'Request a quote'}</Link>
        </div>
      ))}
    </div>
  )
}

export function Services() {
  const { data, loading, error } = useApi<{ items: any[] }>('/api/services')
  const { data: settings } = useApi<{ settings: any }>('/api/settings')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const items = (data?.items ?? []).filter((s) => {
    const matchesQuery = `${s.name} ${s.short ?? ''} ${s.category ?? ''}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (!category || s.category === category)
  })
  const categories = [...new Set((data?.items ?? []).map((s) => s.category).filter(Boolean))] as string[]
  const groupedItems = items.reduce<Record<string, any[]>>((groups, service) => {
    const name = service.category || 'More services'
    if (!groups[name]) groups[name] = []
    groups[name].push(service)
    return groups
  }, {})
  return (
    <>
      <Seo title="Services" description="Explore Sindbad Solution services and contact us to discuss your requirements." />
      <PageHead title="Services" intro={settings?.settings?.service_intro_message || 'Explore our service catalog. Contact us to discuss your requirements.'} />
      <Section>
        <State loading={loading} error={error} empty={!data?.items.length} emptyText="No services published yet." />
        {!!data?.items.length && <div className="mb-8 flex flex-wrap gap-3">
          <label className="sr-only" htmlFor="service-search">Search services</label>
          <input id="service-search" className="field max-w-sm" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services" />
          <label className="sr-only" htmlFor="service-category">Filter by category</label>
          <select id="service-category" className="field max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>}
        {Object.keys(groupedItems).length ? Object.entries(groupedItems).map(([group, groupServices]) => (
          <section key={group} className="mb-12 last:mb-0">
            <h2 className="mb-5 text-2xl font-bold">{group}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupServices.map((s) => (
                <Link id={s.slug} key={s.id} to={`/services/${s.slug}`} className="group overflow-hidden card transition transition hover:-translate-y-0.5 hover:border-sea-500">
                  {s.image && <img src={s.image} alt="" loading="lazy" className="h-48 w-full object-cover" />}
                  <div className="p-6">
                    <h3 className="text-xl font-bold group-hover:text-sea-700">{s.name}</h3>
                    <p className="mt-3 line-clamp-3 text-ink/75">{s.short || s.description || settings?.settings?.service_intro_message || 'Contact us to discuss your requirements.'}</p>
                    {s.featured && <span className="mt-3 inline-block rounded-full bg-amber/30 px-3 py-1 text-xs font-semibold">Featured</span>}
                    <span className="mt-4 block font-semibold text-sea-700">Learn more →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )) : data?.items.length ? <p className="rounded-xl bg-white p-6 text-ink/75">No services match these filters.</p> : null}
      </Section>
      <CtaBand title="Need a service tailored to your business?" text="Contact us to discuss your requirements." />
    </>
  )
}

function ServiceItems({ title, items, ordered = false }: { title: string; items?: string[]; ordered?: boolean }) {
  if (!items?.length) return null
  const List = ordered ? 'ol' : 'ul'
  return <section className="mt-12">
    <h2 className="text-2xl font-bold">{title}</h2>
    <List className={ordered ? 'mt-4 list-decimal space-y-2 pl-6' : 'mt-4 space-y-2'}>
      {items.map((item, index) => <li key={`${item}-${index}`} className="text-ink/80">{item}</li>)}
    </List>
  </section>
}

export function ServiceDetail() {
  const { slug } = useParams()
  const [search] = useSearchParams()
  const previewId = search.get('preview')
  const path = previewId ? `/api/admin/services/${encodeURIComponent(previewId)}` : `/api/services/${encodeURIComponent(slug ?? '')}`
  const { data, loading, error } = useApi<{ item: any }>(path)
  const { data: settings } = useApi<{ settings: any }>('/api/settings')
  const { data: services } = useApi<{ items: any[] }>('/api/services')
  const { data: products } = useApi<{ items: any[] }>('/api/products')
  const { data: portfolio } = useApi<{ items: any[] }>('/api/portfolio')
  if (loading) return <State loading error={null} empty={false} emptyText="" />
  if (error || !data?.item) return <NotFound />
  const s = data.item
  const fallback = settings?.settings?.service_intro_message || 'Service details are being prepared. Contact us to discuss your requirements.'
  const serviceLinks = (services?.items ?? []).filter((item) => s.related_services?.includes(item.slug))
  const productLinks = (products?.items ?? []).filter((item) => s.related_products?.includes(item.slug))
  const caseStudies = (portfolio?.items ?? []).filter((item) => s.case_studies?.includes(item.slug))
  return (
    <>
      <Seo title={s.seo_title || s.name} description={s.seo_description || s.short || fallback} image={s.og_image} />
      {previewId && <div role="status" className="bg-amber px-4 py-2 text-center font-semibold text-navy-950">Draft preview — only administrators with access can view this page.</div>}
      <div className="band-blue">
        {s.hero_image && <img src={s.hero_image} alt="" className="max-h-[28rem] w-full object-cover" />}
        <div className="container-x py-14">
          {s.category && <p className="font-semibold text-amber">{s.category}</p>}
          <h1 className="mt-2 text-4xl font-bold !text-white md:text-5xl">{s.hero_heading || s.name}</h1>
          <p className="mt-4 max-w-3xl whitespace-pre-line text-lg text-white/80">{s.hero_subheading || s.short || fallback}</p>
          <Link to={`/contact?interest=${encodeURIComponent(s.name)}`} className="btn-amber mt-7">Contact Us to Discuss Your Requirements</Link>
        </div>
      </div>
      <Section>
        <article className="max-w-4xl">
          {s.image && <img src={s.image} alt={`${s.name}`} loading="lazy" className="mb-8 max-h-[30rem] rounded-xl object-cover" />}
          <p className="whitespace-pre-line text-lg leading-relaxed">{s.description || fallback}</p>
          <ServiceItems title="Problems we can discuss" items={s.problems} />
          <ServiceItems title="What we offer" items={s.offers} />
          <ServiceItems title="Features and capabilities" items={s.features} />
          <ServiceItems title="Benefits" items={s.benefits} />
          <ServiceItems title="Industries served" items={s.industries} />
          <ServiceItems title="Technologies and tools" items={s.technologies} />
          <ServiceItems title="Delivery process" items={s.process} ordered />
          <ServiceItems title="Project scope and deliverables" items={s.deliverables} />
          <ServiceItems title="Engagement models" items={s.engagement_models} />
        </article>
      </Section>
      {s.faqs?.length > 0 && <Section title="Frequently asked questions" tone="white"><Faqs items={s.faqs} /></Section>}
      {caseStudies.length > 0 && <Section title="Related projects" tone="white"><div className="grid gap-5 md:grid-cols-2">
        {caseStudies.map((item) => <article key={item.id} className="rounded-xl border border-navy-900/10 p-6"><h3 className="text-xl font-bold">{item.name}</h3><p className="mt-2">{item.description}</p></article>)}
      </div></Section>}
      {(serviceLinks.length > 0 || productLinks.length > 0) && <Section title="Related services and products">
        <div className="flex flex-wrap gap-3">
          {serviceLinks.map((item) => <Link key={item.id} className="btn-outline" to={`/services/${item.slug}`}>{item.name}</Link>)}
          {productLinks.map((item) => <Link key={item.id} className="btn-outline" to={`/products/${item.slug}`}>{item.name}</Link>)}
        </div>
      </Section>}
      <CtaBand title={s.cta_heading || `Discuss ${s.name} with us`} text={s.cta_description || 'Contact us to discuss your requirements.'} />
    </>
  )
}
