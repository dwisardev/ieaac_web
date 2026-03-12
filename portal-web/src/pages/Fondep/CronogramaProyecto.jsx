// src/pages/fondep/CronogramaProyecto.jsx

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { 
  CheckCircleFill, 
  ExclamationTriangleFill, 
  PeopleFill, 
  FileEarmarkText,
  ClockFill,
  ArrowRepeat
} from "react-bootstrap-icons";

import "../../assets/css/pages/CronogramaProyecto.css";

// Servicios
import { 
  obtenerCronograma, 
  obtenerEstadisticasCronograma 
} from "../../services/cronogramaService";

const CronogramaProyecto = () => {
  // ============================================
  // ESTADO
  // ============================================
  const [cronograma, setCronograma] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    cargarDatos();
  }, []);

  // ============================================
  // FUNCIONES
  // ============================================
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cronogramaData, estadisticasData] = await Promise.all([
        obtenerCronograma(),
        obtenerEstadisticasCronograma()
      ]);
      
      setCronograma(cronogramaData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error('Error al cargar cronograma:', err);
      setError('No se pudo cargar el cronograma. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'completado':
        return <CheckCircleFill />;
      case 'en_progreso':
        return <ArrowRepeat />;
      case 'pendiente':
      default:
        return <ExclamationTriangleFill />;
    }
  };

  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case 'completado':
        return 'status-completed';
      case 'en_progreso':
        return 'status-in-progress';
      case 'pendiente':
      default:
        return 'status-pending';
    }
  };

  // ============================================
  // RENDERIZADO CONDICIONAL
  // ============================================
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando cronograma...</p>
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
    <Container className="py-5 cronograma-container">
      {/* ENCABEZADO */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">
          Cronograma de Actividades FONDEP
        </h1>
        <p className="text-muted lead">
          Seguimiento mensual del proyecto: "Estrategias creativas e interculturales para mejorar las competencias comunicativas"
        </p>

        {/* ESTADÍSTICAS */}
        {estadisticas && (
          <div className="mt-4">
            <Row className="justify-content-center g-3">
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-primary">{estadisticas.totalActividades}</h3>
                  <small className="text-muted">Total actividades</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-success">{estadisticas.completadas}</h3>
                  <small className="text-muted">Completadas</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-warning">{estadisticas.enProgreso}</h3>
                  <small className="text-muted">En progreso</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 bg-light rounded">
                  <h3 className="fw-bold mb-0 text-info">{estadisticas.porcentajeCompletado}%</h3>
                  <small className="text-muted">Avance total</small>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* CRONOGRAMA POR MESES */}
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {cronograma.map((mesData, index) => (
          <Col key={mesData.id}>
            <Card className="cronograma-month-card h-100">
              <div className="cronograma-month-header">
                <ClockFill className="me-2" />
                {mesData.mes}
              </div>
              <div className="p-0">
                {mesData.actividades.map((act, idx) => (
                  <div
                    key={act.id}
                    className="cronograma-activity d-flex align-items-start"
                  >
                    <span className={`icon-status ${obtenerClaseEstado(act.estado)}`}>
                      {obtenerIconoEstado(act.estado)}
                    </span>
                    <div className="flex-grow-1">
                      <div className="activity-title">{act.titulo}</div>
                      <div className="activity-responsables">
                        <PeopleFill size={14} /> {act.responsables}
                      </div>
                      <div className="progress-wrapper">
                        <div className="progress">
                          <div
                            className={`progress-bar ${
                              act.estado === 'completado' ? 'bg-success' :
                              act.estado === 'en_progreso' ? 'bg-warning' : ''
                            }`}
                            style={{ width: `${act.progreso}%` }}
                          ></div>
                        </div>
                        <span
                          className={`progress-text ${
                            act.estado === 'pendiente' ? 'pending' : ''
                          }`}
                        >
                          {act.conteo ? act.conteo : `${act.progreso}%`}
                        </span>
                        {act.evidencia && (
                          <FileEarmarkText
                            className="download-icon"
                            title="Ver evidencia"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CronogramaProyecto;