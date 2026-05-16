import { useState } from 'react';
import { api } from '../../lib/api';

interface FilaReporte {
  [key: string]: any;
}

const TIPOS_REPORTE = [
  { value: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment' },
  { value: 'compromisos', label: 'Compromisos', icon: 'task' },
  { value: 'usuarios', label: 'Usuarios', icon: 'people' },
  { value: 'dependencias', label: 'Dependencias', icon: 'account_tree' },
];

const PERIODOS = [
  '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027',
];

export default function AdminReportes() {
  const [tipo, setTipo] = useState('evaluaciones');
  const [periodo, setPeriodo] = useState('2025-2026');
  const [generando, setGenerando] = useState(false);
  const [datos, setDatos] = useState<FilaReporte[]>([]);
  const [columnas, setColumnas] = useState<string[]>([]);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState<{ tipo: string; periodo: string; fecha: string; registros: number }[]>([]);

  const generar = async () => {
    setGenerando(true); setError(''); setMostrarResultado(false);
    try {
      const res = await api.get<any>(`/reportes/${tipo}?periodo=${encodeURIComponent(periodo)}`);
      let filas: FilaReporte[] = [];
      if (Array.isArray(res)) {
        filas = res;
      } else if (res.data && Array.isArray(res.data)) {
        filas = res.data;
      } else if (res.items && Array.isArray(res.items)) {
        filas = res.items;
      } else if (typeof res === 'object' && res !== null) {
        // Si es un solo objeto, ponerlo como una fila
        filas = [res];
      }
      
      if (filas.length > 0) {
        setColumnas(Object.keys(filas[0]));
        setDatos(filas);
      } else {
        setColumnas([]);
        setDatos([]);
      }
      setMostrarResultado(true);
      setHistorial(prev => [{ tipo, periodo, fecha: new Date().toLocaleString('es-CO'), registros: filas.length }, ...prev]);
    } catch (e: any) { setError(e.message || 'Error al generar el reporte'); }
    setGenerando(false);
  };

  const exportarCSV = () => {
    if (datos.length === 0) return;
    const header = columnas.join(',');
    const rows = datos.map(f => columnas.map(c => {
      const val = String(f[c] ?? '');
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `reporte_${tipo}_${periodo}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const formatCell = (val: any): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Sí' : 'No';
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(val).toLocaleDateString('es-CO');
    return String(val);
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <h2 className="text-xl font-bold text-[#003366]"><i className="fas fa-file-alt mr-2" />Reportes</h2>

      {/* Selector de reporte */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-semibold text-[#003366] mb-3">Generar Reporte</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo de reporte */}
          <div>
            <label className="block text-xs font-medium text-inst-texto-claro mb-2">Tipo de Reporte</label>
            <div className="space-y-2">
              {TIPOS_REPORTE.map(t => (
                <button key={t.value} onClick={() => setTipo(t.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition border-2 ${
                    tipo === t.value ? 'border-[#003366] bg-[#003366]/5 text-[#003366] font-semibold' : 'border-gray-200 text-inst-texto hover:border-gray-400'
                  }`}>
                  <span className="material-icons text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Periodo */}
          <div>
            <label className="block text-xs font-medium text-inst-texto-claro mb-2">Periodo</label>
            <select value={periodo} onChange={e => setPeriodo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Botón generar */}
          <div className="flex flex-col justify-end">
            <button onClick={generar} disabled={generando}
              className="bg-[#003366] text-white px-4 py-3 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              <span className="material-icons text-base">{generando ? 'hourglass_empty' : 'play_arrow'}</span>
              {generando ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      {/* Resultado como tabla visual */}
      {mostrarResultado && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#003366]">
              Resultado — {TIPOS_REPORTE.find(t => t.value === tipo)?.label} ({periodo})
            </h3>
            <div className="flex gap-2">
              <span className="text-xs bg-inst-gris px-3 py-1 rounded-full text-inst-texto-claro">
                {datos.length} registro(s)
              </span>
              {datos.length > 0 && (
                <button onClick={exportarCSV}
                  className="text-xs bg-[#1E5A3C] text-white px-3 py-1 rounded-full hover:opacity-90 flex items-center gap-1">
                  <span className="material-icons text-xs">download</span> Exportar CSV
                </button>
              )}
            </div>
          </div>

          {datos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <span className="material-icons text-4xl block mb-2">search_off</span>
              No se encontraron datos para este reporte
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-inst-gris">
                  {columnas.map((col, i) => (
                    <th key={i} className="text-left px-3 py-2 font-semibold text-inst-texto-claro whitespace-nowrap">
                      {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </th>
                  ))}
                </tr></thead>
                <tbody>
                  {datos.slice(0, 100).map((fila, i) => (
                    <tr key={i} className="border-b hover:bg-inst-gris/50 transition">
                      {columnas.map((col, j) => (
                        <td key={j} className="px-3 py-2 whitespace-nowrap">{formatCell(fila[col])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {datos.length > 100 && (
                <p className="text-xs text-inst-texto-claro text-center mt-2">
                  Mostrando 100 de {datos.length} registros. Exporte CSV para ver todos.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Historial de reportes */}
      {historial.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#003366] mb-3">
            <span className="material-icons text-sm align-middle mr-1">history</span>
            Historial de Reportes
          </h3>
          <div className="space-y-2">
            {historial.map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-inst-gris rounded-lg px-4 py-2">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-base text-inst-azul">
                    {TIPOS_REPORTE.find(t => t.value === h.tipo)?.icon || 'description'}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{TIPOS_REPORTE.find(t => t.value === h.tipo)?.label || h.tipo} — {h.periodo}</p>
                    <p className="text-xs text-inst-texto-claro">{h.fecha}</p>
                  </div>
                </div>
                <span className="text-xs bg-white px-2 py-0.5 rounded-full text-inst-texto-claro">{h.registros} registros</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
