import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import VerificarCodigo from './pages/VerificarCodigo'
import NuevaContrasena from './pages/NuevaContrasena'
import CambioForzadoPassword from './pages/CambioForzadoPassword'
import SelectRolePage from './pages/SelectRolePage'
import Dashboard from './pages/Dashboard'
import UsuarioList from './pages/Usuarios/UsuarioList'
import PeriodoList from './pages/Periodos/PeriodoList'
import MetaList from './pages/Metas/MetaList'
import ConcertacionList from './pages/Concertaciones/ConcertacionList'
import EvaluacionList from './pages/Evaluaciones/EvaluacionList'
import EvidenciaList from './pages/Evidencias/EvidenciaList'
import EvidenciasEvaluado from './pages/Evidencias/EvidenciasEvaluado'
import ReportesPage from './pages/Reportes/ReportesPage'
import CompromisosYCompetencias from './pages/Compromisos/CompromisosYCompetencias'
import MisCompromisos from './pages/Compromisos/MisCompromisos'
import AprobarCompromisos from './pages/Compromisos/AprobarCompromisos'
import ConcertarCompromisos from './pages/Compromisos/ConcertarCompromisos'
import VerCompromisos from './pages/Compromisos/VerCompromisos'
import VerCompromisosPropuestos from './pages/Compromisos/VerCompromisosPropuestos'
import AjustarCompromisos from './pages/Compromisos/AjustarCompromisos'
import SolicitudesCambioPage from './pages/Compromisos/SolicitudesCambioPage'
import CompromisosMejoramiento from './pages/Compromisos/CompromisosMejoramiento'
import ProponerCompromisos from './pages/Compromisos/ProponerCompromisos'
import FijacionUnilateral from './pages/Compromisos/FijacionUnilateral'
import AusentismoList from './pages/Ausentismos/AusentismoList'
import ConsultaFuncionario from './pages/ConsultaFuncionario'
import DependenciaList from './pages/Admin/DependenciaList'
import MovilidadList from './pages/Admin/MovilidadList'
import ComisionEvaluadora from './pages/Evaluaciones/ComisionEvaluadora'
import EvaluarPage from './pages/Evaluaciones/EvaluarPage'
import VerEvaluaciones from './pages/Evaluaciones/VerEvaluaciones'
import AdminHome from './pages/Admin/AdminHome'
import AdminUsuarios from './pages/Admin/AdminUsuarios'
import AdminCompromisos from './pages/Admin/AdminCompromisos'
import AdminDependencias from './pages/Admin/AdminDependencias'
import AdminEvaluaciones from './pages/Admin/AdminEvaluaciones'
import AdminReportes from './pages/Admin/AdminReportes'
import AdminNotificaciones from './pages/Admin/AdminNotificaciones'
import AdminConfiguracion from './pages/Admin/AdminConfiguracion'
import Perfil from './pages/Perfil'
import ManualFuncionesIndice from './pages/ManualFunciones/Indice'
import ManualFuncionesFicha from './pages/ManualFunciones/Ficha'

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
    <Route path="admin" element={<AdminHome />} />
    <Route path="usuarios" element={<UsuarioList />} />
    <Route path="admin-usuarios" element={<AdminUsuarios />} />
    <Route path="periodos" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><PeriodoList /></RoleExcludedRoute>} />
    <Route path="dependencias" element={<DependenciaList />} />
    <Route path="admin-dependencias" element={<AdminDependencias />} />
    <Route path="metas" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><MetaList /></RoleExcludedRoute>} />
    <Route path="concertaciones" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><ConcertacionList /></RoleExcludedRoute>} />
    <Route path="evaluaciones" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><EvaluacionList /></RoleExcludedRoute>} />
    <Route path="admin-evaluaciones" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><AdminEvaluaciones /></RoleExcludedRoute>} />
    <Route path="evidencias" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><EvidenciaList /></RoleExcludedRoute>} />
    <Route path="mis-evidencias" element={<RoleExcludedRoute excludedRoles={['admin_carepa', 'evaluador', 'jefe_dependencia']}><EvidenciasEvaluado /></RoleExcludedRoute>} />
    <Route path="reportes" element={<ReportesPage />} />
    <Route path="admin-reportes" element={<AdminReportes />} />
    <Route path="notificaciones" element={<AdminNotificaciones />} />
     <Route path="configuracion" element={<AdminConfiguracion />} />
     <Route path="parametros" element={<AdminConfiguracion />} />
    <Route path="consulta-funcionario" element={<ConsultaFuncionario />} />
    <Route path="manual-funciones" element={<ManualFuncionesIndice />} />
    <Route path="manual-funciones/:id" element={<ManualFuncionesFicha />} />
    <Route path="compromisos-y-competencias" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><CompromisosYCompetencias /></RoleExcludedRoute>} />
    <Route path="compromisos/mios" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><MisCompromisos /></RoleExcludedRoute>} />
    <Route path="compromisos/concertar" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><ConcertarCompromisos /></RoleExcludedRoute>} />
    <Route path="compromisos/concertar/:evaluacionId" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><ConcertarCompromisos /></RoleExcludedRoute>} />
    <Route path="compromisos/ver/:evaluacionId" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><VerCompromisos /></RoleExcludedRoute>} />
    <Route path="compromisos/propuestos" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><VerCompromisosPropuestos /></RoleExcludedRoute>} />
    <Route path="compromisos/ajustar/:evaluacionId" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><AjustarCompromisos /></RoleExcludedRoute>} />
    <Route path="compromisos/aprobar" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><AprobarCompromisos /></RoleExcludedRoute>} />
    <Route path="compromisos/mejoramiento" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><CompromisosMejoramiento /></RoleExcludedRoute>} />
    <Route path="compromisos/proponer" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><ProponerCompromisos /></RoleExcludedRoute>} />
     <Route path="compromisos/fijacion-unilateral" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><FijacionUnilateral /></RoleExcludedRoute>} />
     <Route path="compromisos/solicitudes-cambio" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><SolicitudesCambioPage /></RoleExcludedRoute>} />
    <Route path="admin-compromisos" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><AdminCompromisos /></RoleExcludedRoute>} />
    <Route path="ausentismos" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><AusentismoList /></RoleExcludedRoute>} />
    <Route path="movilidad" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><MovilidadList /></RoleExcludedRoute>} />
    <Route path="evaluar" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><EvaluarPage /></RoleExcludedRoute>} />
    <Route path="comision-evaluadora" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><ComisionEvaluadora /></RoleExcludedRoute>} />
    <Route path="evaluaciones/ver" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><VerEvaluaciones /></RoleExcludedRoute>} />
    <Route path="evaluaciones/ver/:evaluacionId" element={<RoleExcludedRoute excludedRoles={['admin_carepa']}><VerEvaluaciones /></RoleExcludedRoute>} />
    <Route path="perfil" element={<Perfil />} />
   </Route>
   <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
 )
}
