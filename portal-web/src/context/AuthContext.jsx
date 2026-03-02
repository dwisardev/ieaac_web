// AuthContext.jsx — Ruta: src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* ── Verificar sesión al cargar ── */
  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        // Refrescar cabecera por si acaso
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /* ── Login ──
   * Cuando el backend esté listo descomenta el bloque real
   * y elimina el bloque de simulación.
   */
  const login = async (username, password) => {
    try {
      /* ─── SIMULACIÓN (eliminar cuando el backend esté listo) ─── */
      if (import.meta.env.DEV) {
        await new Promise(r => setTimeout(r, 700));

        if (password !== 'admin123' && password !== '123456') {
          return { success: false, message: 'Credenciales incorrectas. En desarrollo usa: admin123' };
        }
        const mockUser  = {
          id: 1, username,
          email: `${username}@ieandres.edu.pe`,
          rol: username.toLowerCase() === 'admin' ? 'admin' : 'editor',
        };
        const mockToken = 'dev_token_' + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user',  JSON.stringify(mockUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
        setUser(mockUser);
        setIsAuthenticated(true);
        return { success: true };
      }
      /* ─── FIN SIMULACIÓN ─── */

      /* ─── PRODUCCIÓN ─── (descomentar cuando el backend esté listo)
      const { data } = await api.post('/auth/login', { username, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.usuario));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      setUser(data.usuario);
      setIsAuthenticated(true);
      return { success: true };
      */

    } catch (err) {
      console.error('Error en login:', err);
      return {
        success: false,
        message: err.response?.data?.mensaje || 'Error al iniciar sesión. Intenta de nuevo.',
      };
    }
  };

  /* ── Logout ── */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin  = () => user?.rol === 'admin';
  const isEditor = () => user?.rol === 'editor' || user?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, isAdmin, isEditor }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};