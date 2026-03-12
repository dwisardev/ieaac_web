/**
 * contactoService.js — portal-web
 * Envío de mensajes del formulario de contacto
 */

import api from './api';

/**
 * Envía un mensaje del formulario de contacto
 * @param {object} formData - { nombre, email, asunto, mensaje }
 */
export const enviarMensaje = async (formData) => {
  const res = await api.post('/contacto', formData);
  return res.data?.data || res.data || null;
};
