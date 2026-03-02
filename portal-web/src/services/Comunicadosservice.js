import api from './api';

const normalize = (res) =>
  Array.isArray(res.data)       ? res.data :
  Array.isArray(res.data?.data) ? res.data.data : [];

export const comunicadosService = {

  /** GET /api/comunicados — todos los activos */
  getAll: async () => {
    const res = await api.get('/comunicados');
    return normalize(res);
  },

  /** GET /api/comunicados/{id} */
  getById: async (id) => {
    const res = await api.get(`/comunicados/${id}`);
    return res.data?.data || res.data || null;
  },

  /**
   * Obtener el comunicado destacado para el modal de Home.
   * Filtra el primer comunicado con destacado=1 del listado.
   * Si el backend soporta ?destacado=1, lo usa directamente.
   */
  getDestacado: async () => {
    try {
      // Intentar con filtro por querystring primero
      const res = await api.get('/comunicados?destacado=1&limit=1');
      const list = normalize(res);
      return list[0] || null;
    } catch {
      // Si no soporta querystring, traer todos y filtrar localmente
      try {
        const res = await api.get('/comunicados');
        const list = normalize(res);
        return list.find(c => c.destacado || c.destacada) || null;
      } catch {
        return null;
      }
    }
  },
};

