import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from '../../lib/api';

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
  meta_nombre?: string;
  resultado_esperado?: string;
  medio_verificacion?: string;
  plazo?: string;
}

interface CompromisoComportamental {
  id: number;
  tipo: string;
  descripcion: string;
  estado: string;
  competencia_nombre?: string;
  competencia_decreto?: string;
  es_propuesto_jefe?: number;
}

export default function AjustarCompromisos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { evaluacionId } = useParams();
  const evaluado = (location.state as { evaluado?: Evaluado })?.evaluado;

  const [funcionales, setFuncionales] = useState<CompromisoFuncional[]>([]);
  const [comportamentales, setComportamentales] = useState<CompromisoComportamental[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Campos de edición funcional
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editPeso, setEditPeso] = useState<number>(0);

  useEffect(() => {
    if (evaluacionId) cargarCompromisos();
  }, [evaluacionId]);

  async function cargarCompromisos() {
    setLoading(true);
    try {
      const res = await api.get<any>(`/compromisos/evaluacion/${evaluacionId}`);
      // Solo compromisos concertados (aprobados o en progreso) se pueden ajustar
      const funcs = (res?.funcionales || []).filter((c: CompromisoFuncional) =>
        ['aprobado', 'en_progreso', 'enviado', 'en_revision'].includes(c.estado)
      );
      const comps = (res?.comportamentales || []).filter((c: CompromisoComportamental) =>
        ['aprobado', 'en_progreso', 'enviado', 'en_revision'].includes(c.estado)
      );
      setFuncionales(funcs);
      setComportamentales(comps);
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
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setEditDescripcion('');
    setEditPeso(0);
  }

  async function guardarEdicionFuncional(c: CompromisoFuncional) {
    if (!editDescripcion.trim()) {
      setMensaje('La descripcion no puede estar vacia');
      return;
    }
    if (editPeso <= 0 || editPeso > 100) {
      setMensaje('El peso debe estar entre 1 y 100');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/compromisos/${c.id}`, {
        descripcion: editDescripcion.trim(),
        peso: editPeso,
      });
      setMensaje('Compromiso funcional actualizado');
      setEditandoId(null);
      cargarCompromisos();
    } catch (err: any) {
      setMensaje(err.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  async function eliminarCompromisoFuncional(id: number) {
    if (!confirm('Seguro que desea eliminar este compromiso funcional?')) return;
    try {
      await api.delete(`/compromisos/funcional/${id}`);
      setMensaje('Compromiso funcional eliminado');
      cargarCompromisos();
    } catch (err: any) {
      setMensaje(err.message || 'Error al eliminar');
    }
  }

  async function eliminarCompromisoComportamental(id: number) {
    if (!confirm('Seguro que desea eliminar este compromiso comportamental?')) return;
    try {
      await api.delete(`/compromisos/${id}`);
      setMensaje('Compromiso comportamental eliminado');
      cargarCompromisos();
    } catch (err: any) {
      setMensaje(err.message || 'Error al eliminar');
    }
  }

  async function reenviarConcertacion() {
    if (!evaluacionId) return;
    setSaving(true);
    try {
      await api.put(`/compromisos/confirmar-concertacion/${evaluacionId}`);
      setMensaje('Concertacion reenviada exitosamente');
      setTimeout(() => navigate('/compromisos-y-competencias'), 2000);
    } catch (err: any) {
      setMensaje(err.message || 'Error al reenviar');
    } finally {
      setSaving(false);
    }
  }

  const sumaPesos = funcionales.reduce((sum, f) => sum + (parseFloat(String(f.peso)) || 0), 0);

  if (!evaluado) {
    return (
      <div className="edl-card text-center py-8">
        <p className="text-inst-texto-claro">No se encontraron datos del evaluado.</p>
        <button onClick={() => navigate('/compromisos-y-competencias')} className="edl-btn-primary mt-4">Volver</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/compromisos-y-competencias')} className="edl-btn-secondary flex items-center gap-1 text-sm">
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
            <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
              <span className="material-icons">work</span>Compromisos funcionales
            </h3>
            {funcionales.length === 0 ? (
              <p className="text-sm text-inst-texto-claro text-center py-4">No hay compromisos funcionales concertados para ajustar</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-inst-azul/5 text-left">
                      <th className="px-3 py-2 font-medium text-inst-azul">Compromiso</th>
                      <th className="px-3 py-2 font-medium text-inst-azul text-center">Peso</th>
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
                              <textarea
                                value={editDescripcion}
                                onChange={e => setEditDescripcion(e.target.value)}
                                className="edl-input min-h-[60px] text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={editPeso || ''}
                                onChange={e => setEditPeso(Number(e.target.value))}
                                className="edl-input w-20 text-center text-sm"
                                min={1}
                                max={100}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Editando</span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => guardarEdicionFuncional(c)}
                                  disabled={saving}
                                  className="p-1 rounded hover:bg-green-50 text-green-600"
                                  title="Guardar"
                                >
                                  <span className="material-icons text-lg">check</span>
                                </button>
                                <button
                                  onClick={cancelarEdicion}
                                  className="p-1 rounded hover:bg-red-50 text-red-500"
                                  title="Cancelar"
                                >
                                  <span className="material-icons text-lg">close</span>
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 text-inst-texto">{c.descripcion}</td>
                            <td className="px-3 py-2 text-center font-semibold">{parseFloat(String(c.peso))}%</td>
                            <td className="px-3 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                c.estado === 'aprobado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>{c.estado}</span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => iniciarEdicion(c)}
                                  className="p-1 rounded hover:bg-inst-gris text-inst-azul"
                                  title="Editar"
                                >
                                  <span className="material-icons text-lg">edit</span>
                                </button>
                                <button
                                  onClick={() => eliminarCompromisoFuncional(c.id)}
                                  className="p-1 rounded hover:bg-red-50 text-red-500"
                                  title="Eliminar"
                                >
                                  <span className="material-icons text-lg">delete</span>
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-inst-azul/5">
                      <td className="px-3 py-2 font-semibold text-inst-azul text-right">Total pesos:</td>
                      <td className="px-3 py-2 text-center font-bold text-inst-azul">{sumaPesos}%</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Comportamentales */}
          <div className="edl-card mb-6">
            <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
              <span className="material-icons">psychology</span>Compromisos comportamentales
            </h3>
            {comportamentales.length === 0 ? (
              <p className="text-sm text-inst-texto-claro text-center py-4">No hay compromisos comportamentales concertados para ajustar</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-inst-azul/5 text-left">
                      <th className="px-3 py-2 font-medium text-inst-azul">Compromiso</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Decreto</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Estado</th>
                      <th className="px-3 py-2 font-medium text-inst-azul text-center">Opciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comportamentales.map(c => (
                      <tr key={c.id} className="border-b border-inst-borde">
                        <td className="px-3 py-2 text-inst-texto">{c.competencia_nombre || c.descripcion}</td>
                        <td className="px-3 py-2 text-inst-texto-claro text-xs">
                          {c.competencia_decreto === '2539_2005' ? 'D.2539/2005' : c.competencia_decreto === '815_2018' ? 'D.815/2018' : '-'}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            c.estado === 'aprobado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>{c.estado}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => eliminarCompromisoComportamental(c.id)}
                            className="p-1 rounded hover:bg-red-50 text-red-500"
                            title="Eliminar"
                          >
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
            <button
              onClick={reenviarConcertacion}
              disabled={saving}
              className="edl-btn-primary flex items-center gap-2 px-6 py-3"
            >
              <span className="material-icons text-lg">send</span>
              {saving ? 'Reenviando...' : 'Reenviar concertacion'}
            </button>
            <button onClick={() => navigate('/compromisos-y-competencias')} className="edl-btn-secondary">Cancelar</button>
          </div>

          {/* Mensaje */}
          {mensaje && (
            <div className={`mt-4 p-3 rounded text-sm font-medium ${
              mensaje.includes('exitosamente') || mensaje.includes('actualizado') || mensaje.includes('eliminado')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {mensaje}
            </div>
          )}
        </>
      )}
    </div>
  );
}
