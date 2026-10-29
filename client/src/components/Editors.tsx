import { useRef, useState } from 'react'
import { ApiError } from '../lib/api'
import type { RepKey } from '../lib/schema'

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData(); fd.append('file', file)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'same-origin', headers: { 'X-Requested-With': 'sindbad' } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || 'Upload failed', res.status)
  return data.url
}

export function ImageField({ name, value, label }: { name: string; value?: string; label: string }) {
  const [url, setUrl] = useState(value ?? ''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  async function pick(f?: File) {
    if (!f) return; setBusy(true); setMsg('')
    try { setUrl(await uploadImage(f)) } catch (e) { setMsg(e instanceof Error ? e.message : 'Upload failed') } finally { setBusy(false) }
  }
  return (
    <div>
      <label className="label" htmlFor={`img-${name}`}>{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-center gap-3">
        {url && <img src={url} alt="" className="h-16 w-24 rounded-lg object-cover" />}
        <input id={`img-${name}`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => pick(e.target.files?.[0])} />
        {url && <button type="button" className="text-sm font-semibold text-red-700 underline" onClick={() => setUrl('')}>Remove</button>}
        {busy && <span className="text-sm">Uploading…</span>}
      </div>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="or paste an image address" className="field mt-2" aria-label={`${label} address`} />
      {msg && <p className="mt-1 text-sm text-red-700">{msg}</p>}
    </div>
  )
}

/** Rich text: bold, italic, headings, lists, links, images, tables. Output is sanitised again on the server before saving. */
export function RichText({ name, value, label }: { name: string; value?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null); const hidden = useRef<HTMLInputElement>(null); const [msg, setMsg] = useState('')
  const sync = () => { if (hidden.current && ref.current) hidden.current.value = ref.current.innerHTML }
  const cmd = (c: string, arg?: string) => { ref.current?.focus(); document.execCommand(c, false, arg); sync() }
  const link = () => { const u = window.prompt('Link address (https://… or /page)'); if (u) cmd('createLink', u) }
  const table = () => cmd('insertHTML', '<table><tbody><tr><th>Heading</th><th>Heading</th></tr><tr><td>Cell</td><td>Cell</td></tr></tbody></table><p></p>')
  async function img(f?: File) { if (!f) return; try { cmd('insertImage', await uploadImage(f)) } catch (e) { setMsg(e instanceof Error ? e.message : 'Upload failed') } }
  const B = ({ t, on }: { t: string; on: () => void }) => <button type="button" onClick={on} className="rounded px-2.5 py-1 text-sm font-semibold hover:bg-navy-900 hover:text-white">{t}</button>
  return (
    <div>
      <span className="label" id={`l-${name}`}>{label}</span>
      <input ref={hidden} type="hidden" name={name} defaultValue={value ?? ''} />
      <div className="rounded-xl border border-navy-900/15 bg-white">
        <div className="flex flex-wrap gap-1 border-b border-navy-900/10 p-2">
          <B t="Bold" on={() => cmd('bold')} /><B t="Italic" on={() => cmd('italic')} />
          <B t="Heading" on={() => cmd('formatBlock', 'h2')} /><B t="Subheading" on={() => cmd('formatBlock', 'h3')} /><B t="Paragraph" on={() => cmd('formatBlock', 'p')} />
          <B t="Bullets" on={() => cmd('insertUnorderedList')} /><B t="Numbers" on={() => cmd('insertOrderedList')} />
          <B t="Link" on={link} /><B t="Table" on={table} />
          <label className="cursor-pointer rounded px-2.5 py-1 text-sm font-semibold hover:bg-navy-900 hover:text-white">Image<input type="file" accept="image/*" className="hidden" onChange={(e) => img(e.target.files?.[0])} /></label>
        </div>
        <div ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-multiline aria-labelledby={`l-${name}`} onInput={sync} onBlur={sync}
          className="prose-sindbad min-h-[180px] p-4 !text-base" dangerouslySetInnerHTML={{ __html: value ?? '' }} />
      </div>
      {msg && <p className="mt-1 text-sm text-red-700">{msg}</p>}
    </div>
  )
}

export function SectionsField({ name, value, order, labels }: { name: string; value?: string[]; order: string[]; labels: Record<string, string> }) {
  const initial = value?.length ? [...value, ...order.filter((k) => !value.includes(k))] : order
  const [list, setList] = useState(initial); const [on, setOn] = useState(new Set(value?.length ? value : order))
  const move = (i: number, d: number) => { const l = [...list]; const j = i + d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; setList(l) }
  const chosen = list.filter((k) => on.has(k))
  return (
    <div>
      <input type="hidden" name={name} value={chosen.join(',')} />
      <ul className="divide-y rounded-xl border border-navy-900/15 bg-white">
        {list.map((k, i) => (
          <li key={k} className="flex items-center gap-3 p-2.5">
            <input type="checkbox" id={`s-${k}`} checked={on.has(k)} onChange={() => { const n = new Set(on); n.has(k) ? n.delete(k) : n.add(k); setOn(n) }} />
            <label htmlFor={`s-${k}`} className="flex-1 font-semibold">{labels[k] ?? k}</label>
            <button type="button" aria-label={`Move ${labels[k]} up`} onClick={() => move(i, -1)} className="px-2">▲</button>
            <button type="button" aria-label={`Move ${labels[k]} down`} onClick={() => move(i, 1)} className="px-2">▼</button>
          </li>))}
      </ul>
    </div>
  )
}

/** Add / remove / reorder rows of text fields (FAQs, process steps, content blocks). Saved as JSON in a hidden input. */
export function RepeaterField({ name, label, keys, value }: { name: string; label: string; keys: RepKey[]; value?: Record<string, string>[] }) {
  const [rows, setRows] = useState<Record<string, string>[]>(value?.length ? value.map((r) => ({ ...r })) : [])
  const set = (i: number, k: string, v: string) => setRows(rows.map((r, n) => (n === i ? { ...r, [k]: v } : r)))
  const move = (i: number, d: number) => { const l = [...rows]; const j = i + d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; setRows(l) }
  const clean = rows.filter((r) => keys.some((k) => (r[k.k] ?? '').trim()))
  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(clean)} />
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={i} className="space-y-2 rounded-xl border border-navy-900/15 bg-white p-3">
            {keys.map((k) => k.area
              ? <textarea key={k.k} aria-label={k.label} placeholder={k.label} rows={3} className="field" value={r[k.k] ?? ''} onChange={(e) => set(i, k.k, e.target.value)} />
              : <input key={k.k} aria-label={k.label} placeholder={k.label} className="field" value={r[k.k] ?? ''} onChange={(e) => set(i, k.k, e.target.value)} />)}
            <div className="flex gap-4 text-sm font-semibold">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">Move up</button>
              <button type="button" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label="Move down">Move down</button>
              <button type="button" className="text-red-700" onClick={() => setRows(rows.filter((_, n) => n !== i))}>Remove</button>
            </div>
          </li>))}
      </ul>
      <button type="button" className="btn-outline mt-3 !py-2" onClick={() => setRows([...rows, {}])}>Add {rows.length ? 'another' : 'one'}</button>
    </div>
  )
}

/** Colour picker with a hex box; empty means "use the default brand colour". */
export function ColorField({ name, label, value, fallback }: { name: string; label: string; value?: string; fallback: string }) {
  const [v, setV] = useState(value ?? '')
  return (
    <div>
      <label className="label" htmlFor={`c-${name}`}>{label}</label>
      <input type="hidden" name={name} value={v} />
      <div className="flex items-center gap-3">
        <input id={`c-${name}`} type="color" value={/^#[0-9a-f]{6}$/i.test(v) ? v : fallback} onChange={(e) => setV(e.target.value)} className="h-11 w-16 cursor-pointer rounded-lg border border-navy-900/15 bg-white p-1" />
        <input aria-label={`${label} hex value`} className="field max-w-[9rem]" placeholder={fallback} value={v} onChange={(e) => setV(e.target.value)} />
        {v && <button type="button" className="text-sm font-semibold text-teal-700 underline" onClick={() => setV('')}>Use default</button>}
      </div>
    </div>
  )
}
