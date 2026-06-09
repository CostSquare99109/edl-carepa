import { useEffect, useState, useMemo } from 'react';
import { api, type PaginatedData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

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
 evaluado: { label: 'Evaluado', color: 'text-green-600', bg: 'bg-green-50' },
 validado: { label: 'Validado', color: 'text-inst-azul', bg: 'bg-blue-50' },
};

const VALORACION_OPTIONS = [
 { value: 'nunca', label: 'Nunca', color: 'bg-red-100 text-red-700 border-red-300' },
 { value: 'algunas_veces', label: 'Algunas veces', color: 'bg-amber-100 text-amber-700 border-amber-300' },
 { value: 'frecuentemente', label: 'Frecuentemente', color: 'bg-blue-100 text-blue-700 border-blue-300' },
 { value: 'siempre', label: 'Siempre', color: 'bg-green-100 text-green-700 border-green-300' },
] as const;

const TIPOS_EVALUACION = [
 { value: 'parcial_eventual', label: 'Evaluacion Parcial Eventual' },
 { value: 'primer_semestre', label: 'Evaluacion 1er Semestre' },
 { value: 'segundo_semestre', label: 'Evaluacion 2do Semestre' },
 { value: 'extraordinaria', label: 'Calificacion Extraordinaria' },
] as const;

const MOTIVOS_PARCIAL = [
 { value: 'separacion_temporal', label: 'Separacion temporal del cargo' },
 { value: 'terminacion_contrato', label: 'Terminacion del contrato' },
 { value: 'traslado', label: 'Traslado' },
 { value: 'otro', label: 'Otro' },
] as const;

const RAZONES_SEPARACION = [
 { value: 'comision', label: 'Comision' },
 { value: 'encargo', label: 'Encargo' },
 { value: 'suspension', label: 'Suspension' },
 { value: 'licencia', label: 'Licencia' },
 { value: 'otro', label: 'Otro' },
] as const;

const APORTE_OPTIONS = [
 { value: 'si', label: 'Si' },
 { value: 'no', label: 'No' },
 { value: 'moderadamente', label: 'Moderadamente' },
] as const;

const PESO_FUNCIONALES = 85;
const PESO_COMPORTAMENTALES = 15;

function escalaComportamental(puntaje: number): string {
 if (puntaje >= 13) return 'Muy Alto';
 if (puntaje >= 10) return 'Alto';
 if (puntaje >= 7) return 'Aceptable';
 return 'Bajo';
}

function escalaFinal(puntaje: number): { label: string; color: string } {
 if (puntaje >= 90) return { label: 'Sobresaliente', color: 'text-green-700 bg-green-50' };
 if (puntaje > 65) return { label: 'Satisfactorio', color: 'text-blue-700 bg-blue-50' };
 return { label: 'No Satisfactorio', color: 'text-red-700 bg-red-50' };
}

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

 const [tipoEvaluacion, setTipoEvaluacion] = useState('');
 const [motivoEvaluacion, setMotivoEvaluacion] = useState('');
 const [razonEvaluacion, setRazonEvaluacion] = useState('');
 const [fechaInicio, setFechaInicio] = useState('');
 const [fechaFin, setFechaFin] = useState('');
 const [evaluacionIniciada, setEvaluacionIniciada] = useState(false);

 const [modalCompromiso, setModalCompromiso] = useState<Compromiso | null>(null);
 const [calificacion, setCalificacion] = useState<number>(50);
 const [conductasForm, setConductasForm] = useState<Record<number, string>>({});
 const [obsCompromiso, setObsCompromiso] = useState('');
 const [guardandoCal, setGuardandoCal] = useState(false);

 const [cumplioCompromisos, setCumplioCompromisos] = useState<'si' | 'no' | ''>('');
 const [aporteAdicional, setAporteAdicional] = useState<'si' | 'no' | 'moderadamente' | ''>('');
 const [descAporte, setDescAporte] = useState('');
 const [justificacion, setJustificacion] = useState('');

 const [saving, setSaving] = useState(false);
 const [confirmModal, setConfirmModal] = useState<{ type: 'guardar' | 'revision' | 'finalizar'; msg: string } | null>(null);

 useEffect(() => { cargarPeriodos(); }, []);

 async function cargarPeriodos() {
  try {
   const res = await api.get<PaginatedData<Periodo>>('/periodos?por_pagina=50');
   const activos = (res.data || []).filter(p => p.estado === 'en_evaluacion' || p.estado === 'activa' || p.estado === 'activo');
   setPeriodos(activos);
   if (activos.length > 0) setPeriodoId(activos[0].id);
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
   const res = await api.get<PaginatedData<EvaluacionAsignada>>(
    `/evaluaciones?evaluador=me&documento=${busquedaDoc.trim()}&por_pagina=10`
   );
   const encontrados = res.data || [];
   if (encontrados.length === 0) {
    setErrorBusqueda('No se encontro un evaluado con ese documento para el periodo seleccionado.');
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
  setCumplioCompromisos('');
  setAporteAdicional('');
  setDescAporte('');
  setJustificacion('');
  try {
   const res = await api.get<PaginatedData<Compromiso>>(
    `/compromisos?evaluacion_id=${ev.id}&por_pagina=50`
   );
   const comps = res.data || [];
   setCompromisos(comps.filter(c => c.estado === 'aprobado' || c.estado === 'cumplido' || c.estado === 'incumplido' || c.estado === 'en_progreso'));
  } catch { setCompromisos([]); }
 }

 function abrirModalEvaluacion(comp: Compromiso) {
  setModalCompromiso(comp);
  setCalificacion(comp.puntaje ?? 50);
  setObsCompromiso('');
  const initConductas: Record<number, string> = {};
  if (comp.conductas) {
   comp.conductas.forEach(c => { if (c.valoracion) initConductas[c.id] = c.valoracion; });
  }
  setConductasForm(initConductas);
 }

 async function guardarCalificacion() {
  if (!modalCompromiso || !evaluacionSel) return;
  if (calificacion < 0 || calificacion > 100) {
   alert('La calificacion debe estar entre 0 y 100');
   return;
  }
  if (modalCompromiso.tipo === 'comportamental') {
   const totalConductas = modalCompromiso.conductas?.length || 0;
   const respondidas = Object.keys(conductasForm).length;
   if (totalConductas > 0 && respondidas < totalConductas) {
    alert('Debe valorar todas las conductas antes de calificar.');
    return;
   }
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
   setCompromisos(prev => prev.map(c =>
    c.id === modalCompromiso.id ? { ...c, puntaje: calificacion, estado: 'evaluado' } : c
   ));
   setModalCompromiso(null);
  } catch (err: any) {
   alert(err.message || 'Error al calificar compromiso');
  } finally { setGuardandoCal(false); }
 }

 const funcionales = compromisos.filter(c => c.tipo === 'funcional');
 const comportamentales = compromisos.filter(c => c.tipo === 'comportamental');

 const resumen = useMemo(() => {
  const notaFuncionales = funcionales.reduce((acc, c) => acc + ((c.puntaje ?? 0) * c.peso) / 100, 0);
  const totalPesoFunc = funcionales.reduce((acc, c) => acc + c.peso, 0);
  const notaFuncPct = totalPesoFunc > 0 ? (notaFuncionales / totalPesoFunc) * 100 : 0;

  const notaComportRaw = comportamentales.reduce((acc, c) => acc + ((c.puntaje ?? 0) * c.peso) / 100, 0);
  const totalPesoComp = comportamentales.reduce((acc, c) => acc + c.peso, 0);
  const notaComport15 = totalPesoComp > 0 ? (notaComportRaw / totalPesoComp) * PESO_COMPORTAMENTALES : 0;
  const escalaComp = totalPesoComp > 0 ? escalaComportamental(notaComportRaw / totalPesoComp * 15 / 100 * 100 / 6.67) : '-';

  const notaDefinitiva = (notaFuncPct * PESO_FUNCIONALES / 100) + notaComport15;
  const esc = escalaFinal(notaDefinitiva);

  const evaluados = compromisos.filter(c => c.puntaje !== null).length;
  return {
   notaFuncionales: notaFuncPct,
   notaComportamentales: notaComport15,
   notaDefinitiva,
   escalaFinal: esc,
   escalaComportamental: escalaComp,
   evaluados,
   total: compromisos.length,
  };
 }, [compromisos]);

 function validarEvaluacion(): string | null {
  const sinEvaluar = compromisos.filter(c => c.puntaje === null);
  if (sinEvaluar.length > 0)
   return `Faltan por evaluar ${sinEvaluar.length} compromiso(s). Todos los compromisos deben estar calificados antes de guardar.`;
  if (!cumplioCompromisos)
   return 'Debe responder si el servidor cumplio con los compromisos concertados.';
  if (!aporteAdicional)
   return 'Debe responder si el servidor realizo algun aporte adicional relevante.';
  if ((aporteAdicional === 'si' || aporteAdicional === 'moderadamente') && !descAporte.trim())
   return 'Debe describir el aporte adicional realizado por el servidor.';
  if (justificacion.trim().length > 0 && justificacion.trim().length < 40)
   return 'La justificacion debe tener al menos 40 caracteres.';
  return null;
 }

 async function guardarEvaluacion() {
  const err = validarEvaluacion();
  if (err) { alert(err); return; }
  if (!evaluacionSel) return;
  setSaving(true);
  try {
   await api.put(`/evaluaciones/${evaluacionSel.id}/guardar`, {
    cumplio_compromisos: cumplioCompromisos === 'si',
    aporte_adicional: aporteAdicional === 'si',
    aporte_moderado: aporteAdicional === 'moderadamente',
    descripcion_aporte: descAporte,
    justificacion: justificacion,
    tipo_evaluacion: tipoEvaluacion,
    motivo: motivoEvaluacion,
    razon: razonEvaluacion,
    fecha_inicio_eval: fechaInicio,
    fecha_fin_eval: fechaFin,
   });
   alert('Evaluacion guardada exitosamente.');
   cargarEvaluaciones();
   setEvaluacionSel(null);
  } catch (err: any) {
   alert(err.message || 'Error al guardar evaluacion');
  } finally { setSaving(false); setConfirmModal(null); }
 }

 async function solicitarRevision() {
  if (!evaluacionSel) return;
  setSaving(true);
  try {
   await api.put(`/evaluaciones/${evaluacionSel.id}/solicitar-revision`, {});
   alert('Revision solicitada exitosamente.');
   cargarEvaluaciones();
   setEvaluacionSel(null);
  } catch (err: any) {
   alert(err.message || 'Error al solicitar revision');
  } finally { setSaving(false); setConfirmModal(null); }
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
    aporte_moderado: aporteAdicional === 'moderadamente',
    descripcion_aporte: descAporte,
    justificacion: justificacion,
    tipo_evaluacion: tipoEvaluacion,
    motivo: motivoEvaluacion,
    razon: razonEvaluacion,
    fecha_inicio_eval: fechaInicio,
    fecha_fin_eval: fechaFin,
   });
   alert('Evaluacion finalizada. La calificacion es definitiva.');
   cargarEvaluaciones();
   setEvaluacionSel(null);
  } catch (err: any) {
   alert(err.message || 'Error al finalizar evaluacion');
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
 }

 return (
  <div className="min-h-screen">
   <div className="mb-6">
    <div className="flex items-center gap-2 mb-1">
     <span className="material-icons text-inst-azul text-xl">rate_review</span>
     <h2 className="edl-section-title">Evaluar Desempeno</h2>
    </div>
    <p className="text-sm text-inst-texto-claro ml-7">
     Calificacion de compromisos funcionales y competencias comportamentales
    </p>
   </div>

   <div className="edl-card mb-6">
    <div className="flex flex-wrap items-end gap-4">
     <div className="flex-1 min-w-[200px]">
      <label className="edl-label">Periodo de evaluacion</label>
      <select value={periodoId} onChange={e => setPeriodoId(Number(e.target.value))} className="edl-input">
       <option value={0}>Seleccione un periodo...</option>
       {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
      </select>
     </div>
     <div className="flex-1 min-w-[280px]">
      <label className="edl-label">Buscar evaluado por documento</label>
      <div className="flex gap-2">
       <input type="text" value={busquedaDoc} onChange={e => setBusquedaDoc(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && buscarEvaluado()}
        className="edl-input flex-1" placeholder="Numero de documento..." />
       <button onClick={buscarEvaluado} disabled={buscando || !busquedaDoc.trim()}
        className="edl-btn-primary whitespace-nowrap disabled:opacity-50">
        {buscando ? 'Buscando...' : 'Buscar'}
       </button>
      </div>
      {errorBusqueda && <p className="text-xs text-inst-rojo mt-1">{errorBusqueda}</p>}
     </div>
    </div>
   </div>

   {!evaluacionSel ? (
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
      </div>
     ) : (
      <div className="space-y-3">
       {evaluaciones.map(ev => {
        const estadoInfo = ESTADO_COMPROMISO[ev.estado] || ESTADO_COMPROMISO.pendiente;
        return (
         <div key={ev.id} className="edl-card cursor-pointer hover:border-inst-azul/30 hover:shadow-md transition-all group"
          onClick={() => seleccionarEvaluacion(ev)}>
          <div className="flex items-center justify-between">
           <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
             <span className="material-icons text-lg text-inst-azul group-hover:text-inst-rojo transition-colors">person</span>
             <span className="font-heading font-bold text-inst-texto">{ev.evaluado_nombre}</span>
             <span className={`text-xs px-2 py-0.5 rounded-full ${estadoInfo.bg} ${estadoInfo.color}`}>{estadoInfo.label}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-inst-texto-claro ml-7">
             <span>Cargo: {ev.evaluado_cargo}</span>
             <span>Dep: {ev.evaluado_dependencia}</span>
             <span>CC: {ev.evaluado_documento}</span>
             <span>Evaluados: {ev.compromisos_evaluados}/{ev.compromisos_count}</span>
             {ev.puntaje_final !== null && (
              <span className={`font-bold ${ev.puntaje_final >= 80 ? 'text-green-600' : ev.puntaje_final >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
               Final: {ev.puntaje_final.toFixed(1)}%
              </span>
             )}
            </div>
           </div>
           <span className="material-icons text-inst-texto-claro group-hover:text-inst-azul">chevron_right</span>
          </div>
         </div>
        );
       })}
      </div>
     )}
    </div>
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
       <div><span className="text-inst-texto-claro">Vinculacion:</span> <span className="font-medium">{evaluacionSel.evaluado_vinculacion}</span></div>
      </div>
     </div>

     <div className="space-y-4">
      <div>
       <label className="edl-label">Tipo de evaluacion</label>
       <select value={tipoEvaluacion} onChange={e => setTipoEvaluacion(e.target.value)} className="edl-input">
        <option value="">Seleccione...</option>
        {TIPOS_EVALUACION.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
       </select>
      </div>

      {tipoEvaluacion === 'parcial_eventual' && (
       <>
        <div>
         <label className="edl-label">Motivo</label>
         <select value={motivoEvaluacion} onChange={e => setMotivoEvaluacion(e.target.value)} className="edl-input">
          <option value="">Seleccione un motivo</option>
          {MOTIVOS_PARCIAL.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
         </select>
        </div>
        {motivoEvaluacion === 'separacion_temporal' && (
         <div>
          <label className="edl-label">Razon</label>
          <select value={razonEvaluacion} onChange={e => setRazonEvaluacion(e.target.value)} className="edl-input">
           <option value="">Seleccione una razon</option>
           {RAZONES_SEPARACION.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
         </div>
        )}
       </>
      )}

      <div>
       <label className="edl-label">Ingrese las fechas de la evaluacion</label>
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
       <button onClick={() => setEvaluacionIniciada(true)}
        disabled={!tipoEvaluacion || !fechaInicio || !fechaFin}
        className="edl-btn-primary disabled:opacity-50">
        Comenzar evaluacion
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
         <p className="text-xs text-inst-texto-claro">{evaluacionSel.evaluado_cargo} - {evaluacionSel.evaluado_dependencia}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
         TIPOS_EVALUACION.find(t => t.value === tipoEvaluacion)?.label ? 'bg-blue-50 text-inst-azul' : 'bg-gray-50 text-gray-500'
        }`}>{TIPOS_EVALUACION.find(t => t.value === tipoEvaluacion)?.label || tipoEvaluacion}</span>
       </div>
      </div>

      {funcionales.length > 0 && (
       <div className="edl-card">
        <h3 className="font-heading font-semibold text-inst-azul mb-3 flex items-center gap-2">
         <span className="material-icons">task_alt</span>
         Compromisos Funcionales (Peso: {PESO_FUNCIONALES}%)
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
              <td className="text-center font-medium">{c.puntaje !== null ? c.puntaje : '-'}</td>
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

      {comportamentales.length > 0 && (
       <div className="edl-card">
        <h3 className="font-heading font-semibold text-inst-azul mb-3 flex items-center gap-2">
         <span className="material-icons">psychology</span>
         Competencias Comportamentales (Peso: {PESO_COMPORTAMENTALES}%)
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
              {c.puntaje !== null && <span className="text-sm font-medium">{c.puntaje}</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full ${est.bg} ${est.color}`}>{est.label}</span>
              <button onClick={() => abrirModalEvaluacion(c)} className="p-1 rounded hover:bg-inst-gris text-inst-azul">
               <span className="material-icons text-lg">edit</span>
              </button>
             </div>
            </div>
            {c.conductas && c.conductas.length > 0 && (
             <div className="ml-4 space-y-1">
              {c.conductas.map(cond => (
               <div key={cond.id} className="flex items-center gap-2 text-sm">
                <span className="text-inst-texto-claro flex-1">{cond.descripcion}</span>
                <div className="flex gap-1">
                 {VALORACION_OPTIONS.map(vo => (
                  <button key={vo.value}
                   onClick={() => setConductasForm(prev => ({ ...prev, [cond.id]: vo.value }))}
                   className={`text-xs px-1.5 py-0.5 rounded border ${conductasForm[cond.id] === vo.value ? vo.color : 'border-gray-200 text-gray-400'}`}>
                   {vo.label}
                  </button>
                 ))}
                </div>
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

      <div className="edl-card border-l-4 border-l-inst-verde">
       <h3 className="font-heading font-semibold text-inst-azul mb-4">Preguntas de cierre</h3>
       <div className="space-y-4">
        <div>
         <label className="edl-label">El servidor cumplio con los compromisos concertados?</label>
         <div className="flex gap-3 mt-1">
          {['si', 'no'].map(v => (
           <label key={v} className={`px-4 py-2 rounded border cursor-pointer text-sm ${
            cumplioCompromisos === v ? 'bg-inst-azul text-white border-inst-azul' : 'border-inst-borde hover:border-inst-azul'
           }`}>
            <input type="radio" name="cumplio" value={v} checked={cumplioCompromisos === v}
             onChange={() => setCumplioCompromisos(v as 'si' | 'no')} className="sr-only" />
            {v === 'si' ? 'Si' : 'No'}
           </label>
          ))}
         </div>
        </div>
        <div>
         <label className="edl-label">El servidor realizo algun aporte adicional relevante?</label>
         <div className="flex gap-3 mt-1">
          {APORTE_OPTIONS.map(opt => (
           <label key={opt.value} className={`px-4 py-2 rounded border cursor-pointer text-sm ${
            aporteAdicional === opt.value ? 'bg-inst-azul text-white border-inst-azul' : 'border-inst-borde hover:border-inst-azul'
           }`}>
            <input type="radio" name="aporte" value={opt.value} checked={aporteAdicional === opt.value}
             onChange={() => setAporteAdicional(opt.value as any)} className="sr-only" />
            {opt.label}
           </label>
          ))}
         </div>
        </div>
        {(aporteAdicional === 'si' || aporteAdicional === 'moderadamente') && (
         <div>
          <label className="edl-label">Descripcion del aporte adicional</label>
          <textarea value={descAporte} onChange={e => setDescAporte(e.target.value)}
           className="edl-input min-h-[60px]" placeholder="Describa el aporte adicional" />
         </div>
        )}
        <div>
         <label className="edl-label">Justificacion (opcional, minimo 40 caracteres si diligencia)</label>
         <textarea value={justificacion} onChange={e => setJustificacion(e.target.value)}
          className="edl-input min-h-[80px]" placeholder="Justificacion de la calificacion" />
         {justificacion.length > 0 && justificacion.length < 40 && (
          <p className="text-xs text-inst-rojo mt-1">Minimo 40 caracteres ({justificacion.length}/40)</p>
         )}
        </div>
       </div>
      </div>

      <div className="flex justify-between items-center">
       <button onClick={cancelar} className="edl-btn-outline">Cancelar</button>
       <div className="flex gap-3">
        <button onClick={() => setConfirmModal({ type: 'guardar', msg: 'Guardar evaluacion sin finalizar?' })}
         disabled={saving} className="edl-btn-outline disabled:opacity-50">Guardar</button>
        <button onClick={() => setConfirmModal({ type: 'revision', msg: 'Solicitar revision al evaluado?' })}
         disabled={saving} className="edl-btn-outline disabled:opacity-50">Solicitar revision</button>
        <button onClick={() => setConfirmModal({ type: 'finalizar', msg: 'Finalizar evaluacion? La calificacion sera definitiva.' })}
         disabled={saving} className="edl-btn-primary disabled:opacity-50">Finalizar</button>
       </div>
      </div>
     </div>

     <div className="space-y-4">
      <div className="edl-card sticky top-4">
       <h3 className="font-heading font-semibold text-inst-azul mb-4 flex items-center gap-2">
        <span className="material-icons">calculate</span>
        Resumen
       </h3>
       <div className="space-y-3">
        <div className="flex justify-between items-center">
         <span className="text-sm text-inst-texto-claro">Evaluados</span>
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
          <span className="text-sm text-inst-texto-claro">Nota Comportamentales ({PESO_COMPORTAMENTALES}%)</span>
          <span className="text-sm font-bold text-inst-texto">{resumen.notaComportamentales.toFixed(1)}%</span>
         </div>
         <div className="w-full bg-gray-100 rounded h-2 mt-1">
          <div className="bg-inst-verde rounded h-2 transition-all" style={{ width: `${Math.min(resumen.notaComportamentales / PESO_COMPORTAMENTALES * 100, 100)}%` }} />
         </div>
        </div>
        <hr className="border-inst-borde" />
        <div>
         <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Nota Definitiva</span>
          <span className="text-lg font-bold text-inst-azul">{resumen.notaDefinitiva.toFixed(1)}%</span>
         </div>
        </div>
        <div className={`text-center py-2 rounded font-bold text-sm ${resumen.escalaFinal.color}`}>
         {resumen.escalaFinal.label}
        </div>
        {resumen.escalaFinal.label === 'No Satisfactorio' && (
         <div className="text-xs text-inst-rojo bg-red-50 rounded p-2">
          De acuerdo con el Decreto 815 de 2018, el servidor debe suscribir compromisos de mejoramiento.
         </div>
        )}
       </div>
      </div>
     </div>
    </div>
   )}

   {modalCompromiso && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
     <div className="bg-white rounded-lg shadow-xl border border-inst-borde w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-inst-borde">
       <h3 className="edl-section-title text-base">
        {modalCompromiso.tipo === 'funcional' ? 'Calificar Compromiso Funcional' : 'Calificar Competencia Comportamental'}
       </h3>
       <button onClick={() => setModalCompromiso(null)} className="p-1 rounded hover:bg-inst-gris">
        <span className="material-icons text-xl text-inst-texto-claro">close</span>
       </button>
      </div>
      <div className="p-4 space-y-4">
       <div className="edl-card bg-inst-gris">
        <p className="text-sm font-medium">{modalCompromiso.compromiso_competencia || modalCompromiso.descripcion}</p>
        {modalCompromiso.resultado_esperado && (
         <p className="text-xs text-inst-texto-claro mt-1">Resultado esperado: {modalCompromiso.resultado_esperado}</p>
        )}
        <p className="text-xs text-inst-texto-claro">Peso: {modalCompromiso.peso}%</p>
       </div>

       {modalCompromiso.tipo === 'comportamental' && modalCompromiso.conductas && modalCompromiso.conductas.length > 0 && (
        <div>
         <label className="edl-label mb-2">Valoracion de conductas</label>
         <div className="space-y-2">
          {modalCompromiso.conductas.map(cond => (
           <div key={cond.id} className="border border-inst-borde rounded p-2">
            <p className="text-sm mb-2">{cond.descripcion}</p>
            <div className="flex gap-2">
             {VALORACION_OPTIONS.map(vo => (
              <button key={vo.value}
               onClick={() => setConductasForm(prev => ({ ...prev, [cond.id]: vo.value }))}
               className={`text-xs px-2 py-1 rounded border flex-1 ${conductasForm[cond.id] === vo.value ? vo.color : 'border-gray-200 text-gray-400'}`}>
               {vo.label}
              </button>
             ))}
            </div>
           </div>
          ))}
         </div>
        </div>
       )}

       <div>
        <label className="edl-label">Puntaje (0-100)</label>
        <input type="number" min={0} max={100} value={calificacion}
         onChange={e => setCalificacion(Number(e.target.value))} className="edl-input" />
        <input type="range" min={0} max={100} value={calificacion}
         onChange={e => setCalificacion(Number(e.target.value))} className="w-full mt-1" />
       </div>

       <div>
        <label className="edl-label">Observaciones (opcional)</label>
        <textarea value={obsCompromiso} onChange={e => setObsCompromiso(e.target.value)}
         className="edl-input min-h-[60px]" placeholder="Observaciones sobre la calificacion" />
       </div>

       <div className="flex justify-end gap-3">
        <button onClick={() => setModalCompromiso(null)} className="edl-btn-outline">Cancelar</button>
        <button onClick={guardarCalificacion} disabled={guardandoCal} className="edl-btn-primary disabled:opacity-50">
         {guardandoCal ? 'Guardando...' : 'Guardar calificacion'}
        </button>
       </div>
      </div>
     </div>
    </div>
   )}

   {confirmModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
     <div className="bg-white rounded-lg shadow-xl border border-inst-borde w-full max-w-sm mx-4 p-6 text-center">
      <span className="material-icons text-4xl text-inst-azul mb-3 block mx-auto">help_outline</span>
      <p className="text-sm text-inst-texto mb-4">{confirmModal.msg}</p>
      <div className="flex justify-center gap-3">
       <button onClick={() => setConfirmModal(null)} className="edl-btn-outline">No</button>
       <button onClick={() => {
        if (confirmModal.type === 'guardar') guardarEvaluacion();
        else if (confirmModal.type === 'revision') solicitarRevision();
        else finalizarEvaluacion();
       }} disabled={saving} className="edl-btn-primary disabled:opacity-50">
        {saving ? 'Procesando...' : 'Si'}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
