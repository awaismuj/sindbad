import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { LeadForm } from '../../components/LeadForm'
import { CtaBand, Faqs, PageHead, Section, State } from '../../components/bits'
import { PlanGrid } from './Catalog'
import NotFound from './NotFound'

export function Pricing() {
  const { data, loading, error } = useApi<{ items: any[] }>('/api/plans')
  const { data: faq } = useApi<{ items: any[] }>('/api/faqs')
  return (
    <>
      <Seo title="Pricing" description="Flexible pricing: one-time purchase, subscriptions, setup and custom quotations." />
      <PageHead title="Pricing" intro="One-time purchase, monthly or annual subscription, plus setup and custom work. Prices are set by our team." />
      <Section>
        <State loading={loading} error={error} empty={!data?.items.length} emptyText="Contact us for pricing. We will recommend a plan after learning about your business." />
        {data?.items.length ? <PlanGrid plans={data.items} /> : null}
      </Section>
      {faq?.items.filter((f) => f.page === 'pricing').length ? <Section title="Pricing questions" tone="white"><Faqs items={faq.items.filter((f) => f.page === 'pricing')} /></Section> : null}
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
            <article key={p.id} className="rounded-xl border border-navy-900/10 bg-white p-7">
              {p.image && <img src={p.image} alt={`${p.name} screenshot`} loading="lazy" className="mb-4 rounded-lg" />}
              <h2 className="text-xl font-bold">{p.name}</h2><p className="text-sm text-ink/60">{p.industry}</p>
              <p className="mt-3">{p.description}</p>
              {p.challenges && <p className="mt-3"><b>Challenge: </b>{p.challenges}</p>}
              {p.solution && <p className="mt-2"><b>Solution: </b>{p.solution}</p>}
              {p.technologies?.length > 0 && <p className="mt-2 text-sm text-ink/70">{p.technologies.join(', ')}</p>}
              {p.outcomes && <p className="mt-2"><b>Outcomes: </b>{p.outcomes}</p>}
              {p.url && <a href={p.url} rel="noopener noreferrer" className="btn-outline mt-4">Visit project</a>}
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}

export function Blog() {
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const { data, loading, error } = useApi<{ items: any[] }>(`/api/posts?q=${encodeURIComponent(query)}`)
  return (
    <>
      <Seo title="Blog" description="Articles and resources on business software and automation." />
      <PageHead title="Blog and resources" />
      <Section>
        <form role="search" onSubmit={(e) => { e.preventDefault(); setQuery(q) }} className="mb-8 flex max-w-lg gap-2">
          <label htmlFor="s" className="sr-only">Search articles</label>
          <input id="s" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles" className="field" />
          <button className="btn-primary">Search</button>
        </form>
        <State loading={loading} error={error} empty={!data?.items.length} emptyText={query ? 'No articles match your search.' : 'No articles published yet.'} />
        <div className="grid gap-6 md:grid-cols-3">
          {data?.items.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="rounded-xl border border-navy-900/10 bg-white p-6 hover:border-teal">
              {p.image && <img src={p.image} alt="" loading="lazy" className="mb-3 rounded-lg" />}
              <h2 className="text-lg font-bold">{p.title}</h2>{p.category && <p className="text-sm text-teal-700">{p.category}</p>}
              <p className="mt-2 text-ink/75">{p.excerpt}</p>
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
  return (
    <>
      <Seo title={p.seo_title || p.title} description={p.seo_description || p.excerpt} />
      <PageHead title={p.title} />
      <article className="container-x max-w-3xl py-14">
        {p.image && <img src={p.image} alt="" className="mb-8 rounded-xl" />}
        {String(p.content || '').split(/\n\s*\n/).map((para: string, i: number) => <p key={i} className="mb-5 text-lg leading-relaxed">{para}</p>)}
        {p.tags?.length > 0 && <p className="mt-8 text-sm text-ink/60">Tags: {p.tags.join(', ')}</p>}
      </article>
    </>
  )
}

export function About() {
  return <ManagedPage defaultSlug="about" />
}

export function ManagedPage({ defaultSlug }: { defaultSlug: string }) {
  const { slug } = useParams()
  const pageSlug = slug ?? defaultSlug
  const { data, loading, error } = useApi<{ item: any }>(`/api/pages/${encodeURIComponent(pageSlug)}`)
  if (loading) return <State loading error={null} empty={false} emptyText="" />
  if (error || !data?.item) return <NotFound />
  const page = data.item
  return (
    <>
      <Seo title={page.seo_title || page.title || page.name} description={page.seo_description || page.short} />
      <PageHead title={page.title || page.name} intro={page.short} />
      <Section>
        {page.image && <img src={page.image} alt="" className="mb-8 max-h-[28rem] rounded-xl object-cover" />}
        <article className="max-w-4xl whitespace-pre-line text-lg leading-relaxed">{page.content}</article>
      </Section>
      <CtaBand title="Talk to the Sindbad Solution team" text="Contact us to discuss your questions or requirements." />
    </>
  )
}

export function Contact() {
  const [sp] = useSearchParams()
  const { data } = useApi<{ settings: any }>('/api/settings')
  const s = data?.settings ?? {}
  return (
    <>
      <Seo title="Contact" description="Talk to the Sindbad Solution team." />
      <PageHead title="Talk to our team" intro="Tell us what you need. We will reply by your preferred method." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2"><LeadForm kind="leads" defaultInterest={sp.get('interest') ?? ''} /></div>
          <aside className="space-y-3">
            {s.email && <p><b>Email:</b> <a className="text-teal-700 underline" href={`mailto:${s.email}`}>{s.email}</a></p>}
            {s.phone && <p><b>Phone:</b> {s.phone}</p>}
            {s.whatsapp && <p><a className="btn-outline" href={`https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}`}>Chat on WhatsApp</a></p>}
            {s.address && <p><b>Address:</b> {s.address}</p>}
            {s.hours && <p><b>Hours:</b> {s.hours}</p>}
          </aside>
        </div>
      </Section>
    </>
  )
}

export function Demo() {
  const [sp] = useSearchParams()
  return (
    <>
      <Seo title="Request a demo" description="Book a free demo of Sindbad Solution software." />
      <PageHead title="Request a demo" intro="No account needed. Tell us about your business and we will arrange a walkthrough." />
      <Section><LeadForm kind="demos" defaultInterest={sp.get('interest') ?? ''} /></Section>
    </>
  )
}
