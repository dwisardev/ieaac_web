// src/components/HorariosEscolares.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  Calendar2Week,
  Person,
  People,
  CheckCircle,
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/HorariosEscolares.css";

// Servicios
import {
  obtenerGrados,
  obtenerDocentes,
  obtenerTodosHorariosEstudiantes,
  obtenerTodosHorariosDocentes,
} from "../../services/horariosService";

const HorariosEscolares = () => {
  // Estados
  const [grados, setGrados] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [horariosEstudiantes, setHorariosEstudiantes] = useState({});
  const [horariosDocentes, setHorariosDocentes] = useState({});
  const [activeGrado, setActiveGrado] = useState(null);
  const [activeDocente, setActiveDocente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [gradosData, docentesData, horariosEstData, horariosDocData] =
        await Promise.all([
          obtenerGrados(),
          obtenerDocentes(),
          obtenerTodosHorariosEstudiantes(),
          obtenerTodosHorariosDocentes(),
        ]);

      setGrados(gradosData);
      setDocentes(docentesData);
      setHorariosEstudiantes(horariosEstData);
      setHorariosDocentes(horariosDocData);

      // Establecer valores por defecto
      if (gradosData.length > 0) {
        setActiveGrado(gradosData[0].nombre);
      }
      if (docentesData.length > 0) {
        setActiveDocente(docentesData[0].nombre_corto);
      }
    } catch (err) {
      console.error("Error al cargar horarios:", err);
      setError(
        "No se pudieron cargar los horarios. Por favor, intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener color de asignatura
  const getSubjectColor = (color) => {
    return color || "#6B7280";
  };

  // Renderizar grid de horario
  const renderHorario = (horarioData) => {
    if (!horarioData || horarioData.length === 0) {
      return (
        <Alert variant="info">No hay horario disponible para esta selección.</Alert>
      );
    }

    return (
      <div className="horario-grid">
        <div className="horario-header">
          <div className="hora-cell">Hora</div>
          <div className="dia-cell">Lunes</div>
          <div className="dia-cell">Martes</div>
          <div className="dia-cell">Miércoles</div>
          <div className="dia-cell">Jueves</div>
          <div className="dia-cell">Viernes</div>
        </div>
        {horarioData.map((row, idx) => {
          // Verificar si es receso
          if (row.esReceso) {
            return (
              <div key={idx} className="horario-row">
                <div className="hora-cell">{row.hora}</div>
                {["lunes", "martes", "miercoles", "jueves", "viernes"].map((dia) => (
                  <div key={dia} className="bloque receso">
                    RECESO
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div key={idx} className="horario-row">
              <div className="hora-cell">{row.hora}</div>
              {["lunes", "martes", "miercoles", "jueves", "viernes"].map((dia) => {
                const contenido = row[dia];

                if (!contenido) {
                  return <div key={dia} className="bloque" />;
                }

                const backgroundColor = getSubjectColor(contenido.color);

                return (
                  <div
                    key={dia}
                    className="bloque"
                    style={{
                      backgroundColor,
                      color: "white",
                      fontWeight: "500",
                      fontSize: "0.85rem",
                    }}
                    title={`${contenido.asignatura}${
                      contenido.docente ? ` - ${contenido.docente}` : ""
                    }${contenido.grado ? ` - ${contenido.grado}` : ""}`}
                  >
                    <div>{contenido.asignatura}</div>
                    {contenido.docente && (
                      <div className="profesor">({contenido.docente})</div>
                    )}
                    {contenido.grado && (
                      <div className="profesor">{contenido.grado}</div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando horarios escolares...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5 horarios-escolares-container">
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
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
          <Calendar2Week className="me-2" />
          Horarios Escolares {new Date().getFullYear()}
        </h1>
        <p className="lead text-muted">
          Horarios oficiales de estudiantes y docentes – I.E. Andrés Avelino Cáceres
        </p>
      </div>

      {/* Sección: Horarios por Grado */}
      <section className="mb-5">
        <h3 className="mb-4 fw-bold text-uppercase text-primary d-flex align-items-center">
          <People className="me-2" />
          Horarios por Grado (Estudiantes)
        </h3>

        {grados.length === 0 ? (
          <Alert variant="info">
            No hay grados disponibles en este momento.
          </Alert>
        ) : (
          <>
            {/* Selector de grado */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {grados.map((grado) => (
                <Button
                  key={grado.id}
                  variant={activeGrado === grado.nombre ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setActiveGrado(grado.nombre)}
                >
                  <Person className="me-1" /> {grado.nombre}
                </Button>
              ))}
            </div>

            {/* Grid del horario */}
            <Card className="shadow-sm border-0">
              <Card.Body>
                {renderHorario(horariosEstudiantes[activeGrado])}
              </Card.Body>
            </Card>
          </>
        )}
      </section>

      {/* Sección: Horarios por Docente */}
      <section className="mb-5">
        <h3 className="mb-4 fw-bold text-uppercase text-primary d-flex align-items-center">
          <Person className="me-2" />
          Horarios por Docente
        </h3>

        {docentes.length === 0 ? (
          <Alert variant="info">
            No hay docentes disponibles en este momento.
          </Alert>
        ) : (
          <>
            {/* Selector de docente */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {docentes.map((docente) => (
                <Button
                  key={docente.id}
                  variant={
                    activeDocente === docente.nombre_corto
                      ? "primary"
                      : "outline-primary"
                  }
                  size="sm"
                  onClick={() => setActiveDocente(docente.nombre_corto)}
                >
                  {docente.nombre_corto}
                </Button>
              ))}
            </div>

            {/* Grid del horario del docente */}
            <Card className="shadow-sm border-0">
              <Card.Body>
                {renderHorario(horariosDocentes[activeDocente])}
              </Card.Body>
            </Card>
          </>
        )}
      </section>

      {/* Nota informativa */}
      <Card className="text-center shadow-sm border-0">
        <Card.Body>
          <CheckCircle size={48} className="text-primary mb-2" />
          <h5 className="fw-bold">Actualización oficial</h5>
          <p className="mb-0 text-muted">
            Los horarios están vigentes para el año escolar {new Date().getFullYear()} y
            fueron generados mediante el sistema aSc Horarios.
          </p>
        </Card.Body>
      </Card>

      {/* Pie de página */}
      <footer className="text-center mt-5 pt-4 border-top">
        <p className="text-muted small">
          © {new Date().getFullYear()} Institución Educativa Andrés Avelino Cáceres
          – Sirenachayocc
        </p>
      </footer>
    </Container>
  );
};

export default HorariosEscolares;