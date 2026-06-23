import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from '../../lib/api';

interface Evaluado {
  documento: string;
  nombre_completo: string;
  primer_nombre: string;
}

interface Compromiso {
  id: number;
  tipo: string;
  descripcion: string;
  peso: number;
  estado: string;
  competencia_nombre?: string;
  competencia_decreto?: string;
  es_propuesto_jefe?: number;
  observaciones_evaluador?: string;
  es_propuesto_evaluado?: number;
}

export default function VerCompromisosPropuestos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { evaluacionId } = useParams();
  const evaluado = (location.state as { evaluado?: Evaluado })?.evaluado;

  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const [aprobarId, setAprobarId] = useState<number | null>(null);
  const [aprobarPeso, setAprobarPeso] = useState('');
  const [aprobarObs, setAprobarObs] = useState('');
  const [savingAprobar, setSavingAprobar] = useState(false);

  const [rechazarId, setRechazarId] = useState<number | null>(null);
  const [rechazarObs, setRechazarObs] = useState('');
  const [savingRechazar, setSavingRechazar] = useState(false);

  useEffect(() => {
    if (evaluacionId) cargarCompromisos();
  }, [evaluacionId]);

  async function cargarCompromisos() {
    setLoading(true);
    try {
      const res = await api.get<any>(`/compromisos/evaluacion/${evaluacionId}`);
      const todos = [...(res?.funcionales || []), ...(res?.comportamentales || [])];
      const propuestos = todos.filter((c: Compromiso) =>
        c.estado === 'propuesto' || c.estado === 'pendiente'
      );
      setCompromisos(propuestos);
    } catch (err) {
      console.error('Error cargando compromisos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function confirmarAprobacion(comp: Compromiso) {
    const pesoNum = parseFloat(aprobarPeso);
    if (isNaN(pesoNum) || pesoNum < 0 || pesoNum > 100) {
      setMessage({ tipo: 'error', texto: 'El peso debe ser un número entre 0 y 100' });
      return;
    }
    setSavingAprobar(true);
    setMessage(null);
    try {
      await api.put(`/compromisos/${comp.id}/aprobar`, {
        peso: pesoNum,
        observaciones_evaluador: aprobarObs.trim() || null,
      });
      setAprobarId(null);
      setAprobarPeso('');
      setAprobarObs('');
      setCompromisos(prev => prev.filter(c => c.id !== comp.id));
      setMessage({ tipo: 'ok', texto: `Compromiso "${comp.descripcion.slice(0, 50)}..." aprobado correctamente.` });
    } catch (err: any) {
      setMessage({ tipo: 'error', texto: err.message || 'Error al aprobar' });
    } finally {
      setSavingAprobar(false);
    }
  }

  async function confirmarRechazo(comp: Compromiso) {
    if (!rechazarObs.trim()) {
      setMessage({ tipo: 'error', texto: 'Debe indicar el motivo del rechazo' });
      return;
    }
    setSavingRechazar(true);
    setMessage(null);
    try {
      await api.put(`/compromisos/${comp.id}/rechazar`, {
        observaciones_evaluador: rechazarObs.trim(),
      });
      setRechazarId(null);
      setRechazarObs('');
      setCompromisos(prev => prev.filter(c => c.id !== comp.id));
      setMessage({ tipo: 'ok', texto: `Compromiso rechazado. El evaluado será notificado para ajustar su propuesta.` });
    } catch (err: any) {
      setMessage({ tipo: 'error', texto: err.message || 'Error al rechazar' });
    } finally {
      setSavingRechazar(false);
    }
  }

  if (!evaluado) {
    return (
      <div className="edl-card text-center py-8">
        <p className="text-inst-texto-claro">No se encontraron datos del evaluado.</p>
        <button onClick={() => navigate('/compromisos-y-competencias')} className="edl-btn-primary mt-4">Volver</button>
      </div>
    );
  }

  const funcionales = compromisos.filter(c => c.tipo === 'funcional');
  const comportamentales = compromisos.filter(c => c.tipo === 'comportamental');
  const totalPendientes = funcionales.length + comportamentales.length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/compromisos-y-competencias')} className="edl-btn-secondary flex items-center gap-1 text-sm">
          <span className="material-icons text-lg">arrow_back</span>Volver
        </button>
        <h2 className="edl-section-title">Compromisos propuestos por {evaluado.nombre_completo}</h2>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg border-l-4 ${
          message.tipo === 'ok'
            ? 'border-green-500 bg-green-50 text-green-800'
            : 'border-red-500 bg-red-50 text-red-800'
        }`}>
          <p className="text-sm">{message.texto}</p>
        </div>
      )}

      {loading ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
      ) : totalPendientes === 0 ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">
          No hay compromisos propuestos por el evaluado para esta evaluación.
        </div>
      ) : (
        <>
          <div className="text-sm text-inst-texto-claro mb-4">
            <strong>{totalPendientes}</strong> compromiso(s) propuesto(s) pendente(s) de revisión.
            Puede aprobarlos asignando un peso o rechazarlos con observaciones.
          </div>

          {/* Funcionales */}
          {funcionales.length > 0 && (
            <div className="edl-card mb-6">
              <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
                <span className="material-icons">work</span>Compromisos funcionales propuestos
              </h3>
              <div className="space-y-4">
                {funcionales.map(c => {
                  const isAprobar = aprobarId === c.id;
                  const isRechazar = rechazarId === c.id;
                  return (
                    <div key={c.id} className="border border-inst-borde rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-inst-texto mb-1">{c.descripcion}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-inst-texto-claro">
                            <span>Peso propuesto: <strong>{Number(c.peso)}%</strong></span>
                            {c.es_propuesto_evaluado ? (
                              <span className="text-blue-700">Propuesto por evaluado</span>
                            ) : null}
                            {c.es_propuesto_jefe ? (
                              <span className="text-green-700">Propuesto por jefe de entidad</span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-auto">
                          {aprobarId !== c.id && rechazarId !== c.id && (
                            <>
                              <button
                                onClick={() => { setAprobarId(c.id); setRechazarId(null); setAprobarPeso(''); setAprobarObs(''); }}
                                className="edl-btn-primary text-sm flex items-center gap-1"
                              >
                                <span className="material-icons text-sm">check_circle</span>
                                Aprobar
                              </button>
                              <button
                                onClick={() => { setRechazarId(c.id); setAprobarId(null); setRechazarObs(''); }}
                                className="edl-btn-secondary text-sm text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                              >
                                <span className="material-icons text-sm">cancel</span>
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Panel aprobar */}
                      {isAprobar && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-heading font-bold text-inst-azul text-sm mb-3">Aprobar compromiso</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="edl-label">Peso a asignar (%) *</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={aprobarPeso}
                                onChange={e => setAprobarPeso(e.target.value)}
                                className="edl-input"
                                placeholder="0 - 100"
                              />
                            </div>
                            <div>
                              <label className="edl-label">Observaciones (opcional)</label>
                              <input
                                type="text"
                                value={aprobarObs}
                                onChange={e => setAprobarObs(e.target.value)}
                                className="edl-input"
                                placeholder="Observaciones del evaluador..."
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmarAprobacion(c)}
                              disabled={savingAprobar || !aprobarPeso}
                              className="edl-btn-primary flex items-center gap-1 text-sm"
                            >
                              <span className="material-icons text-sm">check</span>
                              {savingAprobar ? 'Confirmando...' : 'Confirmar aprobación'}
                            </button>
                            <button
                              onClick={() => { setAprobarId(null); setAprobarPeso(''); setAprobarObs(''); }}
                              className="edl-btn-secondary text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Panel rechazar */}
                      {isRechazar && (
                        <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-heading font-bold text-red-700 text-sm mb-2">
                            Rechazar compromiso — obligatorio indicar motivo
                          </h4>
                          <div className="mb-3">
                            <label className="edl-label">Motivo del rechazo *</label>
                            <textarea
                              value={rechazarObs}
                              onChange={e => setRechazarObs(e.target.value)}
                              className="edl-input min-h-[60px]"
                              placeholder="Explique por qué rechaza este compromiso y qué debe ajustar el evaluado..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmarRechazo(c)}
                              disabled={savingRechazar || !rechazarObs.trim()}
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-1 text-sm disabled:opacity-50"
                            >
                              <span className="material-icons text-sm">cancel</span>
                              {savingRechazar ? 'Confirmando...' : 'Confirmar rechazo'}
                            </button>
                            <button
                              onClick={() => { setRechazarId(null); setRechazarObs(''); }}
                              className="edl-btn-secondary text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comportamentales */}
          {comportamentales.length > 0 && (
            <div className="edl-card">
              <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
                <span className="material-icons">psychology</span>Compromisos comportamentales propuestos
              </h3>
              <div className="space-y-4">
                {comportamentales.map(c => {
                  const isAprobar = aprobarId === c.id;
                  const isRechazar = rechazarId === c.id;
                  return (
                    <div key={c.id} className="border border-inst-borde rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-inst-texto mb-1">{c.competencia_nombre || c.descripcion}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-inst-texto-claro">
                            <span>{c.competencia_decreto === '2539_2005' ? 'D.2539/2005' : c.competencia_decreto === '815_2018' ? 'D.815/2018' : '-'}</span>
                            {c.es_propuesto_jefe ? (
                              <span className="text-green-700 flex items-center gap-1">
                                <span className="material-icons text-sm">check</span>Propuesto por jefe
                              </span>
                            ) : (
                              <span className="text-blue-700">Propuesto por evaluado</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-auto">
                          {aprobarId !== c.id && rechazarId !== c.id && (
                            <>
                              <button
                                onClick={() => { setAprobarId(c.id); setRechazarId(null); setAprobarPeso('0'); setAprobarObs(''); }}
                                className="edl-btn-primary text-sm flex items-center gap-1"
                              >
                                <span className="material-icons text-sm">check_circle</span>
                                Aprobar
                              </button>
                              <button
                                onClick={() => { setRechazarId(c.id); setAprobarId(null); setRechazarObs(''); }}
                                className="edl-btn-secondary text-sm text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                              >
                                <span className="material-icons text-sm">cancel</span>
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Panel aprobar */}
                      {isAprobar && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-heading font-bold text-inst-azul text-sm mb-3">Aprobar competencia</h4>
                          <div className="mb-3">
                            <label className="edl-label">Observaciones (opcional)</label>
                            <input
                              type="text"
                              value={aprobarObs}
                              onChange={e => setAprobarObs(e.target.value)}
                              className="edl-input"
                              placeholder="Observaciones del evaluador..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmarAprobacion(c)}
                              disabled={savingAprobar}
                              className="edl-btn-primary flex items-center gap-1 text-sm"
                            >
                              <span className="material-icons text-sm">check</span>
                              {savingAprobar ? 'Confirmando...' : 'Confirmar aprobación'}
                            </button>
                            <button
                              onClick={() => { setAprobarId(null); setAprobarObs(''); }}
                              className="edl-btn-secondary text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Panel rechazar */}
                      {isRechazar && (
                        <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-heading font-bold text-red-700 text-sm mb-2">
                            Rechazar — obligatorio indicar motivo
                          </h4>
                          <div className="mb-3">
                            <label className="edl-label">Motivo del rechazo *</label>
                            <textarea
                              value={rechazarObs}
                              onChange={e => setRechazarObs(e.target.value)}
                              className="edl-input min-h-[60px]"
                              placeholder="Explique por qué rechaza esta competencia y qué debe ajustar el evaluado..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmarRechazo(c)}
                              disabled={savingRechazar || !rechazarObs.trim()}
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-1 text-sm disabled:opacity-50"
                            >
                              <span className="material-icons text-sm">cancel</span>
                              {savingRechazar ? 'Confirmando...' : 'Confirmar rechazo'}
                            </button>
                            <button
                              onClick={() => { setRechazarId(null); setRechazarObs(''); }}
                              className="edl-btn-secondary text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}