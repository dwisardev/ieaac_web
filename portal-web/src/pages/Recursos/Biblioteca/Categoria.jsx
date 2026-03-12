// src/pages/biblioteca/Categorias.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaHome, FaBook, FaDownload, FaEye, FaSearch } from "react-icons/fa";
import { Spinner, Alert, Container, Row, Col, Card, Button, Form, InputGroup } from "react-bootstrap";
import { obtenerBibliotecaCompleta, registrarDescarga } from "../../../services/bibliotecaService";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [todosLosLibros, setTodosLosLibros] = useState([]);
  const [librosFiltrados, setLibrosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    filtrarLibros();
  }, [todosLosLibros, busqueda, categoriaFiltro]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const datos = await obtenerBibliotecaCompleta();
      setCategorias(datos);

      // Unir todos los libros en un solo array y ordenarlos alfabéticamente
      const libros = datos.flatMap((cat) =>
        cat.pdfs.map((pdf) => ({
          ...pdf,
          categoria: cat.nombre,
          categoria_id: cat.id,
        }))
      ).sort((a, b) => a.titulo.localeCompare(b.titulo));

      setTodosLosLibros(libros);
      setLibrosFiltrados(libros);
    } catch (err) {
      console.error("Error al cargar biblioteca:", err);
      setError("No se pudieron cargar los libros. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const filtrarLibros = () => {
    let resultado = [...todosLosLibros];

    // Filtrar por categoría
    if (categoriaFiltro !== "Todos") {
      resultado = resultado.filter(libro => libro.categoria === categoriaFiltro);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      resultado = resultado.filter(libro =>
        libro.titulo.toLowerCase().includes(term) ||
        libro.autor?.toLowerCase().includes(term) ||
        libro.categoria.toLowerCase().includes(term)
      );
    }

    setLibrosFiltrados(resultado);
  };

  const handleDescarga = async (libroId, archivoUrl) => {
    // Registrar la descarga en el backend
    if (libroId) {
      try {
        await registrarDescarga(libroId);
      } catch (error) {
        console.error("Error al registrar descarga:", error);
      }
    }
  };

  const obtenerCategoriasUnicas = () => {
    return ["Todos", ...new Set(todosLosLibros.map(l => l.categoria))];
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted">Cargando biblioteca...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header con título y botones */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <h2 className="mb-0">
          <FaBook className="me-2 text-success" />
          Todos los Libros
        </h2>
        <div className="d-flex gap-2">
          <Link to="/recursos/biblioteca-virtual" className="btn btn-outline-primary">
            <FaArrowLeft className="me-1" /> Volver a la Biblioteca
          </Link>
          <Link to="/" className="btn btn-outline-success">
            <FaHome className="me-1" /> Ir al Home
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <Button size="sm" variant="outline-danger" onClick={cargarDatos}>
              Reintentar
            </Button>
          </div>
        </Alert>
      )}

      {/* Estadísticas */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-primary text-white">
            <Card.Body className="text-center">
              <h3 className="mb-0">{todosLosLibros.length}</h3>
              <small>Libros Totales</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-success text-white">
            <Card.Body className="text-center">
              <h3 className="mb-0">{categorias.length}</h3>
              <small>Categorías</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-info text-white">
            <Card.Body className="text-center">
              <h3 className="mb-0">{librosFiltrados.length}</h3>
              <small>Resultados</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por título, autor o categoría..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setBusqueda("")}
                  >
                    Limpiar
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="form-select-lg"
              >
                {obtenerCategoriasUnicas().map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Libros */}
      {librosFiltrados.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FaBook size={48} className="mb-3 text-muted" />
          <h5>No se encontraron libros</h5>
          <p className="mb-0">
            {busqueda || categoriaFiltro !== "Todos"
              ? "Intenta ajustar los filtros de búsqueda"
              : "No hay libros disponibles en este momento"}
          </p>
        </Alert>
      ) : (
        <Row className="g-4">
          {librosFiltrados.map((libro, index) => (
            <Col key={libro.id || index} md={6} lg={4}>
              <Card className="shadow-sm h-100 hover-card" style={{ transition: 'all 0.3s ease' }}>
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <Card.Title className="h5 mb-2" style={{ minHeight: '3rem' }}>
                      {libro.titulo}
                    </Card.Title>
                    {libro.autor && (
                      <Card.Subtitle className="mb-2 text-muted small">
                        <i className="bi bi-person me-1"></i>
                        {libro.autor}
                      </Card.Subtitle>
                    )}
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success">
                        {libro.categoria}
                      </span>
                      {libro.descargas > 0 && (
                        <span className="badge bg-secondary">
                          <FaDownload className="me-1" size={10} />
                          {libro.descargas}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto d-flex gap-2">
                    <a
                      href={libro.archivo || libro.archivo_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-success flex-fill"
                    >
                      <FaEye className="me-1" /> Ver
                    </a>
                    <a
                      href={libro.archivo || libro.archivo_pdf}
                      download
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => handleDescarga(libro.id, libro.archivo || libro.archivo_pdf)}
                    >
                      <FaDownload className="me-1" /> Descargar
                    </a>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Footer informativo */}
      <Card className="border-0 bg-light mt-5">
        <Card.Body className="text-center">
          <p className="text-muted mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Los libros están organizados por categorías para facilitar tu búsqueda. 
            Si no encuentras un libro específico, puedes solicitarlo desde nuestra sección de pedidos.
          </p>
        </Card.Body>
      </Card>

      <style>{`
        .hover-card {
          transform: translateY(0);
          cursor: pointer;
        }
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </Container>
  );
};

export default Categorias;