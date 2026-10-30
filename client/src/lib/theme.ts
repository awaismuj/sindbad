// Applies the brand colours chosen in Admin > Settings. Missing values fall back to the defaults in index.css.
const hex = (h: string): [number, number, number] | null => {
  const m = /^#([0-9a-f]{6})$/i.exec(h ?? ''); if (!m) return null
  const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mix = (c: [number, number, number], to: number, t: number) => c.map((v) => Math.round(v + (to - v) * t)).join(' ')
const ch = (c: [number, number, number]) => c.join(' ')
const set = (k: string, v: string | null) => { const s = document.documentElement.style; v ? s.setProperty(k, v) : s.removeProperty(k) }

export function applyBrand(s: Record<string, string | undefined>) {
  const navy = hex(s.brand_navy ?? ''), teal = hex(s.brand_teal ?? ''), amber = hex(s.brand_amber ?? ''), cream = hex(s.brand_cream ?? '')
  set('--navy-900', navy ? ch(navy) : null); set('--navy-950', navy ? mix(navy, 0, 0.3) : null); set('--navy-800', navy ? mix(navy, 255, 0.05) : null)
  set('--navy-700', navy ? mix(navy, 255, 0.12) : null); set('--navy-600', navy ? mix(navy, 255, 0.22) : null)
  set('--teal', teal ? ch(teal) : null); set('--teal-600', teal ? mix(teal, 0, 0.2) : null); set('--teal-700', teal ? mix(teal, 0, 0.4) : null); set('--teal-50', teal ? mix(teal, 255, 0.9) : null)
  set('--amber', amber ? ch(amber) : null); set('--amber-600', amber ? mix(amber, 0, 0.14) : null)
  set('--cream', cream ? ch(cream) : null); set('--cream-200', cream ? mix(cream, 0, 0.05) : null)
}
