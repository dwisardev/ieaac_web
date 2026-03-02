// AdminNoticias.jsx — Ruta: src/pages/Admin/AdminNoticias.jsx
// Lógica idéntica al original. Mejoras: Bootstrap Icons en lugar de FontAwesome,
// toggle destacada directo desde la tabla (PATCH /destacar), y noticiasService completo.
import { useState, useEffect, useCallback } from 'react';
import { noticiasService } from '../services/noticiasService';
import { useAuth } from '../context/AuthContext';

/* ── Helpers ── */
const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || '';
const imgUrl = (imagen) => {
  if (!imagen) return null;
  if (imagen.startsWith('http')) return imagen;
  return `${UPLOAD_URL}/noticias/${imagen}`;
};
const fmtFecha = (f) =>
  f ? new Date(f).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const CATEGORIAS = ['Académico', 'Deportes', 'Cultural', 'Institucional', 'Administrativo', 'FONDEP', 'General'];
const PER_PAGE = 8;

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position:'fixed', top:20, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'success' ? 'var(--success, #1a7a4a)' : 'var(--danger, #c0392b)',
          color:'#fff', padding:'0.75rem 1.25rem', borderRadius:10,
          boxShadow:'0 4px 20px rgba(0,0,0,0.2)', fontSize:'0.875rem', fontWeight:600,
          display:'flex', alignItems:'center', gap:8, minWidth:280,
          animation:'slideInRight 0.3s ease',
        }}>
          <i className={`bi bi-${t.type === 'success' ? 'check-circle-fill' : 'x-circle-fill'}`} />
          {t.text}
        </div>
      ))}
      <style>{`@keyframes slideInRight{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL CREAR / EDITAR
   Misma lógica FormData del original, mismos campos
══════════════════════════════════════════════════════════ */
function NoticiaModal({ onClose, onSaved, editando }) {
  const { user } = useAuth();
  const isEdit = Boolean(editando);

  const [form, setForm] = useState({
    titulo:      editando?.titulo      || '',
    descripcion: editando?.descripcion || '',
    contenido:   editando?.contenido   || '',
    categoria:   editando?.categoria   || '',
    fecha:       editando?.fecha       || new Date().toISOString().slice(0,10),
    destacada:   editando?.destacada   || false,
    imagen:      null,
  });
  const [preview, setPreview] = useState(editando ? imgUrl(editando.imagen) : null);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    setErrors(er => { const n = { ...er }; delete n[field]; return n; });
  };

  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) {
      setErrors(er => ({ ...er, imagen: 'Solo JPG, PNG, WEBP o GIF' })); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(er => ({ ...er, imagen: 'Máximo 5 MB' })); return;
    }
    setForm(f => ({ ...f, imagen: file }));
    setPreview(URL.createObjectURL(file));
    setErrors(er => { const n = { ...er }; delete n.imagen; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.titulo.trim())      e.titulo      = 'El título es requerido';
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es requerida';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const valErr = validate();
    if (Object.keys(valErr).length) { setErrors(valErr); return; }
    setSaving(true);

    // Mismo FormData que el original
    const fd = new FormData();
    fd.append('titulo',      form.titulo.trim());
    fd.append('descripcion', form.descripcion.trim());
    fd.append('contenido',   form.contenido.trim());
    fd.append('categoria',   form.categoria);
    fd.append('fecha',       form.fecha);
    fd.append('destacada',   form.destacada ? 1 : 0);
    fd.append('autor_id',    user?.id       || '');
    fd.append('autor',       user?.nombre   || user?.username || '');
    if (form.imagen) fd.append('imagen', form.imagen);

    try {
      if (isEdit) {
        await noticiasService.update(editando.id, fd);
      } else {
        await noticiasService.create(fd);
      }
      onSaved(isEdit ? 'Noticia actualizada correctamente' : 'Noticia creada correctamente');
    } catch (err) {
      setErrors({ general: err.message || 'Error al guardar la noticia' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width:580 }}>

        {/* Header */}
        <div className="modal-header">
          <h3>
            <i className={`bi bi-${isEdit ? 'pencil-square' : 'plus-circle-fill'}`}
              style={{ color:'var(--accent)' }} />
            {isEdit ? 'Editar Noticia' : 'Nueva Noticia'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight:'72vh', overflowY:'auto' }}>

            {errors.general && (
              <div style={{
                padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13,
                background:'var(--danger-soft, #fde8e8)', border:'1px solid rgba(192,57,43,.3)',
                color:'var(--danger, #c0392b)', display:'flex', alignItems:'center', gap:8,
              }}>
                <i className="bi bi-exclamation-circle-fill" />{errors.general}
              </div>
            )}

            {/* Título */}
            <div className="form-group">
              <label className="form-label">Título *</label>
              <input className={`form-input${errors.titulo ? ' input-error' : ''}`}
                value={form.titulo} onChange={set('titulo')}
                placeholder="Título de la noticia" maxLength={200} />
              {errors.titulo && <p className="form-error"><i className="bi bi-exclamation-triangle" />{errors.titulo}</p>}
            </div>

            {/* Descripción */}
            <div className="form-group">
              <label className="form-label">Descripción corta *</label>
              <textarea className={`form-input${errors.descripcion ? ' input-error' : ''}`}
                rows={2} value={form.descripcion} onChange={set('descripcion')}
                placeholder="Resumen breve visible en el listado del portal"
                maxLength={500} style={{ resize:'vertical', minHeight:64 }} />
              {errors.descripcion && <p className="form-error"><i className="bi bi-exclamation-triangle" />{errors.descripcion}</p>}
            </div>

            {/* Contenido */}
            <div className="form-group">
              <label className="form-label">Contenido completo</label>
              <textarea className="form-input" rows={5}
                value={form.contenido} onChange={set('contenido')}
                placeholder="Contenido detallado de la noticia..."
                style={{ resize:'vertical', minHeight:120 }} />
            </div>

            <div className="form-row">
              {/* Categoría */}
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select className="form-input" value={form.categoria} onChange={set('categoria')}>
                  <option value="">Sin categoría</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Fecha */}
              <div className="form-group">
                <label className="form-label">Fecha de publicación</label>
                <input type="date" className="form-input"
                  value={form.fecha} onChange={set('fecha')} />
              </div>
            </div>

            {/* Destacada toggle — mismo estilo que original */}
            <div className="form-group">
              <label className="form-label">Visibilidad en el portal</label>
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginTop:4 }}>
                <div
                  onClick={() => setForm(f => ({ ...f, destacada: !f.destacada }))}
                  style={{
                    width:44, height:24, borderRadius:12, cursor:'pointer',
                    background: form.destacada ? 'var(--accent, #c8952a)' : 'var(--border, #444)',
                    position:'relative', transition:'background .2s', flexShrink:0,
                  }}
                >
                  <div style={{
                    position:'absolute', top:3, left: form.destacada ? 23 : 3,
                    width:18, height:18, background:'#fff', borderRadius:'50%',
                    transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.3)',
                  }} />
                </div>
                <span style={{ fontSize:13, color:'var(--text-secondary)' }}>
                  {form.destacada
                    ? <><i className="bi bi-star-fill" style={{ color:'var(--accent, #c8952a)', marginRight:5 }} />Destacada en inicio</>
                    : 'No destacada'}
                </span>
              </label>
            </div>

            {/* Imagen */}
            <div className="form-group">
              <label className="form-label">Imagen <span style={{ fontSize:11, color:'var(--text-muted)' }}>(JPG/PNG/WEBP · máx 5 MB)</span></label>
              <label style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                padding:'20px 16px', border:'2px dashed var(--border)',
                borderRadius:10, cursor:'pointer', transition:'border-color .2s',
                background:'var(--bg-elevated)',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent, #c8952a)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImagen} style={{ display:'none' }} />
                {preview ? (
                  <img src={preview} alt="Preview"
                    style={{ maxHeight:160, maxWidth:'100%', borderRadius:8, objectFit:'cover' }}
                    onError={e => e.target.style.display='none'} />
                ) : (
                  <>
                    <i className="bi bi-cloud-arrow-up-fill" style={{ fontSize:28, color:'var(--text-muted)' }} />
                    <span style={{ fontSize:13, color:'var(--text-muted)', textAlign:'center' }}>
                      Haz clic para seleccionar imagen
                    </span>
                  </>
                )}
              </label>
              {preview && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop:6 }}
                  onClick={() => { setPreview(null); setForm(f => ({ ...f, imagen:null })); }}>
                  <i className="bi bi-x-circle" /> Quitar imagen
                </button>
              )}
              {errors.imagen && <p className="form-error"><i className="bi bi-exclamation-triangle" />{errors.imagen}</p>}
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? <><i className="bi bi-arrow-repeat" style={{ animation:'spin 1s linear infinite' }} />Guardando...</>
                : <><i className={`bi bi-${isEdit ? 'floppy-fill' : 'plus-lg'}`} />
                    {isEdit ? 'Actualizar noticia' : 'Publicar noticia'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL CONFIRMAR ELIMINAR
══════════════════════════════════════════════════════════ */
function ConfirmModal({ noticia, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width:400 }}>
        <div className="modal-header">
          <h3>
            <i className="bi bi-exclamation-triangle-fill" style={{ color:'var(--danger)' }} />
            Eliminar Noticia
          </h3>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body" style={{ textAlign:'center', padding:'24px' }}>
          <div className="confirm-icon">
            <i className="bi bi-newspaper" style={{ fontSize:'2rem' }} />
          </div>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:6 }}>
            ¿Eliminar esta noticia?
          </p>
          <p style={{ fontSize:12, color:'var(--text-secondary)', fontStyle:'italic', marginBottom:8 }}>
            "{noticia.titulo}"
          </p>
          <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>
            La noticia dejará de aparecer en el portal (soft delete).
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading
              ? <><i className="bi bi-arrow-repeat" />Eliminando...</>
              : <><i className="bi bi-trash3-fill" />Eliminar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function Noticias() {
  const [noticias,  setNoticias]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterDes, setFilterDes] = useState('');
  const [page,      setPage]      = useState(1);
  const [modal,     setModal]     = useState(null);   // null | 'form' | 'delete'
  const [selected,  setSelected]  = useState(null);
  const [deleting,  setDeleting]  = useState(false);
  const [toggling,  setToggling]  = useState(null);   // id de la fila en toggle
  const [toasts,    setToasts]    = useState([]);

  /* ── Carga ── */
  const cargarNoticias = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await noticiasService.getAllAdmin();
      setNoticias(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setError('Error al cargar noticias. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarNoticias(); }, [cargarNoticias]);

  const toast = (text, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const handleSaved = (msg) => {
    setModal(null); setSelected(null);
    cargarNoticias(); toast(msg);
  };

  const handleEliminar = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await noticiasService.delete(selected.id);
      setModal(null); setSelected(null);
      cargarNoticias();
      toast('Noticia eliminada correctamente');
    } catch {
      toast('Error al eliminar la noticia', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Toggle destacada directo desde tabla ──
     Usa PATCH /api/admin/noticias/{id}/destacar del controller */
  const handleToggleDestacada = async (n) => {
    setToggling(n.id);
    try {
      await noticiasService.toggleDestacada(n.id);
      setNoticias(prev => prev.map(x =>
        x.id === n.id ? { ...x, destacada: !x.destacada } : x
      ));
      toast(n.destacada ? 'Noticia desmarcada como destacada' : 'Noticia marcada como destacada');
    } catch {
      toast('Error al cambiar estado', 'error');
    } finally {
      setToggling(null);
    }
  };

  /* ── Filtros frontend (coincide con los filtros del controller) ── */
  const filtered = noticias.filter(n => {
    const q  = search.toLowerCase();
    const mQ = !q || n.titulo?.toLowerCase().includes(q) || n.descripcion?.toLowerCase().includes(q);
    const mC = !filterCat || n.categoria === filterCat;
    const mD = filterDes === ''  ? true
             : filterDes === '1' ? n.destacada
             :                     !n.destacada;
    return mQ && mC && mD;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const counts = {
    total:      noticias.length,
    destacadas: noticias.filter(n => n.destacada).length,
    academico:  noticias.filter(n => n.categoria === 'Académico').length,
    cultural:   noticias.filter(n => n.categoria === 'Cultural').length,
    deportes:   noticias.filter(n => n.categoria === 'Deportes').length,
  };

  return (
    <div className="page-section">

      {/* ── Cabecera ── */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Noticias</h2>
          <p className="section-subtitle">Gestión de noticias y publicaciones del portal</p>
        </div>
        <button className="btn btn-primary"
          onClick={() => { setSelected(null); setModal('form'); }}>
          <i className="bi bi-plus-lg" />Nueva Noticia
        </button>
      </div>

      {/* ── Stats — mismas métricas que el original ── */}
      <div className="stats-row">
        {[
          { label:'Total',      value:counts.total,      bg:'linear-gradient(135deg,#2f81f7,#388bfd)', icon:'bi-newspaper'      },
          { label:'Destacadas', value:counts.destacadas, bg:'linear-gradient(135deg,#d29922,#bb8009)', icon:'bi-star-fill'      },
          { label:'Académico',  value:counts.academico,  bg:'linear-gradient(135deg,#3fb950,#2da44e)', icon:'bi-mortarboard-fill'},
          { label:'Cultural',   value:counts.cultural,   bg:'linear-gradient(135deg,#a371f7,#8957e5)', icon:'bi-palette-fill'   },
          { label:'Deportes',   value:counts.deportes,   bg:'linear-gradient(135deg,#f85149,#da3633)', icon:'bi-trophy-fill'    },
        ].map(c => (
          <div key={c.label} className="stats-row-card">
            <div className="stats-row-icon" style={{ background:c.bg }}>
              <i className={`bi ${c.icon}`} style={{ fontSize:14 }} />
            </div>
            <div>
              <div className="stats-row-value">{c.value}</div>
              <div className="stats-row-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="search-input">
          <i className="bi bi-search" />
          <input placeholder="Buscar título o descripción..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:12 }}>
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        <select className="filter-select" value={filterCat}
          onChange={e => { setFilterCat(e.target.value); setPage(1); }}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="filter-select" value={filterDes}
          onChange={e => { setFilterDes(e.target.value); setPage(1); }}>
          <option value="">Todas</option>
          <option value="1">Solo destacadas</option>
          <option value="0">No destacadas</option>
        </select>

        {(search || filterCat || filterDes) && (
          <button className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(''); setFilterCat(''); setFilterDes(''); setPage(1); }}>
            <i className="bi bi-arrow-counterclockwise" />Limpiar
          </button>
        )}

        <button className="btn btn-ghost btn-sm" onClick={cargarNoticias}
          style={{ marginLeft:'auto' }} title="Actualizar">
          <i className="bi bi-arrow-clockwise" />
        </button>
      </div>

      {/* ── Tabla ── */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Cargando noticias...</p>
        </div>
      ) : error ? (
        <div className="table-card">
          <div className="empty-state">
            <i className="bi bi-exclamation-circle" style={{ color:'var(--danger)' }} />
            <p style={{ color:'var(--danger)', marginBottom:12 }}>{error}</p>
            <button className="btn btn-ghost btn-sm" onClick={cargarNoticias}>
              <i className="bi bi-arrow-clockwise" />Reintentar
            </button>
          </div>
        </div>
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Noticia</th>
                <th>Categoría</th>
                <th>Destacada</th>
                <th>Fecha</th>
                <th style={{ textAlign:'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <i className="bi bi-newspaper" />
                    <p>No se encontraron noticias con esos filtros</p>
                  </div>
                </td></tr>
              ) : paginated.map(n => (
                <tr key={n.id}>

                  {/* Thumbnail + título + descripción */}
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{
                        width:56, height:42, borderRadius:8, flexShrink:0,
                        overflow:'hidden', background:'var(--bg-elevated)',
                        border:'1px solid var(--border)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        {imgUrl(n.imagen)
                          ? <img src={imgUrl(n.imagen)} alt=""
                              style={{ width:'100%', height:'100%', objectFit:'cover' }}
                              onError={e => e.target.style.display='none'} />
                          : <i className="bi bi-image" style={{ color:'var(--text-muted)', fontSize:16 }} />
                        }
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', lineHeight:1.3, maxWidth:300 }}>
                          {n.titulo}
                        </div>
                        <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2, maxWidth:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {n.descripcion}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td>
                    {n.categoria
                      ? <span className="badge badge-usuario">{n.categoria}</span>
                      : <span style={{ fontSize:11, color:'var(--text-muted)' }}>—</span>}
                  </td>

                  {/* Toggle destacada directo en tabla */}
                  <td>
                    <button
                      className="btn btn-icon btn-ghost btn-sm"
                      title={n.destacada ? 'Quitar de destacadas' : 'Marcar como destacada'}
                      onClick={() => handleToggleDestacada(n)}
                      disabled={toggling === n.id}
                      style={{ color: n.destacada ? 'var(--accent, #c8952a)' : 'var(--text-muted)' }}
                    >
                      {toggling === n.id
                        ? <i className="bi bi-arrow-repeat" style={{ animation:'spin 1s linear infinite' }} />
                        : <i className={`bi bi-star${n.destacada ? '-fill' : ''}`} />
                      }
                    </button>
                    <span style={{ fontSize:11, color: n.destacada ? 'var(--accent, #c8952a)' : 'var(--text-muted)', marginLeft:4 }}>
                      {n.destacada ? 'Sí' : 'No'}
                    </span>
                  </td>

                  {/* Fecha — campo fecha del schema real */}
                  <td>
                    <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--mono, monospace)' }}>
                      {fmtFecha(n.fecha || n.created_at)}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="actions-cell">
                    <button className="btn btn-icon btn-ghost btn-sm" title="Editar"
                      onClick={() => { setSelected(n); setModal('form'); }}>
                      <i className="bi bi-pencil-fill" />
                    </button>
                    <button className="btn btn-icon btn-danger btn-sm" title="Eliminar"
                      onClick={() => { setSelected(n); setModal('delete'); }}>
                      <i className="bi bi-trash3-fill" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación — idéntica al original */}
          {filtered.length > PER_PAGE && (
            <div className="pagination">
              <span>
                Mostrando {(safePage-1)*PER_PAGE+1}–{Math.min(safePage*PER_PAGE, filtered.length)} de {filtered.length}
              </span>
              <div className="page-btns">
                <button className="page-btn" onClick={() => setPage(1)} disabled={safePage===1}>
                  <i className="bi bi-chevron-double-left" style={{ fontSize:10 }} />
                </button>
                <button className="page-btn" onClick={() => setPage(p=>p-1)} disabled={safePage===1}>
                  <i className="bi bi-chevron-left" style={{ fontSize:10 }} />
                </button>

                {Array.from({ length:totalPages }, (_,i) => i+1)
                  .filter(p => p===1 || p===totalPages || Math.abs(p-safePage)<=1)
                  .reduce((acc,p,i,arr) => {
                    if (i>0 && p-arr[i-1]>1) acc.push('…');
                    acc.push(p); return acc;
                  }, [])
                  .map((p,i) => p==='…'
                    ? <span key={`e${i}`} style={{ padding:'0 4px', color:'var(--text-muted)', fontSize:12 }}>…</span>
                    : <button key={p} className={`page-btn${p===safePage?' active':''}`}
                        onClick={() => setPage(p)}>{p}</button>
                  )
                }

                <button className="page-btn" onClick={() => setPage(p=>p+1)} disabled={safePage===totalPages}>
                  <i className="bi bi-chevron-right" style={{ fontSize:10 }} />
                </button>
                <button className="page-btn" onClick={() => setPage(totalPages)} disabled={safePage===totalPages}>
                  <i className="bi bi-chevron-double-right" style={{ fontSize:10 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {modal === 'form' && (
        <NoticiaModal
          onClose={() => { setModal(null); setSelected(null); }}
          onSaved={handleSaved}
          editando={selected}
        />
      )}
      {modal === 'delete' && selected && (
        <ConfirmModal
          noticia={selected}
          onClose={() => { setModal(null); setSelected(null); }}
          onConfirm={handleEliminar}
          loading={deleting}
        />
      )}

      <Toast toasts={toasts} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}