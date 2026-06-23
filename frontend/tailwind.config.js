/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'inst-azul-osc': '#0A2B5E',
        'inst-azul-osc-hover': '#081F47',
        'inst-azul-osc-light': '#E3EBF2',
        'inst-amarillo': '#F9B233',
        'inst-amarillo-hover': '#E0A020',
        'inst-amarillo-light': '#FFF8E1',
        'inst-fondo': '#FFFFFF',
        'inst-gris': '#F8FAFC',
        'inst-gris-med': '#F1F5F9',
        'inst-borde': '#E2E8F0',
        'inst-texto': '#334155',
        'inst-texto-claro': '#64748B',
        'inst-rojo': '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
