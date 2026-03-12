/**
 * informeFinalService.js — portal-web
 * Acceso público al informe final FONDEP
 */

import api from './api';

/**
 * Obtiene el informe final completo del proyecto
 */
export const obtenerInformeCompleto = async () => {
  const res = await api.get('/informe');
  return res.data?.data || res.data || null;
};

/**
 * Obtiene estadísticas calculadas del informe
 */
export const calcularEstadisticasInforme = async () => {
  const res = await api.get('/informe/estadisticas');
  return res.data?.data || res.data || null;
};
