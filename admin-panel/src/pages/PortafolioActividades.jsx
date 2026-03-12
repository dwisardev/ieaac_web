// src/pages/fondep/PortafolioActividadesAdmin.jsx - PARTE 1
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
  Tab
} from "react-bootstrap";
import {
  BookFill,
  PlusCircle,
  Pencil,
  Trash,
  Save,
  X,
  Image as ImageIcon,
  PlayFill
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";

// Importar servicios (necesitarás crear estos métodos)
import {
  obtenerActividadesPorRubro,
  obtenerEstadisticasPortafolio,
  // Métodos de administración (a crear)
  crearActividad,
  actualizarActividad,
  eliminarActividad
} from "../services/portafolioService";

const PortafolioActividadesAdmin = () => {
  // Estados generales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("actividades");

  // Estados de datos
  const [rubros, setRubros] = useState({});
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de modales
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estados de formulario actividad
  const [formActividad, setFormActividad] = useState({
    id: null,
    titulo: "",
    descripcion: "",
    categoria: "intercultural",
    rubro: "Diagnóstico y Reflexión",
    fecha_realizacion: "",
    responsables: "",
    participantes: [],
    archivos: [],
    resultados: "",
    lecciones_aprendidas: "",
    destacado: false,
    orden: 1,
    activo: true
  });

  const [participanteInput, setParticipanteInput] = useState("");
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);

  // Lista de rubros disponibles
  const rubrosDisponibles = [
    "Diagnóstico y Reflexión",
    "Planificación y Organización",
    "Ejecución de la Experiencia",
    "Evaluación y Sistematización"
  ];

  // Lista de categorías
  const categoriasDisponibles = [
    { value: "intercultural", label: "Intercultural" },
    { value: "comunitario", label: "Comunitario" },
    { value: "pedagogico", label: "Pedagógico" },
    { value: "cultural", label: "Cultural" }
  ];

  // Cargar datos al montar
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [rubrosData, estadisticasData] = await Promise.all([
        obtenerActividadesPorRubro(),
        obtenerEstadisticasPortafolio()
      ]);

      setRubros(rubrosData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // GESTIÓN DE ACTIVIDADES
  // ==========================================

  const abrirModal = (rubro, actividad = null) => {
    if (actividad) {
      setFormActividad({
        ...actividad,
        rubro: rubro || actividad.rubro,
        participantes: Array.isArray(actividad.participantes) ? actividad.participantes : [],
        archivos: Array.isArray(actividad.archivos) ? actividad.archivos : []
      });
      setModoEdicion(true);
    } else {
      const actividadesRubro = rubros[rubro] || [];
      const maxOrden = actividadesRubro.length > 0
        ? Math.max(...actividadesRubro.map(a => a.orden || 0))
        : 0;

      setFormActividad({
        id: null,
        titulo: "",
        descripcion: "",
        categoria: "intercultural",
        rubro: rubro,
        fecha_realizacion: "",
        responsables: "",
        participantes: [],
        archivos: [],
        resultados: "",
        lecciones_aprendidas: "",
        destacado: false,
        orden: maxOrden + 1,
        activo: true
      });
      setModoEdicion(false);
    }
    
    setParticipanteInput("");
    setArchivosSeleccionados([]);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setFormActividad({
      id: null,
      titulo: "",
      descripcion: "",
      categoria: "intercultural",
      rubro: "Diagnóstico y Reflexión",
      fecha_realizacion: "",
      responsables: "",
      participantes: [],
      archivos: [],
      resultados: "",
      lecciones_aprendidas: "",
      destacado: false,
      orden: 1,
      activo: true
    });
    setParticipanteInput("");
    setArchivosSeleccionados([]);
    setModoEdicion(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file") {
      setArchivosSeleccionados(Array.from(files));
    } else if (type === "checkbox") {
      setFormActividad(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormActividad(prev => ({
        ...prev,
        [name]: name === "orden" ? parseInt(value) || 0 : value
      }));
    }
  };

  const agregarParticipante = () => {
    if (participanteInput.trim()) {
      setFormActividad(prev => ({
        ...prev,
        participantes: [...prev.participantes, participanteInput.trim()]
      }));
      setParticipanteInput("");
    }
  };

  const eliminarParticipante = (index) => {
    setFormActividad(prev => ({
      ...prev,
      participantes: prev.participantes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Crear FormData para enviar archivos
      const formData = new FormData();
      Object.keys(formActividad).forEach(key => {
        if (key === 'participantes' || key === 'archivos') {
          formData.append(key, JSON.stringify(formActividad[key]));
        } else {
          formData.append(key, formActividad[key]);
        }
      });

      // Agregar archivos nuevos
      archivosSeleccionados.forEach((file, index) => {
        formData.append(`archivo_${index}`, file);
      });
      
      if (modoEdicion) {
        await actualizarActividad(formActividad.id, formData);
        setSuccess("Actividad actualizada correctamente");
      } else {
        await crearActividad(formData);
        setSuccess("Actividad creada correctamente");
      }
      
      cerrarModal();
      await cargarDatos();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al guardar actividad:", err);
      setError("Error al guardar la actividad. Intente nuevamente.");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta actividad?")) {
      return;
    }

    try {
      setError(null);
      await eliminarActividad(id);
      setSuccess("Actividad eliminada correctamente");
      await cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al eliminar actividad:", err);
      setError("Error al eliminar la actividad. Intente nuevamente.");
    }
  };

  // Renderizar sección de actividades
  const renderSeccionActividades = () => (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <BookFill className="me-2" />
          Actividades por Rubro
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Estadísticas */}
        {estadisticas && (
          <div className="mb-4 p-3 bg-light rounded">
            <h6 className="fw-bold mb-3">Estadísticas Generales</h6>
            <Row className="text-center g-3">
              <Col xs={6} md={3}>
                <div>
                  <h4 className="fw-bold text-primary mb-0">{estadisticas.totalActividades}</h4>
                  <small className="text-muted">Total Actividades</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div>
                  <h4 className="fw-bold text-success mb-0">{estadisticas.totalArchivos}</h4>
                  <small className="text-muted">Evidencias</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div>
                  <h4 className="fw-bold text-warning mb-0">{estadisticas.actividadesDestacadas}</h4>
                  <small className="text-muted">Destacadas</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div>
                  <h4 className="fw-bold text-info mb-0">{estadisticas.rubrosActivos}</h4>
                  <small className="text-muted">Rubros Activos</small>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {Object.keys(rubros).length === 0 ? (
          <Alert variant="info">No hay actividades registradas</Alert>
        ) : (
          Object.entries(rubros).map(([rubro, actividades], index) => (
            <div key={rubro} className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  {rubro}
                  <Badge bg="secondary" className="ms-2">{actividades.length}</Badge>
                </h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => abrirModal(rubro)}
                >
                  <PlusCircle className="me-1" />
                  Agregar Actividad
                </Button>
              </div>

              {actividades.length > 0 ? (
                <Table responsive hover className="mb-4">
                  <thead className="table-light">
                    <tr>
                      <th style={{width: "60px"}}>Orden</th>
                      <th>Título</th>
                      <th>Categoría</th>
                      <th>Fecha</th>
                      <th style={{width: "100px"}}>Evidencias</th>
                      <th style={{width: "100px"}}>Estado</th>
                      <th style={{width: "120px"}}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actividades.sort((a, b) => a.orden - b.orden).map(actividad => (
                      <tr key={actividad.id}>
                        <td className="text-center">
                          <Badge bg="secondary">{actividad.orden}</Badge>
                        </td>
                        <td>
                          <strong>{actividad.titulo}</strong>
                          {actividad.destacado && (
                            <Badge bg="warning" text="dark" className="ms-2">★</Badge>
                          )}
                        </td>
                        <td>
                          <Badge bg="info">{actividad.categoria}</Badge>
                        </td>
                        <td>
                          <small>{actividad.fecha_realizacion ? 
                            new Date(actividad.fecha_realizacion).toLocaleDateString('es-PE') 
                            : '-'}
                          </small>
                        </td>
                        <td className="text-center">
                          <Badge bg="success">
                            {actividad.archivos?.length || 0}
                          </Badge>
                        </td>
                        <td>
                          {actividad.activo ? (
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
                            onClick={() => abrirModal(rubro, actividad)}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminar(actividad.id)}
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
                  No hay actividades en este rubro
                </Alert>
              )}
            </div>
          ))
        )}
      </Card.Body>
    </Card>
  );
    
  const renderModal = () => (
  <Modal show={showModal} onHide={cerrarModal} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>
        {modoEdicion ? "Editar Actividad" : "Nueva Actividad"}
      </Modal.Title>
    </Modal.Header>
    <Form onSubmit={handleSubmit}>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Form.Group className="mb-3">
          <Form.Label>Título de la Actividad *</Form.Label>
          <Form.Control
            type="text"
            name="titulo"
            value={formActividad.titulo}
            onChange={handleChange}
            placeholder="Ej: Taller de expresión oral"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción *</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="descripcion"
            value={formActividad.descripcion}
            onChange={handleChange}
            placeholder="Describe la actividad realizada"
            required
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Rubro *</Form.Label>
              <Form.Select
                name="rubro"
                value={formActividad.rubro}
                onChange={handleChange}
                required
              >
                {rubrosDisponibles.map(rubro => (
                  <option key={rubro} value={rubro}>
                    {rubro}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Categoría *</Form.Label>
              <Form.Select
                name="categoria"
                value={formActividad.categoria}
                onChange={handleChange}
                required
              >
                {categoriasDisponibles.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Realización *</Form.Label>
              <Form.Control
                type="date"
                name="fecha_realizacion"
                value={formActividad.fecha_realizacion}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Orden</Form.Label>
              <Form.Control
                type="number"
                name="orden"
                value={formActividad.orden}
                onChange={handleChange}
                min="1"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Responsables *</Form.Label>
          <Form.Control
            type="text"
            name="responsables"
            value={formActividad.responsables}
            onChange={handleChange}
            placeholder="Ej: Docentes de Comunicación, Tutores"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Participantes</Form.Label>
          <div className="input-group mb-2">
            <Form.Control
              type="text"
              value={participanteInput}
              onChange={(e) => setParticipanteInput(e.target.value)}
              placeholder="Ej: Estudiantes de 1° a 5°"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarParticipante();
                }
              }}
            />
            <Button 
              variant="outline-primary" 
              onClick={agregarParticipante}
              type="button"
            >
              <PlusCircle />
            </Button>
          </div>
          
          {formActividad.participantes.length > 0 && (
            <ul className="list-group">
              {formActividad.participantes.map((participante, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{participante}</span>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => eliminarParticipante(index)}
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
          <Form.Label>Resultados Obtenidos</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="resultados"
            value={formActividad.resultados}
            onChange={handleChange}
            placeholder="Describe los resultados de la actividad"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Lecciones Aprendidas</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="lecciones_aprendidas"
            value={formActividad.lecciones_aprendidas}
            onChange={handleChange}
            placeholder="¿Qué aprendizajes se obtuvieron?"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Evidencias (Fotos/Videos)</Form.Label>
          <Form.Control
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleChange}
          />
          <Form.Text className="text-muted">
            Puede seleccionar múltiples archivos (imágenes o videos)
          </Form.Text>
        </Form.Group>

        {archivosSeleccionados.length > 0 && (
          <Alert variant="success" className="small">
            <ImageIcon className="me-1" />
            {archivosSeleccionados.length} archivo(s) seleccionado(s)
          </Alert>
        )}

        {modoEdicion && formActividad.archivos && formActividad.archivos.length > 0 && (
          <div className="mb-3">
            <small className="text-muted d-block mb-2">Evidencias actuales:</small>
            <div className="d-flex flex-wrap gap-2">
              {formActividad.archivos.map((archivo, index) => (
                <Badge key={index} bg="info">
                  {archivo.tipo === 'foto' ? <ImageIcon size={14} /> : <PlayFill size={14} />}
                  {' '}{archivo.descripcion || `Archivo ${index + 1}`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="destacado"
                label="Actividad Destacada"
                checked={formActividad.destacado}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="activo"
                label="Actividad Activa"
                checked={formActividad.activo}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Alert variant="info" className="small">
          <strong>Nota:</strong> Las actividades destacadas aparecerán primero en la vista pública.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cerrarModal}>
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
          <BookFill className="me-2" />
          Panel de Administración - Portafolio FONDEP
        </h1>
        <p className="lead text-muted">
          Gestión completa del portafolio de actividades
        </p>
      </div>

      {/* Tabs de administración */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="actividades" title="Actividades">
          {renderSeccionActividades()}
        </Tab>
      </Tabs>

      {/* Modales */}
      {renderModal()}
    </Container>
  );
};

export default PortafolioActividadesAdmin;