import api from './api';

export const contactoAdminService = {
  getAll: (params = {}) =>
    api.get('/admin/contacto', { params }).then(r => r.data?.data || []),

  getById: (id) =>
    api.get(`/admin/contacto/${id}`).then(r => r.data?.data),

  marcarLeido: (id) =>
    api.patch(`/admin/contacto/${id}/leer`).then(r => r.data),

  responder: (id, respuesta) =>
    api.put(`/admin/contacto/${id}/responder`, { respuesta }).then(r => r.data),

  delete: (id) =>
    api.delete(`/admin/contacto/${id}`).then(r => r.data),
};
