import { useEffect, useState, useCallback } from 'react';
import { api, type PaginatedData } from '../../lib/api';

interface Compromiso {
  id: number;
  evaluacion_id: number;
  tipo: string;
  descripcion: string;
  plazo: string | null;
  peso: number;
  estado: string;
  responsable_nombre: string;
  responsable_id: number;
  evaluador_id: number;
  evaluador_nombre: string | null;
  observaciones_evaluador: string | null;
  creado_en: string;
  evaluacion_tipo: string;
  periodo_nombre: string;
}

interface ResumenPesos {
  evaluacion_id: number;
  compromisos: Array<{
    id: number;
    tipo: string;
    descripcion: string;
    peso: number;
    estado: string;
    responsable_nombre: string;
  }>;
  total_peso_aprobado: number;
  peso_restante: number;
  compromisos_pendientes: number;
  distribucion_completa: boolean;
}

const ESTADO_COLORS: Record<string, string> = {
  enviado: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
};

export default function AprobarCompromisos() {
  const [pendientes, setPendientes] = useState<Compromiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [aprobarId, setAprobarId] = useState<number | null>(null);
  const [peso, setPeso] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [rechazarId, setRechazarId] = useState<number | null>(null);
  const [obsRechazo, setObsRechazo] = useState('');
  const [resumen, setResumen] = useState<ResumenPesos | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarPendientes();
  }, []);

  async function cargarPendientes() {
    setLoading(true);
    try {
      const res = await api.get<PaginatedData<Compromiso>>('/compromisos/pendientes?por_pagina=50');
      setPendientes(res.data || []);
    } catch (err) {
      console.error('Error cargando pendientes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function cargarResumenPesos(evaluacionId: number) {
    try {
      const res = await api.get<ResumenPesos>(`/compromisos/${evaluacionId}/pesos`);
      setResumen(res);
    } catch (err) {
      console.error('Error cargando resumen de pesos:', err);
    }
  }

  const handleAprobarClick = useCallback((compromiso: Compromiso) => {
    setAprobarId(compromiso.id);
    setRechazarId(null);
    setPeso('');
    setObservaciones('');
    cargarResumenPesos(compromiso.evaluacion_id);
  }, []);

  const handleRechazarClick = useCallback((id: number) => {
    setRechazarId(id);
    setAprobarId(null);
    setObsRechazo('');
  }, []);

  async function confirmarAprobacion() {
    if (!aprobarId || !peso) return;
    const pesoNum = parseFloat(peso);
    if (isNaN(pesoNum) || pesoNum < 0 || pesoNum > 100) {
      alert('El peso debe ser un numero entre 0 y 100');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/compromisos/${aprobarId}/aprobar`, {
        peso: pesoNum,
        observaciones_evaluador: observaciones,
      });
      setAprobarId(null);
      setResumen(null);
      cargarPendientes();
    } catch (err: any) {
      alert(err.message || 'Error al aprobar compromiso');
    } finally {
      setSaving(false);
    }
  }

  async function confirmarRechazo() {
    if (!rechazarId) return;
    setSaving(true);
    try {
      await api.put(`/compromisos/${rechazarId}/rechazar`, {
        observaciones_evaluador: obsRechazo,
      });
      setRechazarId(null);
      cargarPendientes();
    } catch (err: any) {
      alert(err.message || 'Error al rechazar compromiso');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="edl-section-title mb-6">Aprobar Compromisos</h2>

      {loading ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
      ) : pendientes.length === 0 ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">
          No tiene compromisos pendientes de aprobacion.
        </div>
      ) : (
        <div className="space-y-4">
          {pendientes.map(c => (
            <div key={c.id} className="edl-card">
              {/* Info del compromiso */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-icons text-sm text-inst-azul">
                      {c.tipo === 'competencia' ? 'star' : 'build'}
                    </span>
                    <span className="text-xs uppercase font-medium text-inst-texto-claro">
                      {c.tipo}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_COLORS[c.estado] || 'bg-gray-200'}`}>
                      {c.estado}
                    </span>
                  </div>
                  <p className="text-sm text-inst-texto mb-2">{c.descripcion}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-inst-texto-claro">
                    <span>Funcionario: <strong className="text-inst-texto">{c.responsable_nombre}</strong></span>
                    {c.plazo && <span>Plazo: {c.plazo}</span>}
                    <span>Periodo: {c.periodo_nombre}</span>
                    <span>Evaluacion: {c.evaluacion_tipo}</span>
                  </div>
                </div>
              </div>

              {/* Panel de aprobación */}
              {aprobarId === c.id && resumen && (
                <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-heading font-bold text-inst-azul text-sm mb-3">
                    Distribucion de Pesos - Evaluacion #{c.evaluacion_id}
                  </h4>

                  {/* Resumen de pesos actuales */}
                  <div className="mb-3 p-3 bg-white rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-inst-texto-claro">Peso total aprobado:</span>
                      <span className={`text-sm font-bold ${resumen.total_peso_aprobado >= 100 ? 'text-green-700' : 'text-inst-azul'}`}>
                        {resumen.total_peso_aprobado}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          resumen.distribucion_completa ? 'bg-green-500' : 'bg-inst-azul'
                        }`}
                        style={{ width: `${Math.min(resumen.total_peso_aprobado, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-inst-texto-claro">
                      Restante: {resumen.peso_restante}% | Pendientes por aprobar: {resumen.compromisos_pendientes}
                    </span>
                  </div>

                  {/* Compromisos ya aprobados */}
                  {resumen.compromisos.filter(x => x.estado === 'aprobado').length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-inst-texto mb-1">Compromisos ya aprobados:</p>
                      {resumen.compromisos.filter(x => x.estado === 'aprobado').map(comp => (
                        <div key={comp.id} className="flex items-center justify-between py-1 text-xs">
                          <span className="text-inst-texto truncate mr-2">{comp.descripcion}</span>
                          <span className="font-bold text-green-700 flex-shrink-0">{comp.peso}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario peso */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="edl-label">Peso a asignar (%)</label>
                      <input
                        type="number"
                        min="0"
                        max={resumen.peso_restante}
                        step="0.01"
                        value={peso}
                        onChange={e => setPeso(e.target.value)}
                        className="edl-input"
                        placeholder={`Max: ${resumen.peso_restante}%`}
                      />
                      {peso && parseFloat(peso) > resumen.peso_restante && (
                        <p className="text-xs text-red-600 mt-1">
                          Supera el peso restante ({resumen.peso_restante}%)
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="edl-label">Observaciones (opcional)</label>
                      <input
                        type="text"
                        value={observaciones}
                        onChange={e => setObservaciones(e.target.value)}
                        className="edl-input"
                        placeholder="Observaciones..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={confirmarAprobacion}
                      disabled={saving || !peso || parseFloat(peso) > resumen.peso_restante}
                      className="edl-btn-primary flex items-center gap-1"
                    >
                      <span className="material-icons text-sm">check</span>
                      {saving ? 'Aprobando...' : 'Confirmar Aprobacion'}
                    </button>
                    <button onClick={() => { setAprobarId(null); setResumen(null); }} className="edl-btn-secondary">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Panel de rechazo */}
              {rechazarId === c.id && (
                <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-heading font-bold text-red-700 text-sm mb-2">Rechazar Compromiso</h4>
                  <div>
                    <label className="edl-label">Observaciones del rechazo</label>
                    <textarea
                      value={obsRechazo}
                      onChange={e => setObsRechazo(e.target.value)}
                      className="edl-input min-h-[60px]"
                      placeholder="Explique por que se rechaza..."
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={confirmarRechazo}
                      disabled={saving}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-1 text-sm"
                    >
                      <span className="material-icons text-sm">block</span>
                      {saving ? 'Rechazando...' : 'Confirmar Rechazo'}
                    </button>
                    <button onClick={() => setRechazarId(null)} className="edl-btn-secondary">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              {aprobarId !== c.id && rechazarId !== c.id && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-inst-borde">
                  <button
                    onClick={() => handleAprobarClick(c)}
                    className="edl-btn-primary flex items-center gap-1 text-sm"
                  >
                    <span className="material-icons text-sm">check_circle</span>
                    Aprobar con Peso
                  </button>
                  <button
                    onClick={() => handleRechazarClick(c.id)}
                    className="edl-btn-secondary text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1 text-sm"
                  >
                    <span className="material-icons text-sm">cancel</span>
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
