import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import authService from '../services/auth';

/* ──────────────────────────────────────────
   Helpers
────────────────────────────────────────── */
const AVATAR_COLORS = [
  'linear-gradient(135deg,#2f81f7,#388bfd)',
  'linear-gradient(135deg,#a371f7,#8957e5)',
  'linear-gradient(135deg,#3fb950,#2da44e)',
  'linear-gradient(135deg,#f0883e,#d4760a)',
  'linear-gradient(135deg,#f85149,#da3633)',
];

const roleColor = {
  admin: 'admin', editor: 'editor', docente: 'docente', usuario: 'usuario',
};

const roleLabel = {
  admin:'Administrador', editor:'Editor', docente:'Docente', usuario:'Usuario',
};

const getInitials = (str = '') =>
  str.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?';

const avatarBg = (str = '') =>
  AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

/* Generador de contraseñas seguras */
const CHARSET = {
  upper:   'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lower:   'abcdefghjkmnpqrstuvwxyz',
  digits:  '23456789',
  special: '@#$%&!*?+-',
};

const genPassword = () => {
  const all = CHARSET.upper + CHARSET.lower + CHARSET.digits + CHARSET.special;
  let pwd = [
    CHARSET.upper[Math.floor(Math.random()*CHARSET.upper.length)],
    CHARSET.upper[Math.floor(Math.random()*CHARSET.upper.length)],
    CHARSET.lower[Math.floor(Math.random()*CHARSET.lower.length)],
    CHARSET.lower[Math.floor(Math.random()*CHARSET.lower.length)],
    CHARSET.digits[Math.floor(Math.random()*CHARSET.digits.length)],
    CHARSET.digits[Math.floor(Math.random()*CHARSET.digits.length)],
    CHARSET.special[Math.floor(Math.random()*CHARSET.special.length)],
    CHARSET.special[Math.floor(Math.random()*CHARSET.special.length)],
  ];
  for (let i = 0; i < 6; i++) pwd.push(all[Math.floor(Math.random()*all.length)]);
  return pwd.sort(() => Math.random() - .5).join('');
};

const getStrength = (pwd = '') => {
  let s = 0;
  if (pwd.length >= 8)              s++;
  if (pwd.length >= 12)             s++;
  if (/[A-Z]/.test(pwd))           s++;
  if (/[a-z]/.test(pwd))           s++;
  if (/[0-9]/.test(pwd))           s++;
  if (/[@#$%&!*?+\-]/.test(pwd))  s++;
  if (s <= 2) return { score:s, label:'Débil',  color:'var(--danger)'  };
  if (s <= 4) return { score:s, label:'Media',  color:'var(--warning)' };
  return           { score:s, label:'Fuerte', color:'var(--success)'  };
};

const sanitize = (v) => v.replace(/[<>"'`]/g,'').trim().slice(0,255);

const PER_PAGE = 8;

/* ──────────────────────────────────────────
   Modal: Crear / Editar usuario
────────────────────────────────────────── */
function UserFormModal({ onClose, onSaved, editing }) {
  const isEdit = Boolean(editing);
  const [form, setForm] = useState({
    username: editing?.username || '',
    email:    editing?.email    || '',
    nombre:   editing?.nombre   || '',
    rol:      editing?.rol      || 'editor',
    activo:   editing?.activo   !== false,
    password: '',
  });
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [copied,  setCopied]  = useState(false);

  const strength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim())                                   e.nombre   = 'El nombre es requerido';
    if (!form.username.trim())                                 e.username = 'El usuario es requerido';
    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(form.username))       e.username = 'Solo letras, números, punto, guión (3-50 chars)';
    if (!form.email.trim())                                    e.email    = 'El correo es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))      e.email    = 'Correo no válido';
    if (!isEdit && !form.password)                             e.password = 'La contraseña es requerida';
    if (form.password && form.password.length < 12)            e.password = 'Mínimo 12 caracteres';
    if (form.password && getStrength(form.password).score < 3) e.password = 'La contraseña es muy débil';
    return e;
  };

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(err => { const ne = { ...err }; delete ne[field]; return ne; });
  };

  const handleGenerate = () => {
    const pwd = genPassword();
    setForm(f => ({ ...f, password: pwd }));
    setErrors(err => { const ne = { ...err }; delete ne.password; return ne; });
  };

  const handleCopy = async () => {
    if (!form.password) return;
    await navigator.clipboard.writeText(form.password).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      const payload = {
        nombre:   sanitize(form.nombre),
        username: sanitize(form.username),
        email:    sanitize(form.email).toLowerCase(),
        rol:      form.rol,
        activo:   form.activo,
      };
      if (form.password) payload.password = form.password;

      if (isEdit) {
        await api.put(`/admin/usuarios/${editing.id}`, payload);
      } else {
        await api.post('/admin/usuarios', payload);
      }
      onSaved(isEdit ? 'Usuario actualizado' : 'Usuario creado');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar';
      setErrors({ general: msg });
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>
            <i className={`fas fa-${isEdit ? 'user-pen':'user-plus'}`} style={{ color:'var(--accent)' }} />
            {isEdit ? `Editar: @${editing.username}` : 'Nuevo Usuario'}
          </h3>
          <button className="modal-close" onClick={onClose}><i className="fas fa-xmark" /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.general && (
              <div style={{
                padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13,
                background:'var(--danger-soft)', border:'1px solid rgba(248,81,73,.3)',
                color:'var(--danger)', display:'flex', alignItems:'center', gap:8,
              }}>
                <i className="fas fa-exclamation-circle" />{errors.general}
              </div>
            )}

            <div className="form-row">
              {/* Nombre */}
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input className={`form-input${errors.nombre ? ' input-error' : ''}`}
                  value={form.nombre}
                  onChange={handleChange('nombre')}
                  placeholder="Ana García López" maxLength={255}
                />
                {errors.nombre && <p className="form-error"><i className="fas fa-triangle-exclamation"/>{errors.nombre}</p>}
              </div>

              {/* Username */}
              <div className="form-group">
                <label className="form-label">Usuario *</label>
                <input className={`form-input${errors.username ? ' input-error' : ''}`}
                  value={form.username}
                  onChange={handleChange('username')}
                  placeholder="ana.garcia" maxLength={50}
                  disabled={isEdit}
                  style={isEdit ? { opacity:.6 } : {}}
                />
                {errors.username
                  ? <p className="form-error"><i className="fas fa-triangle-exclamation"/>{errors.username}</p>
                  : isEdit && <p className="form-hint">El usuario no puede modificarse</p>}
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Correo Electrónico *</label>
              <input className={`form-input${errors.email ? ' input-error' : ''}`}
                type="email" value={form.email}
                onChange={handleChange('email')}
                placeholder="ana.garcia@iecaceres.edu.pe"
              />
              {errors.email && <p className="form-error"><i className="fas fa-triangle-exclamation"/>{errors.email}</p>}
            </div>

            <div className="form-row">
              {/* Rol */}
              <div className="form-group">
                <label className="form-label">Rol *</label>
                <select className="form-input" value={form.rol} onChange={handleChange('rol')}>
                  <option value="admin">Administrador</option>
                  <option value="editor">Editor</option>
                  <option value="docente">Docente</option>
                  <option value="usuario">Usuario</option>
                </select>
              </div>

              {/* Estado (solo en edición) */}
              {isEdit && (
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <label style={{ display:'flex', alignItems:'center', gap:10, marginTop:10, cursor:'pointer' }}>
                    <div
                      onClick={() => setForm(f => ({ ...f, activo:!f.activo }))}
                      style={{
                        width:44, height:24, borderRadius:12, cursor:'pointer',
                        background: form.activo ? 'var(--accent)' : 'var(--border)',
                        position:'relative', transition:'background .2s',
                        flexShrink:0,
                      }}
                    >
                      <div style={{
                        position:'absolute', top:3, left: form.activo ? 23 : 3,
                        width:18, height:18, background:'#fff', borderRadius:'50%',
                        transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.3)',
                      }} />
                    </div>
                    <span style={{ fontSize:13, color:'var(--text-secondary)' }}>
                      {form.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label className="form-label">
                {isEdit ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
              </label>
              <div className="pwd-wrap">
                <input
                  className={`form-input pwd-input${errors.password ? ' input-error' : ''}`}
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Mínimo 12 caracteres"
                  autoComplete="new-password"
                />
                <div className="pwd-btns">
                  <button type="button" className="pwd-btn" title="Generar" onClick={handleGenerate}>
                    <i className="fas fa-rotate" />
                  </button>
                  <button type="button" className="pwd-btn" title={copied ? 'Copiado' : 'Copiar'} onClick={handleCopy}>
                    <i className={`fas fa-${copied ? 'check' : 'copy'}`} style={{ color: copied ? 'var(--success)' : undefined }} />
                  </button>
                  <button type="button" className="pwd-btn" title={showPwd ? 'Ocultar' : 'Ver'} onClick={() => setShowPwd(s => !s)}>
                    <i className={`fas fa-${showPwd ? 'eye-slash' : 'eye'}`} />
                  </button>
                </div>
              </div>
              {errors.password && <p className="form-error"><i className="fas fa-triangle-exclamation"/>{errors.password}</p>}
              {form.password && (
                <div className="pwd-strength">
                  <div className="pwd-bar">
                    {[1,2,3,4,5,6].map(n => (
                      <div key={n} className="pwd-seg" style={{
                        background: n <= strength.score ? strength.color : 'var(--border)',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize:11, color:strength.color, fontWeight:700 }}>{strength.label}</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? <><i className="fas fa-spinner fa-spin" />Guardando...</>
                : <><i className={`fas fa-${isEdit ? 'floppy-disk':'user-plus'}`} />{isEdit ? 'Actualizar' : 'Crear Usuario'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Modal: Confirmar eliminación
────────────────────────────────────────── */
function ConfirmDeleteModal({ user, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 400 }}>
        <div className="modal-header">
          <h3><i className="fas fa-triangle-exclamation" style={{ color:'var(--danger)' }} />Eliminar Usuario</h3>
          <button className="modal-close" onClick={onClose}><i className="fas fa-xmark" /></button>
        </div>
        <div className="modal-body" style={{ textAlign:'center', padding:'28px 24px' }}>
          <div className="confirm-icon"><i className="fas fa-user-slash" /></div>
          <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>
            ¿Eliminar a @{user.username}?
          </p>
          <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>
            El usuario quedará desactivado permanentemente. Esta acción no puede deshacerse.
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

/* ──────────────────────────────────────────
   Toast
────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i className={`fas fa-${t.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────
   Componente principal
────────────────────────────────────────── */
export default function Usuarios() {
  const currentUser = authService.getCurrentUser();

  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterAct, setFilterAct] = useState('');
  const [page,      setPage]      = useState(1);
  const [modal,     setModal]     = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected,  setSelected]  = useState(null);
  const [deleting,  setDeleting]  = useState(false);
  const [toasts,    setToasts]    = useState([]);

  /* ── API ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/admin/usuarios');
      setUsers(res.data?.data || res.data || []);
    } catch {
      setError('Error al cargar usuarios. Verifica tu conexión.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showToast = (text, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const handleSaved = (msg) => {
    setModal(null); setSelected(null);
    fetchUsers();
    showToast(msg);
  };

  const handleToggle = async (u) => {
    if (u.id === currentUser?.id) { showToast('No puedes desactivar tu propia cuenta', 'error'); return; }
    try {
      await api.patch(`/admin/usuarios/${u.id}/toggle`);
      showToast(`Usuario ${u.activo ? 'desactivado' : 'activado'}`);
      fetchUsers();
    } catch { showToast('Error al cambiar estado', 'error'); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/usuarios/${selected.id}`);
      setModal(null); setSelected(null);
      fetchUsers();
      showToast('Usuario eliminado');
    } catch { showToast('Error al eliminar usuario', 'error'); }
    finally { setDeleting(false); }
  };

  /* ── Filtros ── */
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ   = !q || u.username?.toLowerCase().includes(q)
                        || u.email?.toLowerCase().includes(q)
                        || u.nombre?.toLowerCase().includes(q);
    const matchRol = !filterRol || u.rol === filterRol;
    const matchAct = !filterAct
      || (filterAct === '1' && u.activo)
      || (filterAct === '0' && !u.activo);
    return matchQ && matchRol && matchAct;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage-1)*PER_PAGE, safePage*PER_PAGE);

  const goPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));
  const resetFilters = () => { setSearch(''); setFilterRol(''); setFilterAct(''); setPage(1); };

  /* ── Conteos ── */
  const counts = {
    total:   users.length,
    admin:   users.filter(u => u.rol === 'admin').length,
    editor:  users.filter(u => u.rol === 'editor').length,
    docente: users.filter(u => u.rol === 'docente').length,
    activos: users.filter(u => u.activo).length,
  };

  /* ── Render ── */
  return (
    <div className="page-section">

      {/* ── Cabecera ── */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Usuarios</h2>
          <p className="section-subtitle">Gestión de cuentas y permisos del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <i className="fas fa-user-plus" />
          Nuevo Usuario
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-row">
        {[
          { label:'Total',         value: counts.total,   bg:'linear-gradient(135deg,#2f81f7,#388bfd)', icon:'fa-users',          filter:'' },
          { label:'Admins',        value: counts.admin,   bg:'linear-gradient(135deg,#f85149,#da3633)', icon:'fa-shield-halved',   filter:'admin' },
          { label:'Editores',      value: counts.editor,  bg:'linear-gradient(135deg,#a371f7,#8957e5)', icon:'fa-pen-nib',         filter:'editor' },
          { label:'Docentes',      value: counts.docente, bg:'linear-gradient(135deg,#3fb950,#2da44e)', icon:'fa-chalkboard-user', filter:'docente' },
          { label:'Activos',       value: counts.activos, bg:'linear-gradient(135deg,#d29922,#bb8009)', icon:'fa-circle-check',    filter:null },
        ].map(c => (
          <div
            key={c.label}
            className={`stats-row-card${filterRol === c.filter && c.filter ? ' active-filter' : ''}`}
            onClick={() => c.filter !== null && (setFilterRol(f => f === c.filter ? '' : c.filter), setPage(1))}
            style={{ cursor: c.filter !== null ? 'pointer' : 'default' }}
          >
            <div className="stats-row-icon" style={{ background: c.bg }}>
              <i className={`fas ${c.icon}`} style={{ fontSize:14 }} />
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
            type="text"
            placeholder="Buscar nombre, usuario o correo..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:12 }}>
              <i className="fas fa-xmark" />
            </button>
          )}
        </div>

        <select className="filter-select" value={filterRol} onChange={e => { setFilterRol(e.target.value); setPage(1); }}>
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="editor">Editor</option>
          <option value="docente">Docente</option>
          <option value="usuario">Usuario</option>
        </select>

        <select className="filter-select" value={filterAct} onChange={e => { setFilterAct(e.target.value); setPage(1); }}>
          <option value="">Todos los estados</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>

        {(search || filterRol || filterAct) && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
            <i className="fas fa-rotate-left" />Limpiar
          </button>
        )}

        <button className="btn btn-ghost btn-sm" onClick={fetchUsers} style={{ marginLeft:'auto' }}>
          <i className="fas fa-rotate" />
        </button>
      </div>

      {/* ── Tabla ── */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div className="table-card">
          <div className="empty-state">
            <i className="fas fa-circle-exclamation" style={{ color:'var(--danger)' }} />
            <p style={{ color:'var(--danger)', marginBottom:12 }}>{error}</p>
            <button className="btn btn-ghost btn-sm" onClick={fetchUsers}>
              <i className="fas fa-rotate" />Reintentar
            </button>
          </div>
        </div>
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registrado</th>
                <th style={{ textAlign:'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <i className="fas fa-users-slash" />
                      <p>No se encontraron usuarios con esos filtros</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map(u => (
                <tr key={u.id}>
                  {/* Nombre + username */}
                  <td>
                    <div className="user-row-info">
                      <div className="row-avatar" style={{ background: avatarBg(u.username) }}>
                        {getInitials(u.nombre || u.username)}
                      </div>
                      <div>
                        <div className="row-name">
                          {u.nombre || u.username}
                          {u.id === currentUser?.id && (
                            <span className="badge badge-warning" style={{ fontSize:9, marginLeft:6 }}>Tú</span>
                          )}
                        </div>
                        <div className="row-email">@{u.username}</div>
                      </div>
                    </div>
                  </td>

                  {/* Correo */}
                  <td>
                    <span style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--text-secondary)' }}>
                      {u.email}
                    </span>
                  </td>

                  {/* Rol */}
                  <td>
                    <span className={`badge badge-${roleColor[u.rol] || 'usuario'}`}>
                      {roleLabel[u.rol] || u.rol}
                    </span>
                  </td>

                  {/* Estado */}
                  <td>
                    <span className={`badge badge-${u.activo ? 'active' : 'inactive'}`}>
                      <i className="fas fa-circle" style={{ fontSize:6 }} />
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td>
                    <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--mono)' }}>
                      {new Date(u.created_at).toLocaleDateString('es-PE')}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="actions-cell">
                    {/* Editar */}
                    <button className="btn btn-icon btn-ghost btn-sm" title="Editar"
                      onClick={() => { setSelected(u); setModal('edit'); }}>
                      <i className="fas fa-pen" />
                    </button>

                    {/* Toggle activo */}
                    <button
                      className={`btn btn-icon btn-sm ${u.activo ? 'btn-warning' : 'btn-success'}`}
                      title={u.activo ? 'Desactivar' : 'Activar'}
                      disabled={u.id === currentUser?.id}
                      onClick={() => handleToggle(u)}
                    >
                      <i className={`fas fa-${u.activo ? 'ban' : 'circle-check'}`} />
                    </button>

                    {/* Eliminar */}
                    <button
                      className="btn btn-icon btn-danger btn-sm" title="Eliminar"
                      disabled={u.id === currentUser?.id}
                      onClick={() => { setSelected(u); setModal('delete'); }}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {filtered.length > PER_PAGE && (
            <div className="pagination">
              <span>
                Mostrando {(safePage-1)*PER_PAGE+1}–{Math.min(safePage*PER_PAGE, filtered.length)} de {filtered.length}
              </span>
              <div className="page-btns">
                <button className="page-btn" onClick={() => goPage(1)}     disabled={safePage===1}><i className="fas fa-angles-left"  style={{fontSize:10}}/></button>
                <button className="page-btn" onClick={() => goPage(safePage-1)} disabled={safePage===1}><i className="fas fa-angle-left"   style={{fontSize:10}}/></button>
                {Array.from({ length: totalPages }, (_, i) => i+1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx-1] > 1) acc.push('…');
                    acc.push(p); return acc;
                  }, [])
                  .map((p, i) => p === '…'
                    ? <span key={`e${i}`} style={{ padding:'0 4px', color:'var(--text-muted)', fontSize:12 }}>…</span>
                    : <button key={p} className={`page-btn${p===safePage?' active':''}`} onClick={() => goPage(p)}>{p}</button>
                  )
                }
                <button className="page-btn" onClick={() => goPage(safePage+1)} disabled={safePage===totalPages}><i className="fas fa-angle-right"  style={{fontSize:10}}/></button>
                <button className="page-btn" onClick={() => goPage(totalPages)} disabled={safePage===totalPages}><i className="fas fa-angles-right" style={{fontSize:10}}/></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modales ── */}
      {(modal === 'create' || modal === 'edit') && (
        <UserFormModal
          onClose={() => { setModal(null); setSelected(null); }}
          onSaved={handleSaved}
          editing={modal === 'edit' ? selected : null}
        />
      )}

      {modal === 'delete' && selected && (
        <ConfirmDeleteModal
          user={selected}
          onClose={() => { setModal(null); setSelected(null); }}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}

      {/* ── Toasts ── */}
      <Toast toasts={toasts} />

    </div>
  );
}