import { Link } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { Constellation } from '../../components/Constellation'
import { Badge, Wave } from '../../components/ui'
import { Faqs } from '../../components/bits'
import { Icon, IconTile } from '../../components/Icon'

const More = ({ to, children, dark = false }: { to: string; children: string; dark?: boolean }) =>
  <Link to={to} className={dark ? 'btn-ghost' : 'btn-outline'}>{children}<Icon name="arrow" size={18} /></Link>

export default function Home() {
  const { data: s } = useApi<{ settings: any }>('/api/settings')
  const { data: page } = useApi<{ item: any }>('/api/pages/home')
  const { data: ind } = useApi<{ items: any[] }>('/api/industries')
  const { data: prod } = useApi<{ items: any[] }>('/api/products')
  const { data: svc } = useApi<{ items: any[] }>('/api/services')
  const { data: faq } = useApi<{ items: any[] }>('/api/faqs')
  const { data: work } = useApi<{ items: any[] }>('/api/portfolio')
  const { data: posts } = useApi<{ items: any[] }>('/api/posts')
  const set = s?.settings ?? {}; const services = svc?.items ?? []
  const lead = [...services].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  const featured = prod?.items.filter((p) => p.featured) ?? []
  const cats = Array.from(new Set(services.map((x) => x.category).filter(Boolean))) as string[]
  const cards: any[] = page?.item?.cards ?? []
  const homeFaqs = faq?.items.filter((f) => f.page === 'home') ?? []
  const latest = posts?.items.slice(0, 3) ?? []
  const projects = work?.items.slice(0, 2) ?? []
  const org = { '@context': 'https://schema.org', '@type': 'Organization', name: set.company_name || 'Sindbad Solution', url: window.location.origin,
    logo: new URL(set.logo || '/brand/logo.png', window.location.origin).href, description: set.description || undefined,
    sameAs: (['linkedin', 'facebook', 'instagram', 'x'] as const).map((k) => set[k]).filter(Boolean), email: set.email || undefined, telephone: set.phone || undefined }
  return (
    <>
      <Seo title={set.seo_title} description={set.seo_description || set.hero_text} image={set.og_image} jsonLd={org} />
      <section className="chart-grid relative overflow-hidden bg-navy-900 text-white">
        <div className="container-x relative grid items-center gap-10 pb-32 pt-14 lg:grid-cols-12 lg:pt-20">
          <div className="lg:col-span-6">
            <p className="font-arabic text-2xl text-amber" lang="ar" dir="rtl">نبحر بأعمالك نحو آفاق رقمية جديدة</p>
            <h1 className="on-dark mt-5 text-[2.6rem] font-extrabold leading-[1.03] sm:text-6xl xl:text-[4.5rem]">{set.hero_title || 'Software that sails your business forward.'}</h1>
            <p className="mt-6 max-w-xl text-lg text-white/75 md:text-xl">{set.hero_text || set.tagline || 'We sail your business toward new digital horizons.'}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to={set.cta_url || '/demo'} className="btn-amber">{set.cta_label || 'Get a demo'}</Link>
              <Link to="/services" className="btn-ghost">Explore our services<Icon name="arrow" size={18} /></Link>
            </div>
            {cats.length > 0 && <ul className="mt-10 flex flex-wrap gap-2" aria-label="What we do">
              {cats.map((c) => <li key={c}><Link to={`/services#${encodeURIComponent(c)}`} className="inline-block rounded-lg border border-white/15 px-3 py-1.5 text-sm font-semibold text-white/80 transition-colors hover:border-teal hover:text-teal">{c}</Link></li>)}
            </ul>}
          </div>
          <div className="lg:col-span-6"><Constellation items={services} /></div>
        </div>
        <Wave className="swell absolute bottom-0" />
      </section>

      {lead.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5"><h2 className="h-section max-w-2xl">Services built around the way you run your business</h2><More to="/services">All services</More></div>
          <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {lead.slice(0, 6).map((x, i) => (
              <li key={x.id} className={i === 0 ? 'lg:col-span-2' : ''}>
                <Link to={`/services/${x.slug}`} className={`group flex h-full flex-col justify-between gap-8 rounded-2xl p-7 ring-1 transition-shadow hover:shadow-lift ${i === 0 ? 'bg-navy-900 text-white ring-navy-900' : 'bg-white ring-navy-900/10 hover:ring-teal/70'}`}>
                  <div className="flex items-start justify-between gap-4"><IconTile name={x.icon} tone={i === 0 ? 'dark' : 'teal'} />{x.featured && <Badge value="featured" />}</div>
                  <div>
                    <p className={`text-sm font-semibold ${i === 0 ? 'text-teal' : 'text-teal-700'}`}>{x.category}</p>
                    <h3 className={`mt-1 text-2xl font-bold ${i === 0 ? 'on-dark' : ''}`}>{x.name}</h3>
                    <p className={`mt-2 ${i === 0 ? 'max-w-xl text-white/70' : 'text-ink/70'}`}>{x.short || 'Contact us to discuss your requirements.'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-2 font-semibold ${i === 0 ? 'text-amber' : 'text-navy-900'}`}>Learn more<Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-1" /></span>
                </Link>
              </li>))}
          </ul>
        </section>)}

      {ind && ind.items.length > 0 && (
        <section className="bg-white">
          <div className="container-x py-16 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-5"><h2 className="h-section max-w-2xl">Solutions for the way your industry works</h2><More to="/solutions">All solutions</More></div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-navy-900/10 ring-1 ring-navy-900/10 sm:grid-cols-2 lg:grid-cols-4">
              {ind.items.slice(0, 8).map((i) => (
                <Link key={i.id} to={`/solutions/${i.slug}`} className="group flex min-h-[12rem] flex-col justify-between bg-white p-6 transition-colors hover:bg-teal-50">
                  <IconTile name={i.icon} tone="amber" />
                  <div><h3 className="text-xl font-bold">{i.name}</h3><p className="mt-1.5 text-sm text-ink/65">{i.headline}</p></div>
                </Link>))}
            </div>
          </div>
        </section>)}

      {featured.length > 0 && (
        <section className="chart-grid bg-navy-900 text-white">
          <div className="container-x py-16 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-5"><h2 className="h-section on-dark max-w-2xl">Products you can start with</h2><More to="/products" dark>All products</More></div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {featured.map((p) => (
                <Link key={p.id} to={`/products/${p.slug}`} className="group rounded-2xl bg-white/[.06] p-8 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:ring-teal">
                  <div className="flex items-center justify-between gap-3"><h3 className="on-dark text-2xl font-bold">{p.name}</h3><Badge value={p.status} /></div>
                  <p className="mt-3 text-white/70">{p.short}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-semibold text-amber">View product<Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-1" /></span>
                </Link>))}
            </div>
          </div>
        </section>)}

      {cards.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <h2 className="h-section max-w-3xl">{page?.item?.intro || 'Why work with us'}</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {cards.map((c, i) => (<div key={i} className="border-t-2 border-amber pt-6">{c.image && <img src={c.image} alt="" loading="lazy" className="mb-5 aspect-[4/3] w-full rounded-2xl object-cover" />}
              <h3 className="text-xl font-bold">{c.title}</h3><p className="mt-2 text-ink/75">{c.text}</p></div>))}
          </div>
        </section>)}

      {projects.length > 0 && (
        <section className="bg-white"><div className="container-x py-16 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5"><h2 className="h-section">Recent work</h2><More to="/portfolio">Full portfolio</More></div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {projects.map((p) => (
              <Link key={p.id} to="/portfolio" className="card group overflow-hidden">
                {p.image && <img src={p.image} alt={`${p.name} screenshot`} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
                <div className="p-6"><p className="text-sm font-semibold text-teal-700">{p.industry}</p><h3 className="mt-1 text-2xl font-bold">{p.name}</h3></div>
              </Link>))}
          </div></div></section>)}

      {latest.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5"><h2 className="h-section">From the blog</h2><More to="/blog">All articles</More></div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {latest.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="card overflow-hidden">
                {p.image && <img src={p.image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />}
                <div className="p-6">{p.category && <p className="text-sm font-semibold text-teal-700">{p.category}</p>}<h3 className="mt-1 text-xl font-bold">{p.title}</h3><p className="mt-2 line-clamp-3 text-ink/70">{p.excerpt}</p></div>
              </Link>))}
          </div>
        </section>)}

      {homeFaqs.length > 0 && <section className="container-x max-w-4xl py-16 md:py-24"><h2 className="h-section mb-10">Frequently asked questions</h2><Faqs items={homeFaqs} /></section>}
    </>
  )
}
