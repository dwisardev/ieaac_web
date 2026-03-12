import axios from 'axios';
import CSRFTokenService from './csrf';

const API_URL = import.meta.env.VITE_API_URL || 'https://ieandresavelinocaceres.com/api';

const api = axios.create({
  baseURL: API_URL,
});

/* ── Request: adjuntar token y CSRF ── */
api.interceptors.request.use(
  (config) => {
    // Solo poner Content-Type: application/json cuando NO es FormData
    // (para FormData el browser lo setea automáticamente con el boundary correcto)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Agregar JWT token
    const token =
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar CSRF token para cambios de estado (POST, PUT, DELETE, PATCH)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase())) {
      config.headers['X-CSRF-Token'] = CSRFTokenService.getToken();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response: manejar 401 ── */
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem('refresh_token') ||
        sessionStorage.getItem('refresh_token');

      // Solo intentar refresh si realmente hay un refresh_token guardado
      if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
            rotate: true,
          });

          const newAccess   = response.data?.data?.access_token;
          const newRefresh  = response.data?.data?.refresh_token;

          if (newAccess) {
            const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage;
            storage.setItem('access_token', newAccess);
            if (newRefresh) storage.setItem('refresh_token', newRefresh);

            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          }
        } catch {
          // Refresh falló → forzar logout
        }
      }

      // Sin refresh válido → redirigir al login
      if (!isRedirecting) {
        isRedirecting = true;
        localStorage.clear();
        sessionStorage.clear();
        // Usar la base del admin-panel
        const base = import.meta.env.BASE_URL || '/admin-panel/';
        window.location.replace(base + 'login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;