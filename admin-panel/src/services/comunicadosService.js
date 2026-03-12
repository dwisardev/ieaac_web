/**
 * comunicadosService.js
 * Gestión de comunicados institucionales
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

const normalizeOne = (res) =>
  res.data?.data || res.data || null;

export const comunicadosService = {

  /** GET /api/comunicados — lista pública */
  getAll: async (params = {}) => {
    const res = await api.get('/comunicados', { params });
    return normalizeList(res);
  },

  /** GET /api/admin/comunicados — todos (admin) */
  getAllAdmin: async (params = {}) => {
    const res = await api.get('/admin/comunicados', { params });
    return normalizeList(res);
  },

  /** POST /api/admin/comunicados — crear */
  create: async (formData) => {
    const res = await api.post('/admin/comunicados', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeOne(res);
  },

  /** PUT /api/admin/comunicados/{id} — actualizar (method spoofing) */
  update: async (id, formData) => {
    formData.append('_method', 'PUT');
    const res = await api.post(`/admin/comunicados/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeOne(res);
  },

  /** DELETE /api/admin/comunicados/{id} — soft delete */
  delete: async (id) => {
    const res = await api.delete(`/admin/comunicados/${id}`);
    return res.data;
  },

  /** PATCH /api/admin/comunicados/{id}/destacar — toggle destacado */
  toggleDestacado: async (id) => {
    const res = await api.patch(`/admin/comunicados/${id}/destacar`);
    return res.data;
  },
};
