import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/Mision.css";

export default function Mision() {
  useEffect(() => {
    AOS.init({ once: true, duration: 1000, easing: 'ease-out-back' });
  }, []);

  const stats = [
    { value: "100%", label: "Compromiso con la calidad educativa", icon: "bi-mortarboard" },
    { value: "98%", label: "Estudiantes en ambientes seguros e inclusivos", icon: "bi-shield-check" },
    { value: "95%", label: "Docentes certificados y en formación continua", icon: "bi-person-badge" },
    { value: "100%", label: "Enfoque en ciudadanía del siglo XXI", icon: "bi-globe" },
  ];

  return (
    <section className="mission-section py-5 position-relative overflow-hidden">
      <div className="mission-bg-pattern position-absolute top-0 start-0 w-100 h-100"></div>

      <div className="container position-relative">
        {/* Título principal */}
        <div className="text-center mb-5" data-aos="zoom-in">
          <div className="mission-emblem d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white mb-3">
            <i className="bi bi-bullseye fs-1"></i>
          </div>
          <h1 className="mission-title display-4 fw-bold text-primary">
            NUESTRA <span className="text-dark">MISIÓN</span>
          </h1>
          <div className="w-25 mx-auto border-bottom border-primary border-3 rounded"></div>
        </div>

        {/* Contenido principal */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6" data-aos="fade-right">
            <div className="mission-card p-4 rounded-4 shadow-sm h-100">
              <h3 className="text-primary mb-3">
                <i className="bi bi-rocket-takeoff me-2"></i>
                Formación Integral
              </h3>
              <p className="mission-text">
                Lograr que todas y todos los estudiantes culminen la escolaridad en el nivel de educación secundaria, afiancen los aprendizajes del currículo nacional y alcancen su desarrollo integral en espacios seguros, inclusivos, de sana convivencia y libres de violencia.
              </p>
              <blockquote className="fst-italic text-muted mt-3 border-start border-primary ps-3">
                "Educar no es llenar un recipiente, sino encender una llama."
                <footer className="blockquote-footer mt-1">— Inspirado en W.B. Yeats</footer>
              </blockquote>
            </div>
          </div>

          <div className="col-lg-6" data-aos="fade-left">
            <div className="mission-card p-4 rounded-4 shadow-sm h-100">
              <h3 className="text-success mb-3">
                <i className="bi bi-lightbulb me-2"></i>
                Innovación y Futuro
              </h3>
              <p className="mission-text">
                Promover habilidades socioemocionales, creatividad, pensamiento crítico y participación activa, formando ciudadanos responsables y preparados para los desafíos del siglo XXI.
              </p>
              <p className="mission-text mt-2">
                Apostamos por un aprendizaje continuo y flexible, donde la tecnología y la innovación se integran para mejorar la experiencia educativa y garantizar el éxito de cada estudiante.
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="row g-4 mb-5" data-aos="fade-up" data-aos-delay="200">
          {stats.map((stat, index) => (
            <div className="col-md-6 col-lg-3" key={index}>
              <div className="stat-card text-center p-4 rounded-3 bg-light h-100 d-flex flex-column justify-content-center align-items-center shadow-sm">
                <div className="stat-icon mb-3 text-primary">
                  <i className={`bi ${stat.icon} fs-2`}></i>
                </div>
                <div className="stat-value fw-bold display-6 text-primary">{stat.value}</div>
                <div className="stat-label text-muted small">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Frase inspiradora */}
        <div className="text-center py-4 px-3 rounded-4 bg-gradient-primary text-white" data-aos="zoom-in" data-aos-delay="400">
          <p className="fs-4 mb-0">
            <i className="bi bi-quote me-2"></i>
            Formamos no solo estudiantes, sino líderes con valores, visión y compromiso social.
            <i className="bi bi-quote ms-2"></i>
          </p>
        </div>

        {/* Íconos flotantes */}
        <i className="bi bi-stars icon-float position-absolute opacity-25" style={{ top: "5%", left: "8%", fontSize: "2rem" }}></i>
        <i className="bi bi-lightning icon-float position-absolute opacity-25" style={{ top: "60%", right: "12%", fontSize: "1.8rem" }}></i>
        <i className="bi bi-award icon-float position-absolute opacity-25" style={{ bottom: "10%", left: "35%", fontSize: "2rem" }}></i>
        <i className="bi bi-people icon-float position-absolute opacity-25" style={{ top: "30%", right: "25%", fontSize: "1.6rem" }}></i>
      </div>
    </section>
  );
}