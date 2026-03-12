/**
 * docentesService.js — admin-panel
 * Gestión de docentes y auxiliares
 */
import api from './api';

const normalizeList = (res) => Array.isArray(res.data) ? res.data : res.data?.data || [];
const normalizeOne  = (res) => res.data?.data || res.data || null;

const docentesService = {
  getAll: async (params = {}) => {
    const res = await api.get('/admin/docentes', { params });
    return normalizeList(res);
  },

  getById: async (id) => {
    const res = await api.get(`/admin/docentes/${id}`);
    return normalizeOne(res);
  },

  create: async (formData) => {
    const res = await api.post('/admin/docentes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeOne(res);
  },

  update: async (id, formData) => {
    formData.append('_method', 'PUT');
    const res = await api.post(`/admin/docentes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeOne(res);
  },

  delete: async (id) => {
    const res = await api.delete(`/admin/docentes/${id}`);
    return res.data;
  },

  toggleActivo: async (id) => {
    const res = await api.patch(`/admin/docentes/${id}`);
    return res.data;
  },
};

export default docentesService;
