/**
 * planLectorService.js — portal-web
 * Acceso público al plan lector
 */

import api from './api';

/**
 * Obtiene el plan lector completo para un año dado
 * @param {number} anio - Año escolar
 */
export const obtenerPlanLectorCompleto = async (anio) => {
  const params = anio ? { anio } : {};
  const res = await api.get('/plan-lector', { params });
  return res.data?.data || res.data || null;
};
