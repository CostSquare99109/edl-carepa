/**
 * ManualFunciones/DetallesCargoModal.tsx
 *
 * Modal con tabs que contiene TODA la informacion detallada del cargo:
 *   - Tab 1: Funciones Esenciales
 *   - Tab 2: Conocimientos Basicos
 *   - Tab 3: Competencias Comportamentales
 *   - Tab 4: Requisitos (Estudio + Experiencia)
 *   - Tab 5: Contribuciones Individuales (si existe)
 *
 * Numeracion corregida:
 *   III  Funciones Esenciales
 *   IV   Contribuciones Individuales
 *   V    Conocimientos Basicos o Esenciales
 *   VI   Competencias Comportamentales
 *   VII  Requisitos de Estudio
 *   VIII Requisitos de Experiencia
 *
 * Usa <dialog> nativo HTML + forwardRef para abrir/cerrar desde el padre.
 */

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';

// Tipos de contenido que puede traer el backend (string JSON o texto plano)
type ContenidoParseado =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'lista'; valor: string[] }
  | { tipo: 'competencias'; valor: { comunes: string[]; nivel: string[] } };

interface DetalleSeccion {
  seccion: string;
  contenido: string;
  orden: number;
}

interface Props {
  abierto: boolean;
  onClose: () => void;
  detalle: DetalleSeccion[];
  jefeInmediato: string;
}

// Orden oficial del Decreto 159/2024
const TABS: Array<{
  key: string;
  numeral: string;
  titulo: string;
  icono: string;
  seccion: string; // clave que viene en el JSON del backend
}> = [
  { key: 'funciones', numeral: 'III', titulo: 'Funciones Esenciales', icono: 'checklist', seccion: 'funciones' },
  { key: 'conocimientos', numeral: 'V', titulo: 'Conocimientos Basicos', icono: 'menu_book', seccion: 'conocimientos' },
  { key: 'competencias', numeral: 'VI', titulo: 'Competencias Comportamentales', icono: 'psychology', seccion: 'competencias' },
  { key: 'requisitos', numeral: 'VII-VIII', titulo: 'Requisitos', icono: 'school', seccion: '__requisitos__' },
  { key: 'contribuciones', numeral: 'IV', titulo: 'Contribuciones', icono: 'stars', seccion: 'contribuciones' },
];

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
    // no es JSON, se trata como texto plano
  }
  const limpio = contenido
    .replace(/^["«»]+|["«»]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return { tipo: 'texto', valor: limpio };
}

function contarItems(contenido: string | unknown): number {
  const parsed = parseContenido(contenido);
  if (parsed.tipo === 'lista') return parsed.valor.length;
  if (parsed.tipo === 'competencias') return parsed.valor.comunes.length + parsed.valor.nivel.length;
  return 0;
}

const DetallesCargoModal = forwardRef<HTMLDialogElement, Props>(
  ({ abierto, onClose, detalle, jefeInmediato }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement);

    // Determinar el tab inicial: el primero que tenga contenido
    const [tabActivo, setTabActivo] = useState<string>(() => {
      for (const t of TABS) {
        if (t.seccion === '__requisitos__') {
          const hay = detalle.some(
            (d) => d.seccion === 'requisitos_estudio' || d.seccion === 'requisitos_experiencia'
          );
          if (hay) return t.key;
        } else if (detalle.some((d) => d.seccion === t.seccion)) {
          return t.key;
        }
      }
      return TABS[0].key;
    });

    // Si cambia el cargo, recalcular tab activo
    useEffect(() => {
      for (const t of TABS) {
        if (t.seccion === '__requisitos__') {
          const hay = detalle.some(
            (d) => d.seccion === 'requisitos_estudio' || d.seccion === 'requisitos_experiencia'
          );
          if (hay) {
            setTabActivo(t.key);
            return;
          }
        } else if (detalle.some((d) => d.seccion === t.seccion)) {
          setTabActivo(t.key);
          return;
        }
      }
    }, [detalle]);

    const detallePorSeccion = (key: string) => detalle.find((d) => d.seccion === key);

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

    const tabBadgeCount = (seccionKey: string): number => {
      if (seccionKey === '__requisitos__') {
        const e = detallePorSeccion('requisitos_estudio');
        const x = detallePorSeccion('requisitos_experiencia');
        return contarItems(e?.contenido) + contarItems(x?.contenido);
      }
      const d = detallePorSeccion(seccionKey);
      return contarItems(d?.contenido);
    };

    const tabDisponible = (t: typeof TABS[number]): boolean => {
      if (t.seccion === '__requisitos__') {
        return detalle.some(
          (d) => d.seccion === 'requisitos_estudio' || d.seccion === 'requisitos_experiencia'
        );
      }
      return detalle.some((d) => d.seccion === t.seccion);
    };

    const tabsVisibles = TABS.filter(tabDisponible);

    const tabActual = TABS.find((t) => t.key === tabActivo) || tabsVisibles[0] || TABS[0];

    return (
      <dialog
        ref={dialogRef}
        onClose={onClose}
        className="w-full max-w-4xl rounded-lg shadow-2xl backdrop:bg-black/40 p-0"
      >
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header del modal */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-bold text-inst-azul-osc flex items-center gap-2">
              <span className="material-icons">menu_book</span>
              Detalles del cargo
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full w-9 h-9 flex items-center justify-center"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b bg-white">
            <div className="flex overflow-x-auto px-4">
              {tabsVisibles.map((t) => {
                const count = tabBadgeCount(t.seccion);
                const activo = t.key === tabActivo;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTabActivo(t.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activo
                        ? 'border-inst-azul text-inst-azul'
                        : 'border-transparent text-gray-600 hover:text-inst-azul hover:border-gray-300'
                    }`}
                  >
                    <span className="material-icons text-base">{t.icono}</span>
                    <span>{t.numeral}. {t.titulo}</span>
                    {count > 0 && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        activo ? 'bg-inst-azul text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuerpo del tab */}
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
            {tabActual.key === 'requisitos' ? (
              <div className="space-y-6">
                {/* VII. Estudio */}
                {detallePorSeccion('requisitos_estudio') && (
                  <div>
                    <h3 className="text-sm font-bold text-inst-azul-osc uppercase tracking-wide mb-2 flex items-center gap-2">
                      <span className="material-icons text-base">school</span>
                      VII. Requisitos de Estudio
                    </h3>
                    {renderContenido(detallePorSeccion('requisitos_estudio')!.contenido)}
                  </div>
                )}
                {/* VIII. Experiencia */}
                {detallePorSeccion('requisitos_experiencia') && (
                  <div className={detallePorSeccion('requisitos_estudio') ? 'pt-4 border-t' : ''}>
                    <h3 className="text-sm font-bold text-inst-azul-osc uppercase tracking-wide mb-2 flex items-center gap-2">
                      <span className="material-icons text-base">work_history</span>
                      VIII. Requisitos de Experiencia
                    </h3>
                    {renderContenido(detallePorSeccion('requisitos_experiencia')!.contenido)}
                  </div>
                )}
                {!detallePorSeccion('requisitos_estudio') && !detallePorSeccion('requisitos_experiencia') && (
                  <p className="text-sm text-gray-500 italic">No hay requisitos registrados.</p>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-bold text-inst-azul-osc uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="material-icons text-base">{tabActual.icono}</span>
                  {tabActual.numeral}. {tabActual.titulo}
                </h3>
                {detallePorSeccion(tabActual.seccion)
                  ? renderContenido(detallePorSeccion(tabActual.seccion)!.contenido)
                  : <p className="text-sm text-gray-500 italic">Sin informacion registrada.</p>
                }
              </div>
            )}

            {/* Jefe inmediato al final */}
            {jefeInmediato && (
              <div className="mt-6 pt-4 border-t bg-blue-50 -mx-6 px-6 py-3 -mb-5 rounded-b-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Jefe inmediato</div>
                <div className="text-sm font-medium text-inst-texto">{jefeInmediato}</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="bg-inst-azul hover:bg-inst-azul-osc text-white text-sm px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      </dialog>
    );
  }
);

DetallesCargoModal.displayName = 'DetallesCargoModal';

export default DetallesCargoModal;