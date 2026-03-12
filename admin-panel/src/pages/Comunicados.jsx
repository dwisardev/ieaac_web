import { useState, useEffect } from 'react';
import { comunicadosService } from '../services/comunicadosService';

/* ── Toast ── */
function Toast({ toasts, remove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <i className={`fas fa-${t.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} />
          <span>{t.text}</span>
          <button onClick={() => remove(t.id)} style={{ marginLeft:'auto', background:'none', border:'none', color:'inherit', cursor:'pointer' }}>
            <i className="fas fa-xmark" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (text, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  const remove = id => setToasts(t => t.filter(x => x.id !== id));
  return { toasts, add, remove };
}

/* ── Confirm dialog ── */
function ConfirmModal({ msg, onOk, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" style={{ maxWidth:400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className="fas fa-triangle-exclamation" style={{ color:'var(--danger)' }} />
            Confirmar acción
          </h3>
        </div>
        <div style={{ padding:'0 0 20px' }}>
          <p style={{ color:'var(--text-secondary)', margin:0 }}>{msg}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onOk}>
            <i className="fas fa-trash" /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Badge de tipo ── */
function TipoBadge({ tipo }) {
  const color = {
    'Académico':     'var(--accent)',
    'Administrativo':'var(--warning)',
    'General':       'var(--success)',
  }[tipo] || 'var(--text-muted)';
  return (
    <span style={{
      display:'inline-block', padding:'2px 8px', borderRadius:4,
      fontSize:11, fontWeight:700, background:`${color}22`, color,
      textTransform:'uppercase', letterSpacing:'.04em',
    }}>{tipo}</span>
  );
}

const TIPOS = ['General', 'Académico', 'Administrativo'];

const EMPTY_FORM = {
  titulo: '', contenido: '', tipo: 'General',
  fecha_publicacion: new Date().toISOString().split('T')[0],
  destacado: false, archivo_pdf: null, imagen: null,
};

export default function AdminComunicados() {
  const { toasts, add: toast, remove } = useToast();

  const [comunicados, setComunicados] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editando,    setEditando]    = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [formData,    setFormData]    = useState(EMPTY_FORM);
  const [previewImg,  setPreviewImg]  = useState(null);
  const [confirm,     setConfirm]     = useState(null); // { id, titulo }

  /* Búsqueda / filtro */
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await comunicadosService.getAllAdmin();
      setComunicados(data);
    } catch {
      toast('Error al cargar comunicados', 'error');
    } finally { setLoading(false); }
  };

  /* Filtrado */
  const filtrados = comunicados.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.titulo?.toLowerCase().includes(q) || c.contenido?.toLowerCase().includes(q);
    const matchT = !filtroTipo || c.tipo === filtroTipo;
    return matchQ && matchT;
  });

  /* Formulario */
  const handleInput = e => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleImagen = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Selecciona una imagen válida', 'error'); e.target.value=''; return; }
    setFormData(f => ({ ...f, imagen: file }));
    setPreviewImg(URL.createObjectURL(file));
  };
  const handlePdf = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast('Selecciona un archivo PDF', 'error'); e.target.value=''; return; }
    setFormData(f => ({ ...f, archivo_pdf: file }));
  };

  const openNew = () => {
    setEditando(null);
    setFormData(EMPTY_FORM);
    setPreviewImg(null);
    setShowModal(true);
  };
  const openEdit = c => {
    setEditando(c);
    setFormData({
      titulo: c.titulo, contenido: c.contenido,
      tipo: c.tipo || 'General',
      fecha_publicacion: c.fecha_publicacion,
      destacado: !!c.destacado,
      archivo_pdf: null, imagen: null,
    });
    setPreviewImg(c.imagen || null);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditando(null); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      toast('Título y contenido son obligatorios', 'error'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('titulo',            formData.titulo.trim());
      fd.append('contenido',         formData.contenido.trim());
      fd.append('tipo',              formData.tipo);
      fd.append('fecha_publicacion', formData.fecha_publicacion);
      fd.append('destacado',         formData.destacado ? 1 : 0);
      if (formData.imagen)      fd.append('imagen',      formData.imagen);
      if (formData.archivo_pdf) fd.append('archivo_pdf', formData.archivo_pdf);

      if (editando) {
        await comunicadosService.update(editando.id, fd);
        toast('Comunicado actualizado');
      } else {
        await comunicadosService.create(fd);
        toast('Comunicado creado');
      }
      closeModal();
      cargar();
    } catch {
      toast('Error al guardar el comunicado', 'error');
    } finally { setSaving(false); }
  };

  const handleEliminar = async () => {
    if (!confirm) return;
    try {
      await comunicadosService.delete(confirm.id);
      toast('Comunicado eliminado');
      cargar();
    } catch { toast('Error al eliminar', 'error'); }
    setConfirm(null);
  };

  /* Estadísticas */
  const total     = comunicados.length;
  const destacados = comunicados.filter(c => c.destacado).length;
  const hoy = new Date().toDateString();
  const recientes  = comunicados.filter(c => new Date(c.fecha_publicacion).toDateString() === hoy).length;

  return (
    <div className="page-section">
      <Toast toasts={toasts} remove={remove} />

      {/* Encabezado */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <i className="fas fa-bullhorn" style={{ color:'var(--accent)', marginRight:10 }} />
            Comunicados
          </h2>
          <p className="section-subtitle">Gestión de comunicados institucionales</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus" /> Nuevo Comunicado
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-bullhorn" /></div>
          <div><div className="stat-value">{total}</div><div className="stat-label">Total</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-star" /></div>
          <div><div className="stat-value">{destacados}</div><div className="stat-label">Destacados</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-calendar-day" /></div>
          <div><div className="stat-value">{recientes}</div><div className="stat-label">Hoy</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-list" /></div>
          <div><div className="stat-value">{filtrados.length}</div><div className="stat-label">Filtrados</div></div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="table-card" style={{ padding:'14px 20px', marginBottom:0 }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <div className="search-box" style={{ flex:1, minWidth:200 }}>
            <i className="fas fa-search search-icon" />
            <input
              className="search-input"
              placeholder="Buscar por título o contenido…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-input"
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            style={{ width:'auto', minWidth:160 }}
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize:28 }} />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="table-card" style={{ textAlign:'center', padding:'60px 20px' }}>
          <i className="fas fa-inbox" style={{ fontSize:40, color:'var(--text-disabled)', marginBottom:12 }} />
          <p style={{ color:'var(--text-muted)', margin:0 }}>
            {search || filtroTipo ? 'Sin resultados para los filtros aplicados' : 'No hay comunicados registrados'}
          </p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
          {filtrados.map(c => (
            <ComunicadoCard
              key={c.id}
              c={c}
              onEdit={() => openEdit(c)}
              onDelete={() => setConfirm({ id: c.id, titulo: c.titulo })}
            />
          ))}
        </div>
      )}

      {/* Modal formulario */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card"
            style={{ maxWidth:620, maxHeight:'90vh', overflowY:'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fas fa-bullhorn" />
                {editando ? 'Editar Comunicado' : 'Nuevo Comunicado'}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input className="form-input" name="titulo" value={formData.titulo}
                  onChange={handleInput} placeholder="Título del comunicado" maxLength={300} />
              </div>

              <div className="form-group">
                <label className="form-label">Contenido *</label>
                <textarea className="form-input" name="contenido" value={formData.contenido}
                  onChange={handleInput} placeholder="Texto del comunicado…" rows={5}
                  style={{ resize:'vertical' }} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-input" name="tipo" value={formData.tipo} onChange={handleInput}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de publicación</label>
                  <input className="form-input" type="date" name="fecha_publicacion"
                    value={formData.fecha_publicacion} onChange={handleInput} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Imagen (opcional)</label>
                <input className="form-input" type="file" accept="image/*" onChange={handleImagen} style={{ cursor:'pointer' }} />
                {previewImg && (
                  <img src={previewImg} alt="preview"
                    style={{ marginTop:8, width:'100%', maxHeight:180, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }} />
                )}
                <p className="form-hint">JPG, PNG. Máx 2 MB</p>
              </div>

              <div className="form-group">
                <label className="form-label">Archivo PDF (opcional)</label>
                <input className="form-input" type="file" accept="application/pdf" onChange={handlePdf} style={{ cursor:'pointer' }} />
                {formData.archivo_pdf && (
                  <p style={{ fontSize:12, color:'var(--success)', marginTop:4 }}>
                    <i className="fas fa-check" /> {formData.archivo_pdf.name}
                  </p>
                )}
                <p className="form-hint">Solo PDF. Máx 5 MB</p>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <input type="checkbox" id="destacado" name="destacado"
                  checked={formData.destacado} onChange={handleInput}
                  style={{ width:16, height:16, cursor:'pointer', accentColor:'var(--accent)' }} />
                <label htmlFor="destacado" style={{ fontSize:13, color:'var(--text-primary)', cursor:'pointer', userSelect:'none' }}>
                  Marcar como destacado (aparece en modal del portal)
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving
                    ? <><i className="fas fa-spinner fa-spin" /> Guardando…</>
                    : <><i className="fas fa-floppy-disk" /> {editando ? 'Actualizar' : 'Crear'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirm && (
        <ConfirmModal
          msg={`¿Eliminar el comunicado "${confirm.titulo}"?`}
          onOk={handleEliminar}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

/* ── Tarjeta de comunicado ── */
function ComunicadoCard({ c, onEdit, onDelete }) {
  const fecha = c.fecha_publicacion
    ? new Date(c.fecha_publicacion + 'T00:00:00').toLocaleDateString('es-PE', { day:'numeric', month:'short', year:'numeric' })
    : '';

  return (
    <div style={{
      background:'var(--bg-surface)', border:'1px solid var(--border)',
      borderRadius:'var(--radius-xl)', overflow:'hidden',
      display:'flex', flexDirection:'column',
      transition:'box-shadow .2s, border-color .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.3)'; e.currentTarget.style.borderColor='var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--border)'; }}
    >
      {/* Imagen */}
      {c.imagen && (
        <div style={{ height:150, overflow:'hidden', flexShrink:0 }}>
          <img src={c.imagen} alt={c.titulo}
            style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      )}

      <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', flex:1 }}>
        {/* Badges */}
        <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
          <TipoBadge tipo={c.tipo} />
          {c.destacado && (
            <span style={{
              display:'inline-flex', alignItems:'center', gap:4,
              padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
              background:'rgba(200,149,42,.15)', color:'var(--warning)',
            }}>
              <i className="fas fa-star" style={{ fontSize:9 }} /> Destacado
            </span>
          )}
        </div>

        {/* Título */}
        <h4 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', margin:'0 0 6px', lineHeight:1.4 }}>
          {c.titulo}
        </h4>

        {/* Extracto */}
        <p style={{ fontSize:13, color:'var(--text-secondary)', margin:'0 0 12px', lineHeight:1.5, flex:1 }}>
          {c.contenido?.substring(0, 120)}{c.contenido?.length > 120 && '…'}
        </p>

        {/* Fecha */}
        <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>
          <i className="fas fa-calendar-day" style={{ marginRight:5 }} />{fecha}
        </div>

        {/* Links */}
        {(c.archivo_pdf || c.imagen) && (
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            {c.archivo_pdf && (
              <a href={c.archivo_pdf} target="_blank" rel="noopener noreferrer"
                className="btn btn-ghost btn-sm" style={{ fontSize:11 }}>
                <i className="fas fa-file-pdf" style={{ color:'#f43f5e' }} /> PDF
              </a>
            )}
            {c.imagen && (
              <button className="btn btn-ghost btn-sm" style={{ fontSize:11 }}
                onClick={() => window.open(c.imagen, '_blank')}>
                <i className="fas fa-image" /> Ver imagen
              </button>
            )}
          </div>
        )}

        {/* Acciones */}
        <div style={{ display:'flex', gap:8, marginTop:'auto', paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-sm" onClick={onEdit} style={{ flex:1 }}>
            <i className="fas fa-pencil" /> Editar
          </button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>
            <i className="fas fa-trash" />
          </button>
        </div>
      </div>
    </div>
  );
}
