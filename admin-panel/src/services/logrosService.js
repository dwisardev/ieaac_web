/**
 * logrosService.js — admin-panel
 * Gestión de logros institucionales
 */
import api from './api';

const normalizeList = (res) => Array.isArray(res.data) ? res.data : res.data?.data || [];
const normalizeOne  = (res) => res.data?.data || res.data || null;

export const logrosService = {
  getAll: async (params = {}) => {
    const res = await api.get('/admin/logros', { params });
    return normalizeList(res);
  },

  getById: async (id) => {
    const res = await api.get(`/admin/logros/${id}`);
    return normalizeOne(res);
  },

  create: async (formData) => {
    const res = await api.post('/admin/logros', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeOne(res);
  },

  update: async (id, formData) => {
    formData.append('_method', 'PUT');
    const res = await api.post(`/admin/logros/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeOne(res);
  },

  delete: async (id) => {
    const res = await api.delete(`/admin/logros/${id}`);
    return res.data;
  },

  toggleActivo: async (id) => {
    const res = await api.patch(`/admin/logros/${id}`);
    return res.data;
  },
};
