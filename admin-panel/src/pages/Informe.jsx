// src/pages/fondep/InformeAdmin.jsx - PARTE 1
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Table,
  Badge,
  Tabs,
  Tab
} from "react-bootstrap";
import {
  FileTextFill,
  PlusCircle,
  Pencil,
  Trash,
  CheckCircleFill,
  BarChartFill,
  PeopleFill
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";

// Importar servicios
import {
  obtenerInformeCompleto,
  calcularEstadisticasInforme,
  // Métodos de administración (a crear)
  actualizarMetadata,
  crearResultado,
  actualizarResultado,
  eliminarResultado,
  crearFase,
  actualizarFase,
  eliminarFase,
  actualizarLogros
} from "../services/informeFinalService";

const AdminInforme = () => {
  // Estados generales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("metadata");

  // Estados de datos
  const [informe, setInforme] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  const [showModalLogros, setShowModalLogros] = useState(false);
const [formLogros, setFormLogros] = useState({
  participacionEstudiantil: 0,
  docentesCapacitados: 0,
  productosGenerados: 0,
  familiasInvolucradas: 0
});

  // Estados de modales
  const [showModalMetadata, setShowModalMetadata] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showModalFase, setShowModalFase] = useState(false);
const [formFase, setFormFase] = useState({
  id: null,
  fase: "",
  descripcion: "",
  completado: false,
  orden: 1
});

  const [showModalResultado, setShowModalResultado] = useState(false);
const [formResultado, setFormResultado] = useState({
  id: null,
  tipo: "Aprendizaje",
  competencia: "",
  metaDestacado: 0,
  metaProceso: 0,
  metaInicio: 0,
  inicioDestacado: 0,
  inicioProceso: 0,
  inicioInicio: 0,
  actualDestacado: 0,
  actualProceso: 0,
  actualInicio: 0,
  color: "#4361ee",
  orden: 1,
  activo: true
});

  // Estado de formulario metadata
  const [formMetadata, setFormMetadata] = useState({
    codigo_proyecto: "",
    titulo: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "en_proceso"
  });

  // Cargar datos al montar
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [informeData, estadisticasData] = await Promise.all([
        obtenerInformeCompleto(),
        calcularEstadisticasInforme()
      ]);

      setInforme(informeData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // GESTIÓN DE METADATA
  // ==========================================

  const abrirModalMetadata = () => {
    if (informe?.metadata) {
      setFormMetadata(informe.metadata);
      setModoEdicion(true);
    } else {
      setFormMetadata({
        codigo_proyecto: "",
        titulo: "",
        fecha_inicio: "",
        fecha_fin: "",
        estado: "en_proceso"
      });
      setModoEdicion(false);
    }
    setShowModalMetadata(true);
  };

  const cerrarModalMetadata = () => {
    setShowModalMetadata(false);
    setFormMetadata({
      codigo_proyecto: "",
      titulo: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado: "en_proceso"
    });
    setModoEdicion(false);
  };

  const handleChangeMetadata = (e) => {
    const { name, value } = e.target;
    setFormMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitMetadata = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      await actualizarMetadata(formMetadata);
      setSuccess("Metadata actualizada correctamente");
      
      cerrarModalMetadata();
      await cargarDatos();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al guardar metadata:", err);
      setError("Error al guardar la información. Intente nuevamente.");
    }
  };

  // Renderizar sección de metadata
  const renderMetadataSection = () => (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FileTextFill className="me-2" />
          Información del Proyecto
        </h5>
        <Button 
          variant="light" 
          size="sm"
          onClick={abrirModalMetadata}
        >
          <Pencil className="me-1" />
          Editar
        </Button>
      </Card.Header>
      <Card.Body>
        {informe?.metadata ? (
          <Row>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Código del Proyecto</strong>
              <p className="mb-0">{informe.metadata.codigo_proyecto}</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Estado</strong>
              <Badge bg={informe.metadata.estado === 'completado' ? 'success' : 'warning'}>
                {informe.metadata.estado}
              </Badge>
            </Col>
            <Col md={12} className="mb-3">
              <strong className="d-block text-muted small">Título</strong>
              <p className="mb-0">{informe.metadata.titulo}</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Fecha de Inicio</strong>
              <p className="mb-0">{informe.metadata.fecha_inicio}</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong className="d-block text-muted small">Fecha de Fin</strong>
              <p className="mb-0">{informe.metadata.fecha_fin}</p>
            </Col>
          </Row>
        ) : (
          <Alert variant="info">
            No hay información del proyecto. Haga clic en "Editar" para agregarla.
          </Alert>
        )}

        {/* Estadísticas */}
        {estadisticas && (
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="fw-bold mb-3">
              <BarChartFill className="me-2" />
              Estadísticas Generales
            </h6>
            <Row className="text-center">
              <Col xs={6} md={3}>
                <h4 className="fw-bold text-success">{estadisticas.metasAlcanzadas}</h4>
                <small className="text-muted">Metas alcanzadas</small>
              </Col>
              <Col xs={6} md={3}>
                <h4 className="fw-bold text-primary">{estadisticas.totalIndicadores}</h4>
                <small className="text-muted">Total indicadores</small>
              </Col>
              <Col xs={6} md={3}>
                <h4 className="fw-bold text-info">{estadisticas.porcentajeMetasAlcanzadas}%</h4>
                <small className="text-muted">% Cumplimiento</small>
              </Col>
              <Col xs={6} md={3}>
                <h4 className="fw-bold text-warning">{estadisticas.indicadoresMejora50}</h4>
                <small className="text-muted">Mejora +50%</small>
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  // Modal de metadata
  const renderModalMetadata = () => (
    showModalMetadata && (
      <div className="modal-overlay" onClick={cerrarModalMetadata}>
        <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              <i className="fas fa-file-text" />
              Editar Información del Proyecto
            </h3>
            <button className="modal-close" onClick={cerrarModalMetadata}>
              <i className="fas fa-xmark" />
            </button>
          </div>
          <form onSubmit={handleSubmitMetadata}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Código del Proyecto *</label>
                <input className="form-input" type="text" name="codigo_proyecto" value={formMetadata.codigo_proyecto} onChange={handleChangeMetadata} placeholder="Ej: CNPIE2025-023880" required />
              </div>

              <div className="form-group">
                <label className="form-label">Título del Proyecto *</label>
                <textarea className="form-input" name="titulo" value={formMetadata.titulo} onChange={handleChangeMetadata} placeholder="Descripción completa del proyecto" rows={3} style={{ resize: 'vertical' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Fecha de Inicio *</label>
                  <input className="form-input" type="date" name="fecha_inicio" value={formMetadata.fecha_inicio} onChange={handleChangeMetadata} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de Fin *</label>
                  <input className="form-input" type="date" name="fecha_fin" value={formMetadata.fecha_fin} onChange={handleChangeMetadata} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Estado del Proyecto *</label>
                <select className="form-input" name="estado" value={formMetadata.estado} onChange={handleChangeMetadata} required>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completado</option>
                  <option value="pausado">Pausado</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={cerrarModalMetadata}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-floppy-disk" /> Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
  // ==========================================
// GESTIÓN DE RESULTADOS
// ==========================================

const abrirModalResultado = (resultado = null) => {
  if (resultado) {
    setFormResultado(resultado);
    setModoEdicion(true);
  } else {
    const maxOrden = informe?.resultados?.length 
      ? Math.max(...informe.resultados.map(r => r.orden)) 
      : 0;
    
    setFormResultado({
      id: null,
      tipo: "Aprendizaje",
      competencia: "",
      metaDestacado: 0,
      metaProceso: 0,
      metaInicio: 0,
      inicioDestacado: 0,
      inicioProceso: 0,
      inicioInicio: 0,
      actualDestacado: 0,
      actualProceso: 0,
      actualInicio: 0,
      color: "#4361ee",
      orden: maxOrden + 1,
      activo: true
    });
    setModoEdicion(false);
  }
  setShowModalResultado(true);
};

const cerrarModalResultado = () => {
  setShowModalResultado(false);
  setFormResultado({
    id: null,
    tipo: "Aprendizaje",
    competencia: "",
    metaDestacado: 0,
    metaProceso: 0,
    metaInicio: 0,
    inicioDestacado: 0,
    inicioProceso: 0,
    inicioInicio: 0,
    actualDestacado: 0,
    actualProceso: 0,
    actualInicio: 0,
    color: "#4361ee",
    orden: 1,
    activo: true
  });
  setModoEdicion(false);
};

const handleChangeResultado = (e) => {
  const { name, value, type, checked } = e.target;
  setFormResultado(prev => ({
    ...prev,
    [name]: type === "checkbox" ? checked : (type === "number" ? parseFloat(value) : value)
  }));
};

const handleSubmitResultado = async (e) => {
  e.preventDefault();
  try {
    setError(null);
    
    if (modoEdicion) {
      await actualizarResultado(formResultado.id, formResultado);
      setSuccess("Resultado actualizado correctamente");
    } else {
      await crearResultado(formResultado);
      setSuccess("Resultado creado correctamente");
    }
    
    cerrarModalResultado();
    await cargarDatos();
    
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al guardar resultado:", err);
    setError("Error al guardar el resultado. Intente nuevamente.");
  }
};

const handleEliminarResultado = async (id) => {
  if (!window.confirm("¿Está seguro de eliminar este resultado?")) {
    return;
  }

  try {
    setError(null);
    await eliminarResultado(id);
    setSuccess("Resultado eliminado correctamente");
    await cargarDatos();
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al eliminar resultado:", err);
    setError("Error al eliminar el resultado. Intente nuevamente.");
  }
};

// Renderizar tabla de resultados
const renderTablaResultados = () => (
  <Card className="shadow-sm border-0">
    <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">
        <CheckCircleFill className="me-2" />
        Resultados Alcanzados
      </h5>
      <Button 
        variant="light" 
        size="sm"
        onClick={() => abrirModalResultado()}
      >
        <PlusCircle className="me-1" />
        Nuevo Resultado
      </Button>
    </Card.Header>
    <Card.Body>
      {!informe?.resultados || informe.resultados.length === 0 ? (
        <Alert variant="info">No hay resultados registrados</Alert>
      ) : (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Tipo</th>
              <th>Competencia</th>
              <th>Inicio</th>
              <th>Meta</th>
              <th>Actual</th>
              <th>Progreso</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {informe.resultados.sort((a, b) => a.orden - b.orden).map(resultado => {
              const progreso = resultado.actualDestacado - resultado.inicioDestacado;
              const metaAlcanzada = resultado.actualDestacado >= resultado.metaDestacado;
              
              return (
                <tr key={resultado.id}>
                  <td>{resultado.orden}</td>
                  <td>
                    <Badge bg="secondary">{resultado.tipo}</Badge>
                  </td>
                  <td>
                    <strong>{resultado.competencia}</strong>
                  </td>
                  <td>{resultado.inicioDestacado}%</td>
                  <td>{resultado.metaDestacado}%</td>
                  <td>{resultado.actualDestacado}%</td>
                  <td>
                    <Badge bg={progreso >= 0 ? 'success' : 'danger'}>
                      {progreso >= 0 ? '+' : ''}{progreso}%
                    </Badge>
                  </td>
                  <td>
                    {resultado.activo ? (
                      <Badge bg="success">Sí</Badge>
                    ) : (
                      <Badge bg="secondary">No</Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => abrirModalResultado(resultado)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleEliminarResultado(resultado.id)}
                    >
                      <Trash size={14} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Card.Body>
  </Card>
);

// Modal de resultados
const renderModalResultado = () => (
  showModalResultado && (
    <div className="modal-overlay" onClick={cerrarModalResultado}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className="fas fa-check-circle" />
            {modoEdicion ? "Editar Resultado" : "Nuevo Resultado"}
          </h3>
          <button className="modal-close" onClick={cerrarModalResultado}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <form onSubmit={handleSubmitResultado}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Competencia *</label>
                <input className="form-input" type="text" name="competencia" value={formResultado.competencia} onChange={handleChangeResultado} placeholder="Ej: Se comunica oralmente en CSL" required />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo *</label>
                <select className="form-input" name="tipo" value={formResultado.tipo} onChange={handleChangeResultado} required>
                  <option value="Aprendizaje">Aprendizaje</option>
                  <option value="Desempeño Docente">Desempeño Docente</option>
                  <option value="Gestión Escolar">Gestión Escolar</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Orden</label>
                <input className="form-input" type="number" name="orden" value={formResultado.orden} onChange={handleChangeResultado} min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input className="form-input" type="color" name="color" value={formResultado.color} onChange={handleChangeResultado} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="activo_res" name="activo" checked={formResultado.activo} onChange={handleChangeResultado} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent)' }} />
                  <label htmlFor="activo_res" style={{ fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>Activo</label>
                </div>
              </div>
            </div>

            <hr />
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Nivel "Destacado/Esperado"</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Inicio (%)</label>
                <input className="form-input" type="number" name="inicioDestacado" value={formResultado.inicioDestacado} onChange={handleChangeResultado} min="0" max="100" step="0.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Meta (%)</label>
                <input className="form-input" type="number" name="metaDestacado" value={formResultado.metaDestacado} onChange={handleChangeResultado} min="0" max="100" step="0.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Actual (%)</label>
                <input className="form-input" type="number" name="actualDestacado" value={formResultado.actualDestacado} onChange={handleChangeResultado} min="0" max="100" step="0.1" />
              </div>
            </div>

            <p style={{ fontWeight: 700, marginBottom: 8 }}>Nivel "En Proceso" (opcional)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Inicio (%)</label>
                <input className="form-input" type="number" name="inicioProceso" value={formResultado.inicioProceso} onChange={handleChangeResultado} min="0" max="100" step="0.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Meta (%)</label>
                <input className="form-input" type="number" name="metaProceso" value={formResultado.metaProceso} onChange={handleChangeResultado} min="0" max="100" step="0.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Actual (%)</label>
                <input className="form-input" type="number" name="actualProceso" value={formResultado.actualProceso} onChange={handleChangeResultado} min="0" max="100" step="0.1" />
              </div>
            </div>

            <p style={{ fontWeight: 700, marginBottom: 8 }}>Nivel "En Inicio" (opcional)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Inicio (%)</label>
                <input className="form-input" type="number" name="inicioInicio" value={formResultado.inicioInicio} onChange={handleChangeResultado} min="0" max="100" step="0.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Meta (%)</label>
                <input className="form-input" type="number" name="metaInicio" value={formResultado.metaInicio} onChange={handleChangeResultado} min="0" max="100" step="0.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Actual (%)</label>
                <input className="form-input" type="number" name="actualInicio" value={formResultado.actualInicio} onChange={handleChangeResultado} min="0" max="100" step="0.1" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={cerrarModalResultado}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-floppy-disk" /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
);

// ==========================================
// GESTIÓN DE FASES IAPE
// ==========================================

const abrirModalFase = (fase = null) => {
  if (fase) {
    setFormFase(fase);
    setModoEdicion(true);
  } else {
    const maxOrden = informe?.fases?.length 
      ? Math.max(...informe.fases.map(f => f.orden)) 
      : 0;
    
    setFormFase({
      id: null,
      fase: "",
      descripcion: "",
      completado: false,
      orden: maxOrden + 1
    });
    setModoEdicion(false);
  }
  setShowModalFase(true);
};

const cerrarModalFase = () => {
  setShowModalFase(false);
  setFormFase({
    id: null,
    fase: "",
    descripcion: "",
    completado: false,
    orden: 1
  });
  setModoEdicion(false);
};

const handleChangeFase = (e) => {
  const { name, value, type, checked } = e.target;
  setFormFase(prev => ({
    ...prev,
    [name]: type === "checkbox" ? checked : (name === "orden" ? parseInt(value) : value)
  }));
};

const handleSubmitFase = async (e) => {
  e.preventDefault();
  try {
    setError(null);
    
    if (modoEdicion) {
      await actualizarFase(formFase.id, formFase);
      setSuccess("Fase actualizada correctamente");
    } else {
      await crearFase(formFase);
      setSuccess("Fase creada correctamente");
    }
    
    cerrarModalFase();
    await cargarDatos();
    
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al guardar fase:", err);
    setError("Error al guardar la fase. Intente nuevamente.");
  }
};

const handleEliminarFase = async (id) => {
  if (!window.confirm("¿Está seguro de eliminar esta fase?")) {
    return;
  }

  try {
    setError(null);
    await eliminarFase(id);
    setSuccess("Fase eliminada correctamente");
    await cargarDatos();
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al eliminar fase:", err);
    setError("Error al eliminar la fase. Intente nuevamente.");
  }
};

// Renderizar tabla de fases
const renderTablaFases = () => (
  <Card className="shadow-sm border-0">
    <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">
        <PeopleFill className="me-2" />
        Fases del Proceso IAPE
      </h5>
      <Button 
        variant="light" 
        size="sm"
        onClick={() => abrirModalFase()}
      >
        <PlusCircle className="me-1" />
        Nueva Fase
      </Button>
    </Card.Header>
    <Card.Body>
      {!informe?.fases || informe.fases.length === 0 ? (
        <Alert variant="info">No hay fases registradas</Alert>
      ) : (
        <Table responsive hover>
          <thead>
            <tr>
              <th style={{width: "80px"}}>Orden</th>
              <th>Fase</th>
              <th>Descripción</th>
              <th style={{width: "120px"}}>Estado</th>
              <th style={{width: "120px"}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {informe.fases.sort((a, b) => a.orden - b.orden).map(fase => (
              <tr key={fase.id}>
                <td className="text-center">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto"
                    style={{
                      width: "36px",
                      height: "36px",
                      backgroundColor: fase.completado ? "#10b981" : "#6b7280",
                      color: "white",
                      fontWeight: "bold"
                    }}
                  >
                    {fase.completado ? <CheckCircleFill size={18} /> : fase.orden}
                  </div>
                </td>
                <td><strong>{fase.fase}</strong></td>
                <td>{fase.descripcion}</td>
                <td>
                  {fase.completado ? (
                    <Badge bg="success">Completado</Badge>
                  ) : (
                    <Badge bg="secondary">Pendiente</Badge>
                  )}
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => abrirModalFase(fase)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleEliminarFase(fase.id)}
                  >
                    <Trash size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card.Body>
  </Card>
);

// Modal de fases
const renderModalFase = () => (
  showModalFase && (
    <div className="modal-overlay" onClick={cerrarModalFase}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className="fas fa-tasks" />
            {modoEdicion ? "Editar Fase" : "Nueva Fase"}
          </h3>
          <button className="modal-close" onClick={cerrarModalFase}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <form onSubmit={handleSubmitFase}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nombre de la Fase *</label>
              <input className="form-input" type="text" name="fase" value={formFase.fase} onChange={handleChangeFase} placeholder="Ej: Fase 1: Planificación colaborativa" required />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción *</label>
              <textarea className="form-input" name="descripcion" value={formFase.descripcion} onChange={handleChangeFase} placeholder="Descripción de las actividades de esta fase" rows={3} style={{ resize: 'vertical' }} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Orden *</label>
                <input className="form-input" type="number" name="orden" value={formFase.orden} onChange={handleChangeFase} min="1" required />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="completado_fase" name="completado" checked={formFase.completado} onChange={handleChangeFase} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent)' }} />
                  <label htmlFor="completado_fase" style={{ fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>Fase Completada</label>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={cerrarModalFase}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-floppy-disk" /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
);

// ==========================================
// GESTIÓN DE LOGROS DESTACADOS
// ==========================================

const abrirModalLogros = () => {
  if (informe?.logros) {
    setFormLogros(informe.logros);
  } else {
    setFormLogros({
      participacionEstudiantil: 0,
      docentesCapacitados: 0,
      productosGenerados: 0,
      familiasInvolucradas: 0
    });
  }
  setShowModalLogros(true);
};

const cerrarModalLogros = () => {
  setShowModalLogros(false);
  setFormLogros({
    participacionEstudiantil: 0,
    docentesCapacitados: 0,
    productosGenerados: 0,
    familiasInvolucradas: 0
  });
};

const handleChangeLogros = (e) => {
  const { name, value } = e.target;
  setFormLogros(prev => ({
    ...prev,
    [name]: parseFloat(value) || 0
  }));
};

const handleSubmitLogros = async (e) => {
  e.preventDefault();
  try {
    setError(null);
    
    await actualizarLogros(formLogros);
    setSuccess("Logros actualizados correctamente");
    
    cerrarModalLogros();
    await cargarDatos();
    
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    console.error("Error al guardar logros:", err);
    setError("Error al guardar los logros. Intente nuevamente.");
  }
};

// Renderizar sección de logros
const renderSeccionLogros = () => (
  <Card className="shadow-sm border-0">
    <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">
        <BarChartFill className="me-2" />
        Logros Destacados
      </h5>
      <Button 
        variant="light" 
        size="sm"
        onClick={abrirModalLogros}
      >
        <Pencil className="me-1" />
        Editar
      </Button>
    </Card.Header>
    <Card.Body>
      {informe?.logros ? (
        <Row className="text-center">
          <Col md={3} className="mb-3">
            <div className="p-3 bg-light rounded">
              <h2 className="fw-bold text-success mb-1">
                +{informe.logros.participacionEstudiantil}%
              </h2>
              <small className="text-muted">
                Mejora en participación estudiantil
              </small>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="p-3 bg-light rounded">
              <h2 className="fw-bold text-primary mb-1">
                {informe.logros.docentesCapacitados}%
              </h2>
              <small className="text-muted">
                Docentes capacitados
              </small>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="p-3 bg-light rounded">
              <h2 className="fw-bold text-purple mb-1">
                {informe.logros.productosGenerados}
              </h2>
              <small className="text-muted">
                Productos pedagógicos generados
              </small>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="p-3 bg-light rounded">
              <h2 className="fw-bold text-warning mb-1">
                {informe.logros.familiasInvolucradas}%
              </h2>
              <small className="text-muted">
                Familias involucradas
              </small>
            </div>
          </Col>
        </Row>
      ) : (
        <Alert variant="info">
          No hay logros registrados. Haga clic en "Editar" para agregarlos.
        </Alert>
      )}

      <Alert variant="light" className="mt-3">
        <strong>Nota:</strong> Estos números aparecerán destacados en el resumen ejecutivo del informe final.
      </Alert>
    </Card.Body>
  </Card>
);

// Modal de logros
const renderModalLogros = () => (
  showModalLogros && (
    <div className="modal-overlay" onClick={cerrarModalLogros}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className="fas fa-chart-bar" />
            Editar Logros Destacados
          </h3>
          <button className="modal-close" onClick={cerrarModalLogros}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <form onSubmit={handleSubmitLogros}>
          <div className="modal-body">
            <Alert variant="info" className="small">
              Ingrese los valores que se mostrarán en el resumen del informe final.
            </Alert>

            <div className="form-group">
              <label className="form-label">Mejora en Participación Estudiantil (%)</label>
              <input className="form-input" type="number" name="participacionEstudiantil" value={formLogros.participacionEstudiantil} onChange={handleChangeLogros} min="0" max="100" step="0.1" required />
              <small className="text-muted">Ejemplo: 50 para mostrar "+50%"</small>
            </div>

            <div className="form-group">
              <label className="form-label">Docentes Capacitados (%)</label>
              <input className="form-input" type="number" name="docentesCapacitados" value={formLogros.docentesCapacitados} onChange={handleChangeLogros} min="0" max="100" step="0.1" required />
              <small className="text-muted">Ejemplo: 100 para mostrar "100%"</small>
            </div>

            <div className="form-group">
              <label className="form-label">Productos Pedagógicos Generados (cantidad)</label>
              <input className="form-input" type="number" name="productosGenerados" value={formLogros.productosGenerados} onChange={handleChangeLogros} min="0" step="1" required />
              <small className="text-muted">Ejemplo: 12 materiales, guías, cartillas, etc.</small>
            </div>

            <div className="form-group">
              <label className="form-label">Familias Involucradas (%)</label>
              <input className="form-input" type="number" name="familiasInvolucradas" value={formLogros.familiasInvolucradas} onChange={handleChangeLogros} min="0" max="100" step="0.1" required />
              <small className="text-muted">Ejemplo: 85 para mostrar "85%"</small>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={cerrarModalLogros}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-floppy-disk" /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
);


  // Loading state
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando panel de administración...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Alertas */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Encabezado */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">
          <FileTextFill className="me-2" />
          Panel de Administración - Informe FONDEP
        </h1>
        <p className="lead text-muted">
          Gestión completa del informe final del proyecto
        </p>
      </div>

      {/* Tabs de administración */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="metadata" title="Información General">
          {renderMetadataSection()}
        </Tab>
        
        <Tab eventKey="resultados" title="Resultados">
            {renderTablaResultados()}
        </Tab>

        <Tab eventKey="fases" title="Fases IAPE">
            {renderTablaFases()}
        </Tab>
        
        <Tab eventKey="logros" title="Logros Destacados">
             {renderSeccionLogros()}
        </Tab>
      </Tabs>

      {/* Modales */}
      {renderModalMetadata()}
      {renderModalResultado()}
      {renderModalFase()}
      {renderModalLogros()}
    </Container>
  );
};

export default AdminInforme;