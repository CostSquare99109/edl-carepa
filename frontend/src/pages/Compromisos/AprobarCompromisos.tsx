import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { api, type PaginatedData } from '../../lib/api';

interface Compromiso {
  id: number;
  concertacion_id: number;
  evaluacion_id: number | null;
  tipo: string;
  descripcion: string;
  resultado_esperado: string | null;
  medio_verificacion: string | null;
  plazo: string | null;
  peso: number;
  estado: string;
  evaluador_id: number;
  evaluador_nombre: string | null;
  observaciones_evaluador: string | null;
  observaciones_evaluado: string | null;
  creado_en: string;
  evaluacion_tipo: string | null;
  periodo_nombre: string;
  meta_id: number | null;
  meta_descripcion: string | null;
  competencia_codigo: string | null;
  competencia_nombre?: string | null;
  es_propuesto_evaluado: number;
  propuesto_por_jefe_entidad: number;
  evaluado_nombre: string | null;
}

interface PropuestaAgrupada {
  concertacion_id: number;
  evaluado_nombre: string;
  evaluador_nombre: string;
  periodo_nombre: string;
  evaluacion_tipo: string;
  creado_en: string;
  compromisos: Compromiso[];
  funcionales: Compromiso[];
  comportamentales: Compromiso[];
}

const ESTADO_COLORS: Record<string, string> = {
  propuesto: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  devuelto: 'bg-red-100 text-red-800',
};

function agruparPropuestas(compromisos: Compromiso[]): PropuestaAgrupada[] {
  const mapa = new Map<number, PropuestaAgrupada>();
  for (const c of compromisos) {
    if (!mapa.has(c.concertacion_id)) {
      mapa.set(c.concertacion_id, {
        concertacion_id: c.concertacion_id,
        evaluado_nombre: c.evaluado_nombre || '—',
        evaluador_nombre: c.evaluador_nombre || '—',
        periodo_nombre: c.periodo_nombre || '—',
        evaluacion_tipo: c.evaluacion_tipo || '—',
        creado_en: c.creado_en,
        compromisos: [],
        funcionales: [],
        comportamentales: [],
      });
    }
    const grupo = mapa.get(c.concertacion_id)!;
    grupo.compromisos.push(c);
    if (c.tipo === 'funcional') grupo.funcionales.push(c);
    else if (c.tipo === 'comportamental') grupo.comportamentales.push(c);
  }
  return Array.from(mapa.values());
}

export default function AprobarCompromisos() {
  const [propuestas, setPropuestas] = useState<PropuestaAgrupada[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verDetalleId, setVerDetalleId] = useState<number | null>(null);
  const [rechazarId, setRechazarId] = useState<number | null>(null);
  const [obsRechazar, setObsRechazar] = useState('');

  useEffect(() => {
    cargarCompromisos();
  }, []);

  async function cargarCompromisos() {
    setLoading(true);
    try {
      const [resFunc, resComp] = await Promise.all([
        api.get<PaginatedData<Compromiso>>('/compromisos/pendientes?estado=propuesto&por_pagina=50'),
        api.get<PaginatedData<Compromiso>>('/compromisos-comportamentales/pendientes?por_pagina=50'),
      ]);
      const todos = [
        ...(resFunc.data || []),
        ...(resComp.data || []),
      ];
      setPropuestas(agruparPropuestas(todos));
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar compromisos');
    } finally {
      setLoading(false);
    }
  }

  async function confirmarAprobacion(concertacionId: number) {
    setSaving(true);
    try {
      const res = await api.put<any>(`/concertaciones/${concertacionId}/aprobar-pendientes`);
      toast.success(res.message || 'Propuesta aprobada correctamente');
      setVerDetalleId(null);
      cargarCompromisos();
    } catch (err: any) {
      toast.error(err.message || 'Error al aprobar propuesta');
    } finally {
      setSaving(false);
    }
  }

  async function confirmarRechazo() {
    if (!rechazarId) return;
    if (!obsRechazar.trim()) {
      toast.error('Las observaciones son obligatorias al rechazar una propuesta');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put<any>(`/concertaciones/${rechazarId}/rechazar-pendientes`, {
        observaciones: obsRechazar.trim(),
      });
      toast.success(res.message || 'Propuesta rechazada');
      setRechazarId(null);
      setObsRechazar('');
      setVerDetalleId(null);
      cargarCompromisos();
    } catch (err: any) {
      toast.error(err.message || 'Error al rechazar propuesta');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="edl-section-title mb-2">Aprobar Compromisos</h2>
      <p className="text-xs text-inst-texto-claro mb-6">
        Acuerdo 6176 de 2018 — Revise las propuestas completas de compromisos funcionales y competencias comportamentales antes de aprobar o rechazar.
      </p>

      {loading ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
      ) : propuestas.length === 0 ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">
          No tiene propuestas pendientes de aprobación.
        </div>
      ) : (
        <div className="space-y-4">
          {propuestas.map(p => (
            <div key={p.concertacion_id} className="edl-card">
              {/* Header de la propuesta */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-icons text-inst-azul">assignment</span>
                    <h3 className="font-heading font-bold text-inst-azul text-sm">
                      Propuesta de {p.evaluado_nombre}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-inst-texto-claro">
                    <span>Período: <strong className="text-inst-texto">{p.periodo_nombre}</strong></span>
                    <span>Evaluación: <strong className="text-inst-texto">{p.evaluacion_tipo}</strong></span>
                    <span>Evaluador: <strong className="text-inst-texto">{p.evaluador_nombre}</strong></span>
                    <span>Fecha: {new Date(p.creado_en).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-inst-azul-surface text-inst-azul flex items-center gap-1">
                      <span className="material-icons text-sm">task_alt</span>
                      {p.funcionales.length} funcional(es)
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-inst-gris-med text-inst-texto-2 flex items-center gap-1">
                      <span className="material-icons text-sm">psychology</span>
                      {p.comportamentales.length} comportamental(es)
                    </span>
                  </div>
                </div>
              </div>

              {/* Panel de rechazo */}
              {rechazarId === p.concertacion_id && (
                <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-heading font-bold text-red-700 text-sm mb-2">Rechazar Propuesta</h4>
                  <p className="text-xs text-red-600 mb-3">
                    Todos los compromisos de esta propuesta serán devueltos al evaluado para ajuste.
                  </p>
                  <div>
                    <label className="edl-label">Motivo del rechazo (obligatorio)</label>
                    <textarea
                      value={obsRechazar}
                      onChange={e => setObsRechazar(e.target.value)}
                      className="edl-input min-h-[80px]"
                      placeholder="Explique qué debe ajustar el evaluado..."
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={confirmarRechazo}
                      disabled={saving || !obsRechazar.trim()}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-1 text-sm disabled:opacity-50"
                    >
                      <span className="material-icons text-sm">cancel</span>
                      {saving ? 'Confirmando...' : 'Confirmar rechazo'}
                    </button>
                    <button onClick={() => { setRechazarId(null); setObsRechazar(''); }} className="edl-btn-secondary">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              {rechazarId !== p.concertacion_id && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-inst-borde">
                  <button
                    onClick={() => setVerDetalleId(p.concertacion_id)}
                    className="edl-btn-outline flex items-center gap-1 text-sm"
                    title="Ver detalles de la propuesta"
                  >
                    <span className="material-icons text-sm">visibility</span>
                    Ver detalles
                  </button>
                  <button
                    onClick={() => confirmarAprobacion(p.concertacion_id)}
                    disabled={saving}
                    className="edl-btn-primary flex items-center gap-1 text-sm"
                  >
                    <span className="material-icons text-sm">check_circle</span>
                    {saving ? 'Aprobando...' : 'Aprobar propuesta'}
                  </button>
                  <button
                    onClick={() => { setRechazarId(p.concertacion_id); setObsRechazar(''); }}
                    className="edl-btn-secondary text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1 text-sm"
                  >
                    <span className="material-icons text-sm">cancel</span>
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Ver detalles de la propuesta completa */}
      {verDetalleId && (() => {
        const p = propuestas.find(x => x.concertacion_id === verDetalleId);
        if (!p) return null;
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-inst-surface rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-inst-borde sticky top-0 bg-inst-surface z-10">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-inst-azul">assignment</span>
                  <h3 className="font-heading font-bold text-inst-azul text-lg">
                    Propuesta de {p.evaluado_nombre}
                  </h3>
                </div>
                <button onClick={() => setVerDetalleId(null)} className="text-inst-texto-claro hover:text-inst-texto p-1">
                  <span className="material-icons">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Info general */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="text-xs uppercase font-bold text-inst-texto-claro block">Evaluado</span>
                    <span className="text-sm text-inst-texto">{p.evaluado_nombre}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-inst-texto-claro block">Evaluador</span>
                    <span className="text-sm text-inst-texto">{p.evaluador_nombre}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-inst-texto-claro block">Período</span>
                    <span className="text-sm text-inst-texto">{p.periodo_nombre}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-inst-texto-claro block">Tipo de evaluación</span>
                    <span className="text-sm text-inst-texto">{p.evaluacion_tipo}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-inst-texto-claro block">Fecha de creación</span>
                    <span className="text-sm text-inst-texto">{new Date(p.creado_en).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-inst-texto-claro block">Concertación ID</span>
                    <span className="text-sm text-inst-texto">#{p.concertacion_id}</span>
                  </div>
                </div>

                {/* Compromisos funcionales */}
                {p.funcionales.length > 0 && (
                  <div>
                    <h4 className="font-heading font-bold text-inst-azul text-sm mb-2 flex items-center gap-1">
                      <span className="material-icons text-sm">task_alt</span>
                      Compromisos Funcionales ({p.funcionales.length})
                    </h4>
                    <div className="space-y-3">
                      {p.funcionales.map((c, i) => (
                        <div key={c.id} className="border border-inst-borde rounded-lg p-4 bg-inst-surface">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-bold text-inst-texto-claro">#{i + 1}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_COLORS[c.estado] || 'bg-gray-200'}`}>
                              {c.estado === 'propuesto' ? 'Propuesto' : c.estado}
                            </span>
                          </div>
                          <p className="text-sm text-inst-texto mb-2">{c.descripcion}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {c.resultado_esperado && (
                              <div><span className="font-bold text-inst-texto-claro">Resultado:</span> <span className="text-inst-azul">{c.resultado_esperado}</span></div>
                            )}
                            {c.medio_verificacion && (
                              <div><span className="font-bold text-inst-texto-claro">Verificación:</span> <span className="text-inst-texto">{c.medio_verificacion}</span></div>
                            )}
                            {c.meta_descripcion && (
                              <div><span className="font-bold text-inst-texto-claro">Meta:</span> <span className="text-inst-texto">{c.meta_descripcion}</span></div>
                            )}
                            <div><span className="font-bold text-inst-texto-claro">Peso:</span> <span className="font-bold text-inst-azul">{Number(c.peso)}%</span></div>
                          </div>
                          {c.observaciones_evaluado && (
                            <div className="mt-2 text-xs text-inst-texto-claro italic bg-gray-50 p-2 rounded">
                              <span className="font-bold">Obs. evaluado:</span> {c.observaciones_evaluado}
                            </div>
                          )}
                          {c.observaciones_evaluador && (
                            <div className="mt-1 text-xs text-inst-texto-claro italic bg-gray-50 p-2 rounded">
                              <span className="font-bold">Obs. evaluador:</span> {c.observaciones_evaluador}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Competencias comportamentales */}
                {p.comportamentales.length > 0 && (
                  <div>
                    <h4 className="font-heading font-bold text-inst-azul text-sm mb-2 flex items-center gap-1">
                      <span className="material-icons text-sm">psychology</span>
                      Competencias Comportamentales ({p.comportamentales.length})
                    </h4>
                    <div className="space-y-3">
                      {p.comportamentales.map((c, i) => (
                        <div key={c.id} className="border border-inst-borde rounded-lg p-4 bg-inst-surface">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-bold text-inst-texto-claro">#{i + 1}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_COLORS[c.estado] || 'bg-gray-200'}`}>
                              {c.estado === 'propuesto' ? 'Propuesto' : c.estado}
                            </span>
                          </div>
                          <p className="text-sm text-inst-texto mb-1">
                            {c.competencia_nombre || c.descripcion}
                          </p>
                          {c.competencia_codigo && (
                            <p className="text-xs text-inst-texto-claro">Código: {c.competencia_codigo}</p>
                          )}
                          {c.observaciones_evaluado && (
                            <div className="mt-2 text-xs text-inst-texto-claro italic bg-gray-50 p-2 rounded">
                              <span className="font-bold">Obs. evaluado:</span> {c.observaciones_evaluado}
                            </div>
                          )}
                          {c.observaciones_evaluador && (
                            <div className="mt-1 text-xs text-inst-texto-claro italic bg-gray-50 p-2 rounded">
                              <span className="font-bold">Obs. evaluador:</span> {c.observaciones_evaluador}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badge de propuesto por */}
                {p.compromisos.some(c => c.es_propuesto_evaluado) && (
                  <div className="text-xs text-inst-azul bg-inst-azul-surface p-2 rounded flex items-center gap-1">
                    <span className="material-icons text-sm">info</span>
                    Esta propuesta fue realizada por el evaluado
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-2 p-5 border-t border-inst-borde sticky bottom-0 bg-inst-surface">
                <button
                  onClick={() => confirmarAprobacion(p.concertacion_id)}
                  disabled={saving}
                  className="edl-btn-primary flex items-center gap-1 text-sm flex-1 justify-center"
                >
                  <span className="material-icons text-sm">check_circle</span>
                  {saving ? 'Aprobando...' : 'Aprobar propuesta'}
                </button>
                <button
                  onClick={() => { setVerDetalleId(null); setRechazarId(p.concertacion_id); setObsRechazar(''); }}
                  className="edl-btn-secondary text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1 text-sm flex-1 justify-center"
                >
                  <span className="material-icons text-sm">cancel</span>
                  Rechazar
                </button>
                <button
                  onClick={() => setVerDetalleId(null)}
                  className="edl-btn-secondary flex items-center gap-1 text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <Toaster position="top-right" richColors />
    </div>
  );
}
