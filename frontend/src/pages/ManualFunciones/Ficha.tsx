/**
 * ManualFunciones/Ficha.tsx
 *
 * Ficha individual de un cargo del Manual de Funciones (Decreto 159/2024).
 *
 * Diseno (2026-07-18 - simplificacion):
 * - Vista principal BREVE: solo identidad del cargo + resumen del proposito.
 * - Toda la informacion detallada (Funciones, Conocimientos, Competencias,
 *   Requisitos de Estudio, Requisitos de Experiencia, Contribuciones) vive
 *   detras de un boton "Ver detalles del cargo" que abre un modal con tabs.
 * - Numeracion corregida: VII Estudio / VIII Experiencia.
 * - Proposito sin truncar (220 chars -> eliminados).
 * - PDF movido al footer como accion secundaria.
 * - Metadatos tecnicos solo para admin_carepa.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import NivelBadge from '../../components/NivelBadge';
import PlantaBadge from '../../components/PlantaBadge';
import NaturalezaBadge from '../../components/NaturalezaBadge';
import DetallesCargoModal from './DetallesCargoModal';

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
  creado_en: string;
  actualizado_en: string;
  detalle: Array<{ seccion: string; contenido: string; orden: number }>;
  requisitos: Array<any>;
}

export default function ManualFuncionesFicha() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, rolActivo } = useAuth();
  const [cargo, setCargo] = useState<CargoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const esAdmin = rolActivo === 'admin_carepa';

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

  const descargarPdf = async () => {
    if (!id || !token) return;
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api/v1';
      const res = await fetch(`${API_BASE}/cargos-manual/${id}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al generar PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manual_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Error al descargar PDF: ' + e.message);
    }
  };

  const abrirModal = () => {
    setModalAbierto(true);
    dialogRef.current?.showModal();
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    dialogRef.current?.close();
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
      {/* HEADER: volver */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/dashboard/manual-funciones')}
          className="text-inst-azul hover:underline text-sm flex items-center gap-1"
        >
          <span className="material-icons text-base">arrow_back</span>
          Volver al indice
        </button>
      </div>

      {/* CARD PRINCIPAL: solo identidad + proposito */}
      <div className="bg-white border rounded-lg p-6 mb-4 shadow-sm">
        <h1 className="text-2xl font-bold text-inst-azul-osc mb-1">
          {cargo.denominacion}
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          {cargo.dependencia_nombre || 'Sin dependencia'} | Decreto 159/2024
        </p>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            Codigo {cargo.codigo}-{cargo.grado}
          </span>
          <NivelBadge nivel={cargo.nivel} size="md" />
          <NaturalezaBadge naturaleza={cargo.naturaleza} size="md" />
          <PlantaBadge planta={cargo.planta} size="md" />
          <span className="text-xs text-gray-500">
            {cargo.num_cargos} {cargo.num_cargos === 1 ? 'cargo' : 'cargos'}
          </span>
        </div>

        {/* Proposito principal - sin truncar */}
        {cargo.proposito_principal && (
          <div className="bg-blue-50 border-l-4 border-inst-azul px-4 py-3 rounded-r">
            <div className="text-xs font-semibold text-inst-azul uppercase tracking-wide mb-1">
              Proposito principal
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">
              {cargo.proposito_principal}
            </p>
          </div>
        )}

        {/* Acciones principales */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t">
          <button
            onClick={abrirModal}
            className="bg-inst-azul hover:bg-inst-azul-osc text-white text-sm px-4 py-2 rounded flex items-center gap-2"
          >
            <span className="material-icons text-base">menu_book</span>
            Ver detalles del cargo
          </button>
          
        </div>
      </div>

      {/* Metadatos tecnicos (solo admin) */}
      {esAdmin && (
        <details className="bg-gray-100 border border-gray-300 rounded-lg">
          <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-200">
            Informacion tecnica (solo administrador)
          </summary>
          <dl className="px-4 py-3 border-t border-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-xs text-gray-500 uppercase">ID interno</dt>
              <dd className="font-mono">{cargo.id}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase">Fuente</dt>
              <dd>{cargo.fuente || 'No especificada'}</dd>
            </div>
            {cargo.creado_en && (
              <div>
                <dt className="text-xs text-gray-500 uppercase">Creado</dt>
                <dd>{new Date(cargo.creado_en).toLocaleString('es-CO')}</dd>
              </div>
            )}
            {cargo.actualizado_en && (
              <div>
                <dt className="text-xs text-gray-500 uppercase">Actualizado</dt>
                <dd>{new Date(cargo.actualizado_en).toLocaleString('es-CO')}</dd>
              </div>
            )}
          </dl>
        </details>
      )}

      {/* MODAL: detalles completos del cargo con tabs */}
      <DetallesCargoModal
        ref={dialogRef}
        abierto={modalAbierto}
        onClose={cerrarModal}
        detalle={cargo.detalle}
        jefeInmediato={cargo.jefe_inmediato}
      />
    </div>
  );
}