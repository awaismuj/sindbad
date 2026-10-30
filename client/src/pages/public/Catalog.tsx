import { Link, useParams } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { Badge } from '../../components/ui'
import { Checks, CtaBand, Faqs, PageHead, Section, State } from '../../components/bits'
import { LeadForm } from '../../components/LeadForm'
import { Html } from '../../components/Html'
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
            <Link key={i.id} to={`/solutions/${i.slug}`} className="rounded-xl border border-navy-900/10 bg-white p-6 hover:border-teal">
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
        <Html html={i.description} className="max-w-3xl" />
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
            <Link key={p.id} to={`/products/${p.slug}`} className="rounded-xl border border-navy-900/10 bg-white p-7 hover:border-teal">
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
        <Html html={p.description} className="max-w-3xl" />
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
        <div key={pl.id} className="flex flex-col rounded-xl border border-navy-900/10 bg-white p-7">
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
