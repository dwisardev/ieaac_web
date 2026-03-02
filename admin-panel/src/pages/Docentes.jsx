const Docentes = () => {
  return (
    <div className="page-section">
      <div className="section-header">
        <h2 className="section-title">Gestión de Docentes</h2>
        <button className="btn btn-primary">
          <i className="fas fa-user-plus"></i>
          Agregar Docente
        </button>
      </div>
      
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-chalkboard-teacher"></i>
        </div>
        <h3>Módulo en construcción</h3>
        <p>La gestión de docentes estará disponible próximamente</p>
      </div>
    </div>
  );
};

export default Docentes;