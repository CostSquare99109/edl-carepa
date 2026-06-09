import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

interface Evaluado {
 id: number;
 documento: string;
 nombre_completo: string;
 primer_nombre: string;
 nivel: string;
 denominacion: string;
 codigo: string;
 grado: string;
 evaluacion_id: number;
 periodo_id: number;
 periodo_nombre: string;
 es_comision_evaluadora: number;
}

interface Meta {
 id: number;
 descripcion: string;
 entidad_id: number;
 entidad_nombre: string;
}

interface CompromisoFuncional {
 id?: number;
 meta_id: number;
 meta_nombre: string;
 descripcion: string;
 peso: number;
}

interface CompetenciaComportamental {
 id: number;
 nombre: string;
 decreto: string;
 descripcion: string;
}

interface CompromisoComportamental {
 id?: number;
 competencia_id: number;
 competencia_nombre: string;
 decreto: string;
 es_propuesto_jefe: boolean;
}

interface CompromisoPropuesto {
 id: number;
 tipo: string;
 descripcion: string;
 competencia_nombre?: string;
 meta_nombre?: string;
 peso?: number;
}

export default function ConcertarCompromisos() {
 const navigate = useNavigate();

 // Busqueda
 const [busquedaDocumento, setBusquedaDocumento] = useState('');
 const [buscando, setBuscando] = useState(false);
 const [evaluados, setEvaluados] = useState<Evaluado[]>([]);
 const [evaluado, setEvaluado] = useState<Evaluado | null>(null);

 // Periodo
 const [periodos, setPeriodos] = useState<{ id: number; nombre: string }[]>([]);
 const [periodoId, setPeriodoId] = useState<number>(0);

 // Comision evaluadora
 const [aplicaComision, setAplicaComision] = useState(false);
 const [usuariosComision, setUsuariosComision] = useState<{ id: number; nombre: string }[]>([]);
 const [comisionSeleccionada, setComisionSeleccionada] = useState<number>(0);

 // No es jefe inmediato
 const [noEsJefe, setNoEsJefe] = useState(false);
 const [motivoCambio, setMotivoCambio] = useState('');

 // Compromisos funcionales
 const [funcionales, setFuncionales] = useState<CompromisoFuncional[]>([]);
 const [showModalFuncional, setShowModalFuncional] = useState(false);
 const [metas, setMetas] = useState<Meta[]>([]);
 const [funcionalEditIndex, setFuncionalEditIndex] = useState<number | null>(null);

 // Modal funcional fields
 const [fMetaId, setFMetaId] = useState<number>(0);
 const [fDescripcion, setFDescripcion] = useState('');
 const [fPeso, setFPeso] = useState<number>(0);

 // Compromisos comportamentales
 const [competencias, setCompetencias] = useState<CompetenciaComportamental[]>([]);
 const [comportamentales, setComportamentales] = useState<CompromisoComportamental[]>([]);
 const [showModalComportamental, setShowModalComportamental] = useState(false);
 const [selectedCompetencias, setSelectedCompetencias] = useState<number[]>([]);
 const [propuestoJefeMap, setPropuestoJefeMap] = useState<Record<number, boolean>>({});

 // Compromisos propuestos por el evaluado
 const [showModalPropuestos, setShowModalPropuestos] = useState(false);
 const [compromisosPropuestos, setCompromisosPropuestos] = useState<CompromisoPropuesto[]>([]);

 // Tipo concertacion
 const [tipoConcertacion, setTipoConcertacion] = useState<'concertacion_evaluador_evaluado' | 'fijados_evaluador'>('concertacion_evaluador_evaluado');

 // Estado de la concertacion
 const [concertacionConfirmada, setConcertacionConfirmada] = useState(false);

 // Alerta inicial
 const [showAlerta, setShowAlerta] = useState(false);

 // Loading
 const [loading, setLoading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error' | 'warn'; texto: string } | null>(null);

 useEffect(() => {
 cargarInicial();
 }, []);

 async function cargarInicial() {
 setLoading(true);
 try {
 const [periodosRes, competenciasRes] = await Promise.all([
 api.get('/periodos'),
 api.get('/competencias'),
 ]);
 const periodosArray: any[] = Array.isArray(periodosRes) ? periodosRes : [];
 setPeriodos(periodosArray);
 const competenciasArray: any[] = Array.isArray(competenciasRes) ? competenciasRes : [];
 setCompetencias(competenciasArray);

 try {
 const usersRes = await api.get<any>('/usuarios?por_pagina=100');
 const users = Array.isArray(usersRes) ? usersRes : (usersRes?.data || []);
 setUsuariosComision(users.map((u: any) => ({ id: u.id, nombre: `${u.nombres} ${u.apellidos}` })));
 } catch {}
 } catch (err) {
 console.error('Error cargando datos:', err);
 } finally {
 setLoading(false);
 }
 }

 async function buscarEvaluado() {
 const doc = busquedaDocumento.trim();
 if (!doc) {
 setMensaje({ tipo: 'error', texto: 'Ingrese un numero de documento.' });
 return;
 }

 setBuscando(true);
 setMensaje(null);
 try {
 const res = await api.get<any>(`/evaluaciones?documento_evaluado=${doc}&por_pagina=50`);
 const evals = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

 if (evals.length === 0) {
 setMensaje({ tipo: 'error', texto: 'No se encontro ningun evaluado con ese documento bajo su cargo.' });
 setEvaluados([]);
 return;
 }

 const evaluadosList: Evaluado[] = evals.map((ev: any) => ({
 id: ev.evaluado_id || ev.funcionario_id,
 documento: doc,
 nombre_completo: ev.evaluado_nombre || ev.funcionario_nombre || '',
 primer_nombre: (ev.evaluado_nombre || ev.funcionario_nombre || '').split(' ')[0],
 nivel: ev.nivel || '',
 denominacion: ev.denominacion || '',
 codigo: ev.codigo || '',
 grado: ev.grado || '',
 evaluacion_id: ev.id,
 periodo_id: ev.periodo_id || 0,
 periodo_nombre: ev.periodo_nombre || '',
 es_comision_evaluadora: ev.es_comision_evaluadora || 0,
 }));

 setEvaluados(evaluadosList);
 } catch (err: any) {
 setMensaje({ tipo: 'error', texto: err.message || 'Error al buscar evaluado.' });
 } finally {
 setBuscando(false);
 }
 }

 async function seleccionarEvaluado(ev: Evaluado) {
 setEvaluado(ev);
 setEvaluados([]);
 setBusquedaDocumento('');
 setPeriodoId(ev.periodo_id);
 setConcertacionConfirmada(false);
 setShowAlerta(true);
 setTimeout(() => setShowAlerta(false), 5000);

 // Cargar metas del periodo
 if (ev.periodo_id) {
 try {
 const metasRes = await api.get<any>(`/periodos/${ev.periodo_id}/metas`);
 const m = Array.isArray(metasRes) ? metasRes : (metasRes?.data || []);
 setMetas(m);
 } catch {}
 }

 // Cargar compromisos existentes de la evaluacion
 if (ev.evaluacion_id) {
 try {
 const compRes = await api.get<any>(`/compromisos/evaluacion/${ev.evaluacion_id}`);
 if (compRes?.funcionales) {
 setFuncionales(compRes.funcionales.map((c: any) => ({
 id: c.id,
 meta_id: c.meta_id || 0,
 meta_nombre: c.meta_nombre || 'Sin meta',
 descripcion: c.descripcion,
 peso: parseFloat(c.peso) || 0,
 })));
 }
 if (compRes?.comportamentales) {
 setComportamentales(compRes.comportamentales.map((c: any) => ({
 id: c.id,
 competencia_id: c.competencia_id || 0,
 competencia_nombre: c.competencia_nombre || c.descripcion,
 decreto: c.competencia_decreto || '',
 es_propuesto_jefe: !!c.es_propuesto_jefe,
 })));
 }

 // Si la evaluacion ya esta en estado concertacion o pendiente_evaluado, bloquear
 const evalRes = await api.get<any>(`/evaluaciones/${ev.evaluacion_id}`);
 if (evalRes?.estado === 'concertacion' || evalRes?.estado === 'pendiente_evaluado' || evalRes?.estado === 'fijacion_unilateral') {
 setConcertacionConfirmada(true);
 }
 } catch {}
 }
 }

 async function verCompromisosPropuestos() {
 if (!evaluado) return;
 try {
 const res = await api.get<any>(`/compromisos/propuestos-evaluado?evaluacion_id=${evaluado.evaluacion_id}`);
 const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
 setCompromisosPropuestos(list);
 setShowModalPropuestos(true);
 } catch {
 setCompromisosPropuestos([]);
 setShowModalPropuestos(true);
 }
 }

 const sumaPesosFuncionales = funcionales.reduce((sum, f) => sum + f.peso, 0);

 function openModalFuncional(editIdx: number | null = null) {
 if (concertacionConfirmada) return;
 if (editIdx !== null) {
 const f = funcionales[editIdx];
 setFMetaId(f.meta_id);
 setFDescripcion(f.descripcion);
 setFPeso(f.peso);
 } else {
 setFMetaId(0);
 setFDescripcion('');
 setFPeso(0);
 }
 setFuncionalEditIndex(editIdx);
 setShowModalFuncional(true);
 }

 function guardarFuncional() {
 if (!fDescripcion.trim()) {
 setMensaje({ tipo: 'error', texto: 'La descripcion del compromiso es requerida.' });
 return;
 }
 if (fPeso <= 0) {
 setMensaje({ tipo: 'error', texto: 'El peso debe ser mayor a 0.' });
 return;
 }
 if (fPeso > 100) {
 setMensaje({ tipo: 'error', texto: 'El peso no puede ser mayor a 100.' });
 return;
 }

 const metaNombre = metas.find(m => m.id === fMetaId)?.descripcion || 'Sin meta asociada';

 if (funcionalEditIndex !== null) {
 const nuevos = [...funcionales];
 nuevos[funcionalEditIndex] = {
 ...nuevos[funcionalEditIndex],
 meta_id: fMetaId,
 meta_nombre: metaNombre,
 descripcion: fDescripcion.trim(),
 peso: fPeso,
 };
 setFuncionales(nuevos);
 } else {
 if (funcionales.length >= 5) {
 setMensaje({ tipo: 'error', texto: 'No se pueden agregar mas de 5 compromisos funcionales.' });
 return;
 }
 setFuncionales([...funcionales, {
 meta_id: fMetaId,
 meta_nombre: metaNombre,
 descripcion: fDescripcion.trim(),
 peso: fPeso,
 }]);
 }

 setShowModalFuncional(false);
 setMensaje(null);
 }

 async function eliminarFuncional(idx: number) {
 if (concertacionConfirmada) return;
 const comp = funcionales[idx];
 if (comp.id) {
 try {
 await api.delete(`/compromisos/funcional/${comp.id}`);
 } catch (err: any) {
 setMensaje({ tipo: 'error', texto: 'Error al eliminar compromiso funcional: ' + (err.message || '') });
 return;
 }
 }
 setFuncionales(funcionales.filter((_, i) => i !== idx));
 }

 function toggleCompetencia(id: number) {
 if (selectedCompetencias.includes(id)) {
 setSelectedCompetencias(selectedCompetencias.filter(c => c !== id));
 } else {
 if (selectedCompetencias.length >= 5) return;
 setSelectedCompetencias([...selectedCompetencias, id]);
 }
 }

 function guardarComportamentales() {
 if (selectedCompetencias.length < 3) {
 setMensaje({ tipo: 'error', texto: 'Debe seleccionar al menos 3 competencias comportamentales.' });
 return;
 }
 if (selectedCompetencias.length > 5) {
 setMensaje({ tipo: 'error', texto: 'No puede seleccionar mas de 5 competencias comportamentales.' });
 return;
 }

 const nuevos: CompromisoComportamental[] = selectedCompetencias.map(compId => {
 const comp = competencias.find(c => c.id === compId)!;
 return {
 competencia_id: comp.id,
 competencia_nombre: comp.nombre,
 decreto: comp.decreto,
 es_propuesto_jefe: propuestoJefeMap[comp.id] || false,
 };
 });

 setComportamentales(nuevos);
 setShowModalComportamental(false);
 setSelectedCompetencias([]);
 setPropuestoJefeMap({});
 setMensaje(null);
 }

 async function eliminarComportamental(idx: number) {
 if (concertacionConfirmada) return;
 const comp = comportamentales[idx];
 if (comp.id) {
 try {
 await api.delete(`/compromisos/comportamental/${comp.id}`);
 } catch (err: any) {
 setMensaje({ tipo: 'error', texto: 'Error al eliminar compromiso comportamental: ' + (err.message || '') });
 return;
 }
 }
 setComportamentales(comportamentales.filter((_, i) => i !== idx));
 }

 async function confirmarConcertacion() {
 if (!evaluado) return;

 // Validaciones
 if (funcionales.length < 1) {
 setMensaje({ tipo: 'error', texto: 'Debe ingresar al menos 1 compromiso funcional.' });
 return;
 }
 if (funcionales.length > 5) {
 setMensaje({ tipo: 'error', texto: 'No puede tener mas de 5 compromisos funcionales.' });
 return;
 }
 if (Math.abs(sumaPesosFuncionales - 100) > 0.01) {
 setMensaje({ tipo: 'error', texto: `La suma de los pesos funcionales debe ser exactamente 100%. Actualmente suma: ${sumaPesosFuncionales}%` });
 return;
 }
 if (comportamentales.length < 3) {
 setMensaje({ tipo: 'error', texto: 'Debe ingresar al menos 3 compromisos comportamentales.' });
 return;
 }
 if (comportamentales.length > 5) {
 setMensaje({ tipo: 'error', texto: 'No puede tener mas de 5 compromisos comportamentales.' });
 return;
 }

 if (!confirm('Esta seguro de confirmar la concertacion? Una vez confirmada no podra editar los compromisos hasta que el evaluado acepte o rechace.')) return;

 setSaving(true);
 setMensaje(null);

 try {
 // 1. Guardar compromisos funcionales
 for (const f of funcionales) {
 await api.post('/compromisos/funcional', {
 evaluacion_id: evaluado.evaluacion_id,
 meta_id: f.meta_id || null,
 descripcion: f.descripcion,
 peso: f.peso,
 tipo_concertacion: tipoConcertacion,
 no_es_jefe_inmediato: noEsJefe ? 1 : 0,
 motivo_cambio_evaluador: noEsJefe ? motivoCambio : null,
 ...(f.id ? { id: f.id } : {}),
 });
 }

 // 2. Guardar compromisos comportamentales
 await api.post('/compromisos/comportamental', {
 evaluacion_id: evaluado.evaluacion_id,
 tipo_concertacion: tipoConcertacion,
 competencias: comportamentales.map(c => ({
 competencia_id: c.competencia_id,
 es_propuesto_jefe: c.es_propuesto_jefe ? 1 : 0,
 })),
 });

 // 3. Confirmar concertacion (cambia estado a pendiente_evaluado)
 await api.put(`/compromisos/confirmar-concertacion/${evaluado.evaluacion_id}`);

 setConcertacionConfirmada(true);
 setMensaje({ tipo: 'ok', texto: 'Concertacion confirmada exitosamente. El evaluado debe aceptar o rechazar los compromisos.' });
 } catch (err: any) {
 setMensaje({ tipo: 'error', texto: err.message || 'Error al guardar la concertacion.' });
 } finally {
 setSaving(false);
 }
 }

 return (
 <div>
 <h2 className="edl-section-title mb-6">Concertar Compromisos</h2>

 {/* ===== BUSCADOR POR CEDULA ===== */}
 {!evaluado && (
 <div className="edl-card mb-6">
 <div className="flex items-center gap-3 mb-4">
 <span className="material-icons text-2xl text-inst-azul">search</span>
 <h3 className="font-heading font-bold text-inst-azul">Buscar evaluado para concertar</h3>
 </div>
 <div className="flex gap-3">
 <input
 type="text"
 value={busquedaDocumento}
 onChange={e => setBusquedaDocumento(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && buscarEvaluado()}
 className="edl-input flex-1"
 placeholder="Digite el numero de documento del evaluado..."
 />
 <button
 onClick={buscarEvaluado}
 disabled={buscando}
 className="edl-btn-primary flex items-center gap-2"
 >
 <span className="material-icons text-lg">person_search</span>
 {buscando ? 'Buscando...' : 'Buscar'}
 </button>
 </div>
 {mensaje && (
 <div className={`mt-3 p-3 rounded-lg border-l-4 ${
 mensaje.tipo === 'ok' ? 'border-green-500 bg-green-50 text-green-800' :
 mensaje.tipo === 'warn' ? 'border-yellow-500 bg-yellow-50 text-yellow-800' :
 'border-red-500 bg-red-50 text-red-800'
 }`}>
 <p className="text-sm">{mensaje.texto}</p>
 </div>
 )}

 {/* Resultados de busqueda */}
 {evaluados.length > 0 && (
 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-inst-azul/5 text-left">
 <th className="px-3 py-2 font-medium text-inst-azul">Documento</th>
 <th className="px-3 py-2 font-medium text-inst-azul">Nombre</th>
 <th className="px-3 py-2 font-medium text-inst-azul">Empleo</th>
 <th className="px-3 py-2 font-medium text-inst-azul">Grado</th>
 <th className="px-3 py-2 font-medium text-inst-azul">Periodo</th>
 <th className="px-3 py-2 font-medium text-inst-azul text-center">Accion</th>
 </tr>
 </thead>
 <tbody>
 {evaluados.map(ev => (
 <tr key={ev.id} className="border-b border-inst-borde hover:bg-inst-gris/30">
 <td className="px-3 py-2 text-inst-texto">{ev.documento}</td>
 <td className="px-3 py-2 text-inst-texto">{ev.nombre_completo}</td>
 <td className="px-3 py-2 text-inst-texto">{ev.denominacion}</td>
 <td className="px-3 py-2 text-inst-texto">{ev.grado}</td>
 <td className="px-3 py-2 text-inst-texto">{ev.periodo_nombre}</td>
 <td className="px-3 py-2 text-center">
 <button
 onClick={() => seleccionarEvaluado(ev)}
 className="edl-btn-primary text-xs flex items-center gap-1 mx-auto"
 >
 <span className="material-icons text-sm">add</span>
 Concertar
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 )}

 {/* ===== ALERTA INICIAL ===== */}
 {showAlerta && evaluado && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
 <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 text-center">
 <span className="material-icons text-4xl text-yellow-500 mb-2">warning</span>
 <h3 className="font-heading font-bold text-inst-azul mb-2">Recuerde</h3>
 <p className="text-sm text-inst-texto">
 El evaluado <strong>{evaluado.primer_nombre}</strong> requiere minimo <strong>1</strong> y maximo <strong>5</strong> compromisos funcionales, y entre <strong>3</strong> y <strong>5</strong> competencias comportamentales. Los pesos funcionales deben sumar <strong>100%</strong>.
 </p>
 <button onClick={() => setShowAlerta(false)} className="edl-btn-primary mt-4 text-sm">
 Entendido
 </button>
 </div>
 </div>
 )}

 {/* ===== CONTENIDO PRINCIPAL (solo si hay evaluado seleccionado) ===== */}
 {evaluado && (
 <>
 {/* Header con datos del evaluado */}
 <div className="edl-card mb-6">
 <div className="flex items-center justify-between">
 <div>
 <div className="flex items-center gap-3">
 <button
 onClick={() => { setEvaluado(null); setFuncionales([]); setComportamentales([]); setConcertacionConfirmada(false); }}
 className="p-1.5 rounded hover:bg-inst-gris text-inst-texto-claro"
 title="Buscar otro evaluado"
 >
 <span className="material-icons text-lg">arrow_back</span>
 </button>
 <h3 className="font-heading font-bold text-inst-azul">
 Concertacion para: {evaluado.nombre_completo}
 </h3>
 </div>
 <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
 <div><span className="text-inst-texto-claro">Documento:</span> <span className="font-medium text-inst-texto">{evaluado.documento}</span></div>
 <div><span className="text-inst-texto-claro">Empleo:</span> <span className="font-medium text-inst-texto">{evaluado.denominacion}</span></div>
 <div><span className="text-inst-texto-claro">Grado:</span> <span className="font-medium text-inst-texto">{evaluado.grado}</span></div>
 <div><span className="text-inst-texto-claro">Periodo:</span> <span className="font-medium text-inst-texto">{evaluado.periodo_nombre}</span></div>
 </div>
 </div>

 {/* Boton ver compromisos propuestos por el evaluado */}
 <button
 onClick={verCompromisosPropuestos}
 className="edl-btn-secondary flex items-center gap-2 text-xs"
 >
 <span className="material-icons text-sm">rate_review</span>
 Ver compromisos propuestos por el evaluado
 </button>
 </div>

 {/* Aviso de bloqueo */}
 {concertacionConfirmada && (
 <div className="mb-4 p-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 text-yellow-800">
 <p className="text-sm font-medium">Concertacion confirmada. No puede editar los compromisos hasta que el evaluado acepte o rechace.</p>
 </div>
 )}
 </div>

 {loading ? (
 <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando datos...</div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* PERIODO */}
 <div className="edl-card">
 <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
 <span className="material-icons">calendar_today</span>
 Periodo
 </h3>
 <div className="space-y-4">
 <div>
 <label className="edl-label">Seleccione un periodo</label>
 <select
 value={periodoId}
 onChange={e => setPeriodoId(Number(e.target.value))}
 className="edl-input"
 disabled={concertacionConfirmada}
 >
 <option value={0}>--</option>
 {periodos.map(p => (
 <option key={p.id} value={p.id}>{p.nombre}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" checked={aplicaComision} onChange={e => setAplicaComision(e.target.checked)} className="w-4 h-4 accent-inst-azul" disabled={concertacionConfirmada} />
 <div>
 <span className="text-sm font-medium text-inst-texto">Aplica comision evaluadora?</span>
 </div>
 </label>
 {aplicaComision && (
 <div className="mt-3 pl-6 border-l-2 border-inst-azul/20">
 <label className="edl-label">Seleccione un integrante</label>
 <select value={comisionSeleccionada} onChange={e => setComisionSeleccionada(Number(e.target.value))} className="edl-input" disabled={concertacionConfirmada}>
 <option value={0}>Seleccione un integrante</option>
 {usuariosComision.map(u => (
 <option key={u.id} value={u.id}>{u.nombre}</option>
 ))}
 </select>
 </div>
 )}
 </div>

 <div>
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" checked={noEsJefe} onChange={e => { setNoEsJefe(e.target.checked); if (!e.target.checked) setMotivoCambio(''); }} className="w-4 h-4 accent-inst-azul" disabled={concertacionConfirmada} />
 <div>
 <span className="text-sm font-medium text-inst-texto">No es el jefe inmediato?</span>
 </div>
 </label>
 {noEsJefe && (
 <div className="mt-3 pl-6 border-l-2 border-inst-azul/20">
 <label className="edl-label">Motivo cambio evaluador</label>
 <select value={motivoCambio} onChange={e => setMotivoCambio(e.target.value)} className="edl-input" disabled={concertacionConfirmada}>
 <option value="">-- Seleccione un motivo --</option>
 <option value="retiro_empleado">Retiro del empleado responsable de evaluar</option>
 <option value="impedimento">Impedimento</option>
 <option value="recusacion">Recusacion</option>
 </select>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* COMPROMISOS */}
 <div className="lg:col-span-2 space-y-6">
 {/* Compromisos funcionales */}
 <div className="edl-card">
 <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
 <span className="material-icons">work</span>
 Compromisos funcionales
 </h3>

 {!concertacionConfirmada && (
 <button onClick={() => openModalFuncional(null)} className="edl-btn-primary flex items-center gap-2 mb-4" disabled={funcionales.length >= 5}>
 <span className="material-icons text-lg">add</span>
 Ingresar compromiso funcional
 </button>
 )}

 {funcionales.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-inst-azul/5 text-left">
 <th className="px-3 py-2 font-medium text-inst-azul">Meta</th>
 <th className="px-3 py-2 font-medium text-inst-azul">Compromiso</th>
 <th className="px-3 py-2 font-medium text-inst-azul text-center">Peso</th>
 <th className="px-3 py-2 font-medium text-inst-azul text-center">Acciones</th>
 </tr>
 </thead>
 <tbody>
 {funcionales.map((f, idx) => (
 <tr key={idx} className="border-b border-inst-borde">
 <td className="px-3 py-2 text-inst-texto">{f.meta_nombre}</td>
 <td className="px-3 py-2 text-inst-texto">{f.descripcion}</td>
 <td className="px-3 py-2 text-center font-semibold">{f.peso}%</td>
 <td className="px-3 py-2 text-center">
 {!concertacionConfirmada && (
 <div className="flex items-center justify-center gap-1">
 <button onClick={() => openModalFuncional(idx)} className="p-1 rounded hover:bg-inst-gris text-inst-azul" title="Editar">
 <span className="material-icons text-lg">edit</span>
 </button>
 <button onClick={() => eliminarFuncional(idx)} className="p-1 rounded hover:bg-red-50 text-red-500" title="Eliminar">
 <span className="material-icons text-lg">delete</span>
 </button>
 </div>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 <tfoot>
 <tr className="bg-inst-azul/5">
 <td colSpan={2} className="px-3 py-2 font-semibold text-inst-azul text-right">Total pesos:</td>
 <td className="px-3 py-2 text-center font-bold text-inst-azul">{sumaPesosFuncionales}%</td>
 <td></td>
 </tr>
 </tfoot>
 </table>
 {Math.abs(sumaPesosFuncionales - 100) > 0.01 && sumaPesosFuncionales > 0 && (
 <div className={`mt-2 p-2 rounded text-xs font-medium ${
 sumaPesosFuncionales > 100 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
 }`}>
 {sumaPesosFuncionales > 100
 ? `La suma de los pesos excede 100% (${sumaPesosFuncionales}%)`
 : `La suma de los pesos es menor a 100% (${sumaPesosFuncionales}%)`
 }
 </div>
 )}
 </div>
 ) : (
 <p className="text-sm text-inst-texto-claro text-center py-4">No hay compromisos funcionales registrados</p>
 )}
 </div>

 {/* Compromisos comportamentales */}
 <div className="edl-card">
 <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
 <span className="material-icons">psychology</span>
 Compromisos comportamentales
 </h3>

 <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
 <p className="text-xs text-yellow-800">
 Las competencias comportamentales se seleccionan del catalogo del <strong>Decreto 2539 de 2005</strong> o <strong>Decreto 815 de 2018</strong>, segun corresponda.
 </p>
 </div>

 {!concertacionConfirmada && (
 <button onClick={() => setShowModalComportamental(true)} className="edl-btn-primary flex items-center gap-2 mb-4" disabled={comportamentales.length >= 5}>
 <span className="material-icons text-lg">add</span>
 Ingresar compromiso comportamental
 </button>
 )}

 {comportamentales.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-inst-azul/5 text-left">
 <th className="px-3 py-2 font-medium text-inst-azul">Competencia</th>
 <th className="px-3 py-2 font-medium text-inst-azul text-center">Propuesto por jefe?</th>
 <th className="px-3 py-2 font-medium text-inst-azul text-center">Acciones</th>
 </tr>
 </thead>
 <tbody>
 {comportamentales.map((c, idx) => (
 <tr key={idx} className="border-b border-inst-borde">
 <td className="px-3 py-2 text-inst-texto">
 {c.competencia_nombre}
 <span className="text-xs text-inst-texto-claro ml-1">({c.decreto === '2539/2005' ? 'D.2539/2005' : 'D.815/2018'})</span>
 </td>
 <td className="px-3 py-2 text-center">
 <input type="checkbox" checked={c.es_propuesto_jefe} onChange={e => {
 if (concertacionConfirmada) return;
 const nuevos = [...comportamentales];
 nuevos[idx] = { ...nuevos[idx], es_propuesto_jefe: e.target.checked };
 setComportamentales(nuevos);
 }} className="w-4 h-4 accent-inst-azul" disabled={concertacionConfirmada} />
 </td>
 <td className="px-3 py-2 text-center">
 {!concertacionConfirmada && (
 <button onClick={() => eliminarComportamental(idx)} className="p-1 rounded hover:bg-red-50 text-red-500" title="Eliminar">
 <span className="material-icons text-lg">delete</span>
 </button>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <p className="text-sm text-inst-texto-claro text-center py-4">No hay compromisos comportamentales registrados</p>
 )}
 </div>

 {/* Tipo de concertacion */}
 <div className="edl-card">
 <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
 <span className="material-icons">handshake</span>
 Tipo de concertacion
 </h3>
 <div className="space-y-2">
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="radio" name="tipoConcertacion" checked={tipoConcertacion === 'concertacion_evaluador_evaluado'} onChange={() => setTipoConcertacion('concertacion_evaluador_evaluado')} className="w-4 h-4 accent-inst-azul" disabled={concertacionConfirmada} />
 <span className="text-sm text-inst-texto">Concertacion por parte del Evaluador y el Evaluado</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="radio" name="tipoConcertacion" checked={tipoConcertacion === 'fijados_evaluador'} onChange={() => setTipoConcertacion('fijados_evaluador')} className="w-4 h-4 accent-inst-azul" disabled={concertacionConfirmada} />
 <span className="text-sm text-inst-texto">Fijados por el Evaluador</span>
 </label>
 </div>
 </div>

 {/* Boton confirmar */}
 {!concertacionConfirmada && (
 <div className="flex items-center gap-4">
 <button onClick={confirmarConcertacion} disabled={saving} className="edl-btn-primary flex items-center gap-2 px-6 py-3">
 <span className="material-icons text-lg">check_circle</span>
 {saving ? 'Confirmando...' : 'Confirmar Concertacion'}
 </button>
 <button onClick={() => { setEvaluado(null); setFuncionales([]); setComportamentales([]); }} className="edl-btn-secondary">
 Cancelar
 </button>
 </div>
 )}

 {/* Mensaje */}
 {mensaje && (
 <div className={`p-3 rounded-lg border-l-4 ${
 mensaje.tipo === 'ok' ? 'border-green-500 bg-green-50 text-green-800' :
 mensaje.tipo === 'warn' ? 'border-yellow-500 bg-yellow-50 text-yellow-800' :
 'border-red-500 bg-red-50 text-red-800'
 }`}>
 <p className="text-sm">{mensaje.texto}</p>
 </div>
 )}
 </div>
 </div>
 )}
 </>
 )}

 {/* ===== MODAL: Compromiso funcional ===== */}
 {showModalFuncional && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
 <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
 <h3 className="font-heading font-bold text-inst-azul mb-4">
 {funcionalEditIndex !== null ? 'Editar' : 'Registrar'} compromiso funcional
 </h3>
 <div className="space-y-4">
 <div>
 <label className="edl-label">Meta *</label>
 <select value={fMetaId} onChange={e => setFMetaId(Number(e.target.value))} className="edl-input">
 <option value={0}>Seleccione la Meta a la cual desea asociar el compromiso</option>
 {metas.map(m => (
 <option key={m.id} value={m.id}>{m.descripcion}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="edl-label">Compromiso *</label>
 <textarea value={fDescripcion} onChange={e => setFDescripcion(e.target.value)} className="edl-input min-h-[80px]" placeholder="Digite el compromiso a concertar" />
 <p className="text-xs text-inst-texto-claro mt-1 bg-blue-50 p-2 rounded">
 Nota: El compromiso se debe formular como: <strong>Verbo + Objeto + Condicion de resultado</strong>
 </p>
 </div>
 <div>
 <label className="edl-label">Peso *</label>
 <input type="number" value={fPeso || ''} onChange={e => setFPeso(Number(e.target.value))} className="edl-input" placeholder="Ingrese el peso (1-100)" min={1} max={100} />
 </div>
 </div>
 <div className="flex gap-3 mt-6">
 <button onClick={guardarFuncional} className="edl-btn-primary">Guardar</button>
 <button onClick={() => setShowModalFuncional(false)} className="edl-btn-secondary">Cancelar</button>
 </div>
 </div>
 </div>
 )}

 {/* ===== MODAL: Compromiso comportamental ===== */}
 {showModalComportamental && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
 <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
 <h3 className="font-heading font-bold text-inst-azul mb-4">
 Seleccionar competencias comportamentales
 </h3>
 <p className="text-xs text-inst-texto-claro mb-4">
 Seleccione entre 3 y 5 competencias ({selectedCompetencias.length} seleccionadas)
 </p>

 <h4 className="text-sm font-bold text-inst-azul mb-2">Decreto 2539 de 2005</h4>
 <div className="space-y-2 mb-4">
 {competencias.filter(c => c.decreto === '2539/2005').map(c => (
 <label key={c.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-inst-gris">
 <input type="checkbox" checked={selectedCompetencias.includes(c.id)} onChange={() => toggleCompetencia(c.id)} className="w-4 h-4 accent-inst-azul" />
 <div className="flex-1">
 <span className="text-sm font-medium text-inst-texto">{c.nombre}</span>
 {c.descripcion && <p className="text-xs text-inst-texto-claro">{c.descripcion}</p>}
 </div>
 {selectedCompetencias.includes(c.id) && (
 <label className="flex items-center gap-1 text-xs text-inst-texto-claro">
 <input type="checkbox" checked={propuestoJefeMap[c.id] || false} onChange={e => setPropuestoJefeMap({ ...propuestoJefeMap, [c.id]: e.target.checked })} className="w-3 h-3 accent-inst-azul" />
 Propuesto por jefe
 </label>
 )}
 </label>
 ))}
 </div>

 <h4 className="text-sm font-bold text-inst-azul mb-2">Decreto 815 de 2018</h4>
 <div className="space-y-2 mb-4">
 {competencias.filter(c => c.decreto === '815/2018').map(c => (
 <label key={c.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-inst-gris">
 <input type="checkbox" checked={selectedCompetencias.includes(c.id)} onChange={() => toggleCompetencia(c.id)} className="w-4 h-4 accent-inst-azul" />
 <div className="flex-1">
 <span className="text-sm font-medium text-inst-texto">{c.nombre}</span>
 {c.descripcion && <p className="text-xs text-inst-texto-claro">{c.descripcion}</p>}
 </div>
 {selectedCompetencias.includes(c.id) && (
 <label className="flex items-center gap-1 text-xs text-inst-texto-claro">
 <input type="checkbox" checked={propuestoJefeMap[c.id] || false} onChange={e => setPropuestoJefeMap({ ...propuestoJefeMap, [c.id]: e.target.checked })} className="w-3 h-3 accent-inst-azul" />
 Propuesto por jefe
 </label>
 )}
 </label>
 ))}
 </div>

 <div className="flex gap-3 mt-4 pt-4 border-t">
 <button onClick={guardarComportamentales} disabled={selectedCompetencias.length < 3} className="edl-btn-primary">
 Guardar competencias seleccionadas
 </button>
 <button onClick={() => { setShowModalComportamental(false); setSelectedCompetencias([]); }} className="edl-btn-secondary">
 Cancelar
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ===== MODAL: Compromisos propuestos por el evaluado ===== */}
 {showModalPropuestos && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
 <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
 <h3 className="font-heading font-bold text-inst-azul mb-4">
 Compromisos propuestos por el evaluado
 </h3>

 {compromisosPropuestos.length === 0 ? (
 <p className="text-sm text-inst-texto-claro text-center py-4">El evaluado no ha propuesto compromisos.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-inst-azul/5 text-left">
 <th className="px-3 py-2 font-medium text-inst-azul">Tipo</th>
 <th className="px-3 py-2 font-medium text-inst-azul">Descripcion</th>
 <th className="px-3 py-2 font-medium text-inst-azul text-center">Peso</th>
 </tr>
 </thead>
 <tbody>
 {compromisosPropuestos.map(cp => (
 <tr key={cp.id} className="border-b border-inst-borde">
 <td className="px-3 py-2">
 <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
 cp.tipo === 'comportamental' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
 }`}>
 {cp.tipo === 'comportamental' ? 'Comportamental' : 'Funcional'}
 </span>
 </td>
 <td className="px-3 py-2 text-inst-texto">{cp.descripcion}</td>
 <td className="px-3 py-2 text-center">{cp.peso ? `${cp.peso}%` : '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 <div className="mt-4 pt-4 border-t">
 <button onClick={() => setShowModalPropuestos(false)} className="edl-btn-secondary">
 Cerrar
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
