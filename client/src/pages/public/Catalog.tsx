import { Link, useParams } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { Badge } from '../../components/ui'
import { Checks, CtaBand, Faqs, PageHead, Section, State } from '../../components/bits'
import { LeadForm } from '../../components/LeadForm'
import { Html } from '../../components/Html'
import { Icon, IconTile } from '../../components/Icon'
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
            <Link key={i.id} to={`/solutions/${i.slug}`} className="card group flex flex-col p-7">
              <IconTile name={i.icon} tone="amber" />
              <h2 className="mt-5 text-xl font-bold">{i.name}</h2><p className="mt-2 flex-1 text-ink/70">{i.headline}</p>
              <span className="mt-5 inline-flex items-center gap-2 font-semibold text-teal-700">See the solution<Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-1" /></span>
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
  const { data: svc } = useApi<{ items: any[] }>('/api/services')
  const { data: prod } = useApi<{ items: any[] }>('/api/products')
  if (loading || error) return error ? <NotFound /> : <State loading error={null} empty={false} emptyText="" />
  const i = data!.item
  const relS = (svc?.items ?? []).filter((x) => i.related_services?.includes(x.slug)); const relP = (prod?.items ?? []).filter((x) => i.related_products?.includes(x.slug))
  return (
    <>
      <Seo title={i.seo_title || i.name} description={i.seo_description || i.headline} image={i.og_image || i.image} />
      <PageHead title={i.name} intro={i.headline} crumbs={[{ to: '/solutions', label: 'Solutions' }, { label: i.name }]}>
        <div className="flex flex-wrap gap-3"><Link to={`/demo?interest=${encodeURIComponent(i.name)}`} className="btn-primary">Request a demo</Link><Link to={`/contact?interest=${encodeURIComponent(i.name)}`} className="btn-ghost">Get a quotation</Link></div>
      </PageHead>
      <Section>
        {i.image && <img src={i.image} alt="" className="mb-10 w-full max-w-4xl rounded-3xl" />}
        <Html html={i.description} className="max-w-3xl" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {([['Common problems', i.problems], ['How the software helps', i.features], ['Benefits', i.benefits]] as [string, string[]][]).filter(([, l]) => l?.length).map(([t, l]) => (
            <div key={t} className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/10"><h2 className="mb-4 text-xl font-bold">{t}</h2><Checks items={l} /></div>))}
        </div>
        {(relS.length > 0 || relP.length > 0) && <div className="mt-12"><h2 className="mb-5 text-2xl font-bold">Related services and products</h2>
          <div className="grid gap-4 md:grid-cols-3">{relS.map((x) => <Link key={x.id} to={`/services/${x.slug}`} className="card flex items-center gap-3 p-5"><IconTile name={x.icon} /><b>{x.name}</b></Link>)}
            {relP.map((x) => <Link key={x.id} to={`/products/${x.slug}`} className="card flex items-center gap-3 p-5"><IconTile name="boxes" tone="amber" /><b>{x.name}</b></Link>)}</div></div>}
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
      <PageHead title="Products" intro="Ready-made software for common business types. The status tells you what you can use today." />
      <Section>
        <State loading={loading} error={error} empty={!data?.items.length} emptyText="No products published yet." />
        <div className="grid gap-6 md:grid-cols-2">
          {data?.items.map((p) => (
            <Link key={p.id} to={`/products/${p.slug}`} className="card group overflow-hidden">
              {p.image && <img src={p.image} alt="" loading="lazy" className="aspect-[16/8] w-full object-cover" />}
              <div className="p-7">
                <div className="flex items-start justify-between gap-3"><h2 className="text-2xl font-bold">{p.name}</h2><Badge value={p.status} /></div>
                {p.category && <p className="mt-1 text-sm font-semibold text-teal-700">{p.category}</p>}<p className="mt-3 text-ink/75">{p.short}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-navy-900">View product<Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-1" /></span>
              </div>
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
      <Seo title={p.seo_title || p.name} description={p.seo_description || p.short} image={p.og_image || p.image} />
      <PageHead title={p.name} intro={p.short} crumbs={[{ to: '/products', label: 'Products' }, { label: p.name }]}>
        <div className="flex flex-wrap items-center gap-3"><Badge value={p.status} />{p.category && <span className="text-white/70">{p.category}</span>}</div>
      </PageHead>
      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">{p.image && <img src={p.image} alt={`${p.name} preview`} loading="lazy" className="mb-8 w-full rounded-2xl ring-1 ring-navy-900/10" />}<Html html={p.description} /></div>
          <div className="space-y-6 lg:col-span-5">
            {p.features?.length > 0 && <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/10"><h2 className="mb-4 text-xl font-bold">Features</h2><Checks items={p.features} /></div>}
            {p.benefits?.length > 0 && <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/10"><h2 className="mb-4 text-xl font-bold">Benefits</h2><Checks items={p.benefits} /></div>}
          </div>
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
      {plans.map((pl, n) => (
        <div key={pl.id} className={`flex flex-col rounded-2xl p-7 ${n === 1 && plans.length === 3 ? 'bg-navy-900 text-white shadow-glow' : 'bg-white ring-1 ring-navy-900/10'}`}>
          <h3 className={`text-xl font-bold ${n === 1 && plans.length === 3 ? 'on-dark' : ''}`}>{pl.name}</h3>
          <p className="mt-4 font-display text-3xl font-bold">
            {pl.contact_sales || pl.price == null ? 'Contact us for pricing' : <>{money(pl.price, pl.currency || 'USD')} <span className="text-base font-normal opacity-60">{INTERVAL[pl.interval] ?? ''}</span></>}
          </p>
          {pl.setup_fee > 0 && <p className="mt-1 text-sm opacity-65">Setup fee: {money(pl.setup_fee, pl.currency || 'USD')}</p>}
          <div className="mt-6 flex-1"><Checks items={pl.features} /></div>
          {pl.optional_features?.length > 0 && <p className="mt-4 text-sm opacity-75">Optional add-ons: {pl.optional_features.join(', ')}</p>}
          <Link to={`/contact?interest=${encodeURIComponent(pl.name)}`} className={`mt-6 ${n === 1 && plans.length === 3 ? 'btn-amber' : 'btn-primary'}`}>{pl.contact_sales || pl.price == null ? 'Talk to sales' : 'Request a quote'}</Link>
        </div>
      ))}
    </div>
  )
}
