import { useState, useEffect, useRef } from 'react';
import docentesService from '../services/docentesService';

const INIT_FORM = {
  nombre_completo: '',
  nombre_corto: '',
  especialidad: '',
  email: '',
  telefono: '',
  fecha_ingreso: '',
  foto: null,
};

const ESPECIALIDADES = [
  'Comunicación', 'Matemática', 'Ciencias Sociales', 'Ciencia y Tecnología',
  'Educación Física', 'Arte y Cultura', 'Educación Religiosa', 'Inglés',
  'Tutoría', 'Auxiliar de Educación', 'Administración', 'Otra',
];

export default function Docentes() {
  const [docentes, setDocentes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando]   = useState(null);
  const [formData, setFormData]   = useState(INIT_FORM);
  const [preview, setPreview]     = useState(null);
  const [busqueda, setBusqueda]   = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const fileRef = useRef(null);

  useEffect(() => { cargarDocentes(); }, []);

  const cargarDocentes = async () => {
    try {
      setLoading(true);
      const data = await docentesService.getAll();
      setDocentes(data);
    } catch {
      setError('Error al cargar docentes');
    } finally {
      setLoading(false);
    }
  };

  const docentesFiltrados = docentes.filter(d =>
    d.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.especialidad?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, foto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      if (editando) {
        await docentesService.update(editando.id, fd);
        setSuccess('Docente actualizado correctamente');
      } else {
        await docentesService.create(fd);
        setSuccess('Docente creado correctamente');
      }
      cerrarModal();
      cargarDocentes();
    } catch {
      setError('Error al guardar el docente');
    }
  };

  const handleEditar = (doc) => {
    setEditando(doc);
    setFormData({
      nombre_completo: doc.nombre_completo || '',
      nombre_corto: doc.nombre_corto || '',
      especialidad: doc.especialidad || '',
      email: doc.email || '',
      telefono: doc.telefono || '',
      fecha_ingreso: doc.fecha_ingreso || '',
      foto: null,
    });
    setPreview(doc.foto || null);
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este docente del listado activo?')) return;
    try {
      await docentesService.delete(id);
      setSuccess('Docente desactivado correctamente');
      cargarDocentes();
    } catch {
      setError('Error al eliminar');
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditando(null);
    setFormData(INIT_FORM);
    setPreview(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-chalkboard-teacher me-2 text-primary"></i>
          Gestión de Docentes
        </h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-user-plus me-2"></i>Agregar Docente
        </button>
      </div>

      {error   && <div className="alert alert-danger alert-dismissible"><i className="fas fa-exclamation-triangle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="fas fa-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      {/* Búsqueda */}
      <div className="mb-4">
        <div className="input-group" style={{ maxWidth: 400 }}>
          <span className="input-group-text bg-white"><i className="fas fa-search text-muted"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o especialidad..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="row g-3 mb-4">
        <div className="col-auto">
          <div className="badge bg-primary fs-6 px-3 py-2">
            <i className="fas fa-users me-1"></i>
            {docentes.filter(d => d.activo).length} docentes activos
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3 text-muted">Cargando docentes...</p>
        </div>
      ) : (
        <div className="row g-3">
          {docentesFiltrados.map(doc => (
            <div key={doc.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className={`card h-100 shadow-sm border-0 ${!doc.activo ? 'opacity-50' : ''}`}>
                <div className="card-body">
                  {/* Avatar */}
                  <div className="text-center mb-3">
                    {doc.foto ? (
                      <img src={doc.foto} alt={doc.nombre_corto} className="rounded-circle"
                        style={{ width: 80, height: 80, objectFit: 'cover', border: '3px solid #e9ecef' }} />
                    ) : (
                      <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white fw-bold mx-auto"
                        style={{ width: 80, height: 80, fontSize: 28 }}>
                        {doc.nombre_completo?.[0]?.toUpperCase() || 'D'}
                      </div>
                    )}
                  </div>
                  <h6 className="text-center fw-bold mb-1">{doc.nombre_completo}</h6>
                  {doc.especialidad && (
                    <div className="text-center mb-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {doc.especialidad}
                      </span>
                    </div>
                  )}
                  {doc.email && (
                    <p className="text-muted small mb-1 text-center">
                      <i className="fas fa-envelope me-1"></i>
                      <span className="text-truncate d-inline-block" style={{ maxWidth: 160 }} title={doc.email}>
                        {doc.email}
                      </span>
                    </p>
                  )}
                  {doc.telefono && (
                    <p className="text-muted small mb-0 text-center">
                      <i className="fas fa-phone me-1"></i>{doc.telefono}
                    </p>
                  )}
                </div>
                <div className="card-footer bg-transparent border-0 d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary flex-grow-1"
                    onClick={() => handleEditar(doc)}>
                    <i className="fas fa-pencil me-1"></i>Editar
                  </button>
                  <button className="btn btn-sm btn-outline-danger"
                    onClick={() => handleEliminar(doc.id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {docentesFiltrados.length === 0 && !loading && (
            <div className="col-12 text-center py-5">
              <i className="fas fa-chalkboard-teacher fa-4x text-muted mb-3 d-block"></i>
              <h5 className="text-muted">
                {busqueda ? 'No se encontraron resultados' : 'No hay docentes registrados'}
              </h5>
              {!busqueda && (
                <button className="btn btn-primary mt-2" onClick={() => setShowModal(true)}>
                  <i className="fas fa-plus me-2"></i>Agregar primer docente
                </button>
              )}
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
                  <i className={`fas ${editando ? 'fa-pencil' : 'fa-user-plus'} me-2`}></i>
                  {editando ? 'Editar Docente' : 'Nuevo Docente'}
                </h5>
                <button className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}

                  {/* Foto preview */}
                  <div className="text-center mb-4">
                    {preview ? (
                      <img src={preview} alt="Preview" className="rounded-circle mb-2"
                        style={{ width: 90, height: 90, objectFit: 'cover', border: '3px solid #dee2e6' }} />
                    ) : (
                      <div className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center text-white mb-2"
                        style={{ width: 90, height: 90, fontSize: 34 }}>
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                    <div>
                      <label className="form-label small text-muted">Foto de perfil</label>
                      <input ref={fileRef} type="file" accept="image/*"
                        className="form-control form-control-sm mx-auto"
                        style={{ maxWidth: 260 }} onChange={handleFoto} />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-bold">Nombre Completo *</label>
                      <input type="text" className="form-control" name="nombre_completo"
                        value={formData.nombre_completo} onChange={handleChange} required
                        placeholder="Ej: Gerardo Florez Condori" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Nombre Corto *</label>
                      <input type="text" className="form-control" name="nombre_corto"
                        value={formData.nombre_corto} onChange={handleChange} required
                        placeholder="Ej: Prof. Gerardo" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Especialidad</label>
                      <select className="form-select" name="especialidad"
                        value={formData.especialidad} onChange={handleChange}>
                        <option value="">Seleccione...</option>
                        {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Correo Electrónico</label>
                      <input type="email" className="form-control" name="email"
                        value={formData.email} onChange={handleChange}
                        placeholder="correo@gmail.com" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Teléfono / Celular</label>
                      <input type="tel" className="form-control" name="telefono"
                        value={formData.telefono} onChange={handleChange}
                        placeholder="9XXXXXXXX" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Fecha de Ingreso</label>
                      <input type="date" className="form-control" name="fecha_ingreso"
                        value={formData.fecha_ingreso} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                    <i className="fas fa-times me-1"></i>Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-1"></i>
                    {editando ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
