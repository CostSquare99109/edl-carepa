import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

interface Cargo {
  id: number;
  planta: string;
  dependencia_id: number;
  dependencia_nombre: string;
  nivel: string;
  codigo: string;
  grado: string;
  denominacion: string;
  num_cargos: number;
  naturaleza: string;
  jefe_inmediato: string;
  proposito_principal: string;
  fuente: string;
}

interface Conteos {
  total_cargos: number;
  planta_global: number;
  planta_temporal: number;
  total_detalle: number;
  asignaciones_vigentes: number;
  total_nbc: number;
  total_niveles: number;
  total_naturalezas: number;
}

interface Catalogos {
  niveles: Array<{ codigo: string; nombre: string; descripcion: string; orden: number }>;
  naturalezas: Array<{ codigo: string; nombre: string; descripcion: string; requiere_periodo: number; es_carrera: number }>;
}

const NATURALEZA_COLOR: Record<string, string> = {
  carrera_administrativa: 'bg-green-100 text-green-800',
  libre_nombramiento: 'bg-blue-100 text-blue-800',
  libre_nombramiento_gerencia_publica: 'bg-blue-100 text-blue-800',
  libre_nombramiento_remocion: 'bg-purple-100 text-purple-800',
  periodo_fijo: 'bg-amber-100 text-amber-800',
  temporal: 'bg-orange-100 text-orange-800',
};

const NIVEL_COLOR: Record<string, string> = {
  directivo: 'bg-indigo-100 text-indigo-800',
  asesor: 'bg-blue-100 text-blue-800',
  profesional: 'bg-teal-100 text-teal-800',
  tecnico: 'bg-yellow-100 text-yellow-800',
  asistencial: 'bg-gray-100 text-gray-800',
};

export default function ManualFuncionesIndice() {
  const navigate = useNavigate();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(20);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [filtros, setFiltros] = useState({
    planta: '',
    nivel: '',
    naturaleza: '',
    buscar: '',
  });

  const [conteos, setConteos] = useState<Conteos | null>(null);
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('pagina', String(pagina));
      params.set('por_pagina', String(porPagina));
      if (filtros.planta) params.set('planta', filtros.planta);
      if (filtros.nivel) params.set('nivel', filtros.nivel);
      if (filtros.naturaleza) params.set('naturaleza', filtros.naturaleza);
      if (filtros.buscar) params.set('buscar', filtros.buscar);

      const res = await api.get<any>(`/cargos-manual?${params.toString()}`);
      const items = Array.isArray(res) ? res : (res?.data ?? []);
      const tot = Array.isArray(res) ? res.length : (res?.total ?? 0);
      setCargos(items);
      setTotal(tot);
    } catch (e: any) {
      setError(e.message || 'Error al cargar cargos');
    }
    setCargando(false);
  }, [pagina, porPagina, filtros]);

  const cargarCatalogos = useCallback(async () => {
    try {
      const [c, ct] = await Promise.all([
        api.get<Catalogos>('/cargos-manual/catalogos'),
        api.get<Conteos>('/cargos-manual/conteos'),
      ]);
      setCatalogos(c);
      setConteos(ct);
    } catch (e) {
      // silencioso
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const totalPaginas = Math.ceil(total / porPagina);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-inst-azul-osc mb-1">
          Manual de Funciones
        </h1>
        <p className="text-sm text-gray-600">
          Decreto 159 de 2024 - Anexo 01 - Municipio de Carepa
        </p>
      </div>

      {conteos && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase">Total cargos</div>
            <div className="text-2xl font-bold text-inst-azul-osc">{conteos.total_cargos}</div>
            <div className="text-xs text-gray-500 mt-1">
              Global: {conteos.planta_global} / Temporal: {conteos.planta_temporal}
            </div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase">Asignaciones vigentes</div>
            <div className="text-2xl font-bold text-green-600">{conteos.asignaciones_vigentes}</div>
            <div className="text-xs text-gray-500 mt-1">Funcionarios con cargo del manual</div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase">Secciones de detalle</div>
            <div className="text-2xl font-bold text-indigo-600">{conteos.total_detalle}</div>
            <div className="text-xs text-gray-500 mt-1">7 secciones por cargo</div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase">NBC SNIES</div>
            <div className="text-2xl font-bold text-purple-600">{conteos.total_nbc}</div>
            <div className="text-xs text-gray-500 mt-1">
              {conteos.total_niveles} niveles, {conteos.total_naturalezas} naturalezas
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Buscar denominacion..."
            value={filtros.buscar}
            onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          />
          <select
            value={filtros.planta}
            onChange={(e) => setFiltros({ ...filtros, planta: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Todas las plantas</option>
            <option value="global">Global</option>
            <option value="temporal">Temporal</option>
          </select>
          <select
            value={filtros.nivel}
            onChange={(e) => setFiltros({ ...filtros, nivel: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Todos los niveles</option>
            {catalogos?.niveles.map((n) => (
              <option key={n.codigo} value={n.codigo}>{n.nombre}</option>
            ))}
          </select>
          <select
            value={filtros.naturaleza}
            onChange={(e) => setFiltros({ ...filtros, naturaleza: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Todas las naturalezas</option>
            {catalogos?.naturalezas.map((n) => (
              <option key={n.codigo} value={n.codigo}>{n.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="text-center py-12 text-gray-500">Cargando cargos...</div>
      ) : cargos.length === 0 ? (
        <div className="bg-white border rounded p-12 text-center text-gray-500">
          Sin resultados con los filtros actuales
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Codigo</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Denominacion</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Dependencia</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nivel</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Naturaleza</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Planta</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {cargos.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{c.codigo}-{c.grado}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.denominacion}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.dependencia_nombre || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${NIVEL_COLOR[c.nivel] || 'bg-gray-100 text-gray-800'}`}>
                        {c.nivel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${NATURALEZA_COLOR[c.naturaleza] || 'bg-gray-100 text-gray-800'}`}>
                        {c.naturaleza.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.planta}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{c.num_cargos}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/dashboard/manual-funciones/${c.id}`)}
                        className="text-inst-azul hover:text-inst-azul-osc text-sm font-medium"
                      >
                        Ver ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div>
              Mostrando {(pagina - 1) * porPagina + 1} - {Math.min(pagina * porPagina, total)} de {total}
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagina <= 1}
                onClick={() => setPagina(pagina - 1)}
                className="border rounded px-3 py-1 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                Pagina {pagina} / {totalPaginas || 1}
              </span>
              <button
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina(pagina + 1)}
                className="border rounded px-3 py-1 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}