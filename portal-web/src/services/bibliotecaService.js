/**
 * bibliotecaService.js — portal-web
 * Acceso público a la biblioteca virtual
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

const normalizeOne = (res) =>
  res.data?.data || res.data || null;

/** GET /api/biblioteca — lista completa con categorías */
export const obtenerBibliotecaCompleta = async () => {
  const res = await api.get('/biblioteca');
  return res.data?.data || res.data || [];
};

/** GET /api/biblioteca — todos los libros sin agrupación */
export const obtenerTodosLibros = async (params = {}) => {
  const res = await api.get('/biblioteca', { params });
  return normalizeList(res);
};

/** GET /api/biblioteca/estadisticas */
export const obtenerEstadisticasBiblioteca = async () => {
  const res = await api.get('/biblioteca/estadisticas');
  return normalizeOne(res);
};

/** PATCH /api/biblioteca/{id}/descargar */
export const registrarDescarga = async (id) => {
  try {
    await api.patch(`/biblioteca/${id}/descargar`);
  } catch {
    // silenciar
  }
};

export const bibliotecaService = {

  /** GET /api/biblioteca — lista de libros */
  getLibros: async (params = {}) => {
    const res = await api.get('/biblioteca', { params });
    return normalizeList(res);
  },

  /** GET /api/biblioteca/{id} — libro individual */
  getLibro: async (id) => {
    const res = await api.get(`/biblioteca/${id}`);
    return normalizeOne(res);
  },

  /** GET /api/biblioteca/categorias — categorías */
  getCategorias: async () => {
    const res = await api.get('/biblioteca/categorias');
    return normalizeList(res);
  },

  /** GET /api/biblioteca/estadisticas */
  getEstadisticas: async () => {
    const res = await api.get('/biblioteca/estadisticas');
    return normalizeOne(res);
  },

  /** PATCH /api/biblioteca/{id}/descargar — registrar descarga */
  registrarDescarga: async (id) => {
    try {
      await api.patch(`/biblioteca/${id}/descargar`);
    } catch {
      // silenciar
    }
  },
};
