import { FormEvent, useEffect, useState, createContext, useContext } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError, useApi } from '../../lib/api'
import { entities, Field, SECTION_LABELS } from '../../lib/schema'
import { ColorField, ImageField, RepeaterField, RichText, SectionsField } from '../../components/Editors'
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
    <div className="chart-grid grid min-h-screen place-items-center bg-navy-900 p-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-8 shadow-glow">
        <img src="/brand/logo.png" alt="Sindbad Solution" width={72} className="mx-auto rounded-full" />
        <h1 className="text-center text-2xl font-bold">Admin sign in</h1>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="field" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
        {err && <ErrorBox message={err} />}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="text-center text-xs text-ink/60">Forgot your password? A Super Admin can reset it under Team. Email recovery needs SMTP, which is not set up yet.</p>
      </form>
    </div>
  )
}

export function AdminLayout() {
  const { data, loading, reload } = useApi<{ user: User | null }>('/api/auth/me')
  const [menu, setMenu] = useState(false)
  if (loading) return <Spinner />
  if (!data?.user) return <Navigate to="/admin/login" replace />
  const user = data.user
  const logout = async () => { await api('/api/auth/logout', { method: 'POST' }); reload() }
  const link = 'block rounded-lg px-3 py-2 text-[0.92rem] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white'
  const active = ({ isActive }: { isActive: boolean }) => `${link} ${isActive ? '!bg-teal/15 !text-teal' : ''}`
  const G = ({ t, children }: { t: string; children: React.ReactNode }) => <div className="mt-5"><p className="mb-1.5 px-3 text-xs font-bold text-white/40">{t}</p>{children}</div>
  const isContent = can(user.role, 'content'); const isSales = can(user.role, 'sales')
  return (
    <Ctx.Provider value={{ user, logout }}>
      <div className="min-h-screen md:flex">
        <aside className="bg-navy-950 p-4 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:overflow-y-auto">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-display font-bold"><img src="/brand/logo.png" alt="" width={34} className="rounded-full" />Sindbad admin</Link>
            <button className="md:hidden" aria-expanded={menu} aria-label="Admin menu" onClick={() => setMenu(!menu)}><span className="rounded-lg border border-white/25 px-3 py-1 text-sm">Menu</span></button>
          </div>
          <nav aria-label="Admin" className={`${menu ? 'block' : 'hidden'} md:block`} onClick={() => setMenu(false)}>
            <G t="Overview"><NavLink end to="/admin" className={active}>Dashboard</NavLink></G>
            {isSales && <G t="Inbox"><NavLink to="/admin/leads" className={active}>Enquiries</NavLink><NavLink to="/admin/demos" className={active}>Demo requests</NavLink><NavLink to="/admin/applications" className={active}>Job applications</NavLink></G>}
            {isContent && <G t="Content">{entities.filter((e) => e.section === 'Content').map((e) => <NavLink key={e.key} to={`/admin/content/${e.key}`} className={active}>{e.title}</NavLink>)}</G>}
            {isContent && <G t="Website">{entities.filter((e) => e.section === 'Website').map((e) => <NavLink key={e.key} to={`/admin/content/${e.key}`} className={active}>{e.title}</NavLink>)}<NavLink to="/admin/settings" className={active}>Settings</NavLink></G>}
            {user.role === 'super_admin' && <G t="Team"><NavLink to="/admin/users" className={active}>Users and roles</NavLink><NavLink to="/admin/audit" className={active}>Audit log</NavLink></G>}
            <div className="mt-6 border-t border-white/10 pt-4 text-sm text-white/70">{user.name}<br /><span className="text-white/50">{STATUS_LABEL[user.role] ?? user.role}</span>
              <button onClick={logout} className="mt-2 block font-semibold text-amber">Sign out</button></div>
          </nav>
        </aside>
        <div className="min-w-0 flex-1 bg-cream p-5 md:p-8"><Outlet /></div>
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

function ParentSelect({ f, value }: { f: Field; value: any }) {
  const { data } = useApi<{ items: any[] }>('/api/admin/nav_items')
  const tops = (data?.items ?? []).filter((i) => i.group === 'header' && !i.parent)
  return <div><label className="label" htmlFor="f-parent">{f.label}</label>
    <select id="f-parent" name="parent" className="field" defaultValue={value ?? ''}><option value="">None (top level)</option>{tops.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}</select></div>
}

function FieldInput({ f, value, error }: { f: Field; value: any; error?: string }) {
  const id = `f-${f.name}`
  const common = { id, name: f.name, className: 'field', 'aria-invalid': !!error }
  if (f.type === 'repeater') return <RepeaterField name={f.name} label={f.label} keys={f.keys!} value={value} />
  if (f.type === 'color') return <ColorField name={f.name} label={f.label} value={value} fallback={f.help ?? '#2ec4b6'} />
  if (f.name === 'parent') return <ParentSelect f={f} value={value} />
  if (f.type === 'html') return <div><RichText name={f.name} value={value} label={f.label} />{error && <p className="text-sm text-red-700">{error}</p>}</div>
  if (f.type === 'image') return <ImageField name={f.name} value={value} label={f.label} />
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
        else if (fl.type === 'json' || fl.type === 'repeater') body[fl.name] = String(v ?? '').trim() ? JSON.parse(String(v)) : []
        else body[fl.name] = v
      }
    } catch { setErrs({ json: 'One of the JSON fields is not valid JSON' }); setMsg('Please fix the JSON field'); return }
    try {
      await api(`/api/admin/${key}${editing.id ? '/' + editing.id : ''}`, { method: editing.id ? 'PUT' : 'POST', body })
      setEditing(null); setMsg('Saved'); reload()
    } catch (x) { if (x instanceof ApiError) { setErrs(x.fields); setMsg(x.message) } }
  }
  async function del(item: any) {
    const warn = key === 'services' ? ' Pages that list it as a related service will simply stop showing it. Consider setting it to Unpublished instead.' : ''
    if (!window.confirm(`Delete "${item[e.titleField]}"? This cannot be undone.${warn}`)) return
    await api(`/api/admin/${key}/${item.id}`, { method: 'DELETE' }); setMsg('Deleted'); reload()
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
            {fs.map((f) => <FieldInput key={f.name} f={f} value={editing[f.name]} error={errs[f.name]} />)}
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

const T = (name: string, label: string, group: string, type: Field['type'] = 'text', extra: Partial<Field> = {}): Field => ({ name, label, type, group, ...extra })
const SETTINGS: Field[] = [
  T('company_name', 'Company name', 'Company'), T('tagline', 'Tagline', 'Company'), T('description', 'Company description', 'Company', 'textarea'),
  T('logo', 'Logo', 'Brand', 'image'), T('favicon', 'Favicon', 'Brand', 'image'), T('og_image', 'Default social sharing image', 'Brand', 'image'),
  T('brand_primary', 'Primary colour (buttons, highlights)', 'Brand', 'color', { help: '#2ec4b6' }), T('brand_accent', 'Accent colour (call-to-action buttons)', 'Brand', 'color', { help: '#f4b942' }),
  T('brand_dark', 'Dark colour (header, hero, footer)', 'Brand', 'color', { help: '#0a1b33' }),
  T('hero_title', 'Homepage headline', 'Homepage', 'text'), T('hero_text', 'Homepage supporting text', 'Homepage', 'textarea'),
  T('cta_label', 'Header button label', 'Homepage', 'text', { help: 'Default: Get a demo' }), T('cta_url', 'Header button link (e.g. /demo or /contact)', 'Homepage'),
  T('service_intro', 'Message shown on a service page that has no content yet', 'Homepage', 'textarea'),
  T('email', 'Business email', 'Contact'), T('phone', 'Phone', 'Contact'), T('whatsapp', 'WhatsApp number', 'Contact'), T('address', 'Address', 'Contact'), T('hours', 'Business hours', 'Contact'),
  T('currency', 'Default currency (e.g. USD)', 'Contact'),
  T('linkedin', 'LinkedIn URL', 'Social links', 'url'), T('facebook', 'Facebook URL', 'Social links', 'url'), T('instagram', 'Instagram URL', 'Social links', 'url'), T('x', 'X URL', 'Social links', 'url'),
  T('copyright', 'Copyright text', 'Footer and legal'), T('footer_note', 'Extra footer note', 'Footer and legal'), T('privacy_url', 'Privacy policy link', 'Footer and legal', 'url'), T('terms_url', 'Terms link', 'Footer and legal', 'url'),
  T('seo_title', 'Default SEO title', 'SEO and analytics'), T('seo_description', 'Default SEO description', 'SEO and analytics', 'textarea'), T('analytics_id', 'Google Analytics measurement ID (G-XXXXXXXX)', 'SEO and analytics'),
  T('email_provider', 'Email provider', 'Email', 'select', { options: ['none', 'smtp', 'sendgrid', 'mailgun', 'ses'], help: 'Passwords and API keys are never entered here. They go in server/.env. Sending is not connected yet.' }),
  T('email_from_name', 'Sender name', 'Email'), T('email_from', 'Sender address', 'Email'), T('notify_email', 'Send new-enquiry alerts to', 'Email'),
]
export function Settings() {
  const { data, loading } = useApi<{ settings: any }>('/api/settings?nocache=1')
  const [errs, setErrs] = useState<Record<string, string>>({}); const [msg, setMsg] = useState('')
  if (loading) return <Spinner />
  async function save(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault(); const f = new FormData(ev.currentTarget); setErrs({}); setMsg('')
    const body = Object.fromEntries(SETTINGS.map((s) => [s.name, f.get(s.name)]))
    try { await api('/api/admin/settings', { method: 'PUT', body }); setMsg('Settings saved. Reload the public site to see colour and logo changes.') } catch (x) { if (x instanceof ApiError) { setErrs(x.fields); setMsg(x.message) } }
  }
  const groups = Array.from(new Set(SETTINGS.map((s) => s.group!)))
  return (
    <form onSubmit={save} className="max-w-3xl space-y-5">
      <h1 className="text-3xl font-bold">Settings</h1>
      {groups.map((g) => (
        <fieldset key={g} className="space-y-4 rounded-2xl border border-navy-900/10 bg-white/70 p-5">
          <legend className="px-2 font-display font-bold">{g}</legend>
          {SETTINGS.filter((s) => s.group === g).map((f) => <FieldInput key={f.name} f={f} value={data?.settings?.[f.name]} error={errs[f.name]} />)}
        </fieldset>))}
      {msg && <p role="status" className="font-semibold">{msg}</p>}
      <div className="sticky bottom-0 bg-cream py-3"><button className="btn-primary">Save changes</button></div>
    </form>)
}

export function Users() {
  const { user } = useContext(Ctx)!
  const { data, loading, error, reload } = useApi<{ items: any[] }>('/api/admin/users')
  const [msg, setMsg] = useState(''); const [errs, setErrs] = useState<Record<string, string>>({}); const [adding, setAdding] = useState(false)
  async function patch(id: string, body: Record<string, unknown>, ok: string) {
    setMsg('')
    try { await api(`/api/admin/users/${id}`, { method: 'PUT', body }); setMsg(ok); reload() } catch (x) { setMsg(x instanceof ApiError ? x.message : 'Could not save') }
  }
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget).entries()); setErrs({}); setMsg('')
    try { await api('/api/admin/users', { method: 'POST', body: f }); setAdding(false); setMsg('User created'); reload() } catch (x) { if (x instanceof ApiError) { setErrs(x.fields); setMsg(x.message) } }
  }
  const roles = ['super_admin', 'content_manager', 'sales_manager']
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Users and roles</h1><button className="btn-primary" onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : 'Add user'}</button></div>
      <p className="mt-2 text-ink/70">Super admins manage everything. Content managers edit the website. Sales managers handle enquiries, demos and applications. Permissions are enforced on the server.</p>
      {msg && <p role="status" className="mt-3 font-semibold text-teal-700">{msg}</p>}
      {adding && (
        <form onSubmit={create} className="mt-5 grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-navy-900/10 sm:grid-cols-2">
          {(['name', 'email'] as const).map((n) => <div key={n}><label className="label" htmlFor={`u-${n}`}>{n === 'name' ? 'Full name' : 'Email'}</label><input id={`u-${n}`} name={n} type={n === 'email' ? 'email' : 'text'} required className="field" />{errs[n] && <p className="text-sm text-red-700">{errs[n]}</p>}</div>)}
          <div><label className="label" htmlFor="u-role">Role</label><select id="u-role" name="role" className="field" defaultValue="content_manager">{roles.map((r) => <option key={r} value={r}>{STATUS_LABEL[r]}</option>)}</select></div>
          <div><label className="label" htmlFor="u-pw">Temporary password (12+ characters)</label><input id="u-pw" name="password" type="password" minLength={12} required autoComplete="new-password" className="field" />{errs.password && <p className="text-sm text-red-700">{errs.password}</p>}</div>
          <div className="sm:col-span-2"><button className="btn-primary">Create user</button></div>
        </form>)}
      <div className="mt-5 overflow-x-auto rounded-2xl bg-white ring-1 ring-navy-900/10">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-900 text-white"><tr>{['Name', 'Role', 'Status', ''].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>{data!.items.map((u) => (
              <tr key={u.id} className="border-t border-navy-900/10">
                <td className="p-3"><b>{u.name}</b>{u.id === user.id && <span className="ml-2 text-xs text-ink/55">(you)</span>}<br /><span className="text-ink/60">{u.email}</span></td>
                <td className="p-3"><select aria-label={`Role for ${u.name}`} className="field !py-1.5" value={u.role} onChange={(e) => patch(u.id, { role: e.target.value }, 'Role updated')}>{roles.map((r) => <option key={r} value={r}>{STATUS_LABEL[r]}</option>)}</select></td>
                <td className="p-3"><Badge value={u.active ? 'published' : 'unpublished'} /></td>
                <td className="space-x-4 p-3 font-semibold">
                  <button className="text-teal-700 underline" onClick={() => patch(u.id, { active: !u.active }, u.active ? 'User deactivated' : 'User activated')}>{u.active ? 'Deactivate' : 'Activate'}</button>
                  <button className="text-teal-700 underline" onClick={() => { const pw = window.prompt(`New password for ${u.name} (12+ characters)`); if (pw) patch(u.id, { password: pw }, 'Password changed') }}>Reset password</button>
                </td>
              </tr>))}</tbody>
          </table>)}
      </div>
    </div>
  )
}

export function Audit() {
  const [page, setPage] = useState(1)
  const { data, loading, error } = useApi<any>(`/api/admin/audit?page=${page}`)
  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold">Audit log</h1><p className="mt-2 text-ink/70">Who changed what, and when. Sign-ins, content changes, exports and user changes are recorded.</p>
      <div className="mt-5 overflow-x-auto rounded-2xl bg-white ring-1 ring-navy-900/10">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : !data.items.length ? <Empty>No activity recorded yet.</Empty> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-900 text-white"><tr>{['When', 'User', 'Action', 'Item', 'IP'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>{data.items.map((r: any) => <tr key={r.id} className="border-t border-navy-900/10"><td className="p-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td><td className="p-3">{r.user_email}</td><td className="p-3">{r.action}</td><td className="p-3">{r.target}{r.target_id ? ` ${String(r.target_id).slice(-6)}` : ''}</td><td className="p-3">{r.ip}</td></tr>)}</tbody>
          </table>)}
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
