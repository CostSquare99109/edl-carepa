import type { CSSProperties } from 'react'

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: '1rem',
  color: '#0A2B5E',
}

const spinnerStyle: CSSProperties = {
  width: 48,
  height: 48,
  border: '4px solid rgba(10, 43, 94, 0.15)',
  borderTopColor: '#0A2B5E',
  borderRadius: '50%',
  animation: 'loader-spin 0.9s linear infinite',
}

const textStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 500,
  opacity: 0.7,
}

interface LoaderProps {
  label?: string
}

/**
 * Fallback para React.Suspense en lazy-load de rutas pesadas.
 * Spinner institucional (azul Carepa) + label opcional.
 */
export default function Loader({ label = 'Cargando módulo…' }: LoaderProps) {
  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <style>{`@keyframes loader-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={spinnerStyle} />
      <span style={textStyle}>{label}</span>
    </div>
  )
}