import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../assets/css/pages/NormasConvivencia.css";
import bannerNC from "../../assets/img/BannerNC.png";

export default function NormasConvivencia() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const normas = [
    {
      icon: "bi-clock-fill",
      titulo: "Cumplimos el horario escolar establecido.",
      color: "primary"
    },
    {
      icon: "bi-person-badge-fill",
      titulo: "Cuidamos nuestra presentación personal.",
      color: "success"
    },
    {
      icon: "bi-hand-thumbs-up-fill",
      titulo: "Expresamos empatía y respeto mutuo.",
      color: "info"
    },
    {
      icon: "bi-brightness-high-fill",
      titulo: "Practicamos la limpieza y el orden.",
      color: "warning"
    },
    {
      icon: "bi-building",
      titulo: "Respetamos los bienes y la infraestructura del colegio.",
      color: "danger"
    },
  ];

  return (
    <div className="normas-convivencia">
      {/* Banner */}
      <div className="banner-container">
        <img src={bannerNC} alt="Normas de Convivencia" className="img-fluid w-100 banner-img" />
        <div className="banner-overlay">
          <h1 className="banner-text">Normas de Convivencia Escolar</h1>
        </div>
      </div>

      {/* Normas */}
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center mb-4" data-aos="fade-down">
          <div className="col-lg-8 text-center">
            <h2 className="display-5 fw-bold text-warning mb-3">
              <i className="bi bi-shield-check me-2"></i>
              Nuestros Compromisos
            </h2>
            <p className="lead text-muted">
              Valores fundamentales que guían nuestra convivencia diaria en la institución educativa
            </p>
          </div>
        </div>

        <div className="row g-4">
          {normas.map((norma, index) => (
            <div className="col-md-6 col-lg-4" key={index} data-aos="zoom-in" data-aos-delay={index * 100}>
              <div className="norma-card shadow-lg h-100">
                <div className="card-body text-center p-4">
                  <div className={`icon-wrapper bg-${norma.color} bg-gradient`}>
                    <i className={`bi ${norma.icon} text-white`}></i>
                  </div>
                  <p className="card-text mt-3 mb-0 fw-semibold">{norma.titulo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje final */}
        <div className="row mt-5">
          <div className="col-12" data-aos="fade-up">
            <div className="alert alert-warning border-0 shadow-sm" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-info-circle-fill fs-2 me-3"></i>
                <div>
                  <h5 className="alert-heading mb-2">¡Compromiso de Todos!</h5>
                  <p className="mb-0">
                    El cumplimiento de estas normas es responsabilidad compartida entre estudiantes, docentes y padres de familia para crear un ambiente escolar seguro y armonioso.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}