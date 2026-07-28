import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Loader from './components/Shared/Loader'

// ── Eager: crítico para FCP (auth, dashboard, layout) ──────────────────────
import Login from './pages/Login'
import VerificarCodigo from './pages/VerificarCodigo'
import NuevaContrasena from './pages/NuevaContrasena'
import CambioForzadoPassword from './pages/CambioForzadoPassword'
import SelectRolePage from './pages/SelectRolePage'
import Dashboard from './pages/Dashboard'
import Perfil from './pages/Perfil'

// ── Lazy: módulos pesados ──────────────────────────────────────────────────
const UsuarioList = lazy(() => import('./pages/Usuarios/UsuarioList'))
const PeriodoList = lazy(() => import('./pages/Periodos/PeriodoList'))
const MetaList = lazy(() => import('./pages/Metas/MetaList'))
const ConcertacionList = lazy(() => import('./pages/Concertaciones/ConcertacionList'))
const EvaluacionList = lazy(() => import('./pages/Evaluaciones/EvaluacionList'))
const EvaluarPage = lazy(() => import('./pages/Evaluaciones/EvaluarPage'))
const ComisionEvaluadora = lazy(() => import('./pages/Evaluaciones/ComisionEvaluadora'))
const VerEvaluaciones = lazy(() => import('./pages/Evaluaciones/VerEvaluaciones'))
const EvidenciaList = lazy(() => import('./pages/Evidencias/EvidenciaList'))
const EvidenciasEvaluado = lazy(() => import('./pages/Evidencias/EvidenciasEvaluado'))
const ReportesPage = lazy(() => import('./pages/Reportes/ReportesPage'))
const CompromisosYCompetencias = lazy(() => import('./pages/Compromisos/CompromisosYCompetencias'))
const MisCompromisos = lazy(() => import('./pages/Compromisos/MisCompromisos'))
const AprobarCompromisos = lazy(() => import('./pages/Compromisos/AprobarCompromisos'))
const ConcertarCompromisos = lazy(() => import('./pages/Compromisos/ConcertarCompromisos'))
const VerCompromisos = lazy(() => import('./pages/Compromisos/VerCompromisos'))
const VerCompromisosPropuestos = lazy(() => import('./pages/Compromisos/VerCompromisosPropuestos'))
const AjustarCompromisos = lazy(() => import('./pages/Compromisos/AjustarCompromisos'))
const SolicitudesCambioPage = lazy(() => import('./pages/Compromisos/SolicitudesCambioPage'))
const CompromisosMejoramiento = lazy(() => import('./pages/Compromisos/CompromisosMejoramiento'))
const ProponerCompromisos = lazy(() => import('./pages/Compromisos/ProponerCompromisos'))
const FijacionUnilateral = lazy(() => import('./pages/Compromisos/FijacionUnilateral'))
const AusentismoList = lazy(() => import('./pages/Ausentismos/AusentismoList'))
const ConsultaFuncionario = lazy(() => import('./pages/ConsultaFuncionario'))
const DependenciaList = lazy(() => import('./pages/Admin/DependenciaList'))
const MovilidadList = lazy(() => import('./pages/Admin/MovilidadList'))
const AdminHome = lazy(() => import('./pages/Admin/AdminHome'))
const AdminUsuarios = lazy(() => import('./pages/Admin/AdminUsuarios'))
const AdminCompromisos = lazy(() => import('./pages/Admin/AdminCompromisos'))
const AdminDependencias = lazy(() => import('./pages/Admin/AdminDependencias'))
const AdminEvaluaciones = lazy(() => import('./pages/Admin/AdminEvaluaciones'))
const AdminReportes = lazy(() => import('./pages/Admin/AdminReportes'))
const AdminNotificaciones = lazy(() => import('./pages/Admin/AdminNotificaciones'))
const AdminConfiguracion = lazy(() => import('./pages/Admin/AdminConfiguracion'))
const ManualFuncionesIndice = lazy(() => import('./pages/ManualFunciones/Indice'))
const ManualFuncionesFicha = lazy(() => import('./pages/ManualFunciones/Ficha'))

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
 const { token, rolActivo } = useAuth()
 if (!token) return <Navigate to="/login" replace />
 if (allowedRoles && allowedRoles.length > 0 && rolActivo && !allowedRoles.includes(rolActivo)) {
  return <Navigate to="/" replace />
 }
 return <>{children}</>
}

/** Bloquea rutas para roles especificos (ej. admin_carepa no accede a modulos excluidos) */
function RoleExcludedRoute({ children, excludedRoles }: { children: React.ReactNode; excludedRoles: string[] }) {
 const { rolActivo } = useAuth()
 if (rolActivo && excludedRoles.includes(rolActivo)) {
  return <Navigate to="/dashboard" replace />
 }
 return <>{children}</>
}

/** Wrapper Suspense para rutas lazy. Carga con spinner institucional. */
function lazyRoute(node: React.ReactNode) {
  return <Suspense fallback={<Loader />}>{node}</Suspense>
}

export default function App() {
 return (
  <Routes>
   <Route path="/login" element={<Login />} />
   <Route path="/verificar-codigo" element={<VerificarCodigo />} />
   <Route path="/nueva-contraseña" element={<NuevaContrasena />} />
   <Route path="/cambio-forzado-password" element={<ProtectedRoute><CambioForzadoPassword /></ProtectedRoute>} />
   <Route path="/seleccionar-rol" element={<ProtectedRoute><SelectRolePage /></ProtectedRoute>} />
   {/* Raíz siempre redirige a login (landing page) */}
   <Route path="/" element={<Navigate to="/login" replace />} />
   {/* Dashboard protegido en su propia ruta */}
   <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
    <Route index element={<Dashboard />} />
    <Route path="admin" element={lazyRoute(<AdminHome />)} />
    <Route path="usuarios" element={lazyRoute(<UsuarioList />)} />
    <Route path="admin-usuarios" element={lazyRoute(<AdminUsuarios />)} />
    <Route path="periodos" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><PeriodoList /></RoleExcludedRoute>)} />
    <Route path="dependencias" element={lazyRoute(<DependenciaList />)} />
    <Route path="admin-dependencias" element={lazyRoute(<AdminDependencias />)} />
    <Route path="metas" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><MetaList /></RoleExcludedRoute>)} />
    <Route path="concertaciones" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><ConcertacionList /></RoleExcludedRoute>)} />
    <Route path="evaluaciones" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa', 'jefe_dependencia']}><EvaluacionList /></RoleExcludedRoute>)} />
    <Route path="admin-evaluaciones" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><AdminEvaluaciones /></RoleExcludedRoute>)} />
    <Route path="evidencias" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><EvidenciaList /></RoleExcludedRoute>)} />
    <Route path="mis-evidencias" element={lazyRoute(<RoleExcludedRoute excludedRoles={['evaluador', 'jefe_dependencia']}><EvidenciasEvaluado /></RoleExcludedRoute>)} />
    <Route path="reportes" element={lazyRoute(<ReportesPage />)} />
    <Route path="admin-reportes" element={lazyRoute(<AdminReportes />)} />
    <Route path="notificaciones" element={lazyRoute(<AdminNotificaciones />)} />
     <Route path="configuracion" element={lazyRoute(<AdminConfiguracion />)} />
     <Route path="parametros" element={lazyRoute(<AdminConfiguracion />)} />
    <Route path="consulta-funcionario" element={lazyRoute(<ConsultaFuncionario />)} />
    <Route path="manual-funciones" element={lazyRoute(<ManualFuncionesIndice />)} />
    <Route path="manual-funciones/:id" element={lazyRoute(<ManualFuncionesFicha />)} />
    <Route path="compromisos-y-competencias" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><CompromisosYCompetencias /></RoleExcludedRoute>)} />
    <Route path="compromisos/mios" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><MisCompromisos /></RoleExcludedRoute>)} />
    <Route path="compromisos/concertar" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><ConcertarCompromisos /></RoleExcludedRoute>)} />
    <Route path="compromisos/concertar/:evaluacionId" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><ConcertarCompromisos /></RoleExcludedRoute>)} />
    <Route path="compromisos/ver/:evaluacionId" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><VerCompromisos /></RoleExcludedRoute>)} />
    <Route path="compromisos/propuestos/:evaluacionId" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><VerCompromisosPropuestos /></RoleExcludedRoute>)} />
    <Route path="compromisos/ajustar/:evaluacionId" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><AjustarCompromisos /></RoleExcludedRoute>)} />
    <Route path="compromisos/aprobar" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><AprobarCompromisos /></RoleExcludedRoute>)} />
    <Route path="compromisos/mejoramiento" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><CompromisosMejoramiento /></RoleExcludedRoute>)} />
    <Route path="compromisos/proponer" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><ProponerCompromisos /></RoleExcludedRoute>)} />
     <Route path="compromisos/fijacion-unilateral" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><FijacionUnilateral /></RoleExcludedRoute>)} />
     <Route path="compromisos/solicitudes-cambio" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><SolicitudesCambioPage /></RoleExcludedRoute>)} />
    <Route path="admin-compromisos" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><AdminCompromisos /></RoleExcludedRoute>)} />
    <Route path="ausentismos" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><AusentismoList /></RoleExcludedRoute>)} />
    <Route path="movilidad" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><MovilidadList /></RoleExcludedRoute>)} />
    <Route path="evaluar" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><EvaluarPage /></RoleExcludedRoute>)} />
    <Route path="comision-evaluadora" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><ComisionEvaluadora /></RoleExcludedRoute>)} />
    <Route path="evaluaciones/ver" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><VerEvaluaciones /></RoleExcludedRoute>)} />
    <Route path="evaluaciones/ver/:evaluacionId" element={lazyRoute(<RoleExcludedRoute excludedRoles={['admin_carepa']}><VerEvaluaciones /></RoleExcludedRoute>)} />
    <Route path="perfil" element={<Perfil />} />
   </Route>
   <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
 )
}