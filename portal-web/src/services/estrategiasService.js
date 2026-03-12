/**
 * estrategiasService.js — portal-web
 * Acceso público a las estrategias del proyecto FONDEP
 */

import api from './api';

/**
 * Obtiene el listado de estrategias del proyecto
 */
export const obtenerEstrategias = async () => {
  const res = await api.get('/estrategias');
  return res.data?.data || res.data || [];
};

/**
 * Obtiene el resumen de impacto total de las estrategias
 */
export const calcularImpactoTotal = async () => {
  const res = await api.get('/estrategias/impacto');
  return res.data?.data || res.data || null;
};
