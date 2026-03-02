import api from './api';

const authService = {

  login: async (username, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { username, password });

      if (response.data.success) {
        const { tokens, user } = response.data.data;

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('access_token',  tokens.access_token);
        storage.setItem('user', JSON.stringify(user));

        // Refresh token es opcional — solo guardarlo si viene
        if (tokens.refresh_token) {
          storage.setItem('refresh_token', tokens.refresh_token);
        }

        return { success: true, user };
      }

      return { success: false, message: response.data.message || 'Credenciales inválidas' };

    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Error al iniciar sesión';
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      const refreshToken =
        localStorage.getItem('refresh_token') ||
        sessionStorage.getItem('refresh_token');

      // Solo llamar al endpoint si hay token de acceso válido
      const accessToken =
        localStorage.getItem('access_token') ||
        sessionStorage.getItem('access_token');

      if (accessToken) {
        await api.post('/auth/logout', {
          refresh_token: refreshToken || null,
        });
      }
    } catch {
      // Error de logout no es crítico — limpiar storage de todas formas
    } finally {
      localStorage.clear();
      sessionStorage.clear();
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.post('/auth/verify');
      return response.data.success;
    } catch {
      return false;
    }
  },

  getCurrentUser: () => {
    try {
      const userStr =
        localStorage.getItem('user') ||
        sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    const token =
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token');
    return !!token;
  },

  hasRole: (roles) => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.rol) : user.rol === roles;
  },
};

export default authService;