import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { COLORES } from '../../styles/colors';

interface FilaReporte {
 [key: string]: any;
}

const TIPOS_REPORTE = [
 { value: 'resumen', label: 'Resumen General', endpoint: '/reportes/resumen' },
 { value: 'evaluaciones', label: 'Evaluaciones', endpoint: '/reportes/evaluaciones' },
 { value: 'concertacion', label: 'Concertaciones', endpoint: '/reportes/concertacion' },
 { value: 'compromisos', label: 'Compromisos', endpoint: '/reportes/compromisos' },
 { value: 'entidad', label: 'Por Entidad', endpoint: '' },
 { value: 'dependencia', label: 'Por Dependencia', endpoint: '' },
];

export default function AdminReportes() {
 const [tipo, setTipo] = useState('resumen');
 const [periodoId, setPeriodoId] = useState('');
 const [entidadId, setEntidadId] = useState('');
 const [dependenciaId, setDependenciaId] = useState('');
 const [generando, setGenerando] = useState(false);
 const [datos, setDatos] = useState<FilaReporte[]>([]);
 const [resumen, setResumen] = useState<any>(null);
 const [columnas, setColumnas] = useState<string[]>([]);
 const [mostrarResultado, setMostrarResultado] = useState(false);
 const [error, setError] = useState('');
 const [entidades, setEntidades] = useState<any[]>([]);
 const [periodos, setPeriodos] = useState<any[]>([]);

 useEffect(() => {
 api.get<any>('/entidades?por_pagina=100').then(res => {
 const items = res?.items || res?.data || (Array.isArray(res) ? res : []);
 setEntidades(items);
 }).catch(() => {});
 api.get<any>('/periodos?por_pagina=20').then(res => {
 const items = res?.items || res?.data || (Array.isArray(res) ? res : []);
 setPeriodos(items);
 }).catch(() => {});
 }, []);

 const generar = async () => {
 setGenerando(true); setError(''); setMostrarResultado(false); setResumen(null);
 try {
 let endpoint = '';
 const params = new URLSearchParams();
 if (periodoId) params.set('periodo_id', periodoId);
 if (entidadId && tipo === 'entidad') params.set('entidad_id', entidadId);

 switch (tipo) {
 case 'resumen':
 if (!periodoId) { setError('Seleccione un periodo'); setGenerando(false); return; }
 endpoint = `/reportes/resumen?${params.toString()}`;
 break;
 case 'evaluaciones':
 endpoint = `/reportes/evaluaciones?${params.toString()}`;
 break;
 case 'concertacion':
 endpoint = `/reportes/concertacion?${params.toString()}`;
 break;
 case 'compromisos':
 endpoint = `/reportes/compromisos?${params.toString()}`;
 break;
 case 'entidad':
 if (!entidadId || !periodoId) { setError('Seleccione entidad y periodo'); setGenerando(false); return; }
 endpoint = `/reportes/entidad/${entidadId}?${params.toString()}`;
 break;
 case 'dependencia':
 if (!dependenciaId || !periodoId) { setError('Seleccione dependencia y periodo'); setGenerando(false); return; }
 endpoint = `/reportes/dependencia/${dependenciaId}?${params.toString()}`;
 break;
 }

 const res = await api.get<any>(endpoint);

 if (tipo === 'resumen') {
 setResumen(res);
 setMostrarResultado(true);
 } else {
 let filas: FilaReporte[] = [];
 if (Array.isArray(res)) filas = res;
 else if (res?.data && Array.isArray(res.data)) filas = res.data;
 else if (res?.items && Array.isArray(res.items)) filas = res.items;
 else if (typeof res === 'object' && res !== null) filas = [res];

 if (filas.length > 0) {
 setColumnas(Object.keys(filas[0]));
 setDatos(filas);
 } else {
 setColumnas([]); setDatos([]);
 }
 setMostrarResultado(true);
 }
 } catch (e: any) { setError(e.message || 'Error al generar el reporte'); }
 setGenerando(false);
 };

 const descargarExcel = () => {
 const params = new URLSearchParams();
 if (periodoId) params.set('periodo_id', periodoId);
 api.download(`/reportes/excel/${tipo}?${params.toString()}`, `reporte_${tipo}.csv`);
 };

 const formatCell = (val: any): string => {
 if (val === null || val === undefined) return '-';
 if (typeof val === 'boolean') return val ? 'Si' : 'No';
 if (typeof val === 'number') return val % 1 !== 0 ? val.toFixed(2) : String(val);
 return String(val);
 };

 return (
 <div className="space-y-4 p-4 lg:p-6">
 <h2 className="text-xl font-bold" style={{ color: COLORES.azul }}>Reportes</h2>

 <div className="bg-white rounded-lg shadow-sm p-4">
 <h3 className="text-sm font-semibold mb-3" style={{ color: COLORES.azul }}>Generar Reporte</h3>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-2">Tipo de Reporte</label>
 <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
 {TIPOS_REPORTE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-xs font-medium text-gray-600 mb-2">Periodo</label>
 <select value={periodoId} onChange={e => setPeriodoId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
 <option value="">Seleccionar...</option>
 {periodos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre || p.anio}</option>)}
 </select>
 </div>

 {tipo === 'entidad' && (
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-2">Entidad</label>
 <select value={entidadId} onChange={e => setEntidadId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
 <option value="">Seleccionar...</option>
 {entidades.map((e: any) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
 </select>
 </div>
 )}

 <div className="flex flex-col justify-end gap-2">
 <button onClick={generar} disabled={generando}
 className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
 style={{ backgroundColor: COLORES.azul }}>
 {generando ? 'Generando...' : 'Generar Reporte'}
 </button>
 <button onClick={descargarExcel} disabled={generando}
 className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
 style={{ backgroundColor: COLORES.verde }}>
 Descargar CSV
 </button>
 </div>
 </div>
 </div>

 {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

 {mostrarResultado && resumen && (
 <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
 <h3 className="text-sm font-semibold" style={{ color: COLORES.azul }}>Resumen General</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {resumen.general && Object.entries(resumen.general).map(([key, val]) => (
 <div key={key} className="border rounded-lg p-3 text-center">
 <p className="text-2xl font-bold" style={{ color: COLORES.azul }}>{formatCell(val)}</p>
 <p className="text-xs text-gray-500 mt-1">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
 </div>
 ))}
 </div>
 {resumen.por_calificacion && resumen.por_calificacion.length > 0 && (
 <div>
 <h4 className="text-xs font-semibold text-gray-600 mb-2">Distribucion por Calificacion</h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {resumen.por_calificacion.map((cat: any, i: number) => (
 <div key={i} className="border rounded-lg p-3 text-center">
 <p className="text-xl font-bold" style={{ color: COLORES.verde }}>{cat.total}</p>
 <p className="text-xs text-gray-500">{String(cat.categoria ?? '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 )}

 {mostrarResultado && datos.length > 0 && (
 <div className="bg-white rounded-lg shadow-sm p-4">
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-sm font-semibold" style={{ color: COLORES.azul }}>
 Resultado ({datos.length} registros)
 </h3>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead><tr className="border-b bg-gray-50">
 {columnas.map((col, i) => (
 <th key={i} className="text-left px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">
 {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
 </th>
 ))}
 </tr></thead>
 <tbody>
 {datos.slice(0, 100).map((fila, i) => (
 <tr key={i} className="border-b hover:bg-gray-50 transition">
 {columnas.map((col, j) => (
 <td key={j} className="px-3 py-2 whitespace-nowrap">{formatCell(fila[col])}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 );
}
