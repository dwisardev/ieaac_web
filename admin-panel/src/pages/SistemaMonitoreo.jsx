// src/pages/fondep/SistemaMonitoreoAdmin.jsx - PARTE 1
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  Modal,
  Table,
  Badge,
  Tabs,
  Tab,
  ProgressBar
} from "react-bootstrap";
import {
  EyeFill,
  PlusCircle,
  Pencil,
  Trash,
  Save,
  X,
  BarChartFill,
  PeopleFill,
  ClipboardDataFill
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";

// Importar servicios (necesitarás crear estos métodos)
import {
  obtenerDimensionesConIndicadores,
  obtenerEstadisticasGenerales,
  // Métodos de administración (a crear)
  crearDimension,
  actualizarDimension,
  eliminarDimension,
  crearIndicador,
  actualizarIndicador,
  eliminarIndicador,
  actualizarProgresoIndicador
} from "../services/monitoreoService";

const AdminSistemaMonitoreo= () => {
  // Estados generales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("dimensiones");

  // Estados de datos
  const [dimensiones, setDimensiones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de modales
  const [showModalDimension, setShowModalDimension] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado de formulario dimensión
  const [formDimension, setFormDimension] = useState({
    id: null,
    nombre: "",
    color: "#4361ee",
    icono: "ClipboardDataFill",
    orden: 1,
    activo: true
  });

  // Lista de iconos disponibles
  const iconosDisponibles = [
    { value: "BarChartFill", label: "Gráfico de Barras" },
    { value: "PeopleFill", label: "Personas" },
    { value: "ClipboardDataFill", label: "Datos" }
  ];
const [showModalIndicador, setShowModalIndicador] = useState(false);
const [dimensionSeleccionada, setDimensionSeleccionada] = useState(null);
const [formIndicador, setFormIndicador] = useState({
  id: null,
  dimension_id: null,
  competencia: "",
  meta: 0,
  actual: 0,
  evidencias: [],
  momentos: [],
  orden: 1,
  activo: true
});
const [evidenciaInput, setEvidenciaInput] = useState("");
const [momentoInput, setMomentoInput] = useState("");
  // Cargar datos al montar
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [dimensionesData, estadisticasData] = await Promise.all([
        obtenerDimensionesConIndicadores(),
        obtenerEstadisticasGenerales()
      ]);

      setDimensiones(dimensionesData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // GESTIÓN DE DIMENSIONES
  // ==========================================

  const abrirModalDimension = (dimension = null) => {
    if (dimension) {
      setFormDimension(dimension);
      setModoEdicion(true);
    } else {
      const maxOrden = dimensiones.length > 0 
        ? Math.max(...dimensiones.map(d => d.orden || 0)) 
        : 0;
      
      setFormDimension({
        id: null,
        nombre: "",
        color: "#4361ee",
        icono: "ClipboardDataFill",
        orden: maxOrden + 1,
        activo: true
      });
      setModoEdicion(false);
    }
    setShowModalDimension(true);
  };

  const cerrarModalDimension = () => {
    setShowModalDimension(false);
    setFormDimension({
      id: null,
      nombre: "",
      color: "#4361ee",
      icono: "ClipboardDataFill",
      orden: 1,
      activo: true
    });
    setModoEdicion(false);
  };

  const handleChangeDimension = (e) => {
    const { name, value, type, checked } = e.target;
    setFormDimension(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "orden" ? parseInt(value) : value)
    }));
  };

  const handleSubmitDimension = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (modoEdicion) {
        await actualizarDimension(formDimension.id, formDimension);
        setSuccess("Dimensión actualizada correctamente");
      } else {
        await crearDimension(formDimension);
        setSuccess("Dimensión creada correctamente");
      }
      
      cerrarModalDimension();
      await cargarDatos();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al guardar dimensión:", err);
      setError("Error al guardar la dimensión. Intente nuevamente.");
    }
  };

  const handleEliminarDimension = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta dimensión? Se eliminarán todos sus indicadores.")) {
      return;
    }

    try {
      setError(null);
      await eliminarDimension(id);
      setSuccess("Dimensión eliminada correctamente");
      await cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al eliminar dimensión:", err);
      setError("Error al eliminar la dimensión. Intente nuevamente.");
    }
  };

  // Renderizar sección de dimensiones
  const renderSeccionDimensiones = () => (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <ClipboardDataFill className="me-2" />
          Dimensiones del Sistema de Monitoreo
        </h5>
        <Button 
          variant="light" 
          size="sm"
          onClick={() => abrirModalDimension()}
        >
          <PlusCircle className="me-1" />
          Nueva Dimensión
        </Button>
      </Card.Header>
      <Card.Body>
        {/* Estadísticas generales */}
        {estadisticas && (
          <div className="mb-4 p-3 bg-light rounded">
            <h6 className="fw-bold mb-3">Estadísticas Generales</h6>
            <Row className="text-center g-3">
              <Col xs={6} md={3}>
                <div>
                  <h4 className="fw-bold text-primary mb-0">{estadisticas.totalIndicadores}</h4>
                  <small className="text-muted">Total Indicadores</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div>
                  <h4 className="fw-bold text-success mb-0">{estadisticas.progresoPromedio}%</h4>
                  <small className="text-muted">Progreso Promedio</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div>
                  <h4 className="fw-bold text-info mb-0">{estadisticas.indicadoresCompletados}</h4>
                  <small className="text-muted">Completados</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div>
                  <h4 className="fw-bold text-warning mb-0">{estadisticas.dimensiones}</h4>
                  <small className="text-muted">Dimensiones</small>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {dimensiones.length === 0 ? (
          <Alert variant="info">No hay dimensiones registradas</Alert>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th style={{width: "80px"}}>Orden</th>
                <th>Nombre</th>
                <th style={{width: "100px"}}>Color</th>
                <th style={{width: "120px"}}>Icono</th>
                <th style={{width: "120px"}}>Indicadores</th>
                <th style={{width: "100px"}}>Estado</th>
                <th style={{width: "120px"}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dimensiones.sort((a, b) => a.orden - b.orden).map(dimension => (
                <tr key={dimension.id}>
                  <td className="text-center">
                    <Badge bg="secondary">{dimension.orden}</Badge>
                  </td>
                  <td><strong>{dimension.nombre}</strong></td>
                  <td>
                    <div
                      className="d-inline-block rounded"
                      style={{
                        width: "40px",
                        height: "25px",
                        backgroundColor: dimension.color,
                        border: "1px solid #ddd"
                      }}
                    />
                  </td>
                  <td>
                    <Badge bg="light" text="dark">{dimension.icono}</Badge>
                  </td>
                  <td className="text-center">
                    <Badge bg="info">
                      {dimension.indicadores?.length || 0}
                    </Badge>
                  </td>
                  <td>
                    {dimension.activo ? (
                      <Badge bg="success">Activo</Badge>
                    ) : (
                      <Badge bg="secondary">Inactivo</Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => abrirModalDimension(dimension)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleEliminarDimension(dimension.id)}
                    >
                      <Trash size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );

  // Modal de dimensiones
  const renderModalDimension = () => (
    <Modal show={showModalDimension} onHide={cerrarModalDimension}>
      <Modal.Header closeButton>
        <Modal.Title>
          {modoEdicion ? "Editar Dimensión" : "Nueva Dimensión"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmitDimension}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la Dimensión *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formDimension.nombre}
              onChange={handleChangeDimension}
              placeholder="Ej: Aprendizajes, Desempeño Docente"
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Color *</Form.Label>
                <Form.Control
                  type="color"
                  name="color"
                  value={formDimension.color}
                  onChange={handleChangeDimension}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Icono *</Form.Label>
                <Form.Select
                  name="icono"
                  value={formDimension.icono}
                  onChange={handleChangeDimension}
                  required
                >
                  {iconosDisponibles.map(icon => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Orden *</Form.Label>
                <Form.Control
                  type="number"
                  name="orden"
                  value={formDimension.orden}
                  onChange={handleChangeDimension}
                  min="1"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="activo"
                  label="Activo"
                  checked={formDimension.activo}
                  onChange={handleChangeDimension}
                  className="mt-4"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalDimension}>
            <X className="me-1" />
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            <Save className="me-1" />
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
  // ==========================================
// GESTIÓN DE INDICADORES
// ==========================================

const abrirModalIndicador = (dimensionId, indicador = null) => {
  setDimensionSeleccionada(dimensionId);
  
  if (indicador) {
    setFormIndicador({
      ...indicador,
      evidencias: Array.isArray(indicador.evidencias) ? indicador.evidencias : [],
      momentos: Array.isArray(indicador.momentos) ? indicador.momentos : []
    });
    setModoEdicion(true);
  } else {
    const dimension = dimensiones.find(d => d.id === dimensionId);
    const maxOrden = dimension?.indicadores?.length > 0
      ? Math.max(...dimension.indicadores.map(i => i.orden || 0))
      : 0;
    
    setFormIndicador({
      id: null,
      dimension_id: dimensionId,
      competencia: "",
      meta: 0,
      actual: 0,
      evidencias: [],
      momentos: [],
      orden: maxOrden + 1,
      activo: true
    });
    setModoEdicion(false);
  }
  
  setEvidenciaInput("");
  setMomentoInput("");
  setShowModalIndicador(true);
};

const cerrarModalIndicador = () => {
  setShowModalIndicador(false);
  setFormIndicador({
    id: null,
    dimension_id: null,
    competencia: "",
    meta: 0,
    actual: 0,
    evidencias: [],
    momentos: [],
    orden: 1,
    activo: true
  });
  setEvidenciaInput("");
  setMomentoInput("");
  setDimensionSeleccionada(null);
  setModoEdicion(false);
};

const handleChangeIndicador = (e) => {
  const { name, value, type, checked } = e.target;
  setFormIndicador(prev => ({
    ...prev,
    [name]: type === "checkbox" 
      ? checked 
      : (name === "orden" || name === "meta" || name === "actual" 
        ? parseInt(value) || 0 
        : value)
  }));
};

const agregarEvidencia = () => {
  if (evidenciaInput.trim()) {
    setFormIndicador(prev => ({
      ...prev,
      evidencias: [...prev.evidencias, evidenciaInput.trim()]
    }));
    setEvidenciaInput("");
  }
};

const eliminarEvidencia = (index) => {
  setFormIndicador(prev => ({
    ...prev,
    evidencias: prev.evidencias.filter((_, i) => i !== index)
  }));
};

const agregarMomento = () => {
  if (momentoInput.trim()) {
    setFormIndicador(prev => ({
      ...prev,
      momentos: [...prev.momentos, momentoInput.trim()]
    }));
    setMomentoInput("");
  }
};

const eliminarMomento = (index) => {
  setFormIndicador(prev => ({
    ...prev,
    momentos: prev.momentos.filter((_, i) => i !== index)
  }));
};

const handleSubmitIndicador = async (e) => {
  e.preventDefault();
  try {
    setError(null);
    
    if (modoEdicion) {
      await actualizarIndicador(formIndicador.id, formIndicador);
      setSuccess("Indicador actualizado correctamente");
    } else {
      await crearIndicador(formIndicador);
      setSuccess("Indicador creado correctamente");
    }
    
    cerrarModalIndicador();
    await cargarDatos();
    
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al guardar indicador:", err);
    setError("Error al guardar el indicador. Intente nuevamente.");
  }
};

const handleEliminarIndicador = async (id) => {
  if (!window.confirm("¿Está seguro de eliminar este indicador?")) {
    return;
  }

  try {
    setError(null);
    await eliminarIndicador(id);
    setSuccess("Indicador eliminado correctamente");
    await cargarDatos();
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al eliminar indicador:", err);
    setError("Error al eliminar el indicador. Intente nuevamente.");
  }
};

const handleActualizarProgreso = async (indicadorId, nuevoValor) => {
  try {
    setError(null);
    await actualizarProgresoIndicador(indicadorId, parseInt(nuevoValor));
    setSuccess("Progreso actualizado correctamente");
    await cargarDatos();
    setTimeout(() => setSuccess(null), 2000);
  } catch (err) {
    console.error("Error al actualizar progreso:", err);
    setError("Error al actualizar el progreso. Intente nuevamente.");
  }
};

// Renderizar sección de indicadores
const renderSeccionIndicadores = () => (
  <Card className="shadow-sm border-0">
    <Card.Header className="bg-primary text-white">
      <h5 className="mb-0">
        <BarChartFill className="me-2" />
        Indicadores por Dimensión
      </h5>
    </Card.Header>
    <Card.Body>
      {dimensiones.length === 0 ? (
        <Alert variant="info">
          No hay dimensiones registradas. Cree primero una dimensión.
        </Alert>
      ) : (
        dimensiones.map((dimension, idx) => (
          <div key={dimension.id} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0" style={{ color: dimension.color }}>
                {dimension.nombre}
              </h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => abrirModalIndicador(dimension.id)}
              >
                <PlusCircle className="me-1" />
                Agregar Indicador
              </Button>
            </div>

            {dimension.indicadores && dimension.indicadores.length > 0 ? (
              <Table responsive hover className="mb-4">
                <thead className="table-light">
                  <tr>
                    <th style={{width: "60px"}}>Orden</th>
                    <th>Competencia</th>
                    <th style={{width: "200px"}}>Progreso</th>
                    <th style={{width: "80px"}}>Actual</th>
                    <th style={{width: "120px"}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {dimension.indicadores.sort((a, b) => a.orden - b.orden).map(indicador => (
                    <tr key={indicador.id}>
                      <td className="text-center">
                        <Badge bg="secondary">{indicador.orden}</Badge>
                      </td>
                      <td>
                        <strong>{indicador.competencia}</strong>
                        <div className="small text-muted mt-1">
                          Meta: {indicador.meta}%
                        </div>
                      </td>
                      <td>
                        <ProgressBar
                          now={indicador.actual}
                          label={`${indicador.actual}%`}
                          variant={indicador.actual >= indicador.meta ? "success" : "primary"}
                          style={{ height: "25px" }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={indicador.actual}
                          min="0"
                          max="100"
                          onChange={(e) => handleActualizarProgreso(indicador.id, e.target.value)}
                          style={{ width: "70px" }}
                        />
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => abrirModalIndicador(dimension.id, indicador)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEliminarIndicador(indicador.id)}
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
                No hay indicadores para esta dimensión
              </Alert>
            )}
          </div>
        ))
      )}
    </Card.Body>
  </Card>
);

// Modal de indicadores
const renderModalIndicador = () => (
  <Modal show={showModalIndicador} onHide={cerrarModalIndicador} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>
        {modoEdicion ? "Editar Indicador" : "Nuevo Indicador"}
      </Modal.Title>
    </Modal.Header>
    <Form onSubmit={handleSubmitIndicador}>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Competencia / Indicador *</Form.Label>
          <Form.Control
            type="text"
            name="competencia"
            value={formIndicador.competencia}
            onChange={handleChangeIndicador}
            placeholder="Ej: Se comunica oralmente en CSL"
            required
          />
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Meta (%) *</Form.Label>
              <Form.Control
                type="number"
                name="meta"
                value={formIndicador.meta}
                onChange={handleChangeIndicador}
                min="0"
                max="100"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Actual (%) *</Form.Label>
              <Form.Control
                type="number"
                name="actual"
                value={formIndicador.actual}
                onChange={handleChangeIndicador}
                min="0"
                max="100"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Orden</Form.Label>
              <Form.Control
                type="number"
                name="orden"
                value={formIndicador.orden}
                onChange={handleChangeIndicador}
                min="1"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Evidencias</Form.Label>
          <div className="input-group mb-2">
            <Form.Control
              type="text"
              value={evidenciaInput}
              onChange={(e) => setEvidenciaInput(e.target.value)}
              placeholder="Ej: Registro de evaluación"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarEvidencia();
                }
              }}
            />
            <Button 
              variant="outline-primary" 
              onClick={agregarEvidencia}
              type="button"
            >
              <PlusCircle />
            </Button>
          </div>
          
          {formIndicador.evidencias.length > 0 && (
            <ul className="list-group">
              {formIndicador.evidencias.map((ev, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{ev}</span>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => eliminarEvidencia(index)}
                    type="button"
                  >
                    <Trash size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Momentos de Monitoreo</Form.Label>
          <div className="input-group mb-2">
            <Form.Control
              type="text"
              value={momentoInput}
              onChange={(e) => setMomentoInput(e.target.value)}
              placeholder="Ej: mayo, junio"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarMomento();
                }
              }}
            />
            <Button 
              variant="outline-primary" 
              onClick={agregarMomento}
              type="button"
            >
              <PlusCircle />
            </Button>
          </div>
          
          {formIndicador.momentos.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {formIndicador.momentos.map((mes, index) => (
                <Badge 
                  key={index} 
                  bg="light" 
                  text="dark" 
                  className="d-flex align-items-center gap-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  {mes}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-danger"
                    onClick={() => eliminarMomento(index)}
                    type="button"
                  >
                    <X size={16} />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            name="activo"
            label="Indicador activo"
            checked={formIndicador.activo}
            onChange={handleChangeIndicador}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cerrarModalIndicador}>
          <X className="me-1" />
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          <Save className="me-1" />
          Guardar
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
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
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">
          <EyeFill className="me-2" />
          Panel de Administración - Sistema de Monitoreo
        </h1>
        <p className="lead text-muted">
          Gestión completa del sistema de monitoreo y evaluación
        </p>
      </div>

      {/* Tabs de administración */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="dimensiones" title="Dimensiones">
          {renderSeccionDimensiones()}
        </Tab>
        <Tab eventKey="indicadores" title="Indicadores">
            {renderSeccionIndicadores()}
        </Tab>
        
        
      </Tabs>

      {/* Modales */}
      {renderModalDimension()}
      {renderModalIndicador()}
    </Container>
  );
};

export default AdminSistemaMonitoreo;