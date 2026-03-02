const Comunicados = () => {
  return (
    <div className="page-section">
      <div className="section-header">
        <h2 className="section-title">Gestión de Comunicados</h2>
        <button className="btn btn-primary">
          <i className="fas fa-plus"></i>
          Nuevo Comunicado
        </button>
      </div>
      
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-bullhorn"></i>
        </div>
        <h3>Módulo en construcción</h3>
        <p>La gestión de comunicados estará disponible próximamente</p>
      </div>
    </div>
  );
};

export default Comunicados;