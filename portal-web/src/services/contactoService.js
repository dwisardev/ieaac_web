/**
 * contactoService.js — portal-web
 */
import api from './api';

export const enviarMensaje = async (formData) => {
  const res = await api.post('/contacto', formData);
  return res.data || null;
};

export const consultarContacto = async (codigo) => {
  const codigoLimpio = String(codigo).trim().toUpperCase();
  const res = await api.get(`/contacto?codigo=${encodeURIComponent(codigoLimpio)}`);
  return res.data?.data || null;
};
