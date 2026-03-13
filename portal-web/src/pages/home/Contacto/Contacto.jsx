// src/pages/contacto/Contacto.jsx
import { useState, useCallback } from "react";
import { enviarMensaje, consultarContacto } from "../../../services/contactoService";
import "../../../assets/css/pages/Contacto.css";

/* ── Genera código en el cliente (mismo formato que el servidor) ── */
function generarCodigoLocal() {
  const hoy   = new Date();
  const yy    = String(hoy.getFullYear()).slice(-2);
  const mm    = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd    = String(hoy.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix  = '';
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `CON-${yy}${mm}${dd}-${suffix}`;
}

/* ── Estado → estilo ── */
const ESTADO_INFO = {
  pendiente:  { bg: '#fff8e1', color: '#b45309', icon: 'bi-hourglass-split',  label: 'Pendiente de revisión' },
  leido:      { bg: '#e8f4fd', color: '#1a6ca8', icon: 'bi-eye-fill',          label: 'En revisión' },
  respondido: { bg: '#e8f9f0', color: '#166534', icon: 'bi-check-circle-fill', label: 'Respondido — revisa tu correo' },
};

/* ══════════════════════════════════
   Consultar estado por código
══════════════════════════════════ */
function ConsultarContacto({ codigoInicial }) {
  const [codigo,    setCodigo]    = useState(codigoInicial || '');
  const [buscando,  setBuscando]  = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorMsg,  setErrorMsg]  = useState('');

  const buscar = useCallback(() => {
    const c = codigo.trim().toUpperCase();
    if (!c) { setErrorMsg('Ingresa un código de seguimiento.'); return; }
    setErrorMsg(''); setResultado(null); setBuscando(true);
    consultarContacto(c)
      .then(data => {
        if (data) setResultado(data);
        else setErrorMsg('Código no encontrado. Verifica que sea correcto.');
      })
      .catch(err => setErrorMsg(err?.message || 'No se pudo consultar el estado.'))
      .finally(() => setBuscando(false));
  }, [codigo]);

  const info = resultado ? (ESTADO_INFO[resultado.estado] || ESTADO_INFO.pendiente) : null;

  return (
    <div className="ct-consulta-card">
      <h4 className="ct-consulta-titulo">
        <i className="bi bi-search" /> Consultar estado de mensaje
      </h4>
      <p className="ct-consulta-sub">
        Ingresa el código de seguimiento para revisar el estado de tu consulta.
      </p>

      <div className="ct-consulta-row">
        <input
          type="text"
          className="ct-consulta-input"
          placeholder="EJEMPLO CON-260312-A3B7"
          value={codigo}
          onChange={e => { setCodigo(e.target.value.toUpperCase()); setErrorMsg(''); setResultado(null); }}
          onKeyDown={e => e.key === 'Enter' && buscar()}
          disabled={buscando}
        />
        <button className="ct-consulta-btn" onClick={buscar} disabled={buscando || !codigo.trim()}>
          {buscando
            ? <><i className="bi bi-arrow-repeat ct-spin" /> Buscando...</>
            : <><i className="bi bi-search" /> Consultar</>
          }
        </button>
      </div>

      {errorMsg && (
        <p className="ct-consulta-error">
          <i className="bi bi-exclamation-triangle" /> {errorMsg}
        </p>
      )}

      {resultado && info && (
        <div className="ct-resultado" style={{ background: info.bg, borderColor: info.color }}>
          <div className="ct-resultado-estado" style={{ color: info.color }}>
            <i className={`bi ${info.icon}`} /> {info.label}
          </div>
          <div className="ct-resultado-detalle">
            <span className="ct-resultado-label">Código:</span>
            <span className="ct-resultado-valor" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{resultado.codigo}</span>
          </div>
          <div className="ct-resultado-detalle">
            <span className="ct-resultado-label">Mensaje:</span>
            <span className="ct-resultado-valor">{resultado.mensaje}</span>
          </div>
          <div className="ct-resultado-detalle">
            <span className="ct-resultado-label">Fecha:</span>
            <span className="ct-resultado-valor">{resultado.fecha}</span>
          </div>
          {resultado.respuesta && (
            <div className="ct-resultado-respuesta">
              <div className="ct-resultado-respuesta-titulo">
                <i className="bi bi-reply-fill" /> Respuesta del equipo
              </div>
              <p className="ct-resultado-respuesta-texto">{resultado.respuesta}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   Página principal
══════════════════════════════════ */
function Contacto() {
  const [openIndex, setOpenIndex] = useState(null);

  /* Código pre-generado al montar */
  const [codigo,  setCodigo]  = useState(() => generarCodigoLocal());
  const [copiado, setCopiado] = useState(false);

  /* Formulario */
  const [formData, setFormData] = useState({ nombre: "", email: "", rol: "", mensaje: "" });
  const [errors,   setErrors]   = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  /* Éxito */
  const [exitoCodigo, setExitoCodigo] = useState(null);

  // Preguntas frecuentes
  const faqs = [
    {
      pregunta: "¿Cuál es el objetivo del Proyecto FONDEP?",
      respuesta: "Analizar cómo las estrategias creativas e interculturales fortalecen las competencias comunicativas en castellano como segunda lengua en estudiantes del VRAEM.",
    },
    {
      pregunta: "¿Dónde se implementa?",
      respuesta: "En la IE Secundaria Andrés Avelino Cáceres, en Sirenachayocc, distrito de Kimbiri, provincia La Convención, región Cusco.",
    },
    {
      pregunta: "¿Qué metodología se utiliza?",
      respuesta: "La Investigación Acción Participativa en Educación (IAPE), en 5 fases: planificación, implementación, análisis, reflexión y sostenibilidad.",
    },
  ];

  const toggleAccordion = (index) => setOpenIndex(openIndex === index ? null : index);

  /* ── Copiar código ── */
  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }).catch(() => {});
  };

  /* ── Validación ── */
  const validateField = (name, value) => {
    switch (name) {
      case "nombre":  return !value.trim() || value.length < 3 ? "El nombre debe tener al menos 3 caracteres." : "";
      case "email":   return !value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "El correo no es válido." : "";
      case "rol":     return !value ? "Debes seleccionar un rol." : "";
      case "mensaje": return !value.trim() || value.length < 10 ? "El mensaje debe tener al menos 10 caracteres." : "";
      default:        return "";
    }
  };

  const validateForm = () => {
    const errs = {};
    Object.keys(formData).forEach(name => {
      const e = validateField(name, formData[name]);
      if (e) errs[name] = e;
    });
    return errs;
  };

  const isFormValid = () => Object.keys(validateForm()).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (errorGeneral) setErrorGeneral(null);
  };

  /* ── Enviar ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setIsSubmitting(true);
    setErrorGeneral(null);

    try {
      const resultado = await enviarMensaje({ ...formData, codigo });
      if (resultado && resultado.success) {
        const codigoFinal = resultado.codigo || codigo;
        setExitoCodigo(codigoFinal);
        setFormData({ nombre: "", email: "", rol: "", mensaje: "" });
        setErrors({});
        setCodigo(generarCodigoLocal());
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorGeneral(resultado?.error || resultado?.message || 'Error al enviar el mensaje.');
      }
    } catch (error) {
      setErrorGeneral('Ocurrió un error al enviar tu mensaje. Por favor, intenta nuevamente.');
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
                  className={`accordion-button ${openIndex !== index ? "collapsed" : ""}`}
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={openIndex === index}
                >
                  <i className="bi bi-question-diamond me-2 text-primary"></i>
                  {faq.pregunta}
                </button>
              </h2>
              <div className={`accordion-collapse collapse ${openIndex === index ? "show" : ""}`}>
                <div className="accordion-body text-muted p-4">
                  <i className="bi bi-chat-left-text me-2"></i>
                  {faq.respuesta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner de éxito */}
      {exitoCodigo && (
        <div className="ct-exito-banner mb-4">
          <i className="bi bi-check-circle-fill" />
          <div>
            <strong>¡Mensaje enviado!</strong>
            <span> Tu código de seguimiento es: </span>
            <span className="ct-exito-codigo">{exitoCodigo}</span>
          </div>
          <button className="ct-exito-cerrar" onClick={() => setExitoCodigo(null)} title="Cerrar">
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}

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

              {/* Código de seguimiento */}
              <div className="ct-codigo-previo mb-4">
                <div className="ct-codigo-previo-label">
                  <i className="bi bi-upc-scan" /> Código de seguimiento generado
                </div>
                <div className="ct-codigo-previo-row">
                  <span className="ct-codigo-previo-valor">{codigo}</span>
                  <button type="button" className="ct-codigo-previo-copiar" onClick={copiarCodigo}>
                    <i className={`bi ${copiado ? 'bi-check2' : 'bi-clipboard'}`} />
                    {copiado ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="ct-codigo-previo-nota">
                  <i className="bi bi-info-circle" /> Copia este código antes de enviar. Lo necesitarás para consultar el estado de tu mensaje.
                </p>
              </div>

              {/* Error general */}
              {errorGeneral && (
                <div className="alert alert-danger d-flex align-items-center mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errorGeneral}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Nombre */}
                <div className="mb-4">
                  <label htmlFor="nombre" className="form-label fw-semibold">
                    <i className="bi bi-person me-2 text-secondary"></i>Nombre completo
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${errors.nombre ? "is-invalid" : ""}`}
                    id="nombre" name="nombre"
                    value={formData.nombre} onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    disabled={isSubmitting} autoFocus
                  />
                  {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-semibold">
                    <i className="bi bi-envelope me-2 text-secondary"></i>Correo electrónico
                  </label>
                  <input
                    type="email"
                    className={`form-control form-control-lg ${errors.email ? "is-invalid" : ""}`}
                    id="email" name="email"
                    value={formData.email} onChange={handleChange}
                    placeholder="ejemplo@dominio.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Rol */}
                <div className="mb-4">
                  <label htmlFor="rol" className="form-label fw-semibold">
                    <i className="bi bi-people me-2 text-secondary"></i>¿Eres?
                  </label>
                  <select
                    className={`form-select form-select-lg ${errors.rol ? "is-invalid" : ""}`}
                    id="rol" name="rol"
                    value={formData.rol} onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="">Selecciona tu rol</option>
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="padre/madre">Padre/Madre</option>
                    <option value="comunidad">Comunidad</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errors.rol && <div className="invalid-feedback">{errors.rol}</div>}
                </div>

                {/* Mensaje */}
                <div className="mb-4">
                  <label htmlFor="mensaje" className="form-label fw-semibold">
                    <i className="bi bi-chat-square-text me-2 text-secondary"></i>Tu mensaje
                  </label>
                  <textarea
                    className={`form-control form-control-lg ${errors.mensaje ? "is-invalid" : ""}`}
                    id="mensaje" name="mensaje"
                    rows="5"
                    value={formData.mensaje} onChange={handleChange}
                    placeholder="Escribe aquí tu consulta..."
                    disabled={isSubmitting}
                  ></textarea>
                  {errors.mensaje && <div className="invalid-feedback">{errors.mensaje}</div>}
                </div>

                {/* Botón Enviar */}
                <button
                  type="submit"
                  className="btn btn-success w-100 py-3 fs-5 fw-bold"
                  disabled={isSubmitting || !isFormValid()}
                >
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...</>
                  ) : (
                    <><i className="bi bi-send me-2"></i>Enviar Mensaje</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Consultar estado de mensaje */}
      <div className="row justify-content-center mt-4">
        <div className="col-lg-8 col-md-10">
          <ConsultarContacto codigoInicial={exitoCodigo || ''} />
        </div>
      </div>

      {/* Nota al pie */}
      <div className="mt-4 p-4 bg-light rounded-4 text-center">
        <i className="bi bi-info-circle-fill me-2 text-primary"></i>
        <strong>Nota:</strong> Este proyecto es participativo: estudiantes, docentes y comunidad trabajan juntos para mejorar la comunicación en castellano como segunda lengua.
      </div>
    </div>
  );
}

export default Contacto;
