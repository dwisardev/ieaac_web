/**
 * bannersService.js — portal-web
 * Acceso público a banners del carrusel principal
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

export const bannersService = {
  /** GET /api/banners — lista de banners activos */
  getActivos: async () => {
    const res = await api.get('/banners');
    return normalizeList(res);
  },
};
