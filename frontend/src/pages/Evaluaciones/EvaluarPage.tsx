import { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input, Select, Alert, Badge, Modal, EmptyState } from '../../components/ui';
import VerEvaluaciones from './VerEvaluaciones';
import { toast } from 'sonner';

interface Periodo {
  id: number;
  nombre: string;
  anio: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
}

interface EvaluadoPeriodo {
  id: number;
  documento: string;
  nombre_completo: string;
  nivel: string;
  denominacion: string;
  codigo: string;
  grado: string;
  dependencia: string;
  evaluacion_id: number;
  evaluacion_estado: string | null;
  evaluacion_tipo: string | null;
  periodo_nombre: string;
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
  compromiso_competencia?: string;
  decreto?: string;
  conductas?: Conducta[];
}

interface Conducta {
  id: number;
  competencia_codigo: string;
  texto: string;
  orden: number;
  valoracion: string | null;
}

type ValoracionFrecuencia = 'nunca' | 'algunas_veces' | 'frecuentemente' | 'siempre';

const FRECUENCIA_PUNTAJE: Record<ValoracionFrecuencia, number> = {
  nunca: 4,
  algunas_veces: 7,
  frecuentemente: 10,
  siempre: 13,
};

const VALORACION_OPTIONS: { value: ValoracionFrecuencia; label: string }[] = [
  { value: 'nunca', label: 'Nunca' },
  { value: 'algunas_veces', label: 'Algunas veces' },
  { value: 'frecuentemente', label: 'Frecuentemente' },
  { value: 'siempre', label: 'Siempre' },
];

const IMPACTO_APORTA_OPTIONS = [
  { value: 'si', label: 'Sí' },
  { value: 'moderadamente', label: 'Moderadamente' },
  { value: 'no', label: 'No' },
] as const;

const IMPACTO_EXCEDE_OPTIONS = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
] as const;

// Motivos de Evaluacion parcial eventual (Acuerdo 617 de 2018, art. 6).
// Las claves coinciden con el ENUM motivo_parcial_eventual de la tabla evaluaciones.
const MOTIVOS_PARCIAL_EVENTUAL = [
  { value: 'cambio_evaluador', label: 'Cambio de evaluador' },
  { value: 'lapso_ultima_evaluacion', label: 'Lapso entre la última evaluación y el final del período' },
  { value: 'periodo_prueba_otro_empleo', label: 'Por período de prueba en otro empleo' },
  { value: 'separacion_temporal_mas_30_dias', label: 'Separación temporal del empleo por más de 30 días calendario' },
  { value: 'cambio_empleo_traslado', label: 'Cambio de empleo por traslado o reubicación' },
] as const;

// Causas definidas por el sistema para "separacion_temporal_mas_30_dias".
// Se muestran solo cuando el motivo seleccionado es la separacion temporal.
const JUSTIFICACIONES_SEPARACION = [
  { value: 'suspension', label: 'Por suspensión' },
  { value: 'encargo', label: 'Por asumir o finalizar encargo en las funciones de otro empleo' },
  { value: 'licencia', label: 'Por ocasión de licencias' },
  { value: 'comision', label: 'Con ocasión al inicio o finalización de comisiones' },
  { value: 'vacaciones', label: 'Por vacaciones' },
] as const;

const MAX_DIAS_EVALUADOS = 180;

function diasEntre(fechaInicio: string, fechaFin: string): number {
  if (!fechaInicio || !fechaFin) return 0;
  const a = new Date(fechaInicio + 'T00:00:00');
  const b = new Date(fechaFin + 'T00:00:00');
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  return diff >= 0 ? diff + 1 : 0;
}

const TIPOS_EVALUACION = [
  { value: 'parcial_eventual', label: 'Evaluación parcial eventual' },
  { value: 'parcial_primer_semestre', label: 'Evaluación 1 semestre' },
  { value: 'parcial_segundo_semestre', label: 'Evaluación 2 semestre' },
  { value: 'calificacion_extraordinaria', label: 'Calificación extraordinaria' },
] as const;

const PESO_FUNCIONALES = 85;
const PESO_COMPORTAMENTALES = 15;
const UMBRAL_SOBRESALIENTE = 90;
const UMBRAL_SATISFACTORIO = 65;
const MIN_CARACTERES_EXCEDE = 40;

function escalaFinal(puntaje: number): { label: string; color: string } {
  if (puntaje >= UMBRAL_SOBRESALIENTE) return { label: 'Sobresaliente', color: 'text-green-700 bg-green-50' };
  if (puntaje > UMBRAL_SATISFACTORIO) return { label: 'Satisfactorio', color: 'text-blue-700 bg-blue-50' };
  return { label: 'No Satisfactorio', color: 'text-red-700 bg-red-50' };
}

function escalaComportamental(puntaje: number): string {
  if (puntaje >= 13) return 'Muy Alto';
  if (puntaje >= 10) return 'Alto';
  if (puntaje >= 7) return 'Aceptable';
  return 'Bajo';
}

function getAnioInicioPeriodo(nombre?: string | null): number | null {
  if (!nombre) return null;
  const m = /^(\d{4})/.exec(nombre.trim());
  return m ? parseInt(m[1], 10) : null;
}

function validarFechas2doSemestre(fechaInicio: string, fechaFin: string, nombrePeriodo: string | null | undefined): string | null {
  const anio = getAnioInicioPeriodo(nombrePeriodo);
  if (!anio || !fechaInicio || !fechaFin) return null;
  const fechaMin = `${anio}-08-01`;
  const fechaMax = `${anio + 1}-01-31`;
  if (fechaInicio < fechaMin) return `La fecha de inicio debe ser >= ${fechaMin} (01-08-${anio}).`;
  if (fechaFin > fechaMax) return `La fecha de fin debe ser <= ${fechaMax} (31-01-${anio + 1}).`;
  if (fechaInicio > fechaFin) return 'La fecha de inicio no puede ser posterior a la fecha de fin.';
  return null;
}

export default function EvaluarPage() {
  const API_BASE = '/api/v1';
  const { usuario, rolActivo } = useAuth();

  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoId, setPeriodoId] = useState<number>(0);
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [evaluados, setEvaluados] = useState<EvaluadoPeriodo[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');

  const [selectedEvaluado, setSelectedEvaluado] = useState<EvaluadoPeriodo | null>(null);
  const [tipoEvaluacion, setTipoEvaluacion] = useState('');
  const [evaluacionIniciada, setEvaluacionIniciada] = useState(false);
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [noEsJefe, setNoEsJefe] = useState(false);
  const [motivoNoJefe, setMotivoNoJefe] = useState('');

  // --- Evaluacion parcial eventual (spec CNSC video 09; prompt.md) ---
  // Estado separado del flujo principal: muestra el panel inicial con la fecha
  // de la evaluacion y el tope de 180 dias. Solo al pulsar "Comenzar evaluacion"
  // se transiciona a la captura de compromisos (evaluacionIniciada=true).
  const [fechaEventual, setFechaEventual] = useState('');
  const [motivoParcialEventual, setMotivoParcialEventual] = useState('');
  const [justificacionSeparacion, setJustificacionSeparacion] = useState('');
  const [parcialEventualComenzada, setParcialEventualComenzada] = useState(false);

  const [calificacionesFunc, setCalificacionesFunc] = useState<Record<number, number>>({});

  const [conductasForm, setConductasForm] = useState<Record<number, ValoracionFrecuencia>>({});
  const [impactoAporta, setImpactoAporta] = useState<Record<number, string>>({});
  const [impactoExcede, setImpactoExcede] = useState<Record<number, string>>({});
  const [justificacionExcede, setJustificacionExcede] = useState<Record<number, string>>({});

  const [evaluandoComp, setEvaluandoComp] = useState<Compromiso | null>(null);
  const [saving, setSaving] = useState(false);
  const [showVerEvaluaciones, setShowVerEvaluaciones] = useState<EvaluadoPeriodo | null>(null);
  const [primerSemestreExiste, setPrimerSemestreExiste] = useState<boolean | null>(null);
  const [showConfirmarEvaluacion, setShowConfirmarEvaluacion] = useState(false);
  const [confirmData, setConfirmData] = useState<{ notaFunc: number; notaComp: number; escala: string } | null>(null);
  const [showInstrucciones, setShowInstrucciones] = useState(false);

  function abrirInstrucciones() {
    setShowInstrucciones(true);
  }

  function cerrarInstrucciones() {
    setShowInstrucciones(false);
  }

  useEffect(() => { cargarPeriodos(); }, []);

  useEffect(() => {
    if (tipoEvaluacion === 'parcial_segundo_semestre' && selectedEvaluado && periodoId > 0) {
      let cancelado = false;
      api.get<any>(`/evaluaciones/evaluado/${selectedEvaluado.id}/primer-semestre-existe?periodo_id=${periodoId}`)
        .then((res: any) => {
          if (cancelado) return;
          const data = res && typeof res === 'object' && 'data' in res ? res.data : res;
          setPrimerSemestreExiste(Boolean(data?.existe));
        })
        .catch(() => { if (!cancelado) setPrimerSemestreExiste(null); });
      return () => { cancelado = true; };
    } else {
      setPrimerSemestreExiste(null);
    }
  }, [tipoEvaluacion, selectedEvaluado, periodoId]);

  const MOTIVOS_NO_JEFE = [
    { value: 'retiro_empleado_responsable', label: 'Retiro del empleado responsable de evaluar' },
    { value: 'impedimento', label: 'Impedimento' },
    { value: 'recusacion', label: 'Recusación' },
  ] as const;

  async function cargarPeriodos() {
    try {
      const res = await api.get<any>('/periodos?por_pagina=50');
      const data = Array.isArray(res) ? res : (res.data || []);
      setPeriodos(data);
      if (data.length > 0) setPeriodoId(data[0].id);
    } catch { }
  }

  function getPeriodoSeleccionado(): Periodo | undefined {
    return periodos.find(p => p.id === periodoId);
  }

  async function buscarEvaluado() {
    if (!busquedaTexto.trim()) return;
    setBuscando(true);
    setErrorBusqueda('');
    setEvaluados([]);
    try {
      const res = await api.get<any>(`/evaluaciones/buscar-evaluado?periodo_id=${periodoId}&q=${encodeURIComponent(busquedaTexto.trim())}`);
      const rawData = Array.isArray(res) ? res : (res.data || []);
      const data = (rawData || []) as EvaluadoPeriodo[];
      if (data.length === 0) {
        setErrorBusqueda('No se encontraron evaluados con ese criterio en el período seleccionado.');
      } else {
        setEvaluados(data);
      }
    } catch (err: any) {
      setErrorBusqueda(err.message || 'Error en la búsqueda');
    } finally {
      setBuscando(false);
    }
  }

  async function seleccionarEvaluacion(ev: EvaluadoPeriodo) {
    setSelectedEvaluado(ev);
    setEvaluacionIniciada(false);
    setTipoEvaluacion('');
    setShowInstrucciones(true);
    setCompromisos([]);
    setCalificacionesFunc({});
    setConductasForm({});
    setImpactoAporta({});
    setImpactoExcede({});
    setJustificacionExcede({});
    setFechaInicio('');
    setFechaFin('');
    setNoEsJefe(false);

    if (ev.evaluacion_id && ev.evaluacion_id > 0) {
      try {
        const res = await api.get<any>(`/compromisos/evaluacion/${ev.evaluacion_id}`);
        const funcionales = ((res.funcionales || []) as Compromiso[]).filter(c =>
          ['aprobado', 'cumplido', 'incumplido', 'en_progreso'].includes(c.estado)
        );
        const comportamentales = ((res.comportamentales || []) as Compromiso[]).filter(c =>
          ['aprobado', 'cumplido', 'incumplido', 'en_progreso'].includes(c.estado)
        );
        const todos = [...funcionales, ...comportamentales];
        setCompromisos(todos);

        const initCalif: Record<number, number> = {};
        funcionales.forEach(c => {
          if (c.puntaje !== null) initCalif[c.id] = c.puntaje;
        });
        setCalificacionesFunc(initCalif);

        const initConductas: Record<number, ValoracionFrecuencia> = {};
        comportamentales.forEach(c => {
          if (c.conductas) {
            c.conductas.forEach(cond => {
              if (cond.valoracion && ['nunca', 'algunas_veces', 'frecuentemente', 'siempre'].includes(cond.valoracion)) {
                initConductas[cond.id] = cond.valoracion as ValoracionFrecuencia;
              }
            });
          }
        });
        setConductasForm(initConductas);
      } catch { }
    }
  }

  const funcionales = compromisos.filter(c => c.tipo === 'funcional');
  const comportamentales = compromisos.filter(c => c.tipo === 'comportamental');

  function calcularPuntajeComportamental(): number {
    const valores = Object.values(conductasForm);
    if (valores.length === 0) return 0;
    const suma = valores.reduce((acc, v) => acc + FRECUENCIA_PUNTAJE[v], 0);
    return Math.round((suma / valores.length) * 10) / 10;
  }

  function calcularNotaFuncional(): number {
    if (funcionales.length === 0) return 0;
    let sumaPonderada = 0;
    let sumaPesos = 0;
    funcionales.forEach(c => {
      const calif = calificacionesFunc[c.id];
      if (calif !== undefined && calif !== null) {
        sumaPonderada += calif * c.peso;
        sumaPesos += c.peso;
      }
    });
    return sumaPesos > 0 ? Math.round((sumaPonderada / sumaPesos) * 100) / 100 : 0;
  }

  function calcularNotaComportamental(): number {
    const puntaje = calcularPuntajeComportamental();
    if (puntaje <= 0) return 0;
    return Math.round(((puntaje - 4) / 11) * 100 * 100) / 100;
  }

  function calcularNotaDefinitiva(): number {
    const notaFunc = calcularNotaFuncional();
    const notaComp = calcularNotaComportamental();
    return Math.round((notaFunc * 0.85 + notaComp * 0.15) * 100) / 100;
  }

  function getEscalaResultado(nota: number): string {
    if (nota >= 90) return 'ALTO (Sobresaliente)';
    if (nota > 65) return 'MEDIO (Satisfactorio)';
    return 'BAJO (No Satisfactorio)';
  }

  function validarSegundoSemestre(): string | null {
    if (tipoEvaluacion !== 'parcial_segundo_semestre') return null;
    const periodo = getPeriodoSeleccionado();
    if (!periodo) return 'Debe seleccionar un período.';
    const match = periodo.nombre.match(/^(\d{4})/);
    if (!match) return null;
    const anio = parseInt(match[1]);
    const fechaMin = `${anio}-08-01`;
    const fechaMax = `${anio + 1}-01-31`;
    if (fechaInicio && fechaInicio < fechaMin) return `La fecha de inicio debe ser posterior o igual al 01-08-${anio} para evaluación 2 semestre.`;
    if (fechaFin && fechaFin > fechaMax) return `La fecha de fin debe ser anterior o igual al 31-01-${anio + 1} para evaluación 2 semestre.`;
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) return 'La fecha de inicio no puede ser posterior a la fecha de fin.';
    return null;
  }

  const errorFechas = validarSegundoSemestre();

  function getCompromisoEstadoIcon(comp: Compromiso): string {
    if (comp.puntaje !== null) return '✓';
    return '—';
  }

  function getCompromisoEstadoColor(comp: Compromiso): string {
    if (comp.puntaje !== null) return 'text-green-600';
    return 'text-gray-300';
  }

  function openConfirmarEvaluacion() {
    const notaFunc = calcularNotaFuncional();
    const notaComp = calcularNotaComportamental();
    const definitiva = calcularNotaDefinitiva();
    const escala = getEscalaResultado(definitiva);
    setConfirmData({ notaFunc, notaComp, escala });
    setShowConfirmarEvaluacion(true);
  }

  function closeConfirmarEvaluacion() {
    setShowConfirmarEvaluacion(false);
    setConfirmData(null);
  }

  async function guardarCalificacionFuncional(compId: number) {
    const puntaje = calificacionesFunc[compId];
    if (puntaje === undefined || puntaje < 0 || puntaje > 100) {
      toast.error('La calificación funcional debe estar entre 0 y 100.');
      return;
    }
    try {
      const comp = funcionales.find(c => c.id === compId);
      if (!comp) return;
      await api.put(`/compromisos/${compId}/calificar`, {
        puntaje,
        observaciones: '',
      });
      setCompromisos(prev => prev.map(c =>
        c.id === compId ? { ...c, puntaje, estado: puntaje >= 65 ? 'cumplido' : 'incumplido' } : c
      ));
      toast.success(`Compromiso funcional calificado (${puntaje} pts).`);
    } catch (err: any) {
      toast.error(err.message || 'Error al calificar compromiso funcional');
    }
  }

  async function guardarCalificacionComportamental() {
    if (comportamentales.length === 0) return;
    for (const comp of comportamentales) {
      if (comp.conductas && comp.conductas.length > 0) {
        const respondidas = comp.conductas.filter(c => conductasForm[c.id]).length;
        if (respondidas < comp.conductas.length) {
          toast.error(`Debe valorar todas las conductas de "${comp.compromiso_competencia || comp.descripcion}" antes de continuar.`);
          return;
        }
      }
    }
    const puntaje = calcularPuntajeComportamental();
    if (puntaje <= 0) {
      toast.error('Debe valorar las conductas de los compromisos comportamentales.');
      return;
    }
    try {
      for (const comp of comportamentales) {
        const conductasArray = (comp.conductas || []).map(c => ({
          conducta_id: c.id,
          valoracion: conductasForm[c.id] || null,
          impacto_aporta_compromisos: impactoAporta[comp.id] || null,
          impacto_excede_estipulado: impactoExcede[comp.id] || null,
          justificacion_excede: justificacionExcede[comp.id] || null,
        }));
        await api.put(`/compromisos/${comp.id}/calificar`, {
          puntaje,
          observaciones: '',
          conductas: conductasArray,
          impacto_aporta_compromisos: impactoAporta[comp.id] || null,
          impacto_excede_estipulado: impactoExcede[comp.id] || null,
          justificacion_excede: justificacionExcede[comp.id] || null,
        });
      }
      setCompromisos(prev => prev.map(c =>
        c.tipo === 'comportamental' ? { ...c, puntaje, estado: 'cumplido' } : c
      ));
      toast.success('Compromisos comportamentales calificados.');
    } catch (err: any) {
      toast.error(err.message || 'Error al calificar compromisos comportamentales');
    }
  }

  async function calificarCompromisoComportamental(compId: number) {
    const comp = comportamentales.find(c => c.id === compId);
    if (!comp) return;
    if (comp.conductas && comp.conductas.length > 0) {
      const respondidas = comp.conductas.filter(c => conductasForm[c.id]).length;
      if (respondidas < comp.conductas.length) {
        toast.error(`Debe valorar todas las conductas de "${comp.compromiso_competencia || comp.descripcion}" antes de continuar.`);
        return;
      }
    }
    setSaving(true);
    try {
      const conductasArray = (comp.conductas || []).map(c => ({
        conducta_id: c.id,
        valoracion: conductasForm[c.id] || null,
        impacto_aporta_compromisos: impactoAporta[comp.id] || null,
        impacto_excede_estipulado: impactoExcede[comp.id] || null,
        justificacion_excede: justificacionExcede[comp.id] || null,
      }));
      await api.put(`/compromisos/${compId}/calificar`, {
        puntaje: 0,
        observaciones: '',
        conductas: conductasArray,
        impacto_aporta_compromisos: impactoAporta[comp.id] || null,
        impacto_excede_estipulado: impactoExcede[comp.id] || null,
        justificacion_excede: justificacionExcede[comp.id] || null,
      });
      setCompromisos(prev => prev.map(c =>
        c.id === compId ? { ...c, puntaje: 0, estado: 'cumplido' } : c
      ));
      setEvaluandoComp(null);
      toast.success(`Compromiso "${comp.compromiso_competencia || comp.descripcion}" calificado.`);
    } catch (err: any) {
      toast.error(err.message || 'Error al calificar compromiso comportamental');
    }
    setSaving(false);
  }

  async function guardarEvaluacion() {
    if (!selectedEvaluado) return;

    const sinCalificar = compromisos.filter(c => c.puntaje === null);
    if (compromisos.length > 0 && sinCalificar.length > 0) {
      toast.error(`Faltan por calificar ${sinCalificar.length} compromiso(s). Todos deben estar calificados.`);
      return;
    }

    const errorFechasVal = validarSegundoSemestre();
    if (errorFechasVal) {
      toast.error(errorFechasVal);
      return;
    }

    if (tipoEvaluacion === 'parcial_segundo_semestre') {
      if (!fechaInicio || !fechaFin) {
        toast.error('Debe ingresar las fechas de inicio y fin para la evaluación 2 semestre.');
        return;
      }
    }

    if (tipoEvaluacion === 'parcial_eventual' && !motivoParcialEventual) {
      toast.error('Debe seleccionar el motivo de la evaluación parcial eventual.');
      return;
    }

    if (noEsJefe && !motivoNoJefe) {
      toast.error('Debe seleccionar el motivo por el cual no es el jefe inmediato.');
      return;
    }

    // Evaluacion parcial eventual: bloquear si supera 180 dias (validacion cliente;
    // el backend revalidara en persistencia).
    if (tipoEvaluacion === 'parcial_eventual' && fechaInicio && fechaFin) {
      const dias = diasEntre(fechaInicio, fechaFin);
      if (dias > MAX_DIAS_EVALUADOS) {
        toast.error(`Los dias evaluados (${dias}) no pueden superar ${MAX_DIAS_EVALUADOS}.`);
        return;
      }
      if (motivoParcialEventual === 'separacion_temporal_mas_30_dias' && !justificacionSeparacion) {
        toast.error('Debe seleccionar la justificacion de la separacion temporal.');
        return;
      }
    }

    for (const comp of comportamentales) {
      if (impactoExcede[comp.id] === 'si') {
        const justif = justificacionExcede[comp.id] || '';
        if (justif.trim().length < MIN_CARACTERES_EXCEDE) {
          toast.error(`La justificación de "excede lo estipulado" para "${comp.compromiso_competencia || comp.descripcion}" debe tener mínimo ${MIN_CARACTERES_EXCEDE} caracteres.`);
          return;
        }
      }
    }

    openConfirmarEvaluacion();
  }

  async function confirmarGuardarEvaluacion() {
    if (!selectedEvaluado || !confirmData) return;

    setSaving(true);
    try {
      let evalId = selectedEvaluado.evaluacion_id;

      if (!evalId || evalId === 0) {
        const created = await api.post<any>('/evaluaciones', {
          tipo: tipoEvaluacion,
          periodo_id: periodoId,
          evaluado_id: selectedEvaluado.id,
          fecha_inicio: fechaInicio || null,
          fecha_fin: fechaFin || null,
          motivo_parcial_eventual: tipoEvaluacion === 'parcial_eventual' ? motivoParcialEventual : null,
        });
        evalId = created.id;
        setSelectedEvaluado(prev => prev ? { ...prev, evaluacion_id: evalId } : prev);
      }

      await api.put(`/evaluaciones/${evalId}/guardar`, {
        tipo_evaluacion: tipoEvaluacion,
        fecha_inicio_eval: fechaInicio || null,
        fecha_fin_eval: fechaFin || null,
        evaluador_no_jefe: noEsJefe ? 1 : 0,
        motivo_no_jefe: noEsJefe ? motivoNoJefe : null,
        motivo: tipoEvaluacion === 'parcial_eventual' ? motivoParcialEventual : null,
        razon: tipoEvaluacion === 'parcial_eventual' && motivoParcialEventual === 'separacion_temporal_mas_30_dias'
          ? justificacionSeparacion
          : null,
      });

      toast.success('Evaluación guardada correctamente.');
      closeConfirmarEvaluacion();
      setSelectedEvaluado(null);
      setEvaluacionIniciada(false);
      setCompromisos([]);
      await buscarEvaluado();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar evaluación');
    } finally {
      setSaving(false);
    }
  }

  function cerrar() {
    if (evaluacionIniciada && compromisos.some(c => c.puntaje !== null)) {
      const confirmar = window.confirm('Hay cambios sin guardar. ¿Está seguro de cerrar?');
      if (!confirmar) return;
    }
    setSelectedEvaluado(null);
    setEvaluacionIniciada(false);
    setCompromisos([]);
    setCalificacionesFunc({});
    setConductasForm({});
    setImpactoAporta({});
    setImpactoExcede({});
    setJustificacionExcede({});
    setTipoEvaluacion('');
    setFechaInicio('');
    setFechaFin('');
    setNoEsJefe(false);
    setFechaEventual('');
    setMotivoParcialEventual('');
    setJustificacionSeparacion('');
    setParcialEventualComenzada(false);
    setMotivoNoJefe('');
  }

  const puntajeComportamental = useMemo(() => calcularPuntajeComportamental(), [conductasForm]);

  const columnas = ['Documento', 'Evaluado', 'Nivel', 'Denominación', 'Código', 'Grado', 'Validación', 'Opciones'];

  return (
    <div className="min-h-screen space-y-6">
      {/* Título principal: Periodo */}
      <div className="animate-fadeIn">
        <h2 className="edl-section-title">Periodo</h2>
      </div>

      {/* Mostrar VerEvaluaciones como modal cuando se activa */}
      {showVerEvaluaciones && (
        <Modal
          open
          onClose={() => setShowVerEvaluaciones(null)}
          title="Evaluaciones del servidor"
          size="xl"
        >
          <VerEvaluaciones
            evaluacionIdParam={showVerEvaluaciones.evaluacion_id}
            evaluadoIdParam={showVerEvaluaciones.id}
          />
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setShowVerEvaluaciones(null)}>
              Cerrar
            </Button>
          </div>
        </Modal>
      )}

      {!selectedEvaluado ? (
        <>
          {/* Paso 1: Selección de período y búsqueda */}
          <Card>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[250px]">
                <Select
                  label="Seleccione un periodo"
                  value={periodoId || ''}
                  onChange={e => setPeriodoId(Number(e.target.value))}
                  placeholder="Seleccione un periodo..."
                  options={periodos.map(p => ({ value: String(p.id), label: p.nombre }))}
                />
              </div>
              <div className="flex-1 min-w-[300px]">
                <Input
                  label="Buscar evaluado por documento o nombre"
                  type="text"
                  value={busquedaTexto}
                  onChange={e => setBusquedaTexto(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && buscarEvaluado()}
                  placeholder="Número de documento o nombre..."
                />
              </div>
              <Button
                variant="primary"
                onClick={buscarEvaluado}
                loading={buscando}
                disabled={!busquedaTexto.trim()}
              >
                Buscar evaluado
              </Button>
            </div>
            {errorBusqueda ? (
              <Alert tone="danger" className="mt-2">{errorBusqueda}</Alert>
            ) : null}
            {evaluados.length > 0 && (
              <div className="mt-2 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { const ev = evaluados[0]; if (ev) seleccionarEvaluacion(ev); }}>
                  Evaluar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { const ev = evaluados[0]; if (ev) setShowVerEvaluaciones(ev); }}>
                  Ver evaluaciones
                </Button>
              </div>
            )}
          </Card>

          {/* Paso 2: Tabla de evaluados del periodo */}
          <Card>
            <h3 className="font-heading font-semibold text-inst-azul-osc mb-4">Evaluados del periodo</h3>
            {loading ? (
              <div className="text-center py-8 text-inst-texto-claro">Cargando...</div>
            ) : evaluados.length === 0 ? (
              <EmptyState
                icon={<span className="material-icons text-3xl">people</span>}
                title="Sin evaluados"
                description="Realice una búsqueda para ver los evaluados del periodo."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="edl-table w-full">
                  <thead>
                    <tr>
                      {columnas.map(col => (
                        <th key={col} className="text-left text-xs font-semibold text-inst-texto-claro uppercase tracking-wider py-3 px-3">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evaluados.map(ev => (
                      <tr key={ev.id} className="hover:bg-inst-gris-med transition-colors">
                        <td className="py-3 px-3 text-sm font-mono">{ev.documento}</td>
                        <td className="py-3 px-3 text-sm font-medium">{ev.nombre_completo}</td>
                        <td className="py-3 px-3 text-sm">{ev.nivel}</td>
                        <td className="py-3 px-3 text-sm">{ev.denominacion}</td>
                        <td className="py-3 px-3 text-sm font-mono">{ev.codigo}</td>
                        <td className="py-3 px-3 text-sm">{ev.grado}</td>
                        <td className="py-3 px-3 text-center text-sm">
                          {ev.evaluacion_id && ev.evaluacion_id > 0 ? (
                            <Badge tone={
                              ev.evaluacion_estado === 'cerrada' || ev.evaluacion_estado === 'aprobada_comision'
                                ? 'success'
                                : ev.evaluacion_estado === 'rechazada_comision'
                                  ? 'danger'
                                  : ev.evaluacion_estado === 'calificada' || ev.evaluacion_estado === 'en_proceso'
                                    ? 'info'
                                    : 'warning'
                            }>
                              {ev.evaluacion_estado === 'calificada' || ev.evaluacion_estado === 'en_proceso'
                                ? 'Calificado'
                                : ev.evaluacion_estado === 'cerrada' || ev.evaluacion_estado === 'aprobada_comision'
                                  ? 'Cerrado'
                                  : ev.evaluacion_estado === 'rechazada_comision'
                                    ? 'Rechazado'
                                    : ev.evaluacion_estado === 'pendiente'
                                      ? 'Pendiente'
                                      : 'Sin calificar'}
                            </Badge>
                          ) : (
                            <span className="text-inst-texto-claro text-xs">Sin calificar</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => seleccionarEvaluacion(ev)}
                            >
                              Evaluar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowVerEvaluaciones(ev)}
                            >
                              Ver evaluaciones
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Paso 3: Panel de evaluación */
        <div className="space-y-6">
          <Card className="border-l-4 border-l-inst-azul-osc">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-inst-texto">{selectedEvaluado.nombre_completo}</h3>
                <p className="text-xs text-inst-texto-claro">
                  Documento: {selectedEvaluado.documento} — {selectedEvaluado.denominacion} — Nivel: {selectedEvaluado.nivel}
                </p>
              </div>
            </div>
          </Card>

          {/* Tipo de evaluación */}
          <Card>
            <div className="space-y-4">
              <div>
                <label className="edl-label">Tipo de evaluación</label>
                <select
                  value={tipoEvaluacion}
                  onChange={e => setTipoEvaluacion(e.target.value)}
                  className="edl-input"
                >
                  <option value="">Seleccione un tipo de evaluación...</option>
                  {TIPOS_EVALUACION.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Flujo Evaluación parcial eventual (prompt.md): paso a paso */}
              {tipoEvaluacion === 'parcial_eventual' && (
                <div className="bg-white border border-inst-borde rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 text-inst-azul-osc font-semibold">
                    <span className="material-icons text-inst-azul">rate_review</span>
                    Evaluar a {selectedEvaluado?.nombre_completo ?? ''}
                  </div>

                  <div>
                    <label className="edl-label">Tipo de evaluación</label>
                    <select className="edl-input" disabled value="parcial_eventual">
                      <option value="parcial_eventual">Evaluación parcial eventual</option>
                    </select>
                  </div>

                  {/* Paso 1: Select Motivo — visible solo cuando se escoge parcial_eventual */}
                  <div>
                    <label className="edl-label">Seleccione el motivo *</label>
                    <select
                      value={motivoParcialEventual}
                      onChange={e => setMotivoParcialEventual(e.target.value)}
                      className="edl-input"
                    >
                      <option value="">-- Seleccione --</option>
                      {MOTIVOS_PARCIAL_EVENTUAL.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Paso 2: Select Razón — solo si motivo = separación temporal */}
                  {motivoParcialEventual === 'separacion_temporal_mas_30_dias' && (
                    <div>
                      <label className="edl-label">Seleccione la razón *</label>
                      <select
                        value={justificacionSeparacion}
                        onChange={e => setJustificacionSeparacion(e.target.value)}
                        className="edl-input"
                      >
                        <option value="">-- Seleccione --</option>
                        {JUSTIFICACIONES_SEPARACION.map(j => (
                          <option key={j.value} value={j.value}>{j.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Paso 3: Fechas + botón — solo después de motivo (y razón si aplica) */}
                  {motivoParcialEventual && (motivoParcialEventual !== 'separacion_temporal_mas_30_dias' || justificacionSeparacion) && (
                    <>
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-inst-borde">
                        <div>
                          <label className="edl-label">Fecha inicio periodo a evaluar *</label>
                          <input
                            type="date"
                            value={fechaInicio}
                            onChange={e => setFechaInicio(e.target.value)}
                            className="edl-input"
                          />
                        </div>
                        <div>
                          <label className="edl-label">Fecha fin periodo a evaluar *</label>
                          <input
                            type="date"
                            value={fechaFin}
                            onChange={e => setFechaFin(e.target.value)}
                            className="edl-input"
                          />
                        </div>
                      </div>

                      {fechaInicio && fechaFin && (() => {
                        const dias = diasEntre(fechaInicio, fechaFin);
                        if (dias > MAX_DIAS_EVALUADOS) {
                          return (
                            <Alert tone="danger">
                              Los días evaluados ({dias}) superan el máximo permitido de {MAX_DIAS_EVALUADOS} (Acuerdo 617 de 2018, art. 6).
                            </Alert>
                          );
                        }
                        return null;
                      })()}

                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          disabled={!fechaInicio || !fechaFin || (() => {
                            const dias = diasEntre(fechaInicio, fechaFin);
                            return dias <= 0 || dias > MAX_DIAS_EVALUADOS;
                          })()}
                          onClick={() => {
                            setEvaluacionIniciada(true);
                            setParcialEventualComenzada(true);
                          }}
                        >
                          Comenzar evaluación
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Panel específico para Evaluación 2 semestre */}
              {tipoEvaluacion === 'parcial_segundo_semestre' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <span className="material-icons text-amber-600">info</span>
                    Evaluación 2 Semestre
                  </div>
                  <ul className="text-sm text-amber-700 space-y-1 ml-7 list-disc">
                    <li>Debe tener una evaluación para el primer semestre.</li>
                    <li>La fecha de evaluación debe estar entre <strong>01-08-{getPeriodoSeleccionado()?.nombre.split('-')[0] || 'Año'}</strong> y <strong>31-01-{getPeriodoSeleccionado() ? String(Number(getPeriodoSeleccionado()?.nombre.split('-')[0]) + 1) : 'Año+1'}</strong>.</li>
                  </ul>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="text-xs text-inst-texto-claro">Fecha inicio</label>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={e => setFechaInicio(e.target.value)}
                        className="edl-input"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-inst-texto-claro">Fecha fin</label>
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={e => setFechaFin(e.target.value)}
                        className="edl-input"
                      />
                    </div>
                  </div>
                  {errorFechas && (
                    <Alert tone="warning" className="text-xs">{errorFechas}</Alert>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={cerrar}>Cerrar</Button>
              </div>
            </div>
          </Card>

          {tipoEvaluacion && (tipoEvaluacion !== 'parcial_eventual' || parcialEventualComenzada) && (
            <>
              {(funcionales.length > 0 || comportamentales.length > 0) ? (
                <>
                  {/* Compromisos funcionales */}
                  {funcionales.length > 0 && (
                    <Card>
                      <h3 className="font-heading font-semibold text-inst-azul mb-3 flex items-center gap-2">
                        <span className="material-icons text-inst-azul">task_alt</span>
                        Compromisos funcionales
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="edl-table w-full">
                          <thead>
                            <tr>
                              <th className="text-left">Compromiso</th>
                              <th className="text-center w-16">Peso</th>
                              <th className="text-center w-24">Calificación</th>
                              <th className="text-center w-16">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {funcionales.map(c => (
                              <tr key={c.id}>
                                <td className="text-sm">{c.descripcion}</td>
                                <td className="text-center text-sm">{c.peso}%</td>
                                <td className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={calificacionesFunc[c.id] ?? ''}
                                      onChange={e => setCalificacionesFunc(prev => ({ ...prev, [c.id]: Number(e.target.value) }))}
                                      className="edl-input w-20 text-center text-sm"
                                      placeholder="0-100"
                                    />
                                    <button
                                      onClick={() => guardarCalificacionFuncional(c.id)}
                                      className="text-xs bg-inst-azul text-white px-2 py-1 rounded hover:bg-inst-azul-osc transition-colors"
                                      title="Guardar calificación"
                                    >
                                      <span className="material-icons text-sm">check</span>
                                    </button>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <span className={`text-lg font-bold ${getCompromisoEstadoColor(c)}`}>
                                    {getCompromisoEstadoIcon(c)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {/* Compromisos comportamentales */}
                  {comportamentales.length > 0 && (
                    <Card>
                      <h3 className="font-heading font-semibold text-inst-azul mb-3 flex items-center gap-2">
                        <span className="material-icons text-inst-azul">psychology</span>
                        Compromisos comportamentales
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="edl-table w-full">
                          <thead>
                            <tr>
                              <th className="text-left">Compromiso</th>
                              <th className="text-center w-24">Evaluar</th>
                              <th className="text-center w-24">Calificado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comportamentales.map(comp => (
                              <tr key={comp.id}>
                                <td className="text-sm">
                                  {comp.compromiso_competencia || comp.descripcion}
                                  {comp.decreto && <span className="text-xs text-inst-texto-claro ml-1">(Decreto {comp.decreto})</span>}
                                </td>
                                <td className="text-center">
                                  <Button
                                    size="sm"
                                    variant={comp.puntaje !== null ? 'outline' : 'primary'}
                                    onClick={() => setEvaluandoComp(comp)}
                                  >
                                    {comp.puntaje !== null ? 'Ver' : 'Evaluar'}
                                  </Button>
                                </td>
                                <td className="text-center">
                                  {comp.puntaje !== null ? (
                                    <Badge tone="success">Calificado</Badge>
                                  ) : (
                                    <span className="text-inst-texto-claro text-sm">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {/* Jefe inmediato */}
                  <Card>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="no-es-jefe"
                        checked={noEsJefe}
                        onChange={e => { setNoEsJefe(e.target.checked); if (!e.target.checked) setMotivoNoJefe(''); }}
                        className="mt-1 w-4 h-4 accent-inst-azul"
                      />
                      <div>
                        <label htmlFor="no-es-jefe" className="text-sm font-medium text-inst-texto cursor-pointer">
                          ¿Es el jefe inmediato?
                        </label>
                        <p className="text-xs text-inst-texto-claro mt-0.5">
                          Seleccione si NO es el jefe inmediato del evaluado
                        </p>
                      </div>
                    </div>
                    {noEsJefe && (
                      <div className="mt-3 pl-7">
                        <label className="edl-label">Motivo del cambio de evaluador *</label>
                        <Select
                          value={motivoNoJefe}
                          onChange={e => setMotivoNoJefe(e.target.value)}
                          placeholder="Seleccione un motivo..."
                          options={MOTIVOS_NO_JEFE.map(m => ({ value: m.value, label: m.label }))}
                        />
                      </div>
                    )}
                  </Card>

                  {/* Botones finales */}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={cerrar}>
                      Cerrar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={guardarEvaluacion}
                      loading={saving}
                      disabled={
                        !tipoEvaluacion ||
                        ['aprobada_comision', 'cerrada'].includes(
                          String(selectedEvaluado.evaluacion_estado || '').toLowerCase()
                        )
                      }
                      title={
                        ['aprobada_comision', 'cerrada'].includes(
                          String(selectedEvaluado.evaluacion_estado || '').toLowerCase()
                        )
                          ? 'La evaluación está en firme y no puede modificarse'
                          : undefined
                      }
                    >
                      Guardar evaluación
                    </Button>
                  </div>
                </>
              ) : (
                <Card>
                  <div className="flex items-center justify-center gap-3 py-8 text-inst-texto-claro">
                    <span className="material-icons text-3xl">info</span>
                    <p className="text-sm">
                      Este evaluado no tiene compromisos funcionales ni comportamentales asignados
                    </p>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Modal para evaluar compromiso comportamental */}
          {evaluandoComp && (
            <Modal
              open
              onClose={() => setEvaluandoComp(null)}
              title={`Evaluar: ${evaluandoComp.compromiso_competencia || evaluandoComp.descripcion}`}
              size="lg"
            >
              <div className="space-y-4">
                {evaluandoComp.conductas && evaluandoComp.conductas.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-inst-texto-claro uppercase tracking-wider mb-2">Conductas asociadas</p>
                    {evaluandoComp.conductas.map(cond => (
                      <div key={cond.id} className="flex items-center gap-2 text-sm py-2 pl-2 border-l-2 border-inst-azul-osc-light mb-2">
                        <span className="flex-1">{cond.texto}</span>
                        <select
                          value={conductasForm[cond.id] || ''}
                          onChange={e => setConductasForm(prev => ({ ...prev, [cond.id]: e.target.value as ValoracionFrecuencia }))}
                          className="edl-input text-xs py-1 px-2 w-36"
                        >
                          <option value="">Evaluaciones</option>
                          {VALORACION_OPTIONS.map(v => (
                            <option key={v.value} value={v.value}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-1">¿Estas conductas han aportado al logro de los compromisos laborales acordados?</p>
                  <select
                    value={impactoAporta[evaluandoComp.id] || ''}
                    onChange={e => setImpactoAporta(prev => ({ ...prev, [evaluandoComp.id]: e.target.value }))}
                    className="edl-input text-sm w-48"
                  >
                    <option value="">Seleccione...</option>
                    <option value="si">Sí</option>
                    <option value="moderadamente">Moderadamente</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">¿Estas conductas le han permitido al empleado aportar más de lo que tenía estipulado en los compromisos laborales acordados?</p>
                  <select
                    value={impactoExcede[evaluandoComp.id] || ''}
                    onChange={e => {
                      setImpactoExcede(prev => ({ ...prev, [evaluandoComp.id]: e.target.value }));
                      if (e.target.value !== 'si') {
                        setJustificacionExcede(prev => ({ ...prev, [evaluandoComp.id]: '' }));
                      }
                    }}
                    className="edl-input text-sm w-48"
                  >
                    <option value="">Seleccione...</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {impactoExcede[evaluandoComp.id] === 'si' && (
                  <div>
                    <label className="text-sm font-medium">
                      Ingrese la explicación del porqué excede
                      <span className={`text-xs ml-2 ${(justificacionExcede[evaluandoComp.id] || '').length >= 40 ? 'text-green-600' : 'text-amber-600'}`}>
                        ({(justificacionExcede[evaluandoComp.id] || '').length}/40 caracteres mínimo)
                      </span>
                    </label>
                    <textarea
                      value={justificacionExcede[evaluandoComp.id] || ''}
                      onChange={e => setJustificacionExcede(prev => ({ ...prev, [evaluandoComp.id]: e.target.value }))}
                      className="edl-input min-h-[80px] mt-1"
                      placeholder="Ingrese la explicación del porqué excede"
                    />
                    {justificacionExcede[evaluandoComp.id] && justificacionExcede[evaluandoComp.id].length < 40 && (
                      <p className="text-xs text-inst-rojo mt-1">Mínimo 40 caracteres. Faltan {40 - (justificacionExcede[evaluandoComp.id] || '').length}.</p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-inst-borde">
                  <Button variant="outline" onClick={() => setEvaluandoComp(null)}>Cancelar</Button>
                  <Button
                    variant="primary"
                    onClick={() => calificarCompromisoComportamental(evaluandoComp.id)}
                    loading={saving}
                  >
                    Calificar
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* Modal de confirmación de evaluación (spec section 6) */}
      {showConfirmarEvaluacion && confirmData && (
        <Modal
          open
          onClose={closeConfirmarEvaluacion}
          title="Confirmar evaluación"
          size="lg"
        >
          <Card className="border-l-4 border-l-inst-azul-osc mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icons text-inst-azul text-2xl">rate_review</span>
              <h3 className="font-heading font-bold text-inst-texto">
                {TIPOS_EVALUACION.find(t => t.value === tipoEvaluacion)?.label || tipoEvaluacion}
              </h3>
            </div>
            <p className="text-sm text-inst-texto mb-4">
              ¿Está seguro de terminar la evaluación de <strong>{selectedEvaluado?.nombre_completo}</strong>?
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-inst-gris-med rounded-lg">
                <p className="text-xs text-inst-texto-claro uppercase tracking-wide">Funcionales (85%)</p>
                <p className="text-2xl font-bold text-inst-azul-osc">{confirmData.notaFunc.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-inst-gris-med rounded-lg">
                <p className="text-xs text-inst-texto-claro uppercase tracking-wide">Comportamentales (15%)</p>
                <p className="text-2xl font-bold text-inst-azul-osc">{confirmData.notaComp.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-inst-gris-med rounded-lg">
                <p className="text-xs text-inst-texto-claro uppercase tracking-wide">Definitiva</p>
                <p className="text-2xl font-bold text-inst-texto">{calcularNotaDefinitiva().toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Badge tone={confirmData.escala.includes('ALTO') ? 'success' : confirmData.escala.includes('MEDIO') ? 'info' : 'danger'}>
                Escala: {confirmData.escala}
              </Badge>
            </div>
          </Card>
          <div className="flex justify-end gap-3 pt-4 border-t border-inst-borde">
            <Button variant="outline" onClick={closeConfirmarEvaluacion}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={confirmarGuardarEvaluacion}
              loading={saving}
            >
              Guardar evaluación
            </Button>
          </div>
        </Modal>
      )}

      {showInstrucciones && (
        <Modal
          open
          onClose={cerrarInstrucciones}
          title="Instrucciones del proceso de evaluación"
          size="lg"
        >
          <div className="space-y-4 text-sm">
            <Alert tone="info" className="text-xs">
              Por favor lea atentamente estas instrucciones antes de iniciar la calificación de los
              compromisos. Acuerdo 617 de 2018, CNSC.
            </Alert>

            <section>
              <h4 className="font-semibold text-inst-azul-osc mb-1">1. Compromisos funcionales</h4>
              <p>
                Califique cada compromiso con una nota entre <strong>0 y 100</strong> según el grado de
                cumplimiento observado. El peso porcentual de cada compromiso pondera automáticamente
                la nota final.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-inst-azul-osc mb-1">2. Compromisos comportamentales</h4>
              <p className="mb-2">
                Por cada conducta asociada debe seleccionar la frecuencia con la que se presenta en
                el ejercicio del empleo:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>Nunca</strong></li>
                <li><strong>Algunas veces</strong></li>
                <li><strong>Frecuentemente</strong></li>
                <li><strong>Siempre</strong></li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-inst-azul-osc mb-1">3. Aporte a los compromisos</h4>
              <p>
                Para cada competencia, responda si las conductas asociadas han favorecido el logro de
                los compromisos laborales. Escala: <strong>Sí</strong>, <strong>Moderadamente</strong> o
                <strong> No</strong>.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-inst-azul-osc mb-1">4. Aporte superior al estipulado</h4>
              <p>
                Indique si las conductas le han permitido al empleado aportar más de lo estipulado.
                Si responde <strong>Sí</strong>, debe ingresar una explicación con mínimo{' '}
                <strong>40 caracteres</strong>. Si responde <strong>No</strong>, puede guardar sin
                justificación.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-inst-azul-osc mb-1">5. Cambio de evaluador</h4>
              <p>
                Al final del formulario marque la casilla si quien realiza la evaluación no es el jefe
                inmediato del evaluado e indique el motivo entre{' '}
                <strong>Retiro del empleado responsable</strong>, <strong>Impedimento</strong> o
                <strong> Recusación</strong>.
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-inst-azul-osc mb-1">6. Guardar evaluación</h4>
              <p>
                Recuerde calificar cada componente antes de dar clic en{' '}
                <strong>Guardar evaluación</strong>; el sistema mostrará un mensaje de confirmación.
              </p>
            </section>

            {selectedEvaluado && (
              <div className="bg-inst-gris-med rounded p-3 text-xs text-inst-texto-claro">
                <p><strong>Evaluado:</strong> {selectedEvaluado.nombre_completo}</p>
                <p><strong>Documento:</strong> {selectedEvaluado.documento}</p>
                <p><strong>Periodo:</strong> {getPeriodoSeleccionado()?.nombre || '—'}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-inst-borde mt-4">
            <Button variant="outline" onClick={cerrar}>Cerrar evaluado</Button>
            <Button variant="primary" onClick={cerrarInstrucciones}>
              Entendido, iniciar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
