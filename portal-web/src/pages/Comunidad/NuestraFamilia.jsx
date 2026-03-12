// src/pages/Comunidad/NuestraFamilia.jsx

import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaChalkboard,
  FaClipboardList,
  FaBrain,
  FaHeart,
  FaHandsHelping,
  FaUserGraduate
} from "react-icons/fa";
import { BsPersonBadge } from "react-icons/bs";
import { Spinner, Alert, Container } from "react-bootstrap";

import "../../assets/css/pages/NuestraFamilia.css";



// Servicio de datos
import { obtenerMiembrosCompleto } from "../../services/miembrosServices";

const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || '';
const fotoUrl = (path) => path ? `${UPLOAD_URL}${path}` : null;

const NuestraFamilia = () => {
  const [miembros, setMiembros] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const anioActual = new Date().getFullYear();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await obtenerMiembrosCompleto(anioActual);
      setMiembros(datos);
    } catch (err) {
      console.error('Error al cargar miembros:', err);
      setError('No se pudieron cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando nuestra familia educativa...</p>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-5">
        <Alert 
          variant="danger" 
          className="text-center"
          dismissible
          onClose={() => setError(null)}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <button 
              className="btn btn-sm btn-outline-danger ms-3" 
              onClick={cargarDatos}
            >
              Reintentar
            </button>
          </div>
        </Alert>
      </Container>
    );
  }

  // No data state
  if (!miembros) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <FaUsers size={48} className="mb-3" />
          <h5>No hay datos disponibles</h5>
          <p className="mb-0">La información de la familia educativa aún no ha sido cargada.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4 fw-bold display-5">Nuestra Familia Educativa</h1>
      <p className="text-center text-muted mb-5">
        Comunidad organizada de la I.E. "Andrés Avelino Cáceres" (nivel secundario), articulada en comités institucionales,
        docentes, auxiliares, familias y estudiantes, conforme al marco del MINEDU.
      </p>

      {/* === NUESTRO DIRECTOR === */}
      {miembros.director && (
        <section className="mb-6">
          <h2 className="h4 text-primary fw-bold mb-4 d-flex align-items-center">
            <BsPersonBadge className="me-2" /> Nuestro Director
          </h2>
          {fotoUrl(miembros.fotos_grupo?.['director']) && (
            <div className="text-center mb-4">
              <img
                src={fotoUrl(miembros.fotos_grupo['director'])}
                alt={`${miembros.director.nombre} - Director`}
                className="familia-img"
              />
            </div>
          )}
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 text-center">
                <div className="card-body">
                  <div className="display-5 text-primary mb-2">
                    <BsPersonBadge />
                  </div>
                  <h5 className="fw-bold">{miembros.director.nombre}</h5>
                  <p className="text-muted mb-0">{miembros.director.cargo}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Comité de Gestión de Condiciones Operativas */}
      {miembros.comiteOperativo && miembros.comiteOperativo.length > 0 && (
        <section className="mb-6">
          <h2 className="h4 text-primary fw-bold mb-4 d-flex align-items-center">
            <FaClipboardList className="me-2" /> Comité de Gestión de Condiciones Operativas
          </h2>
          <div className="row g-4">
            {miembros.comiteOperativo.map((miembro) => (
              <div className="col-md-6 col-lg-4" key={miembro.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex align-items-start">
                    <div className="display-6 text-primary me-3 mt-1 flex-shrink-0">
                      <FaClipboardList />
                    </div>
                    <div>
                      <h6 className="mb-1">{miembro.nombre}</h6>
                      <p className="text-muted small mb-0">{miembro.cargo}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comité de Gestión Pedagógica */}
      {miembros.comitePedagogico && miembros.comitePedagogico.length > 0 && (
        <section className="mb-6">
          <h2 className="h4 text-primary fw-bold mb-4 d-flex align-items-center">
            <FaBrain className="me-2" /> Comité de Gestión Pedagógica
          </h2>
          <div className="row g-4">
            {miembros.comitePedagogico.map((miembro) => (
              <div className="col-md-6 col-lg-4" key={miembro.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex align-items-start">
                    <div className="display-6 text-primary me-3 mt-1 flex-shrink-0">
                      <FaBrain />
                    </div>
                    <div>
                      <h6 className="mb-1">{miembro.nombre}</h6>
                      <p className="text-muted small mb-0">{miembro.cargo}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comité de Gestión del Bienestar */}
      {miembros.comiteBienestar && miembros.comiteBienestar.length > 0 && (
        <section className="mb-6">
          <h2 className="h4 text-primary fw-bold mb-4 d-flex align-items-center">
            <FaHeart className="me-2" /> Comité de Gestión del Bienestar
          </h2>
          <div className="row g-4">
            {miembros.comiteBienestar.map((miembro) => (
              <div className="col-md-6 col-lg-4" key={miembro.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex align-items-start">
                    <div className="display-6 text-primary me-3 mt-1 flex-shrink-0">
                      <FaHeart />
                    </div>
                    <div>
                      <h6 className="mb-1">{miembro.nombre}</h6>
                      <p className="text-muted small mb-0">{miembro.cargo}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONEI */}
      {miembros.conei && miembros.conei.length > 0 && (
        <section className="mb-6">
          <h2 className="h4 text-primary fw-bold mb-4 d-flex align-items-center">
            <FaHandsHelping className="me-2" /> CONEI (Consejo Educativo Institucional)
          </h2>
          <div className="row g-4">
            {miembros.conei.map((miembro) => (
              <div className="col-md-6 col-lg-4" key={miembro.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex align-items-start">
                    <div className="display-6 text-primary me-3 mt-1 flex-shrink-0">
                      <FaHandsHelping />
                    </div>
                    <div>
                      <h6 className="mb-1">{miembro.nombre}</h6>
                      <p className="text-muted small mb-0">{miembro.cargo}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Consejo Directivo APAFA */}
      {miembros.consejoDirectivo && miembros.consejoDirectivo.length > 0 && (
        <section className="mb-6">
          <h2 className="h4 text-primary fw-bold mb-4 d-flex align-items-center">
            <FaUsers className="me-2" /> Consejo Directivo (APAFA)
          </h2>
          <div className="row g-4">
            {miembros.consejoDirectivo.map((miembro) => (
              <div className="col-md-6 col-lg-4" key={miembro.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex align-items-start">
                    <div className="display-6 text-primary me-3 mt-1 flex-shrink-0">
                      <FaUsers />
                    </div>
                    <div>
                      <h6 className="mb-1">{miembro.nombre}</h6>
                      {miembro.celular && (
                        <p className="text-muted small mb-1">
                          <strong>Celular:</strong> {miembro.celular}
                        </p>
                      )}
                      <p className="text-muted small mb-0">{miembro.cargo}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Plana Docente y Auxiliares */}
      {(miembros.docentes?.length > 0 || miembros.auxiliares?.length > 0) && (
        <section className="mb-6">
          <h2 className="h4 text-primary fw-bold mb-4 d-flex align-items-center">
            <FaChalkboard className="me-2" /> Plana Docente y Administrativo
          </h2>
          {fotoUrl(miembros.fotos_grupo?.['docentes']) && (
            <div className="text-center mb-4">
              <img
                src={fotoUrl(miembros.fotos_grupo['docentes'])}
                alt="Nuestra Plana Docente"
                className="familia-img"
              />
            </div>
          )}
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-center" style={{width: '60px'}}>N°</th>
                  <th>Nombre</th>
                  <th>Especialidad / Cargo</th>
                  <th className="text-center">Condición</th>
                </tr>
              </thead>
              <tbody>
                {miembros.docentes?.map((d, i) => (
                  <tr key={d.id}>
                    <td className="text-center">{String(i + 1).padStart(2, "0")}</td>
                    <td>{d.nombre}</td>
                    <td>{d.especialidad || '-'}</td>
                    <td className="text-center">
                      <span className={`badge ${d.condicion === 'Nombrado' || d.condicion === 'Nombrada' ? 'bg-success' : 'bg-info'}`}>
                        {d.condicion}
                      </span>
                    </td>
                  </tr>
                ))}
                {miembros.auxiliares?.map((a, i) => (
                  <tr key={a.id}>
                    <td className="text-center">
                      {String((miembros.docentes?.length || 0) + i + 1).padStart(2, "0")}
                    </td>
                    <td>{a.nombre}</td>
                    <td>{a.rol || '-'}</td>
                    <td className="text-center">
                      <span className={`badge ${a.condicion === 'Nombrado' || a.condicion === 'Nombrada' ? 'bg-success' : 'bg-info'}`}>
                        {a.condicion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Municipio Escolar */}
      {miembros.municipio && miembros.municipio.length > 0 && (
        <section className="mb-5">
          <h2 className="h4 text-primary fw-bold mb-4 d-flex align-items-center">
            <FaUserGraduate className="me-2" /> Municipio Escolar
          </h2>
          {fotoUrl(miembros.fotos_grupo?.['municipio']) && (
            <div className="text-center mb-4">
              <img
                src={fotoUrl(miembros.fotos_grupo['municipio'])}
                alt="Municipio Escolar"
                className="familia-img"
              />
            </div>
          )}
          <div className="row justify-content-center g-4">
            {miembros.municipio.map((m) => (
              <div className="col-md-4 col-lg-3" key={m.id}>
                <div className="card shadow-sm h-100 text-center">
                  <div className="card-body">
                    <div className="display-5 text-primary mb-2">
                      <FaUserGraduate />
                    </div>
                    <h6 className="mb-1">{m.nombre}</h6>
                    <p className="text-muted small mb-0">{m.cargo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pie de página */}
      <footer className="text-center mt-5 pt-4 border-top">
        <p className="text-muted small mb-0">
          © {anioActual} Institución Educativa Andrés Avelino Cáceres – Sirenachayocc
        </p>
      </footer>
    </Container>
  );
};

export default NuestraFamilia;