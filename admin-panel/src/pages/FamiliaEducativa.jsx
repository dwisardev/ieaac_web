// src/pages/Comunidad/FamiliaEducativaAdmin.jsx - PARTE 1
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
  PeopleFill,
  PlusCircle,
  Pencil,
  Trash,
  Save,
  X,
  PersonBadge,
  TelephoneFill,
  Calendar3,
  BriefcaseFill
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";

// Importar servicios (necesitarás crear estos métodos)
import {
  obtenerMiembrosCompleto,
  obtenerCategorias,
  crearMiembro,
  actualizarMiembro,
  eliminarMiembro,
  actualizarDirector,
  uploadFotoGrupo,
  deleteFotoGrupo
} from "../services/miembrosServices";

const FamiliaEducativaAdmin = () => {
  // Estados generales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("director");
  const [anioEscolar, setAnioEscolar] = useState(new Date().getFullYear());

  // Estados de datos
  const [miembros, setMiembros] = useState(null);
  const [categorias, setCategorias] = useState([]);

  // Estados de modales
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState("director");

  // Estado foto grupal
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || '';

  // Estado de formulario
  const [formMiembro, setFormMiembro] = useState({
    id: null,
    nombre: "",
    cargo: "",
    especialidad: "",
    condicion: "Nombrado",
    celular: "",
    rol: "",
    categoria_slug: "director",
    anio_escolar: new Date().getFullYear(),
    orden: 1,
    activo: true
  });

  // Cargar datos al montar
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, [anioEscolar]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [miembrosData, categoriasData] = await Promise.all([
        obtenerMiembrosCompleto(anioEscolar),
        obtenerCategorias()
      ]);

      setMiembros(miembrosData);
      setCategorias(categoriasData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // GESTIÓN DE DIRECTOR
  // ==========================================

  const abrirModalDirector = () => {
    if (miembros?.director) {
      setFormMiembro({
        ...miembros.director,
        categoria_slug: "director",
        anio_escolar: anioEscolar
      });
      setModoEdicion(true);
    } else {
      setFormMiembro({
        id: null,
        nombre: "",
        cargo: "Director",
        categoria_slug: "director",
        anio_escolar: anioEscolar,
        orden: 1,
        activo: true
      });
      setModoEdicion(false);
    }
    setCategoriaActual("director");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setFormMiembro({
      id: null,
      nombre: "",
      cargo: "",
      especialidad: "",
      condicion: "Nombrado",
      celular: "",
      rol: "",
      categoria_slug: "director",
      anio_escolar: anioEscolar,
      orden: 1,
      activo: true
    });
    setModoEdicion(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormMiembro(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "orden" ? parseInt(value) : value)
    }));
  };

  const handleSubmitDirector = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (modoEdicion) {
        await actualizarDirector(formMiembro);
        setSuccess("Director actualizado correctamente");
      } else {
        await actualizarDirector(formMiembro);
        setSuccess("Director registrado correctamente");
      }
      
      cerrarModal();
      await cargarDatos();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al guardar director:", err);
      setError("Error al guardar los datos. Intente nuevamente.");
    }
  };

  // Renderizar sección de director
  const renderSeccionDirector = () => (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <PersonBadge className="me-2" />
          Nuestro Director
        </h5>
        <div className="d-flex align-items-center gap-2">
          <FotoGrupalBtn slug="director" />
          <Button
            variant="light"
            size="sm"
            onClick={abrirModalDirector}
          >
            {miembros?.director ? (
              <>
                <Pencil className="me-1" />
                Editar
              </>
            ) : (
              <>
                <PlusCircle className="me-1" />
                Asignar Director
              </>
            )}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {miembros?.director ? (
          <Row>
            <Col md={6}>
              <div className="p-4 bg-light rounded text-center">
                <PersonBadge size={48} className="text-primary mb-3" />
                <h5 className="fw-bold">{miembros.director.nombre}</h5>
                <p className="text-muted mb-0">{miembros.director.cargo}</p>
              </div>
            </Col>
          </Row>
        ) : (
          <Alert variant="info">
            No hay director asignado para el año {anioEscolar}. Haga clic en "Asignar Director" para agregarlo.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

  // Modal de director
  const renderModalDirector = () => (
    <Modal show={showModal && categoriaActual === "director"} onHide={cerrarModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          {modoEdicion ? "Editar Director" : "Asignar Director"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmitDirector}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre Completo *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formMiembro.nombre}
              onChange={handleChange}
              placeholder="Ej: Prof. Gerardo Florez Condori"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cargo</Form.Label>
            <Form.Control
              type="text"
              name="cargo"
              value={formMiembro.cargo}
              onChange={handleChange}
              placeholder="Director"
              readOnly
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Año Escolar</Form.Label>
                <Form.Control
                  type="number"
                  name="anio_escolar"
                  value={formMiembro.anio_escolar}
                  onChange={handleChange}
                  min="2020"
                  max="2030"
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
                  checked={formMiembro.activo}
                  onChange={handleChange}
                  className="mt-4"
                />
              </Form.Group>
            </Col>
          </Row>
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
  // ==========================================
// GESTIÓN DE COMITÉS (Genérica para todos)
// ==========================================

const abrirModalComite = (categoria, miembro = null) => {
  setCategoriaActual(categoria);
  
  if (miembro) {
    setFormMiembro({
      ...miembro,
      categoria_slug: categoria,
      anio_escolar: anioEscolar
    });
    setModoEdicion(true);
  } else {
    const listaMiembros = obtenerListaMiembrosPorCategoria(categoria);
    const maxOrden = listaMiembros.length > 0 
      ? Math.max(...listaMiembros.map(m => m.orden || 0)) 
      : 0;
    
    setFormMiembro({
      id: null,
      nombre: "",
      cargo: "",
      especialidad: "",
      condicion: "Nombrado",
      celular: "",
      rol: "",
      categoria_slug: categoria,
      anio_escolar: anioEscolar,
      orden: maxOrden + 1,
      activo: true
    });
    setModoEdicion(false);
  }
  setShowModal(true);
};

const obtenerListaMiembrosPorCategoria = (categoria) => {
  if (!miembros) return [];
  
  const categoriaMap = {
    'comite_operativo': 'comiteOperativo',
    'comite_pedagogico': 'comitePedagogico',
    'comite_bienestar': 'comiteBienestar',
    'conei': 'conei',
    'consejo_directivo': 'consejoDirectivo',
    'docentes': 'docentes',
    'auxiliares': 'auxiliares',
    'municipio': 'municipio'
  };
  
  const key = categoriaMap[categoria];
  return miembros[key] || [];
};

const handleSubmitMiembro = async (e) => {
  e.preventDefault();
  try {
    setError(null);
    
    if (modoEdicion) {
      await actualizarMiembro(formMiembro.id, formMiembro);
      setSuccess("Miembro actualizado correctamente");
    } else {
      await crearMiembro(formMiembro);
      setSuccess("Miembro creado correctamente");
    }
    
    cerrarModal();
    await cargarDatos();
    
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al guardar miembro:", err);
    setError("Error al guardar los datos. Intente nuevamente.");
  }
};

const handleEliminarMiembro = async (id, categoria) => {
  if (!window.confirm("¿Está seguro de eliminar este miembro?")) {
    return;
  }

  try {
    setError(null);
    await eliminarMiembro(id);
    setSuccess("Miembro eliminado correctamente");
    await cargarDatos();
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al eliminar miembro:", err);
    setError("Error al eliminar el registro. Intente nuevamente.");
  }
};

// Subir foto grupal por categoría slug
const handleFotoGrupal = async (slug, e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const cat = categorias.find(c => c.slug === slug);
  if (!cat) { setError("Categoría no encontrada"); return; }
  try {
    setUploadingFoto(true);
    setError(null);
    await uploadFotoGrupo(cat.id, file);
    setSuccess("Foto grupal actualizada");
    await cargarDatos();
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    setError("Error al subir la foto grupal");
  } finally {
    setUploadingFoto(false);
    e.target.value = '';
  }
};

// Botón de foto grupal reutilizable
const FotoGrupalBtn = ({ slug }) => {
  const cat = categorias.find(c => c.slug === slug);
  const fotoActual = miembros?.fotos_grupo?.[slug];
  const inputId = `foto-grupal-${slug}`;
  return (
    <div className="d-flex align-items-center gap-2">
      {fotoActual && (
        <img
          src={`${UPLOAD_URL}${fotoActual}`}
          alt="Foto grupal"
          style={{ height: 32, width: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #dee2e6' }}
        />
      )}
      <label
        htmlFor={inputId}
        className="btn btn-light btn-sm mb-0"
        title="Subir foto grupal de sección"
        style={{ cursor: 'pointer' }}
      >
        {uploadingFoto ? (
          <span className="spinner-border spinner-border-sm" />
        ) : (
          <><i className="bi bi-camera-fill me-1" />{fotoActual ? 'Cambiar foto' : 'Añadir foto'}</>
        )}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="d-none"
        onChange={(e) => handleFotoGrupal(slug, e)}
        disabled={uploadingFoto}
      />
    </div>
  );
};

// Renderizar tabla genérica de comités
const renderTablaComite = (categoria, titulo, icono) => {
  const lista = obtenerListaMiembrosPorCategoria(categoria);
  
  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          {icono && <>{icono} </>}
          {titulo}
        </h5>
        <div className="d-flex align-items-center gap-2">
          {(categoria === 'docentes' || categoria === 'municipio') && (
            <FotoGrupalBtn slug={categoria} />
          )}
          <Button
            variant="light"
            size="sm"
            onClick={() => abrirModalComite(categoria)}
          >
            <PlusCircle className="me-1" />
            Agregar Miembro
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {lista.length === 0 ? (
          <Alert variant="info">No hay miembros registrados en este comité</Alert>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th style={{width: "60px"}}>Orden</th>
                <th>Nombre</th>
                <th>Cargo</th>
                {categoria === 'consejo_directivo' && <th>Celular</th>}
                <th style={{width: "120px"}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.sort((a, b) => (a.orden || 0) - (b.orden || 0)).map(miembro => (
                <tr key={miembro.id}>
                  <td className="text-center">{miembro.orden}</td>
                  <td><strong>{miembro.nombre}</strong></td>
                  <td>
                    <Badge bg="info">{miembro.cargo}</Badge>
                  </td>
                  {categoria === 'consejo_directivo' && (
                    <td>
                      {miembro.celular ? (
                        <a href={`tel:${miembro.celular}`} className="text-decoration-none">
                          <TelephoneFill size={14} className="me-1" />
                          {miembro.celular}
                        </a>
                      ) : '-'}
                    </td>
                  )}
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => abrirModalComite(categoria, miembro)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleEliminarMiembro(miembro.id, categoria)}
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
};

// Modal genérico para comités
const renderModalComite = () => {
  const esConsejoDirectivo = categoriaActual === 'consejo_directivo';
  const esDocente = categoriaActual === 'docentes';
  const esAuxiliar = categoriaActual === 'auxiliares';
  const esMunicipio = categoriaActual === 'municipio';
  
  const titulosCategoria = {
    'comite_operativo': 'Comité de Gestión de Condiciones Operativas',
    'comite_pedagogico': 'Comité de Gestión Pedagógica',
    'comite_bienestar': 'Comité de Gestión del Bienestar',
    'conei': 'CONEI',
    'consejo_directivo': 'Consejo Directivo APAFA',
    'docentes': 'Docente',
    'auxiliares': 'Auxiliar',
    'municipio': 'Municipio Escolar'
  };
  
  return (
    <Modal 
      show={showModal && categoriaActual !== "director"} 
      onHide={cerrarModal}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {modoEdicion ? "Editar" : "Agregar"} - {titulosCategoria[categoriaActual]}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmitMiembro}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre Completo *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formMiembro.nombre}
              onChange={handleChange}
              placeholder="Ej: Prof. María López García"
              required
            />
          </Form.Group>

          <Row>
            <Col md={esDocente || esAuxiliar ? 6 : 12}>
              <Form.Group className="mb-3">
                <Form.Label>Cargo / Rol *</Form.Label>
                <Form.Control
                  type="text"
                  name="cargo"
                  value={formMiembro.cargo}
                  onChange={handleChange}
                  placeholder={
                    esConsejoDirectivo ? "Ej: Presidente" :
                    esMunicipio ? "Ej: Alcaldesa" :
                    esDocente ? "Ej: Docente" :
                    esAuxiliar ? "Ej: Auxiliar de Educación" :
                    "Ej: Coordinador"
                  }
                  required
                />
              </Form.Group>
            </Col>
            
            {esDocente && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Especialidad</Form.Label>
                  <Form.Control
                    type="text"
                    name="especialidad"
                    value={formMiembro.especialidad}
                    onChange={handleChange}
                    placeholder="Ej: Matemática"
                  />
                </Form.Group>
              </Col>
            )}
            
            {esAuxiliar && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Control
                    type="text"
                    name="rol"
                    value={formMiembro.rol}
                    onChange={handleChange}
                    placeholder="Ej: Auxiliar de Educación"
                  />
                </Form.Group>
              </Col>
            )}
          </Row>

          {(esDocente || esAuxiliar) && (
            <Form.Group className="mb-3">
              <Form.Label>Condición *</Form.Label>
              <Form.Select
                name="condicion"
                value={formMiembro.condicion}
                onChange={handleChange}
                required
              >
                <option value="Nombrado">Nombrado</option>
                <option value="Nombrada">Nombrada</option>
                <option value="Contratado">Contratado</option>
                <option value="Contratada">Contratada</option>
              </Form.Select>
            </Form.Group>
          )}

          {esConsejoDirectivo && (
            <Form.Group className="mb-3">
              <Form.Label>
                <TelephoneFill className="me-1" />
                Celular
              </Form.Label>
              <Form.Control
                type="tel"
                name="celular"
                value={formMiembro.celular}
                onChange={handleChange}
                placeholder="Ej: 987654321"
              />
            </Form.Group>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Orden</Form.Label>
                <Form.Control
                  type="number"
                  name="orden"
                  value={formMiembro.orden}
                  onChange={handleChange}
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
                  checked={formMiembro.activo}
                  onChange={handleChange}
                  className="mt-4"
                />
              </Form.Group>
            </Col>
          </Row>
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
};


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
          <PeopleFill className="me-2" />
          Panel de Administración - Familia Educativa
        </h1>
        <p className="lead text-muted">
          Gestión completa de los miembros de la comunidad educativa
        </p>
        
        {/* Selector de año */}
        <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
          <label className="fw-bold">Año Escolar:</label>
          <Form.Select
            value={anioEscolar}
            onChange={(e) => setAnioEscolar(parseInt(e.target.value))}
            style={{ width: "150px" }}
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </Form.Select>
        </div>
      </div>

      {/* Tabs de administración */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
      <Tab eventKey="director" title="Director">
        {renderSeccionDirector()}
      </Tab>

      <Tab eventKey="comite_operativo" title="Comité Operativo">
    {renderTablaComite('comite_operativo', 'Comité de Gestión de Condiciones Operativas')}
    </Tab>

    <Tab eventKey="comite_pedagogico" title="Comité Pedagógico">
    {renderTablaComite('comite_pedagogico', 'Comité de Gestión Pedagógica')}
    </Tab>

    <Tab eventKey="comite_bienestar" title="Comité Bienestar">
    {renderTablaComite('comite_bienestar', 'Comité de Gestión del Bienestar')}
    </Tab>

    <Tab eventKey="conei" title="CONEI">
    {renderTablaComite('conei', 'CONEI - Consejo Educativo Institucional')}
    </Tab>

    <Tab eventKey="consejo_directivo" title="APAFA">
    {renderTablaComite('consejo_directivo', 'Consejo Directivo APAFA')}
    </Tab>

    <Tab eventKey="docentes" title="Docentes">
    {renderTablaComite('docentes', 'Plana Docente')}
    </Tab>

    <Tab eventKey="auxiliares" title="Auxiliares">
    {renderTablaComite('auxiliares', 'Auxiliares de Educación')}
    </Tab>

    <Tab eventKey="municipio" title="Municipio Escolar">
    {renderTablaComite('municipio', 'Municipio Escolar')}
    </Tab>

      </Tabs>

      {/* Modales */}
      {renderModalDirector()}
      {renderModalComite()}
    </Container>
  );
};

export default FamiliaEducativaAdmin;