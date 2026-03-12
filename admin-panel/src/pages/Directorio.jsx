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
  Badge
} from "react-bootstrap";
import {
  PeopleFill,
  PlusCircle,
  Pencil,
  Trash,
  Save,
  X,
  PersonBadge,
  TelephoneFill,
  EnvelopeFill,
  HouseFill,
  CalendarEvent
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";

// Importar servicio
import { directorioService } from "../services/directorioService";

const AdminDirectorio = () => {
  // Estados generales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados de datos
  const [personal, setPersonal] = useState([]);

  // Estados de modales
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado de formulario
  const [formPersonal, setFormPersonal] = useState({
    id: null,
    nombres: "",
    apellidos: "",
    area: "",
    cargo: "Docente",
    fecha_nacimiento: "",
    celular: "",
    correo: "",
    direccion: "",
    foto: null,
    orden: 1,
    activo: true
  });

  // Cargar datos al montar
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await directorioService.getAll();
      setPersonal(data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // GESTIÓN DE PERSONAL
  // ==========================================

  const abrirModal = (persona = null) => {
    if (persona) {
      setFormPersonal(persona);
      setModoEdicion(true);
    } else {
      const maxOrden = personal.length > 0 
        ? Math.max(...personal.map(p => p.orden)) 
        : 0;
      
      setFormPersonal({
        id: null,
        nombres: "",
        apellidos: "",
        area: "",
        cargo: "Docente",
        fecha_nacimiento: "",
        celular: "",
        correo: "",
        direccion: "",
        foto: null,
        orden: maxOrden + 1,
        activo: true
      });
      setModoEdicion(false);
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setFormPersonal({
      id: null,
      nombres: "",
      apellidos: "",
      area: "",
      cargo: "Docente",
      fecha_nacimiento: "",
      celular: "",
      correo: "",
      direccion: "",
      foto: null,
      orden: 1,
      activo: true
    });
    setModoEdicion(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file") {
      setFormPersonal(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (type === "checkbox") {
      setFormPersonal(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormPersonal(prev => ({
        ...prev,
        [name]: name === "orden" ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (modoEdicion) {
        await directorioService.update(formPersonal.id, formPersonal);
        setSuccess("Personal actualizado correctamente");
      } else {
        await directorioService.create(formPersonal);
        setSuccess("Personal creado correctamente");
      }
      
      cerrarModal();
      await cargarDatos();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al guardar personal:", err);
      setError("Error al guardar los datos. Intente nuevamente.");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setError(null);
      await directorioService.delete(id);
      setSuccess("Personal eliminado correctamente");
      await cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al eliminar personal:", err);
      setError("Error al eliminar el registro. Intente nuevamente.");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  // Renderizar tabla de personal
  const renderTablaPersonal = () => (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <PeopleFill className="me-2" />
          Gestión del Directorio
        </h5>
        <Button 
          variant="light" 
          size="sm"
          onClick={() => abrirModal()}
        >
          <PlusCircle className="me-1" />
          Nuevo Personal
        </Button>
      </Card.Header>
      <Card.Body>
        {personal.length === 0 ? (
          <Alert variant="info">No hay personal registrado</Alert>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Orden</th>
                <th>Apellidos y Nombres</th>
                <th>Área</th>
                <th>Cargo</th>
                <th>F. Nacimiento</th>
                <th>Celular</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personal.sort((a, b) => a.orden - b.orden).map(persona => (
                <tr key={persona.id}>
                  <td className="text-center">{persona.orden}</td>
                  <td>
                    <div>
                      <strong>{persona.apellidos}</strong>
                      <br />
                      <small className="text-muted">{persona.nombres}</small>
                    </div>
                  </td>
                  <td>{persona.area || 'N/A'}</td>
                  <td>
                    <Badge bg={
                      persona.cargo === 'Director' ? 'danger' : 
                      persona.cargo === 'Subdirector' ? 'primary' :
                      persona.cargo === 'Auxiliar Ed.' ? 'warning' : 
                      'success'
                    }>
                      {persona.cargo}
                    </Badge>
                  </td>
                  <td>{formatearFecha(persona.fecha_nacimiento)}</td>
                  <td>
                    <a href={`tel:${persona.celular}`} className="text-decoration-none">
                      <TelephoneFill size={14} className="me-1" />
                      {persona.celular}
                    </a>
                  </td>
                  <td>
                    <a href={`mailto:${persona.correo}`} className="text-decoration-none small">
                      <EnvelopeFill size={14} className="me-1" />
                      {persona.correo}
                    </a>
                  </td>
                  <td>
                    {persona.activo ? (
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
                      onClick={() => abrirModal(persona)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleEliminar(persona.id)}
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

  // Modal de personal
  const renderModal = () => (
    <Modal show={showModal} onHide={cerrarModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {modoEdicion ? "Editar Personal" : "Nuevo Personal"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <PersonBadge className="me-1" />
                  Nombres *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={formPersonal.nombres}
                  onChange={handleChange}
                  placeholder="Ej: Gerardo"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <PersonBadge className="me-1" />
                  Apellidos *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="apellidos"
                  value={formPersonal.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: Florez Condori"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Área / Especialidad *</Form.Label>
                <Form.Control
                  type="text"
                  name="area"
                  value={formPersonal.area}
                  onChange={handleChange}
                  placeholder="Ej: Matemática, Comunicación"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cargo *</Form.Label>
                <Form.Select
                  name="cargo"
                  value={formPersonal.cargo}
                  onChange={handleChange}
                  required
                >
                  <option value="Director">Director</option>
                  <option value="Subdirector">Subdirector</option>
                  <option value="Docente">Docente</option>
                  <option value="Auxiliar Ed.">Auxiliar Ed.</option>
                  <option value="Administrativo">Administrativo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <CalendarEvent className="me-1" />
                  Fecha de Nacimiento *
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_nacimiento"
                  value={formPersonal.fecha_nacimiento}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <TelephoneFill className="me-1" />
                  Celular *
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="celular"
                  value={formPersonal.celular}
                  onChange={handleChange}
                  placeholder="Ej: 950891414"
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
                  value={formPersonal.orden}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>
              <EnvelopeFill className="me-1" />
              Correo Electrónico *
            </Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={formPersonal.correo}
              onChange={handleChange}
              placeholder="ejemplo@gmail.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <HouseFill className="me-1" />
              Dirección Domiciliaria
            </Form.Label>
            <Form.Control
              type="text"
              name="direccion"
              value={formPersonal.direccion}
              onChange={handleChange}
              placeholder="Ej: C.P. Sirenachayoc"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="activo"
              label="Activo (aparecerá en el directorio público)"
              checked={formPersonal.activo}
              onChange={handleChange}
            />
          </Form.Group>

          <Alert variant="info" className="small">
            <strong>Nota:</strong> Los campos marcados con * son obligatorios.
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
          <PeopleFill className="me-2" />
          Panel de Administración - Directorio
        </h1>
        <p className="lead text-muted">
          Gestión del personal docente y administrativo
        </p>
      </div>

      {/* Tabla principal */}
      {renderTablaPersonal()}

      {/* Modal */}
      {renderModal()}
    </Container>
  );
};

export default AdminDirectorio;
