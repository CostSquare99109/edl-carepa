import { useEffect, useState, useMemo, useCallback } from 'react';
import { api, type PaginatedData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

/* ─────────────── Tipos ─────────────── */

interface Periodo {
  id: number;
  nombre: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
}

interface Evaluado {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  dependencia: string;
  tipo_vinculacion: string;
  estado_evaluacion: string;
}

interface Compromiso {
  id: number;
  tipo: string;
  descripcion: string;
  resultado_esperado: string | null;
  medio_verificacion: string | null;
  peso: number;
  puntaje: number | null;
  estado: string;
  conductas?: Conducta[];
}

interface Conducta {
  id: number;
  descripcion: string;
  valoracion: string | null; // 'nunca' | 'algunas_veces' | 'frecuentemente' | 'siempre'
}

interface EvaluacionAsignada {
  id: number;
  evaluado_id: number;
  evaluado_nombre: string;
  evaluado_cargo: string;
  evaluado_documento: string;
  evaluado_dependencia: string;
  evaluado_vinculacion: string;
  tipo: string;
  estado: string;
  periodo_nombre: string;
  periodo_id: number;
  puntaje_final: number | null;
  compromisos_count: number;
  compromisos_evaluados: number;
}

/* ─────────────── Constantes ─────────────── */

const ESTADO_COMPROMISO: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  pendiente:     { label: 'Sin evaluar',   icon: 'schedule',       color: 'text-amber-600',  bg: 'bg-amber-50'  },
  en_progreso:   { label: 'En progreso',   icon: 'pending',        color: 'text-blue-600',   bg: 'bg-blue-50'   },
  evaluado:      { label: 'Evaluado',      icon: 'check_circle',   color: 'text-green-600',  bg: 'bg-green-50'  },
  validado:      { label: 'Validado',      icon: 'verified',       color: 'text-inst-azul',  bg: 'bg-blue-50'   },
};

const VALORACION_OPTIONS = [
  { value: 'nunca',           label: 'Nunca',            color: 'bg-red-100 text-red-700 border-red-300'    },
  { value: 'algunas_veces',   label: 'Algunas veces',    color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'frecuentemente',  label: 'Frecuentemente',   color: 'bg-blue-100 text-blue-700 border-blue-300'  },
  { value: 'siempre',         label: 'Siempre',          color: 'bg-green-100 text-green-700 border-green-300' },
] as const;

/* ─────────────── Componente Principal ─────────────── */

export default function PanelEvaluador() {
  const { usuario, rolActivo } = useAuth();

  // Estados principales
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoId, setPeriodoId] = useState<number>(0);
  const [busquedaDoc, setBusquedaDoc] = useState('');
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionAsignada[]>([]);
  const [evaluacionSel, setEvaluacionSel] = useState<EvaluacionAsignada | null>(null);
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');

  // Modal de evaluación
  const [modalCompromiso, setModalCompromiso] = useState<Compromiso | null>(null);
  const [calificacion, setCalificacion] = useState<number>(50);
  const [conductasForm, setConductasForm] = useState<Record<number, string>>({});
  const [obsCompromiso, setObsCompromiso] = useState('');
  const [guardandoCal, setGuardandoCal] = useState(false);

  // Preguntas de cierre
  const [cumplioCompromisos, setCumplioCompromisos] = useState<'si' | 'no' | ''>('');
  const [aporteAdicional, setAporteAdicional] = useState<'si' | 'no' | ''>('');
  const [descAporte, setDescAporte] = useState('');

  // Acciones
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ type: 'guardar' | 'revision' | 'finalizar'; msg: string } | null>(null);

  /* ── Carga inicial de períodos ── */
  useEffect(() => {
    cargarPeriodos();
  }, []);

  async function cargarPeriodos() {
    try {
      const res = await api.get<PaginatedData<Periodo>>('/periodos?por_pagina=50');
      const activos = (res.data || []).filter(p => p.estado === 'en_evaluacion' || p.estado === 'activa' || p.estado === 'activo');
      setPeriodos(activos);
      if (activos.length > 0) setPeriodoId(activos[0].id);
    } catch (err) {
      console.error('Error cargando periodos:', err);
    }
  }

  /* ── Cargar evaluaciones al cambiar período ── */
  useEffect(() => {
    if (periodoId) cargarEvaluaciones();
  }, [periodoId]);

  async function cargarEvaluaciones() {
    setLoading(true);
    try {
      const res = await api.get<PaginatedData<EvaluacionAsignada>>(
        `/evaluaciones?evaluador=me&periodo_id=${periodoId}&por_pagina=50`
      );
      setEvaluaciones(res.data || []);
    } catch (err) {
      console.error('Error cargando evaluaciones:', err);
    } finally {
      setLoading(false);
    }
  }

  /* ── Buscar evaluado por documento ── */
  async function buscarEvaluado() {
    if (!busquedaDoc.trim()) return;
    setBuscando(true);
    setErrorBusqueda('');
    try {
      const res = await api.get<PaginatedData<EvaluacionAsignada>>(
        `/evaluaciones?evaluador=me&documento=${busquedaDoc.trim()}&por_pagina=10`
      );
      const encontrados = res.data || [];
      if (encontrados.length === 0) {
        setErrorBusqueda('No se encontró un evaluado con ese documento para el período seleccionado.');
      } else {
        setEvaluaciones(encontrados);
      }
    } catch (err: any) {
      setErrorBusqueda(err.message || 'Error en la búsqueda');
    } finally {
      setBuscando(false);
    }
  }

  /* ── Seleccionar evaluación y cargar compromisos ── */
  async function seleccionarEvaluacion(ev: EvaluacionAsignada) {
    setEvaluacionSel(ev);
    setCumplioCompromisos('');
    setAporteAdicional('');
    setDescAporte('');
    try {
      const res = await api.get<PaginatedData<Compromiso>>(
        `/compromisos?evaluacion_id=${ev.id}&por_pagina=50`
      );
      const comps = res.data || [];
      setCompromisos(comps.filter(c => c.estado === 'aprobado' || c.estado === 'cumplido' || c.estado === 'incumplido' || c.estado === 'en_progreso'));
    } catch (err) {
      console.error('Error cargando compromisos:', err);
      setCompromisos([]);
    }
  }

  /* ── Abrir modal de evaluación de compromiso ── */
  function abrirModalEvaluacion(comp: Compromiso) {
    setModalCompromiso(comp);
    setCalificacion(comp.puntaje ?? 50);
    setObsCompromiso('');
    // Inicializar conductas si existen
    const initConductas: Record<number, string> = {};
    if (comp.conductas) {
      comp.conductas.forEach(c => {
        if (c.valoracion) initConductas[c.id] = c.valoracion;
      });
    }
    setConductasForm(initConductas);
  }

  /* ── Guardar calificación de compromiso ── */
  async function guardarCalificacion() {
    if (!modalCompromiso || !evaluacionSel) return;
    if (calificacion < 0 || calificacion > 100) {
      alert('La calificación debe estar entre 0 y 100');
      return;
    }
    setGuardandoCal(true);
    try {
      await api.put(`/compromisos/${modalCompromiso.id}/calificar`, {
        puntaje: calificacion,
        observaciones: obsCompromiso,
        conductas: Object.entries(conductasForm).map(([id, valor]) => ({
          conducta_id: Number(id),
          valoracion: valor,
        })),
      });
      // Actualizar estado local
      setCompromisos(prev => prev.map(c =>
        c.id === modalCompromiso.id
          ? { ...c, puntaje: calificacion, estado: 'evaluado' }
          : c
      ));
      setModalCompromiso(null);
    } catch (err: any) {
      alert(err.message || 'Error al calificar compromiso');
    } finally {
      setGuardandoCal(false);
    }
  }

  /* ── Puntaje ponderado calculado en tiempo real ── */
  const resumen = useMemo(() => {
    const total = compromisos.reduce((acc, c) => {
      const puntaje = c.puntaje ?? 0;
      return acc + (puntaje * c.peso) / 100;
    }, 0);
    const evaluados = compromisos.filter(c => c.puntaje !== null).length;
    const totalPeso = compromisos.reduce((acc, c) => acc + c.peso, 0);
    return { puntajePonderado: total, evaluados, total: compromisos.length, totalPeso };
  }, [compromisos]);

  /* ── Validar antes de guardar ── */
  function validarEvaluacion(): string | null {
    const sinEvaluar = compromisos.filter(c => c.puntaje === null);
    if (sinEvaluar.length > 0)
      return `Faltan por evaluar ${sinEvaluar.length} compromiso(s). Todos los compromisos deben estar calificados antes de guardar.`;
    if (!cumplioCompromisos)
      return 'Debe responder si el servidor cumplió con los compromisos concertados.';
    if (!aporteAdicional)
      return 'Debe responder si el servidor realizó algún aporte adicional relevante.';
    if (aporteAdicional === 'si' && !descAporte.trim())
      return 'Debe describir el aporte adicional realizado por el servidor.';
    return null;
  }

  /* ── Acciones finales ── */
  async function guardarEvaluacion() {
    const err = validarEvaluacion();
    if (err) { alert(err); return; }
    if (!evaluacionSel) return;
    setSaving(true);
    try {
      await api.put(`/evaluaciones/${evaluacionSel.id}/guardar`, {
        cumplio_compromisos: cumplioCompromisos === 'si',
        aporte_adicional: aporteAdicional === 'si',
        descripcion_aporte: descAporte,
      });
      alert('Evaluación guardada exitosamente.');
      cargarEvaluaciones();
      setEvaluacionSel(null);
    } catch (err: any) {
      alert(err.message || 'Error al guardar evaluación');
    } finally {
      setSaving(false);
      setConfirmModal(null);
    }
  }

  async function solicitarRevision() {
    if (!evaluacionSel) return;
    setSaving(true);
    try {
      await api.put(`/evaluaciones/${evaluacionSel.id}/solicitar-revision`, {});
      alert('Revisión solicitada exitosamente.');
      cargarEvaluaciones();
      setEvaluacionSel(null);
    } catch (err: any) {
      alert(err.message || 'Error al solicitar revisión');
    } finally {
      setSaving(false);
      setConfirmModal(null);
    }
  }

  async function finalizarEvaluacion() {
    const err = validarEvaluacion();
    if (err) { alert(err); return; }
    if (!evaluacionSel) return;
    setSaving(true);
    try {
      await api.put(`/evaluaciones/${evaluacionSel.id}/finalizar`, {
        cumplio_compromisos: cumplioCompromisos === 'si',
        aporte_adicional: aporteAdicional === 'si',
        descripcion_aporte: descAporte,
      });
      alert('Evaluación finalizada. La calificación es definitiva.');
      cargarEvaluaciones();
      setEvaluacionSel(null);
    } catch (err: any) {
      alert(err.message || 'Error al finalizar evaluación');
    } finally {
      setSaving(false);
      setConfirmModal(null);
    }
  }

  function cancelar() {
    setEvaluacionSel(null);
    setCompromisos([]);
    setCumplioCompromisos('');
    setAporteAdicional('');
    setDescAporte('');
  }

  /* ─────────────── RENDER ─────────────── */

  return (
    <div className="min-h-screen">
      {/* ═══ Encabezado del módulo ═══ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons text-inst-azul text-xl">rate_review</span>
          <h2 className="edl-section-title">Evaluar Desempeño</h2>
        </div>
        <nav className="flex items-center gap-1 text-xs text-inst-texto-claro ml-7">
          <span className="hover:text-inst-azul cursor-pointer">Inicio</span>
          <span className="material-icons text-xs">chevron_right</span>
          <span className="hover:text-inst-azul cursor-pointer">Evaluaciones</span>
          <span className="material-icons text-xs">chevron_right</span>
          <span className="text-inst-azul font-medium">Evaluar</span>
        </nav>
        <p className="text-sm text-inst-texto-claro mt-1 ml-7">
          Calificación de compromisos funcionales y competencias comportamentales
        </p>
      </div>

      {/* ═══ Barra de selección: Período + Búsqueda ═══ */}
      <div className="edl-card mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* Selector de período */}
          <div className="flex-1 min-w-[200px]">
            <label className="edl-label flex items-center gap-1">
              <span className="material-icons text-sm text-inst-azul">calendar_today</span>
              Período de evaluación
            </label>
            <select
              value={periodoId}
              onChange={e => setPeriodoId(Number(e.target.value))}
              className="edl-input"
            >
              <option value={0}>Seleccione un período...</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {/* Buscar evaluado */}
          <div className="flex-1 min-w-[280px]">
            <label className="edl-label flex items-center gap-1">
              <span className="material-icons text-sm text-inst-azul">search</span>
              Buscar evaluado por documento
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={busquedaDoc}
                onChange={e => setBusquedaDoc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscarEvaluado()}
                className="edl-input flex-1"
                placeholder="Número de documento..."
              />
              <button
                onClick={buscarEvaluado}
                disabled={buscando || !busquedaDoc.trim()}
                className="edl-btn-primary flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
              >
                <span className="material-icons text-sm">person_search</span>
                {buscando ? 'Buscando...' : 'Buscar evaluado'}
              </button>
            </div>
            {errorBusqueda && (
              <p className="text-xs text-inst-rojo mt-1 flex items-center gap-1">
                <span className="material-icons text-xs">error</span>
                {errorBusqueda}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Contenido principal ═══ */}
      {!evaluacionSel ? (
        /* ── Lista de evaluaciones asignadas ── */
        <div>
          {loading ? (
            <div className="edl-card text-center py-12 text-inst-texto-claro">
              <span className="material-icons text-4xl animate-spin text-inst-azul mb-2 block mx-auto">refresh</span>
              Cargando evaluaciones asignadas...
            </div>
          ) : evaluaciones.length === 0 ? (
            <div className="edl-card text-center py-12 text-inst-texto-claro">
              <span className="material-icons text-5xl text-inst-borde mb-3 block mx-auto">assignment_late</span>
              <p className="text-lg font-medium text-inst-texto mb-1">Sin evaluaciones asignadas</p>
              <p className="text-sm">No tiene evaluaciones asignadas para el período seleccionado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {evaluaciones.map(ev => {
                const estadoInfo = ESTADO_COMPROMISO[ev.estado] || ESTADO_COMPROMISO.pendiente;
                return (
                  <div
                    key={ev.id}
                    className="edl-card cursor-pointer hover:border-inst-azul/30 hover:shadow-md transition-all group"
                    onClick={() => seleccionarEvaluacion(ev)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-icons text-lg text-inst-azul group-hover:text-inst-rojo transition-colors">person</span>
                          <span className="font-heading font-bold text-inst-texto">{ev.evaluado_nombre}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${estadoInfo.bg} ${estadoInfo.color}`}>
                            {estadoInfo.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-inst-texto-claro ml-7">
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-xs">badge</span>
                            {ev.evaluado_cargo}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-xs">apartment</span>
                            {ev.evaluado_dependencia}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-xs">fingerprint</span>
                            {ev.evaluado_documento}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-xs">assignment</span>
                            Compromisos: {ev.compromisos_evaluados}/{ev.compromisos_count}
                          </span>
                          {ev.puntaje_final !== null && (
                            <span className={`font-bold ${ev.puntaje_final >= 80 ? 'text-green-600' : ev.puntaje_final >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              Final: {ev.puntaje_final.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="material-icons text-inst-texto-claro group-hover:text-inst-azul transition-colors">
                        chevron_right
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Panel de evaluación del evaluado seleccionado ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══ COLUMNA IZQUIERDA (2/3): Datos + Tabla + Preguntas ═══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Tarjeta de información del evaluado ── */}
            <div className="edl-card border-l-4 border-l-inst-azul">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-icons text-inst-azul text-2xl">account_circle</span>
                    <h3 className="font-heading font-bold text-lg text-inst-texto">
                      {evaluacionSel.evaluado_nombre}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 ml-9">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-icons text-xs text-inst-texto-claro">badge</span>
                      <span className="text-inst-texto-claro">Cargo:</span>
                      <span className="font-medium text-inst-texto">{evaluacionSel.evaluado_cargo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-icons text-xs text-inst-texto-claro">apartment</span>
                      <span className="text-inst-texto-claro">Dependencia:</span>
                      <span className="font-medium text-inst-texto">{evaluacionSel.evaluado_dependencia}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-icons text-xs text-inst-texto-claro">fingerprint</span>
                      <span className="text-inst-texto-claro">Documento:</span>
                      <span className="font-medium text-inst-texto">{evaluacionSel.evaluado_documento}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-icons text-xs text-inst-texto-claro">link</span>
                      <span className="text-inst-texto-claro">Vinculación:</span>
                      <span className="font-medium text-inst-texto">{evaluacionSel.evaluado_vinculacion || '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    ESTADO_COMPROMISO[evaluacionSel.estado]
                      ? `${ESTADO_COMPROMISO[evaluacionSel.estado].bg} ${ESTADO_COMPROMISO[evaluacionSel.estado].color}`
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ESTADO_COMPROMISO[evaluacionSel.estado]?.label || evaluacionSel.estado}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Tabla de compromisos ── */}
            <div className="edl-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-inst-azul flex items-center gap-2">
                  <span className="material-icons">assignment</span>
                  Compromisos a Evaluar
                </h3>
                <span className="text-xs text-inst-texto-claro">
                  {resumen.evaluados} de {resumen.total} evaluados
                </span>
              </div>

              {compromisos.length === 0 ? (
                <div className="text-center py-8 text-inst-texto-claro">
                  <span className="material-icons text-4xl text-inst-borde block mx-auto mb-2">inventory_2</span>
                  <p className="text-sm">No hay compromisos aprobados para evaluar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="edl-table w-full">
                    <thead>
                      <tr className="bg-inst-azul/5">
                        <th className="w-[40%] text-left">Compromiso</th>
                        <th className="w-[10%] text-center">Peso (%)</th>
                        <th className="w-[15%] text-center">Calificación</th>
                        <th className="w-[12%] text-center">Puntaje Ponderado</th>
                        <th className="w-[13%] text-center">Estado</th>
                        <th className="w-[10%] text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compromisos.map(c => {
                        const estInfo = c.puntaje !== null
                          ? ESTADO_COMPROMISO.evaluado
                          : ESTADO_COMPROMISO.pendiente;
                        const ponderado = c.puntaje !== null ? ((c.puntaje * c.peso) / 100).toFixed(2) : '—';
                        return (
                          <tr key={c.id} className="hover:bg-inst-gris/70 transition-colors">
                            <td className="text-left">
                              <div className="flex items-start gap-2">
                                <span className={`material-icons text-base mt-0.5 ${
                                  c.tipo === 'funcional' ? 'text-inst-azul' : 'text-inst-verde'
                                }`}>
                                  {c.tipo === 'funcional' ? 'task_alt' : 'psychology'}
                                </span>
                                <div>
                                  <span className="text-xs uppercase font-medium text-inst-texto-claro">
                                    {c.tipo === 'funcional' ? 'Funcional' : 'Comportamental'}
                                  </span>
                                  <p className="text-sm text-inst-texto leading-snug">{c.descripcion}</p>
                                  {c.resultado_esperado && (
                                    <p className="text-xs text-inst-verde mt-0.5">
                                      Resultado: {c.resultado_esperado}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="font-bold text-inst-azul">{c.peso}%</span>
                            </td>
                            <td className="text-center">
                              {c.puntaje !== null ? (
                                <span className={`font-bold text-lg ${
                                  c.puntaje >= 80 ? 'text-green-600' : c.puntaje >= 60 ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {c.puntaje}
                                </span>
                              ) : (
                                <span className="text-inst-texto-claro">—</span>
                              )}
                            </td>
                            <td className="text-center font-medium text-inst-texto">
                              {ponderado}
                            </td>
                            <td className="text-center">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${estInfo.bg} ${estInfo.color}`}>
                                <span className="material-icons text-xs">{estInfo.icon}</span>
                                {estInfo.label}
                              </span>
                            </td>
                            <td className="text-center">
                              {evaluacionSel.estado !== 'aprobada' && (
                                <button
                                  onClick={() => abrirModalEvaluacion(c)}
                                  className="p-1.5 rounded hover:bg-inst-azul/10 transition-colors text-inst-azul hover:text-inst-rojo"
                                  title={c.puntaje !== null ? 'Editar calificación' : 'Evaluar compromiso'}
                                >
                                  <span className="material-icons text-lg">
                                    {c.puntaje !== null ? 'edit' : 'rate_review'}
                                  </span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Barra de progreso */}
              {compromisos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-inst-borde">
                  <div className="flex items-center justify-between text-xs text-inst-texto-claro mb-1">
                    <span>Avance de evaluación</span>
                    <span className="font-medium">{Math.round((resumen.evaluados / resumen.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        resumen.evaluados === resumen.total ? 'bg-green-500' : 'bg-inst-azul'
                      }`}
                      style={{ width: `${(resumen.evaluados / resumen.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Preguntas de cierre ── */}
            {compromisos.length > 0 && resumen.evaluados === resumen.total && (
              <div className="edl-card border-l-4 border-l-inst-verde">
                <h3 className="font-heading font-bold text-inst-azul flex items-center gap-2 mb-4">
                  <span className="material-icons">quiz</span>
                  Preguntas de Cierre
                </h3>
                <div className="space-y-4 ml-9">
                  {/* Pregunta 1 */}
                  <div>
                    <p className="text-sm font-medium text-inst-texto mb-2">
                      1. ¿El servidor cumplió con los compromisos concertados?
                    </p>
                    <div className="flex gap-3">
                      {(['si', 'no'] as const).map(val => (
                        <label
                          key={val}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                            cumplioCompromisos === val
                              ? val === 'si'
                                ? 'bg-green-50 border-green-400 text-green-700'
                                : 'bg-red-50 border-red-400 text-red-700'
                              : 'bg-white border-inst-borde text-inst-texto-claro hover:bg-inst-gris'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cumplio"
                            value={val}
                            checked={cumplioCompromisos === val}
                            onChange={() => setCumplioCompromisos(val)}
                            className="sr-only"
                          />
                          <span className="material-icons text-sm">
                            {val === 'si' ? 'check_circle' : 'cancel'}
                          </span>
                          {val === 'si' ? 'Sí' : 'No'}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Pregunta 2 */}
                  <div>
                    <p className="text-sm font-medium text-inst-texto mb-2">
                      2. ¿El servidor realizó algún aporte adicional relevante?
                    </p>
                    <div className="flex gap-3">
                      {(['si', 'no'] as const).map(val => (
                        <label
                          key={val}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                            aporteAdicional === val
                              ? val === 'si'
                                ? 'bg-green-50 border-green-400 text-green-700'
                                : 'bg-red-50 border-red-400 text-red-700'
                              : 'bg-white border-inst-borde text-inst-texto-claro hover:bg-inst-gris'
                          }`}
                        >
                          <input
                            type="radio"
                            name="aporte"
                            value={val}
                            checked={aporteAdicional === val}
                            onChange={() => setAporteAdicional(val)}
                            className="sr-only"
                          />
                          <span className="material-icons text-sm">
                            {val === 'si' ? 'add_circle' : 'remove_circle'}
                          </span>
                          {val === 'si' ? 'Sí' : 'No'}
                        </label>
                      ))}
                    </div>
                    {aporteAdicional === 'si' && (
                      <div className="mt-3">
                        <label className="edl-label">Describa el aporte adicional</label>
                        <textarea
                          value={descAporte}
                          onChange={e => setDescAporte(e.target.value)}
                          className="edl-input min-h-[80px]"
                          placeholder="Describa el aporte adicional relevante realizado por el servidor..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Barra de acciones finales ── */}
            {compromisos.length > 0 && (
              <div className="edl-card bg-inst-gris border border-inst-borde">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-inst-texto-claro">
                    <span className="material-icons text-lg">info</span>
                    {evaluacionSel.estado === 'en_proceso' || evaluacionSel.estado === 'pendiente'
                      ? 'Complete la evaluación de todos los compromisos antes de guardar.'
                      : evaluacionSel.estado === 'calificada'
                        ? 'La evaluación está calificada. Puede solicitar revisión o finalizar.'
                        : 'Evaluación finalizada.'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={cancelar}
                      className="edl-btn-outline flex items-center gap-1 text-sm"
                    >
                      <span className="material-icons text-sm">arrow_back</span>
                      Cancelar
                    </button>
                    <button
                      onClick={() => setConfirmModal({ type: 'guardar', msg: '¿Confirma que desea guardar la evaluación? Podrá editarla posteriormente.' })}
                      disabled={saving || resumen.evaluados < resumen.total}
                      className="edl-btn-primary flex items-center gap-1 text-sm disabled:opacity-50"
                    >
                      <span className="material-icons text-sm">save</span>
                      {saving ? 'Guardando...' : 'Guardar Evaluación'}
                    </button>
                    <button
                      onClick={() => setConfirmModal({ type: 'revision', msg: '¿Confirma que desea solicitar revisión de esta evaluación por un nivel superior?' })}
                      disabled={saving || resumen.evaluados < resumen.total}
                      className="bg-amber-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-amber-700 flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-sm">rate_review</span>
                      Solicitar Revisión
                    </button>
                    <button
                      onClick={() => setConfirmModal({ type: 'finalizar', msg: '¿Confirma que desea finalizar la evaluación? La calificación se hará definitiva y no podrá editarse.' })}
                      disabled={saving || resumen.evaluados < resumen.total || !cumplioCompromisos || !aporteAdicional}
                      className="bg-inst-verde text-white px-4 py-2 rounded font-medium text-sm hover:bg-inst-verde/90 flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-sm">task_alt</span>
                      Finalizar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═══ COLUMNA DERECHA (1/3): Resumen ═══ */}
          <div className="space-y-6">
            {/* ── Resumen de evaluación ── */}
            <div className="edl-card sticky top-6">
              <h3 className="font-heading font-bold text-inst-azul flex items-center gap-2 mb-4">
                <span className="material-icons">analytics</span>
                Resumen de Evaluación
              </h3>

              {/* Puntaje definitivo */}
              <div className="text-center py-4 bg-inst-gris rounded-lg mb-4">
                <p className="text-xs text-inst-texto-claro uppercase font-medium mb-1">Calificación Definitiva</p>
                <p className={`text-5xl font-heading font-bold ${
                  resumen.puntajePonderado >= 80 ? 'text-green-600' :
                  resumen.puntajePonderado >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {resumen.puntajePonderado.toFixed(1)}
                </p>
                <p className="text-xs text-inst-texto-claro mt-1">de 100 puntos</p>
              </div>

              {/* Escala conceptual */}
              <div className="mb-4 p-3 bg-white border border-inst-borde rounded-lg">
                <p className="text-xs font-medium text-inst-texto-claro mb-2">Escala Conceptual</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                      Sobresaliente
                    </span>
                    <span className="font-medium text-green-700">90 — 100</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                      Satisfactorio
                    </span>
                    <span className="font-medium text-blue-700">60 — 89</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                      No Satisfactorio
                    </span>
                    <span className="font-medium text-amber-700">30 — 59</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                      Deficiente
                    </span>
                    <span className="font-medium text-red-700">0 — 29</span>
                  </div>
                </div>
              </div>

              {/* Detalle de compromisos */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-inst-texto-claro">Detalle por Compromiso</p>
                {compromisos.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-xs py-1.5 border-b border-inst-borde/50 last:border-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className={`material-icons text-xs flex-shrink-0 ${
                        c.tipo === 'funcional' ? 'text-inst-azul' : 'text-inst-verde'
                      }`}>
                        {c.tipo === 'funcional' ? 'task_alt' : 'psychology'}
                      </span>
                      <span className="text-inst-texto truncate">{c.descripcion}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-inst-texto-claro">({c.peso}%)</span>
                      {c.puntaje !== null ? (
                        <span className={`font-bold ${
                          c.puntaje >= 80 ? 'text-green-600' : c.puntaje >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {((c.puntaje * c.peso) / 100).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-inst-texto-claro italic">pend.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total pesos */}
              <div className="mt-4 pt-3 border-t border-inst-borde flex items-center justify-between text-sm">
                <span className="font-medium text-inst-texto-claro">Total Peso:</span>
                <span className={`font-bold ${resumen.totalPeso === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                  {resumen.totalPeso}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-inst-texto-claro">Puntaje Total:</span>
                <span className={`font-bold ${
                  resumen.puntajePonderado >= 80 ? 'text-green-600' :
                  resumen.puntajePonderado >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {resumen.puntajePonderado.toFixed(2)}
                </span>
              </div>

              {/* Botón ver detalle */}
              <button
                onClick={() => setEvaluacionSel(null)}
                className="w-full mt-4 text-xs text-inst-azul hover:text-inst-rojo transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-icons text-sm">visibility</span>
                Ver todos los evaluados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Evaluación de Compromiso ═══ */}
      {modalCompromiso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalCompromiso(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="bg-inst-azul text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-icons">
                  {modalCompromiso.tipo === 'funcional' ? 'task_alt' : 'psychology'}
                </span>
                <h3 className="font-heading font-bold">
                  {modalCompromiso.tipo === 'funcional' ? 'Evaluar Compromiso Funcional' : 'Evaluar Competencia Comportamental'}
                </h3>
              </div>
              <button onClick={() => setModalCompromiso(null)} className="text-white/80 hover:text-white">
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Descripción del compromiso */}
              <div>
                <p className="text-xs text-inst-texto-claro uppercase font-medium mb-1">Compromiso</p>
                <p className="text-sm text-inst-texto">{modalCompromiso.descripcion}</p>
                {modalCompromiso.resultado_esperado && (
                  <p className="text-xs text-inst-verde mt-1">
                    <span className="font-medium">Resultado esperado:</span> {modalCompromiso.resultado_esperado}
                  </p>
                )}
                {modalCompromiso.medio_verificacion && (
                  <p className="text-xs text-inst-texto-claro mt-1">
                    <span className="font-medium">Medio de verificación:</span> {modalCompromiso.medio_verificacion}
                  </p>
                )}
              </div>

              {/* Calificación 1-100 con slider */}
              <div>
                <label className="edl-label flex items-center gap-1">
                  <span className="material-icons text-sm text-inst-azul">linear_scale</span>
                  Calificación (1 - 100)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={calificacion}
                    onChange={e => setCalificacion(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-inst-azul"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={calificacion}
                      onChange={e => {
                        const val = Math.max(1, Math.min(100, Number(e.target.value)));
                        setCalificacion(val);
                      }}
                      className="w-16 text-center font-bold text-lg border border-inst-borde rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-inst-azul/30"
                    />
                    <span className="text-xs text-inst-texto-claro">/100</span>
                  </div>
                </div>
                {/* Indicador visual del rango */}
                <div className="flex justify-between text-xs mt-1 px-1">
                  <span className="text-red-500">Deficiente</span>
                  <span className="text-amber-500">No Satisf.</span>
                  <span className="text-blue-500">Satisfactorio</span>
                  <span className="text-green-500">Sobresaliente</span>
                </div>
              </div>

              {/* Competencias comportamentales (solo si es tipo comportamental) */}
              {modalCompromiso.tipo === 'comportamental' && (
                <div>
                  <p className="edl-label flex items-center gap-1 mb-3">
                    <span className="material-icons text-sm text-inst-verde">psychology</span>
                    Conductas Asociadas
                  </p>
                  <div className="space-y-4">
                    {(modalCompromiso.conductas && modalCompromiso.conductas.length > 0
                      ? modalCompromiso.conductas
                      : [
                          { id: 1, descripcion: 'Demuestra compromiso con la institución y sus objetivos misionales', valoracion: null },
                          { id: 2, descripcion: 'Actúa con integridad y ética en el ejercicio de sus funciones', valoracion: null },
                          { id: 3, descripcion: 'Contribuye al trabajo en equipo y al clima organizacional', valoracion: null },
                        ]
                    ).map(conducta => (
                      <div key={conducta.id} className="p-3 bg-inst-gris rounded-lg">
                        <p className="text-sm text-inst-texto mb-2 font-medium">{conducta.descripcion}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {VALORACION_OPTIONS.map(opt => (
                            <label
                              key={opt.value}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs ${
                                conductasForm[conducta.id] === opt.value
                                  ? opt.color
                                  : 'bg-white border-inst-borde text-inst-texto-claro hover:bg-inst-gris'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`conducta_${conducta.id}`}
                                value={opt.value}
                                checked={conductasForm[conducta.id] === opt.value}
                                onChange={() => setConductasForm(prev => ({ ...prev, [conducta.id]: opt.value }))}
                                className="sr-only"
                              />
                              <span className="font-medium">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="edl-label flex items-center gap-1">
                  <span className="material-icons text-sm text-inst-texto-claro">comment</span>
                  Observaciones (opcional)
                </label>
                <textarea
                  value={obsCompromiso}
                  onChange={e => setObsCompromiso(e.target.value)}
                  className="edl-input min-h-[70px]"
                  placeholder="Observaciones sobre la calificación de este compromiso..."
                />
              </div>

              {/* Botones del modal */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-inst-borde">
                <button
                  onClick={() => setModalCompromiso(null)}
                  className="edl-btn-outline text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCalificacion}
                  disabled={guardandoCal}
                  className="edl-btn-primary flex items-center gap-1 text-sm disabled:opacity-50"
                >
                  <span className="material-icons text-sm">check</span>
                  {guardandoCal ? 'Guardando...' : 'Aceptar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Confirmación de acciones ═══ */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setConfirmModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-icons text-3xl text-amber-500">help_outline</span>
              <h3 className="font-heading font-bold text-inst-texto text-lg">Confirmar Acción</h3>
            </div>
            <p className="text-sm text-inst-texto mb-6">{confirmModal.msg}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="edl-btn-outline text-sm"
              >
                No, volver
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'guardar') guardarEvaluacion();
                  else if (confirmModal.type === 'revision') solicitarRevision();
                  else if (confirmModal.type === 'finalizar') finalizarEvaluacion();
                }}
                disabled={saving}
                className={`flex items-center gap-1 text-sm text-white px-4 py-2 rounded font-medium disabled:opacity-50 transition-colors ${
                  confirmModal.type === 'finalizar'
                    ? 'bg-inst-verde hover:bg-inst-verde/90'
                    : confirmModal.type === 'revision'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-inst-azul hover:bg-inst-azul/90'
                }`}
              >
                <span className="material-icons text-sm">
                  {confirmModal.type === 'guardar' ? 'save' : confirmModal.type === 'revision' ? 'rate_review' : 'task_alt'}
                </span>
                {saving ? 'Procesando...' : 'Sí, confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
