import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/* ─── Tipos & datos mock ─── */
interface DependenciaItem {
  id: number;
  nombre: string;
  codigo: string;
  entidad: string;
  estado: 'activa' | 'inactiva';
  funcionarios: number;
}

const DEPENDENCIAS_MOCK: DependenciaItem[] = [
  { id: 1, nombre: 'Dirección General', codigo: 'DG-001', entidad: 'CNSC', estado: 'activa', funcionarios: 45 },
  { id: 2, nombre: 'Recursos Humanos', codigo: 'RH-002', entidad: 'CNSC', estado: 'activa', funcionarios: 23 },
  { id: 3, nombre: 'Planeación', codigo: 'PL-003', entidad: 'CNSC', estado: 'activa', funcionarios: 18 },
  { id: 4, nombre: 'Jurídica', codigo: 'JU-004', entidad: 'CNSC', estado: 'activa', funcionarios: 12 },
  { id: 5, nombre: 'Tecnología', codigo: 'TE-005', entidad: 'CNSC', estado: 'inactiva', funcionarios: 8 },
];

const ESTADO_BADGE: Record<string, string> = {
  activa: 'bg-green-100 text-green-800',
  inactiva: 'bg-red-100 text-red-800',
};

const ENTIDADES = ['CNSC', 'DNP', 'MinHacienda', 'DANE'];

export default function AdminDependencias() {
  const [busqueda, setBusqueda] = useState('');
  const [deps, setDeps] = useState(DEPENDENCIAS_MOCK);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<DependenciaItem | null>(null);

  const [formNombre, setFormNombre] = useState('');
  const [formCodigo, setFormCodigo] = useState('');
  const [formEntidad, setFormEntidad] = useState('CNSC');
  const [formEstado, setFormEstado] = useState('activa');

  const filtradas = deps.filter(d => {
    const q = busqueda.toLowerCase();
    return d.nombre.toLowerCase().includes(q) || d.codigo.toLowerCase().includes(q);
  });

  function abrirCrear() {
    setEditando(null);
    setFormNombre(''); setFormCodigo(''); setFormEntidad('CNSC'); setFormEstado('activa');
    setModalOpen(true);
  }

  function abrirEditar(d: DependenciaItem) {
    setEditando(d);
    setFormNombre(d.nombre); setFormCodigo(d.codigo); setFormEntidad(d.entidad); setFormEstado(d.estado);
    setModalOpen(true);
  }

  function guardar() {
    if (editando) {
      setDeps(prev => prev.map(d => d.id === editando.id ? {
        ...d, nombre: formNombre, codigo: formCodigo, entidad: formEntidad,
        estado: formEstado as DependenciaItem['estado'],
      } : d));
    } else {
      const nueva: DependenciaItem = {
        id: Date.now(), nombre: formNombre, codigo: formCodigo, entidad: formEntidad,
        estado: formEstado as DependenciaItem['estado'], funcionarios: 0,
      };
      setDeps(prev => [...prev, nueva]);
    }
    setModalOpen(false);
  }

  function toggleEstado(d: DependenciaItem) {
    setDeps(prev => prev.map(x => x.id === d.id ? {
      ...x, estado: x.estado === 'activa' ? 'inactiva' : 'activa',
    } : x));
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-inst-texto-claro mb-4">
        <span className="material-icons text-base text-inst-azul">home</span>
        <span>/</span><span>Admin</span><span>/</span>
        <span className="text-inst-texto font-medium">Dependencias</span>
      </div>

      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-inst-azul flex items-center gap-2">
          <span className="material-icons text-3xl">account_tree</span>
          Gestión de Dependencias
        </h1>
        <button onClick={abrirCrear} className="edl-btn-primary flex items-center gap-2">
          <span className="material-icons text-base">add_business</span>
          Nueva Dependencia
        </button>
      </div>

      {/* Card con tabla */}
      <div className="bg-white rounded-lg border border-inst-borde shadow-sm">
        <div className="px-5 py-4 border-b border-inst-borde flex items-center justify-between">
          <h2 className="font-heading font-semibold text-inst-azul">Listado de Dependencias</h2>
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-inst-texto-claro text-lg">search</span>
            <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar..." className="edl-input pl-9 !w-64" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr><th>Nombre</th><th>Código</th><th>Entidad</th><th>Estado</th><th>Funcionarios</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtradas.map(d => (
                <tr key={d.id}>
                  <td className="font-medium">{d.nombre}</td>
                  <td className="font-mono text-sm">{d.codigo}</td>
                  <td className="text-inst-texto-claro">{d.entidad}</td>
                  <td>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[d.estado]}`}>
                      {d.estado}
                    </span>
                  </td>
                  <td className="text-center font-semibold text-inst-azul">{d.funcionarios}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => abrirEditar(d)} className="p-1.5 rounded hover:bg-blue-50 text-inst-azul" title="Editar">
                        <span className="material-icons text-lg">edit</span>
                      </button>
                      <button onClick={() => toggleEstado(d)} className="p-1.5 rounded hover:bg-amber-50 text-amber-600" title="Activar/Desactivar">
                        <span className="material-icons text-lg">{d.estado === 'activa' ? 'toggle_on' : 'toggle_off'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-inst-borde text-sm text-inst-texto-claro">
          Mostrando {filtradas.length} de {deps.length} dependencias
        </div>
      </div>

      {/* ── Modal CRUD ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg animate-[fadeIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-inst-borde flex items-center justify-between">
              <h3 className="font-heading font-semibold text-inst-azul text-lg">
                {editando ? 'Editar Dependencia' : 'Nueva Dependencia'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-inst-texto-claro">close</span>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-inst-texto mb-1">Nombre</label>
                <input type="text" value={formNombre} onChange={e => setFormNombre(e.target.value)} className="edl-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-inst-texto mb-1">Código</label>
                  <input type="text" value={formCodigo} onChange={e => setFormCodigo(e.target.value)} className="edl-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-inst-texto mb-1">Entidad</label>
                  <select value={formEntidad} onChange={e => setFormEntidad(e.target.value)} className="edl-input">
                    {ENTIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-inst-texto mb-1">Estado</label>
                <select value={formEstado} onChange={e => setFormEstado(e.target.value)} className="edl-input">
                  <option value="activa">Activa</option>
                  <option value="inactiva">Inactiva</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-inst-borde flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="edl-btn-outline">Cancelar</button>
              <button onClick={guardar} className="edl-btn-primary flex items-center gap-2">
                <span className="material-icons text-base">{editando ? 'save' : 'add_business'}</span>
                {editando ? 'Guardar Cambios' : 'Crear Dependencia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
