import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/Vision.css";

export default function Vision() {
  useEffect(() => {
    AOS.init({ once: true, duration: 1000, easing: 'ease-out-back' });
  }, []);

  const visionGoals = [
    {
      title: "Liderazgo Educativo",
      description: "Ser referente regional en innovación pedagógica y gestión escolar.",
      icon: "bi-trophy"
    },
    {
      title: "Tecnología e Inclusión",
      description: "100% de aulas equipadas con recursos digitales accesibles para todos.",
      icon: "bi-laptop"
    },
    {
      title: "Ciudadanía Global",
      description: "Estudiantes con competencias para actuar éticamente en un mundo interconectado.",
      icon: "bi-people"
    },
    {
      title: "Sostenibilidad",
      description: "Institución eco-eficiente con prácticas ambientales integradas al currículo.",
      icon: "bi-leaf"
    }
  ];

  return (
    <section className="vision-section py-5 position-relative overflow-hidden">
      <div className="vision-bg-pattern position-absolute top-0 start-0 w-100 h-100"></div>

      <div className="container position-relative">
        {/* Título principal */}
        <div className="text-center mb-5" data-aos="zoom-in">
          <div className="vision-emblem d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white mb-3">
            <i className="bi bi-eye-fill fs-1"></i>
          </div>
          <h1 className="vision-title display-4 fw-bold text-success">
            NUESTRA <span className="text-dark">VISIÓN</span>
          </h1>
          <div className="w-25 mx-auto border-bottom border-success border-3 rounded"></div>
        </div>

        {/* Contenido principal */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6" data-aos="fade-right">
            <div className="vision-card p-4 rounded-4 shadow-sm h-100">
              <h3 className="text-success mb-3">
                <i className="bi bi-rocket me-2"></i>
                Formando Líderes del Futuro
              </h3>
              <p className="vision-text">
                Al 2027, seremos una institución líder en la formación de ciudadanos competitivos, autónomos, críticos, reflexivos, innovadores, emprendedores y creativos, capaces de enfrentar nuevos retos y desafíos en este mundo globalizado.
              </p>
              <p className="vision-text mt-2">
                Nuestros estudiantes demostrarán sus competencias logradas, convivirán de manera libre y justa, respetarán la dignidad humana y valorarán la diversidad cultural, garantizando la igualdad de oportunidades.
              </p>
            </div>
          </div>

          <div className="col-lg-6" data-aos="fade-left">
            <div className="vision-card p-4 rounded-4 shadow-sm h-100">
              <h3 className="text-primary mb-3">
                <i className="bi bi-building me-2"></i>
                Infraestructura y Comunidad
              </h3>
              <p className="vision-text">
                Contaremos con una moderna infraestructura y equipamiento tecnológico de vanguardia, que potencie el aprendizaje activo y colaborativo.
              </p>
              <p className="vision-text mt-2">
                Con el liderazgo del equipo directivo y administrativo, docentes altamente calificados y padres de familia comprometidos, construiremos juntos el desarrollo integral de cada estudiante.
              </p>
              <blockquote className="fst-italic text-muted mt-3 border-start border-success ps-3">
                "El futuro pertenece a quienes creen en la belleza de sus sueños."
                <footer className="blockquote-footer mt-1">— Eleanor Roosevelt</footer>
              </blockquote>
            </div>
          </div>
        </div>

        {/* Metas al 2027 */}
        <div className="text-center mb-5" data-aos="fade-up">
          <h2 className="h4 fw-bold text-success mb-4">Nuestras Metas Estratégicas al 2027</h2>
        </div>

        <div className="row g-4 mb-5">
          {visionGoals.map((goal, index) => (
            <div className="col-md-6 col-lg-3" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="goal-card p-4 rounded-3 text-center h-100 d-flex flex-column align-items-center shadow-sm">
                <div className="goal-icon mb-3 text-success">
                  <i className={`bi ${goal.icon} fs-2`}></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">{goal.title}</h5>
                <p className="text-muted small">{goal.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Frase inspiradora */}
        <div className="text-center py-4 px-3 rounded-4 bg-gradient-success text-white" data-aos="zoom-in" data-aos-delay="400">
          <p className="fs-4 mb-0">
            <i className="bi bi-quote me-2"></i>
            No solo preparamos para el futuro: lo construimos juntos, hoy.
            <i className="bi bi-quote ms-2"></i>
          </p>
        </div>

        {/* Íconos decorativos */}
        <i className="bi bi-globe icon-spin position-absolute opacity-20" style={{ top: "8%", left: "12%", fontSize: "2.2rem" }}></i>
        <i className="bi bi-lightbulb icon-spin position-absolute opacity-20" style={{ top: "55%", right: "18%", fontSize: "2rem" }}></i>
        <i className="bi bi-award icon-spin position-absolute opacity-20" style={{ bottom: "15%", left: "45%", fontSize: "2.2rem" }}></i>
        <i className="bi bi-stars icon-spin position-absolute opacity-20" style={{ top: "30%", right: "30%", fontSize: "1.8rem" }}></i>
      </div>
    </section>
  );
}