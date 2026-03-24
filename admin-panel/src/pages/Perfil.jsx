import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* ── Helpers ── */
const AVATAR_BG = {
  admin:   'linear-gradient(135deg,#2f81f7,#388bfd)',
  editor:  'linear-gradient(135deg,#a371f7,#8957e5)',
  docente: 'linear-gradient(135deg,#3fb950,#2da44e)',
  usuario: 'linear-gradient(135deg,#8b949e,#6e7681)',
};

const ROLE_LABEL = {
  admin:'Administrador', editor:'Editor', docente:'Docente', usuario:'Usuario',
};

const getInitials = (str = '') =>
  str.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

const getStrength = (pwd = '') => {
  let s = 0;
  if (pwd.length >= 8)             s++;
  if (pwd.length >= 12)            s++;
  if (/[A-Z]/.test(pwd))          s++;
  if (/[a-z]/.test(pwd))          s++;
  if (/[0-9]/.test(pwd))          s++;
  if (/[@#$%&!*?+\-]/.test(pwd)) s++;
  if (s <= 2) return { score:s, label:'Débil',  color:'var(--danger)'  };
  if (s <= 4) return { score:s, label:'Media',  color:'var(--warning)' };
  return           { score:s, label:'Fuerte', color:'var(--success)'  };
};

/* ── Alerta inline ── */
function Alert({ msg }) {
  if (!msg) return null;
  const ok = msg.type === 'success';
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13,
      background: ok ? 'var(--success-soft)' : 'var(--danger-soft)',
      border:`1px solid ${ok ? 'rgba(63,185,80,.3)' : 'rgba(248,81,73,.3)'}`,
      color: ok ? 'var(--success)' : 'var(--danger)',
    }}>
      <i className={`fas fa-${ok ? 'check-circle' : 'exclamation-circle'}`} />
      {msg.text}
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────── */
export default function Perfil() {
  /* ✅ useAuth() — obtiene usuario del contexto, no de authService directo */
  const { user, refreshUser } = useAuth();

  const [tab, setTab] = useState('info');

  /* Tab Info */
  const [infoForm, setInfoForm]     = useState({
    nombre: user?.nombre || '',
    email:  user?.email  || '',
  });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg,    setInfoMsg]    = useState(null);

  /* Obtener datos completos del usuario desde la API (nombre, email pueden no estar en el token) */
  useEffect(() => {
    if (!user?.id) return;
    api.get(`/admin/usuarios/${user.id}`)
      .then(res => {
        const u = res.data?.data || res.data || {};
        setInfoForm({
          nombre: u.nombre || user.nombre || '',
          email:  u.email  || user.email  || '',
        });
      })
      .catch(() => {
        // Fallback al usuario del contexto si falla la API
        setInfoForm({
          nombre: user.nombre || '',
          email:  user.email  || '',
        });
      });
  }, [user?.id]);

  /* Tab Seguridad */
  const [pwdForm, setPwdForm]   = useState({ actual:'', nueva:'', confirmar:'' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg,   setPwdMsg]   = useState(null);
  const [showPwd,  setShowPwd]  = useState({ actual:false, nueva:false, conf:false });

  const strength  = getStrength(pwdForm.nueva);
  const avatarBg  = AVATAR_BG[user?.rol] || AVATAR_BG.usuario;
  const initials  = getInitials(user?.nombre || user?.username || '');

  /* ── Guardar info ── */
  const handleInfoSave = async (e) => {
    e.preventDefault();
    if (!infoForm.nombre.trim() || !infoForm.email.trim()) {
      setInfoMsg({ type:'error', text:'Nombre y correo son obligatorios' }); return;
    }
    setInfoSaving(true); setInfoMsg(null);
    try {
      await api.put(`/admin/usuarios/${user.id}`, {
        nombre: infoForm.nombre.trim(),
        email:  infoForm.email.trim().toLowerCase(),
      });
      setInfoMsg({ type:'success', text:'Perfil actualizado correctamente' });
      refreshUser?.(); // refresca el contexto
    } catch (err) {
      setInfoMsg({ type:'error', text: err.response?.data?.message || 'Error al guardar' });
    } finally { setInfoSaving(false); }
  };

  /* ── Cambiar contraseña ── */
  const handlePwdSave = async (e) => {
    e.preventDefault(); setPwdMsg(null);
    if (!pwdForm.actual || !pwdForm.nueva || !pwdForm.confirmar)
      return setPwdMsg({ type:'error', text:'Todos los campos son requeridos' });
    if (pwdForm.nueva !== pwdForm.confirmar)
      return setPwdMsg({ type:'error', text:'Las contraseñas nuevas no coinciden' });
    if (pwdForm.nueva.length < 12)
      return setPwdMsg({ type:'error', text:'Mínimo 12 caracteres' });
    if (getStrength(pwdForm.nueva).score < 3)
      return setPwdMsg({ type:'error', text:'La contraseña es muy débil' });

    setPwdSaving(true);
    try {
      await api.put(`/admin/usuarios/${user.id}/password`, {
        password_actual: pwdForm.actual,
        password_nueva:  pwdForm.nueva,
      });
      setPwdMsg({ type:'success', text:'Contraseña cambiada correctamente' });
      setPwdForm({ actual:'', nueva:'', confirmar:'' });
    } catch (err) {
      setPwdMsg({ type:'error', text: err.response?.data?.message || 'Contraseña actual incorrecta' });
    } finally { setPwdSaving(false); }
  };

  /* ── Tabs config ── */
  const TABS = [
    { id:'info',      icon:'fa-user',    label:'Información' },
    { id:'seguridad', icon:'fa-lock',    label:'Seguridad'   },
  ];

  /* ── Render ── */
  return (
    <div className="page-section">

      {/* Cabecera */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Mi Perfil</h2>
          <p className="section-subtitle">
            Gestiona tu información personal y seguridad
          </p>
        </div>
      </div>

      {/* ── Hero card ── */}
      <div style={{
        background:'var(--bg-surface)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-xl)', padding:'24px 28px', marginBottom:24,
        display:'flex', alignItems:'center', gap:20,
        position:'relative', overflow:'hidden',
      }}>
        {/* Glow decorativo */}
        <div style={{
          position:'absolute', top:-50, right:-30, width:180, height:180,
          background:'var(--accent-soft)', borderRadius:'50%',
          filter:'blur(55px)', pointerEvents:'none',
        }} />

        {/* Avatar */}
        <div style={{
          width:72, height:72, borderRadius:'50%', background:avatarBg,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:24, fontWeight:800, color:'#fff', flexShrink:0,
          boxShadow:'0 4px 16px rgba(0,0,0,.35)', position:'relative', zIndex:1,
        }}>
          {initials}
        </div>

        {/* Datos del usuario */}
        <div style={{ flex:1, position:'relative', zIndex:1 }}>
          <div style={{ fontSize:18, fontWeight:800, color:'var(--text-primary)', marginBottom:3 }}>
            {/* ✅ Muestra nombre si existe, sino username */}
            {user?.nombre || user?.username || '—'}
          </div>
          <div style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'var(--mono)', marginBottom:8 }}>
            @{user?.username}
            {user?.email && <span style={{ marginLeft:8 }}>· {user.email}</span>}
          </div>
          <span className={`badge badge-${user?.rol || 'usuario'}`}>
            <i className="fas fa-shield-halved" style={{ fontSize:9 }} />
            {ROLE_LABEL[user?.rol] || user?.rol || 'usuario'}
          </span>
        </div>

        {/* Acción rápida */}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setTab('seguridad')}
          style={{ position:'relative', zIndex:1 }}
        >
          <i className="fas fa-key" />
          Cambiar contraseña
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display:'flex', gap:4,
        background:'var(--bg-surface)', border:'1px solid var(--border)',
        borderRadius:10, padding:4, marginBottom:24, width:'fit-content',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'7px 16px', borderRadius:7,
              background: tab === t.id ? 'var(--accent)' : 'none',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              border:'none', fontSize:13, fontWeight:600,
              transition:'all .2s', cursor:'pointer',
            }}
          >
            <i className={`fas ${t.icon}`} style={{ fontSize:12 }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════
          TAB: INFORMACIÓN
      ════════════════════════════════════ */}
      {tab === 'info' && (
        <div style={{
          background:'var(--bg-surface)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-xl)', padding:28, maxWidth:520,
        }}>
          <h3 style={{
            fontSize:14, fontWeight:700, color:'var(--text-primary)',
            marginBottom:20, display:'flex', alignItems:'center', gap:8,
          }}>
            <i className="fas fa-user" style={{ color:'var(--accent)' }} />
            Información Personal
          </h3>

          <Alert msg={infoMsg} />

          <form onSubmit={handleInfoSave}>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input
                className="form-input"
                value={infoForm.nombre}
                onChange={e => setInfoForm(f => ({ ...f, nombre:e.target.value }))}
                placeholder={user?.username || 'Tu nombre'}
                maxLength={255}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                className="form-input"
                type="email"
                value={infoForm.email}
                onChange={e => setInfoForm(f => ({ ...f, email:e.target.value }))}
                placeholder="correo@iecaceres.edu.pe"
              />
            </div>

            {/* Campos de solo lectura */}
            <div className="form-group">
              <label className="form-label">Usuario del sistema</label>
              <input
                className="form-input"
                value={`@${user?.username || ''}`}
                disabled
              />
              <p className="form-hint">El nombre de usuario no puede modificarse</p>
            </div>

            <div className="form-group">
              <label className="form-label">Rol asignado</label>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                <span className={`badge badge-${user?.rol || 'usuario'}`}>
                  {ROLE_LABEL[user?.rol] || user?.rol}
                </span>
                <span className="form-hint" style={{ margin:0 }}>
                  Solo un administrador puede cambiar tu rol
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={infoSaving}
            >
              {infoSaving
                ? <><i className="fas fa-spinner fa-spin" />Guardando...</>
                : <><i className="fas fa-floppy-disk" />Guardar Cambios</>}
            </button>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════
          TAB: SEGURIDAD
      ════════════════════════════════════ */}
      {tab === 'seguridad' && (
        <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'flex-start' }}>

          {/* Formulario */}
          <div style={{
            background:'var(--bg-surface)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-xl)', padding:28,
            flex:'1 1 320px', minWidth:0,
          }}>
            <h3 style={{
              fontSize:14, fontWeight:700, color:'var(--text-primary)',
              marginBottom:4, display:'flex', alignItems:'center', gap:8,
            }}>
              <i className="fas fa-lock" style={{ color:'var(--accent)' }} />
              Cambiar Contraseña
            </h3>
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:20 }}>
              Mínimo 12 caracteres con mayúsculas, números y símbolos.
            </p>

            <Alert msg={pwdMsg} />

            <form onSubmit={handlePwdSave}>
              {/* Actual */}
              <div className="form-group">
                <label className="form-label">Contraseña Actual</label>
                <div className="pwd-wrap">
                  <input
                    className="form-input pwd-input"
                    type={showPwd.actual ? 'text' : 'password'}
                    placeholder="Tu contraseña actual"
                    value={pwdForm.actual}
                    autoComplete="current-password"
                    onChange={e => setPwdForm(f => ({ ...f, actual:e.target.value }))}
                  />
                  <div className="pwd-btns">
                    <button type="button" className="pwd-btn"
                      onClick={() => setShowPwd(s => ({ ...s, actual:!s.actual }))}>
                      <i className={`fas fa-${showPwd.actual ? 'eye-slash':'eye'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Nueva */}
              <div className="form-group">
                <label className="form-label">Nueva Contraseña</label>
                <div className="pwd-wrap">
                  <input
                    className="form-input pwd-input"
                    type={showPwd.nueva ? 'text' : 'password'}
                    placeholder="Mínimo 12 caracteres"
                    value={pwdForm.nueva}
                    autoComplete="new-password"
                    onChange={e => setPwdForm(f => ({ ...f, nueva:e.target.value }))}
                  />
                  <div className="pwd-btns">
                    <button type="button" className="pwd-btn"
                      onClick={() => setShowPwd(s => ({ ...s, nueva:!s.nueva }))}>
                      <i className={`fas fa-${showPwd.nueva ? 'eye-slash':'eye'}`} />
                    </button>
                  </div>
                </div>
                {pwdForm.nueva && (
                  <div className="pwd-strength">
                    <div className="pwd-bar">
                      {[1,2,3,4,5,6].map(n => (
                        <div key={n} className="pwd-seg" style={{
                          background: n <= strength.score ? strength.color : 'var(--border)',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize:11, color:strength.color, fontWeight:700 }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar */}
              <div className="form-group">
                <label className="form-label">Confirmar Nueva Contraseña</label>
                <div className="pwd-wrap">
                  <input
                    className="form-input pwd-input"
                    type={showPwd.conf ? 'text' : 'password'}
                    placeholder="Repite la nueva contraseña"
                    value={pwdForm.confirmar}
                    autoComplete="new-password"
                    onChange={e => setPwdForm(f => ({ ...f, confirmar:e.target.value }))}
                    style={{
                      borderColor: pwdForm.confirmar && pwdForm.nueva !== pwdForm.confirmar
                        ? 'var(--danger)' : undefined,
                    }}
                  />
                  <div className="pwd-btns">
                    <button type="button" className="pwd-btn"
                      onClick={() => setShowPwd(s => ({ ...s, conf:!s.conf }))}>
                      <i className={`fas fa-${showPwd.conf ? 'eye-slash':'eye'}`} />
                    </button>
                  </div>
                </div>
                {pwdForm.confirmar && pwdForm.nueva !== pwdForm.confirmar && (
                  <p className="form-error">
                    <i className="fas fa-triangle-exclamation" />
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={pwdSaving}
              >
                {pwdSaving
                  ? <><i className="fas fa-spinner fa-spin" />Cambiando...</>
                  : <><i className="fas fa-key" />Cambiar Contraseña</>}
              </button>
            </form>
          </div>

          {/* Checklist de requisitos */}
          <div style={{
            background:'var(--bg-surface)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-xl)', padding:24,
            flex:'0 0 220px',
          }}>
            <p style={{
              fontSize:11, fontWeight:700, color:'var(--text-secondary)',
              marginBottom:14, textTransform:'uppercase', letterSpacing:'.05em',
            }}>
              Requisitos
            </p>
            {[
              { ok: pwdForm.nueva.length >= 12,           label:'Mínimo 12 caracteres'        },
              { ok: /[A-Z]/.test(pwdForm.nueva),          label:'Al menos 1 mayúscula'         },
              { ok: /[a-z]/.test(pwdForm.nueva),          label:'Al menos 1 minúscula'         },
              { ok: /[0-9]/.test(pwdForm.nueva),          label:'Al menos 1 número'            },
              { ok: /[@#$%&!*?+\-]/.test(pwdForm.nueva), label:'Al menos 1 símbolo (@#$…)'   },
            ].map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
                <i
                  className={`fas fa-${r.ok ? 'circle-check' : 'circle-xmark'}`}
                  style={{ fontSize:13, color: r.ok ? 'var(--success)' : 'var(--text-disabled)' }}
                />
                <span style={{
                  fontSize:12,
                  color: r.ok ? 'var(--success)' : 'var(--text-muted)',
                }}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}