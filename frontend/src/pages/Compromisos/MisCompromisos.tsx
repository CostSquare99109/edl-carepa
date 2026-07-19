import { useEffect, useState } from 'react';
import { api, type PaginatedData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

type ActiveView = 'list' | 'solicitudes' | 'cambio';

interface Compromiso {
  id: number;
  concertacion_id: number;
  evaluacion_id?: number;
  tipo: string;
  descripcion: string;
  peso: number;
  estado: string;
  creado_en: string;
  competencia_nombre?: string;
  meta_descripcion?: string;
}

interface Evaluacion {
  id: number;
  tipo: string;
  estado: string;
  evaluador_id: number;
  evaluador_nombre: string;
  periodo_nombre: string;
  concertacion_id?: number | null;
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente_aprobacion: { label: 'Pendiente de su aceptación', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  propuesto: { label: 'Propuesto', color: 'bg-yellow-100 text-yellow-800' },
  aprobado: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  aceptado_evaluado: { label: 'Aceptado', color: 'bg-green-200 text-green-900' },
  rechazado_evaluado: { label: 'Rechazado', color: 'bg-red-200 text-red-900' },
  devuelto: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  en_progreso: { label: 'En progreso', color: 'bg-blue-100 text-blue-800' },
  cumplido: { label: 'Cumplido', color: 'bg-green-200 text-green-900' },
  incumplido: { label: 'Incumplido', color: 'bg-red-200 text-red-900' },
  vencido: { label: 'Vencido', color: 'bg-orange-100 text-orange-800' },
};

interface PackageGrupo {
  evaluacionId: number;
  evaluacion: Evaluacion | null;
  compromisos: Compromiso[];
  /** Etiqueta visible arriba del periodo (ej. "Pendiente de aceptación", "Rechazados", "Vigentes") */
  etiqueta?: string;
  /** Clave estable para React keys en listas y en Set<expandidos>. Una por cada (evaluacion, estado relevante). */
  grupoKey: string;
}

export default function MisCompromisos() {
  const { usuario } = useAuth();
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Aceptar/rechazar
  const [rechazandoId, setRechazandoId] = useState<number | null>(null);
  const [obsRechazar, setObsRechazar] = useState('');

  // Paquetes expandidos (ojo) - usa grupoKey (string) porque cada (evaluacion, estado) tiene su propia card
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  // Vista activa (tabs exclusivos: solo una a la vez)
  const [activeView, setActiveView] = useState<ActiveView>('list');

  // Estado Solicitar Cambio de Evaluador
  const [cambioEvaluadorId, setCambioEvaluadorId] = useState<number>(0);
  const [cambioMotivo, setCambioMotivo] = useState('');
  const [cambioDescripcion, setCambioDescripcion] = useState('');

  // Estado Mis Solicitudes
  const [misSolicitudes, setMisSolicitudes] = useState<any[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [funcRes, compRes, evalRes] = await Promise.all([
        api.get<PaginatedData<Compromiso>>('/compromisos?evaluado_id=' + usuario?.id + '&por_pagina=100'),
        api.get<PaginatedData<Compromiso>>('/compromisos-comportamentales?evaluado_id=' + usuario?.id + '&por_pagina=100'),
        api.get<PaginatedData<Evaluacion>>('/evaluaciones?evaluado_id=' + usuario?.id + '&por_pagina=50'),
      ]);
      const listaUnificada: Compromiso[] = [
        ...(funcRes.data || []),
        ...(compRes.data || []),
      ];
      setCompromisos(listaUnificada);
      setEvaluaciones(evalRes.data || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }

  // Mapear concertacion_id → evaluacion_id desde evaluaciones
  const concertToEval = new Map<number, number>();
  for (const ev of evaluaciones) {
    if (ev.concertacion_id) concertToEval.set(ev.concertacion_id, ev.id);
  }

  // Agrupar compromisos por evaluacion via concertacion_id, luego subdividir
  // cada evaluacion en grupos segun el estado (vigente / rechazados).
  // Cada grupo es una CARD INDEPENDIENTE con su propio ojito.
  const paquetes: PackageGrupo[] = [];
  const evalMap = new Map(evaluaciones.map(e => [e.id, e]));
  const agrupados = new Map<number, Compromiso[]>();
  for (const c of compromisos) {
    const eid = concertToEval.get(c.concertacion_id) || c.evaluacion_id || 0;
    if (!eid) continue;
    if (!agrupados.has(eid)) agrupados.set(eid, []);
    agrupados.get(eid)!.push(c);
  }
  for (const [eid, comps] of agrupados) {
    const ev = evalMap.get(eid) || null;
    // Estados terminales: NO requieren accion del evaluado. Se muestran
    // en su propia card como "Historico" sin botones de aceptar/rechazar.
    const terminales = ['cumplido', 'incumplido', 'rechazado_evaluado'];
    const vigentes = comps.filter(c => !terminales.includes(c.estado));
    const rechazados = comps.filter(c => c.estado === 'devuelto');

    // Card VIGENTES: propuesta activa del evaluado (estado propuesto)
    if (vigentes.length > 0) {
      paquetes.push({
        evaluacionId: eid,
        evaluacion: ev,
        compromisos: vigentes,
        grupoKey: `${eid}-vigentes`,
        etiqueta: 'Pendiente de aceptación',
      });
    }
    // Card RECHAZADOS: compromisos devueltos por el evaluador (modo historico).
    // Esta card tiene su PROPIO ojito, separada de la de vigentes.
    if (rechazados.length > 0) {
      paquetes.push({
        evaluacionId: eid,
        evaluacion: ev,
        compromisos: rechazados,
        grupoKey: `${eid}-rechazados`,
        etiqueta: 'Rechazados',
      });
    }
    // Card TERMINALES: cumplidos/incumplidos como su propia card independiente.
    const terminalesComps = comps.filter(c => terminales.includes(c.estado));
    if (terminalesComps.length > 0) {
      paquetes.push({
        evaluacionId: eid,
        evaluacion: ev,
        compromisos: terminalesComps,
        grupoKey: `${eid}-terminales`,
        etiqueta: 'Cerrados',
      });
    }
  }

  function limpiarFormularioCambio() {
    setCambioEvaluadorId(0);
    setCambioMotivo('');
    setCambioDescripcion('');
  }

  function toggleVistaCambio() {
    if (activeView === 'cambio') {
      setActiveView('list');
      limpiarFormularioCambio();
    } else {
      limpiarFormularioCambio();
      setActiveView('cambio');
    }
  }

  async function solicitarCambioEvaluador() {
    if (!cambioEvaluadorId || !cambioMotivo || !cambioDescripcion.trim()) return;
    setSaving(true);
    try {
      await api.post('/solicitudes-cambio', {
        evaluador_actual_id: cambioEvaluadorId,
        motivo: cambioMotivo,
        descripcion: cambioDescripcion.trim(),
      });
      limpiarFormularioCambio();
      setActiveView('list');
      setMensaje('Solicitud de cambio de evaluador creada exitosamente.');
    } catch (err: any) {
      setMensaje(err.message || 'Error al crear solicitud');
    } finally {
      setSaving(false);
    }
  }

  async function cargarMisSolicitudes() {
    setLoadingSolicitudes(true);
    try {
      const res = await api.get<any>('/solicitudes-cambio/mis-solicitudes?por_pagina=50');
      setMisSolicitudes(res.data || res.items || []);
    } catch (err: any) {
      setMensaje(err.message || 'Error al cargar solicitudes');
    } finally {
      setLoadingSolicitudes(false);
    }
  }

  function toggleVistaSolicitudes() {
    if (activeView === 'solicitudes') {
      setActiveView('list');
      setMisSolicitudes([]);
    } else {
      setMisSolicitudes([]);
      setActiveView('solicitudes');
      cargarMisSolicitudes();
    }
  }

  function volverAListado() {
    setActiveView('list');
  }

  function toggleExpandir(grupoKey: string) {
    setExpandidos(prev => {
      const next = new Set(prev);
      if (next.has(grupoKey)) next.delete(grupoKey); else next.add(grupoKey);
      return next;
    });
  }

  async function aceptarConcertacion(evaluacionId: number) {
    setSaving(true);
    setMensaje('');
    try {
      await api.put(`/evaluaciones/${evaluacionId}/aceptar-concertacion`);
      setMensaje('Concertación aceptada exitosamente.');
      cargarDatos();
    } catch (err: any) {
      setMensaje(err.message || 'Error al aceptar');
    } finally {
      setSaving(false);
    }
  }

  async function rechazarConcertacion(evaluacionId: number) {
    if (!obsRechazar.trim()) {
      setMensaje('Debe indicar el motivo del rechazo');
      return;
    }
    setSaving(true);
    setMensaje('');
    try {
      await api.put(`/evaluaciones/${evaluacionId}/rechazar-concertacion`, {
        observaciones_evaluado: obsRechazar.trim(),
      });
      setRechazandoId(null);
      setObsRechazar('');
      setMensaje('Concertación rechazada.');
      cargarDatos();
    } catch (err: any) {
      setMensaje(err.message || 'Error al rechazar');
    } finally {
      setSaving(false);
    }
  }

  function tienePendientes(comps: Compromiso[]) {
    return comps.some(c => c.estado === 'propuesto' || c.estado === 'pendiente_aprobacion');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="edl-section-title">Mis Compromisos y Competencias</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={toggleVistaSolicitudes}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded transition-colors ${
              activeView === 'solicitudes'
                ? 'bg-inst-azul-osc text-white'
                : 'bg-white border border-inst-borde text-inst-texto hover:bg-inst-gris'
            }`}
            aria-pressed={activeView === 'solicitudes'}
          >
            <span className="material-icons text-lg">swap_horiz</span>
            Mis Solicitudes
          </button>
          <button
            onClick={toggleVistaCambio}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded transition-colors ${
              activeView === 'cambio'
                ? 'bg-inst-azul-osc text-white'
                : 'bg-white border border-inst-borde text-inst-texto hover:bg-inst-gris'
            }`}
            aria-pressed={activeView === 'cambio'}
          >
            <span className="material-icons text-lg">sync_alt</span>
            Solicitar Cambio Evaluador
          </button>
        </div>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div className={`edl-card mb-4 border-l-4 ${mensaje.includes('exitosamente') || mensaje.includes('aceptada') ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <p className="text-sm font-medium">{mensaje}</p>
        </div>
      )}

      {/* Vista: Listado de compromisos (default) */}
      {activeView === 'list' && (
        <div>
          {loading ? (
            <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
          ) : paquetes.length === 0 ? (
            <div className="edl-card text-center py-8 text-inst-texto-claro">
              No tiene compromisos registrados.
            </div>
          ) : (
            <div className="space-y-4">
              {paquetes.map(pkg => {
                const ev = pkg.evaluacion;
                const pendiente = tienePendientes(pkg.compromisos);
                const expandido = expandidos.has(pkg.grupoKey);
                const esRechazados = pkg.grupoKey.endsWith('-rechazados');
                const esCerrados = pkg.grupoKey.endsWith('-terminales');
                const esVigentes = pkg.grupoKey.endsWith('-vigentes');
                return (
                  <div key={pkg.grupoKey} className={`edl-card ${esVigentes && pendiente ? 'border-l-4 border-amber-500 bg-amber-50' : ''} ${esRechazados ? 'border-l-4 border-red-400 bg-red-50/30' : ''} ${esCerrados ? 'border-l-4 border-gray-400' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleExpandir(pkg.grupoKey)}
                          className="p-1.5 rounded-full hover:bg-inst-gris transition-colors"
                          title={expandido ? 'Ocultar compromisos' : 'Ver compromisos'}
                        >
                          <span className="material-icons text-inst-azul">{expandido ? 'visibility_off' : 'visibility'}</span>
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-heading font-bold text-inst-azul text-sm">
                              {ev?.periodo_nombre || `Evaluación #${pkg.evaluacionId}`}
                            </h3>
                            <span className="text-xs text-inst-texto-claro">
                              ({pkg.compromisos.length} compromisos)
                            </span>
                            {esVigentes && pendiente && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                                Pendiente de aceptación
                              </span>
                            )}
                            {esRechazados && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">
                                Rechazados
                              </span>
                            )}
                            {esCerrados && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                                Cerrados
                              </span>
                            )}
                          </div>
                          {ev && (
                            <p className="text-xs text-inst-texto-claro">
                              Evaluador: {ev.evaluador_nombre} · {ev.tipo === 'parcial_primer_semestre' ? '1er Semestre' : ev.tipo === 'parcial_segundo_semestre' ? '2do Semestre' : ev.tipo}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {expandido && (
                      <div className="mt-4 border-t border-inst-borde pt-4">
                        {(() => {
                          // Cada paquete ya viene con sus compromisos filtrados por estado
                          // (vigentes / rechazados / cerrados). Solo renderizamos lo que tenga.
                          const allFuncionales = pkg.compromisos.filter(c => c.tipo === 'funcional');
                          const allComportamentales = pkg.compromisos.filter(c => c.tipo === 'comportamental');
                          const getEstadoInfo = (estado: string) => ESTADO_LABELS[estado] || { label: estado, color: 'bg-gray-200 text-gray-700' };
                          const renderTabla = (items: Compromiso[], conPeso: boolean) => (
                            <div className="overflow-x-auto rounded border">
                              <table className="w-full text-sm">
                                <thead className="bg-inst-gris">
                                  <tr>
                                    <th className="text-left px-3 py-2 text-xs font-semibold text-inst-texto">#</th>
                                    <th className="text-left px-3 py-2 text-xs font-semibold text-inst-texto">{conPeso ? 'Meta' : 'Competencia'}</th>
                                    <th className="text-left px-3 py-2 text-xs font-semibold text-inst-texto">{conPeso ? 'Compromiso' : 'Descripción'}</th>
                                    {conPeso && <th className="text-center px-3 py-2 text-xs font-semibold text-inst-texto">Peso</th>}
                                    <th className="text-center px-3 py-2 text-xs font-semibold text-inst-texto">Estado</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {items.map((c, i) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 text-xs text-inst-texto-claro">{i + 1}</td>
                                      <td className="px-3 py-2 text-xs text-inst-texto">{conPeso ? (c.meta_descripcion || '—') : (c.competencia_nombre || '—')}</td>
                                      <td className="px-3 py-2 text-sm text-inst-texto">{c.descripcion}</td>
                                      {conPeso && <td className="px-3 py-2 text-center text-sm font-semibold text-inst-azul">{c.peso}%</td>}
                                      <td className="px-3 py-2 text-center"><span className={`text-xs px-1.5 py-0.5 rounded-full ${getEstadoInfo(c.estado).color}`}>{getEstadoInfo(c.estado).label}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                          return (
                            <div className="space-y-4">
                              {allFuncionales.length > 0 && (
                                <div>
                                  <h4 className="text-xs uppercase font-bold text-inst-azul mb-2 flex items-center gap-1">
                                    <span className="material-icons text-sm">task_alt</span> Compromisos Funcionales
                                  </h4>
                                  {renderTabla(allFuncionales, true)}
                                  {pkg.grupoKey.endsWith('-vigentes') && (
                                    <div className="flex justify-end px-3 py-1 text-xs text-inst-texto-claro">
                                      Total pesos: <span className="font-bold text-inst-azul ml-1">{allFuncionales.reduce((s, c) => s + (parseFloat(String(c.peso)) || 0), 0).toFixed(2)}%</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {allComportamentales.length > 0 && (
                                <div>
                                  <h4 className="text-xs uppercase font-bold text-inst-azul mb-2 flex items-center gap-1">
                                    <span className="material-icons text-sm">psychology</span> Competencias Comportamentales
                                  </h4>
                                  {renderTabla(allComportamentales, false)}
                                </div>
                              )}
                              {pkg.compromisos.length === 0 && (
                                <p className="text-sm text-inst-texto-claro text-center py-4">No hay compromisos registrados.</p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {pendiente && (
                      <div className="mt-4 border-t border-inst-borde pt-4">
                        {rechazandoId === pkg.evaluacionId ? (
                          <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="font-heading font-bold text-red-700 text-sm">Rechazar Concertación</h4>
                            <p className="text-xs text-red-600">
                              Si rechaza, el evaluador podrá ajustar los compromisos y reenviarlos.
                            </p>
                            <div>
                              <label className="edl-label">Motivo del rechazo (obligatorio)</label>
                              <textarea
                                value={obsRechazar}
                                onChange={e => setObsRechazar(e.target.value)}
                                className="edl-input min-h-[60px]"
                                placeholder="Explique por qué rechaza..."
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => rechazarConcertacion(pkg.evaluacionId)}
                                disabled={saving || !obsRechazar.trim()}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-1 text-sm disabled:opacity-50"
                              >
                                <span className="material-icons text-sm">block</span>
                                {saving ? 'Rechazando...' : 'Confirmar Rechazo'}
                              </button>
                              <button
                                onClick={() => { setRechazandoId(null); setObsRechazar(''); }}
                                className="edl-btn-secondary"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => aceptarConcertacion(pkg.evaluacionId)}
                              disabled={saving}
                              className="edl-btn-primary flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700"
                            >
                              <span className="material-icons text-lg">check_circle</span>
                              {saving ? 'Aceptando...' : 'Aceptar Concertación'}
                            </button>
                            <button
                              onClick={() => setRechazandoId(pkg.evaluacionId)}
                              className="edl-btn-secondary text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-2"
                            >
                              <span className="material-icons text-lg">cancel</span>
                              Rechazar
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
      )}

      {/* Vista: Mis Solicitudes (exclusiva) */}
      {activeView === 'solicitudes' && (
        <div className="edl-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-inst-azul">Mis Solicitudes de Cambio</h3>
            <button onClick={volverAListado} className="edl-btn-secondary text-sm">Cerrar</button>
          </div>
          {loadingSolicitudes ? (
            <p className="text-sm text-inst-texto-claro text-center py-4">Cargando solicitudes...</p>
          ) : misSolicitudes.length === 0 ? (
            <p className="text-sm text-inst-texto-claro">No has realizado solicitudes de cambio.</p>
          ) : (
            <div className="overflow-x-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-inst-gris">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-inst-texto">Fecha</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-inst-texto">Evaluador actual</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-inst-texto">Motivo</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-inst-texto">Estado</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-inst-texto">Comentario</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {misSolicitudes.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-inst-texto-claro">{new Date(s.creado_en).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-sm text-inst-texto">{s.evaluador_actual_nombres} {s.evaluador_actual_apellidos}</td>
                      <td className="px-3 py-2 text-xs text-inst-texto">
                        {s.motivo === 'retiro_empleado_responsable' ? 'Retiro del responsable' :
                          s.motivo === 'impedimento' ? 'Impedimento' : 'Recusación'}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          s.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                          s.estado === 'rechazada' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {s.estado === 'aprobada' ? 'Aprobada' : s.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-inst-texto-claro">{s.decision_comentario || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Vista: Solicitar Cambio de Evaluador (exclusiva) */}
      {activeView === 'cambio' && (
        <div className="edl-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-heading font-bold text-inst-azul">Solicitar Cambio de Evaluador</h3>
            <button onClick={volverAListado} className="edl-btn-secondary text-sm">Cerrar</button>
          </div>
          <p className="text-xs text-inst-texto-claro mb-4">
            Acuerdo 6176 de 2018 — Solicite el cambio del evaluador asignado. La solicitud será revisada por la Jefatura de Personal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="edl-label">Evaluador actual</label>
              <select value={cambioEvaluadorId} onChange={e => setCambioEvaluadorId(Number(e.target.value))} className="edl-input">
                <option value={0}>Seleccione...</option>
                {Array.from(new Map(evaluaciones.filter(ev => ev.evaluador_id).map(ev => [ev.evaluador_id, ev])).values()).map(ev => (
                  <option key={ev.evaluador_id} value={ev.evaluador_id}>{ev.evaluador_nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="edl-label">Motivo</label>
              <select value={cambioMotivo} onChange={e => setCambioMotivo(e.target.value)} className="edl-input">
                <option value="">Seleccione...</option>
                <option value="retiro_empleado_responsable">Retiro del empleado responsable</option>
                <option value="impedimento">Impedimento del evaluador</option>
                <option value="recusacion">Recusación del evaluado</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="edl-label">Descripción</label>
              <textarea
                value={cambioDescripcion}
                onChange={e => setCambioDescripcion(e.target.value)}
                className="edl-input min-h-[100px]"
                placeholder="Explique en detalle los motivos de la solicitud de cambio..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={solicitarCambioEvaluador}
              disabled={saving || !cambioEvaluadorId || !cambioMotivo || !cambioDescripcion.trim()}
              className="edl-btn-primary"
            >
              {saving ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
            <button
              onClick={volverAListado}
              className="edl-btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
