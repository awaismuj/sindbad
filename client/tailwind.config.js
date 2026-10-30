/** Brand tokens come from the Sindbad logo: navy sea, teal sail, amber sail, cream hull. */
// Colours are CSS variables (channels) defined in src/index.css and overridable from the admin settings
const c = (n) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: c('navy-950'), 900: c('navy-900'), 800: c('navy-800'), 700: c('navy-700'), 600: c('navy-600') },
        teal: { DEFAULT: c('teal'), 600: c('teal-600'), 700: c('teal-700'), 50: c('teal-50') },
        amber: { DEFAULT: c('amber'), 600: c('amber-600') },
        cream: { DEFAULT: c('cream'), 200: c('cream-200') },
        ink: '#12233B',
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
