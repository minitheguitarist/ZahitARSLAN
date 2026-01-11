/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          100: 'rgba(255, 255, 255, 0.1)',
          200: 'rgba(255, 255, 255, 0.2)',
          300: 'rgba(255, 255, 255, 0.3)',
          900: 'rgba(15, 23, 42, 0.8)', // Koyu arka plan için
        },
        primary: {
          DEFAULT: '#0f172a', // Slate 900
          light: '#1e293b',   // Slate 800
        },
        accent: {
          DEFAULT: '#10b981', // Emerald 500
          hover: '#059669',   // Emerald 600
          glow: 'rgba(16, 185, 129, 0.4)',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
