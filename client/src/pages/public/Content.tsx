import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { LeadForm } from '../../components/LeadForm'
import { CtaBand, Faqs, PageHead, Section, State } from '../../components/bits'
import { PlanGrid } from './Catalog'
import NotFound from './NotFound'
import { Html } from '../../components/Html'
import { Icon } from '../../components/Icon'

export function Pricing() {
  const { data, loading, error } = useApi<{ items: any[] }>('/api/plans')
  const { data: faq } = useApi<{ items: any[] }>('/api/faqs')
  const pf = faq?.items.filter((f) => f.page === 'pricing') ?? []
  return (
    <>
      <Seo title="Pricing" description="Flexible pricing: one-time purchase, subscriptions, setup and custom quotations." />
      <PageHead title="Pricing" intro="One-time purchase, monthly or annual subscription, plus setup and custom work. Prices are set by our team." />
      <Section>
        <State loading={loading} error={error} empty={!data?.items.length} emptyText="Contact us for pricing. We will recommend a plan after learning about your business." />
        {data?.items.length ? <PlanGrid plans={data.items} /> : null}
      </Section>
      {pf.length > 0 && <Section title="Pricing questions" tone="white"><Faqs items={pf} /></Section>}
      <CtaBand title="Need a custom quotation?" />
    </>
  )
}

export function Portfolio() {
  const { data, loading, error } = useApi<{ items: any[] }>('/api/portfolio')
  return (
    <>
      <Seo title="Portfolio" description="Projects delivered by Sindbad Solution." />
      <PageHead title="Portfolio" intro="Projects we have delivered." />
      <Section>
        <State loading={loading} error={error} empty={!data?.items.length} emptyText="Our portfolio is being prepared. Case studies will appear here once projects are published." />
        <div className="grid gap-6 md:grid-cols-2">
          {data?.items.map((p) => (
            <article key={p.id} className="card overflow-hidden">
              {p.image && <img src={p.image} alt={`${p.name} screenshot`} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
              <div className="p-7">
                <p className="text-sm font-semibold text-teal-700">{p.industry}</p><h2 className="mt-1 text-2xl font-bold">{p.name}</h2>
                <Html html={p.description} className="mt-3 !text-base" />
                {p.challenges && <p className="mt-4"><b>Challenge: </b>{p.challenges}</p>}
                {p.solution && <p className="mt-2"><b>Solution: </b>{p.solution}</p>}
                {p.outcomes && <p className="mt-2"><b>Outcomes: </b>{p.outcomes}</p>}
                {p.technologies?.length > 0 && <ul className="mt-4 flex flex-wrap gap-2">{p.technologies.map((t: string) => <li key={t} className="chip">{t}</li>)}</ul>}
                {p.url && <a href={p.url} rel="noopener noreferrer" className="btn-outline mt-5">Visit project</a>}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

export function Blog() {
  const [q, setQ] = useState(''); const [query, setQuery] = useState(''); const [cat, setCat] = useState('')
  const { data, loading, error } = useApi<{ items: any[] }>(`/api/posts?q=${encodeURIComponent(query)}${cat ? `&category=${encodeURIComponent(cat)}` : ''}`)
  const { data: allPosts } = useApi<{ items: any[] }>('/api/posts')
  const cats = Array.from(new Set((allPosts?.items ?? []).map((p) => p.category).filter(Boolean))) as string[]
  const [lead, ...rest] = data?.items ?? []
  return (
    <>
      <Seo title="Blog" description="Articles and resources on business software and automation." />
      <PageHead title="Blog and resources">
        <form role="search" onSubmit={(e) => { e.preventDefault(); setQuery(q) }} className="flex max-w-lg gap-2">
          <label htmlFor="s" className="sr-only">Search articles</label>
          <input id="s" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles" className="field" />
          <button className="btn-primary">Search</button>
        </form>
      </PageHead>
      <Section>
        {cats.length > 0 && <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">{['', ...cats].map((c) => <button key={c || 'all'} aria-pressed={cat === c} onClick={() => setCat(c)} className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${cat === c ? 'bg-navy-900 text-white' : 'bg-navy-900/[.06] text-navy-800 hover:bg-navy-900/10'}`}>{c || 'All'}</button>)}</div>}
        <State loading={loading} error={error} empty={!data?.items.length} emptyText={query || cat ? 'No articles match your search.' : 'No articles published yet.'} />
        {lead && (
          <Link to={`/blog/${lead.slug}`} className="card mb-6 grid overflow-hidden md:grid-cols-2">
            {lead.image ? <img src={lead.image} alt="" className="h-full min-h-[14rem] w-full object-cover" /> : <div className="chart-grid min-h-[14rem] bg-navy-900" aria-hidden />}
            <div className="flex flex-col justify-center p-8 md:p-10">{lead.category && <p className="text-sm font-semibold text-teal-700">{lead.category}</p>}
              <h2 className="mt-2 text-3xl font-bold">{lead.title}</h2><p className="mt-3 text-ink/75">{lead.excerpt}</p>
              <p className="mt-4 text-sm text-ink/55">{[lead.author, fmt(lead.published_at)].filter(Boolean).join(', ')}</p></div>
          </Link>)}
        <div className="grid gap-6 md:grid-cols-3">
          {rest.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="card overflow-hidden">
              {p.image && <img src={p.image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />}
              <div className="p-6">{p.category && <p className="text-sm font-semibold text-teal-700">{p.category}</p>}<h2 className="mt-1 text-xl font-bold">{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-ink/70">{p.excerpt}</p><p className="mt-3 text-sm text-ink/55">{fmt(p.published_at)}</p></div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const { data, loading, error } = useApi<{ item: any }>(`/api/posts/${slug}`)
  if (loading || error) return error ? <NotFound /> : <State loading error={null} empty={false} emptyText="" />
  const p = data!.item
  const ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.excerpt || undefined, image: p.image ? new URL(p.image, window.location.origin).href : undefined,
    datePublished: p.published_at || undefined, author: p.author ? { '@type': 'Person', name: p.author } : undefined }
  return (
    <>
      <Seo title={p.seo_title || p.title} description={p.seo_description || p.excerpt} image={p.og_image || p.image} jsonLd={ld} type="article" />
      <PageHead title={p.title} intro={[p.author, p.category, fmt(p.published_at)].filter(Boolean).join(', ')} crumbs={[{ to: '/blog', label: 'Blog' }, { label: p.category || 'Article' }]} />
      <article className="container-x max-w-3xl py-14 md:py-20">
        {p.image && <img src={p.image} alt="" className="mb-10 w-full rounded-2xl" />}
        <Html html={p.content} />
        {p.tags?.length > 0 && <ul className="mt-10 flex flex-wrap gap-2">{p.tags.map((t: string) => <li key={t} className="chip">{t}</li>)}</ul>}
        <Link to="/blog" className="btn-outline mt-10">Back to the blog</Link>
      </article>
    </>
  )
}

export function Contact() {
  const [sp] = useSearchParams()
  const { data } = useApi<{ settings: any }>('/api/settings')
  const s = data?.settings ?? {}
  const rows: [string, string, ReactNodeish][] = [
    ['mail', 'Email', s.email && <a className="text-teal-700 underline" href={`mailto:${s.email}`}>{s.email}</a>],
    ['phone', 'Phone', s.phone && <a className="text-teal-700 underline" href={`tel:${s.phone}`}>{s.phone}</a>],
    ['pin', 'Address', s.address], ['compass', 'Hours', s.hours],
  ]
  return (
    <>
      <Seo title="Contact" description="Talk to the Sindbad Solution team." />
      <PageHead title="Talk to our team" intro="Tell us what you need. We will reply by your preferred method." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-navy-900/10 md:p-8 lg:col-span-2"><LeadForm kind="leads" defaultInterest={sp.get('interest') ?? ''} /></div>
          <aside className="space-y-4 self-start rounded-3xl bg-navy-900 p-7 text-white">
            <h2 className="on-dark text-xl font-bold">Contact details</h2>
            {rows.filter((r) => r[2]).map(([ic, l, v]) => <p key={l} className="flex gap-3"><Icon name={ic} size={20} className="mt-0.5 shrink-0 text-teal" /><span><span className="block text-sm text-white/55">{l}</span>{v}</span></p>)}
            {s.whatsapp && <a className="btn-primary w-full" href={`https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}`}>Chat on WhatsApp</a>}
            {!rows.some((r) => r[2]) && !s.whatsapp && <p className="text-white/70">Use the form and we will get back to you.</p>}
          </aside>
        </div>
      </Section>
    </>
  )
}
type ReactNodeish = React.ReactNode

export function Demo() {
  const [sp] = useSearchParams()
  return (
    <>
      <Seo title="Request a demo" description="Book a free demo of Sindbad Solution software." />
      <PageHead title="Request a demo" intro="No account needed. Tell us about your business and we will arrange a walkthrough." />
      <Section><div className="rounded-3xl bg-white p-6 ring-1 ring-navy-900/10 md:p-8"><LeadForm kind="demos" defaultInterest={sp.get('interest') ?? ''} /></div></Section>
    </>
  )
}
