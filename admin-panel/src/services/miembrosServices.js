/**
 * miembrosServices.js — admin-panel
 * Gestión de miembros de la familia educativa
 */
import api from './api';

const normalizeList = (res) => Array.isArray(res.data) ? res.data : res.data?.data || [];
const normalizeOne  = (res) => res.data?.data || res.data || null;

/* ── Categorías ── */
export const obtenerCategorias = async () => {
  const res = await api.get('/admin/miembros/categorias');
  return normalizeList(res);
};

/* ── Completo (agrupado) ── */
export const obtenerMiembrosCompleto = async (anio = new Date().getFullYear()) => {
  const res = await api.get('/admin/miembros/completo', { params: { anio } });
  return normalizeOne(res);
};

/* ── CRUD miembros ── */
export const crearMiembro = async (data) => {
  const res = await api.post('/admin/miembros', data);
  return normalizeOne(res);
};

export const actualizarMiembro = async (id, data) => {
  const payload = { ...data, _method: 'PUT' };
  const res = await api.post(`/admin/miembros/${id}`, payload);
  return normalizeOne(res);
};

export const eliminarMiembro = async (id) => {
  const res = await api.delete(`/admin/miembros/${id}`);
  return res.data;
};

export const actualizarDirector = async (data) => {
  if (data.id) {
    return actualizarMiembro(data.id, data);
  }
  return crearMiembro(data);
};

/* ── Foto grupal de categoría ── */
export const uploadFotoGrupo = async (catId, file) => {
  const form = new FormData();
  form.append('foto_grupo', file);
  const res = await api.post(`/admin/miembros/categoria/${catId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteFotoGrupo = async (catId) => {
  const res = await api.delete(`/admin/miembros/categoria/${catId}`);
  return res.data;
};
