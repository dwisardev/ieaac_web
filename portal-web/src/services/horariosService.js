/**
 * horariosService.js — portal-web
 * Acceso público a horarios escolares
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

const normalizeOne = (res) =>
  res.data?.data || res.data || null;

/** GET /api/horarios/grados */
export const obtenerGrados = async () => {
  const res = await api.get('/horarios/grados');
  return normalizeList(res);
};

/** GET /api/horarios/docentes */
export const obtenerDocentes = async () => {
  const res = await api.get('/horarios/docentes');
  return normalizeList(res);
};

/** GET /api/horarios?tipo=estudiante — todos los horarios de estudiantes */
export const obtenerTodosHorariosEstudiantes = async (anio = new Date().getFullYear()) => {
  const res = await api.get('/horarios', { params: { tipo: 'estudiante', anio } });
  return normalizeList(res);
};

/** GET /api/horarios?tipo=docente — todos los horarios de docentes */
export const obtenerTodosHorariosDocentes = async (anio = new Date().getFullYear()) => {
  const res = await api.get('/horarios', { params: { tipo: 'docente', anio } });
  return normalizeList(res);
};

export const horariosService = {

  /** GET /api/horarios/grados — lista de grados */
  getGrados: async () => {
    const res = await api.get('/horarios/grados');
    return normalizeList(res);
  },

  /** GET /api/horarios/docentes — lista de docentes */
  getDocentes: async () => {
    const res = await api.get('/horarios/docentes');
    return normalizeList(res);
  },

  /** GET /api/horarios/bloques — bloques horarios */
  getBloques: async () => {
    const res = await api.get('/horarios/bloques');
    return normalizeList(res);
  },

  /** GET /api/horarios/estudiante?grado_id={id}&anio={anio} */
  getHorarioEstudiante: async (gradoId, anio = new Date().getFullYear()) => {
    const res = await api.get('/horarios/estudiante', {
      params: { grado_id: gradoId, anio },
    });
    return normalizeList(res);
  },

  /** GET /api/horarios/docente?docente_id={id}&anio={anio} */
  getHorarioDocente: async (docenteId, anio = new Date().getFullYear()) => {
    const res = await api.get('/horarios/docente', {
      params: { docente_id: docenteId, anio },
    });
    return normalizeList(res);
  },
};
