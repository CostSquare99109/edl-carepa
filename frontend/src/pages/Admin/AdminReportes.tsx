import { useState } from 'react';
import { api } from '../../lib/api';

interface CargaMasiva {
  id: number;
  tipo: string;
  nombre_archivo: string;
  registros_total: number;
  registros_exitosos: number;
  registros_fallidos: number;
  estado: string;
  creado_en: string;
}

const ESTADO_BADGE: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800', procesando: 'bg-blue-100 text-blue-800',
  completado: 'bg-green-100 text-green-800', error: 'bg-red-100 text-red-800',
};

export default function AdminReportes() {
  const [tipo, setTipo] = useState('evaluaciones');
  const [periodoId, setPeriodoId] = useState('');
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [errorGen, setErrorGen] = useState('');

  const [historial, setHistorial] = useState<CargaMasiva[]>([]);
  const [cargandoHist, setCargandoHist] = useState(false);

  const generar = async () => {
    setGenerando(true); setErrorGen(''); setResultado(null);
    try {
      let url = `/reportes/${tipo}`;
      if (periodoId) url += `?periodo_id=${periodoId}`;
      const res = await api.get<any>(url);
      setResultado(res);
    } catch (e: any) { setErrorGen(e.message); }
    setGenerando(false);
  };

  const cargarHistorial = async () => {
    setCargandoHist(true);
    try {
      const res = await api.get<any>('/cargas');
      setHistorial(res.items || res.data || []);
    } catch {}
    setCargandoHist(false);
  };

  // Cargar historial al montar
  useState(() => { cargarHistorial(); });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#003366]"><i className="fas fa-file-alt mr-2" />Reportes</h2>

      {/* Generador */}
      <div className="bg-white rounded-lg shadow-md p-5">
        <h3 className="text-lg font-semibold text-[#003366] mb-4">Generar Reporte</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Tipo de Reporte</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="evaluaciones">Evaluaciones</option>
              <option value="concertacion">Concertación</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">ID Periodo (opcional)</label>
            <input type="number" value={periodoId} onChange={e => setPeriodoId(e.target.value)} placeholder="Ej: 1" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={generar} disabled={generando} className="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 w-full">
              {generando ? <><i className="fas fa-spinner fa-spin mr-2" />Generando...</> : <><i className="fas fa-download mr-2" />Generar</>}
            </button>
          </div>
        </div>
        {errorGen && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{errorGen}</div>}
        {resultado && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium"><i className="fas fa-check-circle mr-2" />Reporte generado</p>
            <pre className="text-xs text-green-700 mt-2 max-h-40 overflow-auto">{JSON.stringify(resultado, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Historial de cargas */}
      <div className="bg-white rounded-lg shadow-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#003366]">Historial de Cargas</h3>
          <button onClick={cargarHistorial} className="text-sm text-blue-600 hover:underline"><i className="fas fa-sync-alt mr-1" />Actualizar</button>
        </div>
        {cargandoHist ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]" /></div>
        ) : historial.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay cargas registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Archivo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Registros</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historial.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">#{c.id}</td>
                    <td className="px-4 py-3">{c.tipo}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{c.nombre_archivo}</td>
                    <td className="px-4 py-3">
                      <span className="text-green-600">{c.registros_exitosos}</span>/<span className="text-gray-400">{c.registros_total}</span>
                      {c.registros_fallidos > 0 && <span className="text-red-600 ml-1">({c.registros_fallidos} fallidos)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[c.estado] || 'bg-gray-100'}`}>{c.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.creado_en).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
