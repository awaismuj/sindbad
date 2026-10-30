import { FormEvent, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import { useApi } from '../lib/api'

type Kind = 'leads' | 'demos'
function Fld({ name, label, type = 'text', req = false, area = false, errs }: { name: string; label: string; type?: string; req?: boolean; area?: boolean; errs: Record<string, string> }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}{req && ' *'}</label>
      {area ? <textarea id={name} name={name} rows={5} required={req} className="field" aria-invalid={!!errs[name]} />
        : <input id={name} name={name} type={type} required={req} className="field" aria-invalid={!!errs[name]} />}
      {errs[name] && <p className="mt-1 text-sm text-red-700">{errs[name]}</p>}
    </div>
  )
}

export function LeadForm({ kind, defaultInterest = '' }: { kind: Kind; defaultInterest?: string }) {
  const loc = useLocation()
  const { data: inds } = useApi<{ items: any[] }>('/api/industries')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState<string>('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const demo = kind === 'demos'

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const body: Record<string, unknown> = Object.fromEntries(f.entries())
    body.consent = f.get('consent') === 'on'
    body.source_page = loc.pathname + (loc.search || '')
    if (demo && body.locations) body.locations = Number(body.locations)
    setState('sending'); setErr(''); setFields({})
    try { await api(`/api/${kind}`, { method: 'POST', body }); setState('done') }
    catch (x) {
      setState('idle')
      if (x instanceof ApiError) { setErr(x.message); setFields(x.fields) } else setErr('Could not reach the server. Check your connection and try again.')
    }
  }
  if (state === 'done') return (
    <div role="status" className="card p-8 text-navy-900">
      <h3 className="text-xl font-bold">{demo ? 'Demo request received' : 'Message received'}</h3>
      <p className="mt-2">Thank you. Our team will review your details and contact you using the information you provided.</p>
    </div>
  )
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Fld errs={fields} name="name" label={demo ? 'Your name' : 'Full name'} req />
      <Fld errs={fields} name="company" label={demo ? 'Business name' : 'Company name'} req={demo} />
      <Fld errs={fields} name="email" label="Business email" type="email" req />
      <Fld errs={fields} name="phone" label="Phone number" type="tel" req={demo} />
      <div>
        <label className="label" htmlFor="industry">Industry</label>
        <select id="industry" name="industry" className="field" defaultValue="">
          <option value="">Select…</option>
          {inds?.items.map((i) => <option key={i.id} value={i.name}>{i.name}</option>)}
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="interest">Product or service of interest</label>
        <input id="interest" name="interest" defaultValue={defaultInterest} className="field" />
      </div>
      {demo ? <>
        <Fld errs={fields} name="locations" label="Number of business locations" type="number" />
        <Fld errs={fields} name="preferred_time" label="Preferred date or time to talk" />
      </> : <>
        <Fld errs={fields} name="budget" label="Estimated budget (optional)" />
        <div>
          <label className="label" htmlFor="contact_method">Preferred contact method</label>
          <select id="contact_method" name="contact_method" className="field" defaultValue="email">
            <option value="email">Email</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </>}
      <div className="sm:col-span-2"><Fld errs={fields} name="requirements" label={demo ? 'What do you want to see in the demo?' : 'Project requirements'} req area /></div>
      {!demo && (
        <div className="sm:col-span-2">
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="consent" className="mt-1" />
            I agree that Sindbad Solution may contact me about this enquiry.</label>
          {fields.consent && <p className="mt-1 text-sm text-red-700">{fields.consent}</p>}
        </div>
      )}
      {err && <div role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-red-800">{err}</div>}
      <div className="sm:col-span-2">
        <button className="btn-primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : demo ? 'Request demo' : 'Send message'}</button>
      </div>
    </form>
  )
}
