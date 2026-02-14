/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FAF7F2',
          100: '#F5F0E8',
          200: '#E8E0D4',
          300: '#D4C9BA',
        },
        cream: '#FDF8F0',
        espresso: {
          600: '#5C3D2E',
          700: '#4A3125',
          800: '#3A2519',
          900: '#2C1E18',
        },
        terracotta: {
          400: '#D4956F',
          500: '#C67D5B',
          600: '#B5694A',
        },
        charcoal: {
          300: '#8A847E',
          400: '#6B6560',
          500: '#4A4540',
        },
        clay: {
          500: '#A67B5B',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
