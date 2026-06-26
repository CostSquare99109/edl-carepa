import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Select, Input } from '../../components/ui';

interface DependenciaOption {
  id: number;
  nombre: string;
}

interface DependenciaForm {
  nombre: string;
}

interface UsuarioResult {
  id: number;
  documento: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  email: string;
  telefono1: string;
  telefono2: string;
  tipo_documento: string;
}

export default function AdminNuevaDependencia() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');

  const [dependencias, setDependencias] = useState<DependenciaOption[]>([]);

  useEffect(() => {
    api.get<any>('/dependencias?por_pagina=200')
      .then(d => setDependencias(d.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'list') cargar();
  }, [activeTab, pagina, busqueda]);

  const [dependenciaForm, setDependenciaForm] = useState<DependenciaForm>({
    nombre: '',
  });

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioResult | null>(null);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<UsuarioResult[]>([]);
  const [buscandoUsuario, setBuscandoUsuario] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setMostrarResultados(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function buscarUsuario(query: string) {
    setBusquedaUsuario(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResultadosBusqueda([]);
      setMostrarResultados(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setBuscandoUsuario(true);
      try {
        const res = await api.get<any>(`/usuarios?por_pagina=10&busqueda=${encodeURIComponent(query)}&estado=activo`);
        setResultadosBusqueda(res.data || []);
        setMostrarResultados(true);
      } catch {
        setResultadosBusqueda([]);
      } finally {
        setBuscandoUsuario(false);
      }
    }, 300);
  }

  function seleccionarUsuario(u: UsuarioResult) {
    setUsuarioSeleccionado(u);
    setBusquedaUsuario(`${u.primer_nombre} ${u.primer_apellido} - ${u.documento}`);
    setMostrarResultados(false);
  }

  function limpiarUsuario() {
    setUsuarioSeleccionado(null);
    setBusquedaUsuario('');
    setResultadosBusqueda([]);
  }

  function cargar() {
    setLoading(true);
    api.get<any>(`/entidades?pagina=${pagina}&por_pagina=20&busqueda=${busqueda}`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => toast.error('Error al cargar dependencias'))
      .finally(() => setLoading(false));
  }

  function abrirCrear() {
    setDependenciaForm({ nombre: '' });
    limpiarUsuario();
    setActiveTab('create');
  }

  function volverListado() {
    setActiveTab('list');
    cargar();
  }

  async function crearDependenciaConJefe() {
    if (!dependenciaForm.nombre.trim()) { toast.error('Nombre de dependencia requerido'); return; }
    if (!usuarioSeleccionado) { toast.error('Debe seleccionar un Jefe de Personal'); return; }

    setSaving(true);
    try {
      await api.post('/entidades/con-jefe-personal', {
        entidad: { ...dependenciaForm, codigo: '', tipo: 'entidad', nit: '', municipio: '', departamento: '' },
        jefe_personal: { usuario_id: usuarioSeleccionado.id },
      });
      toast.success('Dependencia y Jefe de Personal asignado correctamente');
      volverListado();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear dependencia con Jefe de Personal');
    } finally {
      setSaving(false);
    }
  }

  async function cambiarEstado(id: number, estadoActual: string) {
    const nuevoEstado = estadoActual === 'activa' ? 'inactiva' : 'activa';
    try {
      await api.put(`/entidades/${id}`, { estado: nuevoEstado });
      toast.success(`Dependencia ${nuevoEstado === 'activa' ? 'habilitada' : 'inhabilitada'}`);
      cargar();
    } catch (err) {
      toast.error('Error al cambiar estado');
    }
  }

  if (activeTab === 'create') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={volverListado} className="edl-btn-secondary flex items-center gap-1 text-sm">
            <span className="material-icons text-lg">arrow_back</span>Volver al listado
          </button>
          <h2 className="edl-section-title">Nueva Dependencia</h2>
        </div>

        <div className="bg-gradient-to-r from-inst-azul/5 to-inst-azul/10 border border-inst-azul/20 rounded-lg p-5 mb-6 flex items-start gap-3">
          <span className="material-icons text-inst-azul text-2xl flex-shrink-0 mt-0.5">info</span>
          <div>
            <p className="text-sm text-inst-azul font-medium">Registro de Dependencia con Jefe de Personal</p>
            <p className="text-xs text-inst-texto-claro mt-1">
              Seleccione la dependencia y busque un usuario existente para asignarlo como Jefe de Dependencia con rol <code className="bg-inst-azul/10 px-1 rounded text-inst-azul">jefe_dependencia</code>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 edl-card p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-inst-borde">
              <span className="material-icons text-inst-azul text-xl">business</span>
              <h3 className="font-heading font-bold text-inst-texto">Datos de la Dependencia</h3>
            </div>
            <Select
              label="Dependencia"
              required
              value={dependenciaForm.nombre}
              onChange={e => setDependenciaForm({ ...dependenciaForm, nombre: e.target.value })}
              options={dependencias.map(d => ({ value: d.nombre, label: d.nombre }))}
              placeholder="Seleccione la dependencia"
              iconLeft={<span className="material-icons text-base">account_tree</span>}
            />
          </div>

          <div className="lg:col-span-3 edl-card p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-inst-borde">
              <span className="material-icons text-inst-azul text-xl">admin_panel_settings</span>
              <h3 className="font-heading font-bold text-inst-texto">Jefe de Personal</h3>
              <span className="text-xs bg-inst-azul/10 text-inst-azul px-2 py-0.5 rounded-full font-medium ml-auto">jefe_dependencia</span>
            </div>

            <div className="space-y-4" ref={searchRef}>
              <div className="relative">
                <Input
                  label="Buscar usuario por nombre o documento"
                  required
                  value={busquedaUsuario}
                  onChange={e => { buscarUsuario(e.target.value); if (usuarioSeleccionado && e.target.value !== `${usuarioSeleccionado.primer_nombre} ${usuarioSeleccionado.primer_apellido} - ${usuarioSeleccionado.documento}`) limpiarUsuario(); }}
                  placeholder="Escriba nombre o documento..."
                  iconLeft={<span className="material-icons text-base">search</span>}
                  iconRight={usuarioSeleccionado ? <button type="button" onClick={limpiarUsuario} className="text-inst-texto-claro hover:text-inst-rojo"><span className="material-icons text-base">close</span></button> : undefined}
                />
                {buscandoUsuario && (
                  <span className="absolute right-3 top-1/2 translate-y-2 text-inst-texto-claro">
                    <span className="material-icons text-base animate-spin">sync</span>
                  </span>
                )}
                {mostrarResultados && resultadosBusqueda.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-inst-borde rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {resultadosBusqueda.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => seleccionarUsuario(u)}
                        className="w-full text-left px-4 py-3 hover:bg-inst-azul/5 border-b border-inst-borde/50 last:border-b-0 transition-colors"
                      >
                        <p className="text-sm font-medium text-inst-texto">{u.primer_nombre} {u.segundo_nombre} {u.primer_apellido} {u.segundo_apellido}</p>
                        <p className="text-xs text-inst-texto-claro flex items-center gap-3 mt-0.5">
                          <span>{u.documento}</span>
                          <span>{u.email}</span>
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {mostrarResultados && busquedaUsuario.trim().length >= 2 && resultadosBusqueda.length === 0 && !buscandoUsuario && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-inst-borde rounded-lg shadow-lg p-4 text-center text-sm text-inst-texto-claro">
                    No se encontraron usuarios con ese criterio
                  </div>
                )}
              </div>

              {usuarioSeleccionado && (
                <div className="bg-inst-azul/5 border border-inst-azul/20 rounded-lg p-4 animate-fadeIn">
                  <p className="text-xs text-inst-azul font-medium uppercase tracking-wider mb-2">Usuario seleccionado</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p className="text-inst-texto-claro col-span-2">
                      <span className="font-medium text-inst-texto">{usuarioSeleccionado.primer_nombre} {usuarioSeleccionado.segundo_nombre} {usuarioSeleccionado.primer_apellido} {usuarioSeleccionado.segundo_apellido}</span>
                    </p>
                    <p className="text-inst-texto-claro"><span className="material-icons text-xs align-text-bottom mr-1">badge</span>Doc: <span className="font-medium text-inst-texto">{usuarioSeleccionado.documento}</span></p>
                    <p className="text-inst-texto-claro"><span className="material-icons text-xs align-text-bottom mr-1">email</span>{usuarioSeleccionado.email}</p>
                    {usuarioSeleccionado.telefono1 && (
                      <p className="text-inst-texto-claro"><span className="material-icons text-xs align-text-bottom mr-1">phone</span>{usuarioSeleccionado.telefono1}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={volverListado} className="edl-btn-secondary">Cancelar</button>
          <button
            onClick={crearDependenciaConJefe}
            disabled={saving}
            className="edl-btn-primary flex items-center gap-2 px-6"
          >
            {saving ? (
              <span className="material-icons text-sm animate-spin">sync</span>
            ) : (
              <span className="material-icons text-sm">how_to_reg</span>
            )}
            {saving ? 'Creando...' : 'Crear Dependencia y Asignar Jefe'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="edl-section-title">Gestión de Dependencias</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-icons text-inst-texto-claro text-base absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
            <input
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              placeholder="Buscar dependencia..."
              className="edl-input pl-10 pr-4 py-2 text-sm w-64"
            />
          </div>
          <button onClick={abrirCrear} className="edl-btn-primary flex items-center gap-2">
            <span className="material-icons">add</span> Nueva Dependencia con Jefe de Personal
          </button>
        </div>
      </div>

      <div className="edl-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-inst-azul/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-inst-azul uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-inst-azul uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-inst-azul uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inst-borde">
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-inst-texto-claro">Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-inst-texto-claro">No se encontraron dependencias</td></tr>
            ) : (
              items.map(e => (
                <tr key={e.id} className={e.estado === 'inactiva' ? 'opacity-60 bg-inst-gris/20' : ''}>
                  <td className="px-4 py-3 text-sm">{e.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      e.estado === 'activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>{e.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => cambiarEstado(e.id, e.estado)}
                        className="p-2 rounded hover:bg-inst-gris text-inst-azul transition-colors"
                        title={e.estado === 'activa' ? 'Inhabilitar' : 'Habilitar'}
                      >
                        <span className="material-icons text-lg">
                          {e.estado === 'activa' ? 'block' : 'check_circle'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {total > 20 && (
          <div className="p-4 border-t border-inst-borde flex items-center justify-between">
            <span className="text-sm text-inst-texto-claro">
              Mostrando {((pagina - 1) * 20) + 1} - {Math.min(pagina * 20, total)} de {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1 || loading}
                className="edl-btn-outline text-sm"
              >
                <span className="material-icons text-sm">chevron_left</span> Anterior
              </button>
              <button
                onClick={() => setPagina(p => p + 1)}
                disabled={pagina * 20 >= total || loading}
                className="edl-btn-outline text-sm"
              >
                Siguiente <span className="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
