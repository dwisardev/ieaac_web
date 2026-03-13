import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Pages — originales
import Login       from './pages/Login'
import Noticias    from './pages/Noticias'
import Usuarios    from './pages/Usuarios'
import Perfil      from './pages/Perfil'
import Dashboard   from './pages/Dashboard'
import Banners     from './pages/Banners'

// Pages — nuevas
import Comunicados       from './pages/Comunicados'
import Eventos           from './pages/Eventos'
import Docentes          from './pages/Docentes'
import Directorio        from './pages/Directorio'
import Biblioteca        from './pages/Biblioteca'
import DocumentosGestion from './pages/DocumentosGestion'
import Horario           from './pages/Horario'
import FamiliaEducativa  from './pages/FamiliaEducativa'
import Informe           from './pages/Informe'
import Logros            from './pages/Logros'
import PlanLector        from './pages/PlanLector'
import PortafolioActividades from './pages/PortafolioActividades'
import SistemaMonitoreo  from './pages/SistemaMonitoreo'
import Mensajes          from './pages/Mensajes'
import Configuracion     from './pages/Configuracion'
import Manual            from './pages/Manual'

// Layout
import DashboardLayout from './components/Layout/DashboardLayout'

// Auth
import PrivateRoute from './components/Auth/PrivateRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ── Pública ── */}
        <Route path="/login" element={<Login />} />

        {/* ── Panel protegido — raíz "/" ── */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Contenido principal */}
          <Route path="noticias"    element={<Noticias />} />
          <Route path="comunicados" element={<Comunicados />} />
          <Route path="eventos"     element={<Eventos />} />
          <Route path="banners"     element={<Banners />} />

          {/* Personal */}
          <Route path="docentes"   element={<Docentes />} />
          <Route path="directorio" element={<Directorio />} />

          {/* Recursos */}
          <Route path="biblioteca"          element={<Biblioteca />} />
          <Route path="documentos-gestion"  element={<DocumentosGestion />} />
          <Route path="horarios"            element={<Horario />} />
          <Route path="plan-lector"         element={<PlanLector />} />

          {/* FONDEP */}
          <Route path="portafolio-actividades" element={<PortafolioActividades />} />
          <Route path="sistema-monitoreo"      element={<SistemaMonitoreo />} />
          <Route path="informe-final"          element={<Informe />} />
          <Route path="logros"                 element={<Logros />} />

          {/* Comunidad */}
          <Route path="familia-educativa" element={<FamiliaEducativa />} />

          {/* Mensajes del portal */}
          <Route path="mensajes" element={<Mensajes />} />

          {/* Administración */}
          <Route path="usuarios"       element={<Usuarios />} />
          <Route path="configuracion"  element={<Configuracion />} />
          <Route path="manual"         element={<Manual />} />
          <Route path="perfil"         element={<Perfil />} />
        </Route>

        {/* ── 404 → login ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </AuthProvider>
  )
}

export default App