import { Link } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { Constellation } from '../../components/Constellation'
import { Badge, Wave } from '../../components/ui'
import { Faqs } from '../../components/bits'

const Arrow = () => <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11m-4-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>

export default function Home() {
  const { data: s } = useApi<{ settings: any }>('/api/settings')
  const { data: page } = useApi<{ item: any }>('/api/pages/home')
  const { data: ind } = useApi<{ items: any[] }>('/api/industries')
  const { data: prod } = useApi<{ items: any[] }>('/api/products')
  const { data: svc } = useApi<{ items: any[] }>('/api/services')
  const { data: faq } = useApi<{ items: any[] }>('/api/faqs')
  const set = s?.settings ?? {}; const services = svc?.items ?? []
  const featured = prod?.items.filter((p) => p.featured) ?? []
  const cats = Array.from(new Set(services.map((x) => x.category).filter(Boolean))) as string[]
  const cards: any[] = page?.item?.cards ?? []
  const homeFaqs = faq?.items.filter((f) => f.page === 'home') ?? []
  return (
    <>
      <Seo title={set.seo_title} description={set.seo_description || set.hero_text} />
      <section className="chart-grid relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-teal/10 blur-3xl" aria-hidden />
        <div className="container-x relative grid items-center gap-8 pb-28 pt-16 lg:grid-cols-12 lg:pt-24">
          <div className="lg:col-span-6">
            <p className="font-arabic text-2xl text-amber" lang="ar" dir="rtl">نبحر بأعمالك نحو آفاق رقمية جديدة</p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] !text-white md:text-7xl">{set.hero_title || 'Software that sails your business forward.'}</h1>
            <p className="mt-6 max-w-xl text-lg text-white/75 md:text-xl">{set.hero_text || set.tagline || 'We sail your business toward new digital horizons.'}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/services" className="btn-primary">Explore our services</Link>
              <Link to="/demo" className="btn-ghost">Book a free demo</Link>
            </div>
          </div>
          <div className="lg:col-span-6"><Constellation items={services} /></div>
        </div>
        <Wave className="absolute bottom-0 drift" fill="rgb(var(--cream))" />
      </section>

      {cats.length > 0 && (
        <div className="container-x -mt-2 flex flex-wrap gap-2 py-8" aria-label="What we do">
          {cats.map((c) => <Link key={c} to={`/services#${encodeURIComponent(c)}`} className="rounded-full border border-navy-900/15 px-4 py-1.5 text-sm font-semibold text-navy-800 hover:bg-navy-900 hover:text-white">{c}</Link>)}
        </div>)}

      {services.length > 0 && (
        <section className="container-x py-16">
          <div className="flex flex-wrap items-end justify-between gap-4"><h2 className="max-w-xl text-4xl font-extrabold md:text-5xl">Services built around your business</h2>
            <Link to="/services" className="btn-outline">All services</Link></div>
          <ul className="mt-10 divide-y divide-navy-900/15 border-y border-navy-900/15">
            {services.slice(0, 6).map((x) => (
              <li key={x.id}><Link to={`/services/${x.slug}`} className="group grid items-center gap-2 py-6 md:grid-cols-12">
                <span className="text-sm font-semibold text-teal-700 md:col-span-3">{x.category}</span>
                <span className="font-display text-2xl font-bold text-navy-900 group-hover:text-teal-700 md:col-span-4">{x.name}</span>
                <span className="text-ink/70 md:col-span-4">{x.short || 'Contact us to discuss your requirements.'}</span>
                <span className="justify-self-end text-navy-900 transition-transform group-hover:translate-x-1 md:col-span-1"><Arrow /></span>
              </Link></li>))}
          </ul>
        </section>)}

      {ind && ind.items.length > 0 && (
        <section className="bg-navy-900 text-white">
          <div className="container-x py-20">
            <h2 className="max-w-2xl text-4xl font-extrabold !text-white md:text-5xl">Solutions for the way your industry works</h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ind.items.slice(0, 8).map((i, n) => (
                <Link key={i.id} to={`/solutions/${i.slug}`} className={`group flex min-h-[11rem] flex-col justify-between rounded-3xl p-6 transition-transform hover:-translate-y-1 ${n === 0 ? 'bg-teal text-navy-950 sm:col-span-2' : n % 3 === 1 ? 'bg-amber text-navy-950' : 'bg-white/8 ring-1 ring-white/15'}`}>
                  <h3 className={`text-xl font-bold ${n === 0 || n % 3 === 1 ? '!text-navy-950' : '!text-white'}`}>{i.name}</h3>
                  <p className="mt-6 text-sm opacity-80">{i.headline}</p>
                </Link>))}
            </div>
            <Link to="/solutions" className="btn-ghost mt-10">See all solutions</Link>
          </div>
        </section>)}

      {featured.length > 0 && (
        <section className="container-x py-20">
          <h2 className="text-4xl font-extrabold md:text-5xl">Products</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {featured.map((p) => (
              <Link key={p.id} to={`/products/${p.slug}`} className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/10 hover:ring-teal">
                <div className="flex items-center justify-between gap-3"><h3 className="text-2xl font-bold">{p.name}</h3><Badge value={p.status} /></div>
                <p className="mt-3 text-ink/75">{p.short}</p>
              </Link>))}
          </div>
        </section>)}

      {cards.length > 0 && (
        <section className="bg-white"><div className="container-x py-20">
          <h2 className="text-4xl font-extrabold md:text-5xl">{page?.item?.title && page.item.intro ? page.item.intro : 'Why work with us'}</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {cards.map((c, i) => (<div key={i} className="border-t-4 border-amber pt-5">{c.image && <img src={c.image} alt="" loading="lazy" className="mb-4 rounded-2xl" />}
              <h3 className="text-xl font-bold">{c.title}</h3><p className="mt-2 text-ink/75">{c.text}</p></div>))}
          </div></div></section>)}

      {homeFaqs.length > 0 && <section className="container-x py-20"><h2 className="mb-8 text-4xl font-extrabold">Frequently asked questions</h2><Faqs items={homeFaqs} /></section>}

      <section className="relative overflow-hidden bg-navy-900">
        <img src="/brand/logo.png" alt="" aria-hidden className="absolute -right-16 top-1/2 hidden h-[26rem] -translate-y-1/2 rounded-full opacity-10 md:block" />
        <div className="container-x relative py-20">
          <h2 className="max-w-2xl text-4xl font-extrabold !text-white md:text-5xl">Tell us where your business is heading</h2>
          <p className="mt-4 max-w-xl text-lg text-white/75">Share what you need. We will reply with the next step.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/demo" className="btn-amber">Book a free demo</Link><Link to="/contact" className="btn-ghost">Request a quote</Link></div>
        </div>
      </section>
    </>
  )
}
