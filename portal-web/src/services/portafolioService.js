/**
 * portafolioService.js — portal-web
 * Acceso público al portafolio de actividades FONDEP
 */

import api from './api';

/**
 * Obtiene actividades del portafolio agrupadas por rubro
 * @param {object} params - Filtros opcionales (rubro, categoria, destacado)
 */
export const obtenerActividadesPorRubro = async (params = {}) => {
  const res = await api.get('/portafolio', { params });
  return res.data?.data || res.data || {};
};

/**
 * Obtiene estadísticas generales del portafolio
 */
export const obtenerEstadisticasPortafolio = async () => {
  const res = await api.get('/portafolio/estadisticas');
  return res.data?.data || res.data || null;
};
