import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import NivelBadge from './NivelBadge';
import NaturalezaBadge from './NaturalezaBadge';

interface CargoAsignado {
  id: number;
  usuario_id: number;
  cargo_manual_id: number;
  fecha_asignacion: string;
  vigente: number;
  denominacion: string;
  codigo: string;
  grado: string;
  nivel: string;
  naturaleza: string;
  proposito_principal: string;
  dependencia_nombre: string;
}

interface Props {
  usuarioId: number;
  denominacionActual: string;
}

export default function CargoManualCard({ usuarioId, denominacionActual }: Props) {
  const [cargo, setCargo] = useState<CargoAsignado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await api.get<CargoAsignado | null>(`/usuarios/${usuarioId}/cargo-manual`);
        if (!cancel) setCargo(res);
      } catch (e: any) {
        if (!cancel) setError(e.message);
      } finally {
        if (!cancel) setCargando(false);
      }
    })();
    return () => { cancel = true; };
  }, [usuarioId]);

  return (
    <div className="lg:col-span-3 bg-white border rounded-lg p-5">
      <h3 className="text-sm font-semibold text-inst-azul-osc mb-3 flex items-center gap-2">
        <span className="material-icons text-base">menu_book</span>
        Mi Cargo del Manual de Funciones
        <span className="text-xs text-gray-500 font-normal">(Decreto 159/2024)</span>
      </h3>

      {cargando && (
        <div className="text-sm text-gray-500">Cargando cargo del manual...</div>
      )}

      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          No se pudo cargar el cargo del manual: {error}
        </div>
      )}

      {!cargando && !error && !cargo && (
        <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3">
          <div className="font-medium text-amber-700 mb-1">Sin cargo asignado en el Manual</div>
          <div className="text-xs">
            Cargo registrado en el sistema: <span className="font-medium">{denominacionActual || '-'}</span>.
            No hay una ficha del Decreto 159/2024 vinculada a este funcionario.
            Contacte a Talento Humano para realizar la asignacion.
          </div>
        </div>
      )}

      {!cargando && cargo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Denominacion</div>
            <div className="text-base font-semibold text-inst-texto">{cargo.denominacion}</div>
            <div className="text-xs text-gray-500 mt-1 font-mono">
              Codigo {cargo.codigo} - Grado {cargo.grado}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dependencia</div>
            <div className="text-sm text-inst-texto">{cargo.dependencia_nombre || '-'}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <NivelBadge nivel={cargo.nivel} size="sm" />
              <NaturalezaBadge naturaleza={cargo.naturaleza} size="sm" />
            </div>
          </div>
          {cargo.proposito_principal && (
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Proposito principal</div>
              <div className="text-sm text-inst-texto leading-relaxed">
                {cargo.proposito_principal}
              </div>
            </div>
          )}
          <div className="md:col-span-2 flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-gray-500">
              Asignado desde: <span className="font-medium">{cargo.fecha_asignacion || '-'}</span>
            </div>
            <Link
              to={`/dashboard/manual-funciones/${cargo.cargo_manual_id}`}
              className="text-inst-azul hover:text-inst-azul-osc text-sm font-medium"
            >
              Ver ficha completa
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}