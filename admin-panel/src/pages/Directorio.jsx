import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Table,
  Badge
} from "react-bootstrap";
import {
  PeopleFill,
  PlusCircle,
  Pencil,
  Trash,
  TelephoneFill,
  EnvelopeFill,
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";

// Importar servicio
import { directorioService } from "../services/directorioService";

const AREAS_CURRICULARES = [
  'Comunicación',
  'Inglés',
  'Arte y Cultura',
  'Matemática',
  'Ciencia y Tecnología',
  'Ciencias Sociales',
  'Desarrollo Personal, Ciudadanía y Cívica',
  'Educación para el Trabajo',
  'Educación Física',
  'Educación Religiosa',
  'Dirección',
  'Subdirección',
  'Auxiliar de Educación',
  'Administrativo',
  'Otro',
];

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
    showModal && (
      <div className="modal-overlay" onClick={cerrarModal}>
        <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              <i className="fas fa-id-card" />
              {modoEdicion ? "Editar Personal" : "Nuevo Personal"}
            </h3>
            <button className="modal-close" onClick={cerrarModal}>
              <i className="fas fa-xmark" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Nombres *</label>
                  <input className="form-input" type="text" name="nombres" value={formPersonal.nombres} onChange={handleChange} placeholder="Ej: Gerardo" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellidos *</label>
                  <input className="form-input" type="text" name="apellidos" value={formPersonal.apellidos} onChange={handleChange} placeholder="Ej: Florez Condori" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Área / Especialidad *</label>
                  <select className="form-input" name="area" value={formPersonal.area} onChange={handleChange} required>
                    <option value="">— Seleccionar área —</option>
                    {AREAS_CURRICULARES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cargo *</label>
                  <select className="form-input" name="cargo" value={formPersonal.cargo} onChange={handleChange} required>
                    <option value="Director">Director</option>
                    <option value="Subdirector">Subdirector</option>
                    <option value="Docente">Docente</option>
                    <option value="Auxiliar Ed.">Auxiliar Ed.</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Fecha de Nacimiento *</label>
                  <input className="form-input" type="date" name="fecha_nacimiento" value={formPersonal.fecha_nacimiento} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Celular *</label>
                  <input className="form-input" type="tel" name="celular" value={formPersonal.celular} onChange={handleChange} placeholder="Ej: 950891414" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Orden</label>
                  <input className="form-input" type="number" name="orden" value={formPersonal.orden} onChange={handleChange} min="1" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico *</label>
                <input className="form-input" type="email" name="correo" value={formPersonal.correo} onChange={handleChange} placeholder="ejemplo@gmail.com" required />
              </div>

              <div className="form-group">
                <label className="form-label">Dirección Domiciliaria</label>
                <input className="form-input" type="text" name="direccion" value={formPersonal.direccion} onChange={handleChange} placeholder="Ej: C.P. Sirenachayoc" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="activo" name="activo" checked={formPersonal.activo} onChange={handleChange} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent)' }} />
                <label htmlFor="activo" style={{ fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>Activo (aparecerá en el directorio público)</label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={cerrarModal}>Cancelar</button>
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
