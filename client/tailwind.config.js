/** Brand tokens come from the Sindbad logo (navy sea, teal sail, amber sail, cream hull).
 *  Colours are CSS variables so Admin > Settings > Brand colours can change them without a rebuild. */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: v('navy-950'), 900: v('navy-900'), 800: v('navy-800'), 700: v('navy-700'), 600: v('navy-600') },
        teal: { DEFAULT: v('teal'), 600: v('teal-600'), 700: v('teal-700'), 50: v('teal-50') },
        amber: { DEFAULT: v('amber'), 600: v('amber-600') },
        cream: { DEFAULT: v('paper'), 200: v('paper-200') },
        ink: v('ink'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
      },
      boxShadow: {
        lift: '0 1px 0 rgb(var(--navy-900) / .04), 0 18px 40px -18px rgb(var(--navy-900) / .28)',
        glow: '0 0 0 1px rgb(var(--teal) / .35), 0 20px 50px -20px rgb(var(--teal) / .45)',
      },
    },
  },
  plugins: [],
}
