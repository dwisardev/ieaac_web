import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/auth';

const AVATAR_COLORS = {
  admin:   'linear-gradient(135deg, #2f81f7, #388bfd)',
  editor:  'linear-gradient(135deg, #a371f7, #8957e5)',
  docente: 'linear-gradient(135deg, #3fb950, #2da44e)',
  usuario: 'linear-gradient(135deg, #8b949e, #6e7681)',
};

const menuItems = [
  { section: 'Principal' },
  { id: 'dashboard',     path: '/',             icon: 'fa-home',               label: 'Dashboard',          roles: ['admin','editor','docente'] },

  { section: 'Contenido' },
  { id: 'noticias',      path: '/noticias',      icon: 'fa-newspaper',          label: 'Noticias',           roles: ['admin','editor'] },
  { id: 'comunicados',   path: '/comunicados',   icon: 'fa-bullhorn',           label: 'Comunicados',        roles: ['admin','editor'] },
  { id: 'eventos',       path: '/eventos',       icon: 'fa-calendar-alt',       label: 'Eventos',            roles: ['admin','editor'] },
  { id: 'banners',       path: '/banners',       icon: 'fa-images',             label: 'Banners',            roles: ['admin','editor'] },

  { section: 'Académico' },
  { id: 'docentes',      path: '/docentes',      icon: 'fa-chalkboard-teacher', label: 'Docentes',           roles: ['admin','editor'] },
  { id: 'directorio',    path: '/directorio',    icon: 'fa-address-book',       label: 'Directorio',         roles: ['admin','editor'] },
  { id: 'horarios',      path: '/horarios',      icon: 'fa-clock',              label: 'Horarios',           roles: ['admin','editor'] },
  { id: 'biblioteca',    path: '/biblioteca',    icon: 'fa-book',               label: 'Biblioteca',         roles: ['admin','editor'] },
  { id: 'documentos',    path: '/documentos-gestion', icon: 'fa-folder-open',   label: 'Documentos',         roles: ['admin','editor'] },
  { id: 'plan-lector',   path: '/plan-lector',   icon: 'fa-book-open',          label: 'Plan Lector',        roles: ['admin','editor'] },
  { id: 'logros',        path: '/logros',        icon: 'fa-trophy',             label: 'Logros',             roles: ['admin','editor'] },

  { section: 'Proyecto FONDEP' },
  { id: 'portafolio',    path: '/portafolio-actividades', icon: 'fa-briefcase', label: 'Portafolio',         roles: ['admin','editor'] },
  { id: 'monitoreo',     path: '/sistema-monitoreo',      icon: 'fa-chart-line', label: 'Monitoreo',         roles: ['admin','editor'] },
  { id: 'informe',       path: '/informe-final',          icon: 'fa-file-alt',   label: 'Informe Final',     roles: ['admin','editor'] },

  { section: 'Comunidad' },
  { id: 'familia',       path: '/familia-educativa', icon: 'fa-users',          label: 'Familia Educativa',  roles: ['admin','editor'] },

  { section: 'Administración', requiresAdmin: true },
  { id: 'usuarios',      path: '/usuarios',      icon: 'fa-user-shield',        label: 'Usuarios',           roles: ['admin'] },

  { section: 'Cuenta' },
  { id: 'perfil',        path: '/perfil',        icon: 'fa-user-circle',        label: 'Mi Perfil',          roles: ['admin','editor','docente'] },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fas fa-graduation-cap" />
        </div>
        {!collapsed && (
          <div className="sidebar-brand">
            <h3>I.E.A.A.C.</h3>
            <p>Panel Admin</p>
          </div>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          <i className={`fas fa-${collapsed ? 'chevron-right' : 'bars'}`} />
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, i) => {
            if (item.section) {
              if (item.requiresAdmin && user?.rol !== 'admin') return null;
              return (
                <li key={`sec-${i}`} className="nav-section-label">
                  {item.section}
                </li>
              );
            }

            if (!item.roles.includes(user?.rol)) return null;

            return (
              <li key={item.id} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <i className={`fas ${item.icon}`} />
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer usuario ── */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div
            className="user-avatar"
            style={{ background: AVATAR_COLORS[user?.rol] || AVATAR_COLORS.usuario }}
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.username || 'Usuario'}</div>
            <span className="user-role">{user?.rol}</span>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;