import { useEffect, useState, Component, type ReactNode } from 'react';
import { api, type PaginatedData } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Resumen {
	entidades: number;
	usuarios: number;
	evaluaciones: number;
	periodos: number;
	notificaciones_no_leidas: number;
	compromisos_pendientes_aprobacion: number;
	mis_compromisos_enviados: number;
}

interface Actividad {
	id: number;
	accion: string;
	entidad: string;
	registro_id: string;
	datos_nuevos: string;
	ip_address: string;
	fecha: string;
}

interface Notificacion {
	id: number;
	titulo: string;
	mensaje: string;
	tipo: string;
	leida: number;
	creado_en: string;
}

const ADMIN_ONLY_CARDS = ['entidades', 'usuarios', 'evaluaciones', 'periodos'];

const CARD_ITEMS = [
	{ key: 'entidades', label: 'Entidades', icon: 'domain', color: 'text-inst-azul' },
	{ key: 'usuarios', label: 'Usuarios', icon: 'people', color: 'text-inst-azul' },
	{ key: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment', color: 'text-inst-verde' },
	{ key: 'periodos', label: 'Periodos activos', icon: 'calendar_today', color: 'text-inst-rojo' },
] as const;

const NOTI_ICON: Record<string, string> = {
	info: 'info',
	alerta: 'notifications_active',
	error: 'error',
	exito: 'check_circle',
};

const NOTI_COLOR: Record<string, string> = {
	info: 'bg-blue-50 border-blue-200',
	alerta: 'bg-yellow-50 border-yellow-200',
	error: 'bg-red-50 border-red-200',
	exito: 'bg-green-50 border-green-200',
};

// Error Boundary para que un crash en Dashboard no tire toda la app
class DashboardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
	state = { hasError: false, error: '' };

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error: error.message };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
					<div className="flex items-center gap-3 mb-3">
						<span className="material-icons text-3xl text-red-600">error_outline</span>
						<h3 className="text-lg font-bold text-red-800">Error al cargar el panel</h3>
					</div>
					<p className="text-sm text-red-700 mb-3">{this.state.error}</p>
					<button
						onClick={() => this.setState({ hasError: false, error: '' })}
						className="edl-btn-primary text-sm"
					>
						<span className="material-icons text-sm mr-1">refresh</span>
						Reintentar
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}

function DashboardContent() {
	const { roles } = useAuth();
	const [resumen, setResumen] = useState<Resumen>({
		entidades: 0, usuarios: 0, evaluaciones: 0, periodos: 0,
		notificaciones_no_leidas: 0, compromisos_pendientes_aprobacion: 0, mis_compromisos_enviados: 0,
	});
	const [actividad, setActividad] = useState<Actividad[]>([]);
	const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

	// Determinar si el usuario es admin para mostrar cards de gestión
	const isAdmin = roles?.some(r =>
		['admin', 'admin_carepa', 'admin_entidad'].includes(r.codigo)
	);
	const visibleCards = CARD_ITEMS.filter(item =>
		isAdmin || !ADMIN_ONLY_CARDS.includes(item.key)
	);

	const puedeAprobar = roles?.some(r =>
		['evaluador', 'comision_evaluadora', 'admin_entidad', 'admin_carepa'].includes(r.codigo)
	);

	useEffect(() => {
		api.get<Resumen>('/dashboard/resumen').then(setResumen).catch(() => {});

		api.get<PaginatedData<Actividad>>('/dashboard/actividad?por_pagina=10')
			.then(r => setActividad(Array.isArray(r?.data) ? r.data : []))
			.catch(() => setActividad([]));

		api.get<PaginatedData<Notificacion>>('/notificaciones?por_pagina=5')
			.then(r => setNotificaciones(Array.isArray(r?.data) ? r.data : []))
			.catch(() => setNotificaciones([]));
	}, []);

	async function marcarLeida(id: number) {
		try {
			await api.put(`/notificaciones/${id}/leer`);
			setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: 1 } : n));
			setResumen(prev => ({ ...prev, notificaciones_no_leidas: Math.max(0, prev.notificaciones_no_leidas - 1) }));
		} catch {}
	}

	// Seguridad: asegurar que actividad y notificaciones sean arrays
	const safeActividad = Array.isArray(actividad) ? actividad : [];
	const safeNotificaciones = Array.isArray(notificaciones) ? notificaciones : [];

	return (
		<div>
			<h2 className="edl-section-title mb-6">Panel principal</h2>

			{/* Alertas de compromisos pendientes */}
			{(resumen.compromisos_pendientes_aprobacion > 0 || resumen.mis_compromisos_enviados > 0) && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					{resumen.compromisos_pendientes_aprobacion > 0 && puedeAprobar && (
						<div className="edl-card bg-yellow-50 border-yellow-300 flex items-center gap-3">
							<span className="material-icons text-3xl text-yellow-600">notifications_active</span>
							<div>
								<p className="font-heading font-bold text-yellow-800">
									{resumen.compromisos_pendientes_aprobacion} compromiso{resumen.compromisos_pendientes_aprobacion > 1 ? 's' : ''} pendiente{resumen.compromisos_pendientes_aprobacion > 1 ? 's' : ''} de aprobacion
								</p>
								<p className="text-sm text-yellow-700">
									Funcionarios han enviado compromisos que requieren su revision y asignacion de peso.
								</p>
								<a href="#/compromisos/aprobar" className="text-sm text-yellow-800 underline font-medium mt-1 inline-block">
									Ir a Aprobar Compromisos
								</a>
							</div>
						</div>
					)}
					{resumen.mis_compromisos_enviados > 0 && (
						<div className="edl-card bg-blue-50 border-blue-300 flex items-center gap-3">
							<span className="material-icons text-3xl text-blue-600">schedule</span>
							<div>
								<p className="font-heading font-bold text-blue-800">
									{resumen.mis_compromisos_enviados} compromiso{resumen.mis_compromisos_enviados > 1 ? 's' : ''} en espera
								</p>
								<p className="text-sm text-blue-700">
									Sus compromisos enviados estan pendientes de aprobacion por el evaluador.
								</p>
								<a href="#/compromisos/mios" className="text-sm text-blue-800 underline font-medium mt-1 inline-block">
									Ver Mis Compromisos
								</a>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Cards resumen */}
			{visibleCards.length > 0 && (
			<div className={`grid gap-4 mb-8 ${visibleCards.length === 1 ? 'grid-cols-1' : visibleCards.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : visibleCards.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
				{visibleCards.map((item) => (
					<div key={item.key} className="edl-card flex items-center gap-4">
						<div className={`${item.color} bg-inst-gris rounded-lg p-3`}>
							<span className="material-icons text-2xl">{item.icon}</span>
						</div>
						<div>
							<p className="text-2xl font-heading font-bold text-inst-azul">
								{resumen[item.key as keyof Resumen] ?? 0}
							</p>
							<p className="text-sm text-inst-texto-claro">{item.label}</p>
						</div>
					</div>
				))}
			</div>
			)}

			{/* Notificaciones recientes */}
			{safeNotificaciones.length > 0 && (
				<div className="edl-card mb-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="edl-section-title">
							Notificaciones
							{resumen.notificaciones_no_leidas > 0 && (
								<span className="ml-2 bg-inst-rojo text-white text-xs px-2 py-0.5 rounded-full">
									{resumen.notificaciones_no_leidas}
								</span>
							)}
						</h3>
					</div>
					<div className="space-y-2">
						{safeNotificaciones.map(n => (
							<div
								key={n.id}
								className={`p-3 rounded-lg border flex items-start gap-3 ${NOTI_COLOR[n.tipo] || 'bg-gray-50'}`}
							>
								<span className="material-icons text-lg mt-0.5">
									{NOTI_ICON[n.tipo] || 'info'}
								</span>
								<div className="flex-1 min-w-0">
									<p className={`text-sm font-medium ${n.leida ? 'text-inst-texto-claro' : 'text-inst-texto'}`}>
										{n.titulo}
									</p>
									<p className="text-xs text-inst-texto-claro mt-0.5">{n.mensaje}</p>
								</div>
								{!n.leida && (
									<button
										onClick={() => marcarLeida(n.id)}
										className="text-xs text-inst-azul hover:underline flex-shrink-0"
									>
										Marcar leida
									</button>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Actividad reciente */}
			<div className="edl-card">
				<h3 className="edl-section-title mb-4">Actividad reciente</h3>
				{safeActividad.length === 0 ? (
					<p className="text-sm text-inst-texto-claro py-4">No hay actividad registrada.</p>
				) : (
					<div className="space-y-0">
						{safeActividad.map((a) => (
							<div
								key={a.id}
								className="flex items-start gap-3 py-3 border-b border-inst-borde last:border-b-0"
							>
								<div className="w-1 self-stretch bg-inst-rojo rounded-full flex-shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="text-sm text-inst-texto">{a.accion || a.entidad || 'Sin descripcion'}</p>
									<p className="text-xs text-inst-texto-claro mt-0.5">{a.fecha}</p>
								</div>
								<span className="edl-badge bg-inst-gris text-inst-texto-claro text-xs">
									{a.entidad || a.accion || '--'}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default function Dashboard() {
	return (
		<DashboardErrorBoundary>
			<DashboardContent />
		</DashboardErrorBoundary>
	);
}
