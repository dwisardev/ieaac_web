/**
 * miembrosServices.js — portal-web
 * Acceso público a miembros de la comunidad educativa
 */

import api from './api';

/**
 * Obtiene el listado completo de miembros agrupado por categoría
 * @param {number} anio - Año escolar
 */
export const obtenerMiembrosCompleto = async (anio) => {
  const params = anio ? { anio } : {};
  const res = await api.get('/miembros/completo', { params });
  return res.data?.data || res.data || null;
};
