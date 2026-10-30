import { Link } from 'react-router-dom'
/** Star chart of live services. Nodes link to each service page; positions are decorative. */
const P: [number, number][] = [[80, 330], [165, 175], [300, 270], [265, 70], [425, 150], [480, 300], [355, 385]]
const E: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4], [2, 4], [4, 5], [2, 6], [5, 6]]
export function Constellation({ items }: { items: { name: string; slug: string }[] }) {
  const nodes = items.slice(0, 7)
  return (
    <svg viewBox="0 0 560 440" role="group" aria-label="Our services" className="h-auto w-full">
      <circle cx="280" cy="220" r="205" fill="none" stroke="rgb(var(--teal))" strokeOpacity=".18" />
      <circle cx="280" cy="220" r="140" fill="none" stroke="rgb(var(--teal))" strokeOpacity=".12" strokeDasharray="3 7" />
      {E.map(([a, b], i) => (nodes[a] && nodes[b]) || !nodes.length ? (
        <line key={i} x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} stroke="rgb(var(--teal))" strokeOpacity=".55" strokeWidth="1.5" className="draw" style={{ animationDelay: `${i * 0.18}s` }} />) : null)}
      {P.map(([x, y], i) => {
        const n = nodes[i]; if (nodes.length && !n) return null
        const anchor = x < 200 ? 'start' : x > 380 ? 'end' : 'middle'; const dx = anchor === 'start' ? 16 : anchor === 'end' ? -16 : 0; const dy = anchor === 'middle' ? 28 : 4
        const label = n ? (n.name.length > 24 ? n.name.slice(0, 23) + '…' : n.name) : ''
        const dot = (<><circle cx={x} cy={y} r="14" fill="rgb(var(--amber))" fillOpacity=".12" /><circle cx={x} cy={y} r="6" fill={i % 3 === 0 ? 'rgb(var(--amber))' : 'rgb(var(--teal))'} className="pop" style={{ animationDelay: `${0.4 + i * 0.18}s` }} />
          {n && <text x={x + dx} y={y + dy} textAnchor={anchor} fill="#fff" fontSize="14" fontWeight="600" className="pop" style={{ animationDelay: `${0.6 + i * 0.18}s` }}>{label}</text>}</>)
        return n ? <Link key={i} to={`/services/${n.slug}`} aria-label={n.name}><g className="cursor-pointer">{dot}</g></Link> : <g key={i}>{dot}</g>
      })}
    </svg>
  )
}
