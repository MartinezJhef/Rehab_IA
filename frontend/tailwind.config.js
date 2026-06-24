/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#050B14',      // Más profundo
          card: '#0a1120',      // Base de tarjeta
          accent: '#2563eb',    // Azul eléctrico
          primary: '#0ea5e9',   // Azul claro brillante
          purple: '#8b5cf6',
          teal: '#14b8a6'
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
      }
    },
  },
  plugins: [],
}
