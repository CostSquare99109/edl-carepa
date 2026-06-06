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
}

export default function VerCompromisosPropuestos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { evaluacionId } = useParams();
  const evaluado = (location.state as { evaluado?: Evaluado })?.evaluado;

  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (evaluacionId) cargarCompromisos();
  }, [evaluacionId]);

  async function cargarCompromisos() {
    setLoading(true);
    try {
      const res = await api.get<any>(`/compromisos/evaluacion/${evaluacionId}`);
      // Filtrar solo los propuestos por el evaluado (no por el jefe)
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/compromisos-y-competencias')} className="edl-btn-secondary flex items-center gap-1 text-sm">
          <span className="material-icons text-lg">arrow_back</span>Volver
        </button>
        <h2 className="edl-section-title">Compromisos propuestos por {evaluado.nombre_completo}</h2>
      </div>

      {loading ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
      ) : compromisos.length === 0 ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">
          No hay compromisos propuestos por el evaluado para esta evaluacion.
        </div>
      ) : (
        <>
          {/* Funcionales */}
          {funcionales.length > 0 && (
            <div className="edl-card mb-6">
              <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
                <span className="material-icons">work</span>Compromisos funcionales propuestos
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-inst-azul/5 text-left">
                      <th className="px-3 py-2 font-medium text-inst-azul">Compromiso</th>
                      <th className="px-3 py-2 font-medium text-inst-azul text-center">Peso</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funcionales.map(c => (
                      <tr key={c.id} className="border-b border-inst-borde">
                        <td className="px-3 py-2 text-inst-texto">{c.descripcion}</td>
                        <td className="px-3 py-2 text-center font-semibold">{Number(c.peso)}%</td>
                        <td className="px-3 py-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">Propuesto</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Comportamentales */}
          {comportamentales.length > 0 && (
            <div className="edl-card">
              <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
                <span className="material-icons">psychology</span>Compromisos comportamentales propuestos
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-inst-azul/5 text-left">
                      <th className="px-3 py-2 font-medium text-inst-azul">Compromiso</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Decreto</th>
                      <th className="px-3 py-2 font-medium text-inst-azul text-center">Propuesto por jefe</th>
                      <th className="px-3 py-2 font-medium text-inst-azul">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comportamentales.map(c => (
                      <tr key={c.id} className="border-b border-inst-borde">
                        <td className="px-3 py-2 text-inst-texto">{c.competencia_nombre || c.descripcion}</td>
                        <td className="px-3 py-2 text-inst-texto-claro text-xs">
                          {c.competencia_decreto === '2539_2005' ? 'D.2539/2005' : c.competencia_decreto === '815_2018' ? 'D.815/2018' : '-'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {c.es_propuesto_jefe ? (
                            <span className="material-icons text-green-600 text-lg">check</span>
                          ) : (
                            <span className="text-xs text-inst-texto-claro">No</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">Propuesto</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
