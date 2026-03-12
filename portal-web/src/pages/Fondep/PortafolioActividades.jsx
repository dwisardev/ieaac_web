// src/pages/fondep/PortafolioActividades.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Accordion,
  Modal,
  Button,
  Spinner,
  Badge,
  Alert,
} from "react-bootstrap";
import {
  BookFill,
  PeopleFill,
  TrophyFill,
  MortarboardFill,
  Image as ImageIcon,
  PlayFill,
  ChevronDown,
  ExclamationTriangleFill
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/PortafolioActividades.css";

// Servicio
import { 
  obtenerActividadesPorRubro,
  obtenerEstadisticasPortafolio 
} from "../../services/portafolioService";

// ============================================
// CONFIGURACIÓN DE RUBROS
// ============================================
const rubroIcons = [
  <BookFill className="me-2" key={0} />,
  <PeopleFill className="me-2" key={1} />,
  <TrophyFill className="me-2" key={2} />,
  <MortarboardFill className="me-2" key={3} />,
];

const rubroColors = ["#4361ee", "#3f975f", "#f72585", "#7209b7"];

const PortafolioActividades = () => {
  // ============================================
  // ESTADO
  // ============================================
  const [rubros, setRubros] = useState({});
  const [estadisticas, setEstadisticas] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
      
      const [rubrosData, estadisticasData] = await Promise.all([
        obtenerActividadesPorRubro(),
        obtenerEstadisticasPortafolio()
      ]);
      
      setRubros(rubrosData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error('Error al cargar portafolio:', err);
      setError('No se pudo cargar el portafolio de actividades. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (archivo) => {
    if (!archivo?.url) return;
    setIsLoading(true);
    setTimeout(() => {
      setModalContent(archivo);
      setShowModal(true);
      setIsLoading(false);
    }, 300);
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
        <p className="mt-3 text-muted">Cargando portafolio de actividades...</p>
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
    <Container className="py-5 fondep-container">
      {/* ENCABEZADO */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Actividades FONDEP</h1>
        <p className="text-muted lead">
          Experiencias pedagógicas y comunitarias desarrolladas en la I.E. "Andrés Avelino Cáceres"
        </p>

        {/* ESTADÍSTICAS */}
        {estadisticas && (
          <div className="mt-4">
            <Row className="justify-content-center g-3">
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-primary">{estadisticas.totalActividades}</h3>
                  <small className="text-muted">Actividades</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-success">{estadisticas.totalArchivos}</h3>
                  <small className="text-muted">Evidencias</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-warning">{estadisticas.actividadesDestacadas}</h3>
                  <small className="text-muted">Destacadas</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-info">{estadisticas.rubrosActivos}</h3>
                  <small className="text-muted">Rubros activos</small>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* ACCORDION DE RUBROS */}
      <Accordion activeKey={activeKey} onSelect={setActiveKey} flush>
        {Object.entries(rubros).map(([rubro, actividades], index) => (
          <Accordion.Item
            eventKey={index.toString()}
            key={rubro}
            className="mb-4 rounded-3 border-0 shadow-sm"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <Accordion.Header
              className={`px-4 py-3 fw-bold d-flex align-items-center justify-content-between ${
                activeKey === index.toString() ? "bg-white" : "bg-light"
              }`}
              style={{
                borderLeft: `6px solid ${rubroColors[index]}`,
                borderRadius: "8px",
                transition: "all 0.3s ease",
              }}
            >
              <span className="d-flex align-items-center">
                {rubroIcons[index]}
                {rubro}
                <Badge bg="secondary" className="ms-2">{actividades.length}</Badge>
              </span>
              <ChevronDown 
                size={20} 
                className={`ms-2 ${activeKey === index.toString() ? "rotate-180" : ""}`} 
              />
            </Accordion.Header>
            <Accordion.Body className="p-4">
              {actividades.length === 0 ? (
                <div className="text-center py-5">
                  <ImageIcon size={48} className="text-muted mb-3" />
                  <p className="text-muted mb-0">
                    No hay actividades registradas aún en este rubro.
                  </p>
                </div>
              ) : (
                <Row xs={1} className="g-4">
                  {actividades.map((act) => (
                    <Col key={act.id} data-aos="zoom-in" data-aos-delay="100">
                      <Card className="border-0 shadow-sm h-100 fondep-card">
                        <Card.Body className="p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: rubroColors[index],
                                color: "white",
                                fontSize: "1.2rem",
                              }}
                            >
                              {rubroIcons[index]}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <Card.Title className="h5 mb-1">{act.titulo}</Card.Title>
                                {act.destacado && (
                                  <Badge bg="warning" text="dark">Destacada</Badge>
                                )}
                              </div>
                              <Badge bg="secondary" className="mb-2">
                                {act.responsables}
                              </Badge>
                            </div>
                          </div>

                          <Card.Text className="mb-3 text-muted">
                            {act.descripcion}
                          </Card.Text>

                          {/* INFORMACIÓN ADICIONAL */}
                          {act.fecha_realizacion && (
                            <p className="small text-muted mb-2">
                              <strong>Fecha:</strong> {new Date(act.fecha_realizacion).toLocaleDateString('es-PE')}
                            </p>
                          )}

                          {act.resultados && (
                            <div className="mb-3 p-2 bg-light rounded">
                              <small className="text-muted">
                                <strong>Resultados:</strong> {act.resultados}
                              </small>
                            </div>
                          )}

                          {/* GALERÍA DE EVIDENCIAS */}
                          {act.archivos && act.archivos.length > 0 && (
                            <div className="d-flex flex-wrap gap-3 mt-3">
                              {act.archivos.map((archivo, idx) => {
                                if (archivo.tipo === "foto") {
                                  return (
                                    <div
                                      key={idx}
                                      className="fondep-gallery-item rounded overflow-hidden shadow-sm position-relative"
                                      onClick={() => handleOpenModal(archivo)}
                                      role="button"
                                      tabIndex={0}
                                      onKeyPress={(e) => e.key === "Enter" && handleOpenModal(archivo)}
                                      title={archivo.descripcion || `Evidencia ${idx + 1}`}
                                    >
                                      <img
                                        src={archivo.url}
                                        alt={archivo.descripcion || `Evidencia ${idx + 1}`}
                                        className="w-100 h-100 object-fit-cover"
                                        loading="lazy"
                                      />
                                      <div className="fondep-gallery-overlay">
                                        <ImageIcon size={20} className="text-white" />
                                      </div>
                                    </div>
                                  );
                                } else if (archivo.tipo === "video") {
                                  return (
                                    <div
                                      key={idx}
                                      className="fondep-gallery-item rounded overflow-hidden shadow-sm position-relative"
                                      onClick={() => handleOpenModal(archivo)}
                                      role="button"
                                      tabIndex={0}
                                      onKeyPress={(e) => e.key === "Enter" && handleOpenModal(archivo)}
                                      title={archivo.descripcion || `Video ${idx + 1}`}
                                    >
                                      <video
                                        className="w-100 h-100 object-fit-cover"
                                        src={archivo.url}
                                        muted
                                        playsInline
                                        preload="metadata"
                                      />
                                      <div className="fondep-gallery-overlay">
                                        <PlayFill size={20} className="text-white" />
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* MODAL PARA VER EVIDENCIAS */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
        backdrop="static"
        className="fondep-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>{modalContent?.descripcion || "Evidencia"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex align-items-center justify-content-center p-3">
          {isLoading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Cargando contenido...</p>
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
                autoPlay={false}
                className="w-100 rounded shadow"
                style={{ maxHeight: "80vh" }}
              >
                <source src={modalContent.url} type="video/mp4" />
                Tu navegador no soporta videos.
              </video>
            )
          ) : (
            <p className="text-muted">Contenido no disponible</p>
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

export default PortafolioActividades;