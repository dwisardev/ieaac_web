import api from './api';

const normalize = (res) =>
  Array.isArray(res.data)       ? res.data :
  Array.isArray(res.data?.data) ? res.data.data : [];

export const bannersService = {

  /** GET /api/banners — banners activos (portal público) */
  getActivos: async () => {
    try {
      const res = await api.get('/banners');
      return normalize(res);
    } catch {
      return [];
    }
  },

  /** GET /api/admin/banners — todos los banners (admin) */
  getAll: async () => {
    const res = await api.get('/admin/banners');
    return normalize(res);
  },

  /** POST /api/admin/banners — crear banner (multipart/form-data) */
  create: async (formData) => {
    const res = await api.post('/admin/banners', formData);
    return res.data;
  },

  /** POST /api/admin/banners/{id} con _method=PUT — actualizar banner */
  update: async (id, formData) => {
    formData.append('_method', 'PUT');
    const res = await api.post(`/admin/banners/${id}`, formData);
    return res.data;
  },

  /** DELETE /api/admin/banners/{id} */
  delete: async (id) => {
    const res = await api.delete(`/admin/banners/${id}`);
    return res.data;
  },

  /** PATCH /api/admin/banners/{id}/toggle — activar/desactivar */
  toggleActivo: async (id) => {
    const res = await api.patch(`/admin/banners/${id}/toggle`);
    return res.data;
  },

  /** PATCH /api/admin/banners/1/orden — reordenar banners */
  updateOrden: async (items) => {
    const res = await api.patch('/admin/banners/1/orden', items);
    return res.data;
  },

  /** URL completa de imagen de banner */
  getImagenUrl: (banner) => {
    if (!banner)            return null;
    if (banner.imagen_url)  return banner.imagen_url;
    if (!banner.imagen)     return null;
    if (banner.imagen.startsWith('http')) return banner.imagen;
    const base = import.meta.env.VITE_UPLOAD_URL || '';
    return `${base}/banners/${banner.imagen}`;
  },
};
