import api from './api';

const normalize = (res) =>
  Array.isArray(res.data)       ? res.data :
  Array.isArray(res.data?.data) ? res.data.data : [];

export const bannersService = {

  /** GET /api/banners — banners activos, ordenados por orden ASC */
  getActivos: async () => {
    try {
      const res = await api.get('/banners');
      return normalize(res);
    } catch {
      // Si el endpoint aún no existe, silenciar el error
      // HeroSection usará su banner fallback local
      return [];
    }
  },

  /** URL completa de imagen de banner */
  getImagenUrl: (banner) => {
    if (!banner)            return '/img/Banners/BannerHome.jpg';
    if (banner.imagen_url)  return banner.imagen_url;
    if (!banner.imagen)     return '/img/Banners/BannerHome.jpg';
    if (banner.imagen.startsWith('http')) return banner.imagen;
    const base = import.meta.env.VITE_UPLOAD_URL || '';
    return `${base}/banners/${banner.imagen}`;
  },
};