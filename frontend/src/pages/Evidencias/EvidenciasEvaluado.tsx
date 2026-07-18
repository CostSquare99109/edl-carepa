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
 archivo_nombre?: string | null;
 archivo_mime?: string | null;
 archivo_tamano?: number | null;
}

interface Periodo {
 id: number;
 nombre: string;
 estado: string;
}

interface Evaluacion {
 id: number;
 tipo: string;
 estado: string;
 periodo_id: number;
}

const TIPO_EVALUACION_LABEL: Record<string, string> = {
 parcial_primer_semestre: '1er Semestre',
 parcial_segundo_semestre: '2do Semestre',
 parcial_eventual: 'Parcial Eventual',
 calificacion_definitiva: 'Calificación Definitiva',
 calificacion_extraordinaria: 'Calificación Extraordinaria',
};

const ALLOWED_MIMES = [
 'application/pdf',
 'application/msword',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'application/vnd.ms-excel',
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'image/jpeg',
 'image/png',
 'image/gif',
 'image/webp',
];

const ALLOWED_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number): string {
 if (bytes < 1024) return `${bytes} B`;
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
 return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function EvidenciasEvaluado() {
 const { usuario } = useAuth();
 const [periodos, setPeriodos] = useState<Periodo[]>([]);
 const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number>(0);
 const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
 const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<number>(0);
 const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
 const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 // Contadores de evidencias por tipo (para bloqueo visual)
 const [conteoFuncionales, setConteoFuncionales] = useState(0);
 const [conteoComportamentales, setConteoComportamentales] = useState(0);
 const [bloqueadoTotal, setBloqueadoTotal] = useState(false);

 // Formulario
 const [compromisoSeleccionado, setCompromisoSeleccionado] = useState<number>(0);
 const [descripcion, setDescripcion] = useState('');
 const [ubicacion, setUbicacion] = useState('');
 const [observacion, setObservacion] = useState('');
 const [archivo, setArchivo] = useState<File | null>(null);
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
 // Por defecto, ningun periodo seleccionado. El usuario debe elegir.
 setPeriodoSeleccionado(0);
 setLoading(false);
 } catch {
 setLoading(false);
 }
 }

 // Cargar evaluaciones del evaluado cuando cambia el periodo
 useEffect(() => {
 if (periodoSeleccionado > 0 && usuario?.id) {
 cargarEvaluaciones();
 } else {
 setEvaluaciones([]);
 setEvaluacionSeleccionada(0);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [periodoSeleccionado, usuario?.id]);

 async function cargarEvaluaciones() {
 try {
 const res = await api.get<any>(`/evaluaciones/mias?periodo_id=${periodoSeleccionado}&por_pagina=100`);
 const evs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
 const filtered = evs.filter((e: Evaluacion) => e.periodo_id === periodoSeleccionado);
 setEvaluaciones(filtered);
 // Por defecto, ninguna evaluacion seleccionada. El usuario debe elegir.
 setEvaluacionSeleccionada(0);
 // Reset contadores al cambiar periodo
 setConteoFuncionales(0);
 setConteoComportamentales(0);
 setBloqueadoTotal(false);
 } catch {
 setEvaluaciones([]);
 setEvaluacionSeleccionada(0);
 setConteoFuncionales(0);
 setConteoComportamentales(0);
 setBloqueadoTotal(false);
 }
 }

 // Cargar compromisos + evidencias cuando cambia periodo o evaluacion seleccionada
 useEffect(() => {
 if (periodoSeleccionado > 0 && usuario?.id && evaluacionSeleccionada > 0) {
 cargarCompromisosYEvidencias();
 } else {
 setCompromisos([]);
 setEvidencias([]);
 setConteoFuncionales(0);
 setConteoComportamentales(0);
 setBloqueadoTotal(false);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [periodoSeleccionado, evaluacionSeleccionada, usuario?.id]);

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

 // Actualizar contadores para bloqueo visual
 let func = 0;
 let comp = 0;
 for (const ev of evList) {
 const c = compromisos.find(c => c.id === ev.compromiso_id);
 if (c?.tipo === 'funcional') func++;
 else if (c?.tipo === 'comportamental') comp++;
 }
 setConteoFuncionales(func);
 setConteoComportamentales(comp);
 setBloqueadoTotal(func >= 3 && comp >= 3);
 } catch {
 setCompromisos([]);
 setEvidencias([]);
 setConteoFuncionales(0);
 setConteoComportamentales(0);
 setBloqueadoTotal(false);
 } finally {
 setLoading(false);
 }
 }

 function resetForm() {
 setDescripcion('');
 setUbicacion('');
 setObservacion('');
 setArchivo(null);
 setCompromisoSeleccionado(0);
 setEditandoId(null);
 setMensaje(null);
 // Limpiar input file
 const fileInput = document.getElementById('archivo-evidencia') as HTMLInputElement | null;
 if (fileInput) fileInput.value = '';
 }

 function editarEvidencia(ev: Evidencia) {
 // Politica: una vez guardada, la evidencia NO se puede editar.
 // Mostramos mensaje informativo y NO permitimos la edicion.
 setMensaje({
 tipo: 'error',
 texto: 'Las evidencias registradas no se pueden editar. Si requiere ajustar informacion, contacte al administrador.',
 });
 return;
 }

 function onArchivoChange(e: React.ChangeEvent<HTMLInputElement>) {
 const file = e.target.files?.[0] || null;
 if (!file) {
 setArchivo(null);
 return;
 }
 const ext = (file.name.split('.').pop() || '').toLowerCase();
 if (!ALLOWED_EXTS.includes(ext) && !ALLOWED_MIMES.includes(file.type)) {
 setMensaje({
 tipo: 'error',
 texto: `Tipo de archivo no permitido. Use: ${ALLOWED_EXTS.join(', ').toUpperCase()}`,
 });
 e.target.value = '';
 setArchivo(null);
 return;
 }
 if (file.size > MAX_FILE_SIZE) {
 setMensaje({
 tipo: 'error',
 texto: `Archivo demasiado grande (${formatBytes(file.size)}). Maximo permitido: ${formatBytes(MAX_FILE_SIZE)}.`,
 });
 e.target.value = '';
 setArchivo(null);
 return;
 }
 setArchivo(file);
 setMensaje(null);
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
 if (!archivo && !editandoId) {
 setMensaje({ tipo: 'error', texto: 'El archivo de soporte es obligatorio.' });
 return;
 }

 setSaving(true);
 setMensaje(null);

 try {
 const formData = new FormData();
 formData.append('compromiso_id', String(compromisoSeleccionado));
 formData.append('periodo_id', String(periodoSeleccionado));
 if (evaluacionSeleccionada > 0) {
 formData.append('evaluacion_id', String(evaluacionSeleccionada));
 }
 formData.append('descripcion', descripcion.trim());
 formData.append('ubicacion', ubicacion.trim());
 if (observacion.trim()) formData.append('observacion', observacion.trim());
 formData.append('tipo', compromisos.find(c => c.id === compromisoSeleccionado)?.tipo === 'comportamental' ? 'competencia' : 'compromiso');
 if (archivo) formData.append('archivo', archivo);

 if (editandoId) {
 await api.putFormData(`/evidencias/${editandoId}`, formData);
 setMensaje({ tipo: 'ok', texto: 'Evidencia actualizada correctamente.' });
 } else {
 await api.postFormData('/evidencias', formData);
 setMensaje({ tipo: 'ok', texto: 'Evidencia registrada correctamente.' });
 }
 resetForm();
 cargarCompromisosYEvidencias();
 } catch (err: unknown) {
 let msg = err instanceof Error ? err.message : 'Error al guardar.';

 // Mapear códigos de error del backend a mensajes amigables
 if (msg.includes('409') || msg.includes('duplicado') || msg.includes('Duplicate')) {
 msg = 'Ya existe una evidencia registrada para este compromiso en este periodo. No se permiten duplicados.';
 } else if (msg.includes('422') || msg.includes('limite') || msg.includes('limite')) {
 if (msg.includes('funcional')) {
 msg = 'Ya ha alcanzado el limite de 3 evidencias funcionales para este periodo. No puede registrar mas.';
 } else if (msg.includes('comportamental')) {
 msg = 'Ya ha alcanzado el limite de 3 evidencias comportamentales para este periodo. No puede registrar mas.';
 } else if (msg.includes('6 evidencias') || msg.includes('completado las 6')) {
 msg = 'Ya ha completado las 6 evidencias requeridas (3 funcionales + 3 comportamentales) para este periodo. No puede agregar mas.';
 } else {
 msg = 'No se puede registrar la evidencia: ' + msg.replace('422', '').trim();
 }
 }

 setMensaje({ tipo: 'error', texto: msg });
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

 function descargarArchivo(ev: Evidencia) {
 if (!ev.archivo_nombre) return;
 const token = localStorage.getItem('edl_token') || '';
 const url = `/api/v1/evidencias/archivo/${ev.id}?token=${encodeURIComponent(token)}`;
 window.open(url, '_blank');
 }

 // Helper para renderizar cuando hay periodo y evaluacion seleccionados
 function renderConPeriodoYEvaluacion() {
 return (
 <>
  {/* Contadores de progreso */}
  <div className="edl-card mb-6 p-4">
  <h3 className="font-semibold text-inst-azul mb-3 flex items-center gap-2">
   <span className="material-icons text-lg">check_circle</span>
   Progreso de Evidencias (Periodo seleccionado)
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
   <div className={`p-3 rounded-lg border ${conteoFuncionales >= 3 ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'}`}>
    <div className="text-xs text-inst-texto-claro uppercase tracking-wide">Evidencias Funcionales</div>
    <div className="flex items-center gap-2 mt-1">
     <span className="text-2xl font-bold text-inst-azul">{conteoFuncionales} / 3</span>
     {conteoFuncionales >= 3 && <span className="material-icons text-green-600">check_circle</span>}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
     <div className="bg-blue-600 h-2 rounded-full transition-all" style={{width: `${Math.min((conteoFuncionales / 3) * 100, 100)}%`}} />
    </div>
    {conteoFuncionales >= 3 && <p className="text-xs text-green-700 mt-1">Limite alcanzado</p>}
   </div>
   <div className={`p-3 rounded-lg border ${conteoComportamentales >= 3 ? 'bg-green-50 border-green-300' : 'bg-purple-50 border-purple-300'}`}>
    <div className="text-xs text-inst-texto-claro uppercase tracking-wide">Evidencias Comportamentales</div>
    <div className="flex items-center gap-2 mt-1">
     <span className="text-2xl font-bold text-inst-azul">{conteoComportamentales} / 3</span>
     {conteoComportamentales >= 3 && <span className="material-icons text-green-600">check_circle</span>}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
     <div className="bg-purple-600 h-2 rounded-full transition-all" style={{width: `${Math.min((conteoComportamentales / 3) * 100, 100)}%`}} />
    </div>
    {conteoComportamentales >= 3 && <p className="text-xs text-green-700 mt-1">Limite alcanzado</p>}
   </div>
   <div className={`p-3 rounded-lg border ${bloqueadoTotal ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-300'}`}>
    <div className="text-xs text-inst-texto-claro uppercase tracking-wide">Total Completado</div>
    <div className="flex items-center gap-2 mt-1">
     <span className="text-2xl font-bold text-inst-azul">{conteoFuncionales + conteoComportamentales} / 6</span>
     {bloqueadoTotal && <span className="material-icons text-red-600">block</span>}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
     <div className={`${bloqueadoTotal ? 'bg-red-600' : 'bg-green-600'} h-2 rounded-full transition-all`} style={{width: `${Math.min(((conteoFuncionales + conteoComportamentales) / 6) * 100, 100)}%`}} />
    </div>
    {bloqueadoTotal ? (
     <p className="text-xs text-red-700 mt-1 font-medium">
      <span className="material-icons text-xs align-middle mr-1">warning</span>
      Ya completó las 6 evidencias requeridas. No puede agregar mas.
     </p>
    ) : (
     <p className="text-xs text-inst-texto-claro mt-1">Faltan {6 - (conteoFuncionales + conteoComportamentales)} evidencias</p>
    )}
   </div>
  </div>
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
      disabled={!evaluacionSeleccionada || compromisos.length === 0}
     >
      <option value={0}>
       {compromisos.length === 0 ? 'Sin compromisos concertados' : 'Seleccione...'}
      </option>
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

    <div>
     <label className="edl-label">
      Archivo de soporte (PDF, Word, imagen) *
     </label>
     <input
      id="archivo-evidencia"
      type="file"
      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
      onChange={onArchivoChange}
      className="edl-input text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-inst-azul-osc file:text-white file:cursor-pointer hover:file:bg-inst-azul"
      required
     />
     {archivo && (
      <p className="text-xs text-inst-texto-claro mt-1">
       <span className="material-icons text-xs align-middle">attach_file</span> {archivo.name} ({formatBytes(archivo.size)})
      </p>
     )}
     <p className="text-xs text-inst-texto-claro mt-1">
      Obligatorio. Formatos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, WEBP. Máximo 10 MB.
     </p>
    </div>

    <div className="flex gap-3">
     <button
      onClick={guardarEvidencia}
      disabled={saving || !compromisoSeleccionado || !descripcion.trim() || !ubicacion.trim() || !evaluacionSeleccionada || !archivo || bloqueadoTotal}
      className="edl-btn-primary flex items-center gap-2 disabled:opacity-50"
     >
      <span className="material-icons text-sm">save</span>
      {saving ? 'Guardando...' : bloqueadoTotal ? 'Completado (6/6)' : 'Registrar Evidencia'}
     </button>
     {bloqueadoTotal && (
      <span className="flex items-center text-xs text-red-600 self-center px-2">
       <span className="material-icons text-sm mr-1">block</span>
       Evidencias completadas (6/6)
      </span>
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
        <th className="text-left py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Archivo</th>
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
          {ev.archivo_nombre ? (
           <button
            onClick={() => descargarArchivo(ev)}
            className="text-inst-azul hover:text-inst-azul-osc underline flex items-center gap-1"
            title="Descargar archivo"
           >
            <span className="material-icons text-sm">download</span>
            {ev.archivo_nombre.length > 20 ? ev.archivo_nombre.substring(0, 18) + '...' : ev.archivo_nombre}
           </button>
          ) : (
           '-'
          )}
         </td>
         <td className="py-2.5 px-3 text-inst-texto-claro text-xs">
          {new Date(ev.creado_en).toLocaleDateString('es-CO', {
           year: 'numeric', month: 'short', day: 'numeric',
          })}
         </td>
         <td className="py-2.5 px-3 text-center">
          <span
           className="material-icons text-sm text-inst-texto-claro/50 cursor-not-allowed"
           title="Las evidencias no se pueden editar una vez guardadas"
          >
           lock
          </span>
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   )}
   </div>
  </div>
 </>
 );
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
 <p className="font-medium text-inst-texto">{usuario?.primer_nombre} {usuario?.primer_apellido}</p>
 </div>
 <div>
 <span className="text-inst-texto-claro text-xs">Documento</span>
 <p className="font-medium text-inst-texto">{usuario?.documento}</p>
 </div>
 <div>
 <span className="text-inst-texto-claro text-xs">Empleo/Cargo</span>
 <p className="font-medium text-inst-texto">{usuario?.denominacion_empleo || '-'}</p>
 </div>
 </div>
 </div>

 {/* Selectores: Periodo + Tipo de evaluacion */}
 <div className="edl-card mb-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="edl-label">Periodo de Evaluación *</label>
 <select
 value={periodoSeleccionado}
 onChange={e => setPeriodoSeleccionado(Number(e.target.value))}
 className="edl-input"
 >
 <option value={0}>Seleccione...</option>
 {periodos.map(p => (
 <option key={p.id} value={p.id}>{p.nombre} {p.estado === 'cerrado' ? '(cerrado)' : ''}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="edl-label">Tipo de Evaluación *</label>
 <select
 value={evaluacionSeleccionada}
 onChange={e => setEvaluacionSeleccionada(Number(e.target.value))}
 className="edl-input"
 disabled={evaluaciones.length === 0}
 >
 {evaluaciones.length === 0 ? (
 <option value={0}>Sin evaluaciones para este periodo</option>
 ) : (
 <>
 <option value={0}>Seleccione...</option>
 {evaluaciones.map(ev => (
 <option key={ev.id} value={ev.id}>
 {TIPO_EVALUACION_LABEL[ev.tipo] || ev.tipo} ({ev.estado})
 </option>
 ))}
 </>
 )}
 </select>
 </div>
 </div>
 </div>

 {periodoSeleccionado > 0 && evaluacionSeleccionada > 0 ? renderConPeriodoYEvaluacion() : null}
 </div>
 );
}