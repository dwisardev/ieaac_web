import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/Directorio.css";
import { directorioService } from "../../services/directorioService";
import Logodirectorio from "../../assets/img/logo.jpg";

export default function Directorio() {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ once: true, duration: 800 });
    cargarDirectorio();
  }, []);

  const cargarDirectorio = async () => {
    try {
      setLoading(true);
      const data = await directorioService.getAll();
      setPersonal(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar directorio:", err);
      setError("No se pudo cargar el directorio. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', { 
      day: 'numeric', 
      month: 'long'
    });
  };

  if (loading) {
    return (
      <section className="directorio-section py-5">
        <div className="container text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="text-muted">Cargando directorio...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="directorio-section py-5">
        <div className="container">
          <div className="alert alert-warning text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="directorio-section py-4 position-relative">
      <div className="directorio-bg-pattern position-absolute top-0 start-0 w-100 h-100"></div>

      <div className="container">
        {/* Encabezado */}
        <div className="text-center mb-4" data-aos="fade-down">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <img 
              src={Logodirectorio} 
              alt="Logo IES" 
              className="school-logo"
              style={{ height: '80px' }}
            />
            <div className="flex-grow-1 mx-3">
              <h2 className="directorio-title m-0 fw-bold text-primary">
                I.E. ANDRÉS AVELINO CÁCERES
              </h2>
              <h3 className="directorio-subtitle m-0 text-secondary mt-2">
                DIRECTORIO DEL PERSONAL DOCENTE Y ADMINISTRATIVO 2025
              </h3>
            </div>
            <img 
              src={Logodirectorio} 
              alt="Escudo" 
              className="school-logo"
              style={{ height: '80px' }}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive shadow-sm rounded-4 overflow-hidden" data-aos="fade-up">
          <table className="table table-hover align-middle custom-table">
            <thead className="bg-light-blue text-dark">
              <tr>
                <th scope="col" className="fw-semibold">N°</th>
                <th scope="col" className="fw-semibold">APELLIDOS Y NOMBRES</th>
                <th scope="col" className="fw-semibold">AREA / ESPECIALIDAD</th>
                <th scope="col" className="fw-semibold">CARGO</th>
                <th scope="col" className="fw-semibold">F. NACIMIENTO</th>
                <th scope="col" className="fw-semibold">N° CELULAR</th>
                <th scope="col" className="fw-semibold">CORREO ELECTRONICO</th>
                <th scope="col" className="fw-semibold">DIRECCION DOM.</th>
              </tr>
            </thead>
            <tbody>
              {personal.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <i className="bi bi-inbox display-4 text-muted d-block mb-3"></i>
                    <p className="text-muted">No hay personal registrado</p>
                  </td>
                </tr>
              ) : (
                personal.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`align-middle ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="text-center">{index + 1}</td>
                    <td>
                      <div className="name-cell">
                        <div className="last-name">{item.apellidos}</div>
                        <div className="first-name">{item.nombres}</div>
                      </div>
                    </td>
                    <td>{item.area || 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        item.cargo === 'Director' ? 'bg-danger' : 
                        item.cargo === 'Subdirector' ? 'bg-primary' :
                        item.cargo === 'Auxiliar Ed.' ? 'bg-warning text-dark' : 
                        'bg-success'
                      } px-3 py-2`}>
                        {item.cargo}
                      </span>
                    </td>
                    <td>{formatearFecha(item.fecha_nacimiento)}</td>
                    <td>
                      <a href={`tel:${item.celular}`} className="text-decoration-none text-primary">
                        <i className="bi bi-telephone me-1"></i>
                        {item.celular}
                      </a>
                    </td>
                    <td>
                      <a 
                        href={`mailto:${item.correo}`} 
                        className="text-decoration-none text-primary"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <i className="bi bi-envelope me-1"></i>
                        {item.correo}
                      </a>
                    </td>
                    <td>{item.direccion || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de página */}
        <div className="text-center mt-4 text-muted small" data-aos="fade-up" data-aos-delay="200">
          <p>Actualizado al año lectivo 2025 • Todos los derechos reservados</p>
        </div>
      </div>
    </section>
  );
}