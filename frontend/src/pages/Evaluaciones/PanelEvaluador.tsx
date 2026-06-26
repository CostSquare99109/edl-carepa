import { useEffect, useState, useMemo } from 'react';
import { api, type PaginatedData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input, Select, Alert, Badge, Modal, EmptyState, Tooltip, SkeletonText } from '../../components/ui';
import { toast } from 'sonner';

interface Periodo {
  id: number;
  nombre: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
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
  compromiso_competencia?: string;
  decreto?: string;
}

interface Conducta {
  id: number;
  descripcion: string;
  valoracion: string | null;
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

const ESTADO_COMPROMISO: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Sin evaluar', color: 'text-amber-600', bg: 'bg-amber-50' },
  en_progreso: { label: 'En progreso', color: 'text-blue-600', bg: 'bg-blue-50' },
  aprobado: { label: 'Aprobado', color: 'text-blue-600', bg: 'bg-blue-50' },
  cumplido: { label: 'Cumplido', color: 'text-green-600', bg: 'bg-green-50' },
  incumplido: { label: 'Incumplido', color: 'text-red-600', bg: 'bg-red-50' },
  evaluado: { label: 'Evaluado', color: 'text-green-600', bg: 'bg-green-50' },
  validado: { label: 'Validado', color: 'text-inst-azul', bg: 'bg-blue-50' },
};

type ValoracionFrecuencia = 'nunca' | 'algunas_veces' | 'frecuentemente' | 'siempre';

// Mapeo de frecuencia -> puntaje base (4-15) segun CNSC Anexo Tecnico
const FRECUENCIA_PUNTAJE: Record<ValoracionFrecuencia, number> = {
  nunca: 4,
  algunas_veces: 7,
  frecuentemente: 10,
  siempre: 13,
};

// Helpers visuales para los selectores de frecuencia (segun la tarea)
const COLOR_FRECUENCIA: Record<ValoracionFrecuencia, string> = {
  nunca: 'bg-red-100 text-red-700 border-red-300',
  algunas_veces: 'bg-amber-100 text-amber-700 border-amber-300',
  frecuentemente: 'bg-blue-100 text-blue-700 border-blue-300',
  siempre: 'bg-green-100 text-green-700 border-green-300',
};

const OPCIONES_FRECUENCIA: { value: ValoracionFrecuencia; label: string; color: string; puntaje: number }[] = [
  { value: 'nunca', label: 'Nunca', color: COLOR_FRECUENCIA.nunca, puntaje: 4 },
  { value: 'algunas_veces', label: 'Algunas veces', color: COLOR_FRECUENCIA.algunas_veces, puntaje: 7 },
  { value: 'frecuentemente', label: 'Frecuentemente', color: COLOR_FRECUENCIA.frecuentemente, puntaje: 10 },
  { value: 'siempre', label: 'Siempre', color: COLOR_FRECUENCIA.siempre, puntaje: 13 },
];

// Selectores exactos de la tarea
const OPCIONES_APORTE_LOGRO = [
  { value: 'si', label: 'Si' },
  { value: 'moderadamente', label: 'Moderadamente' },
  { value: 'no', label: 'No' },
] as const;

const OPCIONES_EXCEDE_ESTIPULADO = [
  { value: 'si', label: 'Si' },
  { value: 'no', label: 'No' },
] as const;

// Tipos de evaluacion con etiqueta EXACTA segun tarea_evaluador.md
const TIPOS_EVALUACION = [
  { value: 'parcial_eventual', label: 'Evaluacion parcial eventual', backend: 'parcial_eventual' },
  { value: 'primer_semestre', label: 'Evaluacion 1 semestre', backend: 'parcial_primer_semestre' },
  { value: 'segundo_semestre', label: 'Evaluacion 2 semestre', backend: 'parcial_segundo_semestre' },
  { value: 'extraordinaria', label: 'Calificacion extraordinaria', backend: 'calificacion_extraordinaria' },
] as const;

// Conductas oficiales Compromisos con la organizacion - Decreto 815/2018 (segun tarea_evaluador.md)
const CONDUCTAS_COMPROMISO_ORGANIZACION = [
  'Promueve el cumplimiento de las metas de la organizacion y respeta sus normas.',
  'Aunque pone las necesidades de la organizacion por encima de sus propias necesidades.',
  'Apoya la organizacion en situaciones difficiles.',
  'Demuestra sentido de pertenencia en todas sus actuaciones.',
  'Toma la iniciativa de colaborar con sus companeros y con otras areas cuando se requiere, sin descuidar sus tareas.',
];

// Motivos según backend enum: cambio_evaluador, lapso_ultima_evaluacion, periodo_prueba_otro_empleo, separacion_temporal_mas_30_dias, cambio_empleo_traslado
const MOTIVOS_PARCIAL = [
  { value: 'cambio_evaluador', label: 'Cambio de evaluador' },
  { value: 'lapso_ultima_evaluacion', label: 'Lapso entre la última evaluación y el final del período' },
  { value: 'periodo_prueba_otro_empleo', label: 'Período de prueba en otro empleo' },
  { value: 'separacion_temporal_mas_30_dias', label: 'Separación temporal del empleo por más de 30 días calendario' },
  { value: 'cambio_empleo_traslado', label: 'Cambio de empleo por traslado o reubicación' },
] as const;

// Razones para separacion temporal segun Video 9 CNSC
const RAZONES_SEPARACION = [
  { value: 'suspension', label: 'Suspensión' },
  { value: 'encargo', label: 'Por asumir o finalizar encargo en funciones de otro empleo' },
  { value: 'licencia', label: 'Licencias' },
  { value: 'comision', label: 'Comisiones' },
  { value: 'vacaciones', label: 'Vacaciones' },
] as const;

// Motivos para "No es jefe inmediato"
const MOTIVOS_NO_JEFE = [
  { value: 'retiro_empleado_responsable', label: 'Retiro del empleado responsable de evaluar' },
  { value: 'impedimento', label: 'Impedimento' },
  { value: 'recusacion', label: 'Recusación' },
] as const;

const APORTE_OPTIONS = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'moderadamente', label: 'Moderadamente' },
] as const;

const PESO_FUNCIONALES = 85;
const PESO_COMPORTAMENTALES = 15;
const UMBRAL_SOBRESALIENTE = 90;
const UMBRAL_SATISFACTORIO = 65;
const MIN_CARACTERES_EXCEDE = 40;

// Extrae el anio de inicio de un nombre de periodo tipo "2026-2027"
function getAnioInicioPeriodo(nombre?: string | null): number | null {
  if (!nombre) return null;
  const m = /^(\d{4})/.exec(nombre.trim());
  return m ? parseInt(m[1], 10) : null;
}

// Valida que las fechas de evaluacion caigan entre 01-08-Anio y 31-01-Anio+1
function validarFechas2doSemestreLocal(
  fechaInicio: string,
  fechaFin: string,
  nombrePeriodo: string | null | undefined,
): string | null {
  const anio = getAnioInicioPeriodo(nombrePeriodo);
  if (!anio || !fechaInicio || !fechaFin) return null;
  const fechaMin = `${anio}-08-01`;
  const fechaMax = `${anio + 1}-01-31`;
  if (fechaInicio < fechaMin) return `La fecha de inicio debe ser >= ${fechaMin} (01-08-${anio}).`;
  if (fechaFin > fechaMax) return `La fecha de fin debe ser <= ${fechaMax} (31-01-${anio + 1}).`;
  if (fechaInicio > fechaFin) return 'La fecha de inicio no puede ser posterior a la fecha de fin.';
  return null;
}

function escalaComportamental(puntaje: number): string {
  if (puntaje >= 13) return 'Muy Alto';
  if (puntaje >= 10) return 'Alto';
  if (puntaje >= 7) return 'Aceptable';
  return 'Bajo';
}

function escalaFinal(puntaje: number): { label: string; color: string } {
  if (puntaje >= UMBRAL_SOBRESALIENTE) return { label: 'Sobresaliente', color: 'text-green-700 bg-green-50' };
  if (puntaje > UMBRAL_SATISFACTORIO) return { label: 'Satisfactorio', color: 'text-blue-700 bg-blue-50' };
  return { label: 'No Satisfactorio', color: 'text-red-700 bg-red-50' };
}

const ESCALA_FINAL_TONE: Record<string, 'success' | 'info' | 'danger'> = {
  Sobresaliente: 'success',
  Satisfactorio: 'info',
  'No Satisfactorio': 'danger',
};

const ESCALA_FINAL_DESC: Record<string, string> = {
  Sobresaliente: '≥ 90% — Desempeño destacado. Acceso a encargos, comisiones y derechos de carrera.',
  Satisfactorio: '> 65% y < 90% — Desempeño adecuado. Permanencia en el servicio.',
  'No Satisfactorio': '≤ 65% — Requiere suscripción de compromisos de mejoramiento. Posible separación.',
};

const ESCALA_CONSECUENCIAS: Record<string, { titulo: string; items: string[]; tone: 'success' | 'info' | 'danger' }> = {
  Sobresaliente: {
    titulo: 'Consecuencias (Decreto 815/2018, Ley 1960/2019)',
    tone: 'success',
    items: [
      'Adquiere derechos de carrera administrativa',
      'Acceso a encargos (cumpliendo requisitos Ley 1960/2019)',
      'Acceso a comisiones en empleos de libre nombramiento y remoción',
      'Acceso a beneficios del plan de estímulos de la entidad',
    ],
  },
  Satisfactorio: {
    titulo: 'Consecuencias (Decreto 815/2018, Ley 1960/2019)',
    tone: 'info',
    items: [
      'Adquiere derechos de carrera administrativa',
      'Permanece en el servicio y conserva derechos de carrera',
      'Acceso a encargos si no hay empleados con evaluación sobresaliente',
    ],
  },
  'No Satisfactorio': {
    titulo: 'Consecuencias (Decreto 815/2018, Decreto 760/2005)',
    tone: 'danger',
    items: [
      'Separación de la carrera administrativa y pérdida de derechos de carrera',
      'Retiro del servicio',
      'Pérdida del encargo y obligación de regresar al empleo con derechos de carrera',
      'En periodo de prueba: regresa al cargo anterior al no superar la evaluación',
      'Si la evaluación es en firme, el jefe de personal proyecta acto administrativo de insubsistencia en máximo 3 días',
      'Procede recurso de reposición y apelación (Código Contencioso Administrativo)',
    ],
  },
};

export default function PanelEvaluador() {
  const { usuario, rolActivo } = useAuth();

  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoId, setPeriodoId] = useState<number>(0);
  const [busquedaDoc, setBusquedaDoc] = useState('');
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionAsignada[]>([]);
  const [evaluacionSel, setEvaluacionSel] = useState<EvaluacionAsignada | null>(null);
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');

  // Paso 1: configuración de la evaluación
  const [tipoEvaluacion, setTipoEvaluacion] = useState('');
  const [motivoEvaluacion, setMotivoEvaluacion] = useState('');
  const [razonEvaluacion, setRazonEvaluacion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [noEsJefe, setNoEsJefe] = useState(false);
  const [motivoNoJefe, setMotivoNoJefe] = useState('');
  const [evaluacionIniciada, setEvaluacionIniciada] = useState(false);

  // Modal de calificación
  const [modalCompromiso, setModalCompromiso] = useState<Compromiso | null>(null);
  const [calificacion, setCalificacion] = useState<number>(50);
  const [conductasForm, setConductasForm] = useState<Record<number, ValoracionFrecuencia>>({});
  const [obsCompromiso, setObsCompromiso] = useState('');
  const [guardandoCal, setGuardandoCal] = useState(false);

  // Preguntas de cierre
  const [cumplioCompromisos, setCumplioCompromisos] = useState<'si' | 'no' | ''>('');
  const [aporteAdicional, setAporteAdicional] = useState<'si' | 'no' | 'moderadamente' | ''>('');
  const [descAporte, setDescAporte] = useState('');
  const [justificacion, setJustificacion] = useState('');

  // Preguntas de impacto por compromiso comportamental (segun tarea_evaluador.md)
  const [impactoAporta, setImpactoAporta] = useState<'' | 'si' | 'no' | 'moderadamente'>('');
  const [impactoExcede, setImpactoExcede] = useState<'' | 'si' | 'no'>('');
  const [justificacionExcede, setJustificacionExcede] = useState('');

  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ type: 'guardar' | 'revision' | 'finalizar'; msg: string } | null>(null);

  // Mensaje de validacion de fechas 2do semestre (computado on-demand)
  const validacionFechasMsg = useMemo(() => {
    if (tipoEvaluacion !== 'segundo_semestre') return null;
    const periodo = periodos.find(p => p.id === periodoId);
    return validarFechas2doSemestreLocal(fechaInicio, fechaFin, periodo?.nombre);
  }, [tipoEvaluacion, fechaInicio, fechaFin, periodoId, periodos]);

  useEffect(() => { cargarPeriodos(); }, []);

  async function cargarPeriodos() {
    try {
      const res = await api.get<PaginatedData<Periodo>>('/periodos?por_pagina=50');
      const activos = (res.data || []).filter(p =>
        p.estado === 'en_evaluacion' || p.estado === 'evaluacion' ||
        p.estado === 'activa' || p.estado === 'activo' || p.estado === 'seguimiento'
      );
      setPeriodos(res.data || []);
      if (activos.length > 0) setPeriodoId(activos[0].id);
      else if ((res.data || []).length > 0) setPeriodoId((res.data || [])[0].id);
    } catch {}
  }

  useEffect(() => { if (periodoId) cargarEvaluaciones(); }, [periodoId]);

  async function cargarEvaluaciones() {
    setLoading(true);
    try {
      const res = await api.get<PaginatedData<EvaluacionAsignada>>(
        `/evaluaciones?evaluador=me&periodo_id=${periodoId}&por_pagina=50`
      );
      setEvaluaciones(res.data || []);
    } catch {} finally { setLoading(false); }
  }

  async function buscarEvaluado() {
    if (!busquedaDoc.trim()) return;
    setBuscando(true);
    setErrorBusqueda('');
    try {
      const termino = busquedaDoc.trim();
      const esNumerico = /^\d+$/.test(termino);
      let encontrados: EvaluacionAsignada[] = [];

      // Estrategia combinada: endpoint dedicado /buscar-evaluado (doc | nombre)
      // + fallback a listado por documento para mantener compatibilidad.
      try {
        const params: Record<string, string | number> = { por_pagina: 30 };
        if (periodoId > 0) params.periodo_id = periodoId;
        if (esNumerico) {
          params.documento = termino;
        } else {
          params.nombre = termino;
        }
        const qs = new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)]),
        ).toString();
        const res = await api.get<any>(`/evaluaciones/buscar-evaluado?${qs}`);
        const data: any[] = Array.isArray(res) ? res : (res.data || []);
        encontrados = data.map((row: any) => ({
          id: row.evaluacion_id && row.evaluacion_id > 0 ? row.evaluacion_id : row.id,
          evaluado_id: row.id,
          evaluado_nombre: row.nombre_completo || row.evaluado_nombre || '',
          evaluado_cargo: row.denominacion || row.cargo || row.evaluado_cargo || '',
          evaluado_documento: row.documento || row.evaluado_documento || '',
          evaluado_dependencia: row.dependencia || row.dependencia_nombre || row.evaluado_dependencia || '',
          evaluado_vinculacion: row.tipo_vinculacion || row.evaluado_vinculacion || '',
          tipo: row.evaluacion_tipo || 'parcial_primer_semestre',
          estado: row.evaluacion_estado || 'pendiente',
          periodo_nombre: row.periodo_nombre || (periodos.find(p => p.id === periodoId)?.nombre ?? ''),
          periodo_id: periodoId,
          puntaje_final: row.calificacion_definitiva ?? null,
          compromisos_count: 0,
          compromisos_evaluados: 0,
          evaluado_nivel: row.nivel || '',
          evaluado_codigo: row.codigo || row.dependencia_codigo || '',
          evaluado_grado: row.grado || '',
        } as EvaluacionAsignada));
      } catch {
        // Fallback legacy
        const res = await api.get<PaginatedData<EvaluacionAsignada>>(
          `/evaluaciones?evaluador=me&documento=${encodeURIComponent(termino)}&por_pagina=10`,
        );
        encontrados = res.data || [];
      }

      if (encontrados.length === 0) {
        setErrorBusqueda(
          esNumerico
            ? 'No se encontro un evaluado con ese documento para el periodo seleccionado.'
            : 'No se encontro un evaluado con ese nombre para el periodo seleccionado.',
        );
      } else {
        setEvaluaciones(encontrados);
      }
    } catch (err: any) {
      setErrorBusqueda(err.message || 'Error en la busqueda');
    } finally { setBuscando(false); }
  }

  async function seleccionarEvaluacion(ev: EvaluacionAsignada) {
    setEvaluacionSel(ev);
    setEvaluacionIniciada(false);
    setTipoEvaluacion('');
    setMotivoEvaluacion('');
    setRazonEvaluacion('');
    setFechaInicio('');
    setFechaFin('');
    setNoEsJefe(false);
    setMotivoNoJefe('');
    setCumplioCompromisos('');
    setAporteAdicional('');
    setDescAporte('');
    setJustificacion('');
    try {
      const res = await api.get<any>(`/compromisos/evaluacion/${ev.id}`);
      const funcionales = (res.data?.funcionales || []).filter((c: Compromiso) =>
        c.estado === 'aprobado' || c.estado === 'cumplido' || c.estado === 'incumplido' || c.estado === 'en_progreso'
      );
      const comportamentales = (res.data?.comportamentales || []).filter((c: Compromiso) =>
        c.estado === 'aprobado' || c.estado === 'cumplido' || c.estado === 'incumplido' || c.estado === 'en_progreso'
      );
      setCompromisos([...funcionales, ...comportamentales]);
    } catch { setCompromisos([]); }
  }

  function abrirModalEvaluacion(comp: Compromiso) {
    setModalCompromiso(comp);
    if (comp.tipo === 'funcional') {
      setCalificacion(comp.puntaje ?? 50);
    } else {
      // Para comportamental, el puntaje se calcula de las frecuencias (4-15)
      setCalificacion(comp.puntaje ?? 10);
    }
    setObsCompromiso('');
    const initConductas: Record<number, ValoracionFrecuencia> = {};
    if (comp.conductas) {
      comp.conductas.forEach(c => {
        if (c.valoracion && ['nunca', 'algunas_veces', 'frecuentemente', 'siempre'].includes(c.valoracion)) {
          initConductas[c.id] = c.valoracion as ValoracionFrecuencia;
        }
      });
    }
    setConductasForm(initConductas);
  }

  // Calcular puntaje comportamental (4-15) a partir de las frecuencias
  function calcularPuntajeComportamental(conductasValues: Record<number, ValoracionFrecuencia>): number {
    const valores = Object.values(conductasValues);
    if (valores.length === 0) return 0;
    const suma = valores.reduce((acc, v) => acc + FRECUENCIA_PUNTAJE[v], 0);
    return Math.round((suma / valores.length) * 10) / 10; // Promedio 4-15
  }

  async function guardarCalificacion() {
    if (!modalCompromiso || !evaluacionSel) return;
    setGuardandoCal(true);
    try {
      let puntajeFinal: number;
      let payload: any = { observaciones: obsCompromiso };

      if (modalCompromiso.tipo === 'comportamental') {
        const totalConductas = modalCompromiso.conductas?.length || 0;
        const respondidas = Object.keys(conductasForm).length;
        if (totalConductas > 0 && respondidas < totalConductas) {
          toast.error('Debe valorar todas las conductas antes de calificar.');
          setGuardandoCal(false);
          return;
        }
        if (totalConductas === 0 && (calificacion < 4 || calificacion > 15)) {
          toast.error('El puntaje comportamental debe estar entre 4 y 15.');
          setGuardandoCal(false);
          return;
        }
        puntajeFinal = totalConductas > 0 ? calcularPuntajeComportamental(conductasForm) : calificacion;
        payload.puntaje = puntajeFinal;
        payload.conductas = Object.entries(conductasForm).map(([id, valor]) => ({
          conducta_id: Number(id),
          valoracion: valor,
        }));
        payload.nivel_comportamental = escalaComportamental(puntajeFinal).toLowerCase().replace(' ', '_');
      } else {
        if (calificacion < 0 || calificacion > 100) {
          toast.error('La calificación funcional debe estar entre 0 y 100.');
          setGuardandoCal(false);
          return;
        }
        puntajeFinal = calificacion;
        payload.puntaje = puntajeFinal;
      }

      await api.put(`/compromisos/${modalCompromiso.id}/calificar`, payload);
      toast.success(`La calificación del compromiso se registró correctamente (${puntajeFinal} puntos).`);
      setCompromisos(prev => prev.map(c =>
        c.id === modalCompromiso.id ? { ...c, puntaje: puntajeFinal, estado: puntajeFinal >= 65 || puntajeFinal >= 4 ? 'evaluado' : 'incumplido' } : c
      ));
      setModalCompromiso(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al calificar compromiso');
    } finally { setGuardandoCal(false); }
  }

  const funcionales = compromisos.filter(c => c.tipo === 'funcional');
  const comportamentales = compromisos.filter(c => c.tipo === 'comportamental');

  // Resumen con cálculos corregidos según backend
  const resumen = useMemo(() => {
    // Funcionales: promedio ponderado por peso (cada compromiso funcional es 0-100)
    let sumaCalifFunc = 0;
    let sumaPesoFunc = 0;
    funcionales.forEach(c => {
      if (c.puntaje !== null) {
        sumaCalifFunc += (c.puntaje ?? 0) * c.peso;
        sumaPesoFunc += c.peso;
      }
    });
    const notaFuncPct = sumaPesoFunc > 0 ? sumaCalifFunc / sumaPesoFunc : 0;

    // Comportamentales: cada puntaje es 4-15. Se promedia ponderado por peso y se convierte a %
    let sumaCalifComp = 0;
    let sumaPesoComp = 0;
    comportamentales.forEach(c => {
      if (c.puntaje !== null) {
        sumaCalifComp += (c.puntaje ?? 0) * c.peso;
        sumaPesoComp += c.peso;
      }
    });
    const puntajeCompBruto = sumaPesoComp > 0 ? sumaCalifComp / sumaPesoComp : 0;

    // Convertir 4-15 a %: (puntaje - 4) / 11 * 100
    const notaCompPct = puntajeCompBruto >= 4 ? ((puntajeCompBruto - 4) / 11) * 100 : 0;

    // Nota definitiva con pesos: 85% funcional + 15% comportamental
    const notaDefinitiva = (notaFuncPct * PESO_FUNCIONALES / 100) + (notaCompPct * PESO_COMPORTAMENTALES / 100);
    const esc = escalaFinal(notaDefinitiva);
    const escComp = puntajeCompBruto > 0 ? escalaComportamental(puntajeCompBruto) : '-';

    const evaluados = compromisos.filter(c => c.puntaje !== null).length;
    return {
      notaFuncionales: notaFuncPct,
      notaComportamentalesRaw: puntajeCompBruto, // 4-15
      notaComportamentalesPct: notaCompPct,     // 0-100
      notaDefinitiva,
      escalaFinal: esc,
      escalaComportamental: escComp,
      evaluados,
      total: compromisos.length,
    };
  }, [compromisos]);

  function validarEvaluacion(): string | null {
    const sinEvaluar = compromisos.filter(c => c.puntaje === null);
    if (sinEvaluar.length > 0)
      return `Faltan por evaluar ${sinEvaluar.length} compromiso(s). Todos los compromisos deben estar calificados antes de guardar.`;
    if (!cumplioCompromisos)
      return 'Debe responder si el servidor cumplió con los compromisos concertados.';
    if (!aporteAdicional)
      return 'Debe responder si el servidor realizó algún aporte adicional relevante.';
    if ((aporteAdicional === 'si' || aporteAdicional === 'moderadamente') && !descAporte.trim())
      return 'Debe describir el aporte adicional realizado por el servidor.';
    if (aporteAdicional === 'si' && justificacion.trim().length < 40)
      return 'Cuando el aporte es afirmativo, debe ingresar una justificación de mínimo 40 caracteres.';
    return null;
  }

  function getTipoBackend(): string {
    const found = TIPOS_EVALUACION.find(t => t.value === tipoEvaluacion);
    return found ? found.backend : tipoEvaluacion;
  }

  function buildGuardarPayload(): any {
    return {
      cumplio_compromisos: cumplioCompromisos === 'si',
      aporte_adicional: aporteAdicional === 'si',
      aporte_moderado: aporteAdicional === 'moderadamente',
      descripcion_aporte: descAporte,
      justificacion: justificacion,
      tipo_evaluacion: getTipoBackend(),
      motivo: motivoEvaluacion,
      razon: razonEvaluacion,
      fecha_inicio_eval: fechaInicio,
      fecha_fin_eval: fechaFin,
    };
  }

  async function guardarEvaluacion() {
    const err = validarEvaluacion();
    if (err) { toast.error(err); return; }
    if (!evaluacionSel) return;
    setSaving(true);
    try {
      await api.put(`/evaluaciones/${evaluacionSel.id}/guardar`, buildGuardarPayload());
      toast.success('Se guardó la evaluación correctamente.');
      cargarEvaluaciones();
      setEvaluacionSel(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar evaluación');
    } finally { setSaving(false); setConfirmModal(null); }
  }

  async function solicitarRevision() {
    if (!evaluacionSel) return;
    setSaving(true);
    try {
      await api.put(`/evaluaciones/${evaluacionSel.id}/solicitar-revision`, {});
      toast.success('Revisión solicitada exitosamente.');
      cargarEvaluaciones();
      setEvaluacionSel(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al solicitar revisión');
    } finally { setSaving(false); setConfirmModal(null); }
  }

  async function finalizarEvaluacion() {
    const err = validarEvaluacion();
    if (err) { toast.error(err); return; }
    if (!evaluacionSel) return;
    setSaving(true);
    try {
      await api.put(`/evaluaciones/${evaluacionSel.id}/finalizar`, buildGuardarPayload());
      toast.success('La evaluación se finalizó correctamente. La calificación queda en firme y requiere aprobación de la Comisión Evaluadora.');
      cargarEvaluaciones();
      setEvaluacionSel(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al finalizar evaluación');
    } finally { setSaving(false); setConfirmModal(null); }
  }

  function cancelar() {
    setEvaluacionSel(null);
    setCompromisos([]);
    setCumplioCompromisos('');
    setAporteAdicional('');
    setDescAporte('');
    setJustificacion('');
    setEvaluacionIniciada(false);
    setNoEsJefe(false);
    setMotivoNoJefe('');
  }

  const puntajeComportamentalCalculado = modalCompromiso?.tipo === 'comportamental'
    ? (modalCompromiso.conductas?.length ?? 0) > 0
      ? calcularPuntajeComportamental(conductasForm)
      : calificacion
    : null;

  return (
    <div className="min-h-screen space-y-6">
      <div className="animate-fadeIn">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons text-inst-azul-osc text-xl">rate_review</span>
          <h2 className="edl-section-title">Evaluar</h2>
        </div>
        <p className="text-sm text-inst-texto-claro ml-7">
          Periodo - Calificacion de compromisos funcionales y competencias comportamentales (Sistema Tipo EDL, Acuerdo 617/2018)
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-inst-borde pb-3">
            <span className="material-icons text-inst-azul">calendar_today</span>
            <h3 className="font-heading font-bold text-lg text-inst-texto">Periodo</h3>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[240px]">
              <Select
                label="Seleccione un periodo"
                value={periodoId || ''}
                onChange={e => setPeriodoId(Number(e.target.value))}
                placeholder="Seleccione un periodo..."
                options={periodos.map(p => ({ value: String(p.id), label: p.nombre }))}
              />
            </div>
            <div className="flex-1 min-w-[320px]">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    label="Buscar evaluado por documento o nombre"
                    type="text"
                    value={busquedaDoc}
                    onChange={e => setBusquedaDoc(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && buscarEvaluado()}
                    placeholder="Numero de documento o nombre del evaluado..."
                  />
                </div>
                <Tooltip content="Buscar evaluado en el periodo seleccionado">
                  <Button
                    variant="primary"
                    onClick={buscarEvaluado}
                    loading={buscando}
                    disabled={!busquedaDoc.trim()}
                  >
                    Buscar evaluado
                  </Button>
                </Tooltip>
              </div>
              {errorBusqueda ? (
                <Alert tone="danger" className="mt-2">{errorBusqueda}</Alert>
              ) : null}
              {evaluaciones.length > 0 && !evaluacionSel && (
                <p className="text-xs text-inst-texto-claro mt-2">
                  Se encontraron {evaluaciones.length} evaluado(s). Use los botones <b>Evaluar</b> o <b>Ver evaluaciones</b> en la columna <b>Opciones</b>.
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {!evaluacionSel ? (
        <Card>
          <div className="flex items-center gap-2 border-b border-inst-borde pb-3 mb-3">
            <span className="material-icons text-inst-azul">group</span>
            <h3 className="font-heading font-bold text-lg text-inst-texto">Evaluados del periodo</h3>
          </div>
          {loading ? (
            <SkeletonText lines={8} />
          ) : evaluaciones.length === 0 ? (
            <EmptyState
              icon={<span className="material-icons text-3xl">assignment_late</span>}
              title="Sin evaluados en el periodo"
              description="No hay evaluados disponibles para el periodo seleccionado. Use el buscador por documento o nombre para localizar uno."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="edl-table">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Evaluado</th>
                    <th>Nivel</th>
                    <th>Denominacion</th>
                    <th>Codigo</th>
                    <th>Grado</th>
                    <th className="w-56">Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluaciones.map(ev => {
                    return (
                      <tr key={ev.id}>
                        <td className="font-mono text-sm">{ev.evaluado_documento || '-'}</td>
                        <td className="text-sm">
                          <div className="font-medium">{ev.evaluado_nombre}</div>
                          <div className="text-xs text-inst-texto-claro">{ev.evaluado_dependencia || ''}</div>
                        </td>
                        <td className="text-sm">{(ev as any).evaluado_nivel || '-'}</td>
                        <td className="text-sm">{ev.evaluado_cargo || '-'}</td>
                        <td className="font-mono text-sm">{(ev as any).evaluado_codigo || '-'}</td>
                        <td className="text-center text-sm">{(ev as any).evaluado_grado || '-'}</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => seleccionarEvaluacion(ev)}
                              title={`Evaluar a ${ev.evaluado_nombre}`}
                            >
                              <span className="material-icons text-sm mr-1">edit</span>
                              Evaluar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.assign(`/dashboard/evaluar/${ev.id}/historial`)}
                              title={`Ver evaluaciones de ${ev.evaluado_nombre}`}
                            >
                              <span className="material-icons text-sm mr-1">visibility</span>
                              Ver evaluaciones
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : !evaluacionIniciada ? (
        <div className="edl-card">
          <div className="border-l-4 border-l-inst-azul p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons text-inst-azul text-2xl">account_circle</span>
              <h3 className="font-heading font-bold text-lg text-inst-texto">{evaluacionSel.evaluado_nombre}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm ml-9">
              <div><span className="text-inst-texto-claro">Cargo:</span> <span className="font-medium">{evaluacionSel.evaluado_cargo}</span></div>
              <div><span className="text-inst-texto-claro">Dependencia:</span> <span className="font-medium">{evaluacionSel.evaluado_dependencia}</span></div>
              <div><span className="text-inst-texto-claro">Documento:</span> <span className="font-medium">{evaluacionSel.evaluado_documento}</span></div>
              <div><span className="text-inst-texto-claro">Vinculación:</span> <span className="font-medium">{evaluacionSel.evaluado_vinculacion}</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="edl-label">Tipo de evaluacion *</label>
              <select
                value={tipoEvaluacion}
                onChange={e => setTipoEvaluacion(e.target.value)}
                aria-label="Tipo de evaluacion"
                className="edl-input"
              >
                <option value="">Seleccione...</option>
                {TIPOS_EVALUACION.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Panel especifico Evaluacion 2 Semestre (segun tarea_evaluador.md) */}
            {tipoEvaluacion === 'segundo_semestre' && (
              <div className="edl-card border-l-4 border-l-inst-amarillo bg-amber-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-icons text-inst-amarillo">warning_amber</span>
                  <h4 className="font-heading font-bold text-inst-texto">Evaluacion 2 Semestre</h4>
                </div>
                <ol className="list-decimal ml-5 space-y-1 text-sm text-inst-texto">
                  <li>Debe tener una evaluacion para el primer semestre.</li>
                  <li>
                    La fecha de evaluacion debe estar entre <b>01-08-Anio</b> y <b>31-01-Anio+1</b>.
                    {(() => {
                      const anio = getAnioInicioPeriodo(periodos.find(p => p.id === periodoId)?.nombre);
                      if (!anio) return null;
                      return (
                        <span className="block mt-1 text-xs text-inst-texto-claro">
                          Para este periodo ({anio}-{anio + 1}): desde <b>{anio}-08-01</b> hasta <b>{anio + 1}-01-31</b>.
                        </span>
                      );
                    })()}
                  </li>
                </ol>
                {validacionFechasMsg ? (
                  <Alert tone="danger" className="mt-3 text-xs">{validacionFechasMsg}</Alert>
                ) : (
                  fechaInicio && fechaFin && tipoEvaluacion === 'segundo_semestre' && (
                    <Alert tone="success" className="mt-3 text-xs">Fechas dentro del rango permitido.</Alert>
                  )
                )}
                <div className="flex justify-end mt-3">
                  <button type="button" onClick={cancelar} className="edl-btn-outline">Cerrar</button>
                </div>
              </div>
            )}

            {tipoEvaluacion === 'parcial_eventual' && (
              <>
                <div>
                  <label className="edl-label">Motivo *</label>
                  <select value={motivoEvaluacion} onChange={e => setMotivoEvaluacion(e.target.value)} className="edl-input">
                    <option value="">Seleccione un motivo...</option>
                    {MOTIVOS_PARCIAL.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                {motivoEvaluacion === 'separacion_temporal_mas_30_dias' && (
                  <div>
                    <label className="edl-label">Razón de la separación *</label>
                    <select value={razonEvaluacion} onChange={e => setRazonEvaluacion(e.target.value)} className="edl-input">
                      <option value="">Seleccione una razón...</option>
                      {RAZONES_SEPARACION.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Checkbox "No es jefe inmediato" — CNSC video 12 */}
            <div className="edl-card bg-inst-gris">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noEsJefe}
                  onChange={e => { setNoEsJefe(e.target.checked); if (!e.target.checked) setMotivoNoJefe(''); }}
                  className="mt-1 w-4 h-4 accent-inst-azul"
                />
                <div>
                  <span className="text-sm font-medium text-inst-texto">¿Usted no es el jefe inmediato del evaluado?</span>
                  <p className="text-xs text-inst-texto-claro mt-1">
                    Marque esta opción si está evaluando en calidad de Comisión Evaluadora o por cambio de evaluador.
                  </p>
                </div>
              </label>
              {noEsJefe && (
                <div className="mt-3 pl-7">
                  <label className="edl-label">Motivo del cambio de evaluador *</label>
                  <select value={motivoNoJefe} onChange={e => setMotivoNoJefe(e.target.value)} className="edl-input">
                    <option value="">Seleccione un motivo...</option>
                    {MOTIVOS_NO_JEFE.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="edl-label">Ingrese las fechas de la evaluación *</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-inst-texto-claro">Fecha inicio</label>
                  <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="edl-input" />
                </div>
                <div>
                  <label className="text-xs text-inst-texto-claro">Fecha fin</label>
                  <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="edl-input" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={cancelar} className="edl-btn-outline">Cancelar</button>
              <button
                onClick={() => setEvaluacionIniciada(true)}
                disabled={
                  !tipoEvaluacion || !fechaInicio || !fechaFin ||
                  (tipoEvaluacion === 'parcial_eventual' && !motivoEvaluacion) ||
                  (tipoEvaluacion === 'parcial_eventual' && motivoEvaluacion === 'separacion_temporal_mas_30_dias' && !razonEvaluacion) ||
                  (noEsJefe && !motivoNoJefe)
                }
                className="edl-btn-primary disabled:opacity-50">
                Comenzar evaluación
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            <div className="edl-card border-l-4 border-l-inst-azul">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-inst-texto">{evaluacionSel.evaluado_nombre}</h3>
                  <p className="text-xs text-inst-texto-claro">{evaluacionSel.evaluado_cargo} — {evaluacionSel.evaluado_dependencia}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-inst-azul">
                  {TIPOS_EVALUACION.find(t => t.value === tipoEvaluacion)?.label || tipoEvaluacion}
                </span>
              </div>
            </div>

            {/* COMPROMISOS FUNCIONALES */}
            {funcionales.length > 0 && (
              <div className="edl-card">
                <h3 className="font-heading font-semibold text-inst-azul mb-3 flex items-center gap-2">
                  <span className="material-icons">task_alt</span>
                  Compromisos Funcionales (Peso total: {PESO_FUNCIONALES}%)
                </h3>
                <div className="overflow-x-auto">
                  <table className="edl-table">
                    <thead>
                      <tr>
                        <th>Compromiso</th>
                        <th className="w-20">Peso</th>
                        <th className="w-24">Puntaje</th>
                        <th className="w-24">Estado</th>
                        <th className="w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {funcionales.map(c => {
                        const est = ESTADO_COMPROMISO[c.estado] || ESTADO_COMPROMISO.pendiente;
                        return (
                          <tr key={c.id}>
                            <td className="text-sm">{c.descripcion}</td>
                            <td className="text-center text-sm">{c.peso}%</td>
                            <td className="text-center font-medium">{c.puntaje !== null ? c.puntaje : '—'}</td>
                            <td className="text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${est.bg} ${est.color}`}>{est.label}</span></td>
                            <td className="text-center">
                              <button onClick={() => abrirModalEvaluacion(c)} className="p-1 rounded hover:bg-inst-gris text-inst-azul" title="Calificar">
                                <span className="material-icons text-lg">edit</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COMPETENCIAS COMPORTAMENTALES */}
            {comportamentales.length > 0 && (
              <div className="edl-card">
                <h3 className="font-heading font-semibold text-inst-azul mb-3 flex items-center gap-2">
                  <span className="material-icons">psychology</span>
                  Competencias Comportamentales (Peso total: {PESO_COMPORTAMENTALES}%)
                </h3>
                <div className="space-y-3">
                  {comportamentales.map(c => {
                    const est = ESTADO_COMPROMISO[c.estado] || ESTADO_COMPROMISO.pendiente;
                    return (
                      <div key={c.id} className="border border-inst-borde rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-sm">{c.compromiso_competencia || c.descripcion}</span>
                            {c.decreto && <span className="text-xs text-inst-texto-claro ml-2">({c.decreto === '2539/2005' ? 'D.2539/2005' : 'D.815/2018'})</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {c.puntaje !== null && (
                              <span className="text-sm font-bold text-inst-azul">
                                {c.puntaje} ({escalaComportamental(c.puntaje)})
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${est.bg} ${est.color}`}>{est.label}</span>
                            <button onClick={() => abrirModalEvaluacion(c)} className="p-1 rounded hover:bg-inst-gris text-inst-azul" title="Calificar">
                              <span className="material-icons text-lg">edit</span>
                            </button>
                          </div>
                        </div>
                        {c.conductas && c.conductas.length > 0 && (
                          <div className="ml-4 space-y-2">
                            <p className="text-xs font-semibold text-inst-texto-claro uppercase tracking-wider">Conductas asociadas</p>
                            {c.conductas.map(cond => (
                              <div key={cond.id} className="flex items-center gap-2 text-sm pl-2 border-l-2 border-inst-azul-osc-light">
                                <span className="flex-1">{cond.descripcion}</span>
                                <Select
                                  value={conductasForm[cond.id] || ''}
                                  onChange={e => setConductasForm(prev => ({ ...prev, [cond.id]: e.target.value as ValoracionFrecuencia }))}
                                  placeholder="Evaluar"
                                  options={OPCIONES_FRECUENCIA.map(v => ({ value: v.value, label: v.label }))}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PREGUNTAS DE CIERRE */}
            <div className="edl-card border-l-4 border-l-inst-azul-osc">
              <h3 className="font-heading font-semibold text-inst-azul mb-4">Preguntas de cierre</h3>
              <div className="space-y-4">
                <div>
                  <label className="edl-label">¿El servidor cumplió con los compromisos concertados? *</label>
                  <div className="flex gap-3 mt-1">
                    {['si', 'no'].map(v => (
                      <label key={v} className={`px-4 py-2 rounded border cursor-pointer text-sm ${
                        cumplioCompromisos === v ? 'bg-inst-azul text-white border-inst-azul' : 'border-inst-borde hover:border-inst-azul'
                      }`}>
                        <input type="radio" name="cumplio" value={v} checked={cumplioCompromisos === v}
                          onChange={() => setCumplioCompromisos(v as 'si' | 'no')} className="sr-only" />
                        {v === 'si' ? 'Sí' : 'No'}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="edl-label">¿El servidor realizó algún aporte adicional relevante? *</label>
                  <div className="flex gap-3 mt-1">
                    {APORTE_OPTIONS.map(opt => (
                      <label key={opt.value} className={`px-4 py-2 rounded border cursor-pointer text-sm ${
                        aporteAdicional === opt.value ? 'bg-inst-azul text-white border-inst-azul' : 'border-inst-borde hover:border-inst-azul'
                      }`}>
                        <input type="radio" name="aporte" value={opt.value} checked={aporteAdicional === opt.value}
                          onChange={() => setAporteAdicional(opt.value as 'si' | 'no' | 'moderadamente')} className="sr-only" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
                {(aporteAdicional === 'si' || aporteAdicional === 'moderadamente') && (
                  <div>
                    <label className="edl-label">Descripción del aporte adicional *</label>
                    <textarea value={descAporte} onChange={e => setDescAporte(e.target.value)}
                      className="edl-input min-h-[60px]" placeholder="Describa el aporte adicional realizado por el servidor" />
                  </div>
                )}
                {aporteAdicional === 'si' && (
                  <div>
                    <label className="edl-label">
                      Justificación del aporte *
                      <span className={`text-xs ml-2 ${justificacion.length >= 40 ? 'text-green-600' : 'text-inst-texto-claro'}`}>
                        ({justificacion.length}/40 caracteres mínimo)
                      </span>
                    </label>
                    <textarea value={justificacion} onChange={e => setJustificacion(e.target.value)}
                      className="edl-input min-h-[80px]" placeholder="Justifique detalladamente el aporte adicional (mínimo 40 caracteres)" />
                    {justificacion.length > 0 && justificacion.length < 40 && (
                      <p className="text-xs text-inst-rojo mt-1">Faltan {40 - justificacion.length} caracteres para el mínimo requerido.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={cancelar} className="edl-btn-outline">Cancelar</button>
              <div className="flex gap-3">
                <button onClick={() => setConfirmModal({ type: 'guardar', msg: '¿Guardar evaluación sin finalizar?' })}
                  disabled={saving} className="edl-btn-outline disabled:opacity-50">Guardar</button>
                <button onClick={() => setConfirmModal({ type: 'revision', msg: '¿Solicitar revisión al evaluado?' })}
                  disabled={saving} className="edl-btn-outline disabled:opacity-50">Solicitar revisión</button>
                <button onClick={() => setConfirmModal({ type: 'finalizar', msg: '¿Finalizar evaluación? La calificación será definitiva.' })}
                  disabled={saving} className="edl-btn-primary disabled:opacity-50">Finalizar</button>
              </div>
            </div>
          </div>

          {/* RESUMEN LATERAL */}
          <div className="space-y-4">
            <div className="edl-card sticky top-4">
              <h3 className="font-heading font-semibold text-inst-azul mb-4 flex items-center gap-2">
                <span className="material-icons">calculate</span>
                Resumen
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-inst-texto-claro">Compromisos evaluados</span>
                  <span className="text-sm font-medium">{resumen.evaluados}/{resumen.total}</span>
                </div>
                <hr className="border-inst-borde" />
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-inst-texto-claro">Nota Funcionales ({PESO_FUNCIONALES}%)</span>
                    <span className="text-sm font-bold text-inst-texto">{resumen.notaFuncionales.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-2 mt-1">
                    <div className="bg-inst-azul rounded h-2 transition-all" style={{ width: `${Math.min(resumen.notaFuncionales, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-inst-texto-claro">
                      Nota Comportamentales ({PESO_COMPORTAMENTALES}%)
                      {resumen.notaComportamentalesRaw > 0 && (
                        <span className="ml-1 text-xs">({resumen.notaComportamentalesRaw.toFixed(1)}/15)</span>
                      )}
                    </span>
                    <span className="text-sm font-bold text-inst-texto">{resumen.notaComportamentalesPct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-2 mt-1">
                    <div className="bg-inst-azul-osc rounded h-2 transition-all" style={{ width: `${Math.min(resumen.notaComportamentalesPct, 100)}%` }} />
                  </div>
                </div>
                <hr className="border-inst-borde" />
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Nota Definitiva</span>
                    <span className="text-lg font-bold text-inst-azul-osc">{resumen.notaDefinitiva.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 py-2">
                    <span className="text-xs text-inst-texto-claro uppercase tracking-wide">Escala final</span>
                    <Badge tone={ESCALA_FINAL_TONE[resumen.escalaFinal.label] ?? 'neutral'} className="text-sm px-3 py-1">
                      {resumen.escalaFinal.label}
                    </Badge>
                  </div>
                  {ESCALA_FINAL_DESC[resumen.escalaFinal.label] && (
                    <p className="text-xs text-center text-inst-texto-claro">
                      {ESCALA_FINAL_DESC[resumen.escalaFinal.label]}
                    </p>
                  )}
                </div>
                {resumen.escalaFinal.label === 'No Satisfactorio' && (
                  <Alert tone="danger" className="text-xs">
                    El servidor debe suscribir compromisos de mejoramiento. Se puede generar calificación no satisfactoria según el Acuerdo 617/2018.
                  </Alert>
                )}
                {resumen.escalaFinal.label === 'Sobresaliente' && (
                  <Alert tone="success" className="text-xs">
                    Calificación Sobresaliente: el servidor accede a derechos de carrera, encargos y comisiones.
                  </Alert>
                )}

                {/* SECCIÓN DE CONSECUENCIAS DETALLADAS */}
                {resumen.evaluados === resumen.total && resumen.escalaFinal.label !== '-' && ESCALA_CONSECUENCIAS[resumen.escalaFinal.label] && (
                  <div className="pt-3 border-t border-inst-borde">
                    <h4 className="text-xs font-semibold text-inst-texto-claro uppercase tracking-wider mb-2">
                      {ESCALA_CONSECUENCIAS[resumen.escalaFinal.label].titulo}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-inst-texto">
                      {ESCALA_CONSECUENCIAS[resumen.escalaFinal.label].items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className={`material-icons text-sm flex-shrink-0 mt-0.5 ${
                            resumen.escalaFinal.label === 'Sobresaliente' ? 'text-green-600' :
                            resumen.escalaFinal.label === 'Satisfactorio' ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {resumen.escalaFinal.label === 'No Satisfactorio' ? 'remove_circle' : 'check_circle'}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-inst-borde text-center">
                  <div>
                    <p className="text-[10px] text-inst-texto-claro uppercase tracking-wide">Peso Func.</p>
                    <p className="text-sm font-bold text-inst-azul-osc">{PESO_FUNCIONALES}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-inst-texto-claro uppercase tracking-wide">Peso Comp.</p>
                    <p className="text-sm font-bold text-inst-azul-osc">{PESO_COMPORTAMENTALES}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-inst-texto-claro uppercase tracking-wide">Escala Comp.</p>
                    <p className="text-sm font-bold text-inst-texto">{resumen.escalaComportamental}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Calificar compromiso */}
      {modalCompromiso && (
        <Modal
          open={true}
          onClose={() => setModalCompromiso(null)}
          title={modalCompromiso.tipo === 'funcional'
            ? 'Calificar Compromiso Funcional'
            : 'Calificar Competencia Comportamental'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="edl-card bg-inst-gris">
              <p className="text-sm font-medium">{modalCompromiso.compromiso_competencia || modalCompromiso.descripcion}</p>
              {modalCompromiso.resultado_esperado && (
                <p className="text-xs text-inst-texto-claro mt-1">Resultado esperado: {modalCompromiso.resultado_esperado}</p>
              )}
              <p className="text-xs text-inst-texto-claro">Peso: {modalCompromiso.peso}%</p>
            </div>

            {/* FUNCIONAL: input 0-100 */}
            {modalCompromiso.tipo === 'funcional' && (
              <div>
                <label className="edl-label">Puntaje funcional (0 — 100)</label>
                <input type="number" min={0} max={100} value={calificacion}
                  onChange={e => setCalificacion(Number(e.target.value))} className="edl-input" />
                <input type="range" min={0} max={100} value={calificacion}
                  onChange={e => setCalificacion(Number(e.target.value))} className="w-full mt-1" />
                <p className="text-xs text-inst-texto-claro mt-1">
                  Porcentaje de cumplimiento del compromiso funcional.
                </p>
              </div>
            )}

            {/* COMPORTAMENTAL: conductas con escala de frecuencia */}
            {modalCompromiso.tipo === 'comportamental' && (
              <>
                {modalCompromiso.conductas && modalCompromiso.conductas.length > 0 ? (
                  <>
                    <div>
                      <label className="edl-label mb-2">Valoración de conductas</label>
                      <p className="text-xs text-inst-texto-claro mb-3">
                        Marque la frecuencia con la que el servidor demostró cada conducta durante el período evaluado.
                      </p>
                      <div className="space-y-2">
                        {modalCompromiso.conductas.map(cond => (
                          <div key={cond.id} className="border border-inst-borde rounded p-3">
                            <p className="text-sm mb-2 font-medium">{cond.descripcion}</p>
                            <div className="flex gap-2">
                              {OPCIONES_FRECUENCIA.map(vo => (
                                <button key={vo.value}
                                  onClick={() => setConductasForm(prev => ({ ...prev, [cond.id]: vo.value }))}
                                  className={`text-xs px-3 py-1.5 rounded border flex-1 transition-colors ${conductasForm[cond.id] === vo.value ? vo.color : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                  title={`${vo.label} (${vo.puntaje} pts)`}>
                                  {vo.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Alert tone="info" className="text-xs">
                      <strong>Puntaje calculado automáticamente:</strong> promedio de las frecuencias de las conductas (rango 4–15 según Decreto 815/2018).{' '}
                      <span className="font-bold">
                        Puntaje actual: {puntajeComportamentalCalculado?.toFixed(1) ?? '—'} / 15
                      </span>{' '}
                      ({puntajeComportamentalCalculado ? escalaComportamental(puntajeComportamentalCalculado) : '—'})
                    </Alert>
                  </>
                ) : (
                  <div>
                    <label className="edl-label">Puntaje comportamental (4 — 15)</label>
                    <input type="number" min={4} max={15} step={0.1} value={calificacion}
                      onChange={e => setCalificacion(Number(e.target.value))} className="edl-input" />
                    <input type="range" min={4} max={15} step={0.1} value={calificacion}
                      onChange={e => setCalificacion(Number(e.target.value))} className="w-full mt-1" />
                    <p className="text-xs text-inst-texto-claro mt-1">
                      Escala: Bajo 4-6, Aceptable 7-9, Alto 10-12, Muy Alto 13-15.
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="edl-label">Observaciones (opcional)</label>
              <textarea value={obsCompromiso} onChange={e => setObsCompromiso(e.target.value)}
                className="edl-input min-h-[60px]" placeholder="Observaciones sobre la calificación" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setModalCompromiso(null)}>Cancelar</Button>
              <Button variant="primary" onClick={guardarCalificacion} loading={guardandoCal}>
                Guardar calificación
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {confirmModal && (
        <Modal open={true} onClose={() => setConfirmModal(null)} size="sm">
          <div className="text-center py-2">
            <span className="material-icons text-5xl text-inst-azul-osc mb-3 block mx-auto">help_outline</span>
            <p className="text-sm text-inst-texto mb-5">{confirmModal.msg}</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setConfirmModal(null)}>No</Button>
              <Button
                variant="primary"
                loading={saving}
                onClick={() => {
                  if (confirmModal.type === 'guardar') guardarEvaluacion();
                  else if (confirmModal.type === 'revision') solicitarRevision();
                  else finalizarEvaluacion();
                }}
              >
                Sí
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}