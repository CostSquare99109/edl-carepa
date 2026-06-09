import { useEffect, useState } from 'react';
import { api, type PaginatedData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Compromiso {
 id: number;
 evaluacion_id: number;
 tipo: string;
 descripcion: string;
 resultado_esperado: string | null;
 medio_verificacion: string | null;
 observaciones_evaluado: string | null;
 plazo: string | null;
 peso: number;
 estado: string;
 evaluador_nombre: string;
 observaciones_evaluador: string | null;
 creado_en: string;
}

interface Evaluacion {
 id: number;
 tipo: string;
 estado: string;
 evaluador_id: number;
 evaluador_nombre: string;
 periodo_nombre: string;
}

interface Notificacion {
 id: number;
 tipo: string;
 titulo: string;
 mensaje: string;
 evaluacion_id: number;
 leida: number;
 creado_en: string;
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
 pendiente_evaluado: { label: 'Pendiente de su aceptación', color: 'bg-amber-100 text-amber-800 border-amber-300' },
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

export default function MisCompromisos() {
 const { usuario } = useAuth();
 const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
 const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
 const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [saving, setSaving] = useState(false);
 const [filtroTipo, setFiltroTipo] = useState('todos');

 // Aceptar/rechazar concertacion
 const [concertacionPendiente, setConcertacionPendiente] = useState<number | null>(null);
 const [obsAceptar, setObsAceptar] = useState('');
 const [obsRechazar, setObsRechazar] = useState('');
 const [showRechazar, setShowRechazar] = useState(false);
 const [mensaje, setMensaje] = useState('');

 // Formulario
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
 const [compRes, evalRes, notifRes] = await Promise.all([
 api.get<PaginatedData<Compromiso>>('/compromisos?responsable_id=' + usuario?.id + '&por_pagina=50'),
 api.get<PaginatedData<Evaluacion>>('/evaluaciones?evaluado_id=' + usuario?.id + '&por_pagina=50'),
 api.get<any>('/notificaciones?por_pagina=20').catch(() => ({ data: [] })),
 ]);
 setCompromisos(compRes.data || []);
 setEvaluaciones(evalRes.data || []);
 const notifs = Array.isArray(notifRes) ? notifRes : (notifRes?.data || []);
 setNotificaciones(notifs);

 // Verificar si hay compromisos pendiente_evaluado
 const pendientes = (compRes.data || []).filter((c: Compromiso) => c.estado === 'pendiente_evaluado');
 if (pendientes.length > 0) {
 setConcertacionPendiente(pendientes[0].evaluacion_id);
 }
 } catch (err) {
 console.error('Error cargando datos:', err);
 } finally {
 setLoading(false);
 }
 }

 async function aceptarConcertacion() {
 if (!concertacionPendiente) return;
 setSaving(true);
 setMensaje('');
 try {
 await api.put(`/evaluaciones/${concertacionPendiente}/aceptar-concertacion`, {
 observaciones_evaluado: obsAceptar.trim() || null,
 });
 setConcertacionPendiente(null);
 setObsAceptar('');
 setMensaje('Concertación aceptada exitosamente. Todos los compromisos han sido aprobados.');
 cargarDatos();
 } catch (err: any) {
 setMensaje(err.message || 'Error al aceptar la concertación');
 } finally {
 setSaving(false);
 }
 }

 async function rechazarConcertacion() {
 if (!concertacionPendiente) return;
 if (!obsRechazar.trim()) {
 setMensaje('Debe indicar el motivo del rechazo');
 return;
 }
 setSaving(true);
 setMensaje('');
 try {
 await api.put(`/evaluaciones/${concertacionPendiente}/rechazar-concertacion`, {
 observaciones_evaluado: obsRechazar.trim(),
 });
 setConcertacionPendiente(null);
 setObsRechazar('');
 setShowRechazar(false);
 setMensaje('Concertación rechazada. El evaluador será notificado para proceder con fijación unilateral.');
 cargarDatos();
 } catch (err: any) {
 setMensaje(err.message || 'Error al rechazar la concertación');
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

 const compromisosFiltrados = filtroTipo === 'todos'
 ? compromisos
 : compromisos.filter(c => c.tipo === filtroTipo);

 const compromisosConcertacion = compromisos.filter(c => c.estado === 'pendiente_evaluado');
 const evaluacionConcertada = compromisosConcertacion.length > 0 ? compromisosConcertacion[0].evaluacion_id : null;

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

 {/* ALERTA DE CONCERTACION PENDIENTE */}
 {concertacionPendiente && (
 <div className="edl-card mb-6 border-l-4 border-amber-500 bg-amber-50">
 <div className="flex items-start gap-3">
 <span className="material-icons text-2xl text-amber-600">notifications_active</span>
 <div className="flex-1">
 <h3 className="font-heading font-bold text-inst-azul mb-1">
 Concertación de compromisos pendiente de su aceptación
 </h3>
 <p className="text-sm text-inst-texto mb-3">
 Su evaluador ha concertado los siguientes compromisos y competencias para su evaluación.
 Debe aceptar o rechazar la concertación completa.
 </p>

 {/* Lista de compromisos pendientes */}
 <div className="space-y-2 mb-4">
 {compromisosConcertacion.map(c => {
 const tipoInfo = TIPO_LABELS[c.tipo] || { label: c.tipo, icon: 'chevron_right' };
 return (
 <div key={c.id} className="flex items-start gap-2 p-2 bg-white rounded border">
 <span className="material-icons text-sm text-inst-azul mt-0.5">{tipoInfo.icon}</span>
 <div className="flex-1">
 <span className="text-xs text-inst-texto-claro uppercase font-medium">{tipoInfo.label}</span>
 <p className="text-sm text-inst-texto">{c.descripcion}</p>
 {c.peso > 0 && <span className="text-xs text-inst-azul font-semibold">Peso: {c.peso}%</span>}
 </div>
 </div>
 );
 })}
 </div>

 {/* Botones aceptar/rechazar */}
 {!showRechazar ? (
 <div className="space-y-3">
 <div>
 <label className="edl-label">Observaciones (opcional)</label>
 <input
 type="text"
 value={obsAceptar}
 onChange={e => setObsAceptar(e.target.value)}
 className="edl-input"
 placeholder="Observaciones adicionales..."
 />
 </div>
 <div className="flex gap-3">
 <button
 onClick={aceptarConcertacion}
 disabled={saving}
 className="edl-btn-primary flex items-center gap-2 px-6 py-3 bg-inst-verde hover:bg-green-700"
 >
 <span className="material-icons text-lg">check_circle</span>
 {saving ? 'Aceptando...' : 'Aceptar Concertación'}
 </button>
 <button
 onClick={() => setShowRechazar(true)}
 className="edl-btn-secondary text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-2"
 >
 <span className="material-icons text-lg">cancel</span>
 Rechazar Concertación
 </button>
 </div>
 </div>
 ) : (
 <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
 <h4 className="font-heading font-bold text-red-700 text-sm">
 Rechazar Concertación
 </h4>
 <p className="text-xs text-red-600">
 Si rechaza la concertación, el evaluador procederá con la fijación unilateral de compromisos
 conforme al Art. 33 de la Resolución 1760 de 2010.
 </p>
 <div>
 <label className="edl-label">Motivo del rechazo (obligatorio)</label>
 <textarea
 value={obsRechazar}
 onChange={e => setObsRechazar(e.target.value)}
 className="edl-input min-h-[60px]"
 placeholder="Explique por qué rechaza la concertación..."
 />
 </div>
 <div className="flex gap-3">
 <button
 onClick={rechazarConcertacion}
 disabled={saving || !obsRechazar.trim()}
 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-1 text-sm disabled:opacity-50"
 >
 <span className="material-icons text-sm">block</span>
 {saving ? 'Rechazando...' : 'Confirmar Rechazo'}
 </button>
 <button
 onClick={() => { setShowRechazar(false); setObsRechazar(''); }}
 className="edl-btn-secondary"
 >
 Cancelar
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* Mensaje de exito/error */}
 {mensaje && (
 <div className={`edl-card mb-4 border-l-4 ${mensaje.includes('exitosamente') || mensaje.includes('aceptada') ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
 <p className="text-sm font-medium">{mensaje}</p>
 </div>
 )}

 {/* Filtros por tipo */}
 <div className="flex gap-2 mb-4">
 {[
 { value: 'todos', label: 'Todos' },
 { value: 'funcional', label: 'Funcionales' },
 { value: 'comportamental', label: 'Comportamentales' },
 ].map(f => (
 <button
 key={f.value}
 onClick={() => setFiltroTipo(f.value)}
 className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
 filtroTipo === f.value
 ? 'bg-inst-azul text-white border-inst-azul'
 : 'bg-white text-inst-texto border-inst-borde hover:bg-inst-gris'
 }`}
 >
 {f.label}
 </button>
 ))}
 </div>

 {/* Formulario nuevo compromiso */}
 {showForm && (
 <div className="edl-card mb-6">
 <h3 className="font-heading font-bold text-inst-azul mb-1">
 Proponer Compromiso
 </h3>
 <p className="text-xs text-inst-texto-claro mb-4">
 Acuerdo 6176 de 2018 — Concertación de compromisos funcionales y competencias comportamentales
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="edl-label">Evaluación</label>
 <select
 value={evaluacionId}
 onChange={e => setEvaluacionId(Number(e.target.value))}
 className="edl-input"
 >
 <option value={0}>Seleccione...</option>
 {evaluaciones.map(ev => (
 <option key={ev.id} value={ev.id}>
 #{ev.id} - {ev.periodo_nombre} ({ev.tipo})
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="edl-label">Tipo de compromiso</label>
 <select value={tipo} onChange={e => setTipo(e.target.value)} className="edl-input">
 <option value="funcional">Compromiso Funcional</option>
 <option value="comportamental">Competencia Comportamental</option>
 </select>
 </div>
 <div className="md:col-span-2">
 <label className="edl-label">Descripción del Compromiso</label>
 <textarea
 value={descripcion}
 onChange={e => setDescripcion(e.target.value)}
 className="edl-input min-h-[80px]"
 placeholder="Describa el compromiso o competencia..."
 />
 </div>
 <div>
 <label className="edl-label">Resultado esperado</label>
 <input
 type="text"
 value={resultadoEsperado}
 onChange={e => setResultadoEsperado(e.target.value)}
 className="edl-input"
 placeholder="Qué se espera lograr"
 />
 </div>
 <div>
 <label className="edl-label">Medio de verificación</label>
 <input
 type="text"
 value={medioVerificacion}
 onChange={e => setMedioVerificacion(e.target.value)}
 className="edl-input"
 placeholder="Cómo se verificará el cumplimiento"
 />
 </div>
 <div>
 <label className="edl-label">Plazo (fecha límite)</label>
 <input
 type="date"
 value={plazo}
 onChange={e => setPlazo(e.target.value)}
 className="edl-input"
 />
 </div>
 <div>
 <label className="edl-label">Observaciones</label>
 <input
 type="text"
 value={observaciones}
 onChange={e => setObservaciones(e.target.value)}
 className="edl-input"
 placeholder="Observaciones adicionales"
 />
 </div>
 </div>
 <div className="flex gap-3 mt-4">
 <button
 onClick={enviarCompromiso}
 disabled={saving || !evaluacionId || !descripcion.trim()}
 className="edl-btn-primary"
 >
 {saving ? 'Enviando...' : 'Proponer para Concertación'}
 </button>
 <button onClick={() => { setShowForm(false); resetForm(); }} className="edl-btn-secondary">
 Cancelar
 </button>
 </div>
 </div>
 )}

 {/* Lista de compromisos */}
 {loading ? (
 <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
 ) : compromisosFiltrados.length === 0 ? (
 <div className="edl-card text-center py-8 text-inst-texto-claro">
 No tiene compromisos registrados. Haga clic en "Proponer Compromiso" para iniciar la concertación.
 </div>
 ) : (
 <div className="space-y-3">
 {compromisosFiltrados.map(c => {
 const estadoInfo = ESTADO_LABELS[c.estado] || { label: c.estado, color: 'bg-gray-200 text-gray-700' };
 const tipoInfo = TIPO_LABELS[c.tipo] || { label: c.tipo, icon: 'chevron_right' };
 return (
 <div key={c.id} className="edl-card">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="material-icons text-sm text-inst-azul">
 {tipoInfo.icon}
 </span>
 <span className="text-xs text-inst-texto-claro uppercase font-medium">
 {tipoInfo.label}
 </span>
 <span className={`text-xs px-2 py-0.5 rounded-full ${estadoInfo.color}`}>
 {estadoInfo.label}
 </span>
 </div>
 <p className="text-sm text-inst-texto mb-1">{c.descripcion}</p>
 {c.resultado_esperado && (
 <p className="text-xs text-inst-verde mb-1">Resultado: {c.resultado_esperado}</p>
 )}
 {c.medio_verificacion && (
 <p className="text-xs text-inst-texto-claro mb-1">Verificación: {c.medio_verificacion}</p>
 )}
 <div className="flex gap-4 text-xs text-inst-texto-claro">
 {c.peso > 0 && <span>Peso: {c.peso}%</span>}
 {c.plazo && <span>Plazo: {c.plazo}</span>}
 {c.evaluador_nombre && <span>Evaluador: {c.evaluador_nombre}</span>}
 </div>
 {(c.estado === 'devuelto') && c.observaciones_evaluador && (
 <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
 Observaciones del evaluador: {c.observaciones_evaluador}
 </div>
 )}
 {c.observaciones_evaluado && (
 <div className="mt-1 text-xs text-inst-texto-claro">
 Mis observaciones: {c.observaciones_evaluado}
 </div>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
);
}
