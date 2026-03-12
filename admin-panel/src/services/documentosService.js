/**
 * documentosService.js
 * Gestión de documentos de gestión e información institucional
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

const normalizeOne = (res) =>
  res.data?.data || res.data || null;

/* ── TIPOS DE DOCUMENTO ── */
export const TIPOS_DOCUMENTO = {
  PDF: {
    label: 'PDF',
    color: '#dc3545',
    extension: '.pdf',
  },
  WORD: {
    label: 'Word',
    color: '#2b579a',
    extension: '.doc/.docx',
  },
  EXCEL: {
    label: 'Excel',
    color: '#217346',
    extension: '.xls/.xlsx',
  },
  POWERPOINT: {
    label: 'PowerPoint',
    color: '#d04423',
    extension: '.ppt/.pptx',
  },
  DESCONOCIDO: {
    label: 'Otro',
    color: '#6c757d',
    extension: '',
  },
};

export const obtenerTipoDocumento = (nombreArchivo) => {
  const ext = nombreArchivo.split('.').pop()?.toLowerCase();
  const mapa = {
    pdf: 'PDF',
    doc: 'WORD', docx: 'WORD',
    xls: 'EXCEL', xlsx: 'EXCEL',
    ppt: 'POWERPOINT', pptx: 'POWERPOINT',
  };
  const tipo = mapa[ext] || 'DESCONOCIDO';
  return { tipo, ...TIPOS_DOCUMENTO[tipo] };
};

/* ── DOCUMENTOS ── */

/** GET /api/documentos — lista pública */
export const obtenerDocumentosGestion = async () => {
  const res = await api.get('/documentos');
  return normalizeList(res);
};

/** GET /api/admin/documentos — admin */
export const obtenerDocumentosAdmin = async () => {
  const res = await api.get('/admin/documentos');
  return normalizeList(res);
};

/** POST /api/admin/documentos — crear */
export const crearDocumento = async (formData) => {
  const res = await api.post('/admin/documentos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeOne(res);
};

/** PUT /api/admin/documentos/{id} — actualizar (method spoofing) */
export const actualizarDocumento = async (id, formData) => {
  formData.append('_method', 'PUT');
  const res = await api.post(`/admin/documentos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeOne(res);
};

/** DELETE /api/admin/documentos/{id} */
export const eliminarDocumento = async (id) => {
  const res = await api.delete(`/admin/documentos/${id}`);
  return res.data;
};

/** PATCH /api/documentos/{id} — registrar vista */
export const registrarVista = async (id) => {
  try {
    await api.patch(`/documentos/${id}`);
  } catch {
    // silenciar errores de tracking
  }
};

/** Búsqueda local */
export const buscarDocumentos = (documentos, termino) => {
  if (!termino?.trim()) return documentos;
  const t = termino.toLowerCase();
  return documentos.filter(doc =>
    doc.nombre?.toLowerCase().includes(t) ||
    doc.descripcion?.toLowerCase().includes(t) ||
    doc.codigo?.toLowerCase().includes(t)
  );
};

/* ── INFORMACIÓN INSTITUCIONAL ── */

/** GET /api/informacion — pública */
export const obtenerInfoPublica = async () => {
  const res = await api.get('/informacion');
  return normalizeOne(res);
};

/** GET /api/admin/documentos/info — admin */
export const obtenerInfoInstitucional = async () => {
  const res = await api.get('/admin/documentos/info');
  return normalizeOne(res);
};

/** PUT /api/admin/documentos/info — actualizar */
export const actualizarInfoInstitucional = async (data) => {
  const res = await api.put('/admin/documentos/info', data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizeOne(res);
};

/* ── ESTADÍSTICAS ── */
export const obtenerEstadisticas = async () => {
  const res = await api.get('/admin/documentos/estadisticas');
  return normalizeOne(res);
};
