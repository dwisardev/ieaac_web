import { useState, useEffect } from 'react';
import { logrosService } from '../services/logrosService';

export default function AdminLogros() {
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'Académico',
    fecha_logro: new Date().toISOString().split('T')[0],
    destacado: false,
    imagen: null
  });
  const [previewImagen, setPreviewImagen] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarLogros();
  }, []);

  const cargarLogros = async () => {
    try {
      setLoading(true);
      const data = await logrosService.getAll();
      setLogros(data);
    } catch (err) {
      setError('Error al cargar logros');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, imagen: file }));
      setPreviewImagen(URL.createObjectURL(file));
    } else {
      alert('Por favor selecciona una imagen válida');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'destacado') {
          formDataToSend.append(key, formData[key] ? 1 : 0);
        } else if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (editando) {
        await logrosService.update(editando.id, formDataToSend);
        setSuccess('Logro actualizado correctamente');
      } else {
        await logrosService.create(formDataToSend);
        setSuccess('Logro creado correctamente');
      }

      handleCloseModal();
      cargarLogros();
    } catch (err) {
      setError('Error al guardar el logro');
    }
  };

  const handleEditar = (logro) => {
    setEditando(logro);
    setFormData({
      titulo: logro.titulo,
      descripcion: logro.descripcion,
      categoria: logro.categoria || 'Académico',
      fecha_logro: logro.fecha_logro,
      destacado: logro.destacado || false,
      imagen: null
    });
    setPreviewImagen(logro.imagen || null);
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este logro?')) return;

    try {
      await logrosService.delete(id);
      setSuccess('Logro eliminado correctamente');
      cargarLogros();
    } catch (err) {
      setError('Error al eliminar el logro');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setFormData({
      titulo: '',
      descripcion: '',
      categoria: 'Académico',
      fecha_logro: new Date().toISOString().split('T')[0],
      destacado: false,
      imagen: null
    });
    setPreviewImagen(null);
    setError('');
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

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => window.location.href = '/admin/dashboard'}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
          <h2 className="mb-0">
            <i className="bi bi-trophy me-2 text-warning"></i>
            Gestión de Logros
          </h2>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Logro
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning"></div>
          <p className="text-muted mt-3">Cargando logros...</p>
        </div>
      ) : (
        <div className="row">
          {logros.map(logro => (
            <div key={logro.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                {logro.imagen && (
                  <img 
                    src={logro.imagen} 
                    className="card-img-top" 
                    alt={logro.titulo}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className={`badge bg-${getCategoriaColor(logro.categoria)}`}>
                      <i className="bi bi-tag me-1"></i>
                      {logro.categoria}
                    </span>
                    {logro.destacado && (
                      <span className="badge bg-warning text-dark">
                        <i className="bi bi-star-fill me-1"></i>
                        Destacado
                      </span>
                    )}
                  </div>

                  <h5 className="card-title">{logro.titulo}</h5>
                  <p className="card-text text-muted small">
                    {logro.descripcion.substring(0, 100)}
                    {logro.descripcion.length > 100 && '...'}
                  </p>

                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(logro.fecha_logro).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </small>
                  </div>

                  <div className="d-flex gap-2 pt-3 border-top">
                    <button
                      className="btn btn-sm btn-outline-primary flex-grow-1"
                      onClick={() => handleEditar(logro)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleEliminar(logro.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {logros.length === 0 && (
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-trophy display-1 text-muted"></i>
                  <h4 className="mt-3">No hay logros registrados</h4>
                  <button 
                    className="btn btn-primary mt-2"
                    onClick={() => setShowModal(true)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear primer logro
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title">
                  <i className={`bi ${editando ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                  {editando ? 'Editar Logro' : 'Nuevo Logro'}
                </h5>
                <button className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Título *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Descripción *</label>
                  <textarea
                    className="form-control"
                    name="descripcion"
                    rows="4"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Categoría</label>
                    <select
                      className="form-select"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleInputChange}
                    >
                      <option value="Académico">Académico</option>
                      <option value="Deportivo">Deportivo</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Institucional">Institucional</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Fecha del Logro</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fecha_logro"
                      value={formData.fecha_logro}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Imagen</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImagenChange}
                  />
                  {previewImagen && (
                    <div className="mt-3 text-center">
                      <img 
                        src={previewImagen} 
                        alt="Preview" 
                        className="img-thumbnail"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="destacado"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="destacado">
                    <strong>Destacar logro</strong>
                    <small className="d-block text-muted">
                      Aparecerá resaltado en la página principal
                    </small>
                  </label>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  <i className="bi bi-save me-2"></i>
                  {editando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}