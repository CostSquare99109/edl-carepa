import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/* ─── Tipos & datos mock ─── */
interface UsuarioItem {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  estado: 'activo' | 'inactivo' | 'bloqueado';
}

const USUARIOS_MOCK: UsuarioItem[] = [
  { id: 1, documento: '1098765432', nombres: 'María', apellidos: 'López Vargas', email: 'maria.lopez@cnsc.gov.co', rol: 'Evaluado', estado: 'activo' },
  { id: 2, documento: '1098765433', nombres: 'Carlos', apellidos: 'Ramírez Soto', email: 'carlos.ramirez@cnsc.gov.co', rol: 'Evaluador', estado: 'activo' },
  { id: 3, documento: '1098765434', nombres: 'Ana', apellidos: 'Martínez Díaz', email: 'ana.martinez@cnsc.gov.co', rol: 'Admin Entidad', estado: 'activo' },
  { id: 4, documento: '1098765435', nombres: 'Pedro', apellidos: 'Gómez Ortiz', email: 'pedro.gomez@cnsc.gov.co', rol: 'Evaluado', estado: 'inactivo' },
  { id: 5, documento: '1098765436', nombres: 'Laura', apellidos: 'Sánchez Peña', email: 'laura.sanchez@cnsc.gov.co', rol: 'Comisión Evaluadora', estado: 'activo' },
  { id: 6, documento: '1098765437', nombres: 'Jorge', apellidos: 'Hernández Ruiz', email: 'jorge.hernandez@cnsc.gov.co', rol: 'Evaluado', estado: 'bloqueado' },
];

const ESTADO_BADGE: Record<string, string> = {
  activo: 'bg-green-100 text-green-800',
  inactivo: 'bg-red-100 text-red-800',
  bloqueado: 'bg-gray-200 text-gray-700',
};

const ROLES = ['Evaluado', 'Evaluador', 'Admin Entidad', 'Comisión Evaluadora', 'Admin CNSC'];
const TIPOS_DOC = ['CC', 'CE', 'TI', 'PA'];

export default function AdminUsuarios() {
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState(USUARIOS_MOCK);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<UsuarioItem | null>(null);

  // Form state
  const [formDoc, setFormDoc] = useState('');
  const [formTipoDoc, setFormTipoDoc] = useState('CC');
  const [formNombres, setFormNombres] = useState('');
  const [formApellidos, setFormApellidos] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRol, setFormRol] = useState('Evaluado');
  const [formEstado, setFormEstado] = useState('activo');

  const filtrados = usuarios.filter(u => {
    const q = busqueda.toLowerCase();
    return u.nombres.toLowerCase().includes(q) || u.apellidos.toLowerCase().includes(q)
      || u.documento.includes(q) || u.email.toLowerCase().includes(q);
  });

  function abrirCrear() {
    setEditando(null);
    setFormDoc(''); setFormTipoDoc('CC'); setFormNombres(''); setFormApellidos('');
    setFormEmail(''); setFormRol('Evaluado'); setFormEstado('activo');
    setModalOpen(true);
  }

  function abrirEditar(u: UsuarioItem) {
    setEditando(u);
    setFormDoc(u.documento); setFormNombres(u.nombres); setFormApellidos(u.apellidos);
    setFormEmail(u.email); setFormRol(u.rol); setFormEstado(u.estado);
    setModalOpen(true);
  }

  function guardar() {
    if (editando) {
      setUsuarios(prev => prev.map(u => u.id === editando.id ? {
        ...u, documento: formDoc, nombres: formNombres, apellidos: formApellidos,
        email: formEmail, rol: formRol, estado: formEstado as UsuarioItem['estado'],
      } : u));
    } else {
      const nuevo: UsuarioItem = {
        id: Date.now(), documento: formDoc, nombres: formNombres, apellidos: formApellidos,
        email: formEmail, rol: formRol, estado: formEstado as UsuarioItem['estado'],
      };
      setUsuarios(prev => [...prev, nuevo]);
    }
    setModalOpen(false);
  }

  function toggleEstado(u: UsuarioItem) {
    setUsuarios(prev => prev.map(x => x.id === u.id ? {
      ...x, estado: x.estado === 'activo' ? 'inactivo' : 'activo',
    } : x));
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-inst-texto-claro mb-4">
        <span className="material-icons text-base text-inst-azul">home</span>
        <span>/</span>
        <span>Admin</span>
        <span>/</span>
        <span className="text-inst-texto font-medium">Usuarios</span>
      </div>

      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-inst-azul flex items-center gap-2">
          <span className="material-icons text-3xl">people</span>
          Gestión de Usuarios
        </h1>
        <button onClick={abrirCrear} className="edl-btn-primary flex items-center gap-2">
          <span className="material-icons text-base">person_add</span>
          Nuevo Usuario
        </button>
      </div>

      {/* Card con tabla */}
      <div className="bg-white rounded-lg border border-inst-borde shadow-sm">
        <div className="px-5 py-4 border-b border-inst-borde flex items-center justify-between">
          <h2 className="font-heading font-semibold text-inst-azul">Listado de Usuarios</h2>
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-inst-texto-claro text-lg">search</span>
            <input
              type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar..." className="edl-input pl-9 !w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(u => (
                <tr key={u.id}>
                  <td className="font-mono text-sm">{u.documento}</td>
                  <td className="font-medium">{u.nombres}</td>
                  <td>{u.apellidos}</td>
                  <td className="text-inst-texto-claro text-sm">{u.email}</td>
                  <td><span className="text-sm">{u.rol}</span></td>
                  <td>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[u.estado]}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => abrirEditar(u)} className="p-1.5 rounded hover:bg-blue-50 text-inst-azul" title="Editar">
                        <span className="material-icons text-lg">edit</span>
                      </button>
                      <button onClick={() => toggleEstado(u)} className="p-1.5 rounded hover:bg-amber-50 text-amber-600" title="Activar/Desactivar">
                        <span className="material-icons text-lg">{u.estado === 'activo' ? 'toggle_on' : 'toggle_off'}</span>
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-50 text-inst-rojo" title="Restablecer contraseña">
                        <span className="material-icons text-lg">lock_reset</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-inst-borde text-sm text-inst-texto-claro">
          Mostrando {filtrados.length} de {usuarios.length} usuarios
        </div>
      </div>

      {/* ── Modal CRUD ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg animate-[fadeIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-inst-borde flex items-center justify-between">
              <h3 className="font-heading font-semibold text-inst-azul text-lg">
                {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-inst-texto-claro">close</span>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-inst-texto mb-1">Tipo documento</label>
                  <select value={formTipoDoc} onChange={e => setFormTipoDoc(e.target.value)} className="edl-input">
                    {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-inst-texto mb-1">Número</label>
                  <input type="text" value={formDoc} onChange={e => setFormDoc(e.target.value)} className="edl-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-inst-texto mb-1">Nombres</label>
                  <input type="text" value={formNombres} onChange={e => setFormNombres(e.target.value)} className="edl-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-inst-texto mb-1">Apellidos</label>
                  <input type="text" value={formApellidos} onChange={e => setFormApellidos(e.target.value)} className="edl-input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-inst-texto mb-1">Correo electrónico</label>
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="edl-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-inst-texto mb-1">Rol</label>
                  <select value={formRol} onChange={e => setFormRol(e.target.value)} className="edl-input">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-inst-texto mb-1">Estado</label>
                  <select value={formEstado} onChange={e => setFormEstado(e.target.value)} className="edl-input">
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-inst-borde flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="edl-btn-outline">Cancelar</button>
              <button onClick={guardar} className="edl-btn-primary flex items-center gap-2">
                <span className="material-icons text-base">{editando ? 'save' : 'person_add'}</span>
                {editando ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
