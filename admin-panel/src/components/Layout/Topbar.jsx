import { useLocation } from 'react-router-dom';
import authService from '../../services/auth';

const AVATAR_COLORS = {
  admin:   'linear-gradient(135deg,#2f81f7,#388bfd)',
  editor:  'linear-gradient(135deg,#a371f7,#8957e5)',
  docente: 'linear-gradient(135deg,#3fb950,#2da44e)',
  usuario: 'linear-gradient(135deg,#8b949e,#6e7681)',
};

const PAGE_TITLES = {
  '/':              'Dashboard',
  '/noticias':      'Noticias',
  '/comunicados':   'Comunicados',
  '/eventos':       'Eventos',
  '/docentes':      'Docentes',
  '/horarios':      'Horarios',
  '/biblioteca':    'Biblioteca Digital',
  '/usuarios':      'Gestión de Usuarios',
  '/configuracion': 'Configuración',
  '/perfil':        'Mi Perfil',
};

const Topbar = () => {
  const location = useLocation();
  const user     = authService.getCurrentUser();

  const getTitle = () => {
    if (PAGE_TITLES[location.pathname]) return PAGE_TITLES[location.pathname];
    const match = Object.keys(PAGE_TITLES).find(k => k !== '/' && location.pathname.startsWith(k));
    return match ? PAGE_TITLES[match] : 'Panel Admin';
  };

  const initials = (user?.nombre || user?.username || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="topbar">
      <span className="topbar-title">{getTitle()}</span>

      <div className="topbar-search">
        <i className="fas fa-magnifying-glass" />
        <input placeholder="Buscar en el sistema..." />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" aria-label="Notificaciones">
          <i className="fas fa-bell" />
          <span className="dot" />
        </button>
        <button className="icon-btn" aria-label="Pantalla completa"
          onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}>
          <i className="fas fa-expand" />
        </button>
        <div
          className="topbar-avatar"
          style={{ background: AVATAR_COLORS[user?.rol] || AVATAR_COLORS.usuario }}
          title={user?.username}
        >
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Topbar;