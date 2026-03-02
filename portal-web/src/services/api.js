/**
 * api.js — portal-web
 * Ruta: src/services/api.js
 *
 * Cliente Axios para el portal público.
 * NO envía token JWT — todas las rutas que llama son públicas.
 *
 * Base URL: https://tudominio.com/api
 * El backend (index.php) recibe la ruta y hace:
 *   str_replace('/api/', '', $path) → 'noticias', 'comunicados', etc.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ieandresavelinocaceres.com/api',
  timeout: 10000,                           // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

/* ── Interceptor de respuesta ──
   Normaliza errores de red y del servidor para que los servicios
   reciban siempre un Error con mensaje legible.
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código fuera del rango 2xx
      const msg = error.response.data?.error
               || error.response.data?.message
               || `Error ${error.response.status}`;
      return Promise.reject(new Error(msg));
    }
    if (error.request) {
      // La petición salió pero no hubo respuesta (timeout, sin red)
      return Promise.reject(new Error('No se pudo conectar con el servidor. Verifica tu conexión.'));
    }
    return Promise.reject(error);
  }
);

export default api;