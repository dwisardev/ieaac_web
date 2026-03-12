import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { enviarPedido, consultarPedido } from "../../../services/pedidosService";
import "../../../assets/css/pages/PedidosLibro.css";

/* ── Genera código en el cliente (mismo formato que el servidor) ── */
function generarCodigoLocal() {
  const hoy   = new Date();
  const yy    = String(hoy.getFullYear()).slice(-2);
  const mm    = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd    = String(hoy.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix  = '';
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `PED-${yy}${mm}${dd}-${suffix}`;
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
function ConsultarPedido({ codigoInicial }) {
  const [codigo,    setCodigo]    = useState(codigoInicial || '');
  const [buscando,  setBuscando]  = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorMsg,  setErrorMsg]  = useState('');

  const buscar = useCallback(() => {
    const c = codigo.trim().toUpperCase();
    if (!c) { setErrorMsg('Ingresa un código de pedido.'); return; }
    setErrorMsg(''); setResultado(null); setBuscando(true);
    consultarPedido(c)
      .then(data => {
        if (data) setResultado(data);
        else setErrorMsg('Código no encontrado. Verifica que sea correcto.');
      })
      .catch(err => setErrorMsg(err?.message || 'No se pudo consultar el estado.'))
      .finally(() => setBuscando(false));
  }, [codigo]);

  const info = resultado ? (ESTADO_INFO[resultado.estado] || ESTADO_INFO.pendiente) : null;

  return (
    <div className="pl-consulta-card">
      <h4 className="pl-consulta-titulo">
        <i className="bi bi-search" /> Consultar estado de pedido
      </h4>
      <p className="pl-consulta-sub">
        Ingresa el código de seguimiento para revisar el estado de tu solicitud.
      </p>

      <div className="pl-consulta-row">
        <input
          type="text"
          className="pl-consulta-input"
          placeholder="EJEMPLO PED-260304-A3B7"
          value={codigo}
          onChange={e => { setCodigo(e.target.value.toUpperCase()); setErrorMsg(''); setResultado(null); }}
          onKeyDown={e => e.key === 'Enter' && buscar()}
          disabled={buscando}
        />
        <button className="pl-consulta-btn" onClick={buscar} disabled={buscando || !codigo.trim()}>
          {buscando
            ? <><i className="bi bi-arrow-repeat pl-spin" /> Buscando...</>
            : <><i className="bi bi-search" /> Consultar</>
          }
        </button>
      </div>

      {errorMsg && (
        <p className="pl-consulta-error">
          <i className="bi bi-exclamation-triangle" /> {errorMsg}
        </p>
      )}

      {resultado && info && (
        <div className="pl-resultado" style={{ background: info.bg, borderColor: info.color }}>
          <div className="pl-resultado-estado" style={{ color: info.color }}>
            <i className={`bi ${info.icon}`} /> {info.label}
          </div>
          <div className="pl-resultado-detalle">
            <span className="pl-resultado-label">Libro:</span>
            <span className="pl-resultado-valor">{resultado.libro}</span>
          </div>
          <div className="pl-resultado-detalle">
            <span className="pl-resultado-label">Código:</span>
            <span className="pl-resultado-valor" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{resultado.codigo}</span>
          </div>
          <div className="pl-resultado-detalle">
            <span className="pl-resultado-label">Fecha:</span>
            <span className="pl-resultado-valor">{resultado.fecha}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   Página principal
══════════════════════════════════ */
export default function PedidoLibro() {
  /* Código pre-generado al montar */
  const [codigo,       setCodigo]       = useState(() => generarCodigoLocal());
  const [copiado,      setCopiado]      = useState(false);

  /* Formulario */
  const [form,         setForm]         = useState({ nombre: '', email: '', libro: '', detalles: '' });
  const [errors,       setErrors]       = useState({});
  const [enviando,     setEnviando]     = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  /* Éxito */
  const [exitoCodigo,  setExitoCodigo]  = useState(null);

  /* ── Copiar código ── */
  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }).catch(() => {});
  };

  /* ── Validación ── */
  const validar = () => {
    const e = {};
    if (!form.nombre.trim() || form.nombre.trim().length < 3)
      e.nombre = 'El nombre debe tener al menos 3 caracteres.';
    if (!form.email.trim() || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email))
      e.email = 'Ingresa un correo válido.';
    if (!form.libro.trim())
      e.libro = 'El título del libro es obligatorio.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
    if (errorGeneral) setErrorGeneral('');
  };

  /* ── Enviar ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setEnviando(true);
    setErrorGeneral('');

    enviarPedido({ ...form, codigo })
      .then(resultado => {
        if (resultado && resultado.success) {
          const codigoFinal = resultado.codigo || codigo;
          setExitoCodigo(codigoFinal);
          setForm({ nombre: '', email: '', libro: '', detalles: '' });
          setErrors({});
          setCodigo(generarCodigoLocal()); // nuevo código para el próximo pedido
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrorGeneral(resultado?.message || 'Error al enviar el pedido. Intenta nuevamente.');
        }
      })
      .catch(err => {
        setErrorGeneral(err?.message || 'Ocurrió un error al enviar tu pedido. Intenta nuevamente.');
      })
      .finally(() => setEnviando(false));
  };

  const valido = Object.keys(validar()).length === 0;

  return (
    <div className="pl-page">
      <div className="pl-container">

        {/* Volver */}
        <div className="pl-back">
          <Link to="/recursos/biblioteca-virtual" className="pl-back-link">
            <i className="bi bi-arrow-left" /> Volver a Biblioteca Virtual
          </Link>
        </div>

        {/* Cabecera */}
        <div className="pl-hero">
          <div className="pl-hero-icon"><i className="bi bi-book-half" /></div>
          <h1 className="pl-hero-titulo">Pide tu Libro</h1>
          <p className="pl-hero-sub">
            Tu código de seguimiento se genera automáticamente. Cópialo antes de enviar
            para poder rastrear el estado de tu solicitud.
          </p>
        </div>

        {/* Banner de éxito */}
        {exitoCodigo && (
          <div className="pl-exito-banner">
            <i className="bi bi-check-circle-fill" />
            <div>
              <strong>¡Pedido registrado!</strong>
              <span> Tu código de seguimiento es: </span>
              <span className="pl-exito-codigo">{exitoCodigo}</span>
            </div>
            <button className="pl-exito-cerrar" onClick={() => setExitoCodigo(null)} title="Cerrar">
              <i className="bi bi-x-lg" />
            </button>
          </div>
        )}

        {/* Formulario */}
        <div className="pl-form-card">
          <div className="pl-form-header">
            <i className="bi bi-clipboard-check" />
            <h4>Formulario de Solicitud</h4>
          </div>

          <div className="pl-form-body">

            {/* ── Código generado (read-only) — SIEMPRE PRIMERO ── */}
            <div className="pl-codigo-previo">
              <div className="pl-codigo-previo-label">
                <i className="bi bi-upc-scan" />
                Código de seguimiento generado
              </div>
              <div className="pl-codigo-previo-row">
                <span className="pl-codigo-previo-valor">{codigo}</span>
                <button
                  type="button"
                  className="pl-codigo-previo-copiar"
                  onClick={copiarCodigo}
                >
                  <i className={`bi ${copiado ? 'bi-check2' : 'bi-clipboard'}`} />
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="pl-codigo-previo-nota">
                <i className="bi bi-info-circle" /> Copia este código. Lo necesitarás para consultar el estado de tu pedido en la sección de abajo.
              </p>
            </div>

            {/* Error general */}
            {errorGeneral && (
              <div className="pl-alert-error">
                <i className="bi bi-exclamation-triangle-fill" /> {errorGeneral}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="pl-field">
                <label className="pl-label">
                  <i className="bi bi-person" /> Nombre completo
                </label>
                <input
                  type="text"
                  className={`pl-input${errors.nombre ? ' pl-input--error' : form.nombre ? ' pl-input--ok' : ''}`}
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. María López"
                  disabled={enviando}
                />
                {errors.nombre && <span className="pl-field-error">{errors.nombre}</span>}
              </div>

              <div className="pl-field">
                <label className="pl-label">
                  <i className="bi bi-envelope" /> Correo electrónico
                </label>
                <input
                  type="email"
                  className={`pl-input${errors.email ? ' pl-input--error' : form.email ? ' pl-input--ok' : ''}`}
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  disabled={enviando}
                />
                {errors.email && <span className="pl-field-error">{errors.email}</span>}
              </div>

              <div className="pl-field">
                <label className="pl-label">
                  <i className="bi bi-book" /> Libro solicitado
                </label>
                <input
                  type="text"
                  className={`pl-input${errors.libro ? ' pl-input--error' : form.libro ? ' pl-input--ok' : ''}`}
                  name="libro"
                  value={form.libro}
                  onChange={handleChange}
                  placeholder="Título del libro o autor"
                  disabled={enviando}
                />
                {errors.libro && <span className="pl-field-error">{errors.libro}</span>}
              </div>

              <div className="pl-field">
                <label className="pl-label">
                  <i className="bi bi-chat-text" /> Detalles adicionales{' '}
                  <span className="pl-opcional">(opcional)</span>
                </label>
                <textarea
                  className="pl-input pl-textarea"
                  name="detalles"
                  rows="4"
                  value={form.detalles}
                  onChange={handleChange}
                  placeholder="Ej. Edición, año, motivo del pedido..."
                  disabled={enviando}
                />
              </div>

              <button type="submit" className="pl-submit-btn" disabled={enviando || !valido}>
                {enviando
                  ? <><i className="bi bi-arrow-repeat pl-spin" /> Enviando...</>
                  : <><i className="bi bi-send" /> Enviar Solicitud</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* Consulta siempre visible abajo */}
        <ConsultarPedido codigoInicial={exitoCodigo || ''} />

      </div>
    </div>
  );
}
