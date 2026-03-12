/**
 * monitoreoService.js — portal-web
 * Acceso público al sistema de monitoreo FONDEP
 */

import api from './api';

/**
 * Obtiene las dimensiones del monitoreo con sus indicadores
 */
export const obtenerDimensionesConIndicadores = async () => {
  const res = await api.get('/monitoreo');
  return res.data?.data || res.data || [];
};

/**
 * Obtiene estadísticas generales del sistema de monitoreo
 */
export const obtenerEstadisticasGenerales = async () => {
  const res = await api.get('/monitoreo/estadisticas');
  return res.data?.data || res.data || null;
};
