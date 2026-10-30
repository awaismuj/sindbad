const cards = [
  { label: 'POS & Orders', d: 'M4 7h16M4 12h16M4 17h10', pos: 'left-0 top-[4%]' },
  { label: 'Inventory', d: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8', pos: 'right-0 top-[14%]' },
  { label: 'Insights', d: 'M5 19V11M12 19V5M19 19v-6', pos: 'left-[2%] top-[56%]' },
  { label: 'Automation', d: 'M20 12a8 8 0 1 1-3-6.2M20 4v5h-5', pos: 'right-[2%] top-[62%]' },
]

/** Arabic tagline in the style of the Sindbad banner. */
export function HeroArabic() {
  return (
    <div className="text-center lg:text-right">
      <p className="text-xs font-bold tracking-[0.4em] text-teal">SINDBAD SOLUTION</p>
      <h2 lang="ar" dir="rtl" className="mt-3 font-arabic text-5xl font-extrabold leading-[1.55] !text-white sm:text-6xl xl:text-7xl">
        نبحر بأعمالك نحو <span className="text-amber">آفاق رقمية</span> جديدة
      </h2>
      <p className="mt-1 text-lg text-white/75">We sail your business toward new digital horizons</p>
    </div>
  )
}

/** Sailboat at sea with connected tools around it. */
export function HeroScene() {
  return (
    <div className="relative mx-auto h-[15rem] w-full max-w-md sm:h-[17rem]" role="img" aria-label="Sailboat surrounded by POS, inventory, insights and automation">
      <div className="absolute left-1/2 top-[10%] h-56 w-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,185,66,.35),rgba(244,185,66,0)_68%)]" />
      <svg viewBox="0 0 300 240" className="absolute left-1/2 top-0 h-full -translate-x-1/2" aria-hidden="true">
        <g stroke="rgba(130,210,225,.5)" strokeWidth="1.2" fill="none"><path d="M40 40L95 20L150 48M95 20L128 8M245 34L270 70"/></g>
        <g fill="#2EC4B6"><circle cx="40" cy="40" r="3"/><circle cx="95" cy="20" r="3"/><circle cx="150" cy="48" r="3"/><circle cx="128" cy="8" r="2.5"/><circle cx="245" cy="34" r="3"/><circle cx="270" cy="70" r="3"/></g>
        <circle cx="150" cy="115" r="76" fill="rgba(255,255,255,.08)"/>
        <path d="M148 52V172" stroke="#fff" strokeWidth="3.5"/>
        <path d="M142 60L96 162H142Z" fill="#2EC4B6"/>
        <path d="M156 76L206 162H156Z" fill="#F4B942"/>
        <path d="M78 168H222C214 190 194 198 150 198S86 190 78 168Z" fill="#F4F1EA"/>
      </svg>
      {cards.map((c) => (
        <div key={c.label} className={`absolute ${c.pos} flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 py-2 pl-2 pr-3.5 text-sm font-semibold text-white shadow-lg backdrop-blur`}>
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal/20 text-teal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={c.d} /></svg></span>
          {c.label}
        </div>
      ))}
    </div>
  )
}
