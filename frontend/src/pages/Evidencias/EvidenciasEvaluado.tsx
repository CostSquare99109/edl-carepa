import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Compromiso {
 id: number;
 tipo: string;
 descripcion: string;
 peso: number;
 estado: string;
 resultado_esperado: string | null;
 medio_verificacion: string | null;
}

interface Evidencia {
 id: number;
 compromiso_id: number;
 descripcion: string;
 ubicacion: string | null;
 observacion: string | null;
 tipo: string;
 compromiso_competencia: string | null;
 creado_en: string;
}

interface Periodo {
 id: number;
 nombre: string;
}

export default function EvidenciasEvaluado() {
 const { usuario } = useAuth();
 const [periodos, setPeriodos] = useState<Periodo[]>([]);
 const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number>(0);
 const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
 const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 // Formulario
 const [compromisoSeleccionado, setCompromisoSeleccionado] = useState<number>(0);
 const [descripcion, setDescripcion] = useState('');
 const [ubicacion, setUbicacion] = useState('');
 const [observacion, setObservacion] = useState('');
 const [editandoId, setEditandoId] = useState<number | null>(null);
 const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

 useEffect(() => {
 cargarInicial();
 }, []);

 async function cargarInicial() {
 setLoading(true);
 try {
 const perRes = await api.get<any>('/periodos?por_pagina=100');
 const pers = Array.isArray(perRes?.data) ? perRes.data : [];
 setPeriodos(pers);
 if (pers.length > 0) {
 setPeriodoSeleccionado(pers[0].id);
 }
 setLoading(false);
 } catch {
 setLoading(false);
 }
 }

 useEffect(() => {
 if (periodoSeleccionado > 0) {
 cargarCompromisosYEvidencias();
 }
 }, [periodoSeleccionado]);

 async function cargarCompromisosYEvidencias() {
 if (!periodoSeleccionado || !usuario?.id) return;
 setLoading(true);
 try {
 const [compRes, evRes] = await Promise.all([
 api.get<any>(`/compromisos?periodo_id=${periodoSeleccionado}&responsable_id=${usuario.id}&por_pagina=100`).catch(() => ({ funcional: [], comportamentales: [] })),
 api.get<any>(`/evidencias?periodo_id=${periodoSeleccionado}&por_pagina=100`).catch(() => ({ data: [] })),
 ]);

 // Si viene agrupado por tipo
 let todos: Compromiso[] = [];
 if (compRes?.funcionales && compRes?.comportamentales) {
 todos = [...(compRes.funcionales || []), ...(compRes.comportamentales || [])];
 } else if (Array.isArray(compRes?.data)) {
 todos = compRes.data;
 } else if (Array.isArray(compRes)) {
 todos = compRes;
 }

 const concertados = todos.filter(
 (c: Compromiso) => c.estado === 'aceptado_evaluado' || c.estado === 'aprobado' || c.estado === 'en_progreso' || c.estado === 'cumplido'
 );
 setCompromisos(concertados);

 const evList = Array.isArray(evRes?.data) ? evRes.data : Array.isArray(evRes) ? evRes : [];
 setEvidencias(evList);
 } catch {
 setCompromisos([]);
 setEvidencias([]);
 } finally {
 setLoading(false);
 }
 }

 function resetForm() {
 setDescripcion('');
 setUbicacion('');
 setObservacion('');
 setCompromisoSeleccionado(0);
 setEditandoId(null);
 setMensaje(null);
 }

 function editarEvidencia(ev: Evidencia) {
 setEditandoId(ev.id);
 setCompromisoSeleccionado(ev.compromiso_id);
 setDescripcion(ev.descripcion || '');
 setUbicacion(ev.ubicacion || '');
 setObservacion(ev.observacion || '');
 }

 async function guardarEvidencia() {
 if (!compromisoSeleccionado) {
 setMensaje({ tipo: 'error', texto: 'Seleccione un compromiso o competencia.' });
 return;
 }
 if (!descripcion.trim()) {
 setMensaje({ tipo: 'error', texto: 'La descripcion es obligatoria.' });
 return;
 }
 if (!ubicacion.trim()) {
 setMensaje({ tipo: 'error', texto: 'La ubicacion es obligatoria. Indique donde reposa el soporte.' });
 return;
 }

 setSaving(true);
 setMensaje(null);

 try {
 const body: any = {
 compromiso_id: compromisoSeleccionado,
 periodo_id: periodoSeleccionado,
 descripcion: descripcion.trim(),
 ubicacion: ubicacion.trim(),
 observacion: observacion.trim() || null,
 tipo: compromisos.find(c => c.id === compromisoSeleccionado)?.tipo === 'comportamental' ? 'competencia' : 'compromiso',
 };

 if (editandoId) {
 await api.put(`/evidencias/${editandoId}`, body);
 setMensaje({ tipo: 'ok', texto: 'Evidencia actualizada correctamente.' });
 } else {
 await api.post('/evidencias', body);
 setMensaje({ tipo: 'ok', texto: 'Evidencia registrada correctamente.' });
 }
 resetForm();
 cargarCompromisosYEvidencias();
 } catch (err: any) {
 setMensaje({ tipo: 'error', texto: err.message || 'Error al guardar.' });
 } finally {
 setSaving(false);
 }
 }

 // Obtener descripcion del compromiso por ID
 function nombreCompromiso(compId: number): string {
 return compromisos.find(c => c.id === compId)?.descripcion || 'Compromiso #' + compId;
 }

 function tipoCompromiso(compId: number): string {
 return compromisos.find(c => c.id === compId)?.tipo === 'comportamental' ? 'Comportamental' : 'Funcional';
 }

 return (
 <div>
 <h2 className="edl-section-title mb-6">Evidencias de Desempeño</h2>

 {/* Card de datos del evaluado */}
 <div className="edl-card mb-6">
 <div className="flex items-center gap-3 mb-3">
 <span className="material-icons text-2xl text-inst-azul">badge</span>
 <h3 className="font-heading font-bold text-inst-azul">Datos del Servidor</h3>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
 <div>
 <span className="text-inst-texto-claro text-xs">Nombre completo</span>
 <p className="font-medium text-inst-texto">{usuario?.nombres} {usuario?.apellidos}</p>
 </div>
 <div>
 <span className="text-inst-texto-claro text-xs">Documento</span>
 <p className="font-medium text-inst-texto">{usuario?.documento}</p>
 </div>
 <div>
 <span className="text-inst-texto-claro text-xs">Empleo/Cargo</span>
 <p className="font-medium text-inst-texto">{usuario?.cargo || '-'}</p>
 </div>
 </div>
 </div>

 {/* Selector de PERIODO (no evaluacion) */}
 <div className="edl-card mb-6">
 <label className="edl-label">Periodo de Evaluación</label>
 <select
 value={periodoSeleccionado}
 onChange={e => setPeriodoSeleccionado(Number(e.target.value))}
 className="edl-input"
 >
 <option value={0}>Seleccione...</option>
 {periodos.map(p => (
 <option key={p.id} value={p.id}>{p.nombre}</option>
 ))}
 </select>
 </div>

 {/* Layout de 2 columnas: formulario + tabla */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* COLUMNA IZQUIERDA: Formulario */}
 <div className="edl-card lg:sticky lg:top-4 lg:self-start">
 <div className="flex items-center gap-2 mb-4">
 <span className="material-icons text-xl text-inst-azul">edit_note</span>
 <h3 className="font-heading font-bold text-inst-azul">
 {editandoId ? 'Editar Evidencia' : 'Registrar Evidencia'}
 </h3>
 </div>

 {mensaje && (
 <div className={`mb-4 p-3 rounded-lg border-l-4 ${
 mensaje.tipo === 'ok' ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-500 bg-red-50 text-red-800'
 }`}>
 <p className="text-sm">{mensaje.texto}</p>
 </div>
 )}

 <div className="space-y-4">
 <div>
 <label className="edl-label">Compromiso o Competencia *</label>
 <select
 value={compromisoSeleccionado}
 onChange={e => setCompromisoSeleccionado(Number(e.target.value))}
 className="edl-input"
 >
 <option value={0}>Seleccione...</option>
 {compromisos.map(c => (
 <option key={c.id} value={c.id}>
 [{c.tipo === 'comportamental' ? 'Comportamental' : 'Funcional'}] {c.descripcion}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="edl-label">Descripción del logro *</label>
 <textarea
 value={descripcion}
 onChange={e => setDescripcion(e.target.value)}
 className="edl-input min-h-[80px]"
 placeholder="Describa detalladamente la evidencia del logro alcanzado..."
 />
 </div>

 <div>
 <label className="edl-label">Ubicación del soporte *</label>
 <input
 type="text"
 value={ubicacion}
 onChange={e => setUbicacion(e.target.value)}
 className="edl-input"
 placeholder="Carpeta compartida, enlace URL, oficina donde reposa..."
 />
 </div>

 <div>
 <label className="edl-label">Observación</label>
 <textarea
 value={observacion}
 onChange={e => setObservacion(e.target.value)}
 className="edl-input min-h-[50px]"
 placeholder="Notas adicionales (opcional)..."
 />
 </div>

 <div className="flex gap-3">
 <button
 onClick={guardarEvidencia}
 disabled={saving || !compromisoSeleccionado || !descripcion.trim() || !ubicacion.trim()}
 className="edl-btn-primary flex items-center gap-2 disabled:opacity-50"
 >
 <span className="material-icons text-sm">save</span>
 {saving ? 'Guardando...' : editandoId ? 'Actualizar' : 'Registrar Evidencia'}
 </button>
 {editandoId && (
 <button onClick={resetForm} className="edl-btn-secondary">
 Cancelar
 </button>
 )}
 </div>
 </div>
 </div>

 {/* COLUMNA DERECHA: Tabla de historial */}
 <div>
 {loading ? (
 <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
 ) : evidencias.length === 0 ? (
 <div className="edl-card text-center py-8 text-inst-texto-claro">
 No hay evidencias registradas para este periodo.
 </div>
 ) : (
 <div className="edl-card overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-inst-borde">
 <th className="text-left py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Compromiso</th>
 <th className="text-left py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Descripción</th>
 <th className="text-left py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Ubicación</th>
 <th className="text-left py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Fecha</th>
 <th className="text-center py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Acción</th>
 </tr>
 </thead>
 <tbody>
 {evidencias.map(ev => (
 <tr key={ev.id} className="border-b border-inst-borde hover:bg-inst-gris/30">
 <td className="py-2.5 px-3">
 <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium ${
 tipoCompromiso(ev.compromiso_id) === 'Comportamental'
 ? 'bg-green-100 text-green-800'
 : 'bg-blue-100 text-blue-800'
 }`}>
 {tipoCompromiso(ev.compromiso_id)}
 </span>
 <p className="mt-1 text-inst-texto text-xs">{nombreCompromiso(ev.compromiso_id)}</p>
 </td>
 <td className="py-2.5 px-3 text-inst-texto">{ev.descripcion}</td>
 <td className="py-2.5 px-3 text-inst-texto-claro">{ev.ubicacion || '-'}</td>
 <td className="py-2.5 px-3 text-inst-texto-claro text-xs">
 {new Date(ev.creado_en).toLocaleDateString('es-CO', {
 year: 'numeric', month: 'short', day: 'numeric',
 })}
 </td>
 <td className="py-2.5 px-3 text-center">
 <button
 onClick={() => editarEvidencia(ev)}
 className="material-icons text-sm text-inst-texto-claro hover:text-inst-azul"
 title="Editar"
 >
 edit
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
