import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/* ─── Tipos & datos mock ─── */
interface ReporteItem {
  id: number;
  tipo: string;
  periodo: string;
  descripcion: string;
  fechaGeneracion: string;
  formato: string;
}

const REPORTES_MOCK: ReporteItem[] = [
  { id: 1, tipo: 'Consolidado General', periodo: '2025-I', descripcion: 'Resumen de todas las evaluaciones del periodo', fechaGeneracion: '2025-05-15', formato: 'Excel' },
  { id: 2, tipo: 'Por Dependencia', periodo: '2025-I', descripcion: 'Evaluaciones agrupadas por dependencia', fechaGeneracion: '2025-05-14', formato: 'PDF' },
  { id: 3, tipo: 'Resultados Individuales', periodo: '2025-I', descripcion: 'Resultado por funcionario evaluado', fechaGeneracion: '2025-05-13', formato: 'Excel' },
  { id: 4, tipo: 'Cumplimiento de Metas', periodo: '2025-I', descripcion: 'Porcentaje de cumplimiento de metas por dependencia', fechaGeneracion: '2025-05-12', formato: 'PDF' },
  { id: 5, tipo: 'Consolidado General', periodo: '2024-II', descripcion: 'Resumen del periodo anterior', fechaGeneracion: '2024-12-20', formato: 'Excel' },
];

const TIPOS_REPORTE = ['Consolidado General', 'Por Dependencia', 'Resultados Individuales', 'Cumplimiento de Metas'];
const PERIODOS = ['2025-I', '2024-II'];
const FORMATOS = ['Excel', 'PDF'];

export default function AdminReportes() {
  const [tipoReporte, setTipoReporte] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [formato, setFormato] = useState('Excel');
  const [generando, setGenerando] = useState(false);

  async function generarReporte() {
    setGenerando(true);
    // Simular generación
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGenerando(false);
    alert('Reporte generado exitosamente (simulado)');
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-inst-texto-claro mb-4">
        <span className="material-icons text-base text-inst-azul">home</span>
        <span>/</span><span>Admin</span><span>/</span>
        <span className="text-inst-texto font-medium">Reportes</span>
      </div>

      {/* Título */}
      <h1 className="text-2xl font-heading font-bold text-inst-azul flex items-center gap-2 mb-6">
        <span className="material-icons text-3xl">summarize</span>
        Generación de Reportes
      </h1>

      {/* ── Formulario de generación ── */}
      <div className="bg-white rounded-lg border border-inst-borde shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-inst-borde">
          <h2 className="font-heading font-semibold text-inst-azul flex items-center gap-2">
            <span className="material-icons text-lg text-inst-verde">add_chart</span>
            Generar Nuevo Reporte
          </h2>
        </div>
        <div className="px-5 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-inst-texto mb-1">Tipo de informe</label>
              <select value={tipoReporte} onChange={e => setTipoReporte(e.target.value)} className="edl-input">
                <option value="">Seleccione...</option>
                {TIPOS_REPORTE.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-inst-texto mb-1">Período</label>
              <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="edl-input">
                <option value="">Seleccione...</option>
                {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-inst-texto mb-1">Formato de exportación</label>
              <select value={formato} onChange={e => setFormato(e.target.value)} className="edl-input">
                {FORMATOS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={generarReporte}
            disabled={!tipoReporte || !periodo || generando}
            className="edl-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generando ? (
              <><span className="material-icons text-base animate-spin">sync</span>Generando...</>
            ) : (
              <><span className="material-icons text-base">file_download</span>Generar Reporte</>
            )}
          </button>
        </div>
      </div>

      {/* ── Tabla de reportes previos ── */}
      <div className="bg-white rounded-lg border border-inst-borde shadow-sm">
        <div className="px-5 py-4 border-b border-inst-borde">
          <h2 className="font-heading font-semibold text-inst-azul flex items-center gap-2">
            <span className="material-icons text-lg text-amber-600">history</span>
            Reportes Generados
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr><th>Tipo</th><th>Periodo</th><th>Descripción</th><th>Fecha</th><th>Formato</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {REPORTES_MOCK.map(r => (
                <tr key={r.id}>
                  <td className="font-medium">{r.tipo}</td>
                  <td className="text-sm">{r.periodo}</td>
                  <td className="text-inst-texto-claro text-sm">{r.descripcion}</td>
                  <td className="text-inst-texto-claro text-sm">{r.fechaGeneracion}</td>
                  <td>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.formato === 'Excel' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {r.formato}
                    </span>
                  </td>
                  <td>
                    <button className="p-1.5 rounded hover:bg-blue-50 text-inst-azul" title="Descargar">
                      <span className="material-icons text-lg">file_download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
