// Accesos.jsx — Ruta: src/components/ui/Accesos.jsx
// Usa Bootstrap Icons (bi-*) en lugar de react-icons para consistencia con el resto del proyecto
import { Link } from "react-router-dom";
import "../../assets/css/ui/Accesos.css";

const PRINCIPALES = [
  {
    icon: "bi-calendar3",        color: "blue",
    title: "Horario de Clases",
    desc:  "Consulta el horario académico actualizado por grado.",
    btn:   "Descargar PDF",      btnColor: "btn-blue",
    href:  "/pdfs/Documentos/HorarioEstudiantes.pdf",
    external: true, download: true,
  },
  {
    icon: "bi-megaphone-fill",   color: "blue",
    title: "Comunicados",
    desc:  "Entérate de las últimas noticias y avisos importantes.",
    btn:   "Ver comunicados",    btnColor: "btn-blue",
    to:    "/Comunicados",
  },
  {
    icon: "bi-book-half",        color: "green",
    title: "Plan Lector",
    desc:  "Lecturas recomendadas por grado y año escolar.",
    btn:   "Ver plan",           btnColor: "btn-green",
    to:    "/PlanLector",
  },
  {
    icon: "bi-collection-fill",  color: "purple",
    title: "Biblioteca Virtual",
    desc:  "Accede a libros y material educativo en línea.",
    btn:   "Ingresar",           btnColor: "btn-purple",
    to:    "/BibliotecaVirtual",
  },
  {
    icon: "bi-facebook",         color: "fbblue",
    title: "Síguenos",
    desc:  "Mantente al día con novedades y eventos en Facebook.",
    btn:   "Visitar página",     btnColor: "btn-fbblue",
    href:  "https://www.facebook.com/profile.php?id=61557420458905",
    external: true,
  },
];

const INSTITUCIONALES = [
  {
    icon: "bi-file-earmark-text-fill", color: "teal",
    title: "Documentos de Gestión",
    desc:  "PEI, PAT, PCI, reglamentos e informes oficiales.",
    btn:   "Ver documentos",           btnColor: "btn-teal",
    to:    "/DocumentosGestion",
  },
  {
    icon: "bi-clock-history",          color: "gray",
    title: "Reseña Histórica",
    desc:  "Conoce la trayectoria y fundación de nuestra institución.",
    btn:   "Conocer más",              btnColor: "btn-gray",
    to:    "/ResenaHistorica",
  },
  {
    icon: "bi-trophy-fill",            color: "gold",
    title: "Nuestros Logros",
    desc:  "Reconocimientos, proyectos y avances destacados.",
    btn:   "Ver logros",               btnColor: "btn-gold",
    to:    "/NuestrosLogros",
  },
];

function AccesoCard({ item }) {
  const body = (
    <>
      <div className={`acceso-icon-wrap ${item.color}`}>
        <i className={`bi ${item.icon}`} />
      </div>
      <h3 className="acceso-card-title">{item.title}</h3>
      <p className="acceso-card-desc">{item.desc}</p>
      <span className={`acceso-card-btn ${item.btnColor}`}>
        {item.btn}
        <i className="bi bi-arrow-right" />
      </span>
    </>
  );

  if (item.to) return <Link to={item.to} className="acceso-card">{body}</Link>;

  return (
    <a
      href={item.href}
      className="acceso-card"
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      download={item.download || undefined}
    >
      {body}
    </a>
  );
}

export default function Accesos() {
  return (
    <section className="accesos-section" aria-labelledby="accesos-heading">
      <div className="container">

        <div className="accesos-header">
          <span className="accesos-eyebrow">
            <i className="bi bi-grid-3x3-gap-fill" />Recursos disponibles
          </span>
          <h2 className="accesos-title" id="accesos-heading">Accesos Rápidos</h2>
          <p className="accesos-subtitle">
            Encuentra rápidamente los recursos más importantes de la institución educativa.
          </p>
        </div>

        <div className="accesos-grid grid-5">
          {PRINCIPALES.map((item, i) => <AccesoCard key={i} item={item} />)}
        </div>

        <div className="accesos-divider">
          <span>Recursos institucionales</span>
        </div>

        <div className="accesos-grid grid-3">
          {INSTITUCIONALES.map((item, i) => <AccesoCard key={i} item={item} />)}
        </div>

      </div>
    </section>
  );
}