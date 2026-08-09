import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from '../../lib/api';

interface Evaluado {
  documento: string;
  nombre_completo: string;
  primer_nombre: string;
}

interface Conducta {
  id: number;
  texto: string;
  orden: number;
}

interface Compromiso {
  id: number;
  tipo: string;
  descripcion: string;
  peso: number;
  estado: string;
  meta_descripcion?: string;
  competencia_nombre?: string;
  competencia_decreto?: string;
  competencia_codigo?: string;
  es_propuesto_jefe?: number;
  es_propuesto_evaluado?: number;
  observaciones_evaluador?: string;
  conductas?: Conducta[];
}

function formatearDecreto(d: string | undefined): string {
  if (!d) return '-';
  const m = d.match(/(\d+)\/(\d+)/);
  if (m) return `D.${m[1]}/${m[2]}`;
  return d;
}

export default function VerCompromisosPropuestos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { evaluacionId } = useParams();
  const evaluado = (location.state as { evaluado?: Evaluado })?.evaluado;

  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [concertacionId, setConcertacionId] = useState<number | null>(null);

  const [rechazoModal, setRechazoModal] = useState(false);
  const [rechazoObs, setRechazoObs] = useState('');

  const [expandido, setExpandido] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (evaluacionId) cargarCompromisos();
  }, [evaluacionId]);

  async function cargarCompromisos() {
    setLoading(true);
    try {
      const evalRes = await api.get<any>(`/evaluaciones/${evaluacionId}`);
      if (evalRes?.concertacion_id) {
        setConcertacionId(Number(evalRes.concertacion_id));
      }

      const [funcRes, compRes] = await Promise.all([
        api.get<any>(`/compromisos/evaluacion/${evaluacionId}`),
        api.get<any>(`/compromisos-comportamentales/evaluacion/${evaluacionId}`),
      ]);
      const funcionales = (funcRes?.funcionales || []).map((c: any) => ({ ...c, tipo: 'funcional' }));
      const compLista = Array.isArray(compRes) ? compRes : (compRes?.data || []);
      const comportamentales = compLista.map((c: any) => ({ ...c, tipo: 'comportamental' }));
      const todos = [...funcionales, ...comportamentales];
      const propuestos = todos.filter((c: Compromiso) =>
        ['propuesto', 'pendiente', 'pendiente_aprobacion'].includes(c.estado)
      );
      setCompromisos(propuestos);
    } catch (err) {
      console.error('Error cargando compromisos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAceptarTodo() {
    if (!concertacionId) {
      setMessage({ tipo: 'error', texto: 'No se encontró la concertación asociada.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await api.put(`/concertaciones/${concertacionId}/aprobar-pendientes`);
      setMessage({ tipo: 'ok', texto: 'Todos los compromisos fueron aprobados correctamente.' });
      cargarCompromisos();
    } catch (err: any) {
      setMessage({ tipo: 'error', texto: err.message || 'Error al aprobar compromisos' });
    } finally {
      setSaving(false);
    }
  }

  async function handleRechazarTodo() {
    if (!concertacionId) {
      setMessage({ tipo: 'error', texto: 'No se encontró la concertación asociada.' });
      return;
    }
    if (!rechazoObs.trim()) {
      setMessage({ tipo: 'error', texto: 'Debe indicar el motivo del rechazo' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await api.put(`/concertaciones/${concertacionId}/rechazar-pendientes`, {
        observaciones: rechazoObs.trim(),
      });
      setRechazoModal(false);
      setRechazoObs('');
      setMessage({ tipo: 'ok', texto: 'Todos los compromisos fueron devueltos al evaluado para ajuste.' });
      cargarCompromisos();
    } catch (err: any) {
      setMessage({ tipo: 'error', texto: err.message || 'Error al rechazar compromisos' });
    } finally {
      setSaving(false);
    }
  }

  if (!evaluado) {
    return (
      <div className="edl-card text-center py-8">
        <p className="text-inst-texto-claro">No se encontraron datos del evaluado.</p>
        <button onClick={() => navigate('/dashboard/compromisos-y-competencias')} className="edl-btn-primary mt-4">Volver</button>
      </div>
    );
  }

  const funcionales = compromisos.filter(c => c.tipo === 'funcional');
  const comportamentales = compromisos.filter(c => c.tipo === 'comportamental');
  const totalPendientes = funcionales.length + comportamentales.length;

  function toggleConductas(id: number) {
    setExpandido(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/dashboard/compromisos-y-competencias')} className="edl-btn-secondary flex items-center gap-1 text-sm">
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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-sm text-inst-texto-claro">
              <strong>{totalPendientes}</strong> compromiso(s) propuesto(s) pendiente(s) de revisión.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAceptarTodo}
                disabled={saving}
                className="edl-btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2 px-5 py-2"
              >
                <span className="material-icons text-lg">check_circle</span>
                {saving ? 'Aprobando...' : 'Aceptar todo'}
              </button>
              <button
                onClick={() => setRechazoModal(true)}
                disabled={saving}
                className="edl-btn-secondary text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-2 px-5 py-2"
              >
                <span className="material-icons text-lg">cancel</span>
                Rechazar todo
              </button>
            </div>
          </div>

          {/* Funcionales */}
          {funcionales.length > 0 && (
            <div className="edl-card mb-6">
              <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
                <span className="material-icons">work</span>Compromisos funcionales
              </h3>
              <div className="space-y-4">
                {funcionales.map(c => (
                  <div key={c.id} className="border border-inst-borde rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-inst-texto font-medium mb-2">{c.descripcion}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-inst-texto-claro">
                          {c.meta_descripcion && (
                            <span><strong>Meta:</strong> {c.meta_descripcion}</span>
                          )}
                          <span><strong>Peso:</strong> {Number(c.peso)}%</span>
                          {c.es_propuesto_evaluado ? (
                            <span className="text-inst-azul font-medium">Propuesto por evaluado</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comportamentales */}
          {comportamentales.length > 0 && (
            <div className="edl-card mb-6">
              <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
                <span className="material-icons">psychology</span>Competencias comportamentales
              </h3>
              <div className="space-y-4">
                {comportamentales.map(c => (
                  <div key={c.id} className="border border-inst-borde rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-inst-texto font-medium mb-1">
                          {c.competencia_nombre || c.descripcion}
                          <span className="text-xs text-inst-texto-claro ml-2 font-normal">
                            ({c.competencia_codigo || ''}) — {formatearDecreto(c.competencia_decreto)}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-inst-texto-claro mt-1">
                          {c.es_propuesto_evaluado ? (
                            <span className="text-inst-azul font-medium">Propuesto por evaluado</span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleConductas(c.id)}
                        className="text-xs text-inst-azul hover:underline flex items-center gap-1"
                      >
                        <span className="material-icons text-sm">{expandido[c.id] ? 'expand_less' : 'expand_more'}</span>
                        {expandido[c.id] ? 'Ocultar' : 'Ver'} conductas ({c.conductas?.length || 0})
                      </button>
                    </div>
                    {expandido[c.id] && c.conductas && c.conductas.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-inst-azul space-y-1">
                        {c.conductas
                          .sort((a, b) => a.orden - b.orden)
                          .map(cond => (
                            <p key={cond.id} className="text-xs text-inst-texto flex items-start gap-2">
                              <span className="text-inst-azul mt-0.5">•</span>
                              {cond.texto}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal rechazo masivo */}
          {rechazoModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-inst-surface rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                <h3 className="font-heading font-bold text-red-700 text-lg mb-2">Rechazar todos los compromisos</h3>
                <p className="text-xs text-inst-texto-claro mb-4">
                  Los compromisos serán devueltos al evaluado para que ajuste su propuesta.
                  Debe indicar el motivo del rechazo.
                </p>
                <div className="mb-4">
                  <label className="edl-label">Motivo del rechazo *</label>
                  <textarea
                    value={rechazoObs}
                    onChange={e => setRechazoObs(e.target.value)}
                    className="edl-input min-h-[100px]"
                    placeholder="Explique por qué rechaza estos compromisos y qué debe ajustar el evaluado..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRechazarTodo}
                    disabled={saving || !rechazoObs.trim()}
                    className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <span className="material-icons text-lg">cancel</span>
                    {saving ? 'Rechazando...' : 'Confirmar rechazo'}
                  </button>
                  <button
                    onClick={() => { setRechazoModal(false); setRechazoObs(''); }}
                    className="edl-btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
