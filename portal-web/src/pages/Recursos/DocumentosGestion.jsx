// src/components/DocumentosGestion.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Modal,
  Alert,
  Badge,
  InputGroup,
  Form
} from "react-bootstrap";
import {
  FileEarmarkPdf,
  FileEarmarkWord,
  FileEarmarkExcel,
  FileEarmarkPpt,
  FileEarmark,
  House,
  Calendar2Check,
  Book,
  People,
  CheckCircle,
  FileText,
  Download,
  Eye,
  Search,
  Tag
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/Documentos.css";

// Servicios
import {
  obtenerDocumentosGestion,
  obtenerInfoInstitucional,
  registrarDescargaDocumento,
  registrarVistaDocumento,
  buscarDocumentos,
  TIPOS_DOCUMENTO
} from "../../services/documentosService";

// Mapeo de iconos de categoría
const iconMap = {
  House: House,
  Calendar2Check: Calendar2Check,
  Book: Book,
  FileText: FileText,
  People: People,
  CheckCircle: CheckCircle,
};

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

const DocumentosGestion = () => {
  // Estados
  const [documentos, setDocumentos] = useState([]);
  const [documentosFiltrados, setDocumentosFiltrados] = useState([]);
  const [infoInstitucional, setInfoInstitucional] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [documentoActual, setDocumentoActual] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados de búsqueda y filtro
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, []);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    aplicarFiltros();
  }, [documentos, terminoBusqueda, filtroTipo, etiquetaSeleccionada]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [docsData, infoData] = await Promise.all([
        obtenerDocumentosGestion(),
        obtenerInfoInstitucional(),
      ]);

      setDocumentos(docsData);
      setDocumentosFiltrados(docsData);
      setInfoInstitucional(infoData);
    } catch (err) {
      console.error("Error al cargar documentos:", err);
      setError("No se pudieron cargar los documentos. Por favor, intente nuevamente.");
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

    // Filtro por etiqueta
    if (etiquetaSeleccionada) {
      resultado = resultado.filter(doc => 
        doc.etiquetas?.includes(etiquetaSeleccionada)
      );
    }

    setDocumentosFiltrados(resultado);
  };

  const handleOpenPdf = async (documento) => {
    if (documento && documento.archivo) {
      setIsLoadingPdf(true);
      setDocumentoActual(documento);

      // Registrar vista
      try {
        await registrarVistaDocumento(documento.id);
      } catch (err) {
        console.error("Error al registrar vista:", err);
      }

      setTimeout(() => {
        setPdfUrl(documento.archivo);
        setShowModal(true);
        setIsLoadingPdf(false);
      }, 300);
    }
  };

  const handleDescargar = async (documento) => {
    try {
      await registrarDescargaDocumento(documento.id);
    } catch (err) {
      console.error("Error al registrar descarga:", err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPdfUrl("");
    setDocumentoActual(null);
  };

  const getIconComponent = (iconName) => {
    const IconComponent = iconMap[iconName] || FileText;
    return <IconComponent size={24} />;
  };

  const getIconoArchivo = (tipo) => {
    const IconComponent = iconosArchivo[tipo] || FileEarmark;
    return <IconComponent />;
  };

  const getColorTipo = (tipo) => {
    return TIPOS_DOCUMENTO[tipo]?.color || '#6c757d';
  };

  // Obtener todas las etiquetas únicas
  const obtenerTodasEtiquetas = () => {
    const etiquetas = new Set();
    documentos.forEach(doc => {
      doc.etiquetas?.forEach(tag => etiquetas.add(tag));
    });
    return Array.from(etiquetas).sort();
  };

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando documentos de gestión...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5 documentos-gestion-container">
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <div className="d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <Button size="sm" variant="outline-danger" onClick={cargarDatos}>
              Reintentar
            </Button>
          </div>
        </Alert>
      )}

      {/* Encabezado */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">
          <FileText className="me-2" />
          Documentos de Gestión Escolar
        </h1>
        <p className="lead text-muted">
          Instrumentos normativos y pedagógicos que guían la gestión de la I.E.
        </p>
        {infoInstitucional && (
          <p className="text-muted small">
            {infoInstitucional.nombre} | Código Modular: {infoInstitucional.codigo_modular}
          </p>
        )}
      </div>

      {/* Información institucional */}
      {infoInstitucional && (
        <Card className="mb-5 shadow-sm border-0">
          <Card.Body>
            <h4 className="fw-bold mb-3 text-success">
              <People className="me-2" />
              Datos Institucionales
            </h4>
            <Row>
              <Col md={6}>
                <p className="mb-1">
                  <strong>Director(a):</strong> {infoInstitucional.director}
                </p>
                <p className="mb-0">
                  <strong>Ubicación:</strong> {infoInstitucional.ubicacion}
                </p>
              </Col>
              <Col md={6}>
                <p className="mb-1">
                  <strong>Año de vigencia:</strong> {infoInstitucional.anio_vigencia}
                </p>
                <p className="mb-0">
                  <strong>Grados atendidos:</strong> {infoInstitucional.grados_atendidos}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Barra de búsqueda y filtros */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar documentos por nombre, código o etiqueta..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                />
                {terminoBusqueda && (
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setTerminoBusqueda("")}
                  >
                    <X />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="todos">📁 Todos los tipos</option>
                <option value="PDF">📄 PDF</option>
                <option value="WORD">📝 Word</option>
                <option value="EXCEL">📊 Excel</option>
                <option value="POWERPOINT">📽️ PowerPoint</option>
              </Form.Select>
            </Col>
            <Col md={2} className="text-center">
              <Badge bg="primary" className="w-100 p-2">
                {documentosFiltrados.length} resultados
              </Badge>
            </Col>
          </Row>

          {/* Filtro por etiquetas */}
          {obtenerTodasEtiquetas().length > 0 && (
            <div className="mt-3">
              <small className="text-muted d-block mb-2">
                <Tag className="me-1" size={14} />
                Filtrar por etiqueta:
              </small>
              <div className="d-flex flex-wrap gap-2">
                <Badge
                  bg={etiquetaSeleccionada === null ? "primary" : "secondary"}
                  className="cursor-pointer"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setEtiquetaSeleccionada(null)}
                >
                  Todas
                </Badge>
                {obtenerTodasEtiquetas().map((etiqueta, idx) => (
                  <Badge
                    key={idx}
                    bg={etiquetaSeleccionada === etiqueta ? "primary" : "secondary"}
                    className="cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setEtiquetaSeleccionada(etiqueta)}
                  >
                    {etiqueta}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Lista de documentos */}
      <section className="mb-5">
        <h3 className="mb-4 fw-bold text-uppercase text-primary">
          <CheckCircle className="me-2" />
          Documentos Oficiales Vigentes
        </h3>

        {documentosFiltrados.length === 0 ? (
          <Alert variant="info">
            {terminoBusqueda || filtroTipo !== "todos" || etiquetaSeleccionada
              ? "No se encontraron documentos con los filtros aplicados. Intente con otros criterios de búsqueda."
              : "No hay documentos de gestión disponibles en este momento."}
          </Alert>
        ) : (
          <Row xs={1} md={2} lg={2} className="g-4">
            {documentosFiltrados.map((doc, idx) => (
              <Col key={doc.id} data-aos="fade-up" data-aos-delay={idx * 100}>
                <Card className="h-100 shadow-sm border-0 documento-card">
                  <Card.Body className="d-flex flex-column">
                    {/* Encabezado de la card */}
                    <div className="d-flex align-items-start mb-3">
                      <div
                        className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle me-3"
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: doc.color,
                          color: "white",
                        }}
                      >
                        {getIconComponent(doc.icono)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h5 className="fw-bold mb-0">{doc.nombre}</h5>
                          <div 
                            className="ms-2 p-2 rounded"
                            style={{ backgroundColor: getColorTipo(doc.tipo_archivo) + '20' }}
                          >
                            {getIconoArchivo(doc.tipo_archivo)}
                          </div>
                        </div>
                        <p className="text-muted small mb-2">{doc.descripcion}</p>
                        
                        {/* Información adicional */}
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <Badge bg="secondary">{doc.codigo}</Badge>
                          <Badge 
                            style={{ backgroundColor: getColorTipo(doc.tipo_archivo) }}
                          >
                            {doc.tipo_archivo}
                          </Badge>
                          {doc.tamanio && (
                            <Badge bg="light" text="dark">{doc.tamanio}</Badge>
                          )}
                        </div>

                        {/* Etiquetas */}
                        {doc.etiquetas && doc.etiquetas.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {doc.etiquetas.map((tag, tagIdx) => (
                              <Badge 
                                key={tagIdx} 
                                bg="info" 
                                className="small"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setEtiquetaSeleccionada(tag)}
                              >
                                <Tag size={10} className="me-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Estadísticas */}
                        {(doc.descargas > 0 || doc.vistas > 0) && (
                          <div className="mt-2">
                            <small className="text-muted">
                              {doc.vistas > 0 && (
                                <>
                                  <Eye size={12} className="me-1" />
                                  {doc.vistas} vistas
                                </>
                              )}
                              {doc.vistas > 0 && doc.descargas > 0 && " • "}
                              {doc.descargas > 0 && (
                                <>
                                  <Download size={12} className="me-1" />
                                  {doc.descargas} descargas
                                </>
                              )}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-auto d-flex gap-2">
                      {doc.tipo_archivo === 'PDF' ? (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="flex-grow-1"
                          onClick={() => handleOpenPdf(doc)}
                        >
                          <Eye className="me-1" /> Ver
                        </Button>
                      ) : (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="flex-grow-1"
                          disabled
                        >
                          <Eye className="me-1" /> Solo descarga
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        as="a"
                        href={doc.archivo}
                        download
                        onClick={() => handleDescargar(doc)}
                      >
                        <Download className="me-1" /> Descargar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </section>

      {/* Nota informativa */}
      <Card className="text-center shadow-sm border-0">
        <Card.Body>
          <FileText size={48} className="text-primary mb-2" />
          <h5 className="fw-bold">Formatos disponibles</h5>
          <p className="mb-3 text-muted">
            Los documentos están disponibles en diferentes formatos para facilitar su acceso y uso.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <div>
              <FileEarmarkPdf size={24} className="text-danger" />
              <small className="d-block">PDF</small>
            </div>
            <div>
              <FileEarmarkWord size={24} className="text-primary" />
              <small className="d-block">Word</small>
            </div>
            <div>
              <FileEarmarkExcel size={24} className="text-success" />
              <small className="d-block">Excel</small>
            </div>
            <div>
              <FileEarmarkPpt size={24} className="text-warning" />
              <small className="d-block">PowerPoint</small>
            </div>
          </div>
          <p className="mb-0 text-muted small mt-3">
            Todos los documentos están actualizados al año escolar{" "}
            {infoInstitucional?.anio_vigencia || new Date().getFullYear()} y son de
            acceso público para la comunidad educativa.
          </p>
        </Card.Body>
      </Card>

      {/* Modal para visualizar PDF */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="xl"
        backdrop="static"
        className="pdf-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            {documentoActual && getIconoArchivo(documentoActual.tipo_archivo)}
            {documentoActual?.nombre || "Documento de Gestión"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex align-items-center justify-content-center p-3 bg-light">
          {isLoadingPdf ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Cargando documento...</p>
            </div>
          ) : pdfUrl && documentoActual?.tipo_archivo === 'PDF' ? (
            <iframe
              src={pdfUrl}
              title="Documento PDF"
              width="100%"
              height="700px"
              style={{ border: "none", borderRadius: "8px" }}
            />
          ) : (
            <Alert variant="warning" className="text-center">
              <p>Este tipo de documento no se puede visualizar directamente.</p>
              <Button
                variant="primary"
                as="a"
                href={pdfUrl}
                download
                onClick={() => documentoActual && handleDescargar(documentoActual)}
              >
                <Download className="me-1" />
                Descargar Documento
              </Button>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          {documentoActual && (
            <>
              <div className="me-auto">
                <Badge bg="info">{documentoActual.tipo_archivo}</Badge>
                {documentoActual.tamanio && (
                  <Badge bg="secondary" className="ms-1">{documentoActual.tamanio}</Badge>
                )}
              </div>
              <Button
                variant="primary"
                as="a"
                href={pdfUrl}
                download
                disabled={!pdfUrl}
                onClick={() => handleDescargar(documentoActual)}
              >
                <Download className="me-1" />
                Descargar
              </Button>
            </>
          )}
          <Button variant="outline-primary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Pie de página */}
      <footer className="text-center mt-5 pt-4 border-top">
        <p className="text-muted small">
          © {new Date().getFullYear()}{" "}
          {infoInstitucional?.nombre || "Institución Educativa"} –{" "}
          {infoInstitucional?.ubicacion || ""}
        </p>
      </footer>
    </Container>
  );
};

export default DocumentosGestion;