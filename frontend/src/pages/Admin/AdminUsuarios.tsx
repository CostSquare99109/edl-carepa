import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, PaginatedData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input, Select, Alert, Badge, Modal, EmptyState, DataTable, Tooltip, SkeletonText } from '../../components/ui';
import type { DataTableColumn } from '../../components/ui';
import { toast } from 'sonner';

interface Usuario {
  id: number;
  documento: string;
  tipo_documento: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  telefono1?: string;
  telefono2?: string;
  genero?: string;
  municipio?: string;
  departamento?: string;
  dependencia_id?: number;
  dependencia_nombre?: string;
  es_evaluador_y_evaluado: number;
  dependencia_evaluacion_id?: number;
  dependencia_evaluacion_nombre?: string;
  es_contratista: number;
  nivel?: string;
  naturaleza?: string;
  tipo_nombramiento?: string;
  denominacion_empleo?: string;
  codigo_empleo?: string;
  grado_empleo?: string;
  en_periodo_prueba: number;
  fecha_posesion?: string;
  proposito_principal_empleo?: string;
  evaluacion_inicio_febrero: number;
  fecha_inicio_evaluacion?: string;
  motivo_fecha_inicio_diferente?: string;
  estado: string;
  roles: { codigo: string; nombre: string }[];
}

interface Dependencia {
  id: number;
  nombre: string;
  codigo: string;
}

const ROLES_SISTEMA = [
  { codigo: 'admin_carepa', nombre: 'Administrador CAREPA' },
  { codigo: 'jefe_dependencia', nombre: 'Jefe de Dependencia' },
  { codigo: 'comision_evaluadora', nombre: 'Comisión Evaluadora' },
  { codigo: 'evaluador', nombre: 'Evaluador' },
  { codigo: 'evaluado', nombre: 'Evaluado' },
  { codigo: 'cargador', nombre: 'Cargador' },
];

// Constantes alineadas con el enum del schema SQL
const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'PA', label: 'Pasaporte (PA)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
  { value: 'RC', label: 'Registro Civil (RC)' },
  { value: 'DIP', label: 'Diplomático (DIP)' },
  { value: 'NIT', label: 'NIT' },
];

const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

const DEPARTAMENTOS = [
  'Antioquia', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
  'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare',
  'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander',
  'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander',
  'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
];

const NIVELES = [
  { value: 'directivo', label: 'Directivo' },
  { value: 'asesor', label: 'Asesor' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'asistencial', label: 'Asistencial' },
];

const NATURALEZAS = [
  { value: 'carrera_administrativa', label: 'Carrera Administrativa' },
  { value: 'libre_nombramiento', label: 'Libre Nombramiento' },
  { value: 'libre_nombramiento_gerencia_publica', label: 'Libre Nombramiento — Gerencia Pública' },
];

const TIPOS_NOMBRAMIENTO = [
  { value: 'hecho_en_carrera', label: 'Hecho en carrera' },
  { value: 'periodo_de_prueba', label: 'Periodo de prueba' },
  { value: 'provisional', label: 'Provisional' },
  { value: 'encargo_planta_global', label: 'Encargo — Planta global' },
  { value: 'encargo_planta_temporal', label: 'Encargo — Planta temporal' },
  { value: 'encargo_vacancia_definitiva', label: 'Encargo — Vacancia definitiva' },
  { value: 'encargo_vacancia_temporal', label: 'Encargo — Vacancia temporal' },
];

const MOTIVOS_FECHA_INICIO = [
  { value: 'terminacion_periodo_prueba', label: 'Terminación Periodo de prueba' },
  { value: 'terminacion_vacancia_temporal', label: 'Terminación de la vacancia temporal' },
  { value: 'regreso_vacaciones', label: 'Regreso de vacaciones' },
  { value: 'regreso_incapacidad', label: 'Regreso de incapacidad' },
  { value: 'regreso_encargo', label: 'Regreso de un encargo' },
  { value: 'regreso_comision_servicios', label: 'Regreso de comisión de servicios' },
  { value: 'regreso_licencia', label: 'Regreso de licencia' },
  { value: 'suspension_ejercicio_cargo', label: 'Suspensión del ejercicio del cargo' },
  { value: 'otro', label: 'Otro' },
];

export default function AdminUsuarios() {
  const { usuario, rolActivo } = useAuth();
  const [searchParams] = useSearchParams();
  const filtroInicial = searchParams.get('filtro') || '';
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState(filtroInicial);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);

  // Estado del formulario completo según CNSC
  const [form, setForm] = useState({
    documento: '',
    tipo_documento: 'CC',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    genero: '',
    departamento: 'Antioquia',
    municipio: '',
    email: '',
    email_confirmar: '',
    telefono1: '',
    telefono2: '',
    password: '',
    estado: 'activo',
    es_contratista: 0,
    nivel: '',
    naturaleza: '',
    tipo_nombramiento: '',
    dependencia_id: '',
    denominacion_empleo: '',
    codigo_empleo: '',
    grado_empleo: '',
    es_evaluador_y_evaluado: 0,
    dependencia_evaluacion_id: '',
    en_periodo_prueba: 0,
    fecha_posesion: '',
    proposito_principal_empleo: '',
    evaluacion_inicio_febrero: 1,
    fecha_inicio_evaluacion: '',
    motivo_fecha_inicio_diferente: '',
    roles: ['evaluado'] as string[],
  });

  const ROLES_VALIDOS = ['jefe_dependencia', 'admin_carepa', 'evaluador', 'evaluado', 'comision_evaluadora', 'cargador'];

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      // Validar y sanear filtroRol
      const rolValido = filtroRol && ROLES_VALIDOS.includes(filtroRol) ? filtroRol : '';
      if (rolValido !== filtroRol && filtroRol) {
        setFiltroRol(''); // Limpiar filtro inválido
      }
      let url = `/usuarios?pagina=${pagina}&por_pagina=20`;
      if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`;
      if (rolValido) url += `&rol=${encodeURIComponent(rolValido)}`;
      if (rolActivo === 'jefe_dependencia' && usuario?.dependencia_id) {
        url += `&dependencia_id=${usuario.dependencia_id}`;
      }
      const res = await api.get<PaginatedData<Usuario>>(url);
      setUsuarios(res.data || []);
      setTotal(res.total || 0);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error desconocido'); }
    setCargando(false);
  }, [pagina, busqueda, filtroRol, rolActivo, usuario?.dependencia_id]);

  const cargarDependencias = useCallback(async () => {
    try {
      const res = await api.get<PaginatedData<Dependencia>>('/dependencias?por_pagina=100');
      setDependencias(res.data || []);
    } catch (e) {
      console.error('Error cargando dependencias:', e);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  // Carga forzada al montar (garantiza carga inicial aunque falle useEffect anterior)
  useEffect(() => { cargar(); }, []);
  useEffect(() => { if (modalAbierto) cargarDependencias(); }, [modalAbierto, cargarDependencias]);

  const resetForm = () => ({
    documento: '',
    tipo_documento: 'CC',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    genero: '',
    departamento: 'Antioquia',
    municipio: '',
    email: '',
    email_confirmar: '',
    telefono1: '',
    telefono2: '',
    password: '',
    estado: 'activo',
    es_contratista: 0,
    nivel: '',
    naturaleza: '',
    tipo_nombramiento: '',
    dependencia_id: rolActivo === 'jefe_dependencia' && usuario?.dependencia_id ? String(usuario.dependencia_id) : '',
    denominacion_empleo: '',
    codigo_empleo: '',
    grado_empleo: '',
    es_evaluador_y_evaluado: 0,
    dependencia_evaluacion_id: '',
    en_periodo_prueba: 0,
    fecha_posesion: '',
    proposito_principal_empleo: '',
    evaluacion_inicio_febrero: 1,
    fecha_inicio_evaluacion: '',
    motivo_fecha_inicio_diferente: '',
    roles: ['evaluado'] as string[],
  });

  const abrirCrear = () => {
    setEditando(null);
    setForm({
      ...resetForm(),
      en_periodo_prueba: rolActivo === 'jefe_dependencia' ? -1 : 0,
      evaluacion_inicio_febrero: rolActivo === 'jefe_dependencia' ? -1 : 1,
    });
    setModalAbierto(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setForm({
      documento: u.documento,
      tipo_documento: u.tipo_documento || 'CC',
      primer_nombre: u.primer_nombre || '',
      segundo_nombre: u.segundo_nombre || '',
      primer_apellido: u.primer_apellido || '',
      segundo_apellido: u.segundo_apellido || '',
      genero: u.genero || '',
      departamento: u.departamento || 'Antioquia',
      municipio: u.municipio || '',
      email: u.email || '',
      email_confirmar: u.email || '',
      telefono1: u.telefono1 || '',
      telefono2: u.telefono2 || '',
      password: '',
      estado: u.estado || 'activo',
      es_contratista: u.es_contratista || 0,
      nivel: u.nivel || '',
      naturaleza: u.naturaleza || '',
      tipo_nombramiento: u.tipo_nombramiento || '',
      dependencia_id: rolActivo === 'jefe_dependencia' && usuario?.dependencia_id ? String(usuario.dependencia_id) : (u.dependencia_id ? String(u.dependencia_id) : ''),
      denominacion_empleo: u.denominacion_empleo || '',
      codigo_empleo: u.codigo_empleo || '',
      grado_empleo: u.grado_empleo || '',
      es_evaluador_y_evaluado: u.es_evaluador_y_evaluado || 0,
      dependencia_evaluacion_id: u.dependencia_evaluacion_id ? String(u.dependencia_evaluacion_id) : '',
      en_periodo_prueba: u.en_periodo_prueba,
      fecha_posesion: u.fecha_posesion || '',
      proposito_principal_empleo: u.proposito_principal_empleo || '',
      evaluacion_inicio_febrero: u.evaluacion_inicio_febrero,
      fecha_inicio_evaluacion: u.fecha_inicio_evaluacion || '',
      motivo_fecha_inicio_diferente: u.motivo_fecha_inicio_diferente || '',
      roles: u.roles?.map(r => r.codigo) || ['evaluado'],
    });
    setModalAbierto(true);
  };

  function validarFormulario(): string | null {
    if (!form.documento.trim()) return 'El número de documento es requerido';
    if (!form.primer_nombre.trim()) return 'El primer nombre es requerido';
    if (!form.primer_apellido.trim()) return 'El primer apellido es requerido';
    if (!form.email.trim()) return 'El correo electrónico es requerido';
    if (form.email !== form.email_confirmar) return 'El correo y la confirmación del correo no coinciden';
    if (rolActivo !== 'jefe_dependencia') {
      if (!editando && !form.password) return 'La contraseña es requerida para usuarios nuevos';
      if (!editando && form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (form.es_contratista === 0) {
      if (!form.nivel && !editando) return 'El nivel es requerido para servidores (no contratistas)';
      if (!form.naturaleza && !editando) return 'La naturaleza es requerida para servidores (no contratistas)';
      if (!form.tipo_nombramiento && !editando) return 'El tipo de nombramiento es requerido';
      if (!form.denominacion_empleo.trim() && !editando) return 'La denominación del empleo es requerida';
      if (!form.dependencia_id) return 'La dependencia es requerida';
    }
    if (form.es_evaluador_y_evaluado === 1 && !form.dependencia_evaluacion_id) {
      return 'Si el usuario es evaluador y evaluado, debe indicar la dependencia donde realiza la evaluación';
    }
    if (form.en_periodo_prueba === 1 && !form.fecha_posesion) {
      return 'Si el usuario está en periodo de prueba, debe indicar la fecha de posesión';
    }
    if (rolActivo === 'jefe_dependencia') {
      if (form.evaluacion_inicio_febrero === 0) {
        if (!form.fecha_inicio_evaluacion) return 'Debe indicar la fecha de inicio del período de evaluación';
        if (!form.motivo_fecha_inicio_diferente) return 'Debe indicar el motivo de fecha de inicio diferente';
      }
      // Validar que se asigne al menos un rol (evaluador o evaluado)
      if (form.roles.length === 0) {
        return 'Debe asignar al menos un rol: Evaluador o Evaluado';
      }
    } else {
      if (form.evaluacion_inicio_febrero === 0) {
        if (!form.fecha_inicio_evaluacion) return 'Debe indicar la fecha de inicio del período de evaluación';
        if (!form.motivo_fecha_inicio_diferente) return 'Debe indicar el motivo de fecha de inicio diferente';
      }
    }
    return null;
  }

  const guardar = async () => {
    const errorValid = validarFormulario();
    if (errorValid) { toast.error(errorValid); return; }

    setGuardando(true);
    try {
      // Mapear frontend a backend (algunos campos cambian de nombre)
      const payload: Record<string, unknown> = {
        documento: form.documento.trim(),
        tipo_documento: form.tipo_documento,
        primer_nombre: form.primer_nombre.trim(),
        segundo_nombre: form.segundo_nombre.trim() || null,
        primer_apellido: form.primer_apellido.trim(),
        segundo_apellido: form.segundo_apellido.trim() || null,
        email: form.email.trim(),
        genero: form.genero || null,
        telefono1: form.telefono1.trim() || null,
        telefono2: form.telefono2.trim() || null,
        es_contratista: form.es_contratista,
        nivel: form.es_contratista ? null : (form.nivel || null),
        naturaleza: form.es_contratista ? null : (form.naturaleza || null),
        tipo_nombramiento: form.es_contratista ? null : (form.tipo_nombramiento || null),
        dependencia_id: form.dependencia_id ? Number(form.dependencia_id) : null,
        denominacion_empleo: form.denominacion_empleo.trim() || null,
        codigo_empleo: form.codigo_empleo.trim() || null,
        grado_empleo: form.grado_empleo.trim() || null,
        es_evaluador_y_evaluado: form.es_evaluador_y_evaluado,
        dependencia_evaluacion_id: form.dependencia_evaluacion_id ? Number(form.dependencia_evaluacion_id) : null,
        en_periodo_prueba: form.en_periodo_prueba === -1 ? 0 : form.en_periodo_prueba,
        fecha_posesion: form.fecha_posesion || null,
        proposito_principal_empleo: form.proposito_principal_empleo.trim() || null,
        evaluacion_inicio_febrero: form.evaluacion_inicio_febrero === -1 ? 1 : form.evaluacion_inicio_febrero,
      };

      if (rolActivo !== 'jefe_dependencia') {
        payload.departamento = form.departamento || null;
        payload.municipio = form.municipio.trim() || null;
        payload.estado = form.estado;
      }

      payload.fecha_inicio_evaluacion = form.fecha_inicio_evaluacion || null;
      payload.motivo_fecha_inicio_diferente = form.motivo_fecha_inicio_diferente || null;

      if (rolActivo === 'jefe_dependencia' && !editando) {
        payload.password = form.documento.trim();
      } else if (form.password) {
        payload.password = form.password;
      }

      let usuarioId: number;
      if (editando) {
        await api.put(`/usuarios/${editando.id}`, payload);
        usuarioId = editando.id;
        toast.success('Usuario actualizado correctamente');
      } else {
        const res = await api.post<{ id: number }>('/usuarios', payload);
        usuarioId = res.id;
        toast.success('Usuario creado correctamente');
      }

      // Asignar roles si es jefe_dependencia
      if (rolActivo === 'jefe_dependencia' && usuarioId && form.roles.length > 0) {
        try {
          await api.put(`/usuarios/${usuarioId}/roles`, { roles: form.roles });
          toast.success('Roles asignados correctamente');
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Error al asignar roles');
        }
      }

      setModalAbierto(false); cargar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar usuario');
    }
    setGuardando(false);
  };

  const toggleEstado = async (u: Usuario) => {
    const nuevo = u.estado === 'activo' ? 'inactivo' : 'activo';
    try { await api.put(`/usuarios/${u.id}`, { estado: nuevo }); toast.success(`Usuario ${nuevo}`); cargar(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error al cambiar estado'); }
  };

  const restablecerPassword = async (u: Usuario) => {
    if (!confirm(`¿Restablecer contraseña de ${u.primer_nombre} ${u.primer_apellido}?`)) return;
    try {
      const res = await api.put<{ password_temporal: string }>(`/usuarios/${u.id}/restablecer-password`);
      toast.success(`Contraseña temporal: ${res.password_temporal}`, { duration: 10_000 });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al restablecer contraseña');
    }
  };

  const eliminarUsuario = async (u: Usuario) => {
    if (!confirm(`¿Eliminar usuario "${u.primer_nombre} ${u.primer_apellido}" (${u.documento})? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/usuarios/${u.id}`);
      toast.success(`Usuario ${u.primer_nombre} ${u.primer_apellido} eliminado correctamente`);
      cargar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar usuario');
    }
  };

  const totalPages = Math.ceil(total / 20);

  const columnsBase: DataTableColumn<Usuario>[] = [
    { key: 'documento', header: 'Documento', render: (u) => <span className="font-mono text-xs">{u.documento}</span> },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (u) => `${u.primer_nombre || ''} ${u.segundo_nombre || ''} ${u.primer_apellido || ''} ${u.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim() || '—'
    },
    { key: 'email', header: 'Email', render: (u) => u.email || <span className="text-inst-texto-claro">—</span> },
    { key: 'cargo', header: 'Cargo', render: (u) => u.denominacion_empleo || <span className="text-inst-texto-claro">—</span> },
    { key: 'grado', header: 'Grado', render: (u) => u.grado_empleo || <span className="text-inst-texto-claro">—</span> },
    { key: 'dependencia', header: 'Dependencia', render: (u) => u.dependencia_nombre || <span className="text-inst-texto-claro">Sin dependencia</span> },
    {
      key: 'roles',
      header: 'Roles',
      render: (u) => {
        const rolesVisibles = rolActivo === 'jefe_dependencia'
          ? (u.roles || []).filter(r => !['jefe_dependencia', 'admin_carepa'].includes(r.codigo))
          : (u.roles || []);
        return (
          <div className="flex gap-1 flex-wrap">
            {rolesVisibles.map((r) => (
              <Badge key={r.codigo} tone={r.codigo.startsWith('admin') ? 'danger' : r.codigo === 'evaluador' ? 'success' : 'info'}>
                {r.nombre || r.codigo}
              </Badge>
            ))}
            {rolesVisibles.length === 0 ? <span className="text-xs text-inst-texto-claro">Sin rol</span> : null}
          </div>
        );
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (u) => (
        <button
          type="button"
          onClick={() => toggleEstado(u)}
          className="focus:outline-none focus:ring-2 focus:ring-inst-azul rounded-full"
          aria-label={`Cambiar estado de ${u.primer_nombre} ${u.primer_apellido}`}
        >
          <Badge tone={u.estado === 'activo' ? 'success' : 'neutral'} dot>
            {u.estado === 'activo' ? 'Activo' : u.estado === 'bloqueado' ? 'Bloqueado' : 'Inactivo'}
          </Badge>
        </button>
      ),
    },
    {
      key: 'acciones',
      header: 'Opciones',
      align: 'center',
      render: (u) => (
        <div className="flex gap-1 justify-center">
          <Tooltip content="Editar usuario">
            <Button variant="outline" size="sm" iconLeft={<span className="material-icons text-sm">edit</span>} onClick={() => abrirEditar(u)}>
              Editar
            </Button>
          </Tooltip>
          <Tooltip content="Restablecer contraseña">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => restablecerPassword(u)}
              aria-label={`Restablecer contraseña de ${u.primer_nombre} ${u.primer_apellido}`}
            >
              <span className="material-icons text-base">lock_reset</span>
            </Button>
          </Tooltip>
          <Tooltip content="Eliminar usuario">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => eliminarUsuario(u)}
              aria-label={`Eliminar usuario ${u.primer_nombre} ${u.primer_apellido}`}
              className="text-inst-rojo hover:bg-red-50"
            >
              <span className="material-icons text-base">delete</span>
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const ocultarColumnas = rolActivo === 'jefe_dependencia' ? ['email', 'grado'] : [];
  const columns = columnsBase.filter(c => !ocultarColumnas.includes(c.key));

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 animate-fadeIn">
        <h2 className="text-xl font-heading font-bold text-inst-azul">
          <span className="material-icons align-middle mr-2 text-2xl">people</span>
          Usuarios
        </h2>
        <Button variant="primary" iconLeft={<span className="material-icons text-base">person_add</span>} onClick={abrirCrear}>
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[240px]">
            <Input
              label="Buscar"
              type="search"
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              placeholder="Buscar por nombre o documento..."
              iconLeft={<span className="material-icons text-base">search</span>}
            />
          </div>
          <div className="min-w-[180px]">
            <Select
              label="Rol"
              value={filtroRol}
              onChange={e => { setFiltroRol(e.target.value); setPagina(1); }}
              placeholder="Todos los roles"
              options={ROLES_SISTEMA
                .filter(r => rolActivo !== 'jefe_dependencia' || !['jefe_dependencia', 'admin_carepa'].includes(r.codigo))
                .map(r => ({ value: r.codigo, label: r.nombre }))}
            />
          </div>
        </div>
      </Card>

      {error && (
        <Alert tone="danger" title="Error al cargar usuarios" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        {cargando ? (
          <SkeletonText lines={8} />
        ) : usuarios.length === 0 ? (
          <EmptyState
            icon={<span className="material-icons text-3xl">person_off</span>}
            title="Sin usuarios"
            description="No se encontraron usuarios con los filtros actuales. Cree uno con el botón superior."
            action={<Button variant="primary" onClick={abrirCrear}>Crear usuario</Button>}
          />
        ) : (
          <DataTable<Usuario>
            columns={columns}
            data={usuarios}
            rowKey={(u) => u.id}
            ariaLabel="Lista de usuarios"
            caption="Usuarios del sistema"
          />
        )}

        {totalPages > 1 && !cargando && usuarios.length > 0 && (
          <div className="flex items-center justify-between gap-3 p-3 mt-3 border-t border-inst-borde">
            <div className="text-sm text-inst-texto-claro">
              Mostrando {((pagina - 1) * 20) + 1} - {Math.min(pagina * 20, total)} de {total} usuarios
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-3 py-3 py-1 rounded text-sm bg-inst-surface border hover:bg-inst-gris disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Página anterior"
              >
                <span className="material-icons text-sm">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, pagina - 3), pagina + 2)
                .map(p => (
                  <button
                    key={p}
                    onClick={() => setPagina(p)}
                    className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul text-white' : 'bg-inst-surface border hover:bg-inst-gris'}`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => setPagina(p => Math.min(totalPages, p + 1))}
                disabled={pagina === totalPages}
                className="px-3 py-1 rounded text-sm bg-inst-surface border hover:bg-inst-gris disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Página siguiente"
              >
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </Card>

      {modalAbierto && (
        <Modal
          open={true}
          onClose={() => setModalAbierto(false)}
          title={editando ? 'Editar Usuario' : 'Nuevo Usuario'}
          description="Formulario completo conforme al Sistema Tipo EDL (Acuerdo 617/2018)"
          size="xl"
        >
          <div className="space-y-4">

            {/* SECCIÓN 1: IDENTIFICACIÓN */}
            <div className="edl-card border-l-4 border-l-inst-azul">
              <h4 className="font-heading font-semibold text-inst-azul mb-3">1. Identificación</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Select
                  label="Tipo de documento"
                  value={form.tipo_documento}
                  onChange={e => setForm({ ...form, tipo_documento: e.target.value })}
                  options={TIPOS_DOCUMENTO}
                />
                <Input
                  label="Número de documento"
                  type="text"
                  required
                  value={form.documento}
                  onChange={e => setForm({ ...form, documento: e.target.value })}
                  disabled={!!editando}
                  helperText={editando ? 'El documento no se puede modificar' : undefined}
                />
                <Select
                  label="Género"
                  value={form.genero}
                  onChange={e => setForm({ ...form, genero: e.target.value })}
                  placeholder="Seleccionar..."
                  options={GENEROS}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                <Input
                  label="Primer nombre"
                  type="text"
                  required
                  value={form.primer_nombre}
                  onChange={e => setForm({ ...form, primer_nombre: e.target.value })}
                />
                <Input
                  label="Segundo nombre"
                  type="text"
                  value={form.segundo_nombre}
                  onChange={e => setForm({ ...form, segundo_nombre: e.target.value })}
                />
                <Input
                  label="Primer apellido"
                  type="text"
                  required
                  value={form.primer_apellido}
                  onChange={e => setForm({ ...form, primer_apellido: e.target.value })}
                />
                <Input
                  label="Segundo apellido"
                  type="text"
                  value={form.segundo_apellido}
                  onChange={e => setForm({ ...form, segundo_apellido: e.target.value })}
                />
              </div>
            </div>

            {/* SECCIÓN 2: CONTACTO */}
            <div className="edl-card border-l-4 border-l-inst-azul">
              <h4 className="font-heading font-semibold text-inst-azul mb-3">2. Contacto</h4>
              {rolActivo !== 'jefe_dependencia' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <Select
                    label="Departamento"
                    value={form.departamento}
                    onChange={e => setForm({ ...form, departamento: e.target.value })}
                    options={DEPARTAMENTOS.map(d => ({ value: d, label: d }))}
                  />
                  <Input
                    label="Municipio"
                    type="text"
                    value={form.municipio}
                    onChange={e => setForm({ ...form, municipio: e.target.value })}
                    placeholder="Ej: Carepa"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Correo electrónico"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  label="Confirmar correo"
                  type="email"
                  required
                  value={form.email_confirmar}
                  onChange={e => setForm({ ...form, email_confirmar: e.target.value })}
                  error={form.email && form.email_confirmar && form.email !== form.email_confirmar ? 'Los correos no coinciden' : undefined}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Input
                  label="Teléfono principal"
                  type="tel"
                  value={form.telefono1}
                  onChange={e => setForm({ ...form, telefono1: e.target.value })}
                  placeholder="Ej: 3001234567"
                />
                <Input
                  label="Teléfono secundario"
                  type="tel"
                  value={form.telefono2}
                  onChange={e => setForm({ ...form, telefono2: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              {rolActivo !== 'jefe_dependencia' && (
                <Input
                  className="mt-3"
                  label={`Contraseña${editando ? ' (dejar vacío para no cambiar)' : ' *'}`}
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  helperText={!editando ? 'Mínimo 8 caracteres' : 'Solo completar si desea cambiar la contraseña'}
                />
              )}
              {rolActivo === 'jefe_dependencia' && !editando && (
                <p className="text-xs text-inst-texto-claro mt-3">
                  La contraseña se generará automáticamente con el número de documento.
                </p>
              )}
            </div>

            {/* SECCIÓN 3: ¿ES CONTRATISTA? */}
            <div className="edl-card border-l-4 border-l-inst-verde">
              <h4 className="font-heading font-semibold text-inst-azul mb-3">3. Tipo de vinculación</h4>
              <label className="flex items-start gap-3 cursor-pointer p-3 bg-inst-gris rounded">
                <input
                  type="checkbox"
                  checked={!!form.es_contratista}
                  onChange={e => setForm({ ...form, es_contratista: e.target.checked ? 1 : 0 })}
                  className="mt-1 w-4 h-4 accent-inst-azul"
                />
                <div>
                  <span className="text-sm font-medium text-inst-texto">¿Es contratista?</span>
                  <p className="text-xs text-inst-texto-claro mt-1">
                    Si marca Sí, el aplicativo creará el usuario con rol "cargador" para apoyar al jefe de personal. No requiere datos de empleo ni nivel.
                  </p>
                </div>
              </label>
            </div>

            {/* SECCIÓN 4: INFORMACIÓN DEL EMPLEO (solo si NO es contratista) */}
            {form.es_contratista === 0 && (
              <div className="edl-card border-l-4 border-l-inst-azul">
                <h4 className="font-heading font-semibold text-inst-azul mb-3">4. Información del empleo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    label="Nivel *"
                    value={form.nivel}
                    onChange={e => setForm({ ...form, nivel: e.target.value })}
                    placeholder="Seleccionar..."
                    options={NIVELES}
                  />
                  <Select
                    label="Naturaleza *"
                    value={form.naturaleza}
                    onChange={e => setForm({ ...form, naturaleza: e.target.value })}
                    placeholder="Seleccionar..."
                    options={NATURALEZAS}
                  />
                  <Select
                    label="Tipo de nombramiento *"
                    value={form.tipo_nombramiento}
                    onChange={e => setForm({ ...form, tipo_nombramiento: e.target.value })}
                    placeholder="Seleccionar..."
                    options={TIPOS_NOMBRAMIENTO}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <Select
                    label="Dependencia *"
                    value={form.dependencia_id}
                    onChange={e => setForm({ ...form, dependencia_id: e.target.value })}
                    placeholder={dependencias.length === 0 ? 'Cargando dependencias...' : 'Seleccionar dependencia...'}
                    options={
                      rolActivo === 'jefe_dependencia' && usuario?.dependencia_id
                        ? dependencias.filter(d => d.id === usuario.dependencia_id).map(d => ({ value: String(d.id), label: `${d.codigo} — ${d.nombre}` }))
                        : dependencias.map(d => ({ value: String(d.id), label: `${d.codigo} — ${d.nombre}` }))
                    }
                  />
                  <Input
                    label="Denominación del empleo *"
                    type="text"
                    value={form.denominacion_empleo}
                    onChange={e => setForm({ ...form, denominacion_empleo: e.target.value })}
                    placeholder="Nombre del empleo"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <Input
                    label="Código del empleo"
                    type="text"
                    value={form.codigo_empleo}
                    onChange={e => setForm({ ...form, codigo_empleo: e.target.value })}
                  />
                  <Input
                    label="Grado del empleo"
                    type="text"
                    value={form.grado_empleo}
                    onChange={e => setForm({ ...form, grado_empleo: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* SECCIÓN 5: ROLES */}
            <div className="edl-card border-l-4 border-l-inst-azul">
              <h4 className="font-heading font-semibold text-inst-azul mb-3">5. Roles y responsabilidades</h4>
              {rolActivo === 'jefe_dependencia' ? (
                <>
                  <p className="text-xs text-inst-texto-claro mb-3">
                    Como Jefe de Personal puede asignar roles <strong>Evaluador</strong> y <strong>Evaluado</strong>.
                    El sistema asigna automáticamente uno según la naturaleza del cargo.
                  </p>
                  <div className="bg-inst-gris p-3 rounded space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={form.roles.includes('evaluador')}
                                            onChange={e => setForm({
                                              ...form,
                                              roles: e.target.checked
                                                ? [...new Set([...form.roles, 'evaluador'])]
                                                : form.roles.filter(r => r !== 'evaluador')
                                            })}
                                            className="w-4 h-4 accent-inst-azul"
                                          />
                                          <span className="text-sm font-medium text-inst-texto">Evaluador</span>
                                          <Badge tone="success" className="ml-auto">Evaluador</Badge>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={form.roles.includes('evaluado')}
                                            onChange={e => setForm({
                                              ...form,
                                              roles: e.target.checked
                                                ? [...new Set([...form.roles, 'evaluado'])]
                                                : form.roles.filter(r => r !== 'evaluado')
                                            })}
                                            className="w-4 h-4 accent-inst-azul"
                                          />
                                          <span className="text-sm font-medium text-inst-texto">Evaluado</span>
                                          <Badge tone="info" className="ml-auto">Evaluado</Badge>
                                        </label>
                    <p className="text-xs text-inst-texto-claro">
                      {form.roles.includes('evaluador') && form.roles.includes('evaluado')
                        ? 'El usuario tiene ambos roles (evaluador y evaluado simultáneamente).'
                        : form.roles.includes('evaluador')
                        ? 'Rol: Evaluador (asignado por naturaleza Libre Nombramiento o selección manual).'
                        : form.roles.includes('evaluado')
                        ? 'Rol: Evaluado (asignado por naturaleza Carrera Administrativa o selección manual).'
                        : 'Debe seleccionar al menos un rol.'}
                    </p>
                  </div>
                  {/* Es evaluador y evaluado (CNSC video 8) - checkbox separado para dependencia_evaluacion */}
                  <div className="bg-inst-gris p-3 rounded mt-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!form.es_evaluador_y_evaluado}
                        onChange={e => setForm({ ...form, es_evaluador_y_evaluado: e.target.checked ? 1 : 0 })}
                        className="mt-1 w-4 h-4 accent-inst-azul"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-inst-texto">¿Es evaluador y simultáneamente evaluado?</span>
                        <p className="text-xs text-inst-texto-claro mt-1">
                          Marque esta opción si el servidor tiene la responsabilidad de evaluar a otro servidor y a su vez es sujeto de evaluación.
                        </p>
                      </div>
                    </label>
                    {form.es_evaluador_y_evaluado === 1 && (
                      <div className="mt-3 pl-7">
                        <Select
                          label="Dependencia donde realiza la evaluación *"
                          value={form.dependencia_evaluacion_id}
                          onChange={e => setForm({ ...form, dependencia_evaluacion_id: e.target.value })}
                          placeholder="Seleccionar dependencia..."
                          options={dependencias.map(d => ({ value: String(d.id), label: `${d.codigo} — ${d.nombre}` }))}
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-inst-texto-claro mb-3">
                    El rol se asigna automáticamente según la naturaleza del cargo:{' '}
                    <strong>Carrera Administrativa</strong> → <Badge tone="info">Evaluado</Badge>,{' '}
                    <strong>Libre Nombramiento</strong> → <Badge tone="success">Evaluador</Badge>.
                    Los roles adicionales pueden ser gestionados por el administrador desde la tabla de usuarios.
                  </p>

                  {/* Es evaluador y evaluado (CNSC video 8) */}
                  <div className="bg-inst-gris p-3 rounded">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!form.es_evaluador_y_evaluado}
                        onChange={e => setForm({ ...form, es_evaluador_y_evaluado: e.target.checked ? 1 : 0 })}
                        className="mt-1 w-4 h-4 accent-inst-azul"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-inst-texto">¿Es evaluador y simultáneamente evaluado?</span>
                        <p className="text-xs text-inst-texto-claro mt-1">
                          Marque esta opción si el servidor tiene la responsabilidad de evaluar a otro servidor y a su vez es sujeto de evaluación.
                        </p>
                      </div>
                    </label>
                    {form.es_evaluador_y_evaluado === 1 && (
                      <div className="mt-3 pl-7">
                        <Select
                          label="Dependencia donde realiza la evaluación *"
                          value={form.dependencia_evaluacion_id}
                          onChange={e => setForm({ ...form, dependencia_evaluacion_id: e.target.value })}
                          placeholder="Seleccionar dependencia..."
                          options={dependencias.map(d => ({ value: String(d.id), label: `${d.codigo} — ${d.nombre}` }))}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* SECCIÓN 6: PERÍODO DE PRUEBA */}
            <div className="edl-card border-l-4 border-l-inst-azul">
              <h4 className="font-heading font-semibold text-inst-azul mb-3">6. Período de prueba y evaluación inicial</h4>
              {rolActivo === 'jefe_dependencia' ? (
                <div className="space-y-3">
                  <Select
                    label="¿Está en periodo de prueba?"
                    value={form.en_periodo_prueba === -1 || form.en_periodo_prueba == null ? '' : String(form.en_periodo_prueba)}
                    onChange={e => {
                      const val = e.target.value === '' ? -1 : Number(e.target.value);
                      setForm({
                        ...form,
                        en_periodo_prueba: val,
                        fecha_posesion: val === 1 ? form.fecha_posesion : ''
                      });
                    }}
                    placeholder="Seleccione"
                    options={[
                      { value: '1', label: 'Sí' },
                      { value: '0', label: 'No' },
                    ]}
                  />
                  <Select
                    label="¿El período de evaluación inició el primero de febrero?"
                    value={form.evaluacion_inicio_febrero === -1 || form.evaluacion_inicio_febrero == null ? '' : String(form.evaluacion_inicio_febrero)}
                    onChange={e => {
                      const val = e.target.value === '' ? -1 : Number(e.target.value);
                      setForm({
                        ...form,
                        evaluacion_inicio_febrero: val,
                        fecha_inicio_evaluacion: val === 0 ? form.fecha_inicio_evaluacion : '',
                        motivo_fecha_inicio_diferente: val === 0 ? form.motivo_fecha_inicio_diferente : '',
                      });
                    }}
                    placeholder="Seleccione"
                    options={[
                      { value: '1', label: 'Sí' },
                      { value: '0', label: 'No' },
                    ]}
                  />
                  {form.evaluacion_inicio_febrero === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 border-l-2 border-inst-azul">
                      <Input
                        label="Fecha de inicio del período de evaluación *"
                        type="date"
                        value={form.fecha_inicio_evaluacion}
                        onChange={e => setForm({ ...form, fecha_inicio_evaluacion: e.target.value })}
                      />
                      <Select
                        label="Motivo *"
                        value={form.motivo_fecha_inicio_diferente}
                        onChange={e => setForm({ ...form, motivo_fecha_inicio_diferente: e.target.value })}
                        placeholder="Seleccionar motivo..."
                        options={MOTIVOS_FECHA_INICIO}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-inst-gris rounded">
                    <input
                      type="checkbox"
                      checked={!!form.en_periodo_prueba}
                      onChange={e => setForm({
                        ...form,
                        en_periodo_prueba: e.target.checked ? 1 : 0,
                        fecha_posesion: e.target.checked ? form.fecha_posesion : ''
                      })}
                      className="mt-1 w-4 h-4 accent-inst-azul"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-inst-texto">¿Está en periodo de prueba?</span>
                    </div>
                  </label>
                  {form.en_periodo_prueba === 1 && (
                    <div className="pl-7">
                      <Input
                        label="Fecha de posesión *"
                        type="date"
                        value={form.fecha_posesion}
                        onChange={e => setForm({ ...form, fecha_posesion: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Inicio de evaluación (CNSC video 8) */}
                  <div className="mt-4 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer p-3 bg-inst-gris rounded">
                      <input
                        type="checkbox"
                        checked={form.evaluacion_inicio_febrero === 1}
                        onChange={e => setForm({
                          ...form,
                          evaluacion_inicio_febrero: e.target.checked ? 1 : 0,
                          fecha_inicio_evaluacion: e.target.checked ? '' : form.fecha_inicio_evaluacion,
                          motivo_fecha_inicio_diferente: e.target.checked ? '' : form.motivo_fecha_inicio_diferente
                        })}
                        className="mt-1 w-4 h-4 accent-inst-azul"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-inst-texto">
                          ¿El período de evaluación inició el primero de febrero?
                        </span>
                        <p className="text-xs text-inst-texto-claro mt-1">
                          Para servidores que inician el período de evaluación el primero de febrero, debe elegir "Sí".
                        </p>
                      </div>
                    </label>
                    {form.evaluacion_inicio_febrero === 0 && (
                      <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Fecha de inicio del período *"
                          type="date"
                          value={form.fecha_inicio_evaluacion}
                          onChange={e => setForm({ ...form, fecha_inicio_evaluacion: e.target.value })}
                        />
                        <Select
                          label="Motivo de fecha diferente *"
                          value={form.motivo_fecha_inicio_diferente}
                          onChange={e => setForm({ ...form, motivo_fecha_inicio_diferente: e.target.value })}
                          placeholder="Seleccionar motivo..."
                          options={MOTIVOS_FECHA_INICIO}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 7: PROPÓSITO DEL EMPLEO */}
            <div className="edl-card border-l-4 border-l-inst-azul">
              <h4 className="font-heading font-semibold text-inst-azul mb-3">7. Propósito del empleo</h4>
              <div>
                <label className="edl-label">Propósito principal del empleo</label>
                <textarea
                  value={form.proposito_principal_empleo}
                  onChange={e => setForm({ ...form, proposito_principal_empleo: e.target.value })}
                  className="edl-input min-h-[80px]"
                  placeholder="Describa el propósito principal del empleo conforme al manual de funciones"
                />
              </div>
            </div>

            {rolActivo !== 'jefe_dependencia' && (
              <div className="edl-card">
                <h4 className="font-heading font-semibold text-inst-azul mb-3">8. Estado</h4>
                <Select
                  label="Estado"
                  value={form.estado}
                  onChange={e => setForm({ ...form, estado: e.target.value })}
                  options={[
                    { value: 'activo', label: 'Activo' },
                    { value: 'inactivo', label: 'Inactivo' },
                    { value: 'bloqueado', label: 'Bloqueado' },
                  ]}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
            <Button variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button variant="primary" loading={guardando} onClick={guardar}>
              {editando ? 'Actualizar usuario' : 'Crear usuario'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}