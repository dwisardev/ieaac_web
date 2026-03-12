// Navbar.jsx — Ruta: src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo     from "../../assets/img/logo.jpg";
import insignia from "../../assets/img/insignia.jpg";
import "../../assets/css/layout/Navbar.css";

const MENU = [
  { path:"/", label:"Inicio", icon:"bi-house-door-fill" },
  { label:"Nosotros", icon:"bi-people-fill", key:"nosotros", items:[
    { path:"/nosotros/resena-historica",   label:"Reseña Histórica" },
    { path:"/nosotros/normas-convivencia", label:"Normas de Convivencia" },
    { path:"/nosotros/mision",             label:"Misión" },
    { path:"/nosotros/vision",             label:"Visión" },
    { path:"/nosotros/directorio",         label:"Directorio" },
    { path:"/nosotros/logros",             label:"Nuestros Logros" },
  ]},
  { path:"/comunidad/familia-educativa", label:"Comunidad", icon:"bi-people" },
  { label:"FONDEP", icon:"bi-journal-text", key:"fondep", items:[
    { path:"/fondep/portafolio-actividades", label:"Portafolio de Actividades" },
    { path:"/fondep/cronograma",             label:"Cronograma" },
    { path:"/fondep/estrategias",            label:"Estrategias" },
    { path:"/fondep/sistema-monitoreo",      label:"Monitoreo" },
    { path:"/fondep/informe-final",          label:"Informe Final" },
  ]},
  { label:"Recursos", icon:"bi-book-half", key:"recursos", items:[
    { path:"/recursos/plan-lector",           label:"Plan Lector" },
    { path:"/recursos/documentos-gestion",    label:"Documentos de Gestión" },
    { path:"/recursos/horarios",              label:"Horario de Clases" },
    { path:"/recursos/biblioteca-virtual",    label:"Biblioteca Virtual" },
  ]},
  { path:"/comunicados", label:"Comunicados", icon:"bi-megaphone-fill" },
];

function IEModal({ title, icon, onClose, children }) {
  useEffect(() => {
    const fn = (e) => { if (e.key==='Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <div className="ie-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ie-modal-box" style={{ width:'100%', maxWidth: title==='Ubicación de la Institución' ? 720 : 460 }} onClick={e=>e.stopPropagation()}>
        <div className="ie-modal-header">
          <h5><i className={`bi ${icon}`} style={{ color:'#c8952a' }} />{title}</h5>
          <button className="ie-modal-close" onClick={onClose} aria-label="Cerrar"><i className="bi bi-x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Navbar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [scrolled,     setScrolled]     = useState(false);
  const [openMenu,     setOpenMenu]     = useState(null);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [mobileDD,     setMobileDD]     = useState(null);
  const [showMap,      setShowMap]      = useState(false);
  const [showInsignia, setShowInsignia] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setOpenMenu(null); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const fn = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const go = (path) => { navigate(path); setMobileOpen(false); setMobileDD(null); };

  return (
    <>
      <nav ref={navRef} className={`ie-navbar${scrolled?' scrolled':''}`} aria-label="Navegación principal">
        <div className="nav-inner">
          {/* Brand */}
          <NavLink to="/" className="ie-brand" aria-label="Inicio">
            <img src={logo} alt="Logo IE" className="ie-brand-logo" />
            <div className="ie-brand-info">
              <span className="ie-brand-name" onClick={e=>{e.preventDefault();setShowInsignia(true);}} title="Ver insignia">
                I.E. Andrés Avelino Cáceres
              </span>
              <span className="ie-brand-sub">Sirenachayocc · Cusco</span>
            </div>
            <i className="bi bi-geo-alt-fill ie-brand-location" onClick={e=>{e.preventDefault();setShowMap(true);}} title="Ver ubicación" tabIndex={0} aria-label="Ver ubicación" />
          </NavLink>

          {/* Desktop nav */}
          <ul className="ie-nav-list">
            {MENU.map(item => item.path ? (
              <li key={item.path} className="ie-nav-item">
                <NavLink to={item.path} className={({isActive})=>`ie-nav-link${isActive?' active':''}`}>
                  <i className={`bi ${item.icon}`} />{item.label}
                </NavLink>
              </li>
            ) : (
              <li key={item.key} className="ie-nav-item"
                onMouseEnter={()=>setOpenMenu(item.key)}
                onMouseLeave={()=>setOpenMenu(null)}>
                <button className={`ie-nav-btn${openMenu===item.key?' open':''}`}
                  onClick={()=>setOpenMenu(o=>o===item.key?null:item.key)}
                  aria-expanded={openMenu===item.key}>
                  <i className={`bi ${item.icon}`} />{item.label}
                  <i className="bi bi-chevron-down ie-dropdown-arrow" />
                </button>
                <ul className={`ie-dropdown${openMenu===item.key?' open':''}`}>
                  {item.items.map(sub=>(
                    <li key={sub.path}>
                      <button className="ie-dropdown-item" onClick={()=>{go(sub.path);setOpenMenu(null);}}>
                        {sub.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <button className="ie-contact-btn" onClick={()=>go('/contacto')}>
            <i className="bi bi-envelope-fill" />Contactar
          </button>

          <button className={`ie-toggler${mobileOpen?' open':''}`} onClick={()=>setMobileOpen(o=>!o)} aria-label="Menú">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Offcanvas */}
      <div className={`ie-offcanvas-backdrop${mobileOpen?' open':''}`} onClick={()=>setMobileOpen(false)} />
      <div className={`ie-offcanvas${mobileOpen?' open':''}`} aria-hidden={!mobileOpen}>
        <div className="ie-offcanvas-header">
          <span className="ie-offcanvas-title">Menú</span>
          <button className="ie-offcanvas-close" onClick={()=>setMobileOpen(false)}><i className="bi bi-x" /></button>
        </div>
        <div className="ie-offcanvas-body">
          {MENU.map(item => item.path ? (
            <NavLink key={item.path} to={item.path}
              className={({isActive})=>`ie-mobile-link${isActive?' active':''}`}
              onClick={()=>setMobileOpen(false)}>
              <i className={`bi ${item.icon}`} />{item.label}
            </NavLink>
          ) : (
            <div key={item.key}>
              <button className={`ie-mobile-btn${mobileDD===item.key?' open':''}`}
                onClick={()=>setMobileDD(d=>d===item.key?null:item.key)}>
                <span style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                  <i className={`bi ${item.icon}`} />{item.label}
                </span>
                <i className="bi bi-chevron-down ie-dropdown-arrow" />
              </button>
              <div className={`ie-mobile-submenu${mobileDD===item.key?' open':''}`}>
                {item.items.map(sub=>(
                  <button key={sub.path} className="ie-mobile-sub-item" onClick={()=>go(sub.path)}>
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="ie-offcanvas-footer">
          <button className="ie-mobile-contact" onClick={()=>go('/contacto')}>
            <i className="bi bi-envelope-fill" />Contactar
          </button>
        </div>
      </div>

      {showMap && (
        <IEModal title="Ubicación de la Institución" icon="bi-geo-alt-fill" onClose={()=>setShowMap(false)}>
          <iframe src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d972.8536145234435!2d-73.63821248455582!3d-12.751574624337985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1ssirenachayoc!5e0!3m2!1ses-419!2spe!4v1758681035054!5m2!1ses-419!2spe"
            width="100%" height="420" style={{border:0,display:'block'}} allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade" title="Mapa I.E. Andrés Avelino Cáceres" />
        </IEModal>
      )}

      {showInsignia && (
        <IEModal title="Insignia Institucional" icon="bi-award-fill" onClose={()=>setShowInsignia(false)}>
          <div style={{padding:'1.5rem',textAlign:'center'}}>
            <img src={insignia} alt="Insignia" style={{maxHeight:360,maxWidth:'100%',borderRadius:8}}
              onError={e=>{e.target.style.display='none';}} />
          </div>
        </IEModal>
      )}
    </>
  );
}