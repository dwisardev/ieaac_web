import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { logrosService } from '../../services/logrosService';

export default function NuestrosLogros() {
  const [logros, setLogros] = useState([]);
  const [logrosFiltrados, setLogrosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [logroSeleccionado, setLogroSeleccionado] = useState(null);

  const categorias = ['Todos', 'Académico', 'Deportivo', 'Cultural', 'Institucional'];

  useEffect(() => {
    AOS.init({ once: true, duration: 800 });
    cargarLogros();
  }, []);

  useEffect(() => {
    filtrarLogros();
  }, [logros, categoriaActiva]);

  const cargarLogros = async () => {
    try {
      setLoading(true);
      const data = await logrosService.getAll();
      setLogros(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtrarLogros = () => {
    if (categoriaActiva === 'Todos') {
      setLogrosFiltrados(logros);
    } else {
      setLogrosFiltrados(logros.filter(l => l.categoria === categoriaActiva));
    }
  };

  const abrirModal = (logro) => {
    setLogroSeleccionado(logro);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setLogroSeleccionado(null);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      'Académico': 'primary',
      'Deportivo': 'success',
      'Cultural': 'info',
      'Institucional': 'warning',
      'Otro': 'secondary'
    };
    return colores[categoria] || 'secondary';
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="text-muted">Cargando logros...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #fffbea 0%, #ffffff 100%)' }}>
      {/* Header */}
      <div className="bg-warning text-dark py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3" data-aos="fade-right">
                <i className="bi bi-trophy-fill me-3"></i>
                Nuestros Logros
              </h1>
              <p className="lead mb-0" data-aos="fade-right" data-aos-delay="100">
                Celebramos los éxitos y reconocimientos de nuestra comunidad educativa
              </p>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0" data-aos="fade-left">
              <div className="bg-white text-warning rounded-3 p-3 d-inline-block shadow-sm">
                <div className="fs-1 fw-bold">{logros.length}</div>
                <small className="text-dark">Logros Alcanzados</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Filtros */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {categorias.map(cat => (
                <button
                  key={cat}
                  className={`btn ${categoriaActiva === cat ? 'btn-warning' : 'btn-outline-warning'} rounded-pill px-4`}
                  onClick={() => setCategoriaActiva(cat)}
                  style={{ transition: 'all 0.3s ease' }}
                  data-aos="zoom-in"
                  data-aos-delay={categorias.indexOf(cat) * 50}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline de Logros */}
        {logrosFiltrados.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox display-1 text-muted"></i>
            <h3 className="mt-3 text-muted">No hay logros en esta categoría</h3>
          </div>
        ) : (
          <div className="row g-4">
            {logrosFiltrados.map((logro, index) => (
              <div 
                key={logro.id} 
                className="col-md-6 col-lg-4"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div 
                  className="card h-100 border-0 shadow-sm hover-card"
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => abrirModal(logro)}
                >
                  {logro.imagen && (
                    <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={logro.imagen}
                        alt={logro.titulo}
                        className="card-img-top"
                        style={{ 
                          height: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                      />
                      <span className={`badge bg-${getCategoriaColor(logro.categoria)} position-absolute top-0 start-0 m-3`}>
                        {logro.categoria}
                      </span>
                      {logro.destacado && (
                        <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">
                          <i className="bi bi-star-fill"></i> Destacado
                        </span>
                      )}
                    </div>
                  )}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold mb-3" style={{ minHeight: '3rem' }}>
                      {logro.titulo}
                    </h5>
                    <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.95rem' }}>
                      {logro.descripcion?.substring(0, 120)}
                      {logro.descripcion?.length > 120 && '...'}
                    </p>
                    <div className="mt-3 pt-3 border-top">
                      <small className="text-muted">
                        <i className="bi bi-calendar-check me-1"></i>
                        {formatearFecha(logro.fecha_logro)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && logroSeleccionado && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={cerrarModal}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-trophy me-2"></i>
                  {logroSeleccionado.titulo}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={cerrarModal}
                ></button>
              </div>
              <div className="modal-body p-0">
                {logroSeleccionado.imagen && (
                  <img
                    src={logroSeleccionado.imagen}
                    alt={logroSeleccionado.titulo}
                    className="img-fluid w-100"
                    style={{ maxHeight: '50vh', objectFit: 'contain' }}
                  />
                )}
                <div className="p-4">
                  <div className="d-flex gap-2 mb-3">
                    <span className={`badge bg-${getCategoriaColor(logroSeleccionado.categoria)}`}>
                      {logroSeleccionado.categoria}
                    </span>
                    <span className="badge bg-secondary">
                      <i className="bi bi-calendar-check me-1"></i>
                      {formatearFecha(logroSeleccionado.fecha_logro)}
                    </span>
                  </div>
                  <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                    {logroSeleccionado.descripcion}
                  </p>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button 
                  className="btn btn-secondary rounded-pill px-4" 
                  onClick={cerrarModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-card {
          transform: translateY(0);
        }
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(255, 193, 7, 0.3) !important;
        }
        .hover-card:hover img {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}