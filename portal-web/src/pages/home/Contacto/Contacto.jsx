// src/pages/contacto/Contacto.jsx

import React, { useState } from "react";
import { enviarMensaje } from "../../../services/contactoService";
import "../../../assets/css/pages/Contacto.css";

function Contacto() {
  const [openIndex, setOpenIndex] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "",
    mensaje: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Preguntas frecuentes
  const faqs = [
    {
      pregunta: "¿Cuál es el objetivo del Proyecto FONDEP?",
      respuesta:
        "Analizar cómo las estrategias creativas e interculturales fortalecen las competencias comunicativas en castellano como segunda lengua en estudiantes del VRAEM.",
    },
    {
      pregunta: "¿Dónde se implementa?",
      respuesta:
        "En la IE Secundaria Andrés Avelino Cáceres, en Sirenachayocc, distrito de Manitea, región Cusco.",
    },
    {
      pregunta: "¿Qué metodología se utiliza?",
      respuesta:
        "La Investigación Acción Participativa en Educación (IAPE), en 5 fases: planificación, implementación, análisis, reflexión y sostenibilidad.",
    },
  ];

  // Toggle del acordeón
  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Manejo de cambios del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Limpiar mensajes de éxito/error general
    if (submitSuccess) setSubmitSuccess(false);
    if (submitError) setSubmitError(null);
  };

  // Validación individual
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":
        if (!value.trim()) {
          error = "El nombre es obligatorio.";
        } else if (value.length < 3) {
          error = "El nombre debe tener al menos 3 caracteres.";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "El correo es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "El correo no es válido.";
        }
        break;
      case "rol":
        if (!value) {
          error = "Debes seleccionar un rol.";
        }
        break;
      case "mensaje":
        if (!value.trim()) {
          error = "El mensaje no puede estar vacío.";
        } else if (value.length < 10) {
          error = "El mensaje debe tener al menos 10 caracteres.";
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Validación completa del formulario
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((name) => {
      const error = validateField(name, formData[name]);
      if (error) {
        newErrors[name] = error;
      }
    });
    return newErrors;
  };

  // Verificar si el formulario es válido
  const isFormValid = () => {
    const validationErrors = validateForm();
    return Object.keys(validationErrors).length === 0;
  };

  // Envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      const resultado = await enviarMensaje(formData);
      
      if (resultado.success) {
        setSubmitSuccess(true);
        setFormData({ nombre: "", email: "", rol: "", mensaje: "" });
        setErrors({});
        
        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(resultado.message || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setSubmitError('Ocurrió un error al enviar tu mensaje. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      {/* Título principal */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">
          <i className="bi bi-envelope me-2"></i>
          Contáctanos
        </h1>
        <p className="lead text-muted">
          ¿Tienes dudas sobre el Proyecto FONDEP? Revisa nuestras preguntas frecuentes o envíanos un mensaje.
        </p>
      </div>

      {/* Sección Preguntas Frecuentes */}
      <section className="mb-5">
        <h2 className="text-center mb-4 fw-bold">
          <i className="bi bi-question-circle-fill me-2 text-info"></i>
          Preguntas Frecuentes
        </h2>
        <div className="accordion" id="faqAccordion">
          {faqs.map((faq, index) => (
            <div className="accordion-item shadow-sm mb-3" key={index}>
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${
                    openIndex !== index ? "collapsed" : ""
                  }`}
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`collapse${index}`}
                >
                  <i className="bi bi-question-diamond me-2 text-primary"></i>
                  {faq.pregunta}
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className={`accordion-collapse collapse ${
                  openIndex === index ? "show" : ""
                }`}
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body text-muted p-4">
                  <i className="bi bi-chat-left-text me-2"></i>
                  {faq.respuesta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formulario de contacto */}
      <section>
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="contact-card p-4 p-md-5 shadow-lg rounded-4 bg-white border">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary rounded-circle p-3 me-3">
                  <i className="bi bi-envelope-open-fill text-white fs-4"></i>
                </div>
                <h3 className="mb-0">Envíanos tu consulta</h3>
              </div>

              {/* Mensaje de éxito */}
              {submitSuccess && (
                <div className="alert alert-success d-flex align-items-center mb-4">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  ¡Gracias por contactarnos! Hemos recibido tu mensaje y te responderemos pronto.
                </div>
              )}

              {/* Mensaje de error */}
              {submitError && (
                <div className="alert alert-danger d-flex align-items-center mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Nombre */}
                <div className="mb-4">
                  <label htmlFor="nombre" className="form-label fw-semibold">
                    <i className="bi bi-person me-2 text-secondary"></i>
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${
                      errors.nombre ? "is-invalid" : ""
                    }`}
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    disabled={isSubmitting}
                    autoFocus
                  />
                  {errors.nombre && (
                    <div className="invalid-feedback">{errors.nombre}</div>
                  )}
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-semibold">
                    <i className="bi bi-envelope me-2 text-secondary"></i>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    className={`form-control form-control-lg ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@dominio.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Rol */}
                <div className="mb-4">
                  <label htmlFor="rol" className="form-label fw-semibold">
                    <i className="bi bi-people me-2 text-secondary"></i>
                    ¿Eres?
                  </label>
                  <select
                    className={`form-select form-select-lg ${
                      errors.rol ? "is-invalid" : ""
                    }`}
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="">Selecciona tu rol</option>
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="padre/madre">Padre/Madre</option>
                    <option value="comunidad">Comunidad</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errors.rol && (
                    <div className="invalid-feedback">{errors.rol}</div>
                  )}
                </div>

                {/* Mensaje */}
                <div className="mb-4">
                  <label htmlFor="mensaje" className="form-label fw-semibold">
                    <i className="bi bi-chat-square-text me-2 text-secondary"></i>
                    Tu mensaje
                  </label>
                  <textarea
                    className={`form-control form-control-lg ${
                      errors.mensaje ? "is-invalid" : ""
                    }`}
                    id="mensaje"
                    name="mensaje"
                    rows="5"
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Escribe aquí tu consulta..."
                    disabled={isSubmitting}
                  ></textarea>
                  {errors.mensaje && (
                    <div className="invalid-feedback">{errors.mensaje}</div>
                  )}
                </div>

                {/* Botón Enviar */}
                <button
                  type="submit"
                  className="btn btn-success w-100 py-3 fs-5 fw-bold"
                  disabled={isSubmitting || !isFormValid()}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Nota al pie */}
      <div className="mt-5 p-4 bg-light rounded-4 text-center">
        <i className="bi bi-info-circle-fill me-2 text-primary"></i>
        <strong>Nota:</strong> Este proyecto es participativo: estudiantes, docentes y comunidad trabajan juntos para mejorar la comunicación en castellano como segunda lengua.
      </div>
    </div>
  );
}

export default Contacto;