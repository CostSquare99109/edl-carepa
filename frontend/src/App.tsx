import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import VerificarCodigo from './pages/VerificarCodigo'
import NuevaContrasena from './pages/NuevaContrasena'
import CambioForzadoPassword from './pages/CambioForzadoPassword'
import SelectRolePage from './pages/SelectRolePage'
import Dashboard from './pages/Dashboard'
import EntidadList from './pages/Entidades/EntidadList'
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
import CompromisosMejoramiento from './pages/Compromisos/CompromisosMejoramiento'
import ProponerCompromisos from './pages/Compromisos/ProponerCompromisos'
import FijacionUnilateral from './pages/Compromisos/FijacionUnilateral'
import AusentismoList from './pages/Ausentismos/AusentismoList'
import CargaUsuarios from './pages/Admin/CargaUsuarios'
import ConsultaFuncionario from './pages/ConsultaFuncionario'
import DependenciaList from './pages/Admin/DependenciaList'
import MovilidadList from './pages/Admin/MovilidadList'
import ComisionEvaluadora from './pages/Evaluaciones/ComisionEvaluadora'
import PanelEvaluador from './pages/Evaluaciones/PanelEvaluador'
import AdminHome from './pages/Admin/AdminHome'
import AdminUsuarios from './pages/Admin/AdminUsuarios'
import AdminCompromisos from './pages/Admin/AdminCompromisos'
import AdminDependencias from './pages/Admin/AdminDependencias'
import AdminEvaluaciones from './pages/Admin/AdminEvaluaciones'
import AdminReportes from './pages/Admin/AdminReportes'
import AdminNotificaciones from './pages/Admin/AdminNotificaciones'
import AdminConfiguracion from './pages/Admin/AdminConfiguracion'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
 const { token, rolActivo } = useAuth()
 if (!token) return <Navigate to="/login" replace />
 if (allowedRoles && allowedRoles.length > 0 && rolActivo && !allowedRoles.includes(rolActivo)) {
  return <Navigate to="/" replace />
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
   <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
    <Route index element={<Dashboard />} />
    <Route path="entidades" element={<EntidadList />} />
    <Route path="usuarios" element={<UsuarioList />} />
    <Route path="admin-usuarios" element={<AdminUsuarios />} />
    <Route path="periodos" element={<PeriodoList />} />
    <Route path="dependencias" element={<DependenciaList />} />
    <Route path="admin-dependencias" element={<AdminDependencias />} />
    <Route path="metas" element={<MetaList />} />
    <Route path="concertaciones" element={<ConcertacionList />} />
    <Route path="evaluaciones" element={<EvaluacionList />} />
    <Route path="admin-evaluaciones" element={<AdminEvaluaciones />} />
    <Route path="evidencias" element={<EvidenciaList />} />
    <Route path="mis-evidencias" element={<EvidenciasEvaluado />} />
    <Route path="reportes" element={<ReportesPage />} />
    <Route path="admin-reportes" element={<AdminReportes />} />
    <Route path="notificaciones" element={<AdminNotificaciones />} />
    <Route path="configuracion" element={<AdminConfiguracion />} />
    <Route path="consulta-funcionario" element={<ConsultaFuncionario />} />
    <Route path="compromisos-y-competencias" element={<CompromisosYCompetencias />} />
    <Route path="compromisos/mios" element={<MisCompromisos />} />
    <Route path="compromisos/concertar" element={<ConcertarCompromisos />} />
    <Route path="compromisos/concertar/:evaluacionId" element={<ConcertarCompromisos />} />
    <Route path="compromisos/ver/:evaluacionId" element={<VerCompromisos />} />
    <Route path="compromisos/propuestos" element={<VerCompromisosPropuestos />} />
    <Route path="compromisos/ajustar/:evaluacionId" element={<AjustarCompromisos />} />
    <Route path="compromisos/aprobar" element={<AprobarCompromisos />} />
    <Route path="compromisos/mejoramiento" element={<CompromisosMejoramiento />} />
    <Route path="compromisos/proponer" element={<ProponerCompromisos />} />
    <Route path="compromisos/fijacion-unilateral" element={<FijacionUnilateral />} />
    <Route path="admin-compromisos" element={<AdminCompromisos />} />
    <Route path="ausentismos" element={<AusentismoList />} />
    <Route path="movilidad" element={<MovilidadList />} />
    <Route path="evaluar" element={<PanelEvaluador />} />
    <Route path="comision-evaluadora" element={<ComisionEvaluadora />} />
    <Route path="carga-usuarios" element={<CargaUsuarios />} />
   </Route>
   <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
 )
}
