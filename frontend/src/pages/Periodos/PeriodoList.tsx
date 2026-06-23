import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { Card, Badge, EmptyState, SkeletonText, Alert } from '../../components/ui'
import { toast } from 'sonner'

interface Periodo {
 id: number
 nombre: string
 fecha_inicio: string
 fecha_fin: string
 estado: string
 fecha_inicio_concertacion: string | null
 fecha_fin_concertacion: string | null
 fecha_inicio_evaluacion: string | null
 fecha_fin_evaluacion: string | null
}

interface EtapaEDL {
 key: string
 label: string
 icon: string
 descripcion: string
 tone: 'info' | 'success' | 'warning' | 'danger'
}

const ETAPAS_EDL: EtapaEDL[] = [
 {
  key: 'concertacion',
  label: 'Concertación',
  icon: 'handshake',
  descripcion: 'El jefe inmediato y el evaluado acuerdan los compromisos funcionales y competencias comportamentales que serán evaluados.',
  tone: 'info',
 },
 {
  key: 'seguimiento',
  label: 'Seguimiento',
  icon: 'visibility',
  descripcion: 'Seguimiento continuo al cumplimiento de compromisos y competencias concertadas. Registro de evidencias.',
  tone: 'success',
 },
 {
  key: 'evaluacion_parcial_1',
  label: 'Eval. Parcial 1er sem.',
  icon: 'rate_review',
  descripcion: 'Evaluación parcial del desempeño al finalizar el primer semestre. Calificación de compromisos funcionales y comportamentales.',
  tone: 'warning',
 },
 {
  key: 'calificacion_parcial_1',
  label: 'Calif. Parcial 1er sem.',
  icon: 'grading',
  descripcion: 'Aprobación o rechazo de la calificación parcial por la Comisión de Evaluación y Desempeño.',
  tone: 'warning',
 },
 {
  key: 'evaluacion_parcial_2',
  label: 'Eval. Parcial 2do sem.',
  icon: 'rate_review',
  descripcion: 'Evaluación parcial del desempeño al finalizar el segundo semestre.',
  tone: 'warning',
 },
 {
  key: 'calificacion_definitiva',
  label: 'Calificación definitiva',
  icon: 'fact_check',
  descripcion: 'Calificación definitiva del desempeño laboral. Aprobación por la Comisión de Evaluación. Recursos de reposición.',
  tone: 'danger',
 },
]

const ESTADO_ETAPA_MAP: Record<string, string> = {
 configuracion: 'concertacion',
 concertacion: 'concertacion',
 seguimiento: 'seguimiento',
 evaluacion: 'evaluacion_parcial_1',
 calificacion: 'calificacion_parcial_1',
 cerrado: 'calificacion_definitiva',
}

const ESTADO_LABEL: Record<string, string> = {
 configuracion: 'Configuración',
 concertacion: 'Concertación',
 seguimiento: 'Seguimiento',
 evaluacion: 'Evaluación',
 calificacion: 'Calificación',
 cerrado: 'Cerrado',
};

const ESTADO_TONE: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
 configuracion: 'info',
 concertacion: 'info',
 seguimiento: 'success',
 evaluacion: 'warning',
 calificacion: 'warning',
 cerrado: 'neutral',
};

function fmtDate(d: string | null | undefined): string {
 if (!d) return '—';
 return new Date(d + 'T00:00:00').toLocaleDateString('es-CO')
}

export default function PeriodoList() {
 const [items, setItems] = useState<Periodo[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')

 function cargar() {
  setLoading(true)
  api.get<PaginatedData<Periodo>>(`/periodos?pagina=${pagina}&por_pagina=20`)
   .then(d => { setItems(d.data || []); setTotal(d.total); setError(''); })
   .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar períodos'))
   .finally(() => setLoading(false))
 }

 useEffect(() => { cargar() }, [pagina])

 const periodoActivo = items.find(p => p.estado !== 'cerrado');
 const etapaActualKey = periodoActivo ? ESTADO_ETAPA_MAP[periodoActivo.estado] : null;
 const etapaActualIdx = etapaActualKey ? ETAPAS_EDL.findIndex(e => e.key === etapaActualKey) : -1;

 return (
  <div className="space-y-6">
   <div className="animate-fadeIn">
    <div className="flex items-center gap-2 mb-1">
     <span className="material-icons text-inst-azul-osc text-xl">date_range</span>
     <h2 className="edl-section-title">Períodos de Evaluación</h2>
    </div>
    <p className="text-sm text-inst-texto-claro ml-7">
     Etapas del proceso EDL según Acuerdo 617 de 2018. Esta sección es informativa (solo lectura).
    </p>
   </div>

   <Alert tone="info">
    <span className="text-sm">
     Esta pestaña muestra únicamente las etapas del proceso y los períodos existentes. La configuración de períodos la realiza el administrador del sistema.
    </span>
   </Alert>

   {/* Timeline horizontal */}
   <Card>
    <h3 className="font-heading font-bold text-inst-azul-osc mb-4 flex items-center gap-2">
     <span className="material-icons">timeline</span>
     Etapas del Proceso EDL
    </h3>

    {loading ? (
     <SkeletonText lines={6} />
    ) : (
     <div className="space-y-3">
      {ETAPAS_EDL.map((etapa, idx) => {
       const completada = etapaActualIdx >= 0 && idx < etapaActualIdx;
       const actual = etapa.key === etapaActualKey;
       const futura = etapaActualIdx >= 0 && idx > etapaActualIdx;
       return (
        <div
         key={etapa.key}
         className={[
          'relative border rounded-lg p-3 flex items-start gap-3 transition-all',
          actual ? 'bg-inst-amarillo-light border-amber-400 ring-2 ring-amber-300'
          : completada ? 'bg-inst-verde-light border-green-300'
          : futura ? 'bg-inst-gris-med border-inst-borde opacity-70'
          : 'bg-white border-inst-borde',
         ].join(' ')}
        >
         <div className="flex flex-col items-center min-w-[40px]">
          <div className={[
           'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
           actual ? 'bg-amber-500 text-white'
           : completada ? 'bg-inst-verde text-white'
           : 'bg-inst-gris-med text-inst-texto-claro',
          ].join(' ')}>
           {completada ? <span className="material-icons text-base">check</span> : idx + 1}
          </div>
          {idx < ETAPAS_EDL.length - 1 ? (
           <div className={[
            'w-0.5 h-6 mt-1',
            completada ? 'bg-inst-verde' : 'bg-inst-borde',
           ].join(' ')} aria-hidden="true" />
          ) : null}
         </div>
         <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
           <span className="material-icons text-base text-inst-azul-osc">{etapa.icon}</span>
           <p className="font-semibold text-sm text-inst-texto">{etapa.label}</p>
           {actual ? <Badge tone="warning">En curso</Badge> : null}
           {completada ? <Badge tone="success">Completada</Badge> : null}
           {futura ? <Badge tone="neutral">Pendiente</Badge> : null}
          </div>
          <p className="text-xs text-inst-texto-claro">{etapa.descripcion}</p>
         </div>
        </div>
       );
      })}
     </div>
    )}
   </Card>

   {/* Tabla de períodos (solo lectura) */}
   <Card>
    <h3 className="font-heading font-bold text-inst-azul-osc mb-4 flex items-center gap-2">
     <span className="material-icons">event</span>
     Períodos Registrados
    </h3>

    {error ? (
     <Alert tone="danger" onDismiss={() => setError('')}>{error}</Alert>
    ) : loading ? (
     <SkeletonText lines={5} />
    ) : items.length === 0 ? (
     <EmptyState
      icon={<span className="material-icons text-3xl">event_busy</span>}
      title="Sin períodos registrados"
      description="El administrador del sistema aún no ha creado períodos de evaluación."
     />
    ) : (
     <div className="overflow-x-auto -mx-2">
      <table className="edl-table">
       <thead>
        <tr>
         <th>Período</th>
         <th>Inicio</th>
         <th>Fin</th>
         <th>Concertación</th>
         <th>Evaluación</th>
         <th>Estado</th>
        </tr>
       </thead>
       <tbody>
        {items.map(p => {
         const etapaActual = ESTADO_ETAPA_MAP[p.estado] || '';
         const etapa = etapaActual ? ETAPAS_EDL.find(e => e.key === etapaActual) : null;
         return (
          <tr key={p.id} className={p.estado === 'cerrado' ? 'opacity-60' : ''}>
           <td className="font-medium text-inst-azul-osc">{p.nombre}</td>
           <td>{fmtDate(p.fecha_inicio)}</td>
           <td>{fmtDate(p.fecha_fin)}</td>
           <td className="text-xs">
            {fmtDate(p.fecha_inicio_concertacion)} — {fmtDate(p.fecha_fin_concertacion)}
           </td>
           <td className="text-xs">
            {fmtDate(p.fecha_inicio_evaluacion)} — {fmtDate(p.fecha_fin_evaluacion)}
           </td>
           <td>
            <Badge tone={ESTADO_TONE[p.estado] ?? 'neutral'} dot>
             {ESTADO_LABEL[p.estado] || p.estado}
            </Badge>
            {etapa && p.estado !== 'cerrado' ? (
             <p className="text-[10px] text-inst-texto-claro mt-1">
              Etapa actual: <span className="font-medium">{etapa.label}</span>
             </p>
            ) : null}
           </td>
          </tr>
         );
        })}
       </tbody>
      </table>
     </div>
    )}

    {total > 20 && !loading ? (
     <div className="flex justify-center gap-2 p-3 mt-3 border-t border-inst-borde">
      <button
       onClick={() => setPagina(p => Math.max(1, p - 1))}
       disabled={pagina === 1}
       className="edl-btn-outline text-sm disabled:opacity-50"
      >
       Anterior
      </button>
      <span className="text-sm text-inst-texto-claro py-2">Página {pagina}</span>
      <button
       onClick={() => setPagina(p => p + 1)}
       disabled={pagina >= Math.ceil(total / 20)}
       className="edl-btn-outline text-sm disabled:opacity-50"
      >
       Siguiente
      </button>
     </div>
    ) : null}
   </Card>
  </div>
 )
}
