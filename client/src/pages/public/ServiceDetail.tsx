import { ReactNode, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { Html } from '../../components/Html'
import { Faqs, PageHead, State } from '../../components/bits'
import { Badge } from '../../components/ui'
import { Icon, IconTile } from '../../components/Icon'
import NotFound from './NotFound'

const ALL = ['overview', 'problems', 'offerings', 'features', 'benefits', 'industries', 'technologies', 'process', 'deliverables', 'engagement', 'faqs', 'case_studies', 'related']
const TITLES: Record<string, string> = { overview: 'Overview', problems: 'Problems we address', offerings: 'What we offer', features: 'Features and capabilities', benefits: 'Benefits', industries: 'Industries we serve',
  technologies: 'Technologies and tools', process: 'How we deliver', deliverables: 'Scope and deliverables', engagement: 'Engagement models', faqs: 'Frequently asked questions', case_studies: 'Related projects', related: 'Related services and products' }

const Tick = () => <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal/20 text-teal-700"><Icon name="check" size={13} stroke={2.6} /></span>
const Cards = ({ items }: { items: string[] }) => <ul className="grid gap-3 md:grid-cols-2">{items.map((t) => <li key={t} className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-navy-900/10"><Tick />{t}</li>)}</ul>
const Chips = ({ items }: { items: string[] }) => <ul className="flex flex-wrap gap-2">{items.map((t) => <li key={t} className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white">{t}</li>)}</ul>
const Plain = ({ items }: { items: string[] }) => <ul className="space-y-3">{items.map((t) => <li key={t} className="flex gap-3 border-b border-navy-900/10 pb-3"><Tick />{t}</li>)}</ul>

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
  const q = `?interest=${encodeURIComponent(s.name)}`
  const body = (key: string): ReactNode => {
    switch (key) {
      case 'overview': return s.content ? <Html html={s.content} /> : null
      case 'problems': case 'deliverables': case 'engagement': return s[key]?.length ? <Plain items={s[key]} /> : null
      case 'offerings': case 'features': case 'benefits': return s[key]?.length ? <Cards items={s[key]} /> : null
      case 'industries': case 'technologies': return s[key]?.length ? <Chips items={s[key]} /> : null
      case 'process': return s.process?.length ? (
        <ol className="relative grid gap-5 md:grid-cols-2">{s.process.map((p: any, i: number) => (
          <li key={i} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-navy-900/10">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-900 font-display text-sm font-bold text-teal">{i + 1}</span>
            <div><h3 className="text-lg font-bold">{p.title}</h3><p className="mt-1 text-ink/75">{p.text}</p></div></li>))}</ol>) : null
      case 'faqs': return s.faqs?.length ? <Faqs items={s.faqs} /> : null
      case 'case_studies': return cases.length ? <div className="grid gap-4 md:grid-cols-2">{cases.map((c) => <Link key={c.id} to="/portfolio" className="card p-6"><h3 className="text-lg font-bold">{c.name}</h3><p className="text-sm text-ink/70">{c.industry}</p></Link>)}</div> : null
      case 'related': return relS.length || relP.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {relS.map((x) => <Link key={x.id} to={`/services/${x.slug}`} className="card flex items-center gap-4 p-5"><IconTile name={x.icon} /><span className="font-display text-lg font-bold">{x.name}</span></Link>)}
          {relP.map((x) => <Link key={x.id} to={`/products/${x.slug}`} className="card flex items-center gap-4 p-5"><IconTile name="boxes" tone="amber" /><span className="font-display text-lg font-bold">{x.name}</span></Link>)}</div>) : null
      default: return null
    }
  }
  const blocks = order.map((k) => ({ k, node: body(k) })).filter((b) => b.node)
  const ld = s.status === 'published' ? { '@context': 'https://schema.org', '@type': 'Service', name: s.name, description: s.short || undefined, serviceType: s.category || undefined,
    provider: { '@type': 'Organization', name: st?.settings?.company_name || 'Sindbad Solution', url: window.location.origin }, url: window.location.origin + '/services/' + s.slug } : undefined
  return (
    <>
      {!preview && <Seo title={s.seo_title || s.name} description={s.seo_description || s.short} image={s.og_image || s.hero_image} jsonLd={ld} />}
      <section className="chart-grid relative overflow-hidden bg-navy-900 text-white">
        <div className="container-x grid items-center gap-10 py-14 md:py-20 lg:grid-cols-12">
          <div className={s.hero_image ? 'lg:col-span-7' : 'lg:col-span-9'}>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/60"><Link className="hover:text-teal" to="/services">Services</Link>{s.category && <><span aria-hidden>/</span><span className="text-white/80">{s.category}</span></>}</nav>
            <div className="mt-6 flex items-center gap-4"><IconTile name={s.icon} tone="dark" />{s.featured && <Badge value="featured" />}</div>
            <h1 className="on-dark mt-5 text-4xl font-extrabold leading-[1.05] md:text-6xl">{s.hero_heading || s.name}</h1>
            {(s.hero_subheading || s.short) && <p className="mt-5 max-w-2xl text-lg text-white/75 md:text-xl">{s.hero_subheading || s.short}</p>}
            <div className="mt-8 flex flex-wrap gap-3"><Link to={`/contact${q}`} className="btn-primary">Request a quote</Link><Link to={`/demo${q}`} className="btn-ghost">Get a demo</Link></div>
          </div>
          {s.hero_image && <div className="lg:col-span-5"><img src={s.hero_image} alt="" className="w-full rounded-3xl object-cover shadow-glow ring-1 ring-white/15" /></div>}
        </div>
      </section>
      <div className="container-x py-14 md:py-20">
        {!hasBody && (
          <div className="max-w-3xl rounded-3xl bg-white p-8 ring-1 ring-navy-900/10"><p className="text-lg">{intro}</p>
            <Link to={`/contact${q}`} className="btn-dark mt-6">Contact us to discuss your requirements</Link></div>)}
        {blocks.length > 0 && (
          <div className="grid gap-12 lg:grid-cols-12">
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-28 space-y-5">
                <nav aria-label="On this page"><p className="mb-3 font-display text-sm font-bold text-navy-900">On this page</p>
                  <ul className="space-y-1 border-l border-navy-900/15">{blocks.map((b) => <li key={b.k}><a href={`#sec-${b.k}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-ink/70 hover:border-teal hover:text-navy-900">{TITLES[b.k]}</a></li>)}</ul></nav>
                <div className="rounded-2xl bg-navy-900 p-5 text-white"><p className="font-display font-bold">Talk to us about {s.name}</p><Link to={`/contact${q}`} className="btn-amber mt-4 w-full !py-2.5">Request a quote</Link></div>
              </div>
            </aside>
            <div className="space-y-14 lg:col-span-9">
              {blocks.map((b) => <section key={b.k} id={`sec-${b.k}`} className="scroll-mt-28"><h2 className="mb-6 text-3xl font-bold md:text-4xl">{TITLES[b.k]}</h2>{b.node}</section>)}
            </div>
          </div>)}
      </div>
      <section className="chart-grid bg-navy-900"><div className="container-x flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center">
        <div><h2 className="on-dark text-3xl font-bold md:text-4xl">{s.cta_heading || `Talk to us about ${s.name}`}</h2><p className="mt-3 max-w-xl text-white/75">{s.cta_text || 'Tell us what you need and we will reply with the next step.'}</p></div>
        <div className="flex flex-wrap gap-3"><Link to={`/contact${q}`} className="btn-amber shrink-0">Contact us</Link><Link to={`/demo${q}`} className="btn-ghost shrink-0">Get a demo</Link></div></div></section>
    </>
  )
}

export default function ServiceDetail() {
  const { slug } = useParams()
  const { data, loading, error } = useApi<{ item: any }>(`/api/services/${slug}`)
  if (loading) return <State loading error={null} empty={false} emptyText="" />
  if (error || !data) return <NotFound />
  return <ServiceView item={data.item} />
}

export function Services() {
  const { data, loading, error } = useApi<{ items: any[] }>('/api/services')
  const [q, setQ] = useState(''); const [cat, setCat] = useState('')
  const all = data?.items ?? []
  const cats = Array.from(new Set(all.map((x) => x.category || 'Other')))
  const items = all.filter((x) => (!cat || (x.category || 'Other') === cat) && (!q || `${x.name} ${x.short} ${x.category}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  const groups = cats.filter((c) => items.some((x) => (x.category || 'Other') === c))
  useEffect(() => { if (data && window.location.hash) document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView() }, [data])
  return (
    <>
      <Seo title="Services" description="Cloud, software development, AI, automation, marketing and more from Sindbad Solution." />
      <PageHead title="Services" intro="From a single integration to a complete business platform.">
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="svc-search">Search services</label>
          <input id="svc-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services" className="field max-w-xs" />
          {cats.length > 1 && <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {['', ...cats].map((c) => <button key={c || 'all'} aria-pressed={cat === c} onClick={() => setCat(c)} className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${cat === c ? 'bg-teal text-navy-950' : 'bg-white/10 text-white hover:bg-white/20'}`}>{c || 'All'}</button>)}
          </div>}
        </div>
      </PageHead>
      <div className="container-x py-14 md:py-20">
        <State loading={loading} error={error} empty={!items.length} emptyText={q || cat ? 'No services match your search.' : 'No services published yet.'} />
        {groups.map((g) => (
          <section key={g} id={encodeURIComponent(g)} className="mb-14 scroll-mt-28">
            <h2 className="mb-6 flex items-center gap-4 text-2xl font-bold md:text-3xl">{g}<span className="h-px flex-1 bg-navy-900/15" /></h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.filter((x) => (x.category || 'Other') === g).map((x) => (
                <Link key={x.id} to={`/services/${x.slug}`} className="card group flex flex-col p-7">
                  <div className="flex items-start justify-between gap-3"><IconTile name={x.icon} />{x.featured && <Badge value="featured" />}</div>
                  <h3 className="mt-5 text-xl font-bold">{x.name}</h3>
                  <p className="mt-2 flex-1 text-ink/70">{x.short || 'Contact us to discuss your requirements.'}</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-semibold text-teal-700">Learn more<Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-1" /></span>
                </Link>))}
            </div>
          </section>))}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-navy-900 p-8 text-white"><h2 className="on-dark text-2xl font-bold">Request a quote</h2><p className="mt-2 text-white/75">Tell us what you want to build or improve.</p><Link to="/contact" className="btn-amber mt-6">Request a quote</Link></div>
          <div className="rounded-3xl bg-amber p-8"><h2 className="text-2xl font-bold !text-navy-950">Custom requirements?</h2><p className="mt-2 text-navy-950/80">If it is not on the list, ask. We scope custom work.</p><Link to="/contact?interest=Custom%20requirements" className="btn-dark mt-6">Talk to our team</Link></div>
        </div>
      </div>
    </>
  )
}
