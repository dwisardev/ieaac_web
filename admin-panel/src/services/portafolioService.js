/**
 * portafolioService.js — admin-panel
 * Gestión del Portafolio de Actividades FONDEP
 */
import api from './api';

const BASE = '/admin/portafolio';

/* ── Estadísticas ── */
export const obtenerEstadisticasPortafolio = async () => {
  const res = await api.get(`${BASE}/estadisticas`);
  return res.data?.data || res.data || null;
};

/* ── Actividades agrupadas por rubro ── */
export const obtenerActividadesPorRubro = async (params = {}) => {
  const res = await api.get(BASE, { params });
  return res.data?.data || res.data || {};
};

/* ── CRUD ── */
export const crearActividad = async (formData) => {
  const res = await api.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data || res.data;
};

export const actualizarActividad = async (id, formData) => {
  formData.append('_method', 'PUT');
  const res = await api.post(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const eliminarActividad = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};
