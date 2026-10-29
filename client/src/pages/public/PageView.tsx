import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError, useApi } from '../../lib/api'
import { Seo } from '../../components/Seo'
import { Html } from '../../components/Html'
import { Checks, CtaBand, PageHead, State } from '../../components/bits'

const Blocks = ({ cards }: { cards?: any[] }) => !cards?.length ? null : (
  <div className="mt-14 grid gap-6 md:grid-cols-3">{cards.map((c, i) => (
    <div key={i} className="card overflow-hidden">{c.image && <img src={c.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />}
      <div className="p-6"><h3 className="text-xl font-bold">{c.title}</h3><p className="mt-2 text-ink/75">{c.text}</p></div></div>))}</div>)

function usePage(slug: string) { return useApi<{ item: any }>(`/api/pages/${slug}`) }
const Pending = ({ children }: { children?: React.ReactNode }) => (
  <div className="max-w-3xl rounded-3xl bg-white p-8 ring-1 ring-navy-900/10"><p className="text-lg">Content for this page is being prepared.</p>{children}</div>)

export function About() {
  const { data, loading } = usePage('about'); const p = data?.item
  const has = p && (p.intro || p.content || p.mission || p.vision || p.values?.length || p.cards?.length)
  return (
    <>
      <Seo title={p?.seo_title || 'About us'} description={p?.seo_description || p?.intro} image={p?.og_image} />
      <PageHead title={p?.title || 'About us'} intro={p?.intro || 'We sail your business toward new digital horizons.'} />
      <div className="container-x py-16 md:py-20">
        {loading ? <State loading error={null} empty={false} emptyText="" /> : !has ? <Pending><Link to="/contact" className="btn-dark mt-5">Contact us</Link></Pending> : (<>
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-7"><Html html={p.content} /></div>
            {p.image && <img src={p.image} alt="" className="rounded-3xl md:col-span-5" />}
          </div>
          {(p.mission || p.vision) && <div className="mt-14 grid gap-6 md:grid-cols-2">
            {p.mission && <div className="rounded-3xl bg-navy-900 p-8 text-white"><h2 className="text-2xl font-bold !text-amber">Mission</h2><p className="mt-3 text-lg">{p.mission}</p></div>}
            {p.vision && <div className="rounded-3xl bg-teal p-8"><h2 className="text-2xl font-bold !text-navy-950">Vision</h2><p className="mt-3 text-lg text-navy-950">{p.vision}</p></div>}</div>}
          {p.values?.length > 0 && <div className="mt-14"><h2 className="mb-6 text-3xl font-bold">Our values</h2><Checks items={p.values} /></div>}
          <Blocks cards={p.cards} /></>)}
      </div>
      <CtaBand />
    </>
  )
}

export function Life() {
  const { data, loading } = usePage('life-at-sindbad'); const p = data?.item
  const has = p && (p.intro || p.content || p.cards?.length || p.gallery?.length)
  return (
    <>
      <Seo title={p?.seo_title || 'Life at Sindbad Solution'} description={p?.seo_description || p?.intro} image={p?.og_image} />
      <PageHead title={p?.title || 'Life at Sindbad Solution'} intro={p?.intro} />
      <div className="container-x py-16 md:py-20">
        {loading ? <State loading error={null} empty={false} emptyText="" /> : !has ? <Pending><Link to="/careers" className="btn-dark mt-5">See careers</Link></Pending> : (<>
          <Html html={p.content} className="max-w-3xl" /><Blocks cards={p.cards} />
          {p.gallery?.length > 0 && <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">{p.gallery.map((u: string) => <img key={u} src={u} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />)}</div>}</>)}
      </div>
    </>
  )
}

const TYPE: Record<string, string> = { full_time: 'Full time', part_time: 'Part time', contract: 'Contract', internship: 'Internship' }

export function Careers() {
  const { data: page } = usePage('careers'); const { data, loading, error } = useApi<{ items: any[] }>('/api/jobs')
  const [apply, setApply] = useState<any | null>(null)
  const p = page?.item
  const today = new Date().toISOString().slice(0, 10)
  const jobs = (data?.items ?? []).filter((j) => !j.deadline || j.deadline >= today)
  return (
    <>
      <Seo title={p?.seo_title || 'Careers'} description={p?.seo_description || p?.intro} />
      <PageHead title={p?.title || 'Careers'} intro={p?.intro || 'Join the crew.'} />
      <div className="container-x py-16 md:py-20">
        {p?.content && <Html html={p.content} className="mb-14 max-w-3xl" />}
        <h2 className="mb-6 text-3xl font-bold md:text-4xl">Open positions</h2>
        <State loading={loading} error={error} empty={!jobs.length} emptyText="There are no open positions right now. You can still introduce yourself through our contact page." />
        <div className="space-y-5">{jobs.map((j) => (
          <article key={j.id} id={j.slug} className="rounded-2xl bg-white p-7 ring-1 ring-navy-900/10">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-2xl font-bold">{j.title}</h3>
              <ul className="mt-2 flex flex-wrap gap-2 text-sm">{[j.department, j.location, TYPE[j.employment_type], j.deadline && `Apply by ${j.deadline}`].filter(Boolean).map((t) => <li key={t} className="chip">{t}</li>)}</ul></div>
              <button className="btn-dark" aria-expanded={apply?.id === j.id} onClick={() => setApply(apply?.id === j.id ? null : j)}>{apply?.id === j.id ? 'Close' : 'Apply now'}</button></div>
            <Html html={j.description} className="mt-5 !text-base" />
            {j.requirements?.length > 0 && <div className="mt-5"><h4 className="mb-3 font-display text-lg font-bold">Requirements</h4><Checks items={j.requirements} /></div>}
            {apply?.id === j.id && <ApplyForm job={j} />}
          </article>))}</div>
      </div>
    </>
  )
}

function ApplyForm({ job }: { job: any }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle'); const [err, setErr] = useState(''); const [fields, setFields] = useState<Record<string, string>>({})
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget).entries())
    setState('sending'); setErr(''); setFields({})
    try { await api('/api/applications', { method: 'POST', body: { ...f, interest: job.title, source_page: `/careers#${job.slug}` } }); setState('done') }
    catch (x) { setState('idle'); if (x instanceof ApiError) { setErr(x.message); setFields(x.fields) } else setErr('Could not reach the server. Try again.') }
  }
  if (state === 'done') return <p role="status" className="mt-6 rounded-2xl bg-teal-50 p-5 font-semibold">Application received. Thank you for applying.</p>
  const F = (n: string, l: string, t = 'text', req = false) => (<div><label className="label" htmlFor={`a-${n}`}>{l}{req && ' *'}</label><input id={`a-${n}`} name={n} type={t} required={req} className="field" />{fields[n] && <p className="mt-1 text-sm text-red-700">{fields[n]}</p>}</div>)
  return (
    <form onSubmit={submit} className="mt-6 grid gap-4 border-t border-navy-900/10 pt-6 sm:grid-cols-2">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {F('name', 'Full name', 'text', true)}{F('email', 'Email', 'email', true)}{F('phone', 'Phone', 'tel')}{F('resume_url', 'Link to your CV or profile (https://…)', 'url')}
      <div className="sm:col-span-2"><label className="label" htmlFor="a-msg">Cover letter</label><textarea id="a-msg" name="requirements" rows={5} className="field" /></div>
      {err && <p role="alert" className="text-red-700 sm:col-span-2">{err}</p>}
      <div className="sm:col-span-2"><button className="btn-primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Submit application'}</button></div>
    </form>)
}
