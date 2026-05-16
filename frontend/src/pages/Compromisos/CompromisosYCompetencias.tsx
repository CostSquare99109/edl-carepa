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

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  propuesto: { label: 'Propuesto', color: 'bg-gray-200 text-gray-700' },
  en_revision: { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
  aprobado: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  devuelto: { label: 'Devuelto', color: 'bg-red-100 text-red-800' },
  en_progreso: { label: 'En progreso', color: 'bg-blue-100 text-blue-800' },
  cumplido: { label: 'Cumplido', color: 'bg-green-200 text-green-900' },
  incumplido: { label: 'Incumplido', color: 'bg-red-200 text-red-900' },
  // Mantener compatibilidad con estados anteriores
  pendiente: { label: 'Propuesto', color: 'bg-gray-200 text-gray-700' },
  enviado: { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
  rechazado: { label: 'Devuelto', color: 'bg-red-100 text-red-800' },
};

const TIPO_ICONS: Record<string, string> = {
  funcional: 'work',
  comportamental: 'psychology',
};

const TIPO_LABELS: Record<string, string> = {
  funcional: 'Funcional',
  comportamental: 'Comportamental',
};

export default function CompromisosYCompetencias() {
  const { usuario } = useAuth();
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formulario
  const [evaluacionId, setEvaluacionId] = useState<number>(0);
  const [tipo, setTipo] = useState('funcional');
  const [descripcion, setDescripcion] = useState('');
  const [resultadoEsperado, setResultadoEsperado] = useState('');
  const [medioVerificacion, setMedioVerificacion] = useState('');
  const [plazo, setPlazo] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [compRes, evalRes] = await Promise.all([
        api.get<PaginatedData<Compromiso>>('/compromisos?responsable_id=' + usuario?.id + '&por_pagina=50'),
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

  async function proponerCompromiso() {
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
    setPlazo('');
    setEvaluacionId(0);
    setTipo('funcional');
  }

  // Obtener estado normalizado
  function getEstadoInfo(estado: string) {
    return ESTADO_LABELS[estado] || { label: estado, color: 'bg-gray-200 text-gray-700' };
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="edl-section-title">Compromisos y Competencias</h2>
          <p className="text-sm text-inst-texto-claro mt-1">
            Módulo de concertación — Proponga sus compromisos funcionales y comportamentales
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="edl-btn-primary flex items-center gap-2"
        >
          <span className="material-icons text-lg">add</span>
          Proponer Compromiso
        </button>
      </div>

      {/* Formulario nuevo compromiso */}
      {showForm && (
        <div className="edl-card mb-6">
          <h3 className="font-heading font-bold text-inst-azul mb-4">Proponer Compromiso</h3>
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
                <option value="funcional">Funcional</option>
                <option value="comportamental">Comportamental</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="edl-label">Descripción del Compromiso</label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                className="edl-input min-h-[80px]"
                placeholder="Describa el compromiso..."
              />
            </div>
            <div>
              <label className="edl-label">Resultado Esperado</label>
              <textarea
                value={resultadoEsperado}
                onChange={e => setResultadoEsperado(e.target.value)}
                className="edl-input min-h-[60px]"
                placeholder="¿Qué resultado se espera al cumplir este compromiso?"
              />
            </div>
            <div>
              <label className="edl-label">Medio de Verificación</label>
              <input
                type="text"
                value={medioVerificacion}
                onChange={e => setMedioVerificacion(e.target.value)}
                className="edl-input"
                placeholder="Ej: Informe, certificado, acta..."
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
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={proponerCompromiso}
              disabled={saving || !evaluacionId || !descripcion.trim()}
              className="edl-btn-primary"
            >
              {saving ? 'Proponiendo...' : 'Proponer Compromiso'}
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
      ) : compromisos.length === 0 ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">
          No tiene compromisos registrados. Haga clic en "Proponer Compromiso" para iniciar la concertación.
        </div>
      ) : (
        <div className="space-y-3">
          {compromisos.map(c => {
            const estadoInfo = getEstadoInfo(c.estado);
            return (
              <div key={c.id} className="edl-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-icons text-sm text-inst-azul">
                        {TIPO_ICONS[c.tipo] || 'task_alt'}
                      </span>
                      <span className="text-xs text-inst-texto-claro uppercase font-medium">
                        {TIPO_LABELS[c.tipo] || c.tipo}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${estadoInfo.color}`}>
                        {estadoInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-inst-texto mb-1">{c.descripcion}</p>
                    {c.resultado_esperado && (
                      <p className="text-xs text-inst-texto-claro mb-1">
                        <span className="font-medium">Resultado esperado:</span> {c.resultado_esperado}
                      </p>
                    )}
                    {c.medio_verificacion && (
                      <p className="text-xs text-inst-texto-claro mb-1">
                        <span className="font-medium">Medio de verificación:</span> {c.medio_verificacion}
                      </p>
                    )}
                    <div className="flex gap-4 text-xs text-inst-texto-claro">
                      {c.peso > 0 && <span>Peso: {c.peso}%</span>}
                      {c.plazo && <span>Plazo: {c.plazo}</span>}
                      {c.evaluador_nombre && <span>Evaluador: {c.evaluador_nombre}</span>}
                    </div>
                    {(c.estado === 'devuelto' || c.estado === 'rechazado') && c.observaciones_evaluador && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                        Observaciones del evaluador: {c.observaciones_evaluador}
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
