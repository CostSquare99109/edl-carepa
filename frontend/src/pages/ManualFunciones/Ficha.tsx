/**
 * ManualFunciones/Ficha.tsx
 *
 * Ficha individual de un cargo del Manual de Funciones (Decreto 159/2024).
 *
 * Mejoras UX/UI (2026-07-18):
 * - SeccionColapsable para agrupar contenido por importancia para la EDL.
 * - Secciones "clave" (Proposito, Funciones, Competencias) abiertas por defecto.
 * - Secciones "perfil" (Conocimientos, Requisitos) cerradas por defecto.
 * - Render inteligente del JSON en competencias (comunes + nivel).
 * - Sin JSON crudo al usuario.
 * - Sin comillas tipograficas en requisitos de experiencia.
 * - Metadatos tecnicos solo para admin_carepa.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import NivelBadge from '../../components/NivelBadge';
import PlantaBadge from '../../components/PlantaBadge';
import NaturalezaBadge from '../../components/NaturalezaBadge';
import SeccionColapsable from '../../components/SeccionColapsable';

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

// Secciones del Manual (orden oficial)
const SECCIONES_EDL: Record<string, { titulo: string; icono: string; defaultAbierto: boolean }> = {
  proposito: { titulo: 'II. Proposito Principal', icono: 'flag', defaultAbierto: true },
  funciones: { titulo: 'III. Funciones Esenciales', icono: 'checklist', defaultAbierto: true },
  contribuciones: { titulo: 'IV. Contribuciones Individuales', icono: 'stars', defaultAbierto: false },
  conocimientos: { titulo: 'V. Conocimientos Basicos o Esenciales', icono: 'menu_book', defaultAbierto: false },
  competencias: { titulo: 'VI. Competencias Comportamentales', icono: 'psychology', defaultAbierto: true },
  requisitos_estudio: { titulo: 'VII. Requisitos de Estudio', icono: 'school', defaultAbierto: false },
  requisitos_experiencia: { titulo: 'VII. Requisitos de Experiencia', icono: 'work_history', defaultAbierto: false },
};

const SECCION_DEFAULT = { titulo: 'Seccion', icono: 'description', defaultAbierto: false };

type ContenidoParseado =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'lista'; valor: string[] }
  | { tipo: 'competencias'; valor: { comunes: string[]; nivel: string[] } };

function parseContenido(contenido: string | unknown): ContenidoParseado {
  if (typeof contenido !== 'string') {
    return { tipo: 'texto', valor: String(contenido ?? '') };
  }
  try {
    const parsed = JSON.parse(contenido);
    if (Array.isArray(parsed)) {
      return { tipo: 'lista', valor: parsed.map((v: any) => String(v)) };
    }
    if (typeof parsed === 'object' && parsed !== null) {
      // Competencias: { comunes: [...], nivel: [...] }
      const comunes = Array.isArray((parsed as any).comunes)
        ? (parsed as any).comunes.flatMap((v: any) => String(v).split(/\s{2,}|\n/).map((s: string) => s.trim()).filter(Boolean))
        : [];
      const nivel = Array.isArray((parsed as any).nivel)
        ? (parsed as any).nivel.flatMap((v: any) => String(v).split(/\s{2,}|\n/).map((s: string) => s.trim()).filter(Boolean))
        : [];
      if (comunes.length > 0 || nivel.length > 0) {
        return { tipo: 'competencias', valor: { comunes, nivel } };
      }
    }
    if (typeof parsed === 'string') {
      return { tipo: 'texto', valor: parsed };
    }
  } catch {
    // no es JSON
  }
  // Limpiar comillas tipograficas y espacios innecesarios
  const limpio = contenido
    .replace(/^["«»]+|["«»]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return { tipo: 'texto', valor: limpio };
}

export default function ManualFuncionesFicha() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [cargo, setCargo] = useState<CargoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const esAdmin = user?.rolActivo === 'admin_carepa';

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

  // Render segun tipo de contenido
  const renderContenido = (contenido: string | unknown) => {
    const parsed = parseContenido(contenido);
    if (parsed.tipo === 'lista') {
      return (
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800 marker:text-inst-azul marker:font-semibold">
          {parsed.valor.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ol>
      );
    }
    if (parsed.tipo === 'competencias') {
      return (
        <div className="space-y-5">
          {parsed.valor.comunes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase mb-2 tracking-wide">
                Comunes a todos los servidores
              </h3>
              <ul className="space-y-1.5">
                {parsed.valor.comunes.map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-800">
                    <span className="material-icons text-base text-blue-600 flex-shrink-0">check_circle</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {parsed.valor.nivel.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase mb-2 tracking-wide">
                Especificas del nivel jerarquico
              </h3>
              <ul className="space-y-1.5">
                {parsed.valor.nivel.map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-800">
                    <span className="material-icons text-base text-indigo-600 flex-shrink-0">psychology</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return (
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
        {parsed.valor}
      </p>
    );
  };

  // Contar items por seccion para badgeCount
  const contarItems = (contenido: string | unknown): number => {
    const parsed = parseContenido(contenido);
    if (parsed.tipo === 'lista') return parsed.valor.length;
    if (parsed.tipo === 'competencias') {
      return parsed.valor.comunes.length + parsed.valor.nivel.length;
    }
    return 0;
  };

  // Agrupar por bloque funcional
  const seccionesClave = ['proposito', 'funciones', 'competencias'];
  const seccionesPerfil = ['conocimientos', 'requisitos_estudio', 'requisitos_experiencia'];
  const seccionesInfo = ['contribuciones'];

  const detallePorSeccion = (key: string) =>
    cargo.detalle.find((d) => d.seccion === key);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* HEADER sticky con badge */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/dashboard/manual-funciones')}
          className="text-inst-azul hover:underline text-sm flex items-center gap-1"
        >
          <span className="material-icons text-base">arrow_back</span>
          Volver al indice
        </button>
      </div>

      {/* CARD HEADER */}
      <div className="bg-white border rounded-lg p-6 mb-4 shadow-sm">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <h1 className="text-2xl font-bold text-inst-azul-osc mb-1">
              {cargo.denominacion}
            </h1>
            <p className="text-sm text-gray-600">
              {cargo.dependencia_nombre || 'Sin dependencia'} | Decreto 159/2024
            </p>
          </div>
          <button
            onClick={descargarPdf}
            className="bg-inst-azul hover:bg-inst-azul-osc text-white text-sm px-3 py-2 rounded flex items-center gap-1 flex-shrink-0"
          >
            <span className="material-icons text-base">download</span>
            PDF
          </button>
        </div>

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

        {/* Resumen ejecutivo del proposito */}
        {cargo.proposito_principal && (
          <div className="bg-blue-50 border-l-4 border-inst-azul px-4 py-3 rounded-r">
            <div className="text-xs font-semibold text-inst-azul uppercase tracking-wide mb-1">
              Resumen del cargo
            </div>
            <p className="text-sm text-gray-800 italic">
              {cargo.proposito_principal.length > 220
                ? cargo.proposito_principal.slice(0, 220) + '...'
                : cargo.proposito_principal}
            </p>
          </div>
        )}
      </div>

      {/* SECCION 1: Informacion clave para evaluacion */}
      {seccionesClave.some((k) => detallePorSeccion(k)) && (
        <div className="mb-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
            Informacion para el proceso de evaluacion
          </div>
          <div className="space-y-3">
            {seccionesClave.map((key) => {
              const d = detallePorSeccion(key);
              if (!d) return null;
              const meta = SECCIONES_EDL[key] || SECCION_DEFAULT;
              return (
                <SeccionColapsable
                  key={key}
                  titulo={meta.titulo}
                  icono={meta.icono}
                  defaultAbierto={meta.defaultAbierto}
                  badgeCount={contarItems(d.contenido)}
                >
                  {renderContenido(d.contenido)}
                </SeccionColapsable>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCION 2: Perfil y requisitos del cargo */}
      {seccionesPerfil.some((k) => detallePorSeccion(k)) && (
        <div className="mb-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
            Perfil y requisitos
          </div>
          <div className="space-y-3">
            {seccionesPerfil.map((key) => {
              const d = detallePorSeccion(key);
              if (!d) return null;
              const meta = SECCIONES_EDL[key] || SECCION_DEFAULT;
              return (
                <SeccionColapsable
                  key={key}
                  titulo={meta.titulo}
                  icono={meta.icono}
                  defaultAbierto={meta.defaultAbierto}
                  badgeCount={contarItems(d.contenido)}
                >
                  {renderContenido(d.contenido)}
                </SeccionColapsable>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCION 3: Informacion adicional (cerrada por defecto) */}
      {seccionesInfo.some((k) => detallePorSeccion(k)) && (
        <div className="mb-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
            Informacion adicional
          </div>
          <div className="space-y-3">
            {seccionesInfo.map((key) => {
              const d = detallePorSeccion(key);
              if (!d) return null;
              const meta = SECCIONES_EDL[key] || SECCION_DEFAULT;
              return (
                <SeccionColapsable
                  key={key}
                  titulo={meta.titulo}
                  icono={meta.icono}
                  defaultAbierto={meta.defaultAbierto}
                  badgeCount={contarItems(d.contenido)}
                >
                  {renderContenido(d.contenido)}
                </SeccionColapsable>
              );
            })}
          </div>
        </div>
      )}

      {/* Si no hay detalle */}
      {cargo.detalle.length === 0 && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded mb-4">
          <div className="font-semibold mb-1">Secciones pendientes</div>
          Este cargo aun no tiene detalle de las 7 secciones cargado en el sistema.
          Solo esta disponible la informacion del header.
        </div>
      )}

      {/* SECCION 4: Metadatos tecnicos (solo admin) */}
      {esAdmin && (
        <details className="bg-gray-100 border border-gray-300 rounded-lg mt-6">
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
    </div>
  );
}
