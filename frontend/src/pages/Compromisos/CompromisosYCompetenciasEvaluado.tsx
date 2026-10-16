import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card, SkeletonText } from '../../components/ui';

interface EvaluacionInfo {
  id: number;
  tipo: string;
  estado: string;
  periodo_id: number;
  concertacion_id: number | null;
}

interface Evaluado {
  id: number;
  documento: string;
  nombre_completo: string;
  nivel: string;
  denominacion: string;
  codigo: string;
  grado: string;
  evaluacion_id: number;
  evaluacion_estado: string;
  periodo_id: number;
  periodo_nombre: string;
  evaluaciones: EvaluacionInfo[];
}

export default function CompromisosYCompetenciasEvaluado() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evaluado, setEvaluado] = useState<Evaluado | null>(null);

  useEffect(() => {
    if (!usuario?.documento) {
      setLoading(false);
      setError('No se pudo identificar el usuario');
      return;
    }
    cargarDatos();
  }, [usuario]);

  async function cargarDatos() {
    setLoading(true);
    setError('');
    try {
      const data: any = await api.get(`/compromisos/buscar-evaluado?documento=${usuario!.documento}`);
      setEvaluado({
        ...data,
        evaluaciones: data.evaluaciones || [],
      } as Evaluado);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  const evaluacionActiva = evaluado?.evaluaciones?.find(
    (e) => e.estado !== 'cerrada' && e.estado !== 'anulada'
  ) || evaluado?.evaluaciones?.[0];

  function handleProponer() {
    navigate('/dashboard/compromisos/proponer');
  }

  function handleVerConcertados() {
    if (!evaluacionActiva) return;
    navigate(`/dashboard/compromisos/ver/${evaluacionActiva.id}`, {
      state: { evaluado },
    });
  }

  function handleVerPorAprobar() {
    navigate('/dashboard/compromisos/mios');
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="edl-section-title">Compromisos y Competencias</h2>
        </div>
        <Card>
          <SkeletonText lines={4} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="edl-section-title">Compromisos y Competencias</h2>
        </div>
        <div className="edl-card border-l-4 border-inst-rojo bg-red-50">
          <div className="flex items-center gap-2 text-inst-rojo">
            <span className="material-icons">error</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluado) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="edl-section-title">Compromisos y Competencias</h2>
        </div>
        <div className="edl-card text-center text-inst-texto-claro">
          No se encontraron datos del evaluado.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="edl-section-title">Compromisos y Competencias</h2>
        <p className="text-sm text-inst-texto-claro mt-1">
          Información del evaluado y gestión de compromisos
        </p>
      </div>

      <div className="edl-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Evaluado</th>
                <th>Nivel</th>
                <th>Denominación</th>
                <th>Código</th>
                <th>Grado</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium">{evaluado.documento}</td>
                <td>{evaluado.nombre_completo}</td>
                <td>{evaluado.nivel}</td>
                <td>{evaluado.denominacion}</td>
                <td>{evaluado.codigo}</td>
                <td>{evaluado.grado}</td>
                <td>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={handleProponer}
                      className="edl-btn-primary text-xs px-2.5 py-1.5"
                    >
                      <span className="material-icons text-sm">rate_review</span>
                      Proponer
                    </button>
                    <button
                      onClick={handleVerConcertados}
                      disabled={!evaluacionActiva}
                      className="edl-btn-outline text-xs px-2.5 py-1.5"
                    >
                      <span className="material-icons text-sm">visibility</span>
                      Ver concertados
                    </button>
                    <button
                      onClick={handleVerPorAprobar}
                      className="edl-btn-outline text-xs px-2.5 py-1.5"
                    >
                      <span className="material-icons text-sm">fact_check</span>
                      Por aprobar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {evaluacionActiva && (
        <div className="mt-4 edl-card flex items-center gap-3 text-sm text-inst-texto-claro">
          <span className="material-icons text-inst-azul-osc text-base">info</span>
          <span>
            Evaluación activa: <strong>{evaluacionActiva.tipo.replace(/_/g, ' ')}</strong>
            {' — '}Estado: <strong>{evaluacionActiva.estado}</strong>
            {evaluado.periodo_nombre && <> — Período: <strong>{evaluado.periodo_nombre}</strong></>}
          </span>
        </div>
      )}

      {!evaluacionActiva && (
        <div className="mt-4 edl-card flex items-center gap-3 text-sm text-inst-texto-claro">
          <span className="material-icons text-amber-500 text-base">warning</span>
          <span>No se encontró una evaluación activa. Algunas opciones pueden no estar disponibles.</span>
        </div>
      )}
    </div>
  );
}
