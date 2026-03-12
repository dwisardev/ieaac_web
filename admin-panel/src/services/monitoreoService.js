/**
 * monitoreoService.js — admin-panel
 * Gestión del Sistema de Monitoreo FONDEP
 */
import api from './api';

const BASE = '/admin/monitoreo';

/* ── Estadísticas generales ── */
export const obtenerEstadisticasGenerales = async () => {
  const res = await api.get(`${BASE}/estadisticas`);
  return res.data?.data || res.data || null;
};

/* ── Dimensiones con indicadores ── */
export const obtenerDimensionesConIndicadores = async () => {
  const res = await api.get(BASE);
  const data = res.data?.data || res.data;
  return Array.isArray(data) ? data : [];
};

/* ── Dimensiones CRUD ── */
export const crearDimension = async (data) => {
  const res = await api.post(`${BASE}/dimensiones`, data);
  return res.data?.data || res.data;
};

export const actualizarDimension = async (id, data) => {
  const payload = { ...data, _method: 'PUT' };
  const res = await api.post(`${BASE}/dimensiones/${id}`, payload);
  return res.data;
};

export const eliminarDimension = async (id) => {
  const res = await api.delete(`${BASE}/dimensiones/${id}`);
  return res.data;
};

/* ── Indicadores CRUD ── */
export const crearIndicador = async (data) => {
  const res = await api.post(`${BASE}/indicadores`, data);
  return res.data?.data || res.data;
};

export const actualizarIndicador = async (id, data) => {
  const payload = { ...data, _method: 'PUT' };
  const res = await api.post(`${BASE}/indicadores/${id}`, payload);
  return res.data;
};

export const eliminarIndicador = async (id) => {
  const res = await api.delete(`${BASE}/indicadores/${id}`);
  return res.data;
};

export const actualizarProgresoIndicador = async (id, valor) => {
  const res = await api.patch(`${BASE}/indicadores/${id}/progreso`, { actual: valor });
  return res.data;
};
