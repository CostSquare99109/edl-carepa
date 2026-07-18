import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

interface CargoDetalle {
  id: number;
  planta: string;
  dependencia_id: number;
  dependencia_nombre: string;
  nivel: string;
  codigo: string;
  grado: string;
  denominacion: string;
  num_cargos: number;
  naturaleza: string;
  jefe_inmediato: string;
  proposito_principal: string;
  fuente: string;
  detalle: Array<{ seccion: string; contenido: string; orden: number }>;
  requisitos: Array<any>;
}

const SECCIONES_LABELS: Record<string, { titulo: string; icono: string }> = {
  identificacion: { titulo: 'I. Identificacion', icono: 'badge' },
  proposito: { titulo: 'II. Proposito Principal', icono: 'flag' },
  funciones: { titulo: 'III. Funciones Esenciales', icono: 'checklist' },
  contribuciones: { titulo: 'IV. Contribuciones Individuales', icono: 'stars' },
  conocimientos: { titulo: 'V. Conocimientos Basicos o Esenciales', icono: 'menu_book' },
  competencias: { titulo: 'VI. Competencias Comportamentales', icono: 'psychology' },
  requisitos_estudio: { titulo: 'VII. Requisitos de Estudio', icono: 'school' },
  requisitos_experiencia: { titulo: 'VII. Requisitos de Experiencia', icono: 'work_history' },
  requisitos: { titulo: 'VII. Requisitos', icono: 'rule' },
};

const SECCION_ICONO_DEFAULT = { titulo: 'description', icono: 'description' };

export default function ManualFuncionesFicha() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cargo, setCargo] = useState<CargoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    if (!id) return;
    setCargando(true);
    setError('');
    try {
      const data = await api.get<CargoDetalle>(`/cargos-manual/${id}`);
      setCargo(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar cargo');
    }
    setCargando(false);
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const parseContenido = (contenido: string): { tipo: 'texto' | 'lista'; valor: string | string[] } => {
    try {
      const parsed = JSON.parse(contenido);
      if (Array.isArray(parsed)) {
        return { tipo: 'lista', valor: parsed };
      }
      if (typeof parsed === 'string') {
        return { tipo: 'texto', valor: parsed };
      }
    } catch {
      // no es JSON, devolver como texto
    }
    return { tipo: 'texto', valor: contenido };
  };

  if (cargando) {
    return (
      <div className="p-6 text-center py-12 text-gray-500">Cargando ficha...</div>
    );
  }

  if (error || !cargo) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded mb-4">
          {error || 'Cargo no encontrado'}
        </div>
        <button
          onClick={() => navigate('/dashboard/manual-funciones')}
          className="text-inst-azul hover:underline text-sm"
        >
          Volver al Manual de Funciones
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => navigate('/dashboard/manual-funciones')}
          className="text-inst-azul hover:underline text-sm flex items-center gap-1"
        >
          <span className="material-icons text-base">arrow_back</span>
          Volver al indice
        </button>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-4">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-inst-azul-osc">{cargo.denominacion}</h1>
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {cargo.codigo}-{cargo.grado}
          </span>
        </div>
        <div className="text-sm text-gray-600 mb-4">
          {cargo.dependencia_nombre || 'Sin dependencia'} - Decreto 159/2024
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-gray-500 uppercase">Nivel</div>
            <div className="text-sm font-medium">{cargo.nivel}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Naturaleza</div>
            <div className="text-sm font-medium">{cargo.naturaleza.replace(/_/g, ' ')}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Planta</div>
            <div className="text-sm font-medium">{cargo.planta}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Num. Cargos</div>
            <div className="text-sm font-medium">{cargo.num_cargos}</div>
          </div>
        </div>
      </div>

      {cargo.detalle.length === 0 ? (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded">
          Este cargo aun no tiene detalle de las 7 secciones cargado en el sistema.
        </div>
      ) : (
        <div className="space-y-4">
          {cargo.detalle.map((d, idx) => {
            const meta = SECCIONES_LABELS[d.seccion] || SECCION_ICONO_DEFAULT;
            const parsed = parseContenido(d.contenido);
            return (
              <div key={idx} className="bg-white border rounded-lg p-5">
                <h2 className="text-lg font-semibold text-inst-azul-osc mb-3 flex items-center gap-2">
                  <span className="material-icons text-base">{meta.icono}</span>
                  {meta.titulo}
                </h2>
                {parsed.tipo === 'lista' ? (
                  <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-800">
                    {(parsed.valor as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {parsed.valor as string}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}