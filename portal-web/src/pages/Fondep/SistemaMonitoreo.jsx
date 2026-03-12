// src/pages/fondep/SistemaMonitoreo.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  ProgressBar,
  Alert,
  Spinner
} from "react-bootstrap";
import {
  EyeFill,
  Calendar2CheckFill,
  ClipboardDataFill,
  CameraFill,
  FileTextFill,
  PeopleFill,
  BarChartFill,
  ClockFill,
  ExclamationTriangleFill
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/SistemaMonitoreo.css";

// Servicio de monitoreo
import { 
  obtenerDimensionesConIndicadores, 
  obtenerEstadisticasGenerales 
} from "../../services/monitoreoService";

// ============================================
// MAPEO DE ICONOS (Bootstrap Icons)
// ============================================
const ICON_MAP = {
  BarChartFill: <BarChartFill size={32} className="text-primary" />,
  PeopleFill: <PeopleFill size={32} className="text-success" />,
  ClipboardDataFill: <ClipboardDataFill size={32} className="text-purple" />
};

const SistemaMonitoreo = () => {
  // ============================================
  // ESTADO DEL COMPONENTE
  // ============================================
  const [dimensiones, setDimensiones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
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
      
      // Cargar datos en paralelo
      const [dimensionesData, estadisticasData] = await Promise.all([
        obtenerDimensionesConIndicadores(),
        obtenerEstadisticasGenerales()
      ]);
      
      setDimensiones(dimensionesData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error('Error al cargar datos de monitoreo:', err);
      setError('No se pudieron cargar los datos del sistema de monitoreo. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDERIZADO CONDICIONAL
  // ============================================
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando sistema de monitoreo...</p>
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
    <Container className="py-5 monitoreo-sistema-container">
      {/* ENCABEZADO */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">
          <EyeFill className="me-2" />
          Sistema de Monitoreo y Evaluación
        </h1>
        <p className="text-muted lead">
          Seguimiento riguroso, participativo y con evidencias concretas para garantizar el impacto del proyecto
        </p>
        
        {/* ESTADÍSTICAS GENERALES */}
        {estadisticas && (
          <div className="mt-4">
            <Row className="justify-content-center g-3">
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-primary">{estadisticas.totalIndicadores}</h3>
                  <small className="text-muted">Indicadores</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-success">{estadisticas.progresoPromedio}%</h3>
                  <small className="text-muted">Progreso promedio</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-info">{estadisticas.indicadoresCompletados}</h3>
                  <small className="text-muted">Completados</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-warning">{estadisticas.dimensiones}</h3>
                  <small className="text-muted">Dimensiones</small>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* DIMENSIONES E INDICADORES */}
      {dimensiones.map((dim, idx) => (
        <section key={dim.id} className="mb-5" data-aos="fade-up">
          <div className="d-flex align-items-center mb-4">
            {ICON_MAP[dim.icono] || <ClipboardDataFill size={32} />}
            <h3 className="mb-0 ms-2 fw-bold" style={{ color: dim.color }}>
              {dim.nombre}
            </h3>
            <Badge bg="secondary" className="ms-3">
              {dim.indicadores?.length || 0} indicadores
            </Badge>
          </div>

          <Row xs={1} md={2} lg={3} className="g-4">
            {dim.indicadores && dim.indicadores.map((ind, i) => (
              <Col key={ind.id} data-aos="zoom-in" data-aos-delay={i * 100}>
                <Card className="h-100 shadow-sm border-0 monitoreo-card">
                  <Card.Body>
                    <h6 className="fw-bold mb-2">{ind.competencia}</h6>

                    {/* BARRA DE PROGRESO */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span>Actual: {ind.actual}%</span>
                        <span>Meta: {ind.meta}%</span>
                      </div>
                      <div style={{ position: "relative" }}>
                        <ProgressBar
                          now={ind.actual}
                          variant={ind.actual >= ind.meta ? "success" : "primary"}
                          style={{ height: "10px" }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: `${ind.meta}%`,
                            height: "10px",
                            border: `2px dashed ${dim.color}`,
                            backgroundColor: "transparent",
                            pointerEvents: "none"
                          }}
                        />
                      </div>
                    </div>

                    {/* MOMENTOS DE MONITOREO */}
                    <div className="mb-3">
                      <small className="text-muted d-flex align-items-center mb-1">
                        <Calendar2CheckFill size={14} className="me-1" />
                        <strong>Momentos:</strong>
                      </small>
                      <div className="d-flex flex-wrap gap-1">
                        {ind.momentos && ind.momentos.map((mes, m) => (
                          <Badge bg="light" text="dark" key={m} className="px-2 py-1 small">
                            {mes}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* EVIDENCIAS */}
                    <div>
                      <small className="text-muted d-flex align-items-center mb-1">
                        <CameraFill size={14} className="me-1" />
                        <strong>Evidencias:</strong>
                      </small>
                      <ul className="small text-muted mb-0" style={{ paddingLeft: "1.2rem" }}>
                        {ind.evidencias && ind.evidencias.map((ev, e) => (
                          <li key={e}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      ))}

      {/* SECCIÓN INFORMATIVA */}
      <div className="mt-5 p-4 rounded-3 bg-light text-center">
        <h3 className="fw-bold mb-3">
          <ClockFill className="me-2" />
          ¿Cómo se lleva el monitoreo?
        </h3>
        <Row className="justify-content-center text-start">
          <Col md={4} className="mb-3 mb-md-0">
            <div className="d-flex align-items-start">
              <FileTextFill size={28} className="text-primary me-2 mt-1" />
              <div>
                <h5 className="fw-semibold">Instrumentos validados</h5>
                <p className="small text-muted">
                  Pruebas diagnósticas, rúbricas, fichas de observación y diarios de campo.
                </p>
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <div className="d-flex align-items-start">
              <PeopleFill size={28} className="text-success me-2 mt-1" />
              <div>
                <h5 className="fw-semibold">Participación colectiva</h5>
                <p className="small text-muted">
                  Docentes, estudiantes, familias y UGEL participan en la evaluación.
                </p>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="d-flex align-items-start">
              <CameraFill size={28} className="text-purple me-2 mt-1" />
              <div>
                <h5 className="fw-semibold">Evidencias múltiples</h5>
                <p className="small text-muted">
                  Fotos, videos, actas, portafolios, boletines y producciones estudiantiles.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default SistemaMonitoreo;