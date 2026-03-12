/**
 * documentosService.js — portal-web
 * Acceso público a documentos de gestión e información institucional
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

const normalizeOne = (res) =>
  res.data?.data || res.data || null;

export const TIPOS_DOCUMENTO = {
  REGLAMENTO: 'reglamento',
  PEI: 'pei',
  PAT: 'pat',
  RI: 'ri',
  INFORME: 'informe',
  OTRO: 'otro',
};

/** GET /api/documentos — lista pública de documentos de gestión */
export const obtenerDocumentosGestion = async (params = {}) => {
  const res = await api.get('/documentos', { params });
  return normalizeList(res);
};

/** GET /api/informacion — información institucional */
export const obtenerInfoInstitucional = async () => {
  const res = await api.get('/informacion');
  return normalizeOne(res);
};

/** PATCH /api/documentos/{id}/descargar */
export const registrarDescargaDocumento = async (id) => {
  try {
    await api.patch(`/documentos/${id}/descargar`);
  } catch {
    // silenciar
  }
};

/** PATCH /api/documentos/{id}/vista */
export const registrarVistaDocumento = async (id) => {
  try {
    await api.patch(`/documentos/${id}/vista`);
  } catch {
    // silenciar
  }
};

/** GET /api/documentos?q={term} */
export const buscarDocumentos = async (query) => {
  const res = await api.get('/documentos', { params: { q: query } });
  return normalizeList(res);
};

export const documentosService = {
  getAll: obtenerDocumentosGestion,
  getInfoInstitucional: obtenerInfoInstitucional,
  registrarVista: registrarVistaDocumento,
};
