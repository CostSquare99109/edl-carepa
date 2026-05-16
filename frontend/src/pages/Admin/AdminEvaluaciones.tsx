import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/* ─── Tipos & datos mock ─── */
interface EvaluacionItem {
  id: number;
  evaluado: string;
  evaluador: string;
  tipo: string;
  periodo: string;
  estado: 'Completada' | 'En proceso' | 'Pendiente' | 'Rechazada';
  puntaje: string;
  fecha: string;
}

const EVALUACIONES_MOCK: EvaluacionItem[] = [
  { id: 1, evaluado: 'María López', evaluador: 'Carlos Ramírez', tipo: 'Heteroevaluación', periodo: '2025-I', estado: 'Completada', puntaje: '4.5', fecha: '2025-05-15' },
  { id: 2, evaluado: 'Ana Martínez', evaluador: 'Pedro Gómez', tipo: 'Autoevaluación', periodo: '2025-I', estado: 'En proceso', puntaje: '—', fecha: '2025-05-14' },
  { id: 3, evaluado: 'Laura Sánchez', evaluador: 'Jorge Hernández', tipo: 'Heteroevaluación', periodo: '2025-I', estado: 'Pendiente', puntaje: '—', fecha: '2025-05-13' },
  { id: 4, evaluado: 'Pedro Gómez', evaluador: 'María López', tipo: 'Heteroevaluación', periodo: '2025-I', estado: 'Completada', puntaje: '4.8', fecha: '2025-05-12' },
  { id: 5, evaluado: 'Jorge Hernández', evaluador: 'Ana Martínez', tipo: 'Coevaluación', periodo: '2025-I', estado: 'Rechazada', puntaje: '—', fecha: '2025-05-11' },
  { id: 6, evaluado: 'Carlos Ramírez', evaluador: 'Laura Sánchez', tipo: 'Heteroevaluación', periodo: '2024-II', estado: 'Completada', puntaje: '3.9', fecha: '2024-12-20' },
];

const ESTADO_BADGE: Record<string, string> = {
  Completada: 'bg-green-100 text-green-800',
  'En proceso': 'bg-blue-100 text-blue-800',
  Pendiente: 'bg-amber-100 text-amber-800',
  Rechazada: 'bg-red-100 text-red-800',
};

const TIPOS = ['Todos', 'Heteroevaluación', 'Autoevaluación', 'Coevaluación'];
const ESTADOS_FILTRO = ['Todos', 'Completada', 'En proceso', 'Pendiente', 'Rechazada'];
const PERIODOS = ['Todos', '2025-I', '2024-II'];

export default function AdminEvaluaciones() {
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('Todos');
  const [expandida, setExpandida] = useState<number | null>(null);

  const filtradas = EVALUACIONES_MOCK.filter(e => {
    if (filtroTipo !== 'Todos' && e.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'Todos' && e.estado !== filtroEstado) return false;
    if (filtroPeriodo !== 'Todos' && e.periodo !== filtroPeriodo) return false;
    return true;
  });

  const totalCompletadas = EVALUACIONES_MOCK.filter(e => e.estado === 'Completada').length;
  const totalEnProceso = EVALUACIONES_MOCK.filter(e => e.estado === 'En proceso').length;
  const totalPendientes = EVALUACIONES_MOCK.filter(e => e.estado === 'Pendiente').length;
  const totalRechazadas = EVALUACIONES_MOCK.filter(e => e.estado === 'Rechazada').length;

  const SMALL_BOXES = [
    { value: totalCompletadas, label: 'Completadas', icon: 'task_alt', bg: 'bg-inst-verde' },
    { value: totalEnProceso, label: 'En Proceso', icon: 'sync', bg: 'bg-blue-600' },
    { value: totalPendientes, label: 'Pendientes', icon: 'pending', bg: 'bg-amber-600' },
    { value: totalRechazadas, label: 'Rechazadas', icon: 'cancel', bg: 'bg-inst-rojo' },
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-inst-texto-claro mb-4">
        <span className="material-icons text-base text-inst-azul">home</span>
        <span>/</span><span>Admin</span><span>/</span>
        <span className="text-inst-texto font-medium">Evaluaciones</span>
      </div>

      {/* Título */}
      <h1 className="text-2xl font-heading font-bold text-inst-azul flex items-center gap-2 mb-6">
        <span className="material-icons text-3xl">assessment</span>
        Gestión de Evaluaciones
      </h1>

      {/* ── Small-boxes resumen ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {SMALL_BOXES.map((box, i) => (
          <div key={i} className={`${box.bg} rounded-lg overflow-hidden text-white shadow-md`}>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-2xl font-heading font-bold">{box.value}</p>
                <p className="text-xs text-white/80">{box.label}</p>
              </div>
              <span className="material-icons text-4xl text-white/20">{box.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="bg-white rounded-lg border border-inst-borde shadow-sm mb-6">
        <div className="px-5 py-3 border-b border-inst-borde">
          <h2 className="font-heading font-semibold text-inst-azul flex items-center gap-2">
            <span className="material-icons text-lg">filter_list</span>
            Filtros
          </h2>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-inst-texto mb-1">Tipo</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="edl-input">
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-inst-texto mb-1">Estado</label>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="edl-input">
              {ESTADOS_FILTRO.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-inst-texto mb-1">Periodo</label>
            <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)} className="edl-input">
              {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-lg border border-inst-borde shadow-sm">
        <div className="px-5 py-4 border-b border-inst-borde flex items-center justify-between">
          <h2 className="font-heading font-semibold text-inst-azul">Listado de Evaluaciones</h2>
          <span className="text-sm text-inst-texto-claro">{filtradas.length} resultados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr><th>Evaluado</th><th>Evaluador</th><th>Tipo</th><th>Periodo</th><th>Estado</th><th>Puntaje</th><th>Fecha</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtradas.map(e => (
                <>
                  <tr key={e.id} className={expandida === e.id ? 'bg-inst-gris/30' : ''}>
                    <td className="font-medium">{e.evaluado}</td>
                    <td className="text-inst-texto-claro">{e.evaluador}</td>
                    <td className="text-sm">{e.tipo}</td>
                    <td className="text-sm">{e.periodo}</td>
                    <td>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[e.estado]}`}>
                        {e.estado}
                      </span>
                    </td>
                    <td className="font-semibold">{e.puntaje}</td>
                    <td className="text-inst-texto-claro text-sm">{e.fecha}</td>
                    <td>
                      <button onClick={() => setExpandida(expandida === e.id ? null : e.id)}
                        className="p-1.5 rounded hover:bg-blue-50 text-inst-azul" title="Ver detalle">
                        <span className="material-icons text-lg">
                          {expandida === e.id ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </td>
                  </tr>
                  {expandida === e.id && (
                    <tr key={`${e.id}-detail`}>
                      <td colSpan={8} className="bg-inst-gris/20 px-6 py-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div><span className="text-inst-texto-claro">Evaluado:</span><br /><strong>{e.evaluado}</strong></div>
                          <div><span className="text-inst-texto-claro">Evaluador:</span><br /><strong>{e.evaluador}</strong></div>
                          <div><span className="text-inst-texto-claro">Tipo evaluación:</span><br /><strong>{e.tipo}</strong></div>
                          <div><span className="text-inst-texto-claro">Puntaje:</span><br /><strong className="text-inst-azul text-lg">{e.puntaje}</strong></div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="edl-btn-primary text-sm py-1.5 px-4 flex items-center gap-1">
                            <span className="material-icons text-sm">visibility</span> Ver completo
                          </button>
                          <button className="edl-btn-outline text-sm py-1.5 px-4 flex items-center gap-1">
                            <span className="material-icons text-sm">description</span> Descargar PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
