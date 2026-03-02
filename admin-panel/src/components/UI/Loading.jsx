const Loading = ({ message = 'Cargando...' }) => {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default Loading;