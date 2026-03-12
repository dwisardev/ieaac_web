/**
 * pedidosService.js — portal-web
 */
import api from './api';

export const enviarPedido = async (formData) => {
  const res = await api.post('/pedidos', formData);
  // Retorna el objeto completo con success + codigo + message
  return res.data || null;
};

export const consultarPedido = async (codigo) => {
  const codigoLimpio = String(codigo).trim().toUpperCase();
  const res = await api.get(`/pedidos?codigo=${encodeURIComponent(codigoLimpio)}`);
  return res.data?.data || null;
};
