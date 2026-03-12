/**
 * informeFinalService.js — admin-panel
 * Gestión del informe final FONDEP
 */
import api from './api';

const BASE = '/admin/informe';

/* ── Informe completo ── */
export const obtenerInformeCompleto = async () => {
  const res = await api.get(BASE);
  return res.data?.data || res.data || null;
};

export const calcularEstadisticasInforme = async () => {
  const res = await api.get(BASE);
  const data = res.data?.data || res.data || {};
  return data.estadisticas || null;
};

/* ── Metadata ── */
export const actualizarMetadata = async (data) => {
  const res = await api.post(`${BASE}/metadata`, data);
  return res.data;
};

/* ── Fases ── */
export const crearFase = async (data) => {
  const res = await api.post(`${BASE}/fases`, data);
  return res.data;
};

export const actualizarFase = async (id, data) => {
  const payload = { ...data, _method: 'PUT' };
  const res = await api.post(`${BASE}/fases/${id}`, payload);
  return res.data;
};

export const eliminarFase = async (id) => {
  const res = await api.delete(`${BASE}/fases/${id}`);
  return res.data;
};

/* ── Resultados ── */
export const crearResultado = async (data) => {
  const res = await api.post(`${BASE}/resultados`, data);
  return res.data;
};

export const actualizarResultado = async (id, data) => {
  const payload = { ...data, _method: 'PUT' };
  const res = await api.post(`${BASE}/resultados/${id}`, payload);
  return res.data;
};

export const eliminarResultado = async (id) => {
  const res = await api.delete(`${BASE}/resultados/${id}`);
  return res.data;
};

/* ── Logros destacados ── */
export const actualizarLogros = async (data) => {
  const res = await api.post(`${BASE}/logros`, data);
  return res.data;
};
