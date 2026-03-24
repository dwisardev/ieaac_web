/**
 * horariosService.js — portal-web
 * Acceso público a horarios escolares
 */

import api from './api';

const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

export const horariosService = {

  /** GET /api/horarios/grados */
  getGrados: async () => {
    const res = await api.get('/horarios/grados');
    return normalizeList(res);
  },

  /** GET /api/horarios/docentes */
  getDocentes: async () => {
    const res = await api.get('/horarios/docentes');
    return normalizeList(res);
  },

  /** GET /api/horarios/bloques */
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
