/**
 * cronogramaService.js — portal-web
 * Acceso público al cronograma del proyecto FONDEP
 */

import api from './api';

/**
 * Obtiene el cronograma de actividades del proyecto (agrupado por mes)
 */
export const obtenerCronograma = async () => {
  const res = await api.get('/cronograma');
  return res.data?.data || res.data || [];
};

/**
 * Obtiene estadísticas del cronograma (totales, completadas, en progreso)
 */
export const obtenerEstadisticasCronograma = async () => {
  const res = await api.get('/cronograma/estadisticas');
  return res.data?.data || res.data || null;
};
