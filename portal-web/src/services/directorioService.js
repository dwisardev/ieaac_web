/**
 * directorioService.js — portal-web
 * Acceso público al directorio del personal
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

export const directorioService = {

  /** GET /api/directorio — lista pública, activos, ordenados */
  getAll: async () => {
    const res = await api.get('/directorio');
    return normalizeList(res);
  },
};
