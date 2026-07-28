import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../lib/api';
import { Select } from '../../components/ui';

interface Evaluado {
  documento: string;
  nombre_completo: string;
  primer_nombre: string;
}

interface CompromisoFuncional {
  id: number;
  tipo: string;
  descripcion: string;
  peso: number;
  estado: string;
  meta_id?: number;
  meta_descripcion?: string;
  meta_nombre?: string;
  resultado_esperado?: string;
  medio_verificacion?: string;
  plazo?: string;
  motivo_ajuste?: string;
  fecha_ajuste?: string;
}

interface CompromisoComportamental {
  id: number;
  tipo: string;
  descripcion: string;
  estado: string;
  competencia_nombre?: string;
  competencia_codigo?: string;
  competencia_decreto?: string;
  es_propuesto_jefe?: number;
  motivo_ajuste?: string;
  fecha_ajuste?: string;
}

interface Meta {
  id: number;
  descripcion: string;
}

interface Competencia {
  id: string;
  nombre: string;
  decreto: string;
  descripcion: string;
}

const MOTIVOS_AJUSTE = [
  { value: 'cambios_planes_metas', label: 'Cambios en los planes institucionales o metas' },
  { value: 'separacion_temporal_30_dias', label: 'Separación temporal del cargo por >30 días calendario' },
  { value: 'asignacion_funciones', label: 'Asignación de funciones' },
  { value: 'cambio_empleo_traslado_reubicacion', label: 'Cambio de empleo por traslado o reubicación' },
  { value: 'decision_comision_personal', label: 'Decisión de la Comisión de Personal ante reclamación' },
];

function formatearDecreto(d: string | undefined): string {
  if (!d) return '-';
  const m = d.match(/(\d+)\/(\d+)/);
  if (m) return `D.${m[1]}/${m[2]}`;
  return d;
}

export default function AjustarCompromisos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { evaluacionId } = useParams();
  const evaluado = (location.state as { evaluado?: Evaluado })?.evaluado;
  const { toast, confirm } = useToast();

  const [funcionales, setFuncionales] = useState<CompromisoFuncional[]>([]);
  const [comportamentales, setComportamentales] = useState<CompromisoComportamental[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [editDescripcion, setEditDescripcion] = useState('');
  const [editPeso, setEditPeso] = useState<number>(0);
  const [editMetaId, setEditMetaId] = useState<number>(0);
  const [editMotivoAjuste, setEditMotivoAjuste] = useState('');

  const [nuevoFuncionalAbierto, setNuevoFuncionalAbierto] = useState(false);
  const [nuevoFuncDesc, setNuevoFuncDesc] = useState('');
  const [nuevoFuncMeta, setNuevoFuncMeta] = useState(0);
  const [nuevoFuncPeso, setNuevoFuncPeso] = useState(0);

  const [nuevoCompAbierto, setNuevoCompAbierto] = useState(false);
  const [nuevoCompCodigo, setNuevoCompCodigo] = useState('');

  const [metas, setMetas] = useState<Meta[]>([]);
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [concertacionId, setConcertacionId] = useState<number | null>(null);

  useEffect(() => {
    if (evaluacionId) {
      cargarDatosIniciales();
      cargarCompromisos();
    }
  }, [evaluacionId]);

  async function cargarDatosIniciales() {
    try {
      const evalRes = await api.get<any>(`/evaluaciones/${evaluacionId}`);
      if (evalRes?.concertacion_id) setConcertacionId(Number(evalRes.concertacion_id));

      const [metasRes, compRes] = await Promise.all([
        api.get<any>('/metas?por_pagina=100'),
        api.get<any>('/competencias?por_pagina=100'),
      ]);
      const metasArr = Array.isArray(metasRes) ? metasRes : (metasRes?.data || []);
      const compArr = Array.isArray(compRes) ? compRes : (compRes?.data || []);
      setMetas(metasArr);
      setCompetencias(compArr);
    } catch { }
  }

  async function cargarCompromisos() {
    setLoading(true);
    try {
      const [funcRes, compRes] = await Promise.all([
        api.get<any>(`/compromisos/evaluacion/${evaluacionId}`),
        api.get<any>(`/compromisos-comportamentales/evaluacion/${evaluacionId}`),
      ]);
      const estadosIncluidos = ['propuesto', 'pendiente_aprobacion', 'aprobado', 'en_progreso', 'enviado', 'en_revision', 'devuelto'];
      const funcsTodos = (funcRes?.funcionales || []).filter((c: CompromisoFuncional) =>
        estadosIncluidos.includes(c.estado)
      );
      const compLista = Array.isArray(compRes) ? compRes : (compRes?.data || []);
      const compsTodos = compLista.filter((c: CompromisoComportamental) =>
        estadosIncluidos.includes(c.estado)
      );
      const hayActivos = funcsTodos.some((c: any) => c.estado !== 'devuelto') || compsTodos.some((c: any) => c.estado !== 'devuelto');
      if (hayActivos) {
        setFuncionales(funcsTodos.filter((c: any) => c.estado !== 'devuelto'));
        setComportamentales(compsTodos.filter((c: any) => c.estado !== 'devuelto'));
      } else {
        setFuncionales(funcsTodos);
        setComportamentales(compsTodos);
      }
    } catch (err) {
      console.error('Error cargando compromisos:', err);
    } finally {
      setLoading(false);
    }
  }

  function iniciarEdicion(c: CompromisoFuncional) {
    setEditandoId(c.id);
    setEditDescripcion(c.descripcion);
    setEditPeso(parseFloat(String(c.peso)) || 0);
    setEditMetaId(c.meta_id || 0);
    setEditMotivoAjuste(c.motivo_ajuste || '');
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setEditDescripcion('');
    setEditPeso(0);
    setEditMetaId(0);
    setEditMotivoAjuste('');
  }

  async function guardarEdicionFuncional(c: CompromisoFuncional) {
    if (!editDescripcion.trim()) { toast.error('La descripcion no puede estar vacia'); return; }
    if (editPeso <= 0 || editPeso > 100) { toast.error('El peso debe estar entre 1 y 100'); return; }
    if (!editMotivoAjuste) { toast.error('Debe seleccionar el motivo del ajuste'); return; }

    setSaving(true);
    try {
      await api.put(`/compromisos/${c.id}`, {
        descripcion: editDescripcion.trim(),
        peso: editPeso,
        meta_id: editMetaId || null,
        motivo_ajuste: editMotivoAjuste,
        fecha_ajuste: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });
      toast.success('Compromiso funcional ajustado');
      setEditandoId(null);
      cargarCompromisos();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  async function agregarFuncional() {
    if (!nuevoFuncDesc.trim()) { toast.error('La descripcion es obligatoria'); return; }
    if (!nuevoFuncMeta) { toast.error('Debe seleccionar una meta institucional'); return; }
    if (nuevoFuncPeso <= 0 || nuevoFuncPeso > 100) { toast.error('El peso debe estar entre 1 y 100'); return; }
    setSaving(true);
    try {
      await api.post('/compromisos/funcional', {
        evaluacion_id: evaluacionId,
        descripcion: nuevoFuncDesc.trim(),
        meta_id: nuevoFuncMeta,
        peso: nuevoFuncPeso,
      });
      setNuevoFuncionalAbierto(false);
      setNuevoFuncDesc('');
      setNuevoFuncMeta(0);
      setNuevoFuncPeso(0);
      toast.success('Compromiso funcional agregado');
      cargarCompromisos();
    } catch (err: any) {
      toast.error(err.message || 'Error al agregar');
    } finally {
      setSaving(false);
    }
  }

  async function agregarComportamental() {
    if (!nuevoCompCodigo) { toast.error('Debe seleccionar una competencia'); return; }
    setSaving(true);
    try {
      await api.post('/compromisos-comportamentales', {
        evaluacion_id: evaluacionId,
        competencia_codigo: nuevoCompCodigo,
      });
      setNuevoCompAbierto(false);
      setNuevoCompCodigo('');
      toast.success('Competencia comportamental agregada');
      cargarCompromisos();
    } catch (err: any) {
      toast.error(err.message || 'Error al agregar');
    } finally {
      setSaving(false);
    }
  }

  async function eliminarCompromisoFuncional(id: number) {
    confirm({
      title: 'Eliminar compromiso funcional',
      message: 'Seguro que desea eliminar este compromiso funcional?',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        await api.delete(`/compromisos/funcional/${id}`);
        toast.success('Compromiso funcional eliminado');
        cargarCompromisos();
      },
    });
  }

  async function eliminarCompromisoComportamental(id: number) {
    confirm({
      title: 'Eliminar compromiso comportamental',
      message: 'Seguro que desea eliminar este compromiso comportamental?',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        await api.delete(`/compromisos-comportamentales/${id}`);
        toast.success('Compromiso comportamental eliminado');
        cargarCompromisos();
      },
    });
  }

  async function reenviarConcertacion() {
    if (!evaluacionId) return;
    setSaving(true);
    try {
      await api.put(`/compromisos/confirmar-concertacion/${evaluacionId}`);
      toast.success('Concertacion reenviada exitosamente');
      setTimeout(() => navigate('/dashboard/compromisos-y-competencias'), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Error al reenviar');
    } finally {
      setSaving(false);
    }
  }

  const sumaPesos = funcionales.reduce((sum, f) => sum + (parseFloat(String(f.peso)) || 0), 0);

  if (!evaluado) {
    return (
      <div className="edl-card text-center py-8">
        <p className="text-inst-texto-claro">No se encontraron datos del evaluado.</p>
        <button onClick={() => navigate('/dashboard/compromisos-y-competencias')} className="edl-btn-primary mt-4">Volver</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard/compromisos-y-competencias')} className="edl-btn-secondary flex items-center gap-1 text-sm">
          <span className="material-icons text-lg">arrow_back</span>Volver
        </button>
        <h2 className="edl-section-title">Ajustar compromisos de {evaluado.nombre_completo}</h2>
      </div>

      {loading ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
      ) : (
        <>
          {/* Funcionales */}
          <div className="edl-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-inst-azul flex items-center gap-2">
                <span className="material-icons">work</span>Compromisos funcionales
              </h3>
              <button onClick={() => setNuevoFuncionalAbierto(!nuevoFuncionalAbierto)} className="edl-btn-primary text-sm flex items-center gap-1">
                <span className="material-icons text-sm">add</span>Agregar funcional
              </button>
            </div>

            {nuevoFuncionalAbierto && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                <h4 className="text-sm font-bold text-inst-azul">Nuevo compromiso funcional</h4>
                <div>
                  <label className="edl-label">Descripcion</label>
                  <textarea value={nuevoFuncDesc} onChange={e => setNuevoFuncDesc(e.target.value)} className="edl-input min-h-[60px] text-sm" placeholder="Describa el compromiso funcional..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="edl-label">Meta institucional</label>
                    <select value={nuevoFuncMeta} onChange={e => setNuevoFuncMeta(Number(e.target.value))} className="edl-input text-sm">
                      <option value={0}>Seleccione...</option>
                      {metas.map(m => <option key={m.id} value={m.id}>{m.descripcion.slice(0, 80)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="edl-label">Peso (%)</label>
                    <input type="number" min={1} max={100} value={nuevoFuncPeso || ''} onChange={e => setNuevoFuncPeso(Number(e.target.value))} className="edl-input text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={agregarFuncional} disabled={saving} className="edl-btn-primary text-sm flex items-center gap-1">
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => { setNuevoFuncionalAbierto(false); setNuevoFuncDesc(''); setNuevoFuncMeta(0); setNuevoFuncPeso(0); }} className="edl-btn-secondary text-sm">Cancelar</button>
                </div>
              </div>
            )}

            {funcionales.length === 0 ? (
              <p className="text-sm text-inst-texto-claro text-center py-4">No hay compromisos funcionales</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-inst-azul/5 text-left">
                      <th className="px-3 py-2 font-medium text-inst-azul">Meta</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Compromiso</th>
                      <th className="px-3 py-2 font-medium text-inst-azul text-center">Peso</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Motivo ajuste</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Estado</th>
                      <th className="px-3 py-2 font-medium text-inst-azul text-center">Opciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funcionales.map(c => (
                      <tr key={c.id} className="border-b border-inst-borde">
                        {editandoId === c.id ? (
                          <>
                            <td className="px-3 py-2">
                              <select value={editMetaId} onChange={e => setEditMetaId(Number(e.target.value))} className="edl-input text-xs">
                                <option value={0}>Sin meta</option>
                                {metas.map(m => <option key={m.id} value={m.id}>{m.descripcion.slice(0, 50)}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <textarea value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} className="edl-input min-h-[60px] text-sm" />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={editPeso || ''} onChange={e => setEditPeso(Number(e.target.value))} className="edl-input w-20 text-center text-sm" min={1} max={100} />
                            </td>
                            <td className="px-3 py-2">
                              <Select value={editMotivoAjuste} onChange={e => setEditMotivoAjuste(e.target.value)} options={MOTIVOS_AJUSTE} placeholder="Motivo del ajuste" className="edl-input text-xs" />
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Editando</span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => guardarEdicionFuncional(c)} disabled={saving} className="p-1 rounded hover:bg-green-50 text-green-600" title="Guardar"><span className="material-icons text-lg">check</span></button>
                                <button onClick={cancelarEdicion} className="p-1 rounded hover:bg-red-50 text-red-500" title="Cancelar"><span className="material-icons text-lg">close</span></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 text-xs text-inst-texto-claro">{c.meta_descripcion || '—'}</td>
                            <td className="px-3 py-2 text-inst-texto">{c.descripcion}</td>
                            <td className="px-3 py-2 text-center font-semibold">{parseFloat(String(c.peso))}%</td>
                            <td className="px-3 py-2 text-inst-texto-claro text-xs">
                              {c.motivo_ajuste ? MOTIVOS_AJUSTE.find(m => m.value === c.motivo_ajuste)?.label : '-'}
                            </td>
                            <td className="px-3 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${c.estado === 'aprobado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{c.estado}</span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => iniciarEdicion(c)} className="p-1 rounded hover:bg-inst-gris text-inst-azul" title="Editar"><span className="material-icons text-lg">edit</span></button>
                                <button onClick={() => eliminarCompromisoFuncional(c.id)} className="p-1 rounded hover:bg-red-50 text-red-500" title="Eliminar"><span className="material-icons text-lg">delete</span></button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-inst-azul/5">
                      <td colSpan={2} className="px-3 py-2 font-semibold text-inst-azul text-right">Total pesos:</td>
                      <td className="px-3 py-2 text-center font-bold text-inst-azul">{sumaPesos}%</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Comportamentales */}
          <div className="edl-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-inst-azul flex items-center gap-2">
                <span className="material-icons">psychology</span>Competencias comportamentales
              </h3>
              <button onClick={() => setNuevoCompAbierto(!nuevoCompAbierto)} className="edl-btn-primary text-sm flex items-center gap-1">
                <span className="material-icons text-sm">add</span>Agregar competencia
              </button>
            </div>

            {nuevoCompAbierto && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                <h4 className="text-sm font-bold text-inst-azul">Nueva competencia comportamental</h4>
                <div>
                  <label className="edl-label">Competencia</label>
                  <select value={nuevoCompCodigo} onChange={e => setNuevoCompCodigo(e.target.value)} className="edl-input text-sm">
                    <option value="">Seleccione...</option>
                    {competencias.map(comp => (
                      <option key={comp.id} value={comp.id}>
                        {comp.nombre} ({comp.id}) — {formatearDecreto(comp.decreto)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={agregarComportamental} disabled={saving || !nuevoCompCodigo} className="edl-btn-primary text-sm flex items-center gap-1">
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => { setNuevoCompAbierto(false); setNuevoCompCodigo(''); }} className="edl-btn-secondary text-sm">Cancelar</button>
                </div>
              </div>
            )}

            {comportamentales.length === 0 ? (
              <p className="text-sm text-inst-texto-claro text-center py-4">No hay compromisos comportamentales</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-inst-azul/5 text-left">
                      <th className="px-3 py-2 font-medium text-inst-azul">Competencia</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Codigo</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Decreto</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Estado</th>
                      <th className="px-3 py-2 font-medium text-inst-azul text-center">Opciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comportamentales.map(c => (
                      <tr key={c.id} className="border-b border-inst-borde">
                        <td className="px-3 py-2 text-inst-texto">{c.competencia_nombre || c.descripcion}</td>
                        <td className="px-3 py-2 text-xs text-inst-texto-claro">{c.competencia_codigo || '—'}</td>
                        <td className="px-3 py-2 text-inst-texto-claro text-xs">{formatearDecreto(c.competencia_decreto)}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${c.estado === 'aprobado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{c.estado}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => eliminarCompromisoComportamental(c.id)} className="p-1 rounded hover:bg-red-50 text-red-500" title="Eliminar">
                            <span className="material-icons text-lg">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reenviar */}
          <div className="flex items-center gap-4">
            <button onClick={reenviarConcertacion} disabled={saving} className="edl-btn-primary flex items-center gap-2 px-6 py-3">
              <span className="material-icons text-lg">send</span>
              {saving ? 'Reenviando...' : 'Reenviar concertacion'}
            </button>
            <button onClick={() => navigate('/dashboard/compromisos-y-competencias')} className="edl-btn-secondary">Cancelar</button>
          </div>

          <Toaster position="top-right" richColors />
        </>
      )}
    </div>
  );
}
