const cards = [
  { label: 'POS & Orders', d: 'M4 7h16M4 12h16M4 17h10', pos: 'left-0 top-[8%]' },
  { label: 'Inventory', d: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8', pos: 'right-0 top-[22%]' },
  { label: 'Insights', d: 'M5 19V11M12 19V5M19 19v-6', pos: 'left-[3%] top-[52%]' },
  { label: 'Automation', d: 'M20 12a8 8 0 1 1-3-6.2M20 4v5h-5', pos: 'right-[2%] top-[64%]' },
]

/** Brand scene in the style of the Sindbad banner: Arabic tagline, sailboat at sea, connected tools. */
export function DashboardPreview() {
  return (
    <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
      <p className="text-xs font-bold tracking-[0.4em] text-teal">SINDBAD SOLUTION</p>
      <h2 lang="ar" dir="rtl" className="mt-4 font-arabic text-5xl font-extrabold leading-[1.5] !text-white sm:text-6xl xl:text-7xl">
        نبحر بأعمالك نحو <span className="text-amber">آفاق رقمية</span> جديدة
      </h2>
      <p className="mt-2 text-lg text-white/75">We sail your business toward new digital horizons</p>

      <div className="relative mt-8 h-[22rem] w-full">
        <div className="absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,185,66,.38),rgba(244,185,66,0)_68%)]" />
        <svg viewBox="0 0 300 260" className="absolute left-1/2 top-0 h-full -translate-x-1/2" aria-hidden="true">
          <g stroke="rgba(130,210,225,.5)" strokeWidth="1.2" fill="none"><path d="M40 50L95 28L150 58M95 28L128 14M245 40L270 78"/></g>
          <g fill="#2EC4B6"><circle cx="40" cy="50" r="3"/><circle cx="95" cy="28" r="3"/><circle cx="150" cy="58" r="3"/><circle cx="128" cy="14" r="2.5"/><circle cx="245" cy="40" r="3"/><circle cx="270" cy="78" r="3"/></g>
          <circle cx="150" cy="130" r="82" fill="rgba(255,255,255,.08)"/>
          <path d="M148 62V190" stroke="#fff" strokeWidth="3.5"/>
          <path d="M142 70L92 178H142Z" fill="#2EC4B6"/>
          <path d="M156 86L212 178H156Z" fill="#F4B942"/>
          <path d="M72 184H228C220 208 198 216 150 216S80 208 72 184Z" fill="#F4F1EA"/>
        </svg>
        {cards.map((c) => (
          <div key={c.label} className={`absolute ${c.pos} flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 py-2.5 pl-2.5 pr-4 text-sm font-semibold text-white shadow-lg backdrop-blur`}>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal/20 text-teal"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={c.d} /></svg></span>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}
