import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import VerificarCodigo from './pages/VerificarCodigo'
import NuevaContrasena from './pages/NuevaContrasena'
import SelectRolePage from './pages/SelectRolePage'
import Dashboard from './pages/Dashboard'
import EntidadList from './pages/Entidades/EntidadList'
import UsuarioList from './pages/Usuarios/UsuarioList'
import PeriodoList from './pages/Periodos/PeriodoList'
import MetaList from './pages/Metas/MetaList'
import ConcertacionList from './pages/Concertaciones/ConcertacionList'
import EvaluacionList from './pages/Evaluaciones/EvaluacionList'
import EvidenciaList from './pages/Evidencias/EvidenciaList'
import ReportesPage from './pages/Reportes/ReportesPage'
import CompromisosYCompetencias from './pages/Compromisos/CompromisosYCompetencias'
import MisCompromisos from './pages/Compromisos/MisCompromisos'
import AprobarCompromisos from './pages/Compromisos/AprobarCompromisos'
import EvaluarPage from './pages/Evaluaciones/EvaluarPage'
import PanelEvaluador from './pages/Evaluaciones/PanelEvaluador'
/* Admin */
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminHome from './pages/Admin/AdminHome'
import AdminUsuarios from './pages/Admin/AdminUsuarios'
import AdminDependencias from './pages/Admin/AdminDependencias'
import AdminEvaluaciones from './pages/Admin/AdminEvaluaciones'
import AdminReportes from './pages/Admin/AdminReportes'
import AdminNotificaciones from './pages/Admin/AdminNotificaciones'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
		<Route path="/login" element={<Login />} />
		<Route path="/verificar-codigo" element={<VerificarCodigo />} />
		<Route path="/nueva-contrasena" element={<NuevaContrasena />} />
      <Route path="/seleccionar-rol" element={<ProtectedRoute><SelectRolePage /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="entidades" element={<EntidadList />} />
        <Route path="usuarios" element={<UsuarioList />} />
        <Route path="periodos" element={<PeriodoList />} />
        <Route path="metas" element={<MetaList />} />
        <Route path="concertaciones" element={<ConcertacionList />} />
        <Route path="evaluaciones" element={<EvaluacionList />} />
        <Route path="evidencias" element={<EvidenciaList />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="compromisos-y-competencias" element={<CompromisosYCompetencias />} />
        <Route path="compromisos/mios" element={<MisCompromisos />} />
        <Route path="evaluar" element={<PanelEvaluador />} />
        <Route path="evaluar-simple" element={<EvaluarPage />} />
        <Route path="panel-evaluador" element={<PanelEvaluador />} />
        <Route path="compromisos/aprobar" element={<AprobarCompromisos />} />
      </Route>
      {/* Admin panel */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
        <Route index element={<AdminHome />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="dependencias" element={<AdminDependencias />} />
        <Route path="evaluaciones" element={<AdminEvaluaciones />} />
        <Route path="reportes" element={<AdminReportes />} />
        <Route path="notificaciones" element={<AdminNotificaciones />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
