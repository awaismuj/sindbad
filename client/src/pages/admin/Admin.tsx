import { FormEvent, useEffect, useState, createContext, useContext } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError, useApi } from '../../lib/api'
import { entities, Field } from '../../lib/schema'
import { Badge, Empty, ErrorBox, Spinner, STATUS_LABEL } from '../../components/ui'

type User = { id: string; name: string; email: string; role: string }
const Ctx = createContext<{ user: User; logout: () => void } | null>(null)
const can = (role: string, group: 'content' | 'sales') => role === 'super_admin' || role === (group === 'content' ? 'content_manager' : 'sales_manager')

export function AdminLogin() {
  const nav = useNavigate()
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr('')
    const f = new FormData(e.currentTarget)
    try { await api('/api/auth/login', { method: 'POST', body: { email: f.get('email'), password: f.get('password') } }); nav('/admin') }
    catch (x) { setErr(x instanceof ApiError ? x.message : 'Could not reach the server') } finally { setBusy(false) }
  }
  return (
    <div className="grid min-h-screen place-items-center bg-navy-900 p-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8">
        <img src="/brand/logo.png" alt="Sindbad Solution" width={72} className="mx-auto rounded-full" />
        <h1 className="text-center text-2xl font-bold">Admin sign in</h1>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="field" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
        {err && <ErrorBox message={err} />}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="text-center text-xs text-ink/60">Forgot your password? A Super Admin can reset it. Self-service email recovery needs SMTP, which is not set up yet.</p>
      </form>
    </div>
  )
}

export function AdminLayout() {
  const { data, loading, reload } = useApi<{ user: User | null }>('/api/auth/me')
  if (loading) return <Spinner />
  if (!data?.user) return <Navigate to="/admin/login" replace />
  const user = data.user
  const logout = async () => { await api('/api/auth/logout', { method: 'POST' }); reload() }
  const link = 'block rounded-lg px-3 py-2 font-semibold hover:bg-white/10'
  const active = ({ isActive }: { isActive: boolean }) => `${link} ${isActive ? 'bg-white/15 text-teal' : ''}`
  return (
    <Ctx.Provider value={{ user, logout }}>
      <div className="min-h-screen md:flex">
        <aside className="bg-navy-900 p-4 text-white md:w-60 md:shrink-0">
          <Link to="/" className="mb-4 flex items-center gap-2 font-display font-bold"><img src="/brand/logo.png" alt="" width={32} className="rounded-full" />Sindbad admin</Link>
          <nav aria-label="Admin" className="flex flex-wrap gap-1 md:block">
            <NavLink end to="/admin" className={active}>Dashboard</NavLink>
            {can(user.role, 'sales') && <><NavLink to="/admin/leads" className={active}>Enquiries</NavLink><NavLink to="/admin/demos" className={active}>Demo requests</NavLink></>}
            {can(user.role, 'content') && <>
              {entities.map((e) => <NavLink key={e.key} to={`/admin/content/${e.key}`} className={active}>{e.title}</NavLink>)}
              <NavLink to="/admin/settings" className={active}>Settings</NavLink></>}
          </nav>
          <div className="mt-6 text-sm text-white/70">{user.name} ({STATUS_LABEL[user.role] ?? user.role.replace('_', ' ')})
            <button onClick={logout} className="mt-2 block font-semibold text-amber">Sign out</button></div>
        </aside>
        <div className="flex-1 bg-cream p-6"><Outlet /></div>
      </div>
    </Ctx.Provider>
  )
}

export function Dashboard() {
  const { data, loading, error } = useApi<any>('/api/admin/dashboard')
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />
  const cards: [string, number][] = [['Total enquiries', data.enquiries], ['New enquiries', data.new_enquiries], ['Demo requests', data.demos],
    ['Products', data.products], ['Published products', data.published_products], ['Published articles', data.published_posts]]
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([l, v]) => <div key={l} className="rounded-xl bg-white p-5"><p className="text-sm text-ink/60">{l}</p><p className="font-display text-3xl font-bold">{v}</p></div>)}
      </div>
      <h2 className="mt-8 text-xl font-bold">Enquiries by status</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {Object.keys(data.by_status).length ? Object.entries<number>(data.by_status).map(([s, n]) => <div key={s} className="rounded-lg bg-white px-4 py-2"><Badge value={s} /> <b className="ml-2">{n}</b></div>) : <Empty>No enquiries yet.</Empty>}
      </div>
      {data.recent.length > 0 && <>
        <h2 className="mt-8 text-xl font-bold">Recent activity</h2>
        <ul className="mt-3 divide-y rounded-xl bg-white">{data.recent.map((r: any) => <li key={r.id} className="p-3 text-sm"><b>{r.user_email}</b> {r.action} {r.target} <span className="text-ink/50">{new Date(r.created_at).toLocaleString()}</span></li>)}</ul></>}
    </div>
  )
}

const STATUSES = ['new', 'contacted', 'demo_scheduled', 'proposal_sent', 'converted', 'closed']

export function Leads({ kind }: { kind: 'leads' | 'demos' }) {
  const [q, setQ] = useState(''); const [status, setStatus] = useState(''); const [page, setPage] = useState(1)
  const [open, setOpen] = useState<any>(null)
  const { data, loading, error, reload } = useApi<any>(`/api/admin/${kind}?page=${page}&status=${status}&q=${encodeURIComponent(q)}`)
  useEffect(() => { setPage(1) }, [kind, status, q])
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget)
    await api(`/api/admin/${kind}/${open.id}`, { method: 'PATCH', body: { status: f.get('status'), notes: f.get('notes'), assigned_to: f.get('assigned_to'), scheduled_date: f.get('scheduled_date'), outcome: f.get('outcome') } })
    setOpen(null); reload()
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{kind === 'leads' ? 'Enquiries' : 'Demo requests'}</h1>
        <a className="btn-outline" href={`/api/admin/${kind}/export`}>Export CSV</a>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <input aria-label="Search" placeholder="Search name, email, company" className="field max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Status" className="field max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl bg-white">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : !data.items.length ? <Empty>Nothing here yet.</Empty> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-900 text-white"><tr>{['Date', 'Name', 'Business', 'Interest', 'Source', 'Status', ''].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>{data.items.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-3"><b>{r.name}</b><br /><span className="text-ink/60">{r.email}</span></td>
                <td className="p-3">{r.company}<br /><span className="text-ink/60">{r.industry}</span></td>
                <td className="p-3">{r.interest}</td><td className="p-3">{r.source_page}</td>
                <td className="p-3"><Badge value={r.status} /></td>
                <td className="p-3"><button className="font-semibold text-teal-700 underline" onClick={() => setOpen(r)}>View</button></td>
              </tr>))}</tbody>
          </table>)}
      </div>
      {data && data.total > data.per && (
        <div className="mt-4 flex items-center gap-3">
          <button className="btn-outline !py-1.5" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {Math.ceil(data.total / data.per)}</span>
          <button className="btn-outline !py-1.5" disabled={page * data.per >= data.total} onClick={() => setPage(page + 1)}>Next</button>
        </div>)}
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-xl space-y-3 overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="text-xl font-bold">{open.name}</h2>
            <p className="text-sm">{open.email} {open.phone && `· ${open.phone}`}</p>
            <p className="whitespace-pre-line rounded-lg bg-cream p-3">{open.requirements}</p>
            <div><label className="label">Status</label><select name="status" defaultValue={open.status} className="field">{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></div>
            <div><label className="label">Assigned to</label><input name="assigned_to" defaultValue={open.assigned_to ?? ''} className="field" /></div>
            {kind === 'demos' && <><div><label className="label">Scheduled date</label><input name="scheduled_date" defaultValue={open.scheduled_date ?? ''} className="field" /></div>
              <div><label className="label">Outcome</label><textarea name="outcome" defaultValue={open.outcome ?? ''} className="field" /></div></>}
            <div><label className="label">Internal notes</label><textarea name="notes" rows={3} defaultValue={open.notes ?? ''} className="field" /></div>
            <div className="flex gap-3"><button className="btn-primary">Save changes</button><button type="button" className="btn-outline" onClick={() => setOpen(null)}>Cancel</button></div>
          </form>
        </div>)}
    </div>
  )
}

function FieldInput({ f, value, error }: { f: Field; value: any; error?: string }) {
  const id = `f-${f.name}`
  const common = { id, name: f.name, className: 'field', 'aria-invalid': !!error }
  let input
  if (f.type === 'textarea') input = <textarea {...common} rows={4} defaultValue={value ?? ''} />
  else if (f.type === 'list') input = <textarea {...common} rows={4} defaultValue={(value ?? []).join('\n')} />
  else if (f.type === 'json') input = <textarea {...common} rows={4} defaultValue={value?.length ? JSON.stringify(value, null, 1) : ''} />
  else if (f.type === 'bool') return <label className="flex items-center gap-2 font-semibold"><input type="checkbox" name={f.name} defaultChecked={!!value} />{f.label}</label>
  else if (f.type === 'select') input = <select {...common} defaultValue={value ?? f.options![0]}>{f.options!.map((o) => <option key={o} value={o}>{STATUS_LABEL[o] ?? o}</option>)}</select>
  else input = <input {...common} type={f.type === 'number' || f.type === 'int' ? 'number' : 'text'} step={f.type === 'number' ? 'any' : undefined} defaultValue={value ?? ''} />
  return <div><label className="label" htmlFor={id}>{f.label}{f.required && ' *'}</label>{input}
    {f.help && <p className="text-xs text-ink/60">{f.help}</p>}{error && <p className="text-sm text-red-700">{error}</p>}</div>
}

export function ContentList() {
  const { key } = useParams(); const e = entities.find((x) => x.key === key)!
  const { data, loading, error, reload } = useApi<{ items: any[] }>(`/api/admin/${key}`)
  const [editing, setEditing] = useState<any | null>(null) // {} = new
  const [errs, setErrs] = useState<Record<string, string>>({}); const [msg, setMsg] = useState('')
  useEffect(() => { setEditing(null); setMsg('') }, [key])
  async function edit(id?: string) { setErrs({}); setMsg(''); setEditing(id ? (await api(`/api/admin/${key}/${id}`)).item : {}) }
  async function save(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault(); const f = new FormData(ev.currentTarget); const body: Record<string, unknown> = {}
    try {
      for (const fl of e.fields) {
        const v = f.get(fl.name)
        if (fl.type === 'bool') body[fl.name] = f.get(fl.name) === 'on'
        else if (fl.type === 'list') body[fl.name] = String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean)
        else if (fl.type === 'json') body[fl.name] = String(v ?? '').trim() ? JSON.parse(String(v)) : []
        else body[fl.name] = v
      }
    } catch { setErrs({ faqs: 'This is not valid JSON' }); return }
    try {
      await api(`/api/admin/${key}${editing.id ? '/' + editing.id : ''}`, { method: editing.id ? 'PUT' : 'POST', body })
      setEditing(null); setMsg('Saved'); reload()
    } catch (x) { if (x instanceof ApiError) { setErrs(x.fields); setMsg(x.message) } }
  }
  async function del(item: any) {
    if (!window.confirm(`Delete "${item[e.titleField]}"? This cannot be undone.`)) return
    await api(`/api/admin/${key}/${item.id}`, { method: 'DELETE' }); setMsg('Deleted'); reload()
  }
  if (editing) return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">{editing.id ? 'Edit' : 'New'} {e.title.toLowerCase()}</h1>
      {e.fields.map((f) => <FieldInput key={f.name} f={f} value={editing[f.name]} error={errs[f.name]} />)}
      {msg && <ErrorBox message={msg} />}
      <div className="flex gap-3"><button className="btn-primary">Save changes</button><button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button></div>
    </form>)
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">{e.title}</h1><button className="btn-primary" onClick={() => edit()}>Add new</button></div>
      {msg && <p role="status" className="mt-3 font-semibold text-teal-700">{msg}</p>}
      <div className="mt-5 rounded-xl bg-white">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : !data!.items.length ? <Empty>Nothing here yet. Use "Add new" to create the first one.</Empty> : (
          <ul className="divide-y">{data!.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 p-4">
              <div><b>{it[e.titleField]}</b> {e.badge && it[e.badge] && <Badge value={it[e.badge]} />}
                {'published' in it && <span className={`ml-2 text-xs font-semibold ${it.published ? 'text-teal-700' : 'text-ink/50'}`}>{it.published ? 'Published' : 'Unpublished'}</span>}</div>
              <div className="flex gap-4 text-sm font-semibold"><button className="text-teal-700 underline" onClick={() => edit(it.id)}>Edit</button><button className="text-red-700 underline" onClick={() => del(it)}>Delete</button></div>
            </li>))}</ul>)}
      </div>
    </div>
  )
}

const SETTINGS: Field[] = [
  { name: 'company_name', label: 'Company name', type: 'text' }, { name: 'tagline', label: 'Tagline', type: 'text' },
  { name: 'description', label: 'Company description', type: 'textarea' }, { name: 'hero_title', label: 'Homepage headline', type: 'text' },
  { name: 'hero_text', label: 'Homepage supporting text', type: 'textarea' }, { name: 'email', label: 'Business email', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' }, { name: 'whatsapp', label: 'WhatsApp number', type: 'text' },
  { name: 'address', label: 'Address', type: 'text' }, { name: 'hours', label: 'Business hours', type: 'text' },
  { name: 'currency', label: 'Default currency (e.g. USD)', type: 'text' }, { name: 'linkedin', label: 'LinkedIn URL', type: 'url' },
  { name: 'facebook', label: 'Facebook URL', type: 'url' }, { name: 'instagram', label: 'Instagram URL', type: 'url' }, { name: 'x', label: 'X URL', type: 'url' },
  { name: 'seo_title', label: 'Default SEO title', type: 'text' }, { name: 'seo_description', label: 'Default SEO description', type: 'textarea' },
]
export function Settings() {
  const { data, loading } = useApi<{ settings: any }>('/api/settings')
  const [errs, setErrs] = useState<Record<string, string>>({}); const [msg, setMsg] = useState('')
  if (loading) return <Spinner />
  async function save(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault(); const f = new FormData(ev.currentTarget); setErrs({}); setMsg('')
    const body = Object.fromEntries(SETTINGS.map((s) => [s.name, f.get(s.name)]))
    try { await api('/api/admin/settings', { method: 'PUT', body }); setMsg('Settings saved') } catch (x) { if (x instanceof ApiError) { setErrs(x.fields); setMsg(x.message) } }
  }
  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      {SETTINGS.map((f) => <FieldInput key={f.name} f={f} value={data?.settings?.[f.name]} error={errs[f.name]} />)}
      {msg && <p role="status" className="font-semibold">{msg}</p>}
      <button className="btn-primary">Save changes</button>
    </form>)
}
