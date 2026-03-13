// Footer.jsx — Ruta: src/components/layout/Footer.jsx
import { NavLink } from 'react-router-dom';
import logo from "../../assets/img/logo.jpg";
import "../../assets/css/layout/Footer.css";

const LINKS_EXTERNOS = [
  { href:"https://ugelpkv.com/",                   label:"UGEL PKV" },
  { href:"https://www.perueduca.pe/",              label:"PerúEduca" },
  { href:"https://www.fondep.gob.pe/",             label:"FONDEP" },
  { href:"https://sice.minedu.gob.pe/",            label:"Portal SICE" },
  { href:"https://www.pronabec.gob.pe/beca-peru/", label:"Pronabec" },
];

const LINKS_INTERNOS = [
  { path:"/",                label:"Inicio" },
  { path:"/ResenaHistorica", label:"Reseña Histórica" },
  { path:"/NuestrosLogros",  label:"Nuestros Logros" },
  { path:"/Comunicados",     label:"Comunicados" },
  { path:"/Contacto",        label:"Contáctanos" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ie-footer">
      <div className="ie-footer-top">
        <div className="container">
          <div className="row g-5">

            {/* Col 1: Institución */}
            <div className="col-lg-4 col-md-6">
              <div className="footer-brand">
                <img src={logo} alt="Logo I.E." className="footer-brand-logo" />
                <div>
                  <div className="footer-brand-name">I.E. Andrés Avelino Cáceres</div>
                  <div className="footer-brand-sub">Sirenachayocc · Kimbiri · Cusco · Perú</div>
                </div>
              </div>
              <p className="footer-description">
                Institución educativa pública comprometida con la formación integral de
                estudiantes de 1° a 5° de secundaria, promoviendo valores, excelencia
                académica y desarrollo personal.
              </p>
              <div className="footer-social">
                <a href="https://www.facebook.com/profile.php?id=61557420458905"
                  target="_blank" rel="noopener noreferrer"
                  className="footer-social-link" aria-label="Facebook">
                  <i className="bi bi-facebook" />
                </a>
              </div>
            </div>

            {/* Col 2: Navegación */}
            <div className="col-lg-2 col-md-3 col-6">
              <h3 className="footer-heading"><i className="bi bi-link-45deg" />Navegación</h3>
              <ul className="footer-links">
                {LINKS_INTERNOS.map(l => (
                  <li key={l.path}><NavLink to={l.path}>{l.label}</NavLink></li>
                ))}
              </ul>
            </div>

            {/* Col 3: Enlaces externos */}
            <div className="col-lg-2 col-md-3 col-6">
              <h3 className="footer-heading"><i className="bi bi-globe" />Enlaces</h3>
              <ul className="footer-links">
                {LINKS_EXTERNOS.map(l => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Horario + Contacto */}
            <div className="col-lg-4 col-md-6">
              <h3 className="footer-heading"><i className="bi bi-clock" />Atención</h3>
              <ul className="footer-schedule">
                <li className="open">
                  <i className="bi bi-check-circle-fill" />
                  <span>Lunes a Viernes: <strong style={{color:'rgba(255,255,255,.85)'}}>8:00 – 16:00</strong></span>
                </li>
                <li className="closed">
                  <i className="bi bi-x-circle-fill" />
                  <span>Sábados y Domingos: Cerrado</span>
                </li>
              </ul>

              <h3 className="footer-heading" style={{marginTop:'1.5rem'}}><i className="bi bi-telephone" />Contacto</h3>
              <ul className="footer-contact-list">
                <li className="ci-location">
                  <i className="bi bi-geo-alt-fill" />
                  <span>Jr. 28 de julio s/n, C.P. Sirenachayocc, Kimbiri, La Convención, Cusco</span>
                </li>
                <li className="ci-phone">
                  <i className="bi bi-telephone-fill" />
                  <a href="tel:+51950891414">950 891 414</a>
                </li>
                <li className="ci-email">
                  <i className="bi bi-envelope-fill" />
                  <a href="mailto:aacaceresirenachayocc@gmail.com">aacaceresirenachayocc@gmail.com</a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <hr className="ie-footer-divider" />

      <div className="ie-footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p className="footer-copy">
              © {year} <strong>I.E. Andrés Avelino Cáceres</strong>. Todos los derechos reservados.
            </p>
            <ul className="footer-bottom-links">
              <li><NavLink to="/politicas">Políticas</NavLink></li>
              <li><NavLink to="/condiciones">Condiciones</NavLink></li>
              <li><NavLink to="/mapa-del-sitio">Mapa del sitio</NavLink></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}