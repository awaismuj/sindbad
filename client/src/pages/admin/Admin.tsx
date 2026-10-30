import { FormEvent, useEffect, useState, createContext, useContext } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError, uploadImage, useApi } from '../../lib/api'
import { entities, Field } from '../../lib/schema'
import { Badge, Empty, ErrorBox, Spinner, STATUS_LABEL } from '../../components/ui'
import { DEFAULT_FOOTER_GROUPS, DEFAULT_NAVIGATION } from '../../components/Layout'

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
              {entities.map((e) => <NavLink key={e.key} to={e.key === 'services' ? '/admin/services' : e.key === 'clients' ? '/admin/clients' : `/admin/content/${e.key}`} className={active}>{e.title}</NavLink>)}
              <NavLink to="/admin/settings" className={active}>Settings</NavLink>
              <NavLink to="/admin/settings/client-showcase" className={active}>Client showcase settings</NavLink></>}
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
  if (f.type === 'image') return <ImageInput f={f} value={value} error={error} />
  const id = `f-${f.name}`
  const common = { id, name: f.name, className: 'field', 'aria-invalid': !!error, required: f.required }
  let input
  if (f.type === 'textarea') input = <textarea {...common} rows={4} defaultValue={value ?? ''} />
  else if (f.type === 'list') input = <textarea {...common} rows={4} defaultValue={(value ?? []).join('\n')} />
  else if (f.type === 'json') input = <textarea {...common} rows={4} defaultValue={value?.length ? JSON.stringify(value, null, 1) : ''} />
  else if (f.type === 'bool') return <label className="flex items-center gap-2 font-semibold"><input type="checkbox" name={f.name} defaultChecked={!!value} />{f.label}</label>
  else if (f.type === 'select') input = <select {...common} defaultValue={value ?? f.options![0]}>{f.options!.map((o) => <option key={o} value={o}>{STATUS_LABEL[o] ?? o}</option>)}</select>
  else input = <input {...common} type={f.type === 'number' || f.type === 'int' ? 'number' : f.type === 'url' ? 'url' : 'text'}
    min={f.name === 'speed' ? 10 : f.name === 'logo_height' ? 32 : f.name === 'rows' || f.name === 'max_clients' ? 1 : f.name === 'spacing' ? 16 : undefined}
    max={f.name === 'speed' ? 120 : f.name === 'logo_height' ? 120 : f.name === 'spacing' ? 96 : f.name === 'rows' ? 3 : f.name === 'max_clients' ? 50 : undefined}
    step={f.type === 'number' ? 'any' : undefined} defaultValue={value ?? ''} />
  return <div><label className="label" htmlFor={id}>{f.label}{f.required && ' *'}</label>{input}
    {f.help && <p className="text-xs text-ink/60">{f.help}</p>}{error && <p className="text-sm text-red-700">{error}</p>}</div>
}

function ImageInput({ f, value, error }: { f: Field; value: string; error?: string }) {
  const [url, setUrl] = useState(value ?? '')
  const [busy, setBusy] = useState(false)
  const [uploadError, setUploadError] = useState('')
  useEffect(() => setUrl(value ?? ''), [value])
  async function upload(file?: File) {
    if (!file) return
    setBusy(true); setUploadError('')
    try { setUrl(await uploadImage(file)) }
    catch (x) { setUploadError(x instanceof Error ? x.message : 'Image upload failed') }
    finally { setBusy(false) }
  }
  const id = `f-${f.name}`
  return <div>
    <label className="label" htmlFor={id}>{f.label}{f.required && ' *'}</label>
    <input id={id} name={f.name} type="text" required={f.required} className="field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL or upload" aria-invalid={!!error} />
    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-teal-700">
      <span>{busy ? 'Uploading…' : 'Upload image'}</span>
      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => { void upload(e.target.files?.[0]); e.currentTarget.value = '' }} />
    </label>
    {url && <img src={url} alt="" className="mt-3 max-h-40 rounded-lg border object-contain" />}
    {(uploadError || error) && <p role="alert" className="text-sm text-red-700">{uploadError || error}</p>}
    <p className="text-xs text-ink/60">JPEG, PNG, or WebP; maximum 4 MB.</p>
  </div>
}

export function ContentList({ resourceKey }: { resourceKey?: string } = {}) {
  const params = useParams()
  const key = params.key ?? resourceKey!
  const e = entities.find((x) => x.key === key)!
  const { data, loading, error, reload } = useApi<{ items: any[] }>(`/api/admin/${key}`)
  const [editing, setEditing] = useState<any | null>(null) // {} = new
  const [errs, setErrs] = useState<Record<string, string>>({}); const [msg, setMsg] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [clientStatus, setClientStatus] = useState('all')
  useEffect(() => { setEditing(null); setMsg('') }, [key])
  async function edit(id?: string) {
    setErrs({}); setMsg('')
    if (id) setEditing((await api(`/api/admin/${key}/${id}`)).item)
    else setEditing(key === 'clients' ? {
      name: '', logo: '', website_url: '', description: '', industry: '',
      order: data?.items.length ?? 0, featured: false, active: false, show_on_homepage: false,
    } : {})
  }
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
  async function moveClient(items: any[], index: number, offset: number) {
    const other = index + offset
    if (other < 0 || other >= items.length) return
    const first = items[index]
    const second = items[other]
    try {
      await Promise.all([
        api(`/api/admin/clients/${first.id}`, { method: 'PUT', body: { order: second.order ?? other } }),
        api(`/api/admin/clients/${second.id}`, { method: 'PUT', body: { order: first.order ?? index } }),
      ])
      setMsg('Client order updated')
      reload()
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Could not reorder clients')
    }
  }
  if (editing) return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">{editing.id ? 'Edit' : 'New'} {e.title.toLowerCase()}</h1>
      {e.fields.map((f) => <FieldInput key={f.name} f={f} value={f.name === 'status' ? (editing.status ?? (editing.published ? 'published' : 'draft')) : editing[f.name]} error={errs[f.name]} />)}
      {msg && <ErrorBox message={msg} />}
      <div className="flex flex-wrap gap-3"><button className="btn-primary">Save changes</button>
        {key === 'services' && editing.id && editing.slug && <Link className="btn-outline" target="_blank" to={`/services/${editing.slug}?preview=${editing.id}`}>Preview page</Link>}
        <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button></div>
    </form>)
  const clientItems = (data?.items ?? [])
    .filter((item) => key !== 'clients' || (item.name.toLowerCase().includes(clientSearch.toLowerCase()) &&
      (clientStatus === 'all' || (clientStatus === 'active' ? item.active : !item.active))))
    .sort((a, b) => key === 'clients' ? (a.order ?? 0) - (b.order ?? 0) : 0)
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">{e.title}</h1><button className="btn-primary" onClick={() => edit()}>Add new</button></div>
      {msg && <p role="status" className="mt-3 font-semibold text-teal-700">{msg}</p>}
      {key === 'clients' && <div className="mt-5 flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="client-search">Search clients</label>
        <input id="client-search" className="field max-w-sm" placeholder="Search clients by name" value={clientSearch} onChange={(event) => setClientSearch(event.target.value)} />
        <label className="sr-only" htmlFor="client-status">Filter clients by status</label>
        <select id="client-status" className="field max-w-xs" value={clientStatus} onChange={(event) => setClientStatus(event.target.value)}>
          <option value="all">All clients</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
        <Link to="/#clients" target="_blank" className="btn-outline">Preview homepage showcase</Link>
      </div>}
      <div className="mt-5 rounded-xl bg-white">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : !clientItems.length ? <Empty>{key === 'clients' && data?.items.length ? 'No clients match this search or filter.' : 'Nothing here yet. Use "Add new" to create the first one.'}</Empty> : (
          <ul className="divide-y">{clientItems.map((it, index) => (
            <li key={it.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                {key === 'clients' && it.logo && <img src={it.logo} alt="" className="h-12 w-20 shrink-0 rounded border bg-white object-contain p-1" />}
                <div><b>{it[e.titleField]}</b> {e.badge && it[e.badge] && <Badge value={it[e.badge]} />}
                {'published' in it && <span className={`ml-2 text-xs font-semibold ${it.published ? 'text-teal-700' : 'text-ink/50'}`}>{it.published ? 'Published' : 'Unpublished'}</span>}</div>
                {key === 'clients' && <span className={`text-xs font-semibold ${it.active ? 'text-teal-700' : 'text-ink/50'}`}>{it.active ? 'Active' : 'Inactive'}{it.show_on_homepage ? ' · Homepage' : ''}</span>}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm font-semibold">
                {key === 'clients' && <div className="flex gap-1">
                  <button type="button" aria-label={`Move ${it.name} up`} className="rounded border px-2 py-1 disabled:opacity-40" disabled={index === 0} onClick={() => void moveClient(clientItems, index, -1)}>↑</button>
                  <button type="button" aria-label={`Move ${it.name} down`} className="rounded border px-2 py-1 disabled:opacity-40" disabled={index === clientItems.length - 1} onClick={() => void moveClient(clientItems, index, 1)}>↓</button>
                </div>}
                {key === 'services' && it.slug && <Link className="text-teal-700 underline" target="_blank" to={`/services/${it.slug}?preview=${it.id}`}>Preview</Link>}
                <button className="text-teal-700 underline" onClick={() => edit(it.id)}>Edit</button><button className="text-red-700 underline" onClick={() => del(it)}>Delete</button></div>
            </li>))}</ul>)}
      </div>
    </div>
  )
}

const SETTINGS: Field[] = [
  { name: 'company_name', label: 'Company name', type: 'text' }, { name: 'tagline', label: 'Tagline', type: 'text' },
  { name: 'logo_url', label: 'Company logo', type: 'image' }, { name: 'favicon_url', label: 'Favicon image', type: 'image' },
  { name: 'description', label: 'Company description', type: 'textarea' },
  { name: 'service_intro_message', label: 'Fallback message for services without descriptions', type: 'textarea' },
  { name: 'navigation', label: 'Main navigation (JSON)', type: 'json', help: 'Edit labels, paths, order, enabled state, desktop_visible/mobile_visible, and optional child links. Paths must be internal or secure HTTPS URLs.' },
  { name: 'footer_groups', label: 'Footer link groups (JSON)', type: 'json', help: 'Each group has a title, optional enabled/order, and links containing label, path, and optional enabled/order.' },
  { name: 'copyright_text', label: 'Copyright text', type: 'text' },
  { name: 'hero_title', label: 'Homepage headline', type: 'text' },
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
    const body: Record<string, unknown> = {}
    let invalidJsonField = 'navigation'
    try {
      for (const field of SETTINGS) {
        const value = f.get(field.name)
        if (field.type === 'json') invalidJsonField = field.name
        body[field.name] = field.type === 'json' ? (String(value ?? '').trim() ? JSON.parse(String(value)) : []) : value
      }
    } catch {
      setErrs({ [invalidJsonField]: 'Enter valid JSON for this setting' }); setMsg('Invalid JSON')
      return
    }
    try { await api('/api/admin/settings', { method: 'PUT', body }); setMsg('Settings saved') } catch (x) { if (x instanceof ApiError) { setErrs(x.fields); setMsg(x.message) } }
  }
  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      {SETTINGS.map((f) => <FieldInput key={f.name} f={f} value={data?.settings?.[f.name] ?? (f.name === 'navigation' ? DEFAULT_NAVIGATION : f.name === 'footer_groups' ? DEFAULT_FOOTER_GROUPS : undefined)} error={errs[f.name]} />)}
      {msg && <p role="status" className="font-semibold">{msg}</p>}
      <button className="btn-primary">Save changes</button>
    </form>)
}

const SHOWCASE_DEFAULTS = {
  enabled: true,
  heading: 'Trusted by Businesses That Choose Innovation',
  description: 'We partner with businesses across industries to deliver reliable software, technology, and automation solutions.',
  direction: 'right_to_left',
  speed: 36,
  logo_height: 64,
  spacing: 48,
  background: 'white',
  grayscale: true,
  pause_on_hover: true,
  edge_fade: true,
  rows: 1,
  max_clients: 20,
}
const SHOWCASE_FIELDS: Field[] = [
  { name: 'enabled', label: 'Enable homepage client showcase', type: 'bool' },
  { name: 'heading', label: 'Section heading', type: 'text', required: true },
  { name: 'description', label: 'Supporting description', type: 'textarea' },
  { name: 'direction', label: 'Animation direction', type: 'select', options: ['right_to_left', 'left_to_right'] },
  { name: 'speed', label: 'Animation duration in seconds (10–120)', type: 'int', required: true },
  { name: 'logo_height', label: 'Logo height in pixels (32–120)', type: 'int', required: true },
  { name: 'spacing', label: 'Logo spacing in pixels (16–96)', type: 'int', required: true },
  { name: 'background', label: 'Section background', type: 'select', options: ['white', 'cream', 'light', 'navy'] },
  { name: 'grayscale', label: 'Show grayscale logos until hover', type: 'bool' },
  { name: 'pause_on_hover', label: 'Pause animation on hover or focus', type: 'bool' },
  { name: 'edge_fade', label: 'Fade logos at the edges', type: 'bool' },
  { name: 'rows', label: 'Maximum visible rows (1–3)', type: 'int', required: true },
  { name: 'max_clients', label: 'Maximum displayed clients (1–50)', type: 'int', required: true },
]

export function ClientShowcaseSettings() {
  const { data, loading, error } = useApi<{ settings: Record<string, any> }>('/api/admin/settings/client-showcase')
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body: Record<string, unknown> = {}
    for (const field of SHOWCASE_FIELDS) {
      const value = form.get(field.name)
      body[field.name] = field.type === 'bool' ? value === 'on' : field.type === 'int' ? Number(value) : value
    }
    setErrs({})
    setMsg('')
    try {
      await api('/api/admin/settings/client-showcase', { method: 'PUT', body })
      setMsg('Client showcase settings saved')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrs(error.fields)
        setMsg(error.message)
      } else {
        setMsg('Could not save client showcase settings')
      }
    }
  }
  const values = { ...SHOWCASE_DEFAULTS, ...(data?.settings ?? {}) }
  return <form onSubmit={save} className="max-w-2xl space-y-4">
    <div><h1 className="text-3xl font-bold">Client showcase settings</h1>
      <p className="mt-2 text-ink/70">Configure the homepage client logo section. Only active clients marked for homepage display appear.</p></div>
    {SHOWCASE_FIELDS.map((field) => <FieldInput key={field.name} f={field} value={values[field.name as keyof typeof SHOWCASE_DEFAULTS]} error={errs[field.name]} />)}
    {msg && <p role="status" className={Object.keys(errs).length ? 'font-semibold text-red-700' : 'font-semibold text-teal-700'}>{msg}</p>}
    <button className="btn-primary">Save showcase settings</button>
  </form>
}
