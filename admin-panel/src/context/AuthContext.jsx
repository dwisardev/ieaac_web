import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/auth';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  /* Verificar token al montar y cargar nombre fresco desde la API */
  useEffect(() => {
    const stored = authService.getCurrentUser();
    if (stored && authService.isAuthenticated()) {
      setUser(stored);
      // Fetch fresh profile to get nombre actualizado
      if (stored.id) {
        api.get(`/admin/usuarios/${stored.id}`)
          .then(res => {
            const fresh = res.data?.data || res.data || {};
            if (fresh.nombre || fresh.email) {
              const updated = { ...stored, nombre: fresh.nombre || stored.nombre, email: fresh.email || stored.email };
              const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
              storage.setItem('user', JSON.stringify(updated));
              setUser(updated);
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
        return;
      }
    } else if (stored) {
      authService.logout();
      setUser(null);
    }
    setLoading(false);
  }, []);

  /* Login — guarda el usuario en contexto */
  const login = useCallback(async (username, password, rememberMe) => {
    const result = await authService.login(username, password, rememberMe);
    if (result.success) {
      setUser(authService.getCurrentUser());
    }
    return result;
  }, []);

  /* Logout — limpia contexto y storage */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  /* Actualizar datos del usuario en contexto (sin re-login) */
  const refreshUser = useCallback(() => {
    const stored = authService.getCurrentUser();
    setUser(stored);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/* Hook de conveniencia */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export default AuthContext;