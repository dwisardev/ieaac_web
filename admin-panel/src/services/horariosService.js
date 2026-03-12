/**
 * horariosService.js
 * Gestión de horarios escolares
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

const normalizeOne = (res) =>
  res.data?.data || res.data || null;

/* ── GRADOS ── */
export const obtenerGrados = async () => {
  const res = await api.get('/horarios/grados');
  return normalizeList(res);
};

export const crearGrado = async (data) => {
  const res = await api.post('/admin/horarios/grados', data);
  return normalizeOne(res);
};

export const actualizarGrado = async (id, data) => {
  const res = await api.put(`/admin/horarios/grados/${id}`, data);
  return normalizeOne(res);
};

export const eliminarGrado = async (id) => {
  const res = await api.delete(`/admin/horarios/grados/${id}`);
  return res.data;
};

/* ── DOCENTES ── */
export const obtenerDocentes = async () => {
  const res = await api.get('/horarios/docentes');
  return normalizeList(res);
};

export const crearDocente = async (data) => {
  const res = await api.post('/admin/horarios/docentes', data);
  return normalizeOne(res);
};

export const actualizarDocente = async (id, data) => {
  const res = await api.put(`/admin/horarios/docentes/${id}`, data);
  return normalizeOne(res);
};

export const eliminarDocente = async (id) => {
  const res = await api.delete(`/admin/horarios/docentes/${id}`);
  return res.data;
};

/* ── BLOQUES ── */
export const obtenerBloques = async () => {
  const res = await api.get('/horarios/bloques');
  return normalizeList(res);
};

export const crearBloque = async (data) => {
  const res = await api.post('/admin/horarios/bloques', data);
  return normalizeOne(res);
};

export const actualizarBloque = async (id, data) => {
  const res = await api.put(`/admin/horarios/bloques/${id}`, data);
  return normalizeOne(res);
};

export const eliminarBloque = async (id) => {
  const res = await api.delete(`/admin/horarios/bloques/${id}`);
  return res.data;
};

/* ── HORARIOS ESTUDIANTE ── */
export const obtenerHorarioEstudiante = async (gradoId, anio = new Date().getFullYear()) => {
  const res = await api.get('/horarios/estudiante', { params: { grado_id: gradoId, anio } });
  return normalizeList(res);
};

export const obtenerTodosHorariosEstudiantes = async (anio = new Date().getFullYear()) => {
  const res = await api.get('/admin/horarios/estudiante', { params: { anio } });
  return normalizeList(res);
};

export const guardarHorarioEstudiante = async (gradoId, anio, bloques) => {
  const res = await api.post('/admin/horarios/estudiante', {
    grado_id: gradoId,
    anio_vigencia: anio,
    bloques,
  });
  return normalizeOne(res);
};

/* ── HORARIOS DOCENTE ── */
export const obtenerHorarioDocente = async (docenteId, anio = new Date().getFullYear()) => {
  const res = await api.get('/horarios/docente', { params: { docente_id: docenteId, anio } });
  return normalizeList(res);
};

export const obtenerTodosHorariosDocentes = async (anio = new Date().getFullYear()) => {
  const res = await api.get('/admin/horarios/docente', { params: { anio } });
  return normalizeList(res);
};

export const guardarHorarioDocente = async (docenteId, anio, bloques) => {
  const res = await api.post('/admin/horarios/docente', {
    docente_id: docenteId,
    anio_vigencia: anio,
    bloques,
  });
  return normalizeOne(res);
};
