import { useEffect, useState, useRef } from "react";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import { Calendar2Week, Person, People, CheckCircle } from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/HorariosEscolares.css";
import { horariosService } from "../../services/horariosService";

const DIAS       = ["lunes", "martes", "miercoles", "jueves", "viernes"];
const DIAS_LABEL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

/**
 * Convierte las filas planas del API en una grilla por bloque.
 * Cada bloque tiene: { bloque_id, hora, es_receso, lunes, martes, miercoles, jueves, viernes }
 * Cada día tiene: { asignatura, color, docente, grado } o null si está vacío.
 */
const buildGrid = (rows, bloques) => {
  const lookup = {};
  rows.forEach((r) => {
    if (!r.es_receso && r.asignatura_id) {
      lookup[`${r.bloque_id}_${r.dia_semana}`] = {
        asignatura: r.asignatura,
        color:      r.asignatura_color || "#6B7280",
        docente:    r.docente  || null,
        grado:      r.grado    || null,
      };
    }
  });

  return bloques.map((b) => ({
    bloque_id: b.id,
    hora:      b.hora,
    es_receso: b.es_receso,
    lunes:     lookup[`${b.id}_lunes`]     || null,
    martes:    lookup[`${b.id}_martes`]    || null,
    miercoles: lookup[`${b.id}_miercoles`] || null,
    jueves:    lookup[`${b.id}_jueves`]    || null,
    viernes:   lookup[`${b.id}_viernes`]   || null,
  }));
};

const HorariosEscolares = () => {
  const [grados,   setGrados]   = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [bloques,  setBloques]  = useState([]);

  const [activeGradoId,   setActiveGradoId]   = useState(null);
  const [activeDocenteId, setActiveDocenteId] = useState(null);

  /* caché: { [id]: grilla[] } — evita re-fetch al volver a seleccionar */
  const cacheGrado   = useRef({});
  const cacheDocente = useRef({});

  const [gridGrado,   setGridGrado]   = useState([]);
  const [gridDocente, setGridDocente] = useState([]);

  const [loadingGrado,   setLoadingGrado]   = useState(false);
  const [loadingDocente, setLoadingDocente] = useState(false);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarBase();
  }, []);

  const cargarBase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [g, d, b] = await Promise.all([
        horariosService.getGrados(),
        horariosService.getDocentes(),
        horariosService.getBloques(),
      ]);
      setGrados(g);
      setDocentes(d);
      setBloques(b);

      /* auto-seleccionar primeros */
      if (g.length > 0) seleccionarGrado(g[0].id, b);
      if (d.length > 0) seleccionarDocente(d[0].id, b);
    } catch {
      setError("No se pudieron cargar los horarios. Por favor, intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const seleccionarGrado = async (gradoId, bloquesRef = bloques) => {
    setActiveGradoId(gradoId);
    if (cacheGrado.current[gradoId]) {
      setGridGrado(cacheGrado.current[gradoId]);
      return;
    }
    setLoadingGrado(true);
    try {
      const rows = await horariosService.getHorarioEstudiante(gradoId);
      const grid = buildGrid(rows, bloquesRef);
      cacheGrado.current[gradoId] = grid;
      setGridGrado(grid);
    } catch {
      setGridGrado([]);
    } finally {
      setLoadingGrado(false);
    }
  };

  const seleccionarDocente = async (docenteId, bloquesRef = bloques) => {
    setActiveDocenteId(docenteId);
    if (cacheDocente.current[docenteId]) {
      setGridDocente(cacheDocente.current[docenteId]);
      return;
    }
    setLoadingDocente(true);
    try {
      const rows = await horariosService.getHorarioDocente(docenteId);
      const grid = buildGrid(rows, bloquesRef);
      cacheDocente.current[docenteId] = grid;
      setGridDocente(grid);
    } catch {
      setGridDocente([]);
    } finally {
      setLoadingDocente(false);
    }
  };

  /* ── Renderizar grilla ── */
  const renderGrilla = (grid, loading, tipo) => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2 text-muted" style={{ fontSize: 14 }}>Cargando horario...</span>
        </div>
      );
    }
    if (!grid || grid.length === 0) {
      return (
        <Alert variant="info" className="mb-0">
          No hay horario registrado para esta selección.
        </Alert>
      );
    }

    return (
      <div className="horario-grid">
        {/* Encabezado */}
        <div className="horario-header">
          <div className="hora-cell">Hora</div>
          {DIAS_LABEL.map((d) => (
            <div key={d} className="dia-cell">{d}</div>
          ))}
        </div>

        {/* Filas */}
        {grid.map((fila) => {
          if (fila.es_receso) {
            return (
              <div key={fila.bloque_id} className="horario-row">
                <div className="hora-cell receso-hora">{fila.hora}</div>
                {DIAS.map((d) => (
                  <div key={d} className="bloque receso">RECREO</div>
                ))}
              </div>
            );
          }

          return (
            <div key={fila.bloque_id} className="horario-row">
              <div className="hora-cell">{fila.hora}</div>
              {DIAS.map((dia) => {
                const cell = fila[dia];
                if (!cell) {
                  return <div key={dia} className="bloque bloque-vacio" />;
                }
                return (
                  <div
                    key={dia}
                    className="bloque"
                    style={{
                      background:  cell.color + "22",
                      borderLeft:  `3px solid ${cell.color}`,
                      color:       "#1e293b",
                    }}
                    title={[cell.asignatura, cell.docente, cell.grado].filter(Boolean).join(" · ")}
                  >
                    <div className="bloque-asignatura">{cell.asignatura}</div>
                    {tipo === "grado" && cell.docente && (
                      <div className="profesor">{cell.docente}</div>
                    )}
                    {tipo === "docente" && cell.grado && (
                      <div className="profesor">{cell.grado}</div>
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

  /* ── Loading principal ── */
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

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}{" "}
          <Button size="sm" variant="outline-danger" onClick={cargarBase} className="ms-2">
            Reintentar
          </Button>
        </Alert>
      )}

      {/* Encabezado */}
      <div className="text-center mb-5" data-aos="fade-up">
        <h1 className="display-5 fw-bold text-primary">
          <Calendar2Week className="me-2" />
          Horarios Escolares {new Date().getFullYear()}
        </h1>
        <p className="lead text-muted">
          Horarios oficiales de estudiantes y docentes – I.E. Andrés Avelino Cáceres
        </p>
      </div>

      {/* ── Horarios por Grado ── */}
      <section className="mb-5" data-aos="fade-up">
        <h3 className="mb-4 fw-bold text-uppercase text-primary d-flex align-items-center">
          <People className="me-2" /> Horario por Grado
        </h3>

        {grados.length === 0 ? (
          <Alert variant="info">No hay grados disponibles.</Alert>
        ) : (
          <>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {grados.map((g) => (
                <Button
                  key={g.id}
                  variant={activeGradoId === g.id ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => seleccionarGrado(g.id)}
                >
                  {g.nombre}
                  {g.nivel && g.nivel !== "Secundaria" && (
                    <span className="ms-1" style={{ fontSize: 10, opacity: 0.75 }}>({g.nivel})</span>
                  )}
                </Button>
              ))}
            </div>
            <Card className="shadow-sm border-0">
              <Card.Body style={{ padding: 0, overflowX: "auto" }}>
                {renderGrilla(gridGrado, loadingGrado, "grado")}
              </Card.Body>
            </Card>
          </>
        )}
      </section>

      {/* ── Horarios por Docente ── */}
      <section className="mb-5" data-aos="fade-up">
        <h3 className="mb-4 fw-bold text-uppercase text-primary d-flex align-items-center">
          <Person className="me-2" /> Horario por Docente
        </h3>

        {docentes.length === 0 ? (
          <Alert variant="info">No hay docentes disponibles.</Alert>
        ) : (
          <>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {docentes.map((d) => (
                <Button
                  key={d.id}
                  variant={activeDocenteId === d.id ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => seleccionarDocente(d.id)}
                >
                  {d.nombre_corto || d.nombre_completo}
                </Button>
              ))}
            </div>
            <Card className="shadow-sm border-0">
              <Card.Body style={{ padding: 0, overflowX: "auto" }}>
                {renderGrilla(gridDocente, loadingDocente, "docente")}
              </Card.Body>
            </Card>
          </>
        )}
      </section>

      {/* Nota */}
      <Card className="text-center shadow-sm border-0" data-aos="fade-up">
        <Card.Body className="py-4">
          <CheckCircle size={40} className="text-primary mb-2" />
          <h5 className="fw-bold">Actualización oficial</h5>
          <p className="mb-0 text-muted">
            Horarios vigentes para el año escolar {new Date().getFullYear()} –
            I.E. Andrés Avelino Cáceres, Sirenachayocc.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HorariosEscolares;
