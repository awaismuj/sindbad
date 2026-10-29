/** Small line-icon set. Names match the "icon" field on services and solutions in the admin panel. */
const P: Record<string, string> = {
  cloud: 'M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1 0 9H7z',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  megaphone: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  brain: 'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V4a3 3 0 0 0-3 0zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  building: 'M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M3 21h18M8 8h2M8 12h2M8 16h2',
  workflow: 'M4 4h6v6H4zM14 14h6v6h-6zM7 10v4a2 2 0 0 0 2 2h5',
  store: 'M4 9l1-5h14l1 5M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M5 11v9h14v-9M10 20v-5h4v5',
  plug: 'M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4',
  utensils: 'M6 3v8a2 2 0 0 0 2 2v8M10 3v8M8 3v8M18 21V3c-2 1-3.5 4-3.5 8h3.5',
  pill: 'M10.5 20.5l-7-7a4.95 4.95 0 0 1 7-7l7 7a4.95 4.95 0 0 1-7 7zM8.5 8.5l7 7',
  'shopping-cart': 'M3 4h2l2.4 11h10.2L20 7H6M9 20h.01M17 20h.01',
  boxes: 'M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8',
  truck: 'M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19h.01M17 19h.01',
  scissors: 'M6 7h.01M6 17h.01M8 8.5L20 19M8 15.5L20 5',
  dumbbell: 'M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12',
  'graduation-cap': 'M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5',
  bed: 'M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11h.01',
  settings: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
  arrow: 'M4 12h15m-5-5 5 5-5 5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chevron: 'M6 9l6 6 6-6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z',
  pin: 'M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11zM12 11.5h.01',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
}
export const ICON_NAMES = Object.keys(P).filter((k) => !['arrow', 'check', 'chevron', 'menu', 'close', 'mail', 'phone', 'pin', 'spark'].includes(k))
export function Icon({ name, size = 22, className = '', stroke = 1.7 }: { name?: string | null; size?: number; className?: string; stroke?: number }) {
  const d = (name && P[name]) || P.compass
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d={d} />
    </svg>
  )
}
/** Rounded icon tile used on cards */
export const IconTile = ({ name, tone = 'teal' }: { name?: string | null; tone?: 'teal' | 'amber' | 'dark' }) => (
  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone === 'amber' ? 'bg-amber/20 text-amber-600' : tone === 'dark' ? 'bg-white/10 text-teal' : 'bg-teal/15 text-teal-700'}`}>
    <Icon name={name} />
  </span>
)
