/**
 * logrosService.js — portal-web
 * Acceso público a logros institucionales
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

export const logrosService = {
  /** GET /api/logros — lista de logros activos */
  getAll: async (params = {}) => {
    const res = await api.get('/logros', { params });
    return normalizeList(res);
  },

  /** GET /api/logros/{id} */
  getById: async (id) => {
    const res = await api.get(`/logros/${id}`);
    return res.data?.data || res.data || null;
  },
};
