import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useAutoLogout from '../../hooks/useAutoLogout';
import '../../assets/css/dashboard.css';

/* ── Avatar por rol ── */
const AVATAR_BG = {
  admin:   'linear-gradient(135deg,#2f81f7,#388bfd)',
  editor:  'linear-gradient(135deg,#a371f7,#8957e5)',
  docente: 'linear-gradient(135deg,#3fb950,#2da44e)',
  usuario: 'linear-gradient(135deg,#8b949e,#6e7681)',
};

const ROLE_LABEL = {
  admin:'Admin', editor:'Editor', docente:'Docente', usuario:'Usuario',
};

/* ─────────────────────────────────────────────────────────────
   NAV — rutas sin prefijo /admin, igual que tu App.jsx:
     <Route path="/" element={<DashboardLayout />}>
       <Route index />            → "/"
       <Route path="noticias" />  → "/noticias"
       <Route path="usuarios" />  → "/usuarios"
       etc.
───────────────────────────────────────────────────────────── */
const NAV = [
  {
    section: 'Principal',
    items: [
      { to:'/',             icon:'fa-gauge-high',       label:'Dashboard',  exact:true },
    ],
  },
  {
    section: 'Contenido',
    items: [
      { to:'/noticias',     icon:'fa-newspaper',        label:'Noticias'    },
      { to:'/comunicados',  icon:'fa-bullhorn',         label:'Comunicados' },
      { to:'/eventos',      icon:'fa-calendar-days',    label:'Eventos',    soon:true },
    ],
  },
  {
    section: 'Académico',
    items: [
      { to:'/docentes',     icon:'fa-chalkboard-user',  label:'Docentes'    },
    ],
  },
  {
    section: 'Sistema',
    items: [
      /* adminOnly → solo aparece si user.rol === 'admin' */
      { to:'/usuarios',     icon:'fa-user-gear',        label:'Usuarios',   adminOnly:true },
      { to:'/perfil',       icon:'fa-circle-user',      label:'Mi Perfil'   },
    ],
  },
];

/* Títulos del topbar */
const PAGE_TITLES = {
  '/':             'Dashboard',
  '/noticias':     'Noticias',
  '/comunicados':  'Comunicados',
  '/eventos':      'Eventos',
  '/docentes':     'Docentes',
  '/usuarios':     'Usuarios',
  '/perfil':       'Mi Perfil',
};

/* ── NavItem ── */
function NavItem({ item, collapsed }) {
  const { pathname } = useLocation();

  const isActive = item.exact
    ? pathname === '/'
    : pathname === item.to || pathname.startsWith(item.to + '/');

  if (item.soon) {
    return (
      <li className="nav-item">
        <span
          className="nav-link"
          title={collapsed ? item.label : undefined}
          style={{ opacity:.45, cursor:'not-allowed' }}
        >
          <i className={`fas ${item.icon}`} />
          <span>{item.label}</span>
          {!collapsed && (
            <span style={{
              marginLeft:'auto', fontSize:9, fontWeight:700,
              background:'var(--warning-soft)', color:'var(--warning)',
              padding:'1px 5px', borderRadius:4, fontFamily:'var(--mono)',
            }}>PRONTO</span>
          )}
        </span>
      </li>
    );
  }

  return (
    <li className="nav-item">
      <NavLink
        to={item.to}
        end={item.exact}
        className={`nav-link${isActive ? ' active' : ''}`}
        title={collapsed ? item.label : undefined}
      >
        <i className={`fas ${item.icon}`} />
        <span>{item.label}</span>
        {item.adminOnly && !collapsed && (
          <span style={{
            marginLeft:'auto', fontSize:9, fontWeight:700,
            background:'var(--danger-soft)', color:'var(--danger)',
            padding:'1px 5px', borderRadius:4, fontFamily:'var(--mono)',
          }}>ADMIN</span>
        )}
      </NavLink>
    </li>
  );
}

/* ── Sidebar ── */
function Sidebar({ collapsed, onToggle, user, onLogout }) {
  const initials = (user?.nombre || user?.username || '?')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>

      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fas fa-school" />
        </div>
        <div className="sidebar-brand">
          <h3>I.E.A.A. Cáceres</h3>
          <p>Panel Admin</p>
        </div>
        <button className="sidebar-toggle" onClick={onToggle}
          title={collapsed ? 'Expandir' : 'Colapsar'}>
          <i className={`fas fa-${collapsed ? 'angles-right' : 'angles-left'}`} />
        </button>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        <ul style={{ listStyle:'none', padding:0, margin:0 }}>
          {NAV.map(group => {
            const items = group.items.filter(item =>
              !item.adminOnly || user?.rol === 'admin'
            );
            if (!items.length) return null;

            return (
              <li key={group.section}>
                {!collapsed && (
                  <div className="nav-section-label">{group.section}</div>
                )}
                {collapsed && <div style={{ height:8 }} />}
                {items.map(item => (
                  <NavItem key={item.to} item={item} collapsed={collapsed} />
                ))}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Avatar → perfil */}
        <NavLink to="/perfil" className="user-card" style={{ textDecoration:'none' }}>
          <div className="user-avatar"
            style={{ background: AVATAR_BG[user?.rol] || AVATAR_BG.usuario }}>
            {initials}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.nombre || user?.username}</div>
            <div className="user-role">{ROLE_LABEL[user?.rol] || user?.rol}</div>
          </div>
        </NavLink>

        {/* Cerrar sesión */}
        <button
          onClick={onLogout}
          title="Cerrar sesión"
          style={{
            width:'100%', display:'flex', alignItems:'center', gap:10,
            padding:'8px 10px', borderRadius:6, marginTop:4,
            background:'none', border:'none', cursor:'pointer',
            color:'var(--danger)', fontSize:13, fontWeight:600,
            transition:'background .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-soft)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <i className="fas fa-right-from-bracket"
            style={{ width:16, textAlign:'center', flexShrink:0, fontSize:14 }} />
          <span style={{
            whiteSpace:'nowrap', overflow:'hidden',
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 140,
            transition:'opacity .2s, max-width .2s',
          }}>
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}

/* ── Modal logout ── */
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ width:380 }}>
        <div className="modal-header">
          <h3>
            <i className="fas fa-right-from-bracket" style={{ color:'var(--danger)' }} />
            Cerrar Sesión
          </h3>
          <button className="modal-close" onClick={onCancel}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="modal-body" style={{ textAlign:'center', padding:'28px 24px' }}>
          <div style={{
            width:56, height:56, borderRadius:'50%',
            background:'var(--danger-soft)', border:'1px solid rgba(248,81,73,.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, color:'var(--danger)', margin:'0 auto 16px',
          }}>
            <i className="fas fa-right-from-bracket" />
          </div>
          <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>
            ¿Deseas cerrar tu sesión?
          </p>
          <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>
            Serás redirigido a la página de inicio de sesión.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <i className="fas fa-right-from-bracket" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DashboardLayout principal
───────────────────────────────────────────────────────────── */
export default function DashboardLayout() {
  const { user, logout }      = useAuth();
  const navigate               = useNavigate();
  const location               = useLocation();
  const [collapsed,     setCollapsed]     = useState(false);
  const [showLogout,    setShowLogout]    = useState(false);
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const userMenuRef = useRef(null);

  /* ✅ useAutoLogout — UNA sola vez */
  useAutoLogout();

  /* Cerrar dropdown al click afuera */
  useEffect(() => {
    const h = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogoutConfirm = () => {
    setShowLogout(false);
    logout();
    navigate('/login', { replace: true });
  };

  const pageTitle = PAGE_TITLES[location.pathname] || 'Panel Admin';

  const initials = (user?.nombre || user?.username || '?')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="app-layout">

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        user={user}
        onLogout={() => setShowLogout(true)}
      />

      <div className={`main-area${collapsed ? ' sidebar-collapsed' : ''}`}>

        {/* Topbar */}
        <header className="topbar">
          {/* Toggle mobile */}
          <button className="icon-btn sidebar-mobile-toggle"
            onClick={() => setCollapsed(c => !c)}>
            <i className="fas fa-bars" />
          </button>

          <span className="topbar-title">{pageTitle}</span>

          <div className="topbar-search">
            <i className="fas fa-magnifying-glass" />
            <input placeholder="Buscar..." />
          </div>

          <div className="topbar-actions">
            <button className="icon-btn" title="Notificaciones">
              <i className="fas fa-bell" />
              <span className="dot" />
            </button>

            {/* Avatar + dropdown */}
            <div style={{ position:'relative' }} ref={userMenuRef}>
              <div
                className="topbar-avatar"
                style={{ background: AVATAR_BG[user?.rol] || AVATAR_BG.usuario, cursor:'pointer' }}
                onClick={() => setUserMenuOpen(o => !o)}
                title={user?.username}
              >
                {initials}
              </div>

              {userMenuOpen && (
                <div style={{
                  position:'absolute', top:'calc(100% + 8px)', right:0,
                  background:'var(--bg-surface)', border:'1px solid var(--border)',
                  borderRadius:10, width:210, boxShadow:'var(--shadow-lg)',
                  overflow:'hidden', zIndex:300,
                }}>
                  {/* Info usuario */}
                  <div style={{
                    padding:'14px 16px',
                    borderBottom:'1px solid var(--border-subtle)',
                  }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>
                      {user?.nombre || user?.username}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--mono)', marginTop:2 }}>
                      {user?.email}
                    </div>
                    <div style={{ marginTop:6 }}>
                      <span style={{
                        fontSize:10, fontWeight:700, fontFamily:'var(--mono)',
                        padding:'2px 8px', borderRadius:4,
                        background: user?.rol === 'admin' ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                        color: user?.rol === 'admin' ? 'var(--accent)' : 'var(--text-muted)',
                        border:`1px solid ${user?.rol === 'admin' ? 'rgba(47,129,247,.2)' : 'var(--border)'}`,
                      }}>
                        {ROLE_LABEL[user?.rol] || user?.rol}
                      </span>
                    </div>
                  </div>

                  {/* Mi Perfil */}
                  <NavLink
                    to="/perfil"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display:'flex', alignItems:'center', gap:10,
                      padding:'10px 16px', fontSize:13, color:'var(--text-secondary)',
                      textDecoration:'none', transition:'all .15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <i className="fas fa-circle-user" style={{ width:14, textAlign:'center' }} />
                    Mi Perfil
                  </NavLink>

                  {/* Logout */}
                  <div style={{ borderTop:'1px solid var(--border-subtle)', padding:6 }}>
                    <button
                      onClick={() => { setUserMenuOpen(false); setShowLogout(true); }}
                      style={{
                        width:'100%', display:'flex', alignItems:'center', gap:10,
                        padding:'8px 10px', borderRadius:6, border:'none', cursor:'pointer',
                        background:'none', fontSize:13, fontWeight:600,
                        color:'var(--danger)', transition:'background .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-soft)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <i className="fas fa-right-from-bracket" style={{ width:14, textAlign:'center' }} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Página activa */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {showLogout && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}