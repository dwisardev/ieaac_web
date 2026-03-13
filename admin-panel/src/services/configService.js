/**
 * configService.js — gestión de configuración institucional y metadatos FONDEP
 */
import api from './api';

export const configService = {
  // Información institucional
  getInformacion: () =>
    api.get('/admin/config/informacion').then(r => r.data?.data || null),

  updateInformacion: (datos) =>
    api.put('/admin/config/informacion', datos).then(r => r.data),

  // Metadatos del proyecto FONDEP
  getMetadata: () =>
    api.get('/admin/config/metadata').then(r => r.data?.data || []),

  updateMetadata: (clave, valor) =>
    api.put('/admin/config/metadata', { clave, valor }).then(r => r.data),
};
