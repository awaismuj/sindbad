import { FormEvent, useEffect, useState, createContext, useContext } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError, useApi } from '../../lib/api'
import { entities, Field, SECTION_LABELS } from '../../lib/schema'
import { CategoryField, ImageField, ParentField, PairsField, RefsField, RichText, SectionsField, uploadImage } from '../../components/Editors'
import { ServiceView } from '../public/ServiceDetail'
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
        <p className="text-center text-xs text-ink/60">Forgot your password? A Super Admin can set a new one under Users.</p>
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
            {can(user.role, 'sales') && <><NavLink to="/admin/leads" className={active}>Enquiries</NavLink><NavLink to="/admin/demos" className={active}>Demo requests</NavLink><NavLink to="/admin/applications" className={active}>Job applications</NavLink></>}
            {can(user.role, 'content') && <>
              {entities.map((e) => <NavLink key={e.key} to={`/admin/content/${e.key}`} className={active}>{e.title}</NavLink>)}
              <NavLink to="/admin/media" className={active}>Media library</NavLink>
              <NavLink to="/admin/settings" className={active}>Settings</NavLink></>}
            {user.role === 'super_admin' && <><NavLink to="/admin/users" className={active}>Users</NavLink><NavLink to="/admin/audit" className={active}>Activity log</NavLink></>}
            <NavLink to="/admin/account" className={active}>My account</NavLink>
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
    ['Services published', data.published_services], ['Services in draft', data.draft_services], ['New job applications', data.applications],
    ['Products', data.products], ['Published products', data.published_products], ['Published articles', data.published_posts]]
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([l, v]) => <div key={l} className="rounded-xl bg-white p-5"><p className="text-sm text-ink/60">{l}</p><p className="font-display text-3xl font-bold">{v}</p></div>)}
      </div>
      <p className="mt-4 text-sm text-ink/70">{data.email_configured ? 'Email notifications are on: new enquiries are sent to your notification address.' : 'Email notifications are off. Set the SMTP_* values in server/.env to receive new enquiries by email; they are always saved here regardless.'}</p>
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

export function Leads({ kind }: { kind: 'leads' | 'demos' | 'applications' }) {
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
        <h1 className="text-3xl font-bold">{kind === 'leads' ? 'Enquiries' : kind === 'demos' ? 'Demo requests' : 'Job applications'}</h1>
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

const BRAND_DEFAULTS: Record<string, string> = { brand_navy: '#0B1F3A', brand_teal: '#2EC4B6', brand_amber: '#F4B942', brand_cream: '#F4F1EA' }
function ColorField({ name, value, label }: { name: string; value?: string; label: string }) {
  const [v, setV] = useState(value ?? '')
  return (
    <div>
      <label className="label" htmlFor={`f-${name}`}>{label}</label>
      <input type="hidden" name={name} value={v} />
      <div className="flex items-center gap-3">
        <input id={`f-${name}`} type="color" value={v || BRAND_DEFAULTS[name] || '#000000'} onChange={(e) => setV(e.target.value)} className="h-11 w-16 cursor-pointer rounded border border-navy-900/15 bg-white p-1" />
        <code className="text-sm">{v || `default (${BRAND_DEFAULTS[name]})`}</code>
        {v && <button type="button" className="text-sm font-semibold text-teal-700 underline" onClick={() => setV('')}>Use default</button>}
      </div>
    </div>
  )
}
function FieldInput({ f, value, error, ctx }: { f: Field; value: any; error?: string; ctx?: { id?: string; slug?: string } }) {
  const id = `f-${f.name}`
  const common = { id, name: f.name, className: 'field', 'aria-invalid': !!error }
  if (f.type === 'html') return <div><RichText name={f.name} value={value} label={f.label} />{error && <p className="text-sm text-red-700">{error}</p>}</div>
  if (f.type === 'image') return <ImageField name={f.name} value={value} label={f.label} />
  if (f.type === 'color') return <ColorField name={f.name} value={value} label={f.label} />
  if (f.type === 'pairs') return <div><PairsField name={f.name} value={value} cols={f.cols!} label={f.label} />{error && <p className="text-sm text-red-700">{error}</p>}</div>
  if (f.type === 'refs') return <RefsField name={f.name} value={value} source={f.source!} label={f.label} exclude={f.source === 'services' ? ctx?.slug : undefined} />
  if (f.type === 'category') return <CategoryField name={f.name} value={value} label={f.label} />
  if (f.type === 'parent') return <ParentField name={f.name} value={value} label={f.label} self={ctx?.id} />
  if (f.type === 'sections') return <div><span className="label">{f.label}</span><SectionsField name={f.name} value={value} order={Object.keys(SECTION_LABELS)} labels={SECTION_LABELS} />{f.help && <p className="text-xs text-ink/60">{f.help}</p>}</div>
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
  const sortable = e.fields.some((f) => f.name === 'order')
  useEffect(() => { setEditing(null); setMsg('') }, [key])
  async function edit(id?: string) { setErrs({}); setMsg(''); setEditing(id ? (await api(`/api/admin/${key}/${id}`)).item : {}) }
  async function save(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault(); const f = new FormData(ev.currentTarget); const body: Record<string, unknown> = {}
    try {
      for (const fl of e.fields) {
        const v = f.get(fl.name)
        if (fl.type === 'bool') body[fl.name] = f.get(fl.name) === 'on'
        else if (fl.type === 'sections') body[fl.name] = String(v ?? '').split(',').filter(Boolean)
        else if (fl.type === 'list') body[fl.name] = String(v ?? '').split('\n').map((x) => x.trim()).filter(Boolean)
        else if (fl.type === 'refs') body[fl.name] = f.getAll(fl.name).map(String)
        else if (fl.type === 'json' || fl.type === 'pairs') body[fl.name] = String(v ?? '').trim() ? JSON.parse(String(v)) : []
        else body[fl.name] = v
      }
    } catch { setErrs({ json: 'One of the JSON fields is not valid JSON' }); setMsg('Please fix the JSON field'); return }
    try {
      await api(`/api/admin/${key}${editing.id ? '/' + editing.id : ''}`, { method: editing.id ? 'PUT' : 'POST', body })
      setEditing(null); setMsg('Saved'); reload()
    } catch (x) { if (x instanceof ApiError) { setErrs(x.fields); setMsg(x.message) } }
  }
  async function del(item: any) {
    const warn = ['services', 'products', 'industries'].includes(key!) ? ' It will also be removed from "related" lists and any menu link to it will be switched off. Consider setting it to Unpublished instead.' : ''
    if (!window.confirm(`Delete "${item[e.titleField]}"? This cannot be undone.${warn}`)) return
    try { const r = await api(`/api/admin/${key}/${item.id}`, { method: 'DELETE' }); setMsg(r.note ? `Deleted. ${r.note}.` : 'Deleted'); reload() }
    catch (x) { setMsg(x instanceof ApiError ? x.message : 'Could not delete') }
  }
  async function move(i: number, d: number) {
    const items = [...data!.items]; const j = i + d; if (j < 0 || j >= items.length) return
    ;[items[i], items[j]] = [items[j], items[i]]
    await Promise.all(items.map((it, idx) => it.order === idx ? null : api(`/api/admin/${key}/${it.id}`, { method: 'PUT', body: { order: idx } })))
    reload()
  }
  if (editing) {
    const groups: [string, Field[]][] = []
    for (const f of e.fields) { const g = f.group ?? ''; const last = groups[groups.length - 1]; if (last && last[0] === g) last[1].push(f); else groups.push([g, [f]]) }
    return (
      <form onSubmit={save} className="max-w-3xl space-y-4">
        <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">{editing.id ? 'Edit' : 'New'} {e.title.toLowerCase()}</h1>
          {editing.id && key === 'services' && <Link className="btn-outline !py-2" target="_blank" to={`/admin/preview/${editing.id}`}>Preview page</Link>}</div>
        {groups.map(([g, fs]) => (
          <fieldset key={g + fs[0].name} className="space-y-4 rounded-2xl border border-navy-900/10 bg-white/60 p-5">
            {g && <legend className="px-2 font-display font-bold">{g}</legend>}
            {fs.map((f) => <FieldInput key={f.name} f={f} value={editing[f.name]} error={errs[f.name]} ctx={{ id: editing.id, slug: editing.slug }} />)}
          </fieldset>))}
        {msg && <ErrorBox message={msg} />}
        <div className="sticky bottom-0 flex gap-3 bg-cream py-3"><button className="btn-primary">Save changes</button><button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button></div>
      </form>)
  }
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">{e.title}</h1><button className="btn-primary" onClick={() => edit()}>Add new</button></div>
      {msg && <p role="status" className="mt-3 font-semibold text-teal-700">{msg}</p>}
      <div className="mt-5 rounded-xl bg-white">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : !data!.items.length ? <Empty>Nothing here yet. Use "Add new" to create the first one.</Empty> : (
          <ul className="divide-y">{data!.items.map((it, i) => (
            <li key={it.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><b>{it[e.titleField]}</b> {e.badge && it[e.badge] && <Badge value={it[e.badge]} />}
                {'published' in it && <span className={`ml-2 text-xs font-semibold ${it.published ? 'text-teal-700' : 'text-ink/50'}`}>{it.published ? 'Published' : 'Unpublished'}</span>}
                {key === 'nav_items' && <span className="ml-2 text-xs text-ink/60">{it.group} · {it.url}</span>}</div>
              <div className="flex items-center gap-4 text-sm font-semibold">
                {sortable && <><button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>▲</button><button aria-label="Move down" disabled={i === data!.items.length - 1} onClick={() => move(i, 1)}>▼</button></>}
                {key === 'services' && <Link className="text-teal-700 underline" target="_blank" to={`/admin/preview/${it.id}`}>Preview</Link>}
                <button className="text-teal-700 underline" onClick={() => edit(it.id)}>Edit</button><button className="text-red-700 underline" onClick={() => del(it)}>Delete</button></div>
            </li>))}</ul>)}
      </div>
    </div>
  )
}

/** Draft preview of a service exactly as the public page renders it (admin only). */
export function ServicePreview() {
  const { id } = useParams()
  const { data, loading, error } = useApi<{ item: any }>(`/api/admin/services/${id}`)
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />
  return <div className="-m-6"><div className="bg-amber px-5 py-2 text-center font-semibold text-navy-950">Preview. Status: {STATUS_LABEL[data!.item.status] ?? data!.item.status}. Only signed-in admins can see this.</div><ServiceView item={data!.item} preview /></div>
}

const SETTINGS: [string, Field[]][] = [
  ['Company', [
    { name: 'company_name', label: 'Company name', type: 'text' }, { name: 'tagline', label: 'Tagline', type: 'text' },
    { name: 'description', label: 'Company description', type: 'textarea' }, { name: 'logo', label: 'Logo', type: 'image' }, { name: 'favicon', label: 'Favicon (square PNG)', type: 'image' },
  ]],
  ['Homepage and service pages', [
    { name: 'hero_title', label: 'Homepage headline', type: 'text' }, { name: 'hero_text', label: 'Homepage supporting text', type: 'textarea' },
    { name: 'service_intro', label: 'Message shown on a service page that has no description yet', type: 'textarea' },
  ]],
  ['Contact details', [
    { name: 'email', label: 'Business email', type: 'text' }, { name: 'phone', label: 'Phone', type: 'text' }, { name: 'whatsapp', label: 'WhatsApp number', type: 'text' },
    { name: 'address', label: 'Address', type: 'text' }, { name: 'hours', label: 'Business hours', type: 'text' }, { name: 'currency', label: 'Default currency (e.g. USD)', type: 'text' },
  ]],
  ['Social media and footer', [
    { name: 'linkedin', label: 'LinkedIn URL', type: 'url' }, { name: 'facebook', label: 'Facebook URL', type: 'url' }, { name: 'instagram', label: 'Instagram URL', type: 'url' }, { name: 'x', label: 'X URL', type: 'url' },
    { name: 'copyright', label: 'Copyright text', type: 'text' }, { name: 'privacy_url', label: 'Privacy policy link', type: 'url' }, { name: 'terms_url', label: 'Terms link', type: 'url' },
  ]],
  ['Brand colours', [
    { name: 'brand_navy', label: 'Main dark colour (header, hero, footer)', type: 'color' }, { name: 'brand_teal', label: 'Accent colour (buttons, links)', type: 'color' },
    { name: 'brand_amber', label: 'Highlight colour', type: 'color' }, { name: 'brand_cream', label: 'Page background', type: 'color' },
  ]],
  ['SEO and analytics', [
    { name: 'seo_title', label: 'Default SEO title', type: 'text' }, { name: 'seo_description', label: 'Default SEO description', type: 'textarea' },
    { name: 'og_image', label: 'Default social sharing image', type: 'image' }, { name: 'analytics_id', label: 'Google Analytics measurement ID (G-XXXXXXX)', type: 'text' },
  ]],
  ['Email notifications', [
    { name: 'notify_email', label: 'Send new enquiries, demo requests and applications to', type: 'text', help: 'The mail server login stays in server/.env (SMTP_*), never here.' },
    { name: 'email_from_name', label: 'Sender name on those emails', type: 'text' },
  ]],
]
const SETTINGS_FLAT = SETTINGS.flatMap(([, fs]) => fs)
export function Settings() {
  const { data, loading } = useApi<{ settings: any }>('/api/settings')
  const [errs, setErrs] = useState<Record<string, string>>({}); const [msg, setMsg] = useState('')
  if (loading) return <Spinner />
  async function save(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault(); const f = new FormData(ev.currentTarget); setErrs({}); setMsg('')
    const body = Object.fromEntries(SETTINGS_FLAT.map((s) => [s.name, f.get(s.name)]))
    try { await api('/api/admin/settings', { method: 'PUT', body }); setMsg('Settings saved') } catch (x) { if (x instanceof ApiError) { setErrs(x.fields); setMsg(x.message) } }
  }
  return (
    <form onSubmit={save} className="max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      {SETTINGS.map(([g, fs]) => (
        <fieldset key={g} className="space-y-4 rounded-2xl border border-navy-900/10 bg-white/60 p-5"><legend className="px-2 font-display font-bold">{g}</legend>
          {fs.map((f) => <FieldInput key={f.name} f={f} value={data?.settings?.[f.name]} error={errs[f.name]} />)}</fieldset>))}
      {msg && <p role="status" className="font-semibold">{msg}</p>}
      <div className="sticky bottom-0 bg-cream py-3"><button className="btn-primary">Save changes</button></div>
    </form>)
}

const ROLE_LABEL: Record<string, string> = { super_admin: 'Super Admin (everything)', content_manager: 'Content manager (website content)', sales_manager: 'Sales manager (enquiries, demos, applications)' }
export function Users() {
  const { data, loading, error, reload } = useApi<{ items: any[] }>('/api/admin/users')
  const [edit, setEdit] = useState<any | null>(null); const [msg, setMsg] = useState(''); const [errs, setErrs] = useState<Record<string, string>>({})
  async function save(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault(); const f = new FormData(ev.currentTarget); setErrs({}); setMsg('')
    const body: Record<string, unknown> = { name: f.get('name'), role: f.get('role') }
    if (edit.id) body.active = f.get('active') === 'on'; else body.email = f.get('email')
    if (String(f.get('password') ?? '')) body.password = f.get('password')
    try { await api(`/api/admin/users${edit.id ? '/' + edit.id : ''}`, { method: edit.id ? 'PUT' : 'POST', body }); setEdit(null); setMsg('Saved'); reload() }
    catch (x) { if (x instanceof ApiError) { setErrs(x.fields); setMsg(x.message) } }
  }
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Users</h1><button className="btn-primary" onClick={() => { setEdit({ role: 'content_manager', active: true }); setErrs({}); setMsg('') }}>Add user</button></div>
      {msg && !edit && <p role="status" className="mt-3 font-semibold text-teal-700">{msg}</p>}
      <div className="mt-5 rounded-xl bg-white">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : (
          <ul className="divide-y">{data!.items.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><b>{u.name}</b> <span className="text-ink/60">{u.email}</span><br /><span className="text-sm">{ROLE_LABEL[u.role] ?? u.role}</span>
                {u.active === false && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Deactivated</span>}</div>
              <button className="text-sm font-semibold text-teal-700 underline" onClick={() => { setEdit(u); setErrs({}); setMsg('') }}>Edit or reset password</button>
            </li>))}</ul>)}
      </div>
      {edit && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="text-xl font-bold">{edit.id ? 'Edit user' : 'Add user'}</h2>
            <div><label className="label" htmlFor="u-name">Name</label><input id="u-name" name="name" required defaultValue={edit.name ?? ''} className="field" />{errs.name && <p className="text-sm text-red-700">{errs.name}</p>}</div>
            {!edit.id && <div><label className="label" htmlFor="u-email">Email</label><input id="u-email" name="email" type="email" required className="field" />{errs.email && <p className="text-sm text-red-700">{errs.email}</p>}</div>}
            <div><label className="label" htmlFor="u-role">Role</label><select id="u-role" name="role" defaultValue={edit.role} className="field">{Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="label" htmlFor="u-pw">{edit.id ? 'New password (leave empty to keep the current one)' : 'Password (at least 12 characters)'}</label>
              <input id="u-pw" name="password" type="password" minLength={12} required={!edit.id} autoComplete="new-password" className="field" />{errs.password && <p className="text-sm text-red-700">{errs.password}</p>}</div>
            {edit.id && <label className="flex items-center gap-2 font-semibold"><input type="checkbox" name="active" defaultChecked={edit.active !== false} />Account is active</label>}
            {msg && <ErrorBox message={msg} />}
            <div className="flex gap-3"><button className="btn-primary">Save</button><button type="button" className="btn-outline" onClick={() => setEdit(null)}>Cancel</button></div>
          </form>
        </div>)}
    </div>
  )
}

export function AuditLog() {
  const [page, setPage] = useState(1); const [target, setTarget] = useState('')
  const { data, loading, error } = useApi<any>(`/api/admin/audit?page=${page}&target=${encodeURIComponent(target)}`)
  useEffect(() => setPage(1), [target])
  return (
    <div>
      <h1 className="text-3xl font-bold">Activity log</h1>
      <p className="mt-1 text-sm text-ink/70">Who changed what, newest first. Passwords and content text are never stored here.</p>
      <select aria-label="Filter by area" className="field mt-4 max-w-[220px]" value={target} onChange={(e) => setTarget(e.target.value)}>
        <option value="">All areas</option>{['services', 'products', 'industries', 'posts', 'pages', 'nav_items', 'plans', 'portfolio', 'jobs', 'settings', 'users', 'media', 'leads', 'demos', 'applications'].map((t) => <option key={t}>{t}</option>)}
      </select>
      <div className="mt-4 overflow-x-auto rounded-xl bg-white">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : !data.items.length ? <Empty>No activity recorded yet.</Empty> : (
          <table className="w-full text-left text-sm"><thead className="bg-navy-900 text-white"><tr>{['When', 'Who', 'Action', 'Area', 'Record'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>{data.items.map((r: any) => <tr key={r.id} className="border-t"><td className="p-3">{new Date(r.created_at).toLocaleString()}</td><td className="p-3">{r.user_email}</td><td className="p-3">{r.action}</td><td className="p-3">{r.target}</td><td className="p-3 font-mono text-xs">{r.target_id}</td></tr>)}</tbody></table>)}
      </div>
      {data && data.total > data.per && (
        <div className="mt-4 flex items-center gap-3">
          <button className="btn-outline !py-1.5" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {Math.ceil(data.total / data.per)}</span>
          <button className="btn-outline !py-1.5" disabled={page * data.per >= data.total} onClick={() => setPage(page + 1)}>Next</button>
        </div>)}
    </div>
  )
}

export function MediaLibrary() {
  const [page, setPage] = useState(1); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const { data, loading, error, reload } = useApi<any>(`/api/admin/media?page=${page}`)
  async function add(f?: File) { if (!f) return; setBusy(true); setMsg(''); try { await uploadImage(f); reload() } catch (x) { setMsg(x instanceof Error ? x.message : 'Upload failed') } finally { setBusy(false) } }
  async function copy(url: string) { try { await navigator.clipboard.writeText(window.location.origin + url); setMsg('Address copied') } catch { setMsg(window.location.origin + url) } }
  async function del(m: any) {
    if (!window.confirm('Delete this image? This cannot be undone.')) return
    try { await api(`/api/admin/media/${m.id}`, { method: 'DELETE' }); setMsg('Deleted'); reload() }
    catch (x) {
      if (x instanceof ApiError && x.status === 409 && window.confirm(`${x.message}\n\nDelete it anyway? Those places will show a broken image.`)) { await api(`/api/admin/media/${m.id}?force=1`, { method: 'DELETE' }); setMsg('Deleted'); reload() }
      else setMsg(x instanceof ApiError && x.status !== 409 ? x.message : '')
    }
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Media library</h1>
        <label className="btn-primary cursor-pointer">{busy ? 'Uploading…' : 'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => add(e.target.files?.[0])} /></label></div>
      <p className="mt-1 text-sm text-ink/70">JPG, PNG, WebP or GIF up to 3 MB. Use "Copy address" to paste an image into a description, or upload straight from any image field.</p>
      {msg && <p role="status" className="mt-3 font-semibold text-teal-700">{msg}</p>}
      {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : !data.items.length ? <div className="mt-5"><Empty>No images uploaded yet.</Empty></div> : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">{data.items.map((m: any) => (
          <li key={m.id} className="overflow-hidden rounded-xl bg-white">
            <img src={m.url} alt="" loading="lazy" className="h-36 w-full object-cover" />
            <div className="p-3 text-xs"><p className="text-ink/60">{new Date(m.created_at).toLocaleDateString()} · {Math.round(m.size / 1024)} KB</p>
              <div className="mt-2 flex gap-4 text-sm font-semibold"><button className="text-teal-700 underline" onClick={() => copy(m.url)}>Copy address</button><button className="text-red-700 underline" onClick={() => del(m)}>Delete</button></div></div>
          </li>))}</ul>)}
      {data && data.total > data.per && (
        <div className="mt-5 flex items-center gap-3">
          <button className="btn-outline !py-1.5" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {Math.ceil(data.total / data.per)}</span>
          <button className="btn-outline !py-1.5" disabled={page * data.per >= data.total} onClick={() => setPage(page + 1)}>Next</button>
        </div>)}
    </div>
  )
}

export function Account() {
  const ctx = useContext(Ctx)!; const [errs, setErrs] = useState<Record<string, string>>({}); const [msg, setMsg] = useState(''); const [ok, setOk] = useState(false)
  async function save(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault(); const form = ev.currentTarget; const f = new FormData(form); setErrs({}); setMsg(''); setOk(false)
    if (f.get('password') !== f.get('again')) { setErrs({ again: 'The two passwords do not match' }); return }
    try { await api('/api/auth/password', { method: 'POST', body: { current: f.get('current'), password: f.get('password') } }); setOk(true); setMsg('Password changed'); form.reset() }
    catch (x) { if (x instanceof ApiError) { setErrs(x.fields); setMsg(x.message) } }
  }
  const row = (n: string, l: string, auto: string) => <div><label className="label" htmlFor={`a-${n}`}>{l}</label><input id={`a-${n}`} name={n} type="password" required minLength={n === 'current' ? undefined : 12} autoComplete={auto} className="field" />{errs[n] && <p className="text-sm text-red-700">{errs[n]}</p>}</div>
  return (
    <form onSubmit={save} className="max-w-md space-y-4">
      <h1 className="text-3xl font-bold">My account</h1>
      <p>{ctx.user.name} · {ctx.user.email} · {STATUS_LABEL[ctx.user.role] ?? ROLE_LABEL[ctx.user.role] ?? ctx.user.role}</p>
      <h2 className="text-xl font-bold">Change password</h2>
      {row('current', 'Current password', 'current-password')}{row('password', 'New password (at least 12 characters)', 'new-password')}{row('again', 'New password again', 'new-password')}
      {msg && (ok ? <p role="status" className="font-semibold text-teal-700">{msg}</p> : <ErrorBox message={msg} />)}
      <button className="btn-primary">Change password</button>
    </form>
  )
}
