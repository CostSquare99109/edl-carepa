/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional Carepa — Open Design professional
        'inst-azul': '#0A2B5E',
        'inst-azul-hover': '#081F47',
        'inst-azul-light': '#E3EBF2',
        'inst-azul-surface': '#EAF1FF',
        'inst-amarillo': '#F9B233',
        'inst-amarillo-hover': '#E0A020',
        'inst-amarillo-light': '#FFF8E1',
        'inst-rojo': '#DC2626',
        'inst-verde': '#16A34A',
        'inst-warn': '#D97706',
        // Neutrales
        'inst-bg': '#F8FAFC',
        'inst-surface': '#FFFFFF',
        'inst-gris': '#F8FAFC',
        'inst-gris-med': '#F1F5F9',
        'inst-borde': '#E2E8F0',
        'inst-borde-soft': '#F1F5F9',
        'inst-texto': '#0F172A',
        'inst-texto-2': '#334155',
        'inst-texto-claro': '#64748B',
        // Legacy aliases (compat)
        'inst-azul-osc': '#0A2B5E',
        'inst-azul-osc-hover': '#081F47',
        'inst-azul-osc-light': '#E3EBF2',
        'inst-fondo': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.1em' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
        'body': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.5rem', { lineHeight: '1.2' }],
        '2xl': ['2.25rem', { lineHeight: '1.1' }],
        '3xl': ['3.375rem', { lineHeight: '1.05' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        'sm': '10px',
        'md': '16px',
        'lg': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        'flat': 'none',
        'ring': '0 0 0 1px #E2E8F0',
        'raised': '0 20px 52px rgba(15, 23, 42, 0.11)',
        'elegant': '0 4px 24px -4px rgba(10, 43, 94, 0.12)',
        'elegant-lg': '0 12px 48px -12px rgba(10, 43, 94, 0.18)',
        'focus': '0 0 0 4px rgba(10, 43, 94, 0.22)',
        'inst': '0 1px 3px rgba(15, 23, 42, 0.08)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '240ms',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.24s cubic-bezier(0.2, 0, 0, 1) forwards',
        'fade-in-up': 'fadeInUp 0.24s cubic-bezier(0.2, 0, 0, 1) forwards',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.2, 0, 0, 1) forwards',
        'scale-in': 'scaleIn 0.24s cubic-bezier(0.2, 0, 0, 1) forwards',
      },
    },
  },
  plugins: [],
}
