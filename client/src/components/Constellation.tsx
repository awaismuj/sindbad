import { Link } from 'react-router-dom'
/** Sea chart of live services. Each star links to its service page; positions are decorative, names come from the database. */
const P: [number, number][] = [[90, 340], [170, 190], [300, 280], [270, 85], [420, 165], [480, 310], [350, 395]]
const E: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4], [2, 4], [4, 5], [2, 6], [5, 6]]
export function Constellation({ items }: { items: { name: string; slug: string }[] }) {
  const nodes = items.slice(0, 7)
  return (
    <figure className="relative rounded-[1.75rem] bg-navy-950/60 p-3 ring-1 ring-white/15 backdrop-blur">
      <svg viewBox="0 0 560 440" role="group" aria-label="Our services" className="h-auto w-full">
        {[40, 120, 200, 280, 360, 440, 520].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="440" stroke="#fff" strokeOpacity=".05" />)}
        {[55, 135, 215, 295, 375].map((y) => <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="#fff" strokeOpacity=".05" />)}
        <circle cx="280" cy="220" r="200" fill="none" stroke="rgb(var(--teal))" strokeOpacity=".22" />
        <circle cx="280" cy="220" r="135" fill="none" stroke="rgb(var(--teal))" strokeOpacity=".16" strokeDasharray="3 7" />
        <g transform="translate(500 56)" stroke="rgb(var(--amber))" strokeOpacity=".8" fill="none" aria-hidden>
          <circle r="20" /><path d="M0 -26V-12M0 12V26M-26 0H-12M12 0H26" /><path d="M0 -12L4 0L0 12L-4 0Z" fill="rgb(var(--amber))" fillOpacity=".8" />
        </g>
        {E.map(([a, b], i) => (nodes[a] && nodes[b]) || !nodes.length ? (
          <line key={i} x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} stroke="rgb(var(--teal))" strokeOpacity=".6" strokeWidth="1.5" className="draw" style={{ animationDelay: `${i * 0.18}s` }} />) : null)}
        {P.map(([x, y], i) => {
          const n = nodes[i]; if (nodes.length && !n) return null
          const anchor = x < 200 ? 'start' : x > 380 ? 'end' : 'middle'; const dx = anchor === 'start' ? 18 : anchor === 'end' ? -18 : 0; const dy = anchor === 'middle' ? 30 : 5
          const label = n ? (n.name.length > 26 ? n.name.slice(0, 25) + '…' : n.name) : ''
          const dot = (<><circle cx={x} cy={y} r="15" fill="rgb(var(--amber))" fillOpacity=".12" /><circle cx={x} cy={y} r="6" fill={i % 3 === 0 ? 'rgb(var(--amber))' : 'rgb(var(--teal))'} className="pop" style={{ animationDelay: `${0.4 + i * 0.18}s` }} />
            {n && <text x={x + dx} y={y + dy} textAnchor={anchor} fill="#fff" fontSize="14" fontWeight="600" className="pop" style={{ animationDelay: `${0.6 + i * 0.18}s` }}>{label}</text>}</>)
          return n ? <Link key={i} to={`/services/${n.slug}`} aria-label={n.name}><g className="cursor-pointer">{dot}</g></Link> : <g key={i}>{dot}</g>
        })}
      </svg>
      <figcaption className="px-3 pb-2 pt-1 text-xs text-white/50">Our course: tap a star to open that service.</figcaption>
    </figure>
  )
}
