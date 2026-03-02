/**
 * noticiasService.js
 * Ubicación: src/services/noticiasService.js
 *
 * Compatible con el schema real de ieandres_db.noticias:
 *   activa (no activo), autor varchar(100), autor_id FK usuarios
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

const normalizeOne = (res) =>
  res.data?.data || res.data || null;

export const noticiasService = {

  /**
   * GET /api/noticias  — ruta pública, solo activas
   */
  getAll: async () => {
    const res = await api.get('/noticias');
    return normalizeList(res);
  },

  /**
   * GET /api/noticias/{id}  — pública
   */
  getById: async (id) => {
    const res = await api.get(`/noticias/${id}`);
    return normalizeOne(res);
  },

  /**
   * GET /api/admin/noticias  — admin, todas
   * Soporta querystring: ?q=texto&categoria=X&destacada=1
   */
  getAllAdmin: async (params = {}) => {
    const res = await api.get('/admin/noticias', { params });
    return normalizeList(res);
  },

  /**
   * POST /api/admin/noticias — crear
   * Recibe FormData (puede incluir imagen)
   */
  create: async (formData) => {
    const res = await api.post('/admin/noticias', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeOne(res);
  },

  /**
   * PUT /api/admin/noticias/{id} — actualizar
   * PHP no soporta PUT con multipart nativo →
   * enviamos POST con _method=PUT (method spoofing)
   */
  update: async (id, formData) => {
    formData.append('_method', 'PUT');
    const res = await api.post(`/admin/noticias/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeOne(res);
  },

  /**
   * DELETE /api/admin/noticias/{id} — soft delete (activa = 0)
   */
  delete: async (id) => {
    const res = await api.delete(`/admin/noticias/${id}`);
    return res.data;
  },

  /**
   * PATCH /api/admin/noticias/{id}/destacar — toggle destacada
   */
  toggleDestacada: async (id) => {
    const res = await api.patch(`/admin/noticias/${id}/destacar`);
    return normalizeOne(res);
  },

  /**
   * URL pública de la imagen de una noticia
   */
  getImagenUrl: (imagen) => {
    if (!imagen) return null;
    if (imagen.startsWith('http')) return imagen;
    const base = import.meta.env.VITE_UPLOAD_URL || '';
    return `${base}/noticias/${imagen}`;
  },
};