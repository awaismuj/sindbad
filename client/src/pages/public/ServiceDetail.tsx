import { Link, useParams } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { Html } from '../../components/Html'
import { Faqs, State } from '../../components/bits'
import { Badge } from '../../components/ui'
import NotFound from './NotFound'

const ALL = ['overview', 'problems', 'offerings', 'features', 'benefits', 'industries', 'technologies', 'process', 'deliverables', 'engagement', 'faqs', 'case_studies', 'related']
const TITLES: Record<string, string> = { problems: 'Problems we address', offerings: 'What we offer', features: 'Features and capabilities', benefits: 'Benefits', industries: 'Industries we serve',
  technologies: 'Technologies and tools', process: 'How we deliver', deliverables: 'Scope and deliverables', engagement: 'Engagement models', faqs: 'Frequently asked questions', case_studies: 'Related projects' }

const List = ({ items, tone = 'plain' }: { items: string[]; tone?: 'plain' | 'chips' }) => tone === 'chips'
  ? <ul className="flex flex-wrap gap-2">{items.map((t) => <li key={t} className="rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white">{t}</li>)}</ul>
  : <ul className="grid gap-x-10 gap-y-3 md:grid-cols-2">{items.map((t) => (
    <li key={t} className="flex gap-3 border-b border-navy-900/10 pb-3"><svg className="mt-1.5 h-3 w-3 shrink-0 text-teal-600" viewBox="0 0 12 12" aria-hidden><circle cx="6" cy="6" r="6" fill="currentColor" /></svg>{t}</li>))}</ul>

/** Reusable service page. Every block is optional and hidden when empty; nothing is generated. */
export function ServiceView({ item: s, preview = false }: { item: any; preview?: boolean }) {
  const { data: all } = useApi<{ items: any[] }>('/api/services')
  const { data: prods } = useApi<{ items: any[] }>('/api/products')
  const { data: work } = useApi<{ items: any[] }>('/api/portfolio')
  const { data: st } = useApi<{ settings: any }>('/api/settings')
  const order: string[] = s.sections?.length ? s.sections : ALL
  const relS = (all?.items ?? []).filter((x) => s.related_services?.includes(x.slug) && x.slug !== s.slug)
  const relP = (prods?.items ?? []).filter((x) => s.related_products?.includes(x.slug))
  const cases = (work?.items ?? []).filter((x) => s.case_studies?.includes(x.slug))
  const hasBody = !!(s.content || s.problems?.length || s.offerings?.length || s.features?.length || s.benefits?.length || s.process?.length || s.deliverables?.length)
  const intro = st?.settings?.service_intro || 'We are preparing the full details of this service. Tell us what you need and our team will respond.'
  const block = (key: string) => {
    switch (key) {
      case 'overview': return s.content ? <Html html={s.content} className="max-w-3xl" /> : null
      case 'problems': case 'offerings': case 'features': case 'benefits': case 'deliverables': case 'engagement':
        return s[key]?.length ? <Sec title={TITLES[key]}><List items={s[key]} /></Sec> : null
      case 'industries': case 'technologies': return s[key]?.length ? <Sec title={TITLES[key]}><List items={s[key]} tone="chips" /></Sec> : null
      case 'process': return s.process?.length ? (
        <Sec title={TITLES.process}><ol className="grid gap-6 md:grid-cols-4">{s.process.map((p: any, i: number) => (
          <li key={i} className="relative border-t-4 border-teal pt-4"><span className="font-display text-sm font-bold text-teal-700">Step {i + 1}</span>
            <h3 className="mt-1 text-lg font-bold">{p.title}</h3><p className="mt-2 text-ink/75">{p.text}</p></li>))}</ol></Sec>) : null
      case 'faqs': return s.faqs?.length ? <Sec title={TITLES.faqs}><Faqs items={s.faqs} /></Sec> : null
      case 'case_studies': return cases.length ? (
        <Sec title={TITLES.case_studies}><div className="grid gap-5 md:grid-cols-2">{cases.map((c) => <Link key={c.id} to="/portfolio" className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/10 hover:ring-teal"><h3 className="text-lg font-bold">{c.name}</h3><p className="text-sm text-ink/70">{c.industry}</p></Link>)}</div></Sec>) : null
      case 'related': return relS.length || relP.length ? (
        <Sec title="Related services and products"><div className="grid gap-4 md:grid-cols-3">
          {relS.map((x) => <Link key={x.id} to={`/services/${x.slug}`} className="rounded-2xl bg-white p-5 font-display font-bold ring-1 ring-navy-900/10 hover:ring-teal">{x.name}</Link>)}
          {relP.map((x) => <Link key={x.id} to={`/products/${x.slug}`} className="rounded-2xl bg-white p-5 font-display font-bold ring-1 ring-navy-900/10 hover:ring-teal">{x.name}</Link>)}</div></Sec>) : null
      default: return null
    }
  }
  return (
    <>
      {!preview && <Seo title={s.seo_title || s.name} description={s.seo_description || s.short} image={s.og_image || s.hero_image} />}
      <section className="chart-grid relative overflow-hidden bg-navy-900 text-white">
        <div className="container-x grid items-center gap-10 py-16 md:py-24 lg:grid-cols-12">
          <div className={s.hero_image ? 'lg:col-span-7' : 'lg:col-span-9'}>
            <nav aria-label="Breadcrumb" className="text-sm text-white/60"><Link className="hover:text-teal" to="/services">Services</Link>{s.category && <> / {s.category}</>}</nav>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight !text-white md:text-6xl">{s.hero_heading || s.name}</h1>
            {(s.hero_subheading || s.short) && <p className="mt-5 max-w-2xl text-lg text-white/75 md:text-xl">{s.hero_subheading || s.short}</p>}
            <div className="mt-8 flex flex-wrap gap-3"><Link to={`/contact?interest=${encodeURIComponent(s.name)}`} className="btn-primary">Request a quote</Link><Link to={`/demo?interest=${encodeURIComponent(s.name)}`} className="btn-ghost">Book a demo</Link></div>
          </div>
          {s.hero_image && <div className="lg:col-span-5"><img src={s.hero_image} alt="" className="w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/15" /></div>}
        </div>
      </section>
      <div className="container-x space-y-14 py-16">
        {!hasBody && (
          <div className="max-w-3xl rounded-3xl bg-white p-8 ring-1 ring-navy-900/10"><p className="text-lg">{intro}</p>
            <Link to={`/contact?interest=${encodeURIComponent(s.name)}`} className="btn-dark mt-6">Contact us to discuss your requirements</Link></div>)}
        {order.map((k) => <div key={k}>{block(k)}</div>)}
      </div>
      <section className="bg-navy-900"><div className="container-x flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center">
        <div><h2 className="text-3xl font-extrabold !text-white md:text-4xl">{s.cta_heading || `Talk to us about ${s.name}`}</h2><p className="mt-2 max-w-xl text-white/75">{s.cta_text || 'Tell us what you need and we will reply with the next step.'}</p></div>
        <Link to={`/contact?interest=${encodeURIComponent(s.name)}`} className="btn-amber shrink-0">Contact us</Link></div></section>
    </>
  )
}
const Sec = ({ title, children }: { title: string; children: React.ReactNode }) => <section><h2 className="mb-6 text-3xl font-extrabold md:text-4xl">{title}</h2>{children}</section>

export default function ServiceDetail() {
  const { slug } = useParams()
  const { data, loading, error } = useApi<{ item: any }>(`/api/services/${slug}`)
  if (loading) return <State loading error={null} empty={false} emptyText="" />
  if (error || !data) return <NotFound />
  return <ServiceView item={data.item} />
}

export function Services() {
  const { data, loading, error } = useApi<{ items: any[] }>('/api/services')
  const [q, setQ] = useStateQ()
  const { data: cats } = useApi<{ items: any[] }>('/api/service_categories')
  const items = (data?.items ?? []).filter((x) => !q || `${x.name} ${x.short} ${x.category}`.toLowerCase().includes(q.toLowerCase()))
  const rank = (g: string) => { const i = (cats?.items ?? []).findIndex((c) => c.name === g); return i < 0 ? 999 : i }
  const groups = Array.from(new Set(items.map((x) => x.category || 'Other'))).sort((a, b) => rank(a) - rank(b))
  return (
    <>
      <Seo title="Services" description="Cloud, software development, AI, automation, marketing and more from Sindbad Solution." />
      <section className="chart-grid bg-navy-900 text-white"><div className="container-x py-16 md:py-24">
        <h1 className="max-w-3xl text-5xl font-extrabold !text-white md:text-6xl">Services</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/75">From a single integration to a complete business platform.</p>
        <label className="sr-only" htmlFor="svc-search">Search services</label>
        <input id="svc-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services" className="field mt-8 max-w-md" />
      </div></section>
      <div className="container-x py-14">
        <State loading={loading} error={error} empty={!items.length} emptyText={q ? 'No services match your search.' : 'No services published yet.'} />
        {groups.map((g) => (
          <section key={g} id={encodeURIComponent(g)} className="mb-14">
            <h2 className="mb-5 border-b border-navy-900/15 pb-3 text-2xl font-extrabold">{g}</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.filter((x) => (x.category || 'Other') === g).map((x) => (
                <Link key={x.id} to={`/services/${x.slug}`} className="group flex flex-col rounded-3xl bg-white p-7 ring-1 ring-navy-900/10 transition hover:-translate-y-1 hover:ring-teal">
                  <div className="flex items-start justify-between gap-3"><h3 className="text-xl font-bold">{x.name}</h3>{x.featured && <Badge value="featured" />}</div>
                  <p className="mt-3 flex-1 text-ink/75">{x.short || 'Contact us to discuss your requirements.'}</p>
                  <span className="mt-5 font-semibold text-teal-700 group-hover:underline">Learn more</span>
                </Link>))}
            </div>
          </section>))}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-navy-900 p-8 text-white"><h2 className="text-2xl font-bold !text-white">Request a quote</h2><p className="mt-2 text-white/75">Tell us what you want to build or improve.</p><Link to="/contact" className="btn-amber mt-5">Request a quote</Link></div>
          <div className="rounded-3xl bg-amber p-8"><h2 className="text-2xl font-bold">Custom requirements?</h2><p className="mt-2">If it is not on the list, ask. We scope custom work.</p><Link to="/contact?interest=Custom%20requirements" className="btn-dark mt-5">Talk to our team</Link></div>
        </div>
      </div>
    </>
  )
}
import { useState } from 'react'
function useStateQ() { return useState('') }
