import { useState, useEffect, useCallback, useRef } from 'react';
import { eventosService } from '../services/eventosService';

/* ── Helpers ── */
const MONTHS = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

const parseFecha = (str) => {
  const parts = (str || '').split('T')[0].split('-');
  return {
    day:   parts[2] ? parseInt(parts[2]) : '—',
    month: parts[1] ? MONTHS[parseInt(parts[1]) - 1] : '',
    year:  parts[0] || '',
  };
};

const formatTime = (str) => {
  if (!str) return null;
  const [h, m] = str.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const INIT_FORM = {
  titulo: '', descripcion: '', fecha_evento: '',
  hora_inicio: '', hora_fin: '', ubicacion: '', imagen: null,
};

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i className={`fas fa-${t.type === 'success' ? 'circle-check' : 'circle-xmark'}`} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL FORM — Crear / Editar
══════════════════════════════════════════════════════════ */
function EventoModal({ onClose, onSaved, editando }) {
  const isEdit = Boolean(editando);
  const fileRef = useRef(null);

  const [form, setForm] = useState(() => editando ? {
    titulo:       editando.titulo       || '',
    descripcion:  editando.descripcion  || '',
    fecha_evento: editando.fecha_evento?.split('T')[0] || '',
    hora_inicio:  editando.hora_inicio  || '',
    hora_fin:     editando.hora_fin     || '',
    ubicacion:    editando.ubicacion    || '',
    imagen:       null,
  } : { ...INIT_FORM });

  const [preview, setPreview] = useState(editando?.imagen || null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('Máximo 5 MB'); return; }
    setForm(f => ({ ...f, imagen: file }));
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.fecha_evento) {
      setError('Título y fecha son obligatorios'); return;
    }
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      if (isEdit) {
        await eventosService.update(editando.id, fd);
        onSaved('Evento actualizado correctamente');
      } else {
        await eventosService.create(fd);
        onSaved('Evento creado correctamente');
      }
    } catch {
      setError('Error al guardar el evento');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 560 }}>
        <div className="modal-header">
          <h3>
            <i className={`fas fa-${isEdit ? 'pencil' : 'calendar-plus'}`}
              style={{ color: 'var(--accent)' }} />
            {isEdit ? 'Editar Evento' : 'Nuevo Evento'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
                background: 'var(--danger-soft)', border: '1px solid rgba(248,81,73,.3)',
                color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <i className="fas fa-exclamation-circle" />{error}
              </div>
            )}

            {/* Imagen */}
            <div className="form-group">
              <label className="form-label">
                Imagen <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(JPG/PNG/WEBP · máx 5 MB)</span>
              </label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                padding: '16px', border: '2px dashed var(--border)', borderRadius: 10,
                cursor: 'pointer', transition: 'border-color .2s', background: 'var(--bg-elevated)',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={handleImagen} style={{ display: 'none' }} />
                {preview ? (
                  <img src={preview} alt="Preview"
                    style={{ maxHeight: 140, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <>
                    <i className="fas fa-cloud-arrow-up" style={{ fontSize: 24, color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Haz clic para seleccionar imagen</span>
                  </>
                )}
              </label>
              {preview && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 6 }}
                  onClick={() => { setPreview(null); setForm(f => ({ ...f, imagen: null })); if (fileRef.current) fileRef.current.value = ''; }}>
                  <i className="fas fa-xmark" /> Quitar imagen
                </button>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Título *</label>
              <input className="form-input" name="titulo"
                value={form.titulo} onChange={set}
                placeholder="Ej: Día del Logro Escolar 2025" maxLength={200} />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-input" name="descripcion" rows={3}
                value={form.descripcion} onChange={set}
                placeholder="Describe el evento..." style={{ resize: 'vertical', minHeight: 80 }} />
            </div>

            <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Fecha *</label>
                <input type="date" className="form-input" name="fecha_evento"
                  value={form.fecha_evento} onChange={set} />
              </div>
              <div className="form-group">
                <label className="form-label">Hora inicio</label>
                <input type="time" className="form-input" name="hora_inicio"
                  value={form.hora_inicio} onChange={set} />
              </div>
              <div className="form-group">
                <label className="form-label">Hora fin</label>
                <input type="time" className="form-input" name="hora_fin"
                  value={form.hora_fin} onChange={set} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ubicación</label>
              <input className="form-input" name="ubicacion"
                value={form.ubicacion} onChange={set}
                placeholder="Ej: Pabellón Central, Aula 201" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? <><i className="fas fa-spinner fa-spin" />Guardando...</>
                : <><i className={`fas fa-${isEdit ? 'floppy-disk' : 'calendar-plus'}`} />
                    {isEdit ? 'Actualizar' : 'Crear Evento'}</>}
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
function ConfirmModal({ evento, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 400 }}>
        <div className="modal-header">
          <h3>
            <i className="fas fa-triangle-exclamation" style={{ color: 'var(--danger)' }} />
            Eliminar Evento
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
          <div className="confirm-icon">
            <i className="fas fa-calendar-xmark" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            ¿Eliminar este evento?
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 8 }}>
            "{evento.titulo}"
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin" />Eliminando...</>
              : <><i className="fas fa-trash" />Eliminar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta de evento ── */
function EventoCard({ ev, onEdit, onDelete, upcoming }) {
  const { day, month, year } = parseFecha(ev.fecha_evento);
  const t1 = formatTime(ev.hora_inicio);
  const t2 = formatTime(ev.hora_fin);

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: `1px solid ${upcoming ? 'rgba(244,63,94,.35)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      transition: 'transform var(--transition), box-shadow var(--transition)',
      opacity: upcoming ? 1 : 0.7,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Imagen o banner de color */}
      {ev.imagen ? (
        <div style={{ height: 120, overflow: 'hidden' }}>
          <img src={ev.imagen} alt={ev.titulo}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => e.target.parentElement.style.display = 'none'} />
        </div>
      ) : (
        <div style={{
          height: 8,
          background: upcoming
            ? 'linear-gradient(90deg, var(--accent), var(--accent-hover))'
            : 'var(--border)',
        }} />
      )}

      <div style={{ padding: '16px 18px' }}>
        {/* Fecha + título */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {/* Badge fecha */}
          <div style={{
            flexShrink: 0,
            background: upcoming ? 'var(--accent)' : 'var(--bg-elevated)',
            borderRadius: 10, padding: '8px 12px',
            textAlign: 'center', minWidth: 52,
            boxShadow: upcoming ? '0 4px 14px rgba(244,63,94,.35)' : 'none',
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800, lineHeight: 1,
              color: upcoming ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--mono)',
            }}>{day}</div>
            <div style={{
              fontSize: 9, textTransform: 'uppercase', fontWeight: 700,
              letterSpacing: '.06em',
              color: upcoming ? 'rgba(255,255,255,.75)' : 'var(--text-muted)',
            }}>{month}</div>
            <div style={{
              fontSize: 10, color: upcoming ? 'rgba(255,255,255,.6)' : 'var(--text-disabled)',
              fontFamily: 'var(--mono)',
            }}>{year}</div>
          </div>

          {/* Contenido */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.3, marginBottom: 6,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }} title={ev.titulo}>
              {ev.titulo}
            </div>

            {(t1 || t2) && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <i className="fas fa-clock" style={{ fontSize: 10, color: upcoming ? 'var(--accent)' : 'var(--text-muted)' }} />
                {t1}{t2 ? ` – ${t2}` : ''}
              </div>
            )}

            {ev.ubicacion && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <i className="fas fa-location-dot" style={{ fontSize: 10, color: upcoming ? 'var(--accent)' : 'var(--text-muted)' }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.ubicacion}
                </span>
              </div>
            )}

            {ev.descripcion && (
              <div style={{
                fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {ev.descripcion}
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}
            onClick={() => onEdit(ev)}>
            <i className="fas fa-pencil" />Editar
          </button>
          <button className="btn btn-icon btn-danger btn-sm"
            onClick={() => onDelete(ev)}>
            <i className="fas fa-trash" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function Eventos() {
  const [eventos,  setEventos]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toasts,   setToasts]   = useState([]);
  const [tab,      setTab]      = useState('proximos');

  const toast = (text, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const cargarEventos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventosService.getAllAdmin();
      setEventos(Array.isArray(data) ? data : []);
    } catch {
      toast('Error al cargar eventos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarEventos(); }, [cargarEventos]);

  const today = new Date().toISOString().split('T')[0];

  const filtered = eventos.filter(e =>
    !search ||
    e.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    e.ubicacion?.toLowerCase().includes(search.toLowerCase())
  );

  const proximos = filtered.filter(e => (e.fecha_evento || '').split('T')[0] >= today);
  const pasados  = filtered.filter(e => (e.fecha_evento || '').split('T')[0] <  today);
  const lista    = tab === 'proximos' ? proximos : pasados;

  const handleSaved = (msg) => {
    setModal(null); setSelected(null);
    cargarEventos(); toast(msg);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await eventosService.delete(selected.id);
      setModal(null); setSelected(null);
      cargarEventos();
      toast('Evento eliminado correctamente');
    } catch {
      toast('Error al eliminar el evento', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-section">
      <Toast toasts={toasts} />

      {/* ── Cabecera ── */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Eventos</h2>
          <p className="section-subtitle">Gestión de eventos y actividades institucionales</p>
        </div>
        <button className="btn btn-primary"
          onClick={() => { setSelected(null); setModal('form'); }}>
          <i className="fas fa-calendar-plus" />Nuevo Evento
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-row">
        {[
          { label: 'Total',    value: eventos.length, bg: 'linear-gradient(135deg,#f43f5e,#e11d48)', icon: 'fa-calendar-days' },
          { label: 'Próximos', value: eventos.filter(e => (e.fecha_evento||'').split('T')[0] >= today).length, bg: 'linear-gradient(135deg,#2f81f7,#388bfd)', icon: 'fa-calendar-check' },
          { label: 'Pasados',  value: eventos.filter(e => (e.fecha_evento||'').split('T')[0] <  today).length, bg: 'linear-gradient(135deg,#768390,#57606a)', icon: 'fa-clock-rotate-left' },
        ].map(c => (
          <div key={c.label} className="stats-row-card">
            <div className="stats-row-icon" style={{ background: c.bg }}>
              <i className={`fas ${c.icon}`} style={{ fontSize: 14 }} />
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
          <i className="fas fa-magnifying-glass" />
          <input
            placeholder="Buscar por título o ubicación..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
              <i className="fas fa-xmark" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 3,
        }}>
          {[
            { id: 'proximos', label: 'Próximos', icon: 'fa-calendar-check',   count: proximos.length },
            { id: 'pasados',  label: 'Pasados',  icon: 'fa-clock-rotate-left', count: pasados.length  },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
                background: tab === t.id ? 'var(--accent)' : 'none',
                color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                transition: 'all .2s',
              }}
            >
              <i className={`fas ${t.icon}`} />
              {t.label}
              <span style={{
                background: tab === t.id ? 'rgba(255,255,255,.25)' : 'var(--bg-elevated)',
                color: tab === t.id ? '#fff' : 'var(--text-muted)',
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, fontFamily: 'var(--mono)',
              }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <button className="btn btn-ghost btn-sm" onClick={cargarEventos}
          style={{ marginLeft: 'auto' }} title="Actualizar">
          <i className="fas fa-arrows-rotate" />
        </button>
      </div>

      {/* ── Grid de tarjetas ── */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Cargando eventos...</p>
        </div>
      ) : lista.length === 0 ? (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div className="empty-state">
            <i className="fas fa-calendar-days" />
            <p>
              {search
                ? 'No se encontraron eventos con esa búsqueda'
                : tab === 'proximos' ? 'No hay eventos próximos' : 'No hay eventos pasados'}
            </p>
            {!search && tab === 'proximos' && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }}
                onClick={() => { setSelected(null); setModal('form'); }}>
                <i className="fas fa-calendar-plus" />Agregar evento
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {lista.map(ev => (
            <EventoCard
              key={ev.id}
              ev={ev}
              upcoming={tab === 'proximos'}
              onEdit={(ev) => { setSelected(ev); setModal('form'); }}
              onDelete={(ev) => { setSelected(ev); setModal('delete'); }}
            />
          ))}
        </div>
      )}

      {/* ── Modales ── */}
      {modal === 'form' && (
        <EventoModal
          editando={selected}
          onClose={() => { setModal(null); setSelected(null); }}
          onSaved={handleSaved}
        />
      )}

      {modal === 'delete' && selected && (
        <ConfirmModal
          evento={selected}
          loading={deleting}
          onClose={() => { setModal(null); setSelected(null); }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
