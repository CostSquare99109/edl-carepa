import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Compromiso {
  id: number;
  tipo: string; // 'funcional' | 'comportamental'
  descripcion: string;
  estado: string;
}

interface Evidencia {
  id: number;
  compromiso_id: number;
  descripcion: string;
  ubicacion: string | null;
  observacion: string | null;
  tipo: string; // 'compromiso' | 'competencia'
  creado_en: string;
  archivo_nombre?: string | null;
}

interface Periodo { id: number; nombre: string; estado: string; }
interface Evaluacion { id: number; tipo: string; estado: string; periodo_id: number; }

interface MisCompromisosResponse {
  funcionales: Compromiso[];
  comportamentales: Compromiso[];
  total_funcionales: number;
  total_comportamentales: number;
  total: number;
}

const TIPO_LABEL: Record<string, string> = {
  parcial_primer_semestre: '1er Semestre',
  parcial_segundo_semestre: '2do Semestre',
};

const ALLOWED_EXTS = ['pdf','doc','docx','xls','xlsx','jpg','jpeg','png','gif','webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

function getCompromisoLabel(c: Compromiso): string {
  return c.descripcion.length > 72
    ? c.descripcion.substring(0, 70) + '…'
    : c.descripcion;
}

export default function EvidenciasEvaluado() {
  const { usuario } = useAuth();
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoId, setPeriodoId] = useState(0);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [evaluacionId, setEvaluacionId] = useState(0);
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar mis compromisos del periodo (funcionales + comportamentales)
  const [misCompromisos, setMisCompromisos] = useState<MisCompromisosResponse | null>(null);

  // Contexto de evaluación actual
  const evalObj = evaluaciones.find(e => e.id === evaluacionId);
  const esTerminal = evalObj
    ? ['calificada', 'aprobada_comision', 'anulada', 'cerrada'].includes(evalObj.estado)
    : false;

  // Conteo dinámico de compromisos reales del evaluado
  const maxFunc = misCompromisos?.total_funcionales ?? 0;
  const maxComp = misCompromisos?.total_comportamentales ?? 0;
  const maxTotal = maxFunc + maxComp;

  // Evidencias registradas por tipo
  const funcCount = evidencias.filter(e => e.tipo === 'compromiso').length;
  const compCount = evidencias.filter(e => e.tipo === 'competencia').length;
  const totalCount = evidencias.length;
  const doneAll = maxTotal > 0 && totalCount >= maxTotal;

  // Paso actual: qué tipo toca registrar
  const pasoActual: 'funcional' | 'comportamental' | 'done' =
    esTerminal || doneAll ? 'done'
    : funcCount < maxFunc ? 'funcional'
    : 'comportamental';

  // Filtrar compromisos según paso actual
  const disponibles =
    pasoActual === 'funcional'
      ? compromisos.filter(c => c.tipo === 'funcional')
      : pasoActual === 'comportamental'
      ? compromisos.filter(c => c.tipo === 'comportamental')
      : [];

  // Ya usados por tipo
  const usadosFunc = new Set(
    evidencias.filter(e => e.tipo === 'compromiso').map(e => e.compromiso_id)
  );
  const usadosComp = new Set(
    evidencias.filter(e => e.tipo === 'competencia').map(e => e.compromiso_id)
  );

  // Descartar los que ya tienen evidencia
  const selectDisponibles = disponibles.filter(c =>
    pasoActual === 'funcional' ? !usadosFunc.has(c.id) : !usadosComp.has(c.id)
  );

  // Para cada slot, encontrar si ya tiene evidencia
  function getEvidenciaSlot(tipo: 'funcional' | 'comportamental', slot: number): Evidencia | null {
    const filtro = evidencias.filter(e =>
      tipo === 'funcional' ? e.tipo === 'compromiso' : e.tipo === 'competencia'
    );
    return filtro[slot - 1] || null;
  }

  // Generar arrays de slots dinámicos
  const slotsFunc = Array.from({ length: maxFunc }, (_, i) => i + 1);
  const slotsComp = Array.from({ length: maxComp }, (_, i) => i + 1);

  // Formulario
  const [formCompromiso, setFormCompromiso] = useState(0);
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formUbicacion, setFormUbicacion] = useState('');
  const [formObservacion, setFormObservacion] = useState('');
  const [formArchivo, setFormArchivo] = useState<File | null>(null);

  useEffect(() => { cargarPeriodos(); }, []);

  async function cargarPeriodos() {
    setLoading(true);
    try {
      const r = await api.get<any>('/periodos?por_pagina=100');
      setPeriodos(Array.isArray(r?.data) ? r.data : []);
    } catch { setPeriodos([]); }
    setLoading(false);
  }

  useEffect(() => {
    if (periodoId > 0 && usuario?.id) cargarEvaluaciones();
    else { setEvaluaciones([]); setEvaluacionId(0); }
  }, [periodoId, usuario?.id]);

  async function cargarEvaluaciones() {
    try {
      const r = await api.get<any>(`/evaluaciones/mias?periodo_id=${periodoId}&por_pagina=100`);
      const evs = Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : [];
      const filtered = evs.filter((e: Evaluacion) => 
        e.periodo_id === periodoId && 
        (e.tipo === 'parcial_primer_semestre' || e.tipo === 'parcial_segundo_semestre')
      );
      setEvaluaciones(filtered);
      setEvaluacionId(0);
    } catch { setEvaluaciones([]); setEvaluacionId(0); }
  }

  useEffect(() => {
    if (periodoId > 0 && evaluacionId > 0 && usuario?.id) {
      cargarTodo();
    } else {
      setCompromisos([]);
      setEvidencias([]);
      setMisCompromisos({ funcionales: [], comportamentales: [], total_funcionales: 0, total_comportamentales: 0, total: 0 });
    }
  }, [periodoId, evaluacionId, usuario?.id]);

  async function cargarTodo() {
    setLoading(true);
    try {
      const [compR, evR, misCompR] = await Promise.all([
        api.get<any>(`/compromisos/mis-compromisos?periodo_id=${periodoId}`)
          .catch(() => ({ funcionales: [], comportamentales: [], total_funcionales: 0, total_comportamentales: 0, total: 0 })),
        api.get<any>(`/evidencias?periodo_id=${periodoId}&por_pagina=100`).catch(() => []),
        api.get<any>(`/compromisos/mis-compromisos?periodo_id=${periodoId}`)
          .catch(() => ({ funcionales: [], comportamentales: [], total_funcionales: 0, total_comportamentales: 0, total: 0 })),
      ]);

      let todos: Compromiso[] = [];
      if (compR?.funcionales && compR?.comportamentales) {
        todos = [...(compR.funcionales||[]), ...(compR.comportamentales||[])];
      } else if (Array.isArray(compR)) {
        todos = compR;
      }

      const concertados = todos.filter((c: Compromiso) =>
        ['aceptado_evaluado','aprobado','en_progreso','cumplido'].includes(c.estado)
      );
      setCompromisos(concertados);

      const evList: Evidencia[] = Array.isArray(evR?.data) ? evR.data : Array.isArray(evR) ? evR : [];
      setEvidencias(evList);

      // misCompR ya es el objeto interno (api.get devuelve json.data)
      setMisCompromisos({
        funcionales: misCompR?.funcionales || [],
        comportamentales: misCompR?.comportamentales || [],
        total_funcionales: misCompR?.total_funcionales || 0,
        total_comportamentales: misCompR?.total_comportamentales || 0,
        total: misCompR?.total || 0,
      });
    } catch {
      setCompromisos([]);
      setEvidencias([]);
      setMisCompromisos({ funcionales: [], comportamentales: [], total_funcionales: 0, total_comportamentales: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormCompromiso(0);
    setFormDescripcion('');
    setFormUbicacion('');
    setFormObservacion('');
    setFormArchivo(null);
    const fi = document.getElementById('archivo-ev') as HTMLInputElement | null;
    if (fi) fi.value = '';
  }

  function onArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (!f) { setFormArchivo(null); return; }
    const ext = (f.name.split('.').pop()||'').toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      toast.error(`Tipo no permitido: ${ALLOWED_EXTS.join(', ').toUpperCase()}`);
      e.target.value = ''; setFormArchivo(null); return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error(`Archivo muy grande (${formatBytes(f.size)}). Máx: ${formatBytes(MAX_FILE_SIZE)}.`);
      e.target.value = ''; setFormArchivo(null); return;
    }
    setFormArchivo(f);
  }

  async function guardar() {
    if (!formCompromiso) { toast.error('Seleccione un compromiso o competencia.'); return; }
    if (!formDescripcion.trim()) { toast.error('La descripción es obligatoria.'); return; }
    if (!formUbicacion.trim()) { toast.error('La ubicación es obligatoria.'); return; }
    if (!formArchivo) { toast.error('El archivo de soporte es obligatorio.'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('compromiso_id', String(formCompromiso));
      fd.append('periodo_id', String(periodoId));
      fd.append('descripcion', formDescripcion.trim());
      fd.append('ubicacion', formUbicacion.trim());
      if (formObservacion.trim()) fd.append('observacion', formObservacion.trim());
      fd.append('tipo', compromisos.find(c=>c.id===formCompromiso)?.tipo === 'comportamental' ? 'competencia' : 'compromiso');
      fd.append('archivo', formArchivo);

      await api.postFormData('/evidencias', fd);
      toast.success('Evidencia registrada correctamente.');
      resetForm();
      cargarTodo();
    } catch (err: unknown) {
      let m = err instanceof Error ? err.message : 'Error al guardar.';
      if (m.includes('409') || m.includes('Duplicate')) m = 'Ya existe una evidencia para este compromiso.';
      else if (m.includes('funcional')) m = `Ya alcanzó el límite de ${maxFunc} evidencias funcionales.`;
      else if (m.includes('comportamental')) m = `Ya alcanzó el límite de ${maxComp} evidencias comportamentales.`;
      else if (m.includes('completado')) m = `Ya completó las ${maxTotal} evidencias requeridas.`;
      toast.error(m);
    } finally { setSaving(false); }
  }

  function descargar(ev: Evidencia) {
    if (!ev.archivo_nombre) return;
    const tok = localStorage.getItem('edl_token') || '';
    window.open(`/api/v1/evidencias/archivo/${ev.id}?token=${encodeURIComponent(tok)}`, '_blank');
  }

  // ─────────────────────────────────────────────────────
  // RENDER: Slots dinámicos
  // ─────────────────────────────────────────────────────
  function renderSlot(
    tipo: 'funcional' | 'comportamental',
    slot: number,
    ev: Evidencia | null
  ) {
    const isFilled = !!ev;
    const isActive = !isFilled && !esTerminal && !doneAll && pasoActual === tipo;

    return (
      <div
        key={`${tipo}-${slot}`}
        className={`
          relative flex flex-col rounded-xl border-2 transition-all duration-300
          ${isFilled
            ? tipo === 'funcional'
              ? 'border-green-400 bg-green-50/60'
              : 'border-purple-400 bg-purple-50/60'
            : isActive
            ? tipo === 'funcional'
              ? 'border-blue-400 bg-blue-50 animate-pulse'
              : 'border-purple-400 bg-purple-50 animate-pulse'
            : 'border-dashed border-gray-300 bg-gray-50/40 opacity-60'
          }
        `}
      >
        {/* Header del slot */}
        <div className={`flex items-center gap-2 px-3 pt-3 pb-2 rounded-t-xl ${
          tipo === 'funcional' ? 'bg-blue-100/70' : 'bg-purple-100/70'
        }`}>
          <span className={`material-icons text-base ${
            isFilled ? 'text-green-600' : isActive ? (tipo==='funcional' ? 'text-blue-600' : 'text-purple-600') : 'text-gray-400'
          }`}>
            {isFilled ? 'check_circle' : isActive ? 'radio_button_checked' : 'radio_button_unchecked'}
          </span>
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isFilled ? 'text-green-700' : isActive ? (tipo==='funcional' ? 'text-blue-700' : 'text-purple-700') : 'text-gray-500'
          }`}>
            {tipo === 'funcional' ? 'Funcional' : 'Comportamental'} #{slot}
          </span>
        </div>

        {/* Contenido del slot */}
        <div className="flex-1 px-3 py-3 min-h-[80px]">
          {isFilled ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-800 leading-tight">
                {ev!.descripcion.length > 80 ? ev!.descripcion.substring(0, 78) + '…' : ev!.descripcion}
              </p>
              {ev!.archivo_nombre && (
                <button
                  onClick={() => descargar(ev!)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  <span className="material-icons text-xs">attach_file</span>
                  {ev!.archivo_nombre!.length > 22 ? ev!.archivo_nombre!.substring(0,20)+'…' : ev!.archivo_nombre}
                </button>
              )}
            </div>
          ) : isActive ? (
            <p className="text-xs text-gray-500 italic mt-1">Complete este espacio…</p>
          ) : (
            <p className="text-xs text-gray-400 italic mt-1">—</p>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // RENDER: Estado terminal o completado
  // ─────────────────────────────────────────────────────
  function renderCelebracion() {
    if (esTerminal) {
      return (
        <div className="text-center py-12 px-6">
          <span className="material-icons text-7xl text-gray-300 mb-4">verified</span>
          <h3 className="text-xl font-heading font-bold text-gray-600 mb-2">
            Evaluación Finalizada
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Esta evaluación se encuentra en estado <strong>{evalObj?.estado}</strong>.
            No es posible registrar más evidencias.
          </p>
          {totalCount > 0 && (
            <p className="text-sm text-gray-400 mt-4">Total registradas: {totalCount}/{maxTotal}</p>
          )}
        </div>
      );
    }

    // Todas las evidencias completadas
    return (
      <div className="text-center py-12 px-6">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-icons text-5xl text-green-600">task_alt</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <span className="material-icons text-sm text-white">check</span>
            </div>
          </div>
        </div>
        <h3 className="text-xl font-heading font-bold text-green-700 mb-2">
          Evidencias Completadas
        </h3>
        <p className="text-gray-600 max-w-xs mx-auto mb-6">
          Ha completado las {maxTotal} evidencias requeridas para este periodo
          ({maxFunc} funcionales + {maxComp} comportamentales).
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {slotsFunc.map(i => {
            const ev = getEvidenciaSlot('funcional', i);
            return ev ? (
              <button
                key={`f${i}`}
                onClick={() => descargar(ev)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 hover:bg-blue-100"
              >
                <span className="material-icons text-xs">attach_file</span>
                Func. #{i}
              </button>
            ) : null;
          })}
          {slotsComp.map(i => {
            const ev = getEvidenciaSlot('comportamental', i);
            return ev ? (
              <button
                key={`c${i}`}
                onClick={() => descargar(ev)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-xs text-purple-700 hover:bg-purple-100"
              >
                <span className="material-icons text-xs">attach_file</span>
                Comp. #{i}
              </button>
            ) : null;
          })}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // RENDER: Formulario (solo paso activo)
  // ─────────────────────────────────────────────────────
  function renderFormulario() {
    const pasoLabel = pasoActual === 'funcional' ? 'Evidencia Funcional' : 'Evidencia Comportamental';
    const colorClass = pasoActual === 'funcional' ? 'border-blue-400' : 'border-purple-400';
    const currentSlot = pasoActual === 'funcional' ? funcCount + 1 : compCount + 1;
    const maxCurrent = pasoActual === 'funcional' ? maxFunc : maxComp;

    return (
      <div className={`edl-card border-t-4 ${colorClass}`}>
        {/* Header del paso */}
        <div className="flex items-center gap-2 mb-5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
            pasoActual === 'funcional' ? 'bg-blue-600' : 'bg-purple-600'
          }`}>
            {totalCount + 1}
          </div>
          <h3 className="font-heading font-bold text-inst-azul">
            {pasoLabel} #{currentSlot} de {maxCurrent}
          </h3>
          <span className="ml-auto text-xs text-gray-500">
            {totalCount}/{maxTotal} evidencias
          </span>
        </div>

        <div className="space-y-4">
          {/* Selector compromiso */}
          <div>
            <label className="edl-label">
              {pasoActual === 'funcional' ? 'Compromiso Funcional' : 'Competencia Comportamental'} *
            </label>
            <select
              value={formCompromiso}
              onChange={e => setFormCompromiso(Number(e.target.value))}
              className="edl-input"
            >
              <option value={0}>
                {selectDisponibles.length === 0
                  ? 'No hay compromisos disponibles'
                  : 'Seleccione…'}
              </option>
              {selectDisponibles.map(c => (
                <option key={c.id} value={c.id}>
                  {getCompromisoLabel(c)}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="edl-label">Descripción del logro alcanzado *</label>
            <textarea
              value={formDescripcion}
              onChange={e => setFormDescripcion(e.target.value)}
              className="edl-input min-h-[80px]"
              placeholder="Describa el logro concreto que sustenta esta evidencia…"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="edl-label">Ubicación del soporte *</label>
            <input
              type="text"
              value={formUbicacion}
              onChange={e => setFormUbicacion(e.target.value)}
              className="edl-input"
              placeholder="Carpeta compartida, enlace URL, oficina…"
            />
          </div>

          {/* Observación */}
          <div>
            <label className="edl-label">Observación <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input
              type="text"
              value={formObservacion}
              onChange={e => setFormObservacion(e.target.value)}
              className="edl-input"
              placeholder="Nota adicional…"
            />
          </div>

          {/* Archivo */}
          <div>
            <label className="edl-label">Archivo de soporte (PDF, Word, Imagen) *</label>
            <input
              id="archivo-ev"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
              onChange={onArchivo}
              className="edl-input text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-inst-azul file:text-white file:cursor-pointer hover:file:bg-inst-azul-osc"
            />
            {formArchivo && (
              <p className="text-xs text-inst-texto-claro mt-1 flex items-center gap-1">
                <span className="material-icons text-xs">attach_file</span>
                {formArchivo.name} ({formatBytes(formArchivo.size)})
              </p>
            )}
            <p className="text-xs text-inst-texto-claro mt-1">
              Máx 10 MB. PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, WEBP.
            </p>
          </div>

          {/* Botón */}
          <button
            onClick={guardar}
            disabled={
              saving || !formCompromiso || !formDescripcion.trim() ||
              !formUbicacion.trim() || !formArchivo
            }
            className={`
              edl-btn-primary w-full flex items-center justify-center gap-2 gap-y-1 py-2.5
              disabled:opacity-50 disabled:cursor-not-allowed
              ${pasoActual === 'funcional' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}
            `}
          >
            <span className="material-icons text-sm">save</span>
            {saving ? 'Guardando…' : 'Registrar Evidencia'}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // RENDER: Instrucciones del paso
  // ─────────────────────────────────────────────────────
  function renderInstrucciones() {
    if (esTerminal || doneAll) return null;
    return (
      <div className={`
        mb-5 p-4 rounded-lg border-l-4 flex items-start gap-3
        ${pasoActual === 'funcional' ? 'bg-blue-50 border-blue-500' : 'bg-purple-50 border-purple-500'}
      `}>
        <span className={`material-icons text-xl mt-0.5 ${pasoActual === 'funcional' ? 'text-blue-600' : 'text-purple-600'}`}>
          info
        </span>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {pasoActual === 'funcional'
              ? `Registre ${maxFunc} evidencia${maxFunc !== 1 ? 's' : ''} de sus compromisos funcionales.`
              : `Registre ${maxComp} evidencia${maxComp !== 1 ? 's' : ''} de sus competencias comportamentales.`}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {funcCount}/{maxFunc} funcionales · {compCount}/{maxComp} comportamentales completadas
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // RENDER: Resumen del evaluado
  // ─────────────────────────────────────────────────────
  function renderEvaluado() {
    return (
      <div className="edl-card mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-inst-azul/10 flex items-center justify-center">
            <span className="material-icons text-inst-azul">person</span>
          </div>
          <div>
            <p className="font-medium text-inst-texto">
              {usuario?.primer_nombre} {usuario?.primer_apellido}
            </p>
            <p className="text-xs text-inst-texto-claro">
              CC {usuario?.documento} · {usuario?.denominacion_empleo || 'Sin cargo'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="edl-section-title mb-6">Evidencias de Desempeño</h2>

      {renderEvaluado()}

      {/* Selectores */}
      <div className="edl-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="edl-label">Periodo de Evaluación *</label>
            <select
              value={periodoId}
              onChange={e => setPeriodoId(Number(e.target.value))}
              className="edl-input"
            >
              <option value={0}>Seleccione…</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre}{p.estado === 'cerrado' ? ' (cerrado)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="edl-label">Tipo de Evaluación *</label>
            <select
              value={evaluacionId}
              onChange={e => setEvaluacionId(Number(e.target.value))}
              className="edl-input"
              disabled={evaluaciones.length === 0}
            >
              {evaluaciones.length === 0
                ? <option value={0}>Seleccione un periodo primero</option>
                : <>
                    <option value={0}>Seleccione…</option>
                    {evaluaciones.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {TIPO_LABEL[ev.tipo] || ev.tipo} ({ev.estado})
                      </option>
                    ))}
                  </>
              }
            </select>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="text-center py-12 text-inst-texto-claro">
          <span className="material-icons text-4xl animate-spin">sync</span>
          <p className="mt-2">Cargando…</p>
        </div>
      ) : periodoId > 0 && evaluacionId > 0 ? (
        esTerminal || doneAll ? (
          renderCelebracion()
        ) : (
          <div>
            {renderInstrucciones()}

            {/* Barra de progreso global */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium text-gray-700">Progreso global</span>
                <span className="ml-auto text-sm font-bold text-inst-azul">
                  {maxTotal > 0 ? Math.round((totalCount / maxTotal) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: maxTotal > 0 ? `${(totalCount / maxTotal) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {totalCount} de {maxTotal} evidencias completadas ({funcCount}/{maxFunc} funcionales, {compCount}/{maxComp} comportamentales)
              </p>
            </div>

            {/* Formulario */}
            {renderFormulario()}
          </div>
        )
      ) : (
        <div className="text-center py-12 text-inst-texto-claro">
          <span className="material-icons text-5xl text-gray-300">assignment</span>
          <p className="mt-3 text-gray-500">Seleccione periodo y tipo de evaluación para comenzar.</p>
        </div>
      )}
      <Toaster position="top-right" richColors />
    </div>
  );
}