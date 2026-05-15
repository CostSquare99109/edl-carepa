/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'inst-azul': '#0A2B5E',
        'inst-rojo': '#C4282B',
        'inst-verde': '#1E5A3C',
        'inst-fondo': '#FFFFFF',
        'inst-gris': '#F8FAFC',
        'inst-borde': '#E2E8F0',
        'inst-texto': '#334155',
        'inst-texto-claro': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
