/**
 * noticiasService.js — portal-web
 * Ruta: src/services/noticiasService.js
 */
import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data :
  Array.isArray(res.data?.data) ? res.data.data : [];

export const noticiasService = {

  getAll: async () => {
    const res = await api.get('/noticias');
    return normalizeList(res);
  },

  getById: async (id) => {
    const res = await api.get(`/noticias/${id}`);
    return res.data?.data || res.data || null;
  },

  getImagenUrl: (noticia) => {
    if (!noticia) return null;
    if (noticia.imagen_url) return noticia.imagen_url;
    if (!noticia.imagen)    return null;
    if (noticia.imagen.startsWith('http')) return noticia.imagen;
    const base = import.meta.env.VITE_UPLOAD_URL || '';
    return `${base}/noticias/${noticia.imagen}`;
  },
};