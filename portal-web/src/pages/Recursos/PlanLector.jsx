// src/components/PlanLector2025.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Modal,
  Alert,
} from "react-bootstrap";
import {
  BookHalf,
  CalendarCheck,
  FileEarmarkPdf,
  Person,
  People,
  Award,
  CheckCircle,
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/PlanLector.css";

// Servicio
import { obtenerPlanLectorCompleto } from "../../services/planLectorService";

const PlanLector2025 = () => {
  // Estados
  const [configuracion, setConfiguracion] = useState(null);
  const [metas, setMetas] = useState([]);
  const [cronograma, setCronograma] = useState([]);
  const [librosPorGrado, setLibrosPorGrado] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const anioActual = new Date().getFullYear();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const datos = await obtenerPlanLectorCompleto(anioActual);

      setConfiguracion(datos.configuracion || {});
      setMetas(datos.metas || []);
      setCronograma(datos.cronograma || []);
      setLibrosPorGrado(datos.librosPorGrado || []);
    } catch (err) {
      console.error("Error al cargar Plan Lector:", err);
      setError(
        "No se pudo cargar el Plan Lector. Por favor, intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPdf = (url) => {
    if (url) {
      setIsPdfLoading(true);
      setTimeout(() => {
        setPdfUrl(url);
        setShowModal(true);
        setIsPdfLoading(false);
      }, 300);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPdfUrl("");
  };

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando Plan Lector {anioActual}...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5 plan-lector-container">
      {/* Error Alert */}
      {error && (
        <Alert
          variant="danger"
          className="mb-4"
          dismissible
          onClose={() => setError(null)}
        >
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
          <BookHalf className="me-2" />
          Plan Lector {configuracion?.anio_escolar || anioActual}
        </h1>
        <p className="lead text-muted">
          {configuracion?.lema || "Descubre mundos y amplía tu mente"} – I.E.
          Andrés Avelino Cáceres, Sirenachayocc
        </p>
        {configuracion && (
          <p className="text-muted small">
            Director: {configuracion.director} | Código Modular:{" "}
            {configuracion.codigo_modular} | Año: {configuracion.anio_escolar}
          </p>
        )}
      </div>

      {/* Metas */}
      {metas.length > 0 && (
        <Card className="mb-5 shadow-sm border-0">
          <Card.Body>
            <h4 className="fw-bold mb-3 text-success">
              <CheckCircle className="me-2" />
              Metas del Plan Lector
            </h4>
            <ul className="list-unstyled">
              {metas.map((meta) => (
                <li key={meta.id} className="d-flex align-items-start mb-2">
                  <CheckCircle
                    size={18}
                    className="text-success me-2 mt-1 flex-shrink-0"
                  />
                  <span>{meta.meta}</span>
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      )}

      {/* Cronograma */}
      {cronograma.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-4 fw-bold text-uppercase text-primary">
            <CalendarCheck className="me-2" />
            Cronograma de Actividades {anioActual}
          </h3>
          <Row xs={1} md={2} lg={3} className="g-4">
            {cronograma.map((item, idx) => (
              <Col key={item.id} data-aos="fade-up" data-aos-delay={idx * 50}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Header className="bg-primary text-white text-center">
                    <strong>{item.mes}</strong>
                  </Card.Header>
                  <Card.Body>
                    <ul className="list-group list-group-flush mb-3">
                      {item.actividades.map((act, i) => (
                        <li
                          key={i}
                          className="list-group-item d-flex align-items-start"
                        >
                          <BookHalf
                            size={16}
                            className="text-primary me-2 mt-1"
                          />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                    <small className="text-muted d-flex align-items-center">
                      <People className="me-1" size={14} /> {item.responsable}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      )}

      {/* Libros por grado */}
      {librosPorGrado.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-4 fw-bold text-uppercase text-primary">
            <FileEarmarkPdf className="me-2" />
            Obras Literarias por Grado
          </h3>
          {librosPorGrado.map((grado, idx) => (
            <div
              key={grado.grado_id || idx}
              className="mb-4"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <h5 className="fw-bold mb-3">
                <Badge bg="info" text="dark">
                  <Person className="me-1" /> {grado.grado}
                </Badge>
              </h5>
              <Row xs={1} md={2} lg={3} className="g-3">
                {grado.obras.map((libro) => (
                  <Col key={libro.id}>
                    <Card className="h-100 shadow-sm border-0 libro-card">
                      <Card.Body className="d-flex flex-column">
                        <h6 className="card-title fw-bold">{libro.titulo}</h6>
                        <p className="text-muted small mb-2">
                          <Person size={14} className="me-1" /> {libro.autor}
                        </p>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="mt-auto d-flex align-items-center justify-content-center"
                          onClick={() => handleOpenPdf(libro.archivo)}
                        >
                          <FileEarmarkPdf className="me-1" /> Leer PDF
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </section>
      )}

      {/* Mensaje si no hay datos */}
      {!isLoading &&
        metas.length === 0 &&
        cronograma.length === 0 &&
        librosPorGrado.length === 0 && (
          <Alert variant="info" className="text-center">
            <BookHalf size={48} className="mb-3" />
            <h5>No hay información disponible</h5>
            <p className="mb-0">
              El Plan Lector para el año {anioActual} aún no ha sido cargado.
            </p>
          </Alert>
        )}

      {/* Premios */}
      <Card className="text-center shadow-sm border-0">
        <Card.Body>
          <Award size={48} className="text-warning mb-2" />
          <h5 className="fw-bold">Premios</h5>
          <p className="mb-0">
            Se otorgarán premios en cada concurso dentro de la IE, así como por
            participación comunal y logros en comprensión lectora.
          </p>
        </Card.Body>
      </Card>

      {/* Modal para PDF */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="xl"
        backdrop="static"
        className="pdf-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Visualización de Libro</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex align-items-center justify-content-center p-3 bg-light">
          {isPdfLoading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Cargando PDF...</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Libro PDF"
              width="100%"
              height="700px"
              style={{ border: "none", borderRadius: "8px" }}
            />
          ) : (
            <p className="text-muted">No se pudo cargar el documento.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-primary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Pie de página */}
      <footer className="text-center mt-5 pt-4 border-top">
        <p className="text-muted small">
          © {anioActual} Institución Educativa Andrés Avelino Cáceres –
          Sirenachayocc
        </p>
      </footer>
    </Container>
  );
};

export default PlanLector2025;