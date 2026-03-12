// src/pages/fondep/InformeFinal.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Modal,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FileTextFill,
  BarChartFill,
  PeopleFill,
  BookHalf,
  CameraFill,
  PlayFill,
  CheckCircleFill,
  ArrowUpCircleFill,
  ExclamationTriangleFill
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/InformeFinal.css";

// Servicios
import {
  obtenerInformeCompleto,
  calcularEstadisticasInforme
} from "../../services/informeFinalService";

const InformeFinal = () => {
  // ============================================
  // ESTADO
  // ============================================
  const [informe, setInforme] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, []);

  // ============================================
  // FUNCIONES
  // ============================================
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [informeData, estadisticasData] = await Promise.all([
        obtenerInformeCompleto(),
        calcularEstadisticasInforme()
      ]);
      
      setInforme(informeData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error('Error al cargar informe:', err);
      setError('No se pudo cargar el informe final. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (archivo) => {
    if (archivo?.url) {
      setIsLoadingModal(true);
      setTimeout(() => {
        setModalContent(archivo);
        setShowModal(true);
        setIsLoadingModal(false);
      }, 300);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  // ============================================
  // RENDERIZADO CONDICIONAL
  // ============================================
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando informe final...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <ExclamationTriangleFill size={32} className="mb-2" />
          <p className="mb-0">{error}</p>
          <button 
            className="btn btn-sm btn-outline-danger mt-2" 
            onClick={cargarDatos}
          >
            Reintentar
          </button>
        </Alert>
      </Container>
    );
  }

  // ============================================
  // RENDERIZADO PRINCIPAL
  // ============================================
  return (
    <Container className="py-5 informe-final-container">
      {/* ENCABEZADO */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">
          <FileTextFill className="me-2" />
          Informe Final del Proyecto FONDEP
        </h1>
        <p className="text-muted lead">
          {informe?.metadata?.titulo || "Informe del Proyecto"}
        </p>
        <Badge bg="light" text="dark" className="px-3 py-2">
          Código: {informe?.metadata?.codigo_proyecto || "N/A"}
        </Badge>
      </div>

      {/* RESUMEN EJECUTIVO */}
      <Card className="mb-5 shadow-sm border-0">
        <Card.Body>
          <h4 className="fw-bold mb-3 text-primary">
            <BarChartFill className="me-2" />
            Resumen de logros
          </h4>
          <p>
            El proyecto logró movilizar a toda la comunidad educativa en torno al fortalecimiento de las competencias comunicativas en castellano como segunda lengua. 
            Se implementaron estrategias interculturales, se generaron evidencias pedagógicas y se sentaron las bases para la sostenibilidad de las buenas prácticas.
          </p>
          
          {/* ESTADÍSTICAS DE LOGROS */}
          {informe?.logros && (
            <Row className="mt-3">
              <Col md={3} className="text-center mb-3 mb-md-0">
                <ArrowUpCircleFill size={48} className="text-success mb-2" />
                <h5>+{informe.logros.participacionEstudiantil}% mejora en participación estudiantil</h5>
              </Col>
              <Col md={3} className="text-center mb-3 mb-md-0">
                <PeopleFill size={48} className="text-primary mb-2" />
                <h5>{informe.logros.docentesCapacitados}% de docentes capacitados</h5>
              </Col>
              <Col md={3} className="text-center mb-3 mb-md-0">
                <BookHalf size={48} className="text-purple mb-2" />
                <h5>{informe.logros.productosGenerados} productos pedagógicos generados</h5>
              </Col>
              <Col md={3} className="text-center">
                <PeopleFill size={48} className="text-warning mb-2" />
                <h5>{informe.logros.familiasInvolucradas}% familias involucradas</h5>
              </Col>
            </Row>
          )}

          {/* ESTADÍSTICAS DE INDICADORES */}
          {estadisticas && (
            <div className="mt-4 p-3 bg-light rounded">
              <Row className="text-center">
                <Col xs={6} md={3}>
                  <h4 className="fw-bold text-success">{estadisticas.metasAlcanzadas}</h4>
                  <small className="text-muted">Metas alcanzadas</small>
                </Col>
                <Col xs={6} md={3}>
                  <h4 className="fw-bold text-primary">{estadisticas.totalIndicadores}</h4>
                  <small className="text-muted">Total indicadores</small>
                </Col>
                <Col xs={6} md={3}>
                  <h4 className="fw-bold text-info">{estadisticas.porcentajeMetasAlcanzadas}%</h4>
                  <small className="text-muted">% Cumplimiento</small>
                </Col>
                <Col xs={6} md={3}>
                  <h4 className="fw-bold text-warning">{estadisticas.indicadoresMejora50}</h4>
                  <small className="text-muted">Mejora +50%</small>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* RESULTADOS POR ÁREA */}
      <section className="mb-5">
        <h3 className="mb-4 fw-bold text-uppercase" style={{ color: "#2b2d42" }}>
          <CheckCircleFill className="me-2" />
          Resultados alcanzados vs. punto de partida
        </h3>
        <Row xs={1} md={2} lg={3} className="g-4">
          {informe?.resultados && informe.resultados.map((res, idx) => (
            <Col key={res.id} data-aos="fade-up" data-aos-delay={idx * 50}>
              <Card className="h-100 shadow-sm border-0 informe-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg="light" text="dark" className="px-2 py-1 small">
                      {res.tipo}
                    </Badge>
                    {res.inicioDestacado < res.metaDestacado && (
                      <Badge bg="success" className="px-2 py-1 small">
                        +{res.metaDestacado - res.inicioDestacado}%
                      </Badge>
                    )}
                  </div>
                  <h6 className="fw-bold mb-3">{res.competencia}</h6>

                  {/* NIVEL DESTACADO/ESPERADO */}
                  <div className="mb-3">
                    <div className="small mb-1">Nivel "Destacado / Esperado"</div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Inicial: {res.inicioDestacado}%</span>
                      <span>Meta: {res.metaDestacado}%</span>
                    </div>
                    <div className="progress-wrapper">
                      <div
                        className="progress-bar-initial"
                        style={{ width: `${res.inicioDestacado}%`, backgroundColor: "#e9ecef" }}
                      ></div>
                      <div
                        className="progress-bar-target"
                        style={{ width: `${res.metaDestacado}%`, borderColor: res.color }}
                      ></div>
                    </div>
                  </div>

                  {/* NIVEL EN PROCESO (si aplica) */}
                  {res.metaProceso !== undefined && (
                    <div className="mb-3">
                      <div className="small mb-1">Nivel "En Proceso"</div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>Inicial: {res.inicioProceso}%</span>
                        <span>Meta: {res.metaProceso}%</span>
                      </div>
                      <div className="progress-wrapper">
                        <div
                          className="progress-bar-initial"
                          style={{ width: `${res.inicioProceso}%`, backgroundColor: "#e9ecef" }}
                        ></div>
                        <div
                          className="progress-bar-target"
                          style={{ width: `${res.metaProceso}%`, borderColor: res.color }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* EVIDENCIAS */}
                  {res.evidencias && res.evidencias.length > 0 && (
                    <div className="mt-3">
                      <small className="text-muted d-block mb-1">
                        <CameraFill className="me-1" size={14} /> Evidencias:
                      </small>
                      <div className="d-flex flex-wrap gap-2">
                        {res.evidencias.map((ev, i) => (
                          <div
                            key={i}
                            className="informe-thumb rounded overflow-hidden shadow-sm"
                            onClick={() => handleOpenModal(ev)}
                            style={{ cursor: "pointer" }}
                            title={ev.descripcion || `Evidencia ${i + 1}`}
                          >
                            {ev.tipo === "foto" ? (
                              <img
                                src={ev.url}
                                alt={ev.descripcion || `Evidencia ${i + 1}`}
                                className="w-100 h-100 object-fit-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-100 h-100 bg-dark d-flex align-items-center justify-content-center">
                                <PlayFill size={20} className="text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* FASES DE LA IAPE */}
      <section className="mb-5">
        <h3 className="mb-4 fw-bold text-uppercase" style={{ color: "#2b2d42" }}>
          <PeopleFill className="me-2" />
          Fases del proceso (IAPE)
        </h3>
        <Row className="g-3">
          {informe?.fases && informe.fases.map((fase, idx) => (
            <Col key={fase.id} md={6} lg={4} data-aos="zoom-in">
              <div className="d-flex align-items-start">
                <div
                  className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle me-3"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: fase.completado ? "#10b981" : "#6b7280",
                    color: "white",
                  }}
                >
                  {fase.completado ? <CheckCircleFill size={20} /> : idx + 1}
                </div>
                <div>
                  <h6 className="fw-bold mb-1">{fase.fase}</h6>
                  <p className="small text-muted mb-0">{fase.descripcion}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* MODAL PARA EVIDENCIAS */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
        backdrop="static"
        className="informe-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>{modalContent?.descripcion || "Evidencia"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex align-items-center justify-content-center p-3">
          {isLoadingModal ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Cargando...</p>
            </div>
          ) : modalContent ? (
            modalContent.tipo === "foto" ? (
              <img
                src={modalContent.url}
                alt={modalContent.descripcion || "Evidencia"}
                className="img-fluid rounded shadow"
                style={{ maxHeight: "80vh", objectFit: "contain" }}
              />
            ) : (
              <video
                controls
                className="w-100 rounded shadow"
                style={{ maxHeight: "80vh" }}
              >
                <source src={modalContent.url} type="video/mp4" />
                Tu navegador no soporta este video.
              </video>
            )
          ) : (
            <p className="text-muted">Sin contenido</p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-primary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InformeFinal;