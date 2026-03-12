import api from './api';

export const pedidosAdminService = {
  getAll: (params = {}) =>
    api.get('/admin/pedidos', { params }).then(r => r.data?.data || []),

  getById: (id) =>
    api.get(`/admin/pedidos/${id}`).then(r => r.data?.data),

  marcarLeido: (id) =>
    api.patch(`/admin/pedidos/${id}/leer`).then(r => r.data),

  responder: (id, respuesta) =>
    api.put(`/admin/pedidos/${id}/responder`, { respuesta }).then(r => r.data),

  delete: (id) =>
    api.delete(`/admin/pedidos/${id}`).then(r => r.data),
};
