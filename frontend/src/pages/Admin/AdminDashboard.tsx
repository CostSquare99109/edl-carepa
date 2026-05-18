import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

/* ─── Tipos ─── */
interface Notificacion {
	id: number;
	titulo: string;
	mensaje: string;
	tipo: string;
	leida: boolean;
	creado_en: string;
}

/* ─── Menú lateral (sin Configuración) ─── */
const SIDEBAR_MENU = [
	{ key: 'dashboard', label: 'Tablero de Control', icon: 'dashboard', path: '/admin' },
	{ key: 'usuarios', label: 'Usuarios', icon: 'people', path: '/admin/usuarios' },
	{ key: 'dependencias', label: 'Dependencias', icon: 'account_tree', path: '/admin/dependencias' },
	{ key: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment', path: '/admin/evaluaciones' },
	{ key: 'reportes', label: 'Reportes', icon: 'summarize', path: '/admin/reportes' },
];

const NOTIF_ICON: Record<string, string> = {
	info: 'info', alerta: 'warning', exito: 'check_circle', error: 'error',
};
const NOTIF_COLOR: Record<string, string> = {
	info: 'border-inst-azul', alerta: 'border-amber-500', exito: 'border-inst-verde', error: 'border-inst-rojo',
};

export default function AdminDashboard() {
	const { usuario, roles, rolActivo, cambiarRol, logout } = useAuth();
	const navigate = useNavigate();
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [notificacionesOpen, setNotificacionesOpen] = useState(false);
	const [rolDropdownOpen, setRolDropdownOpen] = useState(false);
	const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
	const [noLeidas, setNoLeidas] = useState(0);
	const location = useLocation();

	const nombreCompleto = usuario
		? `${usuario.nombres} ${usuario.apellidos}`
		: 'Administrador';

	const rolesAdmin = roles?.filter(r =>
		['admin_carepa', 'admin_entidad', 'admin'].includes(r.codigo)
	) || [];

	/* Cargar notificaciones reales */
	useEffect(() => {
		const cargarNotif = async () => {
			try {
				const res = await api.get<any>('/notificaciones?por_pagina=10');
				const items = res.data || res.items || res || [];
				setNotificaciones(Array.isArray(items) ? items : []);
				const noLeidasCount = items.filter?.((n: Notificacion) => !n.leida)?.length || 0;
				setNoLeidas(noLeidasCount);
			} catch { /* silencioso */ }
		};
		cargarNotif();
		const interval = setInterval(cargarNotif, 30000);
		return () => clearInterval(interval);
	}, []);

	const marcarLeida = async (id: number) => {
		try { await api.put(`/notificaciones/${id}/leer`); } catch {}
		setNotificaciones(prev => prev.map(n => n.id === id ? {...n, leida: true} : n));
		setNoLeidas(prev => Math.max(0, prev - 1));
	};

	/* Detectar menú activo según la ruta */
	const activeMenu = SIDEBAR_MENU.find(m => {
		if (m.path === '/admin') return location.pathname === '/admin';
		return location.pathname.startsWith(m.path);
	})?.key || 'dashboard';

	/* Año dinámico */
	const currentYear = new Date().getFullYear();

	/* ── Sidebar ── */
	const sidebar = (
		<aside className="w-[250px] min-h-screen bg-[#003366] text-white flex flex-col flex-shrink-0">
			{/* Logo */}
			<div className="h-[60px] flex items-center justify-between border-b border-white/10 px-4">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
						<span className="material-icons text-2xl text-amber-400">account_balance</span>
					</div>
					<div className="leading-tight">
						<p className="font-heading font-bold text-sm tracking-wide">CAREPA</p>
						<p className="text-[10px] text-white/60">Panel de Administración</p>
					</div>
				</div>
			</div>

			{/* Perfil breve */}
			<div className="px-4 py-4 border-b border-white/10">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
						{nombreCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}
					</div>
					<div className="min-w-0">
						<p className="text-sm font-medium truncate">{nombreCompleto}</p>
						<p className="text-[11px] text-white/50 truncate">Admin</p>
					</div>
				</div>
			</div>

			{/* Navegación */}
			<nav className="flex-1 overflow-y-auto py-3 px-2">
				<p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-white/40 font-semibold">
					Navegación Principal
				</p>
				{SIDEBAR_MENU.map((item) => {
					const isActive = activeMenu === item.key;
					return (
						<Link
							key={item.key}
							to={item.path}
							onClick={() => {
								// Cerrar sidebar en móvil al navegar
								if (window.innerWidth < 1024) setSidebarOpen(false);
							}}
							className={`
								flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5
								text-sm transition-all duration-150
								${isActive
									? 'bg-white/15 text-white font-semibold shadow-sm'
									: 'text-white/70 hover:bg-white/10 hover:text-white'}
							`}
						>
							<span className="material-icons text-lg">{item.icon}</span>
							<span>{item.label}</span>
							{isActive && (
								<span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
							)}
						</Link>
					);
				})}
			</nav>

			{/* Versión */}
			<div className="px-4 py-3 border-t border-white/10 text-center">
				<p className="text-[10px] text-white/30">EDL-CAREPA v1.0.0</p>
			</div>
		</aside>
	);

	/* ── Header ── */
	const header = (
		<header className="h-[60px] bg-white border-b border-inst-borde flex items-center px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
			{/* Toggle sidebar */}
			<button
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className="p-2 rounded-lg hover:bg-inst-gris transition-colors mr-3"
				aria-label={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
				title={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
			>
				<span className="material-icons text-inst-texto">
					{sidebarOpen ? 'menu_open' : 'menu'}
				</span>
			</button>

			{/* Breadcrumb dinámico */}
			<div className="hidden sm:flex items-center gap-1 text-sm text-inst-texto-claro">
				<Link to="/admin" className="material-icons text-base text-inst-azul hover:opacity-70">home</Link>
				<span>/</span>
				<span className="text-inst-texto font-medium">
					{SIDEBAR_MENU.find(m => m.key === activeMenu)?.label || 'Admin'}
				</span>
			</div>

			{/* Spacer */}
			<div className="flex-1" />

			{/* Selector de rol — mostrar todos los roles del usuario */}
			{roles.length > 1 && (
				<div className="relative mr-2">
					<button
						onClick={() => { setRolDropdownOpen(!rolDropdownOpen); setNotificacionesOpen(false); }}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-inst-borde text-sm hover:bg-inst-gris transition-colors"
					>
						<span className="material-icons text-base text-inst-azul">admin_panel_settings</span>
						<span className="hidden sm:inline text-inst-texto font-medium">
							{roles.find(r => r.codigo === rolActivo)?.nombre || rolActivo || 'Rol'}
						</span>
						<span className="material-icons text-base text-inst-texto-claro">
							{rolDropdownOpen ? 'expand_less' : 'expand_more'}
						</span>
					</button>
					{rolDropdownOpen && (
						<>
							<div className="fixed inset-0 z-10" onClick={() => setRolDropdownOpen(false)} />
							<div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-inst-borde z-20 py-1">
								<p className="px-4 py-2 text-xs font-medium text-inst-texto-claro border-b border-inst-borde">
									Cambiar rol activo
								</p>
								{roles.map(r => (
									<button
										key={r.codigo}
										onClick={async () => {
											try {
												await cambiarRol(r.codigo);
												setRolDropdownOpen(false);
												// Navegar al layout correcto según el nuevo rol
												if (['admin', 'admin_carepa', 'admin_entidad'].includes(r.codigo)) {
													// Ya estamos en admin, solo refrescar
												} else {
													navigate('/', { replace: true });
												}
											} catch {}
										}}
										className={`
											w-full text-left px-4 py-2 text-sm hover:bg-inst-gris transition-colors
											${rolActivo === r.codigo ? 'font-semibold text-inst-azul' : 'text-inst-texto'}
										`}
									>
										{r.nombre}
										{rolActivo === r.codigo && (
											<span className="ml-2 text-xs text-inst-azul">✓</span>
										)}
									</button>
								))}
							</div>
						</>
					)}
				</div>
			)}

			{/* Notificaciones reales */}
			<div className="relative mr-2">
				<button
					onClick={() => { setNotificacionesOpen(!notificacionesOpen); setRolDropdownOpen(false); }}
					className="relative p-2 rounded-lg hover:bg-inst-gris transition-colors"
				>
					<span className="material-icons text-inst-texto">notifications</span>
					{noLeidas > 0 && (
						<span className="absolute top-1 right-1 min-w-[16px] h-4 bg-inst-rojo rounded-full text-white text-[10px] flex items-center justify-center font-bold px-1">
							{noLeidas}
						</span>
					)}
				</button>
				{notificacionesOpen && (
					<>
						<div className="fixed inset-0 z-10" onClick={() => setNotificacionesOpen(false)} />
						<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-inst-borde z-20">
							<div className="px-4 py-3 border-b border-inst-borde flex items-center justify-between">
								<p className="font-heading font-semibold text-inst-azul text-sm">Notificaciones</p>
								{noLeidas > 0 && <span className="text-xs bg-inst-rojo text-white rounded-full px-2 py-0.5">{noLeidas} nueva(s)</span>}
							</div>
							<div className="py-2 max-h-64 overflow-y-auto">
								{notificaciones.length === 0 ? (
									<p className="text-center text-gray-400 text-sm py-6">No hay notificaciones</p>
								) : (
									notificaciones.map(n => (
										<div
											key={n.id}
											onClick={() => { if (!n.leida) marcarLeida(n.id); }}
											className={`px-4 py-3 hover:bg-inst-gris transition-colors cursor-pointer border-l-4 ${NOTIF_COLOR[n.tipo] || 'border-gray-300'} ${!n.leida ? 'bg-blue-50/50' : ''}`}
										>
											<div className="flex items-start gap-2">
												<span className="material-icons text-base mt-0.5 text-inst-texto-claro">{NOTIF_ICON[n.tipo] || 'notifications'}</span>
												<div className="min-w-0 flex-1">
													<p className={`text-sm ${!n.leida ? 'font-semibold text-inst-texto' : 'text-inst-texto'}`}>{n.titulo}</p>
													<p className="text-xs text-inst-texto-claro mt-0.5 line-clamp-2">{n.mensaje}</p>
													<p className="text-[10px] text-inst-texto-claro/60 mt-1">
														{new Date(n.creado_en).toLocaleString('es-CO')}
													</p>
												</div>
											</div>
										</div>
									))
								)}
							</div>
							<div className="px-4 py-2 border-t border-inst-borde text-center">
								<button
									onClick={() => { setNotificacionesOpen(false); navigate('/admin/notificaciones'); }}
									className="text-xs text-inst-azul hover:underline font-medium"
								>
									Ver todas las notificaciones
								</button>
							</div>
						</div>
					</>
				)}
			</div>

			{/* Nombre usuario */}
			<div className="hidden md:flex items-center gap-2 mr-2">
				<span className="text-sm font-medium text-inst-texto">{nombreCompleto}</span>
			</div>

			{/* Cerrar sesión */}
			<button
				onClick={logout}
				className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-inst-rojo hover:bg-red-50 transition-colors"
				title="Cerrar sesión"
			>
				<span className="material-icons text-base">logout</span>
				<span className="hidden sm:inline">Salir</span>
			</button>
		</header>
	);

	/* ── Layout completo con Outlet ── */
	return (
		<div className="min-h-screen bg-inst-gris flex">
			{/* Sidebar wrapper — con overflow-hidden y transición suave */}
			<div
				className={`
					fixed top-0 left-0 h-full z-40 lg:relative lg:z-auto
					transition-all duration-300 ease-in-out
					${sidebarOpen ? 'w-[250px]' : 'w-0'}
					overflow-hidden
				`}
			>
				{sidebar}
			</div>

			{/* Overlay móvil */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/40 z-30 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Contenedor derecho */}
			<div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
				{/* Header */}
				{header}

				{/* Contenido dinámico */}
				<main className="flex-1">
					<Outlet />
				</main>

				{/* Footer con año dinámico */}
				<footer className="text-center py-4 border-t border-inst-borde text-xs text-inst-texto-claro">
					EDL-CAREPA © {currentYear} — Alcaldía de Carepa
				</footer>
			</div>
		</div>
	);
}
