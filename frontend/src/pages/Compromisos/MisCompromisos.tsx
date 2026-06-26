import { useEffect, useState } from 'react';
import { api, type PaginatedData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Compromiso {
 id: number;
 concertacion_id: number;
 evaluacion_id?: number;
 tipo: string;
 descripcion: string;
 resultado_esperado: string | null;
 medio_verificacion: string | null;
 observaciones_evaluado: string | null;
 plazo: string | null;
 peso: number;
 estado: string;
 evaluador_nombre?: string;
 observaciones_evaluador: string | null;
 creado_en: string;
 competencia_nombre?: string;
}

interface Evaluacion {
 id: number;
 tipo: string;
 estado: string;
 evaluador_id: number;
 evaluador_nombre: string;
 periodo_nombre: string;
 concertacion_id?: number | null;
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
 pendiente_aprobacion: { label: 'Pendiente de su aceptación', color: 'bg-amber-100 text-amber-800 border-amber-300' },
 propuesto: { label: 'Propuesto', color: 'bg-yellow-100 text-yellow-800' },
 aprobado: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
 aceptado_evaluado: { label: 'Aceptado', color: 'bg-green-200 text-green-900' },
 rechazado_evaluado: { label: 'Rechazado', color: 'bg-red-200 text-red-900' },
 devuelto: { label: 'Devuelto', color: 'bg-red-100 text-red-800' },
 en_progreso: { label: 'En progreso', color: 'bg-blue-100 text-blue-800' },
 cumplido: { label: 'Cumplido', color: 'bg-green-200 text-green-900' },
 incumplido: { label: 'Incumplido', color: 'bg-red-200 text-red-900' },
 vencido: { label: 'Vencido', color: 'bg-orange-100 text-orange-800' },
};

const TIPO_LABELS: Record<string, { label: string; icon: string }> = {
 funcional: { label: 'Compromiso Funcional', icon: 'task_alt' },
 comportamental: { label: 'Competencia Comportamental', icon: 'psychology' },
};

interface PackageGrupo {
 evaluacionId: number;
 evaluacion: Evaluacion | null;
 compromisos: Compromiso[];
}

export default function MisCompromisos() {
 const { usuario } = useAuth();
 const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
 const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [mensaje, setMensaje] = useState('');

 // Aceptar/rechazar
 const [rechazandoId, setRechazandoId] = useState<number | null>(null);
 const [obsRechazar, setObsRechazar] = useState('');

 // Paquetes expandidos (ojo)
 const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

// Proponer compromiso
 const [showForm, setShowForm] = useState(false);
 const [evaluacionId, setEvaluacionId] = useState<number>(0);
 const [tipo, setTipo] = useState('funcional');
 const [descripcion, setDescripcion] = useState('');
 const [resultadoEsperado, setResultadoEsperado] = useState('');
 const [medioVerificacion, setMedioVerificacion] = useState('');
 const [observaciones, setObservaciones] = useState('');
 const [plazo, setPlazo] = useState('');

 useEffect(() => {
 cargarDatos();
 }, []);

 async function cargarDatos() {
 setLoading(true);
 try {
 const [compRes, evalRes] = await Promise.all([
 api.get<PaginatedData<Compromiso>>('/compromisos?responsable_id=' + usuario?.id + '&por_pagina=100'),
 api.get<PaginatedData<Evaluacion>>('/evaluaciones?evaluado_id=' + usuario?.id + '&por_pagina=50'),
 ]);
 setCompromisos(compRes.data || []);
 setEvaluaciones(evalRes.data || []);
 } catch (err) {
 console.error('Error cargando datos:', err);
 } finally {
 setLoading(false);
 }
 }

 // Mapear concertacion_id → evaluacion_id desde evaluaciones
 const concertToEval = new Map<number, number>();
 for (const ev of evaluaciones) {
 if (ev.concertacion_id) concertToEval.set(ev.concertacion_id, ev.id);
 }

 // Agrupar compromisos por evaluacion via concertacion_id
 const paquetes: PackageGrupo[] = [];
 const evalMap = new Map(evaluaciones.map(e => [e.id, e]));
 const agrupados = new Map<number, Compromiso[]>();
 for (const c of compromisos) {
 const eid = concertToEval.get(c.concertacion_id) || c.evaluacion_id || 0;
 if (!eid) continue;
 if (!agrupados.has(eid)) agrupados.set(eid, []);
 agrupados.get(eid)!.push(c);
 }
 for (const [eid, comps] of agrupados) {
 paquetes.push({ evaluacionId: eid, evaluacion: evalMap.get(eid) || null, compromisos: comps });
 }

 function toggleExpandir(eid: number) {
 setExpandidos(prev => {
 const next = new Set(prev);
 if (next.has(eid)) next.delete(eid); else next.add(eid);
 return next;
 });
 }

 async function aceptarConcertacion(evaluacionId: number) {
 setSaving(true);
 setMensaje('');
 try {
 await api.put(`/evaluaciones/${evaluacionId}/aceptar-concertacion`);
 setMensaje('Concertación aceptada exitosamente.');
 cargarDatos();
 } catch (err: any) {
 setMensaje(err.message || 'Error al aceptar');
 } finally {
 setSaving(false);
 }
 }

 async function rechazarConcertacion(evaluacionId: number) {
 if (!obsRechazar.trim()) {
 setMensaje('Debe indicar el motivo del rechazo');
 return;
 }
 setSaving(true);
 setMensaje('');
 try {
 await api.put(`/evaluaciones/${evaluacionId}/rechazar-concertacion`, {
 observaciones_evaluado: obsRechazar.trim(),
 });
 setRechazandoId(null);
 setObsRechazar('');
 setMensaje('Concertación rechazada.');
 cargarDatos();
 } catch (err: any) {
 setMensaje(err.message || 'Error al rechazar');
 } finally {
 setSaving(false);
 }
 }

 async function enviarCompromiso() {
 if (!evaluacionId || !descripcion.trim()) return;
 setSaving(true);
 try {
 const evaluacion = evaluaciones.find(e => e.id === evaluacionId);
 await api.post('/compromisos/enviar', {
 evaluacion_id: evaluacionId,
 tipo,
 descripcion: descripcion.trim(),
 resultado_esperado: resultadoEsperado.trim() || null,
 medio_verificacion: medioVerificacion.trim() || null,
 observaciones_evaluado: observaciones.trim() || null,
 plazo: plazo || null,
 evaluador_id: evaluacion?.evaluador_id,
 });
 setShowForm(false);
 resetForm();
 cargarDatos();
 } catch (err: any) {
 alert(err.message || 'Error al proponer compromiso');
 } finally {
 setSaving(false);
 }
 }

 function resetForm() {
 setDescripcion('');
 setResultadoEsperado('');
 setMedioVerificacion('');
 setObservaciones('');
 setPlazo('');
 setEvaluacionId(0);
 setTipo('funcional');
 }

 function tienePendientes(comps: Compromiso[]) {
 return comps.some(c => c.estado === 'pendiente_aprobacion');
 }

 return (
 <div>
 <div className="flex items-center justify-between mb-6">
 <h2 className="edl-section-title">Mis Compromisos y Competencias</h2>
 <button
 onClick={() => setShowForm(!showForm)}
 className="edl-btn-primary flex items-center gap-2"
 >
 <span className="material-icons text-lg">add</span>
 Proponer Compromiso
 </button>
 </div>

 {/* Mensaje */}
 {mensaje && (
 <div className={`edl-card mb-4 border-l-4 ${mensaje.includes('exitosamente') || mensaje.includes('aceptada') ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
 <p className="text-sm font-medium">{mensaje}</p>
 </div>
 )}

 {loading ? (
 <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
 ) : paquetes.length === 0 ? (
 <div className="edl-card text-center py-8 text-inst-texto-claro">
 No tiene compromisos registrados.
 </div>
 ) : (
 <div className="space-y-4">
 {paquetes.map(pkg => {
 const ev = pkg.evaluacion;
 const pendiente = tienePendientes(pkg.compromisos);
 const expandido = expandidos.has(pkg.evaluacionId);
 return (
 <div key={pkg.evaluacionId} className={`edl-card ${pendiente ? 'border-l-4 border-amber-500 bg-amber-50' : ''}`}>
 {/* Header del paquete */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3 flex-1">
 <button
 onClick={() => toggleExpandir(pkg.evaluacionId)}
 className="p-1.5 rounded-full hover:bg-inst-gris transition-colors"
 title={expandido ? 'Ocultar compromisos' : 'Ver compromisos'}
 >
 <span className="material-icons text-inst-azul">{expandido ? 'visibility_off' : 'visibility'}</span>
 </button>
 <div className="flex-1">
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="font-heading font-bold text-inst-azul text-sm">
 {ev?.periodo_nombre || `Evaluación #${pkg.evaluacionId}`}
 </h3>
 <span className="text-xs text-inst-texto-claro">
 ({pkg.compromisos.length} compromisos)
 </span>
 {pendiente && (
 <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
 Pendiente de aceptación
 </span>
 )}
 </div>
 {ev && (
 <p className="text-xs text-inst-texto-claro">
 Evaluador: {ev.evaluador_nombre} · {ev.tipo === 'parcial_primer_semestre' ? '1er Semestre' : ev.tipo === 'parcial_segundo_semestre' ? '2do Semestre' : ev.tipo}
 </p>
 )}
 </div>
 </div>
 </div>

 {/* Compromisos expandidos */}
 {expandido && (
 <div className="mt-4 space-y-2 border-t border-inst-borde pt-4">
 {pkg.compromisos.map(c => {
 const tipoInfo = TIPO_LABELS[c.tipo] || { label: c.tipo, icon: 'chevron_right' };
 const estadoInfo = ESTADO_LABELS[c.estado] || { label: c.estado, color: 'bg-gray-200 text-gray-700' };
 return (
 <div key={c.id} className="flex items-start gap-2 p-3 bg-white rounded border">
 <span className="material-icons text-sm text-inst-azul mt-0.5">{tipoInfo.icon}</span>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-0.5">
 <span className="text-xs text-inst-texto-claro uppercase font-medium">{tipoInfo.label}</span>
 <span className={`text-xs px-1.5 py-0.5 rounded-full ${estadoInfo.color}`}>{estadoInfo.label}</span>
 </div>
 <p className="text-sm text-inst-texto">{c.descripcion || c.competencia_nombre}</p>
 {c.peso > 0 && <span className="text-xs text-inst-azul font-semibold">Peso: {c.peso}%</span>}
 {c.observaciones_evaluador && (
 <div className="mt-1 p-2 bg-red-50 rounded text-xs text-red-700">
 Observaciones: {c.observaciones_evaluador}
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Botones aceptar/rechazar */}
 {pendiente && (
 <div className="mt-4 border-t border-inst-borde pt-4">
 {rechazandoId === pkg.evaluacionId ? (
 <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
 <h4 className="font-heading font-bold text-red-700 text-sm">Rechazar Concertación</h4>
 <p className="text-xs text-red-600">
 Si rechaza, el evaluador podrá ajustar los compromisos y reenviarlos.
 </p>
 <div>
 <label className="edl-label">Motivo del rechazo (obligatorio)</label>
 <textarea
 value={obsRechazar}
 onChange={e => setObsRechazar(e.target.value)}
 className="edl-input min-h-[60px]"
 placeholder="Explique por qué rechaza..."
 />
 </div>
 <div className="flex gap-3">
 <button
 onClick={() => rechazarConcertacion(pkg.evaluacionId)}
 disabled={saving || !obsRechazar.trim()}
 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-1 text-sm disabled:opacity-50"
 >
 <span className="material-icons text-sm">block</span>
 {saving ? 'Rechazando...' : 'Confirmar Rechazo'}
 </button>
 <button
 onClick={() => { setRechazandoId(null); setObsRechazar(''); }}
 className="edl-btn-secondary"
 >
 Cancelar
 </button>
 </div>
 </div>
 ) : (
 <div className="flex gap-3">
 <button
 onClick={() => aceptarConcertacion(pkg.evaluacionId)}
 disabled={saving}
 className="edl-btn-primary flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700"
 >
 <span className="material-icons text-lg">check_circle</span>
 {saving ? 'Aceptando...' : 'Aceptar Concertación'}
 </button>
 <button
 onClick={() => setRechazandoId(pkg.evaluacionId)}
 className="edl-btn-secondary text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-2"
 >
 <span className="material-icons text-lg">cancel</span>
 Rechazar
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}

 {/* Formulario proponer compromiso */}
 {showForm && (
 <div className="edl-card mb-6 mt-6">
 <h3 className="font-heading font-bold text-inst-azul mb-1">Proponer Compromiso</h3>
 <p className="text-xs text-inst-texto-claro mb-4">
 Acuerdo 6176 de 2018 — Concertación de compromisos funcionales y competencias comportamentales
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="edl-label">Evaluación</label>
 <select value={evaluacionId} onChange={e => setEvaluacionId(Number(e.target.value))} className="edl-input">
 <option value={0}>Seleccione...</option>
 {evaluaciones.map(ev => (
 <option key={ev.id} value={ev.id}>#{ev.id} - {ev.periodo_nombre} ({ev.tipo})</option>
 ))}
 </select>
 </div>
 <div>
 <label className="edl-label">Tipo</label>
 <select value={tipo} onChange={e => setTipo(e.target.value)} className="edl-input">
 <option value="funcional">Compromiso Funcional</option>
 <option value="comportamental">Competencia Comportamental</option>
 </select>
 </div>
 <div className="md:col-span-2">
 <label className="edl-label">Descripción</label>
 <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="edl-input min-h-[80px]" placeholder="Describa el compromiso..." />
 </div>
 <div>
 <label className="edl-label">Resultado esperado</label>
 <input type="text" value={resultadoEsperado} onChange={e => setResultadoEsperado(e.target.value)} className="edl-input" placeholder="Qué se espera lograr" />
 </div>
 <div>
 <label className="edl-label">Medio de verificación</label>
 <input type="text" value={medioVerificacion} onChange={e => setMedioVerificacion(e.target.value)} className="edl-input" placeholder="Cómo se verificará" />
 </div>
 <div>
 <label className="edl-label">Plazo</label>
 <input type="date" value={plazo} onChange={e => setPlazo(e.target.value)} className="edl-input" />
 </div>
 <div>
 <label className="edl-label">Observaciones</label>
 <input type="text" value={observaciones} onChange={e => setObservaciones(e.target.value)} className="edl-input" placeholder="Observaciones" />
 </div>
 </div>
 <div className="flex gap-3 mt-4">
 <button onClick={enviarCompromiso} disabled={saving || !evaluacionId || !descripcion.trim()} className="edl-btn-primary">
 {saving ? 'Enviando...' : 'Proponer'}
 </button>
 <button onClick={() => { setShowForm(false); resetForm(); }} className="edl-btn-secondary">Cancelar</button>
 </div>
 </div>
 )}
 </div>
);
}
