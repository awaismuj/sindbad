/** Brand tokens come from the Sindbad logo: navy sea, teal sail, amber sail, cream hull. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#071629', 900: '#0B1F3A', 800: '#10294B', 700: '#173761', 600: '#24507F' },
        teal: { DEFAULT: '#2EC4B6', 600: '#1E9C90', 700: '#177A71', 50: '#E8F8F6' },
        amber: { DEFAULT: '#F4B942', 600: '#D99A1C' },
        cream: { DEFAULT: '#F4F1EA', 200: '#E9E4D8' },
        ink: '#12233B',
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
