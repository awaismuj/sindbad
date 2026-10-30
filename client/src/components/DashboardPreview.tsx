/** Illustrative mock only — not a real product screenshot. Labelled as such on the page. */
export function DashboardPreview() {
  const bars = [38, 52, 44, 70, 58, 86, 74]
  return (
    <figure className="relative">
      <div className="rounded-2xl border border-white/15 bg-navy-800 p-4 shadow-2xl">
        <div className="mb-3 flex gap-1.5">{['rgb(var(--amber))', 'rgb(var(--teal))', 'rgb(var(--cream))'].map((c) => <i key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}</div>
        <div className="grid grid-cols-3 gap-3">
          {[['Orders today', '—'], ['Low stock items', '—'], ['Open enquiries', '—']].map(([l, v]) => (
            <div key={l} className="rounded-lg bg-navy-700 p-3"><p className="text-xs text-white/60">{l}</p><p className="font-display text-xl text-white">{v}</p></div>
          ))}
        </div>
        <div className="mt-3 flex h-36 items-end gap-2 rounded-lg bg-navy-700 p-3" aria-hidden>
          {bars.map((h, i) => <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 5 ? 'rgb(var(--amber))' : 'rgb(var(--teal))' }} />)}
        </div>
      </div>
      <figcaption className="mt-2 text-xs text-white/60">Illustrative layout, not a live product screenshot.</figcaption>
    </figure>
  )
}
