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

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-gray-200 text-gray-700' },
  propuesto: { label: 'Propuesto', color: 'bg-yellow-100 text-yellow-800' },
  aprobado: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');

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

      {/* Formulario nuevo compromiso (Concertación EDL-CAREPA) */}
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
              <label className="edl-label">Evaluacion</label>
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
              <label className="edl-label">Descripcion del Compromiso</label>
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
                placeholder="Que se espera lograr"
              />
            </div>
            <div>
              <label className="edl-label">Medio de verificacion</label>
              <input
                type="text"
                value={medioVerificacion}
                onChange={e => setMedioVerificacion(e.target.value)}
                className="edl-input"
                placeholder="Como se verificara el cumplimiento"
              />
            </div>
            <div>
              <label className="edl-label">Plazo (fecha limite)</label>
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
              {saving ? 'Propiciendo...' : 'Proponer para Concertacion'}
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
          No tiene compromisos registrados. Haga clic en "Proponer Compromiso" para iniciar la concertacion.
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
                      <p className="text-xs text-inst-texto-claro mb-1">Verificacion: {c.medio_verificacion}</p>
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
