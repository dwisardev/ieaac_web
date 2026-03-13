// src/pages/Admin/PlanLectorAdmin.jsx - PARTE 1
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Table,
  Badge,
  Tabs,
  Tab
} from "react-bootstrap";
import {
  BookHalf,
  PlusCircle,
  Pencil,
  Trash,
  GearFill,
  CheckCircle,
  CalendarCheck,
  FileEarmarkPdf
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";

// Importar servicio (ya tiene todas las funciones CRUD)
import {
  obtenerPlanLectorCompleto,
  actualizarConfiguracion,
  eliminarConfiguracion,
  desactivarConfiguracion,
  crearMeta,
  actualizarMeta,
  eliminarMeta,
  crearActividadCronograma,
  actualizarActividadCronograma,
  eliminarActividadCronograma,
  crearLibro,
  actualizarLibro,
  eliminarLibro
} from "../services/planLectorService";

const AdminPlanLector = () => {
  // Estados generales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("configuracion");
  const [anioEscolar, setAnioEscolar] = useState(new Date().getFullYear());

  // Estados de datos
  const [configuracion, setConfiguracion] = useState(null);
  const [metas, setMetas] = useState([]);
  const [cronograma, setCronograma] = useState([]);
  const [librosPorGrado, setLibrosPorGrado] = useState([]);

  // Estados de modales
  const [showModalConfig, setShowModalConfig] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado de formulario configuración
  const [formConfig, setFormConfig] = useState({
    id: null,
    anio_escolar: new Date().getFullYear(),
    director: "",
    codigo_modular: "",
    lema: "",
    descripcion: ""
  });
  const [showModalMeta, setShowModalMeta] = useState(false);

  const [formMeta, setFormMeta] = useState({
    id: null,
    meta: "",
    orden: 1,
    anio: new Date().getFullYear()
  });
  const [showModalCronograma, setShowModalCronograma] = useState(false);
  const [formCronograma, setFormCronograma] = useState({
    id: null,
    mes: "",
    orden_mes: 1,
    actividades: [],
    responsable: "",
    anio: new Date().getFullYear()
  });
  const [actividadInput, setActividadInput] = useState("");
const [showModalLibro, setShowModalLibro] = useState(false);
const [formLibro, setFormLibro] = useState({
  id: null,
  titulo: "",
  autor: "",
  grado_id: 1,
  archivo: null,
  orden: 1,
  anio: new Date().getFullYear()
});
const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

// Lista de grados disponibles
const gradosDisponibles = [
  { id: 1, nombre: "1°" },
  { id: 2, nombre: "2°" },
  { id: 3, nombre: "3°" },
  { id: 4, nombre: "4°" },
  { id: 5, nombre: "5°" }
];

  // Cargar datos al montar
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, [anioEscolar]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const datos = await obtenerPlanLectorCompleto(anioEscolar);

      setConfiguracion(datos.configuracion || null);
      setMetas(datos.metas || []);
      setCronograma(datos.cronograma || []);
      setLibrosPorGrado(datos.librosPorGrado || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // GESTIÓN DE CONFIGURACIÓN
  // ==========================================

  const abrirModalConfig = () => {
    if (configuracion) {
      setFormConfig(configuracion);
      setModoEdicion(true);
    } else {
      setFormConfig({
        id: null,
        anio_escolar: anioEscolar,
        director: "",
        codigo_modular: "",
        lema: "Descubre mundos y amplía tu mente",
        descripcion: ""
      });
      setModoEdicion(false);
    }
    setShowModalConfig(true);
  };

  const cerrarModalConfig = () => {
    setShowModalConfig(false);
    setFormConfig({
      id: null,
      anio_escolar: anioEscolar,
      director: "",
      codigo_modular: "",
      lema: "",
      descripcion: ""
    });
    setModoEdicion(false);
  };

  const handleChangeConfig = (e) => {
    const { name, value } = e.target;
    setFormConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitConfig = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await actualizarConfiguracion(formConfig);
      setSuccess(modoEdicion ? "Configuración actualizada correctamente" : "Configuración creada correctamente");
      cerrarModalConfig();
      await cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al guardar configuración:", err);
      setError("Error al guardar la configuración. Intente nuevamente.");
    }
  };

  const handleEliminarConfig = async () => {
    if (!window.confirm(`¿Eliminar la configuración del año ${anioEscolar}? Esta acción no se puede deshacer.`)) return;
    try {
      setError(null);
      await eliminarConfiguracion(anioEscolar);
      setSuccess("Configuración eliminada");
      await cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error al eliminar la configuración.");
    }
  };

  const handleDesactivarConfig = async () => {
    if (!window.confirm(`¿Desactivar la configuración del año ${anioEscolar}? Dejará de aparecer en el portal.`)) return;
    try {
      setError(null);
      await desactivarConfiguracion(anioEscolar);
      setSuccess("Configuración desactivada");
      await cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error al desactivar la configuración.");
    }
  };

  // Renderizar sección de configuración
  const renderSeccionConfiguracion = () => (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <GearFill className="me-2" />
          Configuración General del Plan Lector
        </h5>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="light" size="sm" onClick={abrirModalConfig}>
            <Pencil className="me-1" />
            {configuracion ? 'Editar' : 'Nueva Configuración'}
          </Button>
          {configuracion && (
            <>
              <Button variant="warning" size="sm" onClick={handleDesactivarConfig}>
                <i className="fas fa-ban me-1" style={{ marginRight: 4 }} />
                Desactivar
              </Button>
              <Button variant="danger" size="sm" onClick={handleEliminarConfig}>
                <Trash className="me-1" />
                Eliminar
              </Button>
            </>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        {configuracion ? (
          <Row>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Año Escolar</strong>
              <p className="mb-0">{configuracion.anio_escolar}</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Código Modular</strong>
              <p className="mb-0">{configuracion.codigo_modular}</p>
            </Col>
            <Col md={12} className="mb-3">
              <strong className="d-block text-muted small">Director</strong>
              <p className="mb-0">{configuracion.director}</p>
            </Col>
            <Col md={12} className="mb-3">
              <strong className="d-block text-muted small">Lema</strong>
              <p className="mb-0 fst-italic text-primary">"{configuracion.lema}"</p>
            </Col>
            <Col md={12}>
              <strong className="d-block text-muted small">Descripción</strong>
              <p className="mb-0">{configuracion.descripcion}</p>
            </Col>
          </Row>
        ) : (
          <Alert variant="info">
            No hay configuración registrada para el año {anioEscolar}.
            Haga clic en "Editar" para agregarla.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

  // Modal de configuración
  const renderModalConfig = () => (
    showModalConfig && (
      <div className="modal-overlay" onClick={cerrarModalConfig}>
        <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              <i className="fas fa-gear" />
              Configuración del Plan Lector
            </h3>
            <button className="modal-close" onClick={cerrarModalConfig}>
              <i className="fas fa-xmark" />
            </button>
          </div>
          <form onSubmit={handleSubmitConfig}>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Año Escolar *</label>
                  <input className="form-input" type="number" name="anio_escolar" value={formConfig.anio_escolar} onChange={handleChangeConfig} min="2020" max="2030" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Código Modular *</label>
                  <input className="form-input" type="text" name="codigo_modular" value={formConfig.codigo_modular} onChange={handleChangeConfig} placeholder="Ej: 1372374" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Director *</label>
                <input className="form-input" type="text" name="director" value={formConfig.director} onChange={handleChangeConfig} placeholder="Ej: Gerardo Florez Condori" required />
              </div>

              <div className="form-group">
                <label className="form-label">Lema del Plan Lector *</label>
                <input className="form-input" type="text" name="lema" value={formConfig.lema} onChange={handleChangeConfig} placeholder="Ej: Descubre mundos y amplía tu mente" required />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-input" name="descripcion" value={formConfig.descripcion} onChange={handleChangeConfig} placeholder="Descripción general del Plan Lector" rows={3} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={cerrarModalConfig}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-floppy-disk" /> Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  // ==========================================
  // GESTIÓN DE METAS
  // ==========================================

  const abrirModalMeta = (meta = null) => {
    if (meta) {
      setFormMeta(meta);
      setModoEdicion(true);
    } else {
      const maxOrden = metas.length > 0
        ? Math.max(...metas.map(m => m.orden))
        : 0;

      setFormMeta({
        id: null,
        meta: "",
        orden: maxOrden + 1,
        anio: anioEscolar
      });
      setModoEdicion(false);
    }
    setShowModalMeta(true);
  };

  const cerrarModalMeta = () => {
    setShowModalMeta(false);
    setFormMeta({
      id: null,
      meta: "",
      orden: 1,
      anio: anioEscolar
    });
    setModoEdicion(false);
  };

  const handleChangeMeta = (e) => {
    const { name, value } = e.target;
    setFormMeta(prev => ({
      ...prev,
      [name]: name === "orden" ? parseInt(value) : value
    }));
  };

  const handleSubmitMeta = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      if (modoEdicion) {
        await actualizarMeta(formMeta.id, formMeta);
        setSuccess("Meta actualizada correctamente");
      } else {
        await crearMeta(formMeta);
        setSuccess("Meta creada correctamente");
      }

      cerrarModalMeta();
      await cargarDatos();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al guardar meta:", err);
      setError("Error al guardar la meta. Intente nuevamente.");
    }
  };

  const handleEliminarMeta = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta meta?")) {
      return;
    }

    try {
      setError(null);
      await eliminarMeta(id);
      setSuccess("Meta eliminada correctamente");
      await cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al eliminar meta:", err);
      setError("Error al eliminar la meta. Intente nuevamente.");
    }
  };

  // Renderizar sección de metas
  const renderSeccionMetas = () => (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <CheckCircle className="me-2" />
          Metas del Plan Lector {anioEscolar}
        </h5>
        <Button
          variant="light"
          size="sm"
          onClick={() => abrirModalMeta()}
        >
          <PlusCircle className="me-1" />
          Nueva Meta
        </Button>
      </Card.Header>
      <Card.Body>
        {metas.length === 0 ? (
          <Alert variant="info">No hay metas registradas para este año</Alert>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Orden</th>
                <th>Meta</th>
                <th style={{ width: "120px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {metas.sort((a, b) => a.orden - b.orden).map(meta => (
                <tr key={meta.id}>
                  <td className="text-center">
                    <Badge bg="secondary">{meta.orden}</Badge>
                  </td>
                  <td>{meta.meta}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => abrirModalMeta(meta)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleEliminarMeta(meta.id)}
                    >
                      <Trash size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Vista previa */}
        {metas.length > 0 && (
          <div className="mt-4 p-3 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <h6 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Vista Previa:</h6>
            <ul className="list-unstyled mb-0">
              {metas.sort((a, b) => a.orden - b.orden).map(meta => (
                <li key={meta.id} className="d-flex align-items-start mb-2">
                  <CheckCircle size={18} className="me-2 mt-1 flex-shrink-0" style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-primary)' }}>{meta.meta}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  // Modal de metas
  const renderModalMeta = () => (
    showModalMeta && (
      <div className="modal-overlay" onClick={cerrarModalMeta}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              <i className="fas fa-bullseye" />
              {modoEdicion ? "Editar Meta" : "Nueva Meta"}
            </h3>
            <button className="modal-close" onClick={cerrarModalMeta}>
              <i className="fas fa-xmark" />
            </button>
          </div>
          <form onSubmit={handleSubmitMeta}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Descripción de la Meta *</label>
                <textarea className="form-input" name="meta" value={formMeta.meta} onChange={handleChangeMeta} placeholder="Ej: Lograr que el 90% de los estudiantes consoliden el hábito de la lectura" rows={3} style={{ resize: 'vertical' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Orden *</label>
                  <input className="form-input" type="number" name="orden" value={formMeta.orden} onChange={handleChangeMeta} min="1" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Año</label>
                  <input className="form-input" type="number" name="anio" value={formMeta.anio} onChange={handleChangeMeta} min="2020" max="2030" readOnly />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={cerrarModalMeta}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-floppy-disk" /> Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
  // ==========================================
// GESTIÓN DE CRONOGRAMA
// ==========================================

const abrirModalCronograma = (item = null) => {
  if (item) {
    setFormCronograma({
      ...item,
      actividades: Array.isArray(item.actividades) ? item.actividades : []
    });
    setModoEdicion(true);
  } else {
    const maxOrden = cronograma.length > 0 
      ? Math.max(...cronograma.map(c => c.orden_mes || 0)) 
      : 0;
    
    setFormCronograma({
      id: null,
      mes: "",
      orden_mes: maxOrden + 1,
      actividades: [],
      responsable: "",
      anio: anioEscolar
    });
    setModoEdicion(false);
  }
  setActividadInput("");
  setShowModalCronograma(true);
};

const cerrarModalCronograma = () => {
  setShowModalCronograma(false);
  setFormCronograma({
    id: null,
    mes: "",
    orden_mes: 1,
    actividades: [],
    responsable: "",
    anio: anioEscolar
  });
  setActividadInput("");
  setModoEdicion(false);
};

const handleChangeCronograma = (e) => {
  const { name, value } = e.target;
  setFormCronograma(prev => ({
    ...prev,
    [name]: name === "orden_mes" ? parseInt(value) : value
  }));
};

const agregarActividad = () => {
  if (actividadInput.trim()) {
    setFormCronograma(prev => ({
      ...prev,
      actividades: [...prev.actividades, actividadInput.trim()]
    }));
    setActividadInput("");
  }
};

const eliminarActividad = (index) => {
  setFormCronograma(prev => ({
    ...prev,
    actividades: prev.actividades.filter((_, i) => i !== index)
  }));
};

const handleSubmitCronograma = async (e) => {
  e.preventDefault();
  try {
    setError(null);
    
    if (formCronograma.actividades.length === 0) {
      setError("Debe agregar al menos una actividad");
      return;
    }
    
    if (modoEdicion) {
      await actualizarActividadCronograma(formCronograma.id, formCronograma);
      setSuccess("Actividad actualizada correctamente");
    } else {
      await crearActividadCronograma(formCronograma);
      setSuccess("Actividad creada correctamente");
    }
    
    cerrarModalCronograma();
    await cargarDatos();
    
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al guardar actividad:", err);
    setError("Error al guardar la actividad. Intente nuevamente.");
  }
};

const handleEliminarCronograma = async (id) => {
  if (!window.confirm("¿Está seguro de eliminar esta actividad del cronograma?")) {
    return;
  }

  try {
    setError(null);
    await eliminarActividadCronograma(id);
    setSuccess("Actividad eliminada correctamente");
    await cargarDatos();
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al eliminar actividad:", err);
    setError("Error al eliminar la actividad. Intente nuevamente.");
  }
};

// Renderizar sección de cronograma
const renderSeccionCronograma = () => (
  <Card className="shadow-sm border-0">
    <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">
        <CalendarCheck className="me-2" />
        Cronograma de Actividades {anioEscolar}
      </h5>
      <Button 
        variant="light" 
        size="sm"
        onClick={() => abrirModalCronograma()}
      >
        <PlusCircle className="me-1" />
        Nueva Actividad
      </Button>
    </Card.Header>
    <Card.Body>
      {cronograma.length === 0 ? (
        <Alert variant="info">No hay actividades registradas en el cronograma</Alert>
      ) : (
        <>
          <Table responsive hover>
            <thead>
              <tr>
                <th style={{width: "80px"}}>Orden</th>
                <th style={{width: "150px"}}>Mes</th>
                <th>Actividades</th>
                <th>Responsable</th>
                <th style={{width: "120px"}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cronograma.sort((a, b) => a.orden_mes - b.orden_mes).map(item => (
                <tr key={item.id}>
                  <td className="text-center">
                    <Badge bg="secondary">{item.orden_mes}</Badge>
                  </td>
                  <td><strong>{item.mes}</strong></td>
                  <td>
                    <ul className="list-unstyled mb-0">
                      {(Array.isArray(item.actividades) ? item.actividades : []).map((act, i) => (
                        <li key={i} className="small">
                          <BookHalf size={14} className="me-1 text-primary" />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td><small className="text-muted">{item.responsable}</small></td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => abrirModalCronograma(item)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleEliminarCronograma(item.id)}
                    >
                      <Trash size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Vista previa */}
          <div className="mt-4">
            <h6 className="fw-bold mb-3">Vista Previa (Cards):</h6>
            <Row xs={1} md={2} lg={3} className="g-3">
              {cronograma.sort((a, b) => a.orden_mes - b.orden_mes).slice(0, 3).map(item => (
                <Col key={item.id}>
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="bg-primary text-white text-center">
                      <strong>{item.mes}</strong>
                    </Card.Header>
                    <Card.Body>
                      <ul className="list-group list-group-flush mb-2">
                        {(Array.isArray(item.actividades) ? item.actividades : []).map((act, i) => (
                          <li key={i} className="list-group-item d-flex align-items-start">
                            <BookHalf size={16} className="text-primary me-2 mt-1" />
                            <span className="small">{act}</span>
                          </li>
                        ))}
                      </ul>
                      <small className="text-muted">{item.responsable}</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            {cronograma.length > 3 && (
              <p className="text-muted small text-center mt-2">
                Mostrando 3 de {cronograma.length} actividades
              </p>
            )}
          </div>
        </>
      )}
    </Card.Body>
  </Card>
);

// Modal de cronograma
const renderModalCronograma = () => (
  showModalCronograma && (
    <div className="modal-overlay" onClick={cerrarModalCronograma}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className="fas fa-calendar-check" />
            {modoEdicion ? "Editar Actividad" : "Nueva Actividad"}
          </h3>
          <button className="modal-close" onClick={cerrarModalCronograma}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <form onSubmit={handleSubmitCronograma}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Mes *</label>
                <input className="form-input" type="text" name="mes" value={formCronograma.mes} onChange={handleChangeCronograma} placeholder="Ej: Marzo, Abril, Agosto-Diciembre" required />
              </div>
              <div className="form-group">
                <label className="form-label">Orden *</label>
                <input className="form-input" type="number" name="orden_mes" value={formCronograma.orden_mes} onChange={handleChangeCronograma} min="1" max="12" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Responsable *</label>
              <input className="form-input" type="text" name="responsable" value={formCronograma.responsable} onChange={handleChangeCronograma} placeholder="Ej: Docente de área, ETIPL y Dirección" required />
            </div>

            <div className="form-group">
              <label className="form-label">Actividades *</label>
              <div className="input-group mb-2">
                <input className="form-input" type="text" value={actividadInput} onChange={(e) => setActividadInput(e.target.value)} placeholder="Escriba una actividad y presione Agregar"
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarActividad(); } }}
                  style={{ borderRadius: '6px 0 0 6px' }} />
                <Button variant="outline-primary" onClick={agregarActividad} type="button">
                  <PlusCircle className="me-1" />
                  Agregar
                </Button>
              </div>
              {formCronograma.actividades.length > 0 && (
                <ul className="list-group">
                  {formCronograma.actividades.map((act, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{act}</span>
                      <Button variant="outline-danger" size="sm" onClick={() => eliminarActividad(index)} type="button">
                        <Trash size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {formCronograma.actividades.length === 0 && (
                <small className="text-muted">No hay actividades agregadas</small>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={cerrarModalCronograma}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-floppy-disk" /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
);
// ==========================================
// GESTIÓN DE LIBROS
// ==========================================

const abrirModalLibro = (libro = null, gradoId = null) => {
  if (libro) {
    setFormLibro({
      ...libro,
      grado_id: libro.grado_id || gradoId || 1
    });
    setModoEdicion(true);
  } else {
    // Obtener el máximo orden del grado seleccionado
    const librosGrado = librosPorGrado.find(g => g.grado_id === (gradoId || 1));
    const maxOrden = librosGrado?.obras?.length > 0
      ? Math.max(...librosGrado.obras.map(l => l.orden))
      : 0;
    
    setFormLibro({
      id: null,
      titulo: "",
      autor: "",
      grado_id: gradoId || 1,
      archivo: null,
      orden: maxOrden + 1,
      anio: anioEscolar
    });
    setModoEdicion(false);
  }
  setArchivoSeleccionado(null);
  setShowModalLibro(true);
};

const cerrarModalLibro = () => {
  setShowModalLibro(false);
  setFormLibro({
    id: null,
    titulo: "",
    autor: "",
    grado_id: 1,
    archivo: null,
    orden: 1,
    anio: anioEscolar
  });
  setArchivoSeleccionado(null);
  setModoEdicion(false);
};

const handleChangeLibro = (e) => {
  const { name, value, files } = e.target;
  
  if (name === "archivo" && files && files[0]) {
    setArchivoSeleccionado(files[0]);
    setFormLibro(prev => ({
      ...prev,
      archivo: files[0]
    }));
  } else {
    setFormLibro(prev => ({
      ...prev,
      [name]: name === "orden" || name === "grado_id" ? parseInt(value) : value
    }));
  }
};

const handleSubmitLibro = async (e) => {
  e.preventDefault();
  try {
    setError(null);
    
    // Crear FormData para enviar archivo
    const formData = new FormData();
    formData.append('titulo', formLibro.titulo);
    formData.append('autor', formLibro.autor);
    formData.append('grado_id', formLibro.grado_id);
    formData.append('orden', formLibro.orden);
    formData.append('anio', formLibro.anio);
    
    if (archivoSeleccionado) {
      formData.append('archivo', archivoSeleccionado);
    }
    
    if (modoEdicion) {
      await actualizarLibro(formLibro.id, formData);
      setSuccess("Libro actualizado correctamente");
    } else {
      if (!archivoSeleccionado) {
        setError("Debe seleccionar un archivo PDF");
        return;
      }
      await crearLibro(formData);
      setSuccess("Libro creado correctamente");
    }
    
    cerrarModalLibro();
    await cargarDatos();
    
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al guardar libro:", err);
    setError("Error al guardar el libro. Intente nuevamente.");
  }
};

const handleEliminarLibro = async (id) => {
  if (!window.confirm("¿Está seguro de eliminar este libro?")) {
    return;
  }

  try {
    setError(null);
    await eliminarLibro(id);
    setSuccess("Libro eliminado correctamente");
    await cargarDatos();
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al eliminar libro:", err);
    setError("Error al eliminar el libro. Intente nuevamente.");
  }
};

// Renderizar sección de libros
const renderSeccionLibros = () => (
  <Card className="shadow-sm border-0">
    <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">
        <FileEarmarkPdf className="me-2" />
        Obras Literarias por Grado
      </h5>
      <Button variant="light" size="sm" onClick={() => abrirModalLibro()}>
        <PlusCircle className="me-1" />
        Nuevo Libro
      </Button>
    </Card.Header>
    <Card.Body>
      {librosPorGrado.length === 0 ? (
        <Alert variant="info">
          No hay libros registrados. Haz clic en "Nuevo Libro" para agregar el primero.
        </Alert>
      ) : (
        librosPorGrado.map((grado, idx) => (
          <div key={grado.grado_id || idx} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                <Badge bg="info" text="dark">{grado.grado}</Badge>
              </h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => abrirModalLibro(null, grado.grado_id)}
              >
                <PlusCircle className="me-1" />
                Agregar Libro
              </Button>
            </div>

            {grado.obras && grado.obras.length > 0 ? (
              <Table responsive hover className="mb-4">
                <thead className="table-light">
                  <tr>
                    <th style={{width: "60px"}}>Orden</th>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Archivo</th>
                    <th style={{width: "120px"}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {grado.obras.sort((a, b) => a.orden - b.orden).map(libro => (
                    <tr key={libro.id}>
                      <td className="text-center">
                        <Badge bg="secondary">{libro.orden}</Badge>
                      </td>
                      <td><strong>{libro.titulo}</strong></td>
                      <td>{libro.autor}</td>
                      <td>
                        {libro.archivo && (
                          <a 
                            href={libro.archivo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            <FileEarmarkPdf className="me-1" />
                            Ver PDF
                          </a>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => abrirModalLibro(libro, grado.grado_id)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEliminarLibro(libro.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="light" className="small">
                No hay libros para este grado
              </Alert>
            )}
          </div>
        ))
      )}
    </Card.Body>
  </Card>
);

// Modal de libros
const renderModalLibro = () => (
  showModalLibro && (
    <div className="modal-overlay" onClick={cerrarModalLibro}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className="fas fa-book" />
            {modoEdicion ? "Editar Libro" : "Nuevo Libro"}
          </h3>
          <button className="modal-close" onClick={cerrarModalLibro}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <form onSubmit={handleSubmitLibro}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Título del Libro *</label>
              <input className="form-input" type="text" name="titulo" value={formLibro.titulo} onChange={handleChangeLibro} placeholder="Ej: Los ríos profundos" required />
            </div>

            <div className="form-group">
              <label className="form-label">Autor *</label>
              <input className="form-input" type="text" name="autor" value={formLibro.autor} onChange={handleChangeLibro} placeholder="Ej: José María Arguedas" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Grado *</label>
                <select className="form-input" name="grado_id" value={formLibro.grado_id} onChange={handleChangeLibro} required>
                  {gradosDisponibles.map(grado => (
                    <option key={grado.id} value={grado.id}>{grado.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Orden</label>
                <input className="form-input" type="number" name="orden" value={formLibro.orden} onChange={handleChangeLibro} min="1" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Archivo PDF {!modoEdicion && '*'}</label>
              <input className="form-input" type="file" name="archivo" accept=".pdf" onChange={handleChangeLibro} required={!modoEdicion} style={{ cursor: 'pointer' }} />
              <small className="text-muted">
                {modoEdicion ? "Seleccione un archivo solo si desea reemplazar el actual" : "Seleccione el archivo PDF del libro"}
              </small>
            </div>

            {archivoSeleccionado && (
              <Alert variant="success" className="small">
                <FileEarmarkPdf className="me-1" />
                Archivo seleccionado: {archivoSeleccionado.name}
              </Alert>
            )}

            {modoEdicion && formLibro.archivo && !archivoSeleccionado && (
              <Alert variant="info" className="small">
                Archivo actual: {formLibro.archivo}
              </Alert>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={cerrarModalLibro}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-floppy-disk" /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
);
  // Loading state
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando panel de administración...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Alertas */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Encabezado */}
      <div className="text-center mb-4">
        <h1 className="display-5 fw-bold text-primary">
          <BookHalf className="me-2" />
          Panel de Administración - Plan Lector
        </h1>
        <p className="lead text-muted">
          Gestión completa del Plan Lector Institucional
        </p>

        {/* Selector de año */}
        <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
          <label className="fw-bold">Año Escolar:</label>
          <select
            className="form-input"
            value={anioEscolar}
            onChange={(e) => setAnioEscolar(parseInt(e.target.value))}
            style={{ width: "150px" }}
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      {/* Tabs de administración */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="configuracion" title="Configuración">
          {renderSeccionConfiguracion()}
        </Tab>

        <Tab eventKey="metas" title="Metas">
          {renderSeccionMetas()}
        </Tab>

        <Tab eventKey="cronograma" title="Cronograma">
          {renderSeccionCronograma()}
        </Tab>

       <Tab eventKey="libros" title="Libros">
          {renderSeccionLibros()}
        </Tab>
      </Tabs>

      {/* Modales */}
      {renderModalConfig()}
      {renderModalMeta()}
      {renderModalCronograma()}
      {renderModalLibro()}
    </Container>
  );
};

export default AdminPlanLector;