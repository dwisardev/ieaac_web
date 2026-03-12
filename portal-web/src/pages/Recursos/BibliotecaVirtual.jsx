// src/pages/Recursos/BibliotecaVirtual.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaSearch,
  FaHome,
  FaArrowLeft,
  FaDownload,
  FaEye,
  FaClipboardList,
} from "react-icons/fa";
import { Spinner, Alert } from "react-bootstrap";
import "../../assets/css/pages/BibliotecaVirtual.css";

// Servicio
import { 
  obtenerBibliotecaCompleta,
  obtenerTodosLibros,
  obtenerEstadisticasBiblioteca,
  registrarDescarga
} from "../../services/bibliotecaService";

const BibliotecaVirtual = () => {
  // Estados
  const [categorias, setCategorias] = useState([]);
  const [todosLibros, setTodosLibros] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriasData, librosData, statsData] = await Promise.all([
        obtenerBibliotecaCompleta(), // ✅ Cambiado para obtener categorías con sus libros
        obtenerTodosLibros(),
        obtenerEstadisticasBiblioteca()
      ]);
      
      setCategorias(categoriasData);
      setTodosLibros(librosData);
      setEstadisticas(statsData);
    } catch (err) {
      console.error('Error al cargar biblioteca:', err);
      setError('No se pudo cargar la biblioteca. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar libros por búsqueda
  const librosFiltrados = todosLibros.filter((libro) =>
    libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    libro.autor?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Manejar descarga
  const handleDescarga = async (libroId) => {
    if (libroId) {
      try {
        await registrarDescarga(libroId);
      } catch (error) {
        console.error("Error al registrar descarga:", error);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="biblioteca-container">
        <div className="container text-center py-5" style={{ marginTop: '120px' }}>
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Cargando biblioteca virtual...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="biblioteca-container">
      <div className="row g-0">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 sidebar">
          <div className="sidebar-header">
            <FaBookOpen size={32} className="icon" />
            <h5 className="mt-2 mb-0">Biblioteca Virtual</h5>
            {estadisticas && (
              <p className="small text-muted mt-2 mb-0">
                {estadisticas.totalLibros} libros disponibles
              </p>
            )}
          </div>

          <nav className="sidebar-nav">
            <ul>
              <li>
                <Link to="/" className="btn btn-home w-100">
                  <FaHome className="me-2" /> Home
                </Link>
              </li>
              <li>
                <Link to="/Pedidos" className="btn btn-pedidos w-100">
                  <FaClipboardList className="me-2" /> Pedidos
                </Link>
              </li>
              <li>
                <Link to="/Categorias" className="btn btn-categorias w-100">
                  <FaBookOpen className="me-2" /> Todos los Libros
                </Link>
              </li>
            </ul>
          </nav>

          <div className="sidebar-footer">
            <Link to="/" className="btn btn-outline-primary w-100">
              <FaArrowLeft className="me-1" /> Volver al inicio
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 main-content">
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={cargarDatos}
                >
                  Reintentar
                </button>
              </div>
            </Alert>
          )}

          {/* Header */}
          <div className="header-section">
            <h1 className="title">Bienvenido a la Biblioteca Virtual</h1>
            <button
              className="btn btn-search"
              onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
            >
              <FaSearch /> Buscar
            </button>
          </div>

          {/* Barra de búsqueda */}
          {mostrarBusqueda && (
            <div className="search-bar mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar libro por título o autor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <small className="text-muted d-block mt-2">
                  {librosFiltrados.length} resultado(s) encontrado(s)
                </small>
              )}
            </div>
          )}

          {/* Resultados de búsqueda */}
          {busqueda ? (
            <div className="results-card">
              <h3 className="section-title">Resultados de búsqueda</h3>
              {librosFiltrados.length > 0 ? (
                <div className="book-list">
                  {librosFiltrados.map((libro) => (
                    <div key={libro.id} className="book-item">
                      <div className="book-info">
                        <h6 className="book-title">{libro.titulo}</h6>
                        {libro.autor && (
                          <span className="book-author text-muted small">
                            por {libro.autor}
                          </span>
                        )}
                        <span className="book-category">{libro.categoria}</span>
                      </div>
                      <div className="book-actions">
                        <a
                          href={libro.archivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-view"
                        >
                          <FaEye /> Ver
                        </a>
                        <a
                          href={libro.archivo}
                          download
                          className="btn btn-download"
                          onClick={() => handleDescarga(libro.id)}
                        >
                          <FaDownload /> Descargar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>No se encontraron libros con ese término de búsqueda.</p>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setBusqueda("")}
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Vista de categorías
            <div className="categories-card">
              <h3 className="section-title">Colecciones por Área</h3>
              <p className="subtitle">
                Explora nuestros materiales educativos organizados por áreas curriculares.
              </p>
              
              {categorias.length === 0 ? (
                <Alert variant="info">
                  No hay categorías disponibles en este momento.
                </Alert>
              ) : (
                <div className="categories-grid">
                  {categorias.map((cat, index) => (
                    <div
                      key={cat.id}
                      className={`category-card ${categoriaActiva === index ? 'active' : ''}`}
                      onClick={() => setCategoriaActiva(categoriaActiva === index ? null : index)}
                    >
                      <h5 className="category-title">{cat.nombre}</h5>
                      <span className="category-count">
                        {cat.pdfs?.length || cat.cantidad || 0} libros
                      </span>
                      {cat.descripcion && (
                        <p className="category-description">{cat.descripcion}</p>
                      )}

                      {/* Lista de libros cuando la categoría está activa */}
                      {categoriaActiva === index && cat.pdfs && cat.pdfs.length > 0 && (
                        <div className="book-list mt-3">
                          {cat.pdfs.map((pdf) => (
                            <div key={pdf.id} className="book-item">
                              <div className="book-info">
                                <h6 className="book-title">{pdf.titulo}</h6>
                                {pdf.autor && (
                                  <span className="book-author text-muted small">
                                    por {pdf.autor}
                                  </span>
                                )}
                              </div>
                              <div className="book-actions">
                                <a
                                  href={pdf.archivo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-view"
                                  title="Ver en nueva pestaña"
                                >
                                  <FaEye /> Ver
                                </a>
                                <a
                                  href={pdf.archivo}
                                  download
                                  className="btn btn-download"
                                  title="Descargar PDF"
                                  onClick={() => handleDescarga(pdf.id)}
                                >
                                  <FaDownload /> Descargar
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Mensaje si no hay libros */}
                      {categoriaActiva === index && (!cat.pdfs || cat.pdfs.length === 0) && (
                        <p className="text-muted small mt-3">
                          No hay libros disponibles en esta categoría.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Link para ver todos los libros */}
              <div className="text-center mt-4">
                <Link to="/Categorias" className="btn btn-primary btn-lg">
                  <FaBookOpen className="me-2" />
                  Ver Todos los Libros ({todosLibros.length})
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BibliotecaVirtual;