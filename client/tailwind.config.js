/** Brand tokens: navy sea + teal sail + amber sail from the Sindbad logo, with a clear harbor-blue scale for the redesign. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#06142B', 900: '#0A2347', 800: '#0F2F5E', 700: '#173E78', 600: '#24507F' },
        sea: { 50: '#EEF4FD', 100: '#DCE8FA', 200: '#B9D0F4', 500: '#2468D8', 600: '#1457C8', 700: '#0F45A3', 800: '#0B3580' },
        teal: { DEFAULT: '#2EC4B6', 600: '#1E9C90', 700: '#177A71', 50: '#E8F8F6' },
        amber: { DEFAULT: '#F4B942', 600: '#D99A1C' },
        cream: { DEFAULT: '#F3F7FC', 200: '#E3ECF7' },
        ink: '#12233B',
      },
      fontFamily: {
        display: ['"Sora Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        arabic: ['"Noto Sans Arabic"', 'Tajawal', 'sans-serif'],
      },
      boxShadow: { soft: '0 1px 2px rgba(10,35,71,.06), 0 12px 32px -12px rgba(10,35,71,.18)' },
    },
  },
  plugins: [],
}
