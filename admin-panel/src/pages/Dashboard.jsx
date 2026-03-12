import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AVATAR_BG = {
  admin:   'linear-gradient(135deg,#2f81f7,#388bfd)',
  editor:  'linear-gradient(135deg,#a371f7,#8957e5)',
  docente: 'linear-gradient(135deg,#3fb950,#2da44e)',
  usuario: 'linear-gradient(135deg,#8b949e,#6e7681)',
};

const HOUR_GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

const fmtFecha = (f) =>
  f ? new Date(f).toLocaleDateString('es-PE', { day:'numeric', month:'short', year:'numeric' }) : '—';

function NoticiaRow({ n }) {
  const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || '';
  const imgSrc = n.imagen
    ? (n.imagen.startsWith('http') ? n.imagen : `${UPLOAD_URL}/noticias/${n.imagen}`)
    : null;
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'10px 0', borderBottom:'1px solid var(--border-subtle)',
    }}>
      <div style={{
        width:44, height:34, borderRadius:7, flexShrink:0,
        overflow:'hidden', background:'var(--bg-elevated)',
        border:'1px solid var(--border)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {imgSrc
          ? <img src={imgSrc} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
              onError={e => e.target.style.display='none'} />
          : <i className="fas fa-image" style={{ color:'var(--text-muted)', fontSize:13 }} />}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {n.titulo}
        </div>
        <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
          {n.categoria && (
            <span style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:4, padding:'0 5px', fontSize:10, marginRight:6 }}>
              {n.categoria}
            </span>
          )}
          {fmtFecha(n.fecha || n.created_at)}
        </div>
      </div>
      {n.destacada == 1 && <i className="fas fa-star" style={{ color:'var(--warning)', fontSize:11, flexShrink:0 }} />}
    </div>
  );
}

export default function Dashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [stats,   setStats]   = useState({ noticias:0, comunicados:0, docentes:0, usuarios:0 });
  const [ultimas, setUltimas] = useState([]);
  const [loading, setLoading] = useState(true);

  const initials = (user?.nombre || user?.username || '?')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const norm = (r) => {
          if (r.status !== 'fulfilled') return [];
          const body = r.value?.data;
          return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
        };
        const [rN, rC, rD] = await Promise.allSettled([
          api.get('/admin/noticias'),
          api.get('/admin/comunicados'),
          api.get('/public/docentes'),
        ]);
        const noticias    = norm(rN);
        const comunicados = norm(rC);
        const docentes    = norm(rD);

        let usuarios = 0;
        if (user?.rol === 'admin') {
          try {
            const rU = await api.get('/admin/usuarios');
            const body = rU?.data;
            usuarios = (Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []).length;
          } catch {}
        }

        setStats({ noticias: noticias.length, comunicados: comunicados.length, docentes: docentes.length, usuarios });
        setUltimas([...noticias].sort((a,b) => new Date(b.fecha||b.created_at) - new Date(a.fecha||a.created_at)).slice(0,5));
      } catch (e) {
        console.error('Dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.rol]);

  const now     = new Date();
  const fechaHoy = now.toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const STAT_CARDS = [
    { icon:'fa-newspaper',    label:'Noticias publicadas', value:stats.noticias,    cardAccent:'#2f81f7', cardBg:'rgba(47,129,247,.12)',  to:'/noticias'    },
    { icon:'fa-bullhorn',     label:'Comunicados',         value:stats.comunicados, cardAccent:'#d29922', cardBg:'rgba(210,153,34,.12)',  to:'/comunicados' },
    { icon:'fa-chalkboard-user', label:'Docentes',         value:stats.docentes,    cardAccent:'#3fb950', cardBg:'rgba(63,185,80,.12)',   to:'/docentes'    },
    ...(user?.rol === 'admin' ? [
      { icon:'fa-users',      label:'Usuarios del sistema',value:stats.usuarios,    cardAccent:'#a371f7', cardBg:'rgba(163,113,247,.12)', to:'/usuarios' }
    ] : []),
  ];

  return (
    <div className="page-section">

      {/* ── Bienvenida ── */}
      <div className="welcome-banner" style={{ marginBottom:24 }}>
        <div style={{
          width:52, height:52, borderRadius:13, flexShrink:0,
          background: AVATAR_BG[user?.rol] || AVATAR_BG.usuario,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:19, fontWeight:800, color:'#fff',
          boxShadow:'0 4px 16px rgba(0,0,0,.25)', position:'relative', zIndex:1,
        }}>
          {initials}
        </div>
        <div className="welcome-text">
          <h2>{HOUR_GREETING()}, {user?.nombre || user?.username} 👋</h2>
          <p>
            <span style={{
              background:'var(--bg-elevated)', border:'1px solid var(--border)',
              borderRadius:4, padding:'1px 7px', fontSize:11, fontWeight:700,
              marginRight:8, fontFamily:'var(--mono)',
            }}>
              {user?.rol?.toUpperCase()}
            </span>
            {fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)}
          </p>
        </div>
        <div style={{ textAlign:'right', fontSize:11, color:'var(--text-muted)', position:'relative', zIndex:1 }}>
          <div>I.E. Andrés Avelino Cáceres</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:10, marginTop:3 }}>Panel Admin v1.0</div>
        </div>
      </div>

      {/* ── Stats — usa el StatCard del CSS existente ── */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        {STAT_CARDS.map(c => (
          <div
            key={c.label}
            className="stat-card"
            style={{ '--card-accent': c.cardAccent, '--card-bg': c.cardBg, cursor:'pointer' }}
            onClick={() => navigate(c.to)}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <i className={`fas ${c.icon}`} />
              </div>
            </div>
            <div className="stat-value">
              {loading
                ? <div style={{ width:40, height:28, borderRadius:6, background:'var(--bg-elevated)', animation:'pulse 1.2s infinite' }} />
                : c.value
              }
            </div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Contenido inferior ── */}
      <div className="content-grid">

        {/* Últimas noticias */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <i className="fas fa-clock-rotate-left" />
              Últimas noticias publicadas
            </span>
            <button className="card-action" onClick={() => navigate('/noticias')}>
              Ver todas <i className="fas fa-arrow-right" />
            </button>
          </div>
          <div className="card-body">
            {loading ? (
              Array.from({ length:4 }).map((_,i) => (
                <div key={i} style={{ height:46, borderRadius:8, background:'var(--bg-elevated)', marginBottom:8, animation:'pulse 1.2s infinite', animationDelay:`${i*.1}s` }} />
              ))
            ) : ultimas.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-newspaper" />
                <p>No hay noticias aún</p>
              </div>
            ) : (
              ultimas.map(n => <NoticiaRow key={n.id} n={n} />)
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <i className="fas fa-bolt" />
              Accesos rápidos
            </span>
          </div>
          <div className="card-body">
            <div className="quick-grid">
              {[
                { icon:'fa-plus',           label:'Nueva noticia',      to:'/noticias'    },
                { icon:'fa-megaphone',      label:'Nuevo comunicado',   to:'/comunicados' },
                { icon:'fa-user-plus',      label:'Agregar docente',    to:'/docentes'    },
                { icon:'fa-circle-user',    label:'Mi perfil',          to:'/perfil'      },
                ...(user?.rol === 'admin' ? [
                  { icon:'fa-user-gear',    label:'Usuarios',           to:'/usuarios'    },
                ] : []),
              ].map(q => (
                <button key={q.label} className="quick-btn" onClick={() => navigate(q.to)}>
                  <i className={`fas ${q.icon}`} />
                  <span>{q.label}</span>
                </button>
              ))}
            </div>

            {/* Info sistema */}
            <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid var(--border-subtle)', fontSize:11, color:'var(--text-muted)', lineHeight:1.8 }}>
              <div><i className="fas fa-database" style={{ marginRight:6, width:12 }} />MySQL 8.0 · PHP 8.4</div>
              <div><i className="fas fa-code" style={{ marginRight:6, width:12 }} />React + Vite</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:10, marginTop:4 }}>{user?.email}</div>
            </div>
          </div>
        </div>

      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}