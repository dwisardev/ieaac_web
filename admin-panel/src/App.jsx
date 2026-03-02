import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Pages
import Login       from './pages/Login'
import Noticias    from './pages/Noticias'
import Comunicados from './pages/Comunicados'
import Eventos     from './pages/Eventos'
import Docentes    from './pages/Docentes'
import Usuarios    from './pages/Usuarios'
import Perfil      from './pages/Perfil'

import Dashboard from './pages/Dashboard'

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

          <Route path="noticias"    element={<Noticias />} />
          <Route path="comunicados" element={<Comunicados />} />
          <Route path="eventos"     element={<Eventos />} />
          <Route path="docentes"    element={<Docentes />} />

          {/* Usuarios: solo accesible, la restricción visual está en el sidebar */}
          <Route path="usuarios"    element={<Usuarios />} />
          <Route path="perfil"      element={<Perfil />} />
        </Route>

        {/* ── 404 → login ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </AuthProvider>
  )
}

export default App