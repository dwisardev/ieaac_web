/**
 * planLectorService.js — admin-panel
 * Gestión del Plan Lector Institucional
 */
import api from './api';

const BASE = '/admin/plan-lector';

/* ── Plan completo ── */
export const obtenerPlanLectorCompleto = async (anio = new Date().getFullYear()) => {
  const res = await api.get(BASE, { params: { anio } });
  return res.data?.data || res.data || {};
};

/* ── Configuración ── */
export const actualizarConfiguracion = async (data) => {
  const res = await api.post(`${BASE}/config`, data);
  return res.data;
};

/* ── Metas ── */
export const crearMeta = async (data) => {
  const res = await api.post(`${BASE}/metas`, data);
  return res.data?.data || res.data;
};

export const actualizarMeta = async (id, data) => {
  const payload = { ...data, _method: 'PUT' };
  const res = await api.post(`${BASE}/metas/${id}`, payload);
  return res.data?.data || res.data;
};

export const eliminarMeta = async (id) => {
  const res = await api.delete(`${BASE}/metas/${id}`);
  return res.data;
};

/* ── Cronograma ── */
export const crearActividadCronograma = async (data) => {
  const res = await api.post(`${BASE}/cronograma`, data);
  return res.data?.data || res.data;
};

export const actualizarActividadCronograma = async (id, data) => {
  const payload = { ...data, _method: 'PUT' };
  const res = await api.post(`${BASE}/cronograma/${id}`, payload);
  return res.data;
};

export const eliminarActividadCronograma = async (id) => {
  const res = await api.delete(`${BASE}/cronograma/${id}`);
  return res.data;
};

/* ── Libros ── */
export const crearLibro = async (formData) => {
  const res = await api.post(`${BASE}/libros`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const actualizarLibro = async (id, formData) => {
  formData.append('_method', 'PUT');
  const res = await api.post(`${BASE}/libros/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const eliminarLibro = async (id) => {
  const res = await api.delete(`${BASE}/libros/${id}`);
  return res.data;
};
