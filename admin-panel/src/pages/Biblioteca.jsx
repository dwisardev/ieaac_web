import { useState, useEffect } from 'react';
import {
  obtenerTodosLibros,
  obtenerCategorias,
  crearLibro,
  actualizarLibro,
  eliminarLibro,
  obtenerEstadisticasBiblioteca,
} from '../services/bibliotecaService';

const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || '';

export default function AdminBiblioteca() {
  const [libros,       setLibros]       = useState([]);
  const [categorias,   setCategorias]   = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editando,     setEditando]     = useState(null);
  const [guardando,    setGuardando]    = useState(false);
  const [busqueda,     setBusqueda]     = useState('');
  const [filtrocat,    setFiltrocat]    = useState('');
  const [confirmId,    setConfirmId]    = useState(null);
  const [toast,        setToast]        = useState(null);
  const [formData,     setFormData]     = useState({
    titulo: '', autor: '', categoria_id: '', descripcion: '', archivo_pdf: null,
  });
  const [pdfNombre,    setPdfNombre]    = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [librosData, catsData, statsData] = await Promise.all([
        obtenerTodosLibros(),
        obtenerCategorias(),
        obtenerEstadisticasBiblioteca().catch(() => null),
      ]);
      setLibros(librosData);
      setCategorias(catsData);
      setStats(statsData);
    } catch {
      showToast('Error al cargar la biblioteca', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Modal ── */
  const abrirNuevo = () => {
    setEditando(null);
    setFormData({ titulo: '', autor: '', categoria_id: '', descripcion: '', archivo_pdf: null });
    setPdfNombre('');
    setShowModal(true);
  };

  const abrirEditar = (l) => {
    setEditando(l);
    setFormData({ titulo: l.titulo, autor: l.autor || '', categoria_id: l.categoria_id, descripcion: l.descripcion || '', archivo_pdf: null });
    setPdfNombre(l.archivo ? l.archivo.split('/').pop() : '');
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditando(null);
    setPdfNombre('');
    setFormData({ titulo: '', autor: '', categoria_id: '', descripcion: '', archivo_pdf: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) { showToast('El título es obligatorio', 'error'); return; }
    if (!formData.categoria_id)  { showToast('Selecciona una categoría', 'error'); return; }
    if (!editando && !formData.archivo_pdf) { showToast('Selecciona un archivo PDF', 'error'); return; }

    setGuardando(true);
    try {
      const fd = new FormData();
      fd.append('titulo',       formData.titulo.trim());
      fd.append('autor',        formData.autor.trim());
      fd.append('categoria_id', formData.categoria_id);
      fd.append('descripcion',  formData.descripcion.trim());
      if (formData.archivo_pdf) fd.append('archivo_pdf', formData.archivo_pdf);

      if (editando) {
        await actualizarLibro(editando.id, fd);
        showToast('Libro actualizado');
      } else {
        await crearLibro(fd);
        showToast('Libro agregado');
      }
      cerrarModal();
      await cargar();
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirmId) return;
    try {
      await eliminarLibro(confirmId);
      setConfirmId(null);
      showToast('Libro eliminado');
      await cargar();
    } catch {
      showToast('Error al eliminar', 'error');
      setConfirmId(null);
    }
  };

  /* ── Helpers ── */
  const catNombre = (id) => categorias.find(c => c.id == id)?.nombre || '—';
  const catColor  = (id) => categorias.find(c => c.id == id)?.color  || 'var(--accent)';

  const filtrados = libros.filter(l => {
    const q = busqueda.toLowerCase();
    const matchQ = !q || l.titulo.toLowerCase().includes(q) || l.autor?.toLowerCase().includes(q);
    const matchC = !filtrocat || String(l.categoria_id) === String(filtrocat);
    return matchQ && matchC;
  });

  const totalDescargas = libros.reduce((s, l) => s + (l.descargas || 0), 0);

  return (
    <div className="page-section">

      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Gestión de Biblioteca Virtual</h1>
          <p className="section-subtitle">Administra los libros y recursos educativos</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>
          <i className="fas fa-plus" /> Agregar Libro
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {[
          { label: 'Total Libros',       value: stats?.totalLibros ?? libros.length, icon: 'fa-book',          color: '#fb923c' },
          { label: 'Categorías',         value: stats?.totalCategorias ?? categorias.length, icon: 'fa-tags', color: '#06b6d4' },
          { label: 'Descargas Totales',  value: stats?.totalDescargas ?? totalDescargas,      icon: 'fa-download', color: '#4ade80' },
          { label: 'Más Descargado',     value: stats?.libroMasDescargado?.titulo?.substring(0, 16) || 'N/A', icon: 'fa-star', color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ '--card-accent': s.color, '--card-bg': s.color + '25' }}>
            <div className="stat-header">
              <div className="stat-icon"><i className={`fas ${s.icon}`} /></div>
            </div>
            <div className="stat-value" style={{ fontSize: typeof s.value === 'string' ? 14 : undefined }}>
              {loading ? '—' : s.value}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-input" style={{ flex: 1, maxWidth: 340 }}>
          <i className="fas fa-magnifying-glass" />
          <input
            placeholder="Buscar por título o autor..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <i className="fas fa-xmark" />
            </button>
          )}
        </div>
        <select className="filter-select" value={filtrocat} onChange={e => setFiltrocat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="loading-state"><div className="loading-spinner" /><p>Cargando...</p></div>
      ) : filtrados.length === 0 ? (
        <div className="table-card">
          <div className="empty-state">
            <i className="fas fa-book-open" />
            <p>{busqueda || filtrocat ? 'No se encontraron libros con esos filtros' : 'No hay libros registrados'}</p>
          </div>
        </div>
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Título / Autor</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'center' }}>Descargas</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((l, i) => (
                <tr key={l.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <i className="fas fa-file-pdf" style={{ color: '#f87171', fontSize: 20, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{l.titulo}</div>
                        {l.descripcion && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {l.descripcion.substring(0, 60)}{l.descripcion.length > 60 && '…'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: catColor(l.categoria_id) + '25', color: catColor(l.categoria_id), border: `1px solid ${catColor(l.categoria_id)}40` }}>
                      {catNombre(l.categoria_id)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-editor">
                      <i className="fas fa-download" /> {l.descargas || 0}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      {l.archivo && (
                        <a href={l.archivo} target="_blank" rel="noopener noreferrer"
                           className="btn btn-ghost btn-sm btn-icon" title="Ver PDF">
                          <i className="fas fa-eye" />
                        </a>
                      )}
                      <button className="btn btn-ghost btn-sm btn-icon" title="Editar" onClick={() => abrirEditar(l)}>
                        <i className="fas fa-pencil" />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" title="Eliminar" onClick={() => setConfirmId(l.id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <span>Mostrando {filtrados.length} de {libros.length} libros</span>
          </div>
        </div>
      )}

      {/* ── Modal Formulario ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 540 }}>
            <div className="modal-header">
              <h3>
                <i className={`fas ${editando ? 'fa-pencil' : 'fa-plus'}`} style={{ color: 'var(--accent)' }} />
                {editando ? 'Editar Libro' : 'Agregar Libro'}
              </h3>
              <button className="modal-close" onClick={cerrarModal}><i className="fas fa-xmark" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Título *</label>
                  <input className="form-input" placeholder="Ej: Álgebra de Baldor"
                    value={formData.titulo} required
                    onChange={e => setFormData(p => ({ ...p, titulo: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Autor</label>
                    <input className="form-input" placeholder="Nombre del autor"
                      value={formData.autor}
                      onChange={e => setFormData(p => ({ ...p, autor: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Categoría *</label>
                    <select className="form-input" value={formData.categoria_id} required
                      onChange={e => setFormData(p => ({ ...p, categoria_id: e.target.value }))}>
                      <option value="">Seleccionar…</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-input" rows={3} placeholder="Descripción breve…"
                    value={formData.descripcion}
                    onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Archivo PDF {!editando && '*'}</label>
                  <input type="file" className="form-input" accept="application/pdf"
                    required={!editando}
                    onChange={e => {
                      const f = e.target.files[0];
                      if (f) { setFormData(p => ({ ...p, archivo_pdf: f })); setPdfNombre(f.name); }
                    }} />
                  {pdfNombre && (
                    <div className="form-hint" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <i className="fas fa-file-pdf" style={{ color: '#f87171' }} /> {pdfNombre}
                    </div>
                  )}
                  <div className="form-hint">{editando ? 'Deja vacío para mantener el archivo actual' : 'Solo PDF · máx 10 MB'}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando…</> : <><i className="fas fa-save" /> {editando ? 'Actualizar' : 'Guardar'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Eliminar ── */}
      {confirmId && (
        <div className="modal-overlay" onClick={() => setConfirmId(null)}>
          <div className="modal" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-trash" style={{ color: 'var(--danger)' }} /> Eliminar Libro</h3>
              <button className="modal-close" onClick={() => setConfirmId(null)}><i className="fas fa-xmark" /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
              <div className="confirm-icon"><i className="fas fa-trash" /></div>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>¿Eliminar este libro?</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>También se eliminará el archivo PDF del servidor.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleEliminar}>
                <i className="fas fa-trash" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <i className={`fas ${toast.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}`} />
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
