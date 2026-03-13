/**
 * metadataService.js — portal-web
 * Metadatos del Proyecto FONDEP
 */
import api from './api';

export const getMetadata = async () => {
  const res = await api.get('/metadata');
  return res.data?.data || {};
};

export const getMetadataClave = async (clave) => {
  const res = await api.get(`/metadata?clave=${encodeURIComponent(clave)}`);
  return res.data?.data || null;
};
