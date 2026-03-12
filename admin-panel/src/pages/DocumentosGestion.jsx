// src/components/AdminDocumentosGestion.jsx - PARTE 1
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
  InputGroup
} from "react-bootstrap";
import {
  FileText,
  PlusCircle,
  Pencil,
  Trash,
  Save,
  X,
  GearFill,
  FileEarmarkPdf,
  FileEarmarkWord,
  FileEarmarkExcel,
  FileEarmarkPpt,
  FileEarmark,
  BarChartFill,
  Search,
  Eye,
  Download,
  Tag
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";

// Importar servicios
import {
  obtenerDocumentosGestion,
  obtenerInfoInstitucional,
  actualizarInfoInstitucional,
  crearDocumento,
  actualizarDocumento,
  eliminarDocumento,
  obtenerEstadisticas,
  buscarDocumentos,
  TIPOS_DOCUMENTO,
  obtenerTipoDocumento
} from "../services/documentosService";

// Mapeo de iconos de archivo
const iconosArchivo = {
  PDF: FileEarmarkPdf,
  WORD: FileEarmarkWord,
  EXCEL: FileEarmarkExcel,
  POWERPOINT: FileEarmarkPpt,
  WORD_OLD: FileEarmarkWord,
  EXCEL_OLD: FileEarmarkExcel,
  POWERPOINT_OLD: FileEarmarkPpt,
  DESCONOCIDO: FileEarmark
};

const AdminDocumentosGestion = () => {
  // Estados generales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("documentos");

  // Estados de datos
  const [documentos, setDocumentos] = useState([]);
  const [documentosFiltrados, setDocumentosFiltrados] = useState([]);
  const [infoInstitucional, setInfoInstitucional] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de búsqueda y filtros
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  // Estados de modales
  const [showModalInfo, setShowModalInfo] = useState(false);
  const [showModalDoc, setShowModalDoc] = useState(false);
  const [showModalVista, setShowModalVista] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado de formulario info institucional
  const [formInfo, setFormInfo] = useState({
    id: null,
    nombre: "",
    codigo_modular: "",
    director: "",
    ubicacion: "",
    anio_vigencia: new Date().getFullYear(),
    grados_atendidos: ""
  });

  // Estado de formulario documento
  const [formDoc, setFormDoc] = useState({
    id: null,
    codigo: "",
    nombre: "",
    descripcion: "",
    archivo: null,
    tipo_archivo: "PDF",
    color: "#4361ee",
    icono: "FileText",
    anio_vigencia: new Date().getFullYear(),
    etiquetas: []
  });

  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [etiquetaInput, setEtiquetaInput] = useState("");
  const [documentoVista, setDocumentoVista] = useState(null);

  // Lista de iconos disponibles
  const iconosDisponibles = [
    { value: "House", label: "Casa/Institución" },
    { value: "Calendar2Check", label: "Calendario" },
    { value: "Book", label: "Libro" },
    { value: "FileText", label: "Documento" },
    { value: "People", label: "Personas" },
    { value: "CheckCircle", label: "Check" },
    { value: "Cash", label: "Dinero" }
  ];

  // Cargar datos al montar
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, []);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    aplicarFiltros();
  }, [documentos, terminoBusqueda, filtroTipo]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [docsData, infoData, statsData] = await Promise.all([
        obtenerDocumentosGestion(),
        obtenerInfoInstitucional(),
        obtenerEstadisticas()
      ]);

      setDocumentos(docsData);
      setDocumentosFiltrados(docsData);
      setInfoInstitucional(infoData);
      setEstadisticas(statsData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...documentos];

    // Filtro por búsqueda
    if (terminoBusqueda.trim()) {
      const termino = terminoBusqueda.toLowerCase();
      resultado = resultado.filter(doc =>
        doc.nombre.toLowerCase().includes(termino) ||
        doc.descripcion.toLowerCase().includes(termino) ||
        doc.codigo.toLowerCase().includes(termino) ||
        doc.etiquetas?.some(tag => tag.toLowerCase().includes(termino))
      );
    }

    // Filtro por tipo
    if (filtroTipo !== "todos") {
      resultado = resultado.filter(doc => doc.tipo_archivo === filtroTipo);
    }

    setDocumentosFiltrados(resultado);
  };

  const getIconoArchivo = (tipo) => {
    const IconComponent = iconosArchivo[tipo] || FileEarmark;
    return <IconComponent size={20} />;
  };

  const getColorTipo = (tipo) => {
    return TIPOS_DOCUMENTO[tipo]?.color || '#6c757d';
  };

// AdminDocumentosGestion.jsx - PARTE 2
// Continúa desde PARTE 1...

  // ==========================================
  // GESTIÓN DE INFORMACIÓN INSTITUCIONAL
  // ==========================================

  const abrirModalInfo = () => {
    if (infoInstitucional) {
      setFormInfo(infoInstitucional);
      setModoEdicion(true);
    } else {
      setFormInfo({
        id: null,
        nombre: "I.E. Andrés Avelino Cáceres",
        codigo_modular: "",
        director: "",
        ubicacion: "Sirenachayocc, Cusco",
        anio_vigencia: new Date().getFullYear(),
        grados_atendidos: "1° a 5° de secundaria"
      });
      setModoEdicion(false);
    }
    setShowModalInfo(true);
  };

  const cerrarModalInfo = () => {
    setShowModalInfo(false);
    setFormInfo({
      id: null,
      nombre: "",
      codigo_modular: "",
      director: "",
      ubicacion: "",
      anio_vigencia: new Date().getFullYear(),
      grados_atendidos: ""
    });
    setModoEdicion(false);
  };

  const handleChangeInfo = (e) => {
    const { name, value } = e.target;
    setFormInfo(prev => ({
      ...prev,
      [name]: name === "anio_vigencia" ? parseInt(value) : value
    }));
  };

  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await actualizarInfoInstitucional(formInfo);
      setSuccess("Información institucional actualizada correctamente");
      cerrarModalInfo();
      await cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al guardar información:", err);
      setError("Error al guardar la información. Intente nuevamente.");
    }
  };

  // Renderizar sección de info institucional
  const renderSeccionInfo = () => (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <GearFill className="me-2" />
          Información Institucional
        </h5>
        <Button 
          variant="light" 
          size="sm"
          onClick={abrirModalInfo}
        >
          <Pencil className="me-1" />
          Editar
        </Button>
      </Card.Header>
      <Card.Body>
        {infoInstitucional ? (
          <Row>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Nombre de la I.E.</strong>
              <p className="mb-0">{infoInstitucional.nombre}</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Código Modular</strong>
              <p className="mb-0">{infoInstitucional.codigo_modular}</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Director(a)</strong>
              <p className="mb-0">{infoInstitucional.director}</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Ubicación</strong>
              <p className="mb-0">{infoInstitucional.ubicacion}</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Año de Vigencia</strong>
              <p className="mb-0">
                <Badge bg="success">{infoInstitucional.anio_vigencia}</Badge>
              </p>
            </Col>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Grados Atendidos</strong>
              <p className="mb-0">{infoInstitucional.grados_atendidos}</p>
            </Col>
          </Row>
        ) : (
          <Alert variant="info">
            No hay información institucional registrada. 
            Haga clic en "Editar" para agregarla.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

  // Modal de info institucional
  const renderModalInfo = () => (
    <Modal show={showModalInfo} onHide={cerrarModalInfo} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Información Institucional</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmitInfo}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la I.E. *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formInfo.nombre}
              onChange={handleChangeInfo}
              placeholder="Ej: I.E. Andrés Avelino Cáceres"
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Código Modular *</Form.Label>
                <Form.Control
                  type="text"
                  name="codigo_modular"
                  value={formInfo.codigo_modular}
                  onChange={handleChangeInfo}
                  placeholder="Ej: 1372374"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Año de Vigencia *</Form.Label>
                <Form.Control
                  type="number"
                  name="anio_vigencia"
                  value={formInfo.anio_vigencia}
                  onChange={handleChangeInfo}
                  min="2020"
                  max="2030"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Director(a) *</Form.Label>
            <Form.Control
              type="text"
              name="director"
              value={formInfo.director}
              onChange={handleChangeInfo}
              placeholder="Ej: Gerardo Florez Condori"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ubicación *</Form.Label>
            <Form.Control
              type="text"
              name="ubicacion"
              value={formInfo.ubicacion}
              onChange={handleChangeInfo}
              placeholder="Ej: Sirenachayocc, Cusco"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Grados Atendidos *</Form.Label>
            <Form.Control
              type="text"
              name="grados_atendidos"
              value={formInfo.grados_atendidos}
              onChange={handleChangeInfo}
              placeholder="Ej: 1° a 5° de secundaria"
              required
            />
          </Form.Group>

          <Alert variant="info" className="small">
            <strong>Nota:</strong> Esta información aparecerá en la página pública de documentos de gestión.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalInfo}>
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
// AdminDocumentosGestion.jsx - PARTE 3
// Continúa desde PARTE 2...

  // ==========================================
  // GESTIÓN DE DOCUMENTOS
  // ==========================================

  const abrirModalDoc = (doc = null) => {
    if (doc) {
      setFormDoc({
        ...doc,
        etiquetas: doc.etiquetas || []
      });
      setModoEdicion(true);
    } else {
      setFormDoc({
        id: null,
        codigo: "",
        nombre: "",
        descripcion: "",
        archivo: null,
        tipo_archivo: "PDF",
        color: "#4361ee",
        icono: "FileText",
        anio_vigencia: new Date().getFullYear(),
        etiquetas: []
      });
      setModoEdicion(false);
    }
    setArchivoSeleccionado(null);
    setEtiquetaInput("");
    setShowModalDoc(true);
  };

  const cerrarModalDoc = () => {
    setShowModalDoc(false);
    setFormDoc({
      id: null,
      codigo: "",
      nombre: "",
      descripcion: "",
      archivo: null,
      tipo_archivo: "PDF",
      color: "#4361ee",
      icono: "FileText",
      anio_vigencia: new Date().getFullYear(),
      etiquetas: []
    });
    setArchivoSeleccionado(null);
    setEtiquetaInput("");
    setModoEdicion(false);
  };

  const handleChangeDoc = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "archivo" && files && files[0]) {
      const archivo = files[0];
      setArchivoSeleccionado(archivo);
      
      // Detectar tipo de archivo
      const tipoInfo = obtenerTipoDocumento(archivo.name);
      
      setFormDoc(prev => ({
        ...prev,
        archivo: archivo,
        tipo_archivo: tipoInfo.tipo
      }));
    } else {
      setFormDoc(prev => ({
        ...prev,
        [name]: name === "anio_vigencia" ? parseInt(value) : value
      }));
    }
  };

  const agregarEtiqueta = () => {
    if (etiquetaInput.trim() && !formDoc.etiquetas.includes(etiquetaInput.trim())) {
      setFormDoc(prev => ({
        ...prev,
        etiquetas: [...prev.etiquetas, etiquetaInput.trim()]
      }));
      setEtiquetaInput("");
    }
  };

  const eliminarEtiqueta = (index) => {
    setFormDoc(prev => ({
      ...prev,
      etiquetas: prev.etiquetas.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitDoc = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Crear FormData
      const formData = new FormData();
      formData.append('codigo', formDoc.codigo);
      formData.append('nombre', formDoc.nombre);
      formData.append('descripcion', formDoc.descripcion);
      formData.append('tipo_archivo', formDoc.tipo_archivo);
      formData.append('color', formDoc.color);
      formData.append('icono', formDoc.icono);
      formData.append('anio_vigencia', formDoc.anio_vigencia);
      formData.append('etiquetas', JSON.stringify(formDoc.etiquetas));
      
      if (archivoSeleccionado) {
        formData.append('archivo', archivoSeleccionado);
      }
      
      if (modoEdicion) {
        await actualizarDocumento(formDoc.id, formData);
        setSuccess("Documento actualizado correctamente");
      } else {
        if (!archivoSeleccionado) {
          setError("Debe seleccionar un archivo");
          return;
        }
        await crearDocumento(formData);
        setSuccess("Documento creado correctamente");
      }
      
      cerrarModalDoc();
      await cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al guardar documento:", err);
      setError("Error al guardar el documento. Intente nuevamente.");
    }
  };

  const handleEliminarDoc = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este documento?")) {
      return;
    }

    try {
      setError(null);
      await eliminarDocumento(id);
      setSuccess("Documento eliminado correctamente");
      await cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al eliminar documento:", err);
      setError("Error al eliminar el documento. Intente nuevamente.");
    }
  };

  const handleVerDocumento = (doc) => {
    setDocumentoVista(doc);
    setShowModalVista(true);
  };

// AdminDocumentosGestion.jsx - PARTE 4
// Continúa desde PARTE 3...

  // Renderizar sección de estadísticas
  const renderEstadisticas = () => (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-info text-white">
        <h5 className="mb-0">
          <BarChartFill className="me-2" />
          Estadísticas del Sistema
        </h5>
      </Card.Header>
      <Card.Body>
        {estadisticas && (
          <>
            <Row className="text-center g-3 mb-4">
              <Col xs={6} md={3}>
                <div>
                  <h3 className="fw-bold text-primary mb-0">{estadisticas.totalDocumentos}</h3>
                  <small className="text-muted">Total Documentos</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div>
                  <h3 className="fw-bold text-success mb-0">{estadisticas.totalDescargas}</h3>
                  <small className="text-muted">Descargas</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div>
                  <h3 className="fw-bold text-warning mb-0">{estadisticas.totalVistas}</h3>
                  <small className="text-muted">Visualizaciones</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div>
                  <h3 className="fw-bold text-info mb-0">
                    {Object.keys(estadisticas.documentosPorTipo || {}).length}
                  </h3>
                  <small className="text-muted">Tipos de Archivo</small>
                </div>
              </Col>
            </Row>

            {estadisticas.documentosPorTipo && (
              <div>
                <h6 className="fw-bold mb-3">Documentos por Tipo:</h6>
                <Row className="g-2">
                  {Object.entries(estadisticas.documentosPorTipo).map(([tipo, cantidad]) => (
                    <Col xs={6} md={3} key={tipo}>
                      <div className="p-2 bg-light rounded text-center">
                        {getIconoArchivo(tipo)}
                        <div className="mt-1">
                          <Badge bg="secondary">{cantidad}</Badge>
                          <small className="d-block text-muted">{tipo}</small>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );

  // Renderizar sección de documentos
  const renderSeccionDocumentos = () => (
    <>
      {renderEstadisticas()}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FileEarmarkPdf className="me-2" />
              Gestión de Documentos
            </h5>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => abrirModalDoc()}
            >
              <PlusCircle className="me-1" />
              Nuevo Documento
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Barra de búsqueda y filtros */}
          <Row className="mb-3 g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre, código o etiqueta..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="todos">Todos los tipos</option>
                {Object.keys(TIPOS_DOCUMENTO).map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Badge bg="secondary" className="w-100 p-2">
                {documentosFiltrados.length} resultados
              </Badge>
            </Col>
          </Row>

          {documentosFiltrados.length === 0 ? (
            <Alert variant="info">
              {terminoBusqueda || filtroTipo !== "todos" 
                ? "No se encontraron documentos con los filtros aplicados"
                : "No hay documentos registrados"}
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th style={{width: "80px"}}>Tipo</th>
                  <th style={{width: "100px"}}>Código</th>
                  <th>Nombre</th>
                  <th style={{width: "150px"}}>Etiquetas</th>
                  <th style={{width: "120px"}}>
                    <BarChartFill className="me-1" />
                    Stats
                  </th>
                  <th style={{width: "100px"}}>Año</th>
                  <th style={{width: "180px"}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentosFiltrados.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div 
                        className="d-flex align-items-center justify-content-center rounded p-2"
                        style={{ backgroundColor: getColorTipo(doc.tipo_archivo) + '20' }}
                      >
                        {getIconoArchivo(doc.tipo_archivo)}
                      </div>
                    </td>
                    <td>
                      <Badge 
                        bg="secondary" 
                        style={{backgroundColor: doc.color}}
                      >
                        {doc.codigo}
                      </Badge>
                    </td>
                    <td>
                      <div>
                        <strong>{doc.nombre}</strong>
                        <br />
                        <small className="text-muted">{doc.descripcion}</small>
                        {doc.tamanio && (
                          <><br /><Badge bg="light" text="dark">{doc.tamanio}</Badge></>
                        )}
                      </div>
                    </td>
                    <td>
                      {doc.etiquetas && doc.etiquetas.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {doc.etiquetas.slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} bg="info" className="small">
                              {tag}
                            </Badge>
                          ))}
                          {doc.etiquetas.length > 2 && (
                            <Badge bg="secondary" className="small">
                              +{doc.etiquetas.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <small className="text-muted">Sin etiquetas</small>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">
                        <Eye className="me-1" size={14} />
                        {doc.vistas || 0}
                        <br />
                        <Download className="me-1" size={14} />
                        {doc.descargas || 0}
                      </small>
                    </td>
                    <td>
                      <Badge bg="success">{doc.anio_vigencia}</Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleVerDocumento(doc)}
                          title="Ver documento"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => abrirModalDoc(doc)}
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEliminarDoc(doc.id)}
                          title="Eliminar"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );

// AdminDocumentosGestion.jsx - PARTE 5 (FINAL)
// Continúa desde PARTE 4...

  // Modal de documentos
  const renderModalDoc = () => (
    <Modal show={showModalDoc} onHide={cerrarModalDoc} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {modoEdicion ? "Editar Documento" : "Nuevo Documento"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmitDoc}>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Código *</Form.Label>
                <Form.Control
                  type="text"
                  name="codigo"
                  value={formDoc.codigo}
                  onChange={handleChangeDoc}
                  placeholder="Ej: pei, pat, pci"
                  required
                />
                <Form.Text className="text-muted">
                  Código corto identificador (único)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Año de Vigencia *</Form.Label>
                <Form.Control
                  type="number"
                  name="anio_vigencia"
                  value={formDoc.anio_vigencia}
                  onChange={handleChangeDoc}
                  min="2020"
                  max="2030"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Nombre del Documento *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formDoc.nombre}
              onChange={handleChangeDoc}
              placeholder="Ej: Proyecto Educativo Institucional (PEI)"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={formDoc.descripcion}
              onChange={handleChangeDoc}
              placeholder="Breve descripción del documento"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Archivo {!modoEdicion && '*'}</Form.Label>
            <Form.Control
              type="file"
              name="archivo"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleChangeDoc}
              required={!modoEdicion}
            />
            <Form.Text className="text-muted">
              {modoEdicion 
                ? "Seleccione un archivo solo si desea reemplazar el actual"
                : "Formatos soportados: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx)"}
            </Form.Text>
          </Form.Group>

          {archivoSeleccionado && (
            <Alert variant="success" className="small d-flex align-items-center">
              {getIconoArchivo(formDoc.tipo_archivo)}
              <span className="ms-2">
                <strong>Archivo seleccionado:</strong> {archivoSeleccionado.name}
                <br />
                <Badge bg="info">{formDoc.tipo_archivo}</Badge>
                <Badge bg="secondary" className="ms-1">
                  {(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </span>
            </Alert>
          )}

          {modoEdicion && formDoc.archivo && !archivoSeleccionado && (
            <Alert variant="info" className="small d-flex align-items-center">
              {getIconoArchivo(formDoc.tipo_archivo)}
              <span className="ms-2">
                <strong>Archivo actual:</strong> {formDoc.archivo}
                <br />
                <Badge bg="info">{formDoc.tipo_archivo}</Badge>
                {formDoc.tamanio && <Badge bg="secondary" className="ms-1">{formDoc.tamanio}</Badge>}
              </span>
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Etiquetas</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control
                type="text"
                value={etiquetaInput}
                onChange={(e) => setEtiquetaInput(e.target.value)}
                placeholder="Ej: normativo, estratégico"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    agregarEtiqueta();
                  }
                }}
              />
              <Button 
                variant="outline-primary" 
                onClick={agregarEtiqueta}
                type="button"
              >
                <PlusCircle />
              </Button>
            </InputGroup>
            
            {formDoc.etiquetas.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {formDoc.etiquetas.map((etiqueta, index) => (
                  <Badge 
                    key={index} 
                    bg="info" 
                    className="d-flex align-items-center gap-1"
                  >
                    <Tag size={12} />
                    {etiqueta}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-white"
                      onClick={() => eliminarEtiqueta(index)}
                      type="button"
                      style={{ marginLeft: '4px' }}
                    >
                      <X size={14} />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Color *</Form.Label>
                <Form.Control
                  type="color"
                  name="color"
                  value={formDoc.color}
                  onChange={handleChangeDoc}
                />
                <Form.Text className="text-muted">
                  Color del icono en la card
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Icono *</Form.Label>
                <Form.Select
                  name="icono"
                  value={formDoc.icono}
                  onChange={handleChangeDoc}
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

          <Alert variant="warning" className="small">
            <strong>Nota sobre visualización:</strong> Los documentos PDF se pueden visualizar directamente. 
            Word, Excel y PowerPoint se descargarán automáticamente.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalDoc}>
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

  // Modal para visualizar documento
  const renderModalVista = () => (
    <Modal
      show={showModalVista}
      onHide={() => setShowModalVista(false)}
      centered
      size="xl"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          {documentoVista && getIconoArchivo(documentoVista.tipo_archivo)}
          {documentoVista?.nombre || "Documento"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light p-3">
        {documentoVista ? (
          <>
            {/* Información del documento */}
            <Card className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h6 className="fw-bold">{documentoVista.nombre}</h6>
                    <p className="text-muted small mb-2">{documentoVista.descripcion}</p>
                    {documentoVista.etiquetas && documentoVista.etiquetas.length > 0 && (
                      <div className="d-flex flex-wrap gap-1">
                        {documentoVista.etiquetas.map((tag, idx) => (
                          <Badge key={idx} bg="info" className="small">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Col>
                  <Col md={4} className="text-end">
                    <Badge bg="secondary">{documentoVista.codigo}</Badge>
                    <br />
                    <Badge bg="success" className="mt-1">{documentoVista.anio_vigencia}</Badge>
                    {documentoVista.tamanio && (
                      <>
                        <br />
                        <Badge bg="light" text="dark" className="mt-1">{documentoVista.tamanio}</Badge>
                      </>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Visualización del documento */}
            {documentoVista.tipo_archivo === 'PDF' ? (
              <div style={{ height: '600px' }}>
                <iframe
                  src={documentoVista.archivo}
                  title="Documento PDF"
                  width="100%"
                  height="100%"
                  style={{ border: 'none', borderRadius: '8px' }}
                />
              </div>
            ) : (
              <Alert variant="info" className="text-center">
                <div className="mb-3">
                  {getIconoArchivo(documentoVista.tipo_archivo)}
                  <h5 className="mt-2">Documento {documentoVista.tipo_archivo}</h5>
                </div>
                <p className="mb-3">
                  Este tipo de documento no se puede visualizar directamente en el navegador.
                </p>
                <Button
                  variant="primary"
                  as="a"
                  href={documentoVista.archivo}
                  download
                  size="lg"
                >
                  <Download className="me-2" />
                  Descargar Documento
                </Button>
              </Alert>
            )}
          </>
        ) : (
          <Alert variant="warning">No se pudo cargar el documento.</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          as="a"
          href={documentoVista?.archivo}
          download
          disabled={!documentoVista}
        >
          <Download className="me-1" />
          Descargar
        </Button>
        <Button variant="secondary" onClick={() => setShowModalVista(false)}>
          Cerrar
        </Button>
      </Modal.Footer>
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
          <FileText className="me-2" />
          Panel de Administración - Documentos de Gestión
        </h1>
        <p className="lead text-muted">
          Gestión completa de documentos institucionales
        </p>
      </div>

      {/* Tabs de administración */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="documentos" title="Documentos">
          {renderSeccionDocumentos()}
        </Tab>
        
        <Tab eventKey="info" title="Información Institucional">
          {renderSeccionInfo()}
        </Tab>
      </Tabs>

      {/* Modales */}
      {renderModalDoc()}
      {renderModalInfo()}
      {renderModalVista()}
    </Container>
  );
};

export default AdminDocumentosGestion;