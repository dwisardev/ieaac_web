// src/components/EstrategiasProyecto.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ProgressBar,
  Alert,
  Spinner
} from "react-bootstrap";
import {
  LightbulbFill,
  PeopleFill,
  BookHalf,
  GearFill,
  BarChartFill,
  ChatSquareTextFill,
  CameraVideoFill,
  FileEarmarkTextFill,
  ExclamationTriangleFill
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/EstrategiasProyecto.css";

// Servicios
import { 
  obtenerEstrategias, 
  calcularImpactoTotal 
} from "../../services/estrategiasService";

// ============================================
// MAPEO DE ICONOS
// ============================================
const ICON_MAP = {
  LightbulbFill: <LightbulbFill size={32} />,
  PeopleFill: <PeopleFill size={32} />,
  GearFill: <GearFill size={32} />,
  BarChartFill: <BarChartFill size={32} />,
  ChatSquareTextFill: <ChatSquareTextFill size={32} />
};

const EstrategiasProyecto = () => {
  // ============================================
  // ESTADO
  // ============================================
  const [estrategias, setEstrategias] = useState([]);
  const [impactoTotal, setImpactoTotal] = useState(null);
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
      
      const [estrategiasData, impactoData] = await Promise.all([
        obtenerEstrategias(),
        calcularImpactoTotal()
      ]);
      
      setEstrategias(estrategiasData);
      setImpactoTotal(impactoData);
    } catch (err) {
      console.error('Error al cargar estrategias:', err);
      setError('No se pudieron cargar las estrategias. Por favor, intente nuevamente.');
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
        <p className="mt-3 text-muted">Cargando estrategias...</p>
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
    <Container className="py-5 estrategias-container">
      {/* ENCABEZADO */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">
          <LightbulbFill className="me-2" />
          Estrategias del Proyecto FONDEP
        </h1>
        <p className="text-muted lead">
          Enfoque innovador, intercultural y participativo para transformar las prácticas pedagógicas
          en la I.E. "Andrés Avelino Cáceres"
        </p>

        {/* IMPACTO TOTAL */}
        {impactoTotal && (
          <div className="mt-4">
            <Row className="justify-content-center g-3">
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-success">{impactoTotal.aprendizaje}%</h3>
                  <small className="text-muted">Impacto en Aprendizaje</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-warning">{impactoTotal.docencia}%</h3>
                  <small className="text-muted">Impacto en Docencia</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-primary">{impactoTotal.gestion}%</h3>
                  <small className="text-muted">Impacto en Gestión</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-info">{impactoTotal.totalEstrategias}</h3>
                  <small className="text-muted">Fases Implementadas</small>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* ESTRATEGIAS */}
      <Row className="g-4">
        {estrategias.map((estrat, idx) => (
          <Col key={estrat.id} md={6} lg={4} data-aos="fade-up" data-aos-delay={idx * 100}>
            <Card className="h-100 shadow-sm border-0 estrategia-card">
              <Card.Body className="d-flex flex-column">
                <div className="text-center mb-3">
                  <div style={{ color: estrat.color }}>
                    {ICON_MAP[estrat.icono] || <GearFill size={32} />}
                  </div>
                  <h5 className="mt-2 fw-bold">{estrat.fase}</h5>
                </div>

                <p className="text-muted small flex-grow-1">{estrat.descripcion}</p>

                <div className="mt-3">
                  <h6 className="fw-semibold mb-2">Beneficios para la institución:</h6>
                  <ul className="small text-muted mb-3">
                    {estrat.beneficios.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  <h6 className="fw-semibold mb-2">Impacto estimado:</h6>
                  <div className="small mb-1">
                    <div className="d-flex justify-content-between">
                      <span>Aprendizaje</span>
                      <span>{estrat.impacto.aprendizaje}%</span>
                    </div>
                    <ProgressBar
                      now={estrat.impacto.aprendizaje}
                      variant="success"
                      className="mb-2"
                      style={{ height: "8px" }}
                    />
                    <div className="d-flex justify-content-between">
                      <span>Docencia</span>
                      <span>{estrat.impacto.docencia}%</span>
                    </div>
                    <ProgressBar
                      now={estrat.impacto.docencia}
                      variant="warning"
                      className="mb-2"
                      style={{ height: "8px" }}
                    />
                    <div className="d-flex justify-content-between">
                      <span>Gestión</span>
                      <span>{estrat.impacto.gestion}%</span>
                    </div>
                    <ProgressBar
                      now={estrat.impacto.gestion}
                      variant="primary"
                      style={{ height: "8px" }}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* SECCIÓN DE TRANSFORMACIÓN */}
      <div className="mt-5 p-4 rounded-3 bg-gradient-primary text-white text-center">
        <h3 className="fw-bold mb-3">
          <BookHalf className="me-2" />
          ¿Cómo transformará esto a nuestra institución?
        </h3>
        <Row className="justify-content-center">
          <Col md={4} className="mb-3 mb-md-0">
            <CameraVideoFill size={48} className="mb-2" />
            <h5>Mejora del 65% en competencias comunicativas</h5>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <FileEarmarkTextFill size={48} className="mb-2" />
            <h5>Producción de materiales pedagógicos bilingües</h5>
          </Col>
          <Col md={4}>
            <PeopleFill size={48} className="mb-2" />
            <h5>Comunidad educativa activa y comprometida</h5>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default EstrategiasProyecto;