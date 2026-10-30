/** Brand panel in the style of the Sindbad banner: Arabic tagline, English line, sailboat, network nodes and waves. */
export function DashboardPreview() {
  return (
    <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center lg:items-end lg:text-right">
      <p className="text-sm font-bold tracking-[0.35em] text-teal">SINDBAD SOLUTION</p>
      <h2 lang="ar" dir="rtl" className="mt-4 font-arabic text-[2.6rem] font-extrabold leading-[1.45] !text-white sm:text-6xl">
        نبحر بأعمالك نحو <span className="text-amber">آفاق رقمية</span> جديدة
      </h2>
      <p className="mt-3 text-lg text-white/80">We sail your business toward new digital horizons</p>
      <svg viewBox="0 0 240 200" className="mt-8 w-52 sm:w-64" role="img" aria-label="Sindbad sailboat">
        <g stroke="rgba(120,200,220,.55)" strokeWidth="1.2" fill="none"><path d="M20 40L70 20L120 50M70 20L100 8M200 30L225 60"/></g>
        <g fill="#2EC4B6" opacity=".8"><circle cx="20" cy="40" r="3"/><circle cx="70" cy="20" r="3"/><circle cx="120" cy="50" r="3"/><circle cx="100" cy="8" r="2.5"/><circle cx="200" cy="30" r="3"/><circle cx="225" cy="60" r="3"/></g>
        <circle cx="120" cy="105" r="62" fill="rgba(255,255,255,.1)"/>
        <path d="M118 52V148" stroke="#fff" strokeWidth="3"/>
        <path d="M113 58L74 140H113Z" fill="#2EC4B6"/>
        <path d="M124 70L166 140H124Z" fill="#F4B942"/>
        <path d="M58 146H182C176 164 160 170 120 170S64 164 58 146Z" fill="#F4F1EA"/>
      </svg>
    </div>
  )
}
