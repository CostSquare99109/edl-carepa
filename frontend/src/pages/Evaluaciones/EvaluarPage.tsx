import { useEffect, useState } from 'react';
import { api, type PaginatedData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface EvaluacionAsignada {
  id: number;
  evaluado_id: number;
  evaluado_nombre: string;
  evaluado_cargo: string;
  tipo: string;
  estado: string;
  periodo_nombre: string;
  puntaje_auto: number | null;
  puntaje_hetero: number | null;
  puntaje_coevaluacion: number | null;
  puntaje_final: number | null;
  compromisos_count: number;
  compromisos_aprobados: number;
}

interface CompromisoEval {
  id: number;
  tipo: string;
  descripcion: string;
  resultado_esperado: string | null;
  medio_verificacion: string | null;
  peso: number;
  estado: string;
  observaciones_evaluador: string | null;
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-gray-200 text-gray-700' },
  en_proceso: { label: 'En proceso', color: 'bg-blue-100 text-blue-800' },
  calificada: { label: 'Calificada', color: 'bg-green-100 text-green-800' },
  aprobada: { label: 'Aprobada por Comision', color: 'bg-green-200 text-green-900' },
};

const TIPO_EVAL: Record<string, string> = {
  autoevaluacion: 'Autoevaluacion',
  heteroevaluacion: 'Heteroevaluacion',
  coevaluacion: 'Coevaluacion',
};

export default function EvaluarPage() {
  const { rolActivo } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionAsignada[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState<number | null>(null);
  const [compromisos, setCompromisos] = useState<CompromisoEval[]>([]);
  const [puntajes, setPuntajes] = useState<Record<number, string>>({});
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  async function cargarEvaluaciones() {
    setLoading(true);
    try {
      const res = await api.get<PaginatedData<EvaluacionAsignada>>('/evaluaciones?evaluador=me&por_pagina=50');
      setEvaluaciones(res.data || []);
    } catch (err) {
      console.error('Error cargando evaluaciones:', err);
    } finally {
      setLoading(false);
    }
  }

  async function cargarCompromisos(evalId: number) {
    setSelectedEval(evalId);
    try {
      const res = await api.get<PaginatedData<CompromisoEval>>(`/compromisos?evaluacion_id=${evalId}&por_pagina=50`);
      setCompromisos(res.data || []);
    } catch (err) {
      console.error('Error cargando compromisos:', err);
    }
  }

  async function calificarCompromiso(compId: number) {
    const puntaje = puntajes[compId];
    if (!puntaje || isNaN(Number(puntaje)) || Number(puntaje) < 0 || Number(puntaje) > 100) {
      alert('Ingrese un puntaje valido entre 0 y 100');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/compromisos/${compId}/calificar`, {
        puntaje: Number(puntaje),
        observaciones: observaciones,
      });
      setPuntajes(prev => {
        const next = { ...prev };
        delete next[compId];
        return next;
      });
      setObservaciones('');
      if (selectedEval) cargarCompromisos(selectedEval);
    } catch (err: any) {
      alert(err.message || 'Error al calificar');
    } finally {
      setSaving(false);
    }
  }

  async function aprobarEvaluacion(evalId: number) {
    if (!confirm('Confirma la aprobacion de esta evaluacion? La calificacion se hara definitiva.')) return;
    setSaving(true);
    try {
      await api.put(`/evaluaciones/${evalId}/comision`, {
        observaciones: observaciones,
      });
      cargarEvaluaciones();
      setSelectedEval(null);
    } catch (err: any) {
      alert(err.message || 'Error al aprobar evaluacion');
    } finally {
      setSaving(false);
    }
  }

  const esComision = rolActivo === 'comision_evaluadora' || rolActivo === 'admin_cnsc';

  return (
    <div>
      <h2 className="edl-section-title mb-2">Evaluar Desempeno</h2>
      <p className="text-xs text-inst-texto-claro mb-6">
        {esComision
          ? 'Revision y aprobacion de calificaciones definitivas por la Comision Evaluadora'
          : 'Calificacion de compromisos funcionales y competencias comportamentales'
        }
      </p>

      {loading ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando evaluaciones...</div>
      ) : evaluaciones.length === 0 ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">
          No tiene evaluaciones asignadas para calificar.
        </div>
      ) : (
        <div className="space-y-4">
          {evaluaciones.map(ev => {
            const estadoInfo = ESTADO_LABELS[ev.estado] || { label: ev.estado, color: 'bg-gray-200 text-gray-700' };
            const isExpanded = selectedEval === ev.id;
            return (
              <div key={ev.id} className="edl-card">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => isExpanded ? setSelectedEval(null) : cargarCompromisos(ev.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-icons text-sm text-inst-azul">assignment</span>
                      <span className="text-xs uppercase font-medium text-inst-texto-claro">
                        {TIPO_EVAL[ev.tipo] || ev.tipo}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${estadoInfo.color}`}>
                        {estadoInfo.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-inst-texto">
                      {ev.evaluado_nombre} — {ev.evaluado_cargo}
                    </p>
                    <div className="flex gap-4 text-xs text-inst-texto-claro mt-1">
                      <span>Periodo: {ev.periodo_nombre}</span>
                      <span>Compromisos: {ev.compromisos_aprobados}/{ev.compromisos_count}</span>
                      {ev.puntaje_final !== null && (
                        <span className={`font-semibold ${ev.puntaje_final >= 80 ? 'text-green-700' : ev.puntaje_final >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                          Final: {ev.puntaje_final}%
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="material-icons text-inst-texto-claro">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </div>

                {/* Panel expandido: compromisos + calificacion */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-inst-borde">
                    {compromisos.length === 0 ? (
                      <p className="text-sm text-inst-texto-claro text-center py-4">
                        No hay compromisos aprobados para esta evaluacion.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {compromisos.filter(c => c.estado === 'aprobado' || c.estado === 'cumplido' || c.estado === 'incumplido').map(c => (
                          <div key={c.id} className="p-3 bg-inst-gris rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-icons text-xs text-inst-azul">
                                {c.tipo === 'funcional' ? 'task_alt' : 'psychology'}
                              </span>
                              <span className="text-xs uppercase font-medium text-inst-texto-claro">
                                {c.tipo === 'funcional' ? 'Compromiso Funcional' : 'Competencia Comportamental'}
                              </span>
                              <span className="text-xs font-bold text-inst-azul">Peso: {c.peso}%</span>
                            </div>
                            <p className="text-sm text-inst-texto">{c.descripcion}</p>
                            {c.resultado_esperado && (
                              <p className="text-xs text-inst-verde mt-1">Resultado esperado: {c.resultado_esperado}</p>
                            )}

                            {/* Calificacion individual */}
                            {!esComision && ev.estado === 'en_proceso' && (
                              <div className="mt-3 flex items-end gap-3">
                                <div className="flex-1">
                                  <label className="edl-label">Puntaje (0-100)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={puntajes[c.id] || ''}
                                    onChange={e => setPuntajes(prev => ({ ...prev, [c.id]: e.target.value }))}
                                    className="edl-input"
                                    placeholder="0-100"
                                  />
                                </div>
                                <button
                                  onClick={() => calificarCompromiso(c.id)}
                                  disabled={saving || !puntajes[c.id]}
                                  className="edl-btn-primary text-sm flex items-center gap-1 disabled:opacity-50"
                                >
                                  <span className="material-icons text-sm">check</span>
                                  {saving ? '...' : 'Calificar'}
                                </button>
                              </div>
                            )}
                            {c.observaciones_evaluador && (
                              <p className="text-xs text-inst-texto-claro mt-2 italic">
                                Obs: {c.observaciones_evaluador}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Boton aprobacion comision */}
                    {esComision && ev.estado === 'calificada' && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-700 mb-2">
                          Esta evaluacion esta calificada y lista para aprobacion definitiva por la Comision Evaluadora.
                        </p>
                        <div className="mb-3">
                          <label className="edl-label">Observaciones de la Comision (opcional)</label>
                          <textarea
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            className="edl-input min-h-[60px]"
                            placeholder="Observaciones..."
                          />
                        </div>
                        <button
                          onClick={() => aprobarEvaluacion(ev.id)}
                          disabled={saving}
                          className="edl-btn-primary flex items-center gap-1 text-sm"
                        >
                          <span className="material-icons text-sm">gavel</span>
                          {saving ? 'Aprobando...' : 'Aprobar Calificacion Definitiva'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
