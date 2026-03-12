import { useState, useEffect, useCallback } from 'react';
import { pedidosAdminService } from '../services/pedidosAdminService';
import { contactoAdminService } from '../services/contactoAdminService';

/* ── Helpers ── */
const fmtFecha = (s) =>
  s ? new Date(s).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const ESTADO_STYLE = {
  pendiente:   { bg: 'var(--warning-soft)',  color: 'var(--warning)', icon: 'fa-clock',        label: 'Pendiente'   },
  leido:       { bg: 'var(--accent-soft)',   color: 'var(--accent)',  icon: 'fa-eye',          label: 'Leído'       },
  respondido:  { bg: 'var(--success-soft)',  color: 'var(--success)', icon: 'fa-circle-check', label: 'Respondido'  },
};

const ROL_LABEL = {
  estudiante:   'Estudiante',
  docente:      'Docente',
  'padre/madre':'Padre/Madre',
  comunidad:    'Comunidad',
  otro:         'Otro',
};

/* ══════════════════════════════════════════════════════════
   BADGE DE ESTADO
══════════════════════════════════════════════════════════ */
function EstadoBadge({ estado }) {
  const s = ESTADO_STYLE[estado] || ESTADO_STYLE.pendiente;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, fontFamily: 'var(--mono)',
    }}>
      <i className={`fas ${s.icon}`} style={{ fontSize: 9 }} />
      {s.label}
    </span>
  );
}

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
   MODAL DETALLE + RESPONDER
══════════════════════════════════════════════════════════ */
function MensajeModal({ item, tipo, onClose, onUpdated }) {
  const [respuesta,  setRespuesta]  = useState(item.respuesta || '');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  const svc = tipo === 'pedidos' ? pedidosAdminService : contactoAdminService;
  const isPedido = tipo === 'pedidos';

  const handleResponder = async (e) => {
    e.preventDefault();
    if (!respuesta.trim()) { setError('Escribe una respuesta antes de enviar'); return; }
    setSaving(true); setError('');
    try {
      await svc.responder(item.id, respuesta.trim());
      onUpdated('Respuesta enviada correctamente');
    } catch {
      setError('Error al enviar la respuesta');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 560 }}>

        <div className="modal-header">
          <h3>
            <i className={`fas fa-${isPedido ? 'book-open' : 'envelope-open'}`}
              style={{ color: 'var(--accent)' }} />
            {isPedido ? 'Pedido de libro' : 'Mensaje de contacto'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-xmark" />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

          {/* Info del remitente */}
          <div style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {item.nombre}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                  {item.email}
                </div>
                {!isPedido && item.rol && (
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
                    <i className="fas fa-users" style={{ marginRight: 5, fontSize: 10 }} />
                    {ROL_LABEL[item.rol] || item.rol}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <EstadoBadge estado={item.estado} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                  {fmtFecha(item.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Contenido del pedido/mensaje */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em',
              color: 'var(--text-muted)', marginBottom: 8,
            }}>
              {isPedido ? 'Libro solicitado' : 'Mensaje'}
            </div>
            {isPedido ? (
              <>
                <div style={{
                  background: 'var(--accent-soft)', border: '1px solid rgba(47,129,247,.2)',
                  borderRadius: 8, padding: '12px 14px', marginBottom: 10,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fas fa-book" style={{ color: 'var(--accent)', fontSize: 12 }} />
                    {item.libro}
                  </div>
                </div>
                {item.detalles && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '8px 0' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                      Detalles adicionales
                    </span>
                    {item.detalles}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '14px', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {item.mensaje}
              </div>
            )}
          </div>

          {/* Respuesta previa (si existe) */}
          {item.respuesta && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em',
                color: 'var(--success)', marginBottom: 8,
              }}>
                <i className="fas fa-circle-check" style={{ marginRight: 5 }} />
                Respuesta enviada
              </div>
              <div style={{
                background: 'var(--success-soft)', border: '1px solid rgba(63,185,80,.25)',
                borderRadius: 8, padding: '12px 14px', fontSize: 13, color: 'var(--text-primary)',
                lineHeight: 1.6, whiteSpace: 'pre-wrap',
              }}>
                {item.respuesta}
              </div>
            </div>
          )}

          {/* Formulario de respuesta */}
          <form onSubmit={handleResponder}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <i className="fas fa-reply" style={{ marginRight: 6, color: 'var(--accent)' }} />
                {item.respuesta ? 'Editar respuesta' : 'Escribir respuesta'}
              </label>
              <textarea
                className="form-input"
                rows={4}
                value={respuesta}
                onChange={e => { setRespuesta(e.target.value); setError(''); }}
                placeholder={isPedido
                  ? 'Ej: Tu pedido ha sido procesado. Puedes retirar el libro en...'
                  : 'Ej: Gracias por contactarnos. En respuesta a tu consulta...'}
                style={{ resize: 'vertical', minHeight: 100 }}
              />
              {error && (
                <p className="form-error" style={{ marginTop: 6 }}>
                  <i className="fas fa-exclamation-circle" />{error}
                </p>
              )}
            </div>
          </form>

        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-success" onClick={handleResponder} disabled={saving}>
            {saving
              ? <><i className="fas fa-spinner fa-spin" />Enviando...</>
              : <><i className="fas fa-paper-plane" />Enviar Respuesta</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL CONFIRMAR ELIMINAR
══════════════════════════════════════════════════════════ */
function ConfirmModal({ tipo, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 380 }}>
        <div className="modal-header">
          <h3>
            <i className="fas fa-triangle-exclamation" style={{ color: 'var(--danger)' }} />
            Eliminar {tipo === 'pedidos' ? 'pedido' : 'mensaje'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
          <div className="confirm-icon"><i className="fas fa-trash" /></div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            ¿Eliminar este {tipo === 'pedidos' ? 'pedido' : 'mensaje'}?
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
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

/* ══════════════════════════════════════════════════════════
   TABLA DE MENSAJES (shared para ambos tabs)
══════════════════════════════════════════════════════════ */
function TablaItems({ items, tipo, onVer, onMarcarLeido, onEliminar, loadingId }) {
  const isPedido = tipo === 'pedidos';

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <i className={`fas fa-${isPedido ? 'book-open' : 'envelope'}`} />
        <p>No hay {isPedido ? 'pedidos de libros' : 'mensajes de contacto'} aún</p>
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: 100 }}>Estado</th>
          <th>Remitente</th>
          <th>{isPedido ? 'Libro solicitado' : 'Mensaje'}</th>
          <th>Fecha</th>
          <th style={{ textAlign: 'right' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}
            style={{ opacity: loadingId === item.id ? 0.5 : 1, cursor: 'pointer' }}
            onClick={() => onVer(item)}
          >
            {/* Estado */}
            <td onClick={e => e.stopPropagation()}>
              <EstadoBadge estado={item.estado} />
            </td>

            {/* Remitente */}
            <td>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                {item.nombre}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                {item.email}
              </div>
              {!isPedido && item.rol && (
                <div style={{ fontSize: 10, color: 'var(--text-disabled)', marginTop: 2 }}>
                  {ROL_LABEL[item.rol] || item.rol}
                </div>
              )}
            </td>

            {/* Contenido */}
            <td>
              <div style={{
                fontSize: 13, color: 'var(--text-secondary)',
                maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {isPedido ? (
                  <><i className="fas fa-book" style={{ fontSize: 10, marginRight: 5, color: 'var(--accent)' }} />{item.libro}</>
                ) : item.mensaje}
              </div>
              {item.respuesta && (
                <div style={{ fontSize: 10, color: 'var(--success)', marginTop: 2 }}>
                  <i className="fas fa-reply" style={{ marginRight: 4 }} />Respondido
                </div>
              )}
            </td>

            {/* Fecha */}
            <td>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                {fmtFecha(item.created_at)}
              </span>
            </td>

            {/* Acciones */}
            <td className="actions-cell" onClick={e => e.stopPropagation()}>
              {item.estado === 'pendiente' && (
                <button className="btn btn-icon btn-ghost btn-sm" title="Marcar como leído"
                  onClick={() => onMarcarLeido(item)}>
                  <i className="fas fa-eye" />
                </button>
              )}
              <button className="btn btn-icon btn-ghost btn-sm" title="Ver y responder"
                onClick={() => onVer(item)}
                style={{ color: 'var(--accent)' }}>
                <i className="fas fa-reply" />
              </button>
              <button className="btn btn-icon btn-danger btn-sm" title="Eliminar"
                onClick={() => onEliminar(item)}>
                <i className="fas fa-trash" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function Mensajes() {
  const [tab,       setTab]       = useState('pedidos');    // 'pedidos' | 'contacto'
  const [pedidos,   setPedidos]   = useState([]);
  const [contactos, setContactos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filtro,    setFiltro]    = useState('');           // estado filter
  const [modal,     setModal]     = useState(null);         // null | 'ver' | 'delete'
  const [selected,  setSelected]  = useState(null);
  const [deleting,  setDeleting]  = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [toasts,    setToasts]    = useState([]);

  const toast = (text, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        pedidosAdminService.getAll(),
        contactoAdminService.getAll(),
      ]);
      setPedidos(p);
      setContactos(c);
    } catch {
      toast('Error al cargar mensajes', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const lista = (tab === 'pedidos' ? pedidos : contactos).filter(item => {
    const q = search.toLowerCase();
    const matchQ = !q || item.nombre?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q) ||
      (tab === 'pedidos' ? item.libro?.toLowerCase().includes(q) : item.mensaje?.toLowerCase().includes(q));
    const matchE = !filtro || item.estado === filtro;
    return matchQ && matchE;
  });

  const pendCount = {
    pedidos:  pedidos.filter(p => p.estado === 'pendiente').length,
    contacto: contactos.filter(c => c.estado === 'pendiente').length,
  };

  const handleMarcarLeido = async (item) => {
    setLoadingId(item.id);
    const svc = tab === 'pedidos' ? pedidosAdminService : contactoAdminService;
    try {
      await svc.marcarLeido(item.id);
      tab === 'pedidos'
        ? setPedidos(p => p.map(x => x.id === item.id ? { ...x, estado: 'leido' } : x))
        : setContactos(p => p.map(x => x.id === item.id ? { ...x, estado: 'leido' } : x));
      toast('Marcado como leído');
    } catch {
      toast('Error al actualizar estado', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    const svc = tab === 'pedidos' ? pedidosAdminService : contactoAdminService;
    try {
      await svc.delete(selected.id);
      setModal(null); setSelected(null);
      toast('Eliminado correctamente');
      cargar(); // recargar desde la API para asegurar que la tabla refleje el cambio
    } catch {
      toast('Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdated = (msg) => {
    setModal(null); setSelected(null);
    cargar(); toast(msg);
  };

  return (
    <div className="page-section">
      <Toast toasts={toasts} />

      {/* ── Cabecera ── */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Mensajes</h2>
          <p className="section-subtitle">Pedidos de libros y mensajes de contacto del portal</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={cargar} title="Actualizar">
          <i className="fas fa-arrows-rotate" />Actualizar
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-row">
        {[
          { label: 'Pedidos totales',  value: pedidos.length,                                          bg: 'linear-gradient(135deg,#2f81f7,#388bfd)', icon: 'fa-book-open'  },
          { label: 'Pedidos pendientes', value: pendCount.pedidos,                                     bg: 'linear-gradient(135deg,#d29922,#bb8009)', icon: 'fa-clock'      },
          { label: 'Mensajes totales', value: contactos.length,                                        bg: 'linear-gradient(135deg,#a371f7,#8957e5)', icon: 'fa-envelope'   },
          { label: 'Mensajes pendientes', value: pendCount.contacto,                                   bg: 'linear-gradient(135deg,#f43f5e,#e11d48)', icon: 'fa-bell'       },
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

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: 4, marginBottom: 16, width: 'fit-content',
      }}>
        {[
          { id: 'pedidos',  label: 'Pedidos de Libros',    icon: 'fa-book-open', count: pendCount.pedidos  },
          { id: 'contacto', label: 'Mensajes de Contacto', icon: 'fa-envelope',  count: pendCount.contacto },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); setFiltro(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: tab === t.id ? 'var(--accent)' : 'none',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all .2s',
            }}
          >
            <i className={`fas ${t.icon}`} />
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: tab === t.id ? 'rgba(255,255,255,.3)' : 'var(--danger)',
                color: '#fff', fontSize: 10, fontWeight: 700,
                padding: '1px 6px', borderRadius: 10, fontFamily: 'var(--mono)',
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="search-input">
          <i className="fas fa-magnifying-glass" />
          <input
            placeholder={tab === 'pedidos' ? 'Buscar por nombre, email o libro...' : 'Buscar por nombre, email o mensaje...'}
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

        <select className="filter-select" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="leido">Leído</option>
          <option value="respondido">Respondido</option>
        </select>

        {(search || filtro) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFiltro(''); }}>
            <i className="fas fa-filter-circle-xmark" />Limpiar
          </button>
        )}
      </div>

      {/* ── Tabla ── */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Cargando mensajes...</p>
        </div>
      ) : (
        <div className="table-card">
          <TablaItems
            items={lista}
            tipo={tab}
            loadingId={loadingId}
            onVer={item => { setSelected(item); setModal('ver'); }}
            onMarcarLeido={handleMarcarLeido}
            onEliminar={item => { setSelected(item); setModal('delete'); }}
          />
        </div>
      )}

      {/* ── Modales ── */}
      {modal === 'ver' && selected && (
        <MensajeModal
          item={selected}
          tipo={tab}
          onClose={() => { setModal(null); setSelected(null); }}
          onUpdated={handleUpdated}
        />
      )}

      {modal === 'delete' && selected && (
        <ConfirmModal
          tipo={tab}
          loading={deleting}
          onClose={() => { setModal(null); setSelected(null); }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
