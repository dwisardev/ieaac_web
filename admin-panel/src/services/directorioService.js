/**
 * directorioService.js
 * Gestión del directorio del personal
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

const normalizeOne = (res) =>
  res.data?.data || res.data || null;

export const directorioService = {

  /** GET /api/directorio — lista pública */
  getAll: async () => {
    const res = await api.get('/directorio');
    return normalizeList(res);
  },

  /** GET /api/admin/directorio — todos (admin) */
  getAllAdmin: async () => {
    const res = await api.get('/admin/directorio');
    return normalizeList(res);
  },

  /** POST /api/admin/directorio — crear */
  create: async (data) => {
    const res = await api.post('/admin/directorio', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return normalizeOne(res);
  },

  /** PUT /api/admin/directorio/{id} — actualizar */
  update: async (id, data) => {
    const res = await api.put(`/admin/directorio/${id}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return normalizeOne(res);
  },

  /** DELETE /api/admin/directorio/{id} — eliminar */
  delete: async (id) => {
    const res = await api.delete(`/admin/directorio/${id}`);
    return res.data;
  },
};
