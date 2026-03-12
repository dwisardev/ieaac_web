import { useState, useEffect } from 'react';
import { bannersService } from '../services/bannersService';

const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || '';

function imgUrl(banner) {
  if (!banner?.imagen) return null;
  if (banner.imagen_url)              return banner.imagen_url;
  if (banner.imagen.startsWith('http')) return banner.imagen;
  return `${UPLOAD_URL}/banners/${banner.imagen}`;
}

export default function AdminBanners() {
  const [banners,       setBanners]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [editando,      setEditando]      = useState(null);
  const [preview,       setPreview]       = useState(null);
  const [guardando,     setGuardando]     = useState(false);
  const [toast,         setToast]         = useState(null);
  const [confirmId,     setConfirmId]     = useState(null);
  const [formData,      setFormData]      = useState({
    titulo: '', subtitulo: '', enlace: '', orden: 1, imagen: null,
  });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setBanners(await bannersService.getAll());
    } catch {
      showToast('Error al cargar banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Formulario ── */
  const abrirNuevo = () => {
    setEditando(null);
    setFormData({ titulo: '', subtitulo: '', enlace: '', orden: banners.length + 1, imagen: null });
    setPreview(null);
    setShowModal(true);
  };

  const abrirEditar = (b) => {
    setEditando(b);
    setFormData({ titulo: b.titulo || '', subtitulo: b.subtitulo || '', enlace: b.enlace || '', orden: b.orden || 1, imagen: null });
    setPreview(imgUrl(b));
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditando(null);
    setPreview(null);
    setFormData({ titulo: '', subtitulo: '', enlace: '', orden: 1, imagen: null });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(p => ({ ...p, imagen: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imagen && !editando) {
      showToast('La imagen es obligatoria', 'error'); return;
    }
    setGuardando(true);
    try {
      const fd = new FormData();
      fd.append('titulo',    formData.titulo);
      fd.append('subtitulo', formData.subtitulo);
      fd.append('enlace',    formData.enlace);
      fd.append('orden',     formData.orden);
      if (formData.imagen) fd.append('imagen', formData.imagen);

      if (editando) {
        await bannersService.update(editando.id, fd);
        showToast('Banner actualizado');
      } else {
        await bannersService.create(fd);
        showToast('Banner creado');
      }
      cerrarModal();
      await cargar();
    } catch {
      showToast('Error al guardar el banner', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirmId) return;
    try {
      await bannersService.delete(confirmId);
      setConfirmId(null);
      showToast('Banner eliminado');
      await cargar();
    } catch {
      showToast('Error al eliminar', 'error');
      setConfirmId(null);
    }
  };

  const handleToggle = async (id) => {
    try {
      await bannersService.toggleActivo(id);
      await cargar();
    } catch {
      showToast('Error al cambiar estado', 'error');
    }
  };

  const moverOrden = async (bannerId, dir) => {
    const idx = banners.findIndex(b => b.id === bannerId);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === banners.length - 1)) return;
    const next = [...banners];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    const payload = next.map((b, i) => ({ id: b.id, orden: i + 1 }));
    try {
      await bannersService.updateOrden(payload);
      setBanners(next.map((b, i) => ({ ...b, orden: i + 1 })));
    } catch {
      showToast('Error al reordenar', 'error');
    }
  };

  /* ── Stats ── */
  const total   = banners.length;
  const activos = banners.filter(b => b.activo).length;

  return (
    <div className="page-section">

      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Gestión de Banners</h1>
          <p className="section-subtitle">Administra el carrusel de imágenes del portal</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>
          <i className="fas fa-plus" /> Nuevo Banner
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total',    value: total,           icon: 'fa-images',    color: '#8b5cf6' },
          { label: 'Activos',  value: activos,          icon: 'fa-eye',       color: '#4ade80' },
          { label: 'Inactivos',value: total - activos,  icon: 'fa-eye-slash', color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="stats-row-card">
            <div className="stats-row-icon" style={{ background: s.color }}>
              <i className={`fas ${s.icon}`} />
            </div>
            <div>
              <div className="stats-row-value">{loading ? '—' : s.value}</div>
              <div className="stats-row-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid de banners */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Cargando banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="table-card">
          <div className="empty-state">
            <i className="fas fa-images" />
            <p>No hay banners registrados</p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={abrirNuevo}>
              <i className="fas fa-plus" /> Crear primer banner
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {banners.map((b, idx) => (
            <div key={b.id} className="card" style={{ overflow: 'hidden' }}>
              {/* Imagen */}
              <div style={{ position: 'relative', height: 180, background: 'var(--bg-elevated)' }}>
                {imgUrl(b) ? (
                  <img src={imgUrl(b)} alt={b.titulo || 'Banner'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <i className="fas fa-image" style={{ fontSize: 40, color: 'var(--text-disabled)' }} />
                  </div>
                )}
                {/* Badge orden */}
                <span style={{
                  position: 'absolute', top: 8, left: 8,
                  background: 'rgba(0,0,0,.65)', color: '#fff',
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                }}>
                  #{b.orden}
                </span>
                {/* Badge activo */}
                <button
                  onClick={() => handleToggle(b.id)}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: b.activo ? 'rgba(74,222,128,.85)' : 'rgba(248,113,113,.85)',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                  }}
                >
                  <i className={`fas ${b.activo ? 'fa-eye' : 'fa-eye-slash'}`} style={{ marginRight: 4 }} />
                  {b.activo ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {/* Body */}
              <div className="card-body">
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {b.titulo || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin título</span>}
                </div>
                {b.subtitulo && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {b.subtitulo}
                  </div>
                )}
                {b.enlace && (
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="fas fa-link" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.enlace.length > 35 ? b.enlace.substring(0, 35) + '…' : b.enlace}
                    </span>
                  </div>
                )}

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                  {/* Ordenar */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Subir"
                      onClick={() => moverOrden(b.id, 'up')} disabled={idx === 0}>
                      <i className="fas fa-arrow-up" />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Bajar"
                      onClick={() => moverOrden(b.id, 'down')} disabled={idx === banners.length - 1}>
                      <i className="fas fa-arrow-down" />
                    </button>
                  </div>
                  {/* Editar / Eliminar */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Editar"
                      onClick={() => abrirEditar(b)}>
                      <i className="fas fa-pencil" />
                    </button>
                    <button className="btn btn-danger btn-sm btn-icon" title="Eliminar"
                      onClick={() => setConfirmId(b.id)}>
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Formulario ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 560 }}>
            <div className="modal-header">
              <h3>
                <i className={`fas ${editando ? 'fa-pencil' : 'fa-plus'}`}
                   style={{ color: 'var(--accent)' }} />
                {editando ? 'Editar Banner' : 'Nuevo Banner'}
              </h3>
              <button className="modal-close" onClick={cerrarModal}><i className="fas fa-xmark" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Preview imagen */}
                {preview && (
                  <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', height: 160 }}>
                    <img src={preview} alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Imagen {!editando && '*'}</label>
                  <input type="file" className="form-input" accept="image/*" onChange={handleFile}
                    required={!editando} />
                  <div className="form-hint">1920×600 px recomendado · JPG/PNG/WebP · máx 2 MB</div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Título</label>
                    <input className="form-input" placeholder="Título del banner"
                      value={formData.titulo}
                      onChange={e => setFormData(p => ({ ...p, titulo: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Orden</label>
                    <input type="number" className="form-input" min={1}
                      value={formData.orden}
                      onChange={e => setFormData(p => ({ ...p, orden: +e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subtítulo</label>
                  <input className="form-input" placeholder="Subtítulo opcional"
                    value={formData.subtitulo}
                    onChange={e => setFormData(p => ({ ...p, subtitulo: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Enlace (opcional)</label>
                  <input className="form-input" placeholder="/nosotros, /contacto, https://…"
                    value={formData.enlace}
                    onChange={e => setFormData(p => ({ ...p, enlace: e.target.value }))} />
                  <div className="form-hint">Deja vacío si no quieres que el banner sea clickeable</div>
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
              <h3><i className="fas fa-trash" style={{ color: 'var(--danger)' }} /> Eliminar Banner</h3>
              <button className="modal-close" onClick={() => setConfirmId(null)}><i className="fas fa-xmark" /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
              <div className="confirm-icon"><i className="fas fa-trash" /></div>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>¿Eliminar este banner?</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Esta acción también eliminará la imagen del servidor.</p>
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
