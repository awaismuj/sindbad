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
    <div className="band-blue grid min-h-screen place-items-center p-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-[0_30px_80px_-20px_rgba(4,20,60,.6)]">
        <img src="/brand/logo.png" alt="Sindbad Solution" width={64} className="mx-auto rounded-full" />
        <div className="text-center"><h1 className="text-2xl font-bold">Admin sign in</h1><p className="mt-1 text-sm text-ink/60">Manage your site content and enquiries.</p></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="field" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
        {err && <ErrorBox message={err} />}
        <button className="btn-primary w-full !py-3" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
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
  const link = 'block rounded-lg border-l-2 border-transparent px-3 py-2 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white'
  const active = ({ isActive }: { isActive: boolean }) => `${link} ${isActive ? '!border-teal !bg-white/10 !text-white' : ''}`
  const group = (t: string) => <p className="mb-1 mt-5 px-3 text-xs font-semibold text-white/40 first:mt-0">{t}</p>
  return (
    <Ctx.Provider value={{ user, logout }}>
      <div className="min-h-screen bg-cream md:flex">
        <aside className="bg-navy-900 p-4 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:overflow-y-auto">
          <Link to="/" className="mb-5 flex items-center gap-2.5 px-1 font-display font-semibold"><img src="/brand/logo.png" alt="" width={34} className="rounded-full" />Sindbad admin</Link>
          <nav aria-label="Admin">
            {group('Overview')}
            <NavLink end to="/admin" className={active}>Dashboard</NavLink>
            {can(user.role, 'sales') && <>{group('Inbox')}<NavLink to="/admin/leads" className={active}>Enquiries</NavLink><NavLink to="/admin/demos" className={active}>Demo requests</NavLink></>}
            {can(user.role, 'content') && <>
              {group('Content')}
              {entities.map((e) => <NavLink key={e.key} to={e.key === 'services' ? '/admin/services' : e.key === 'clients' ? '/admin/clients' : `/admin/content/${e.key}`} className={active}>{e.title}</NavLink>)}
              {group('Site')}
              <NavLink end to="/admin/settings" className={active}>Settings</NavLink>
              <NavLink to="/admin/settings/client-showcase" className={active}>Client showcase</NavLink></>}
          </nav>
          <div className="mt-8 rounded-xl bg-white/5 p-3 text-sm">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="text-white/60">{STATUS_LABEL[user.role] ?? user.role.replace('_', ' ')}</p>
            <div className="mt-2 flex gap-4 font-semibold"><Link to="/" target="_blank" className="text-white/80 hover:text-white">View site</Link><button onClick={logout} className="text-amber">Sign out</button></div>
          </div>
        </aside>
        <div className="min-w-0 flex-1 p-5 md:p-8"><div className="mx-auto max-w-5xl"><Outlet /></div></div>
      </div>
    </Ctx.Provider>
  )
}

export function Dashboard() {
  const { data, loading, error } = useApi<any>('/api/admin/dashboard')
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />
  const cards: [string, number, string][] = [['Total enquiries', data.enquiries, 'bg-sea-600'], ['New enquiries', data.new_enquiries, 'bg-amber'], ['Demo requests', data.demos, 'bg-teal'],
    ['Products', data.products, 'bg-sea-200'], ['Published products', data.published_products, 'bg-sea-500'], ['Published articles', data.published_posts, 'bg-navy-700']]
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-ink/60">A live count of what is on your site and in your inbox.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([l, v, c]) => <div key={l} className="card relative overflow-hidden p-5 pl-6"><span className={`absolute inset-y-0 left-0 w-1.5 ${c}`} /><p className="text-sm font-semibold text-ink/60">{l}</p><p className="mt-1 font-display text-4xl font-bold text-navy-900">{v}</p></div>)}
      </div>
      <h2 className="mt-10 text-xl font-semibold">Enquiries by status</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {Object.keys(data.by_status).length ? Object.entries<number>(data.by_status).map(([s, n]) => <div key={s} className="card flex items-center gap-3 px-4 py-2.5"><Badge value={s} /><b className="font-display text-lg">{n}</b></div>) : <Empty>No enquiries yet.</Empty>}
      </div>
      {data.recent.length > 0 && <>
        <h2 className="mt-10 text-xl font-semibold">Recent activity</h2>
        <ul className="card mt-3 divide-y divide-sea-100">{data.recent.map((r: any) => <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"><span><b>{r.user_email}</b> {r.action} <span className="text-ink/60">{r.target}</span></span><span className="text-ink/50">{new Date(r.created_at).toLocaleString()}</span></li>)}</ul></>}
    </div>
  )
}

const STATUSES = ['new', 'contacted', 'demo_scheduled', 'proposal_sent', 'converted', 'closed']

export function Leads({ kind }: { kind: 'leads' | 'demos' }) {
  const [q, setQ] = useState(''); const [qInput, setQInput] = useState(''); const [status, setStatus] = useState(''); const [page, setPage] = useState(1)
  const [open, setOpen] = useState<any>(null); const [saveErr, setSaveErr] = useState('')
  const { data, loading, error, reload } = useApi<any>(`/api/admin/${kind}?page=${page}&status=${status}&q=${encodeURIComponent(q)}`)
  useEffect(() => { const t = setTimeout(() => setQ(qInput), 300); return () => clearTimeout(t) }, [qInput])
  useEffect(() => { setPage(1) }, [kind, status, q])
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget)
    try { await api(`/api/admin/${kind}/${open.id}`, { method: 'PATCH', body: { status: f.get('status'), notes: f.get('notes'), assigned_to: f.get('assigned_to'), scheduled_date: f.get('scheduled_date'), outcome: f.get('outcome') } })
      setOpen(null); reload() } catch (x) { setSaveErr(x instanceof Error ? x.message : 'Could not save changes') }
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{kind === 'leads' ? 'Enquiries' : 'Demo requests'}</h1>
        <a className="btn-outline" href={`/api/admin/${kind}/export`}>Export CSV</a>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <input aria-label="Search" placeholder="Search name, email, company" className="field max-w-xs" value={qInput} onChange={(e) => setQInput(e.target.value)} />
        <select aria-label="Status" className="field max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
      <div className="card mt-4 overflow-x-auto">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : !data.items.length ? <Empty>Nothing here yet.</Empty> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-sea-50 text-left text-navy-800"><tr>{['Date', 'Name', 'Business', 'Interest', 'Source', 'Status', ''].map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{data.items.map((r: any) => (
              <tr key={r.id} className="border-t border-sea-100 hover:bg-sea-50/50">
                <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-3"><b>{r.name}</b><br /><span className="text-ink/60">{r.email}</span></td>
                <td className="p-3">{r.company}<br /><span className="text-ink/60">{r.industry}</span></td>
                <td className="p-3">{r.interest}</td><td className="p-3">{r.source_page}</td>
                <td className="p-3"><Badge value={r.status} /></td>
                <td className="p-3"><button className="btn-outline !px-3 !py-1.5 text-sm" onClick={() => setOpen(r)}>View</button></td>
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
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-navy-950/60 p-4 backdrop-blur-sm">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-xl space-y-3 overflow-y-auto rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold">{open.name}</h2>
            <p className="text-sm">{open.email} {open.phone && `· ${open.phone}`}</p>
            <p className="whitespace-pre-line rounded-lg bg-sea-50 p-3">{open.requirements}</p>
            <div><label className="label">Status</label><select name="status" defaultValue={open.status} className="field">{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></div>
            <div><label className="label">Assigned to</label><input name="assigned_to" defaultValue={open.assigned_to ?? ''} className="field" /></div>
            {kind === 'demos' && <><div><label className="label">Scheduled date</label><input name="scheduled_date" defaultValue={open.scheduled_date ?? ''} className="field" /></div>
              <div><label className="label">Outcome</label><textarea name="outcome" defaultValue={open.outcome ?? ''} className="field" /></div></>}
            <div><label className="label">Internal notes</label><textarea name="notes" rows={3} defaultValue={open.notes ?? ''} className="field" /></div>
            {saveErr && <ErrorBox message={saveErr} />}
            <div className="flex gap-3"><button className="btn-primary">Save changes</button><button type="button" className="btn-outline" onClick={() => { setOpen(null); setSaveErr('') }}>Cancel</button></div>
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
    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-sea-700">
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
    let jsonField = ''
    try {
      for (const fl of e.fields) {
        const v = f.get(fl.name)
        if (fl.type === 'json') jsonField = fl.name
        if (fl.type === 'bool') body[fl.name] = f.get(fl.name) === 'on'
        else if (fl.type === 'list') body[fl.name] = String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean)
        else if (fl.type === 'json') body[fl.name] = String(v ?? '').trim() ? JSON.parse(String(v)) : []
        else body[fl.name] = v
      }
    } catch { setErrs({ [jsonField]: 'This is not valid JSON' }); setMsg('Please fix the highlighted fields'); return }
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
    let a = second.order ?? 0; const b = first.order ?? 0
    if (a === b) a = b + offset // equal orders would make the swap a no-op
    try {
      await Promise.all([
        api(`/api/admin/clients/${first.id}`, { method: 'PUT', body: { order: a } }),
        api(`/api/admin/clients/${second.id}`, { method: 'PUT', body: { order: b } }),
      ])
      setMsg('Client order updated')
      reload()
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Could not reorder clients')
    }
  }
  if (editing) return (
    <form onSubmit={save} className="card max-w-2xl space-y-4 p-6 md:p-8">
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
      {msg && <p role="status" className="mt-3 font-semibold text-sea-700">{msg}</p>}
      {key === 'clients' && <div className="mt-5 flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="client-search">Search clients</label>
        <input id="client-search" className="field max-w-sm" placeholder="Search clients by name" value={clientSearch} onChange={(event) => setClientSearch(event.target.value)} />
        <label className="sr-only" htmlFor="client-status">Filter clients by status</label>
        <select id="client-status" className="field max-w-xs" value={clientStatus} onChange={(event) => setClientStatus(event.target.value)}>
          <option value="all">All clients</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
        <Link to="/#clients" target="_blank" className="btn-outline">Preview homepage showcase</Link>
      </div>}
      <div className="card mt-5">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : !clientItems.length ? <Empty>{key === 'clients' && data?.items.length ? 'No clients match this search or filter.' : 'Nothing here yet. Use "Add new" to create the first one.'}</Empty> : (
          <ul className="divide-y divide-sea-100">{clientItems.map((it, index) => (
            <li key={it.id} className="flex items-center justify-between gap-3 p-4 hover:bg-sea-50/50">
              <div className="flex min-w-0 items-center gap-3">
                {key === 'clients' && it.logo && <img src={it.logo} alt="" className="h-12 w-20 shrink-0 rounded border bg-white object-contain p-1" />}
                <div><b>{it[e.titleField]}</b> {e.badge && it[e.badge] && <Badge value={it[e.badge]} />}
                {'published' in it && <span className={`ml-2 text-xs font-semibold ${it.published ? 'text-sea-700' : 'text-ink/50'}`}>{it.published ? 'Published' : 'Unpublished'}</span>}</div>
                {key === 'clients' && <span className={`text-xs font-semibold ${it.active ? 'text-sea-700' : 'text-ink/50'}`}>{it.active ? 'Active' : 'Inactive'}{it.show_on_homepage ? ' · Homepage' : ''}</span>}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm font-semibold">
                {key === 'clients' && <div className="flex gap-1">
                  <button type="button" aria-label={`Move ${it.name} up`} className="rounded border px-2 py-1 disabled:opacity-40" disabled={index === 0} onClick={() => void moveClient(clientItems, index, -1)}>↑</button>
                  <button type="button" aria-label={`Move ${it.name} down`} className="rounded border px-2 py-1 disabled:opacity-40" disabled={index === clientItems.length - 1} onClick={() => void moveClient(clientItems, index, 1)}>↓</button>
                </div>}
                {key === 'services' && it.slug && <Link className="text-sea-700 underline" target="_blank" to={`/services/${it.slug}?preview=${it.id}`}>Preview</Link>}
                <button className="text-sea-700 underline" onClick={() => edit(it.id)}>Edit</button><button className="text-red-700 underline" onClick={() => del(it)}>Delete</button></div>
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
    <form onSubmit={save} className="card max-w-2xl space-y-4 p-6 md:p-8">
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
  return <form onSubmit={save} className="card max-w-2xl space-y-4 p-6 md:p-8">
    <div><h1 className="text-3xl font-bold">Client showcase settings</h1>
      <p className="mt-2 text-ink/70">Configure the homepage client logo section. Only active clients marked for homepage display appear.</p></div>
    {SHOWCASE_FIELDS.map((field) => <FieldInput key={field.name} f={field} value={values[field.name as keyof typeof SHOWCASE_DEFAULTS]} error={errs[field.name]} />)}
    {msg && <p role="status" className={Object.keys(errs).length ? 'font-semibold text-red-700' : 'font-semibold text-sea-700'}>{msg}</p>}
    <button className="btn-primary">Save showcase settings</button>
  </form>
}
