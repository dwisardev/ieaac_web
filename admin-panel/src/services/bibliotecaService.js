/**
 * bibliotecaService.js
 * Gestión de biblioteca virtual (libros + categorías)
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

const normalizeOne = (res) =>
  res.data?.data || res.data || null;

/* ── LIBROS ── */

/** GET /api/biblioteca — lista pública de libros */
export const obtenerLibros = async (params = {}) => {
  const res = await api.get('/biblioteca', { params });
  return normalizeList(res);
};

/** GET /api/admin/biblioteca — todos los libros (admin) */
export const obtenerTodosLibros = async () => {
  const res = await api.get('/admin/biblioteca');
  return normalizeList(res);
};

/** POST /api/admin/biblioteca — crear libro */
export const crearLibro = async (formData) => {
  const res = await api.post('/admin/biblioteca', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeOne(res);
};

/** PUT /api/admin/biblioteca/libros/{id} — actualizar libro */
export const actualizarLibro = async (id, formData) => {
  formData.append('_method', 'PUT');
  const res = await api.post(`/admin/biblioteca/libros/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeOne(res);
};

/** DELETE /api/admin/biblioteca/libros/{id} — eliminar libro */
export const eliminarLibro = async (id) => {
  const res = await api.delete(`/admin/biblioteca/libros/${id}`);
  return res.data;
};

/** PATCH — registrar descarga */
export const registrarDescarga = async (id) => {
  const res = await api.patch(`/biblioteca/${id}/descargar`);
  return res.data;
};

/* ── CATEGORÍAS ── */

/** GET /api/biblioteca/categorias — lista pública de categorías */
export const obtenerCategorias = async () => {
  const res = await api.get('/biblioteca/categorias');
  return normalizeList(res);
};

/** GET /api/admin/biblioteca/categorias — admin */
export const obtenerCategoriasAdmin = async () => {
  const res = await api.get('/admin/biblioteca/categorias');
  return normalizeList(res);
};

/** POST /api/admin/biblioteca/categorias — crear categoría */
export const crearCategoria = async (data) => {
  const res = await api.post('/admin/biblioteca/categorias', data);
  return normalizeOne(res);
};

/** PUT /api/admin/biblioteca/categorias/{id} — actualizar */
export const actualizarCategoria = async (id, data) => {
  const res = await api.put(`/admin/biblioteca/categorias/${id}`, data);
  return normalizeOne(res);
};

/** DELETE /api/admin/biblioteca/categorias/{id} — eliminar */
export const eliminarCategoria = async (id) => {
  const res = await api.delete(`/admin/biblioteca/categorias/${id}`);
  return res.data;
};

/* ── ESTADÍSTICAS ── */

/** GET /api/admin/biblioteca/estadisticas */
export const obtenerEstadisticasBiblioteca = async () => {
  const res = await api.get('/admin/biblioteca/estadisticas');
  return normalizeOne(res);
};
