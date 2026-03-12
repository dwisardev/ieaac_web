// src/pages/ComunicadosPage.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import { comunicadosService } from '../../services/comunicadosService';

export default function ComunicadosPage() {
  const [comunicados, setComunicados] = useState([]);
  const [comunicadosFiltrados, setComunicadosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipoActivo, setTipoActivo] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [comunicadoSeleccionado, setComunicadoSeleccionado] = useState(null);

  const tipos = ['Todos', 'Académico', 'Administrativo', 'General'];

  useEffect(() => {
    cargarComunicados();
  }, []);

  useEffect(() => {
    filtrarComunicados();
  }, [comunicados, tipoActivo, busqueda]);

  const cargarComunicados = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await comunicadosService.getAll();
      setComunicados(data.sort((a, b) => 
        new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)
      ));
    } catch (err) {
      console.error('Error al cargar comunicados:', err);
      setError('No se pudieron cargar los comunicados. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const filtrarComunicados = () => {
    let resultado = [...comunicados];

    if (tipoActivo !== 'Todos') {
      resultado = resultado.filter(c => c.tipo === tipoActivo);
    }

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      resultado = resultado.filter(c =>
        c.titulo.toLowerCase().includes(term) ||
        c.contenido?.toLowerCase().includes(term)
      );
    }

    setComunicadosFiltrados(resultado);
  };

  const abrirModal = (comunicado) => {
    setComunicadoSeleccionado(comunicado);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setComunicadoSeleccionado(null);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      'Académico': 'primary',
      'Administrativo': 'warning',
      'General': 'info'
    };
    return badges[tipo] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" variant="warning" style={{ width: '3rem', height: '3rem' }} />
          <p className="text-muted mt-3">Cargando comunicados...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="comunicados-page" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #fff8e1 0%, #ffffff 100%)' }}>
      {/* Header */}
      <div className="bg-warning text-dark py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-3">
                <i className="bi bi-megaphone-fill me-3"></i>
                Comunicados Oficiales
              </h1>
              <p className="lead mb-0">
                Información importante de nuestra institución educativa
              </p>
            </Col>
            <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
              <div className="bg-white text-warning rounded-3 p-3 d-inline-block shadow-sm">
                <div className="fs-1 fw-bold">{comunicados.length}</div>
                <small className="text-dark">Comunicados Activos</small>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <span>{error}</span>
              <Button size="sm" variant="outline-danger" onClick={cargarComunicados}>
                Reintentar
              </Button>
            </div>
          </Alert>
        )}

        {/* Filtros */}
        <Row className="mb-5">
          <Col lg={4} className="mb-3 mb-lg-0">
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Buscar comunicados..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ boxShadow: 'none' }}
              />
            </div>
          </Col>

          <Col lg={8}>
            <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
              {tipos.map(tipo => (
                <Button
                  key={tipo}
                  variant={tipoActivo === tipo ? 'warning' : 'outline-warning'}
                  className="rounded-pill px-4"
                  onClick={() => setTipoActivo(tipo)}
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {tipo}
                </Button>
              ))}
            </div>
          </Col>
        </Row>

        {/* Resultados */}
        {comunicadosFiltrados.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox display-1 text-muted"></i>
            <h3 className="mt-3 text-muted">No se encontraron comunicados</h3>
            <p className="text-muted">Intenta con otros términos de búsqueda o tipo</p>
          </div>
        ) : (
          <Row className="g-4">
            {comunicadosFiltrados.map((comunicado) => (
              <Col key={comunicado.id} md={6} lg={4}>
                <Card 
                  className="h-100 border-0 shadow-sm hover-card"
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => abrirModal(comunicado)}
                >
                  {comunicado.imagen && (
                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={comunicado.imagen}
                        alt={comunicado.titulo}
                        className="card-img-top"
                        style={{ 
                          height: '100%', 
                          width: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <Badge 
                        bg={getTipoBadge(comunicado.tipo)} 
                        className="position-absolute top-0 start-0 m-3"
                      >
                        {comunicado.tipo}
                      </Badge>
                      {comunicado.destacado && (
                        <Badge bg="danger" className="position-absolute top-0 end-0 m-3">
                          <i className="bi bi-star-fill"></i> Importante
                        </Badge>
                      )}
                    </div>
                  )}
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fw-bold mb-3" style={{ minHeight: '3rem' }}>
                      {comunicado.titulo}
                    </Card.Title>
                    <Card.Text className="text-muted flex-grow-1" style={{ fontSize: '0.95rem' }}>
                      {comunicado.contenido?.substring(0, 120)}
                      {comunicado.contenido?.length > 120 && '...'}
                    </Card.Text>
                    <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top">
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatearFecha(comunicado.fecha_publicacion)}
                      </small>
                      {comunicado.archivo_pdf && (
                        <Badge bg="danger">
                          <i className="bi bi-file-pdf"></i> PDF
                        </Badge>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Modal */}
      <Modal 
        show={showModal} 
        onHide={cerrarModal}
        size="lg"
        centered
        scrollable
      >
        {comunicadoSeleccionado && (
          <>
            <Modal.Header closeButton className="bg-warning text-dark">
              <Modal.Title className="fw-bold">
                <i className="bi bi-megaphone me-2"></i>
                {comunicadoSeleccionado.titulo}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
              {comunicadoSeleccionado.imagen && (
                <img
                  src={comunicadoSeleccionado.imagen}
                  alt={comunicadoSeleccionado.titulo}
                  className="img-fluid w-100"
                  style={{ maxHeight: '50vh', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="p-4">
                <div className="d-flex gap-2 mb-3">
                  <Badge bg={getTipoBadge(comunicadoSeleccionado.tipo)}>
                    {comunicadoSeleccionado.tipo}
                  </Badge>
                  <Badge bg="secondary">
                    <i className="bi bi-calendar3 me-1"></i>
                    {formatearFecha(comunicadoSeleccionado.fecha_publicacion)}
                  </Badge>
                  {comunicadoSeleccionado.destacado && (
                    <Badge bg="danger">
                      <i className="bi bi-star-fill me-1"></i>
                      Importante
                    </Badge>
                  )}
                </div>
                <div 
                  className="comunicado-contenido" 
                  style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}
                >
                  {comunicadoSeleccionado.contenido}
                </div>
                {comunicadoSeleccionado.archivo_pdf && (
                  <div className="mt-4">
                    <a
                      href={comunicadoSeleccionado.archivo_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-danger"
                    >
                      <i className="bi bi-file-pdf me-2"></i>
                      Descargar PDF
                    </a>
                  </div>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer className="bg-light">
              <Button variant="secondary" className="rounded-pill px-4" onClick={cerrarModal}>
                Cerrar
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <style>{`
        .hover-card {
          transform: translateY(0);
        }
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
        }
        .hover-card:hover img {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}