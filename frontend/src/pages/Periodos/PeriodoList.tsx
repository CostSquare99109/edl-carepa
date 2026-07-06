import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { Card, Badge, SkeletonText, Alert } from '../../components/ui'

interface Periodo {
  id: number
  nombre: string
  anio: string
  fecha_inicio: string
  fecha_fin: string
  estado: string
  fecha_inicio_concertacion: string | null
  fecha_fin_concertacion: string | null
  fecha_inicio_seguimiento: string | null
  fecha_fin_seguimiento: string | null
  fecha_inicio_evaluacion: string | null
  fecha_fin_evaluacion: string | null
  fecha_inicio_calificacion_parcial: string | null
  fecha_fin_calificacion_parcial: string | null
  fecha_inicio_evaluacion_segundo: string | null
  fecha_fin_evaluacion_segundo: string | null
  fecha_inicio_calificacion_definitiva: string | null
  fecha_fin_calificacion_definitiva: string | null
}

interface EtapaBloque {
  key: string
  label: string
  inicio: string | null
  fin: string | null
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function anioDeNombre(nombre: string): string {
  const m = nombre?.match(/(\d{4})\s*[-–]\s*(\d{4})/)
  if (m) return `${m[1]} - ${m[2]}`
  return nombre ?? ''
}

export default function PeriodoList() {
  const [items, setItems] = useState<Periodo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function cargar() {
    setLoading(true)
    api
      .get<PaginatedData<Periodo>>('/periodos?pagina=1&por_pagina=100')
      .then(d => {
        setItems(d.data || [])
        setError('')
      })
      .catch(e =>
        setError(e instanceof Error ? e.message : 'Error al cargar períodos'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
  }, [])

  const periodos = [...items].sort((a, b) =>
    (a.fecha_inicio ?? '').localeCompare(b.fecha_inicio ?? ''),
  )

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons text-inst-azul-osc text-xl">
            date_range
          </span>
          <h2 className="edl-section-title">Períodos de Evaluación</h2>
        </div>
        <p className="text-sm text-inst-texto-claro ml-7">
          Estas fechas están establecidas por norma y su cumplimiento permite
          llevar a cabo un proceso de Evaluación de Desempeño Laboral efectivo.
        </p>
      </div>

      {error ? (
        <Alert tone="danger" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {/* Bloque principal: tarjetas por período */}
      <Card>
        {loading ? (
          <SkeletonText lines={8} />
        ) : periodos.length === 0 ? (
          <div className="border border-dashed border-inst-borde rounded-lg p-8 text-center bg-inst-gris-light">
            <span className="material-icons text-4xl text-inst-texto-claro block mb-2">
              event_busy
            </span>
            <p className="text-sm font-semibold text-inst-texto mb-1">
              Sin períodos registrados
            </p>
            <p className="text-xs text-inst-texto-claro">
              El administrador del sistema aún no ha creado períodos de
              evaluación.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {periodos.map(p => {
              const etapas: EtapaBloque[] = [
                {
                  key: 'concertacion',
                  label: 'Concertación de compromisos',
                  inicio: p.fecha_inicio_concertacion,
                  fin: p.fecha_fin_concertacion,
                },
                {
                  key: 'seguimiento',
                  label: 'Seguimiento',
                  inicio: p.fecha_inicio_seguimiento,
                  fin: p.fecha_fin_seguimiento,
                },
                {
                  key: 'eval_1',
                  label: 'Evaluación parcial primer semestre',
                  inicio: p.fecha_inicio_evaluacion,
                  fin: p.fecha_fin_evaluacion,
                },
                {
                  key: 'calif_1',
                  label: 'Calificación parcial primer semestre',
                  inicio: p.fecha_inicio_calificacion_parcial,
                  fin: p.fecha_fin_calificacion_parcial,
                },
                {
                  key: 'eval_2',
                  label: 'Evaluación parcial segundo semestre',
                  inicio: p.fecha_inicio_evaluacion_segundo,
                  fin: p.fecha_fin_evaluacion_segundo,
                },
                {
                  key: 'calif_def',
                  label: 'Calificación definitiva',
                  inicio: p.fecha_inicio_calificacion_definitiva,
                  fin: p.fecha_fin_calificacion_definitiva,
                },
              ]

              return (
                <Card key={p.id} variant="elevated" className="overflow-hidden">
                  <div className="bg-gradient-to-r from-[#4E83A3] to-[#5190BB] px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-white/90">event</span>
                      <h4 className="font-bold text-white text-lg">
                        Periodo {anioDeNombre(p.anio ?? p.nombre)}
                      </h4>
                    </div>
                    <Badge tone={ESTADO_TONE[p.estado] ?? 'neutral'} dot>
                      {ESTADO_LABEL[p.estado] || p.estado}
                    </Badge>
                  </div>

                  <div className="px-5 py-2 bg-inst-azul-osc-light/30 border-b border-inst-borde flex items-center gap-4 text-sm text-inst-texto-claro">
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-sm">calendar_today</span>
                      Inicio: {fmtDate(p.fecha_inicio)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-sm">calendar_today</span>
                      Fin: {fmtDate(p.fecha_fin)}
                    </span>
                  </div>

                  <div className="divide-y divide-inst-borde">
                    {etapas.map(e => (
                      <div
                        key={e.key}
                        className="flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-inst-texto">{e.label}</span>
                        <span className="text-xs font-mono whitespace-nowrap ml-4 text-inst-texto-claro">
                          {e.inicio || e.fin
                            ? `${fmtDate(e.inicio)} — ${fmtDate(e.fin)}`
                            : 'Sin fechas configuradas'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

const ESTADO_LABEL: Record<string, string> = {
  configuracion: 'Configuración',
  concertacion: 'Concertación',
  seguimiento: 'Seguimiento',
  evaluacion: 'Evaluación',
  calificacion: 'Calificación',
  cerrado: 'Cerrado',
}

const ESTADO_TONE: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  configuracion: 'info',
  concertacion: 'info',
  seguimiento: 'success',
  evaluacion: 'warning',
  calificacion: 'warning',
  cerrado: 'neutral',
}
