const nodes = [
  { id: 'orders', label: 'Orders & POS', detail: 'Sales workflows', cls: 'left-0 top-[6%]', icon: 'M4 7h16M4 12h16M4 17h10' },
  { id: 'inventory', label: 'Inventory', detail: 'Stock operations', cls: 'right-0 top-[6%]', icon: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8' },
  { id: 'insights', label: 'Insights', detail: 'Business visibility', cls: 'left-0 bottom-[6%]', icon: 'M5 19V11M12 19V5M19 19v-6' },
  { id: 'automation', label: 'Automation', detail: 'Connected processes', cls: 'right-0 bottom-[6%]', icon: 'M20 12a8 8 0 1 1-3-6.2M20 4v5h-5' },
]

/** Conceptual illustration of connected business tools. It shows no product metrics. */
export function DashboardPreview() {
  return (
    <div className="relative mx-auto aspect-[1/1.02] w-full max-w-[34rem]" role="img" aria-label="Illustration: orders, inventory, insights and automation connected around your business">
      <svg className="route absolute inset-0 h-full w-full" viewBox="0 0 500 510" fill="none" aria-hidden="true">
        <circle cx="250" cy="255" r="205" stroke="rgba(255,255,255,.14)" />
        <circle cx="250" cy="255" r="140" stroke="rgba(255,255,255,.1)" strokeDasharray="2 7" />
        <path d="M120 86C190 86 200 190 215 225M380 86C310 86 300 190 285 225M120 424C190 424 200 320 215 285M380 424C310 424 300 320 285 285" stroke="#7FE3D9" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {nodes.map((n) => (
        <div key={n.id} className={`absolute ${n.cls} flex w-[44%] items-center gap-3 rounded-2xl border border-white/20 bg-white p-3 text-navy-900 shadow-[0_18px_40px_-16px_rgba(5,20,60,.6)]`}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sea-50 text-sea-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.icon} /></svg>
          </span>
          <span className="min-w-0"><b className="block truncate text-sm">{n.label}</b><small className="block truncate text-xs text-ink/60">{n.detail}</small></span>
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2 grid h-40 w-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-center shadow-[0_0_0_12px_rgba(255,255,255,.12),0_30px_60px_-20px_rgba(5,20,60,.7)]">
        <div>
          <img src="/brand/logo.png" alt="" width={52} height={52} className="mx-auto rounded-full" />
          <b className="mt-1.5 block font-display text-sm text-navy-900">Your business</b>
          <small className="block text-[11px] text-ink/60">Connected, in sync</small>
        </div>
      </div>
    </div>
  )
}
