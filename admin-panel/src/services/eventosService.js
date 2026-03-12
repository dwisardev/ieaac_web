/**
 * eventosService.js
 * Gestión de eventos institucionales
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

const normalizeOne = (res) =>
  res.data?.data || res.data || null;

export const eventosService = {

  /** GET /api/eventos — lista pública */
  getAll: async () => {
    const res = await api.get('/eventos');
    return normalizeList(res);
  },

  /** GET /api/admin/eventos — todos (admin) */
  getAllAdmin: async () => {
    const res = await api.get('/admin/eventos');
    return normalizeList(res);
  },

  /** POST /api/admin/eventos — crear */
  create: async (formData) => {
    const res = await api.post('/admin/eventos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeOne(res);
  },

  /** PUT /api/admin/eventos/{id} — actualizar */
  update: async (id, formData) => {
    formData.append('_method', 'PUT');
    const res = await api.post(`/admin/eventos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeOne(res);
  },

  /** DELETE /api/admin/eventos/{id} */
  delete: async (id) => {
    const res = await api.delete(`/admin/eventos/${id}`);
    return res.data;
  },
};
