// HeroSection.jsx — src/pages/home/HeroSection.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import "../../assets/css/pages/HeroSection.css";
//import { bannersService } from "../../services/bannersService";

const FALLBACK = {
  id:         "default",
  imagen:     "/img/Banners/BannerHome.jpg",
  imagen_url: "/img/Banners/BannerHome.jpg",
  titulo:     "I.E. Andrés Avelino Cáceres",
  subtitulo:  "Formando líderes del mañana con disciplina, estudio y deporte.",
  enlace:     null,
};

const PILARES = [
  { key: "disciplina", icon: "bi-award-fill",    label: "Disciplina", cls: "disciplina" },
  { key: "estudio",    icon: "bi-lightbulb-fill", label: "Estudio",    cls: "estudio"    },
  { key: "deporte",    icon: "bi-trophy-fill",    label: "Deporte",    cls: "deporte"    },
];

export default function HeroSection() {
  const [banners, setBanners] = useState([FALLBACK]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await bannersService.getActivos();
        setBanners(data.length > 0 ? data : [FALLBACK]);
      } catch {
        setBanners([FALLBACK]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % banners.length);
    }, 5000);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length > 1) startTimer();
    return () => clearInterval(timerRef.current);
  }, [banners.length, startTimer]);

  const goTo = (idx) => { setCurrent(idx); startTimer(); };
  const prev  = ()    => goTo((current - 1 + banners.length) % banners.length);
  const next  = ()    => goTo((current + 1) % banners.length);

  const handleClick = (enlace) => {
    if (!enlace) return;
    // OWASP: solo permitir http/https o rutas internas relativas
    if (/^https?:\/\//i.test(enlace)) window.open(enlace, "_blank", "noopener,noreferrer");
    else if (/^\/[a-zA-Z0-9\-/_]*$/.test(enlace)) window.location.href = enlace;
    // Cualquier otra cosa (javascript:, data:, etc.) se ignora
  };

  const imgSrc = (b) => {
    if (!b)                          return FALLBACK.imagen;
    if (b.imagen_url)                return b.imagen_url;
    if (!b.imagen)                   return FALLBACK.imagen;
    if (b.imagen.startsWith("http")) return b.imagen;
    return `${import.meta.env.VITE_UPLOAD_URL || ""}/banners/${b.imagen}`;
  };

  return (
    <section className="hero-section">

      {/* ── Carrusel ── */}
      <div className="hero-carousel-wrap">
        {loading ? (
          <div className="hero-loading"><div className="hero-spinner" /></div>
        ) : (
          <>
            {banners.map((banner, idx) =>
              idx === current ? (
                <div
                  key={banner.id}
                  className={`hero-slide active${banner.enlace ? " clickable" : ""}`}
                  onClick={() => handleClick(banner.enlace)}
                  role={banner.enlace ? "button" : undefined}
                  aria-label={banner.enlace ? `Ver más: ${banner.titulo}` : undefined}
                  tabIndex={banner.enlace ? 0 : undefined}
                  onKeyDown={banner.enlace
                    ? (e) => e.key === "Enter" && handleClick(banner.enlace)
                    : undefined}
                >
                  <img
                    src={imgSrc(banner)}
                    alt={banner.titulo || "Banner institucional"}
                    onError={e => {
                      if (!e.target.dataset.err) {
                        e.target.dataset.err = "1";
                        e.target.src = FALLBACK.imagen;
                      }
                    }}
                  />
                  <div className="hero-slide-overlay" aria-hidden="true" />
                  {(banner.titulo || banner.subtitulo) && (
                    <div className="hero-slide-content">
                      {banner.titulo    && <h1 className="hero-slide-titulo">{banner.titulo}</h1>}
                      {banner.subtitulo && <p  className="hero-slide-subtitulo">{banner.subtitulo}</p>}
                      {banner.enlace    && (
                        <span className="hero-slide-badge">
                          <i className="bi bi-arrow-right-circle" />Ver más información
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : null
            )}

            {banners.length > 1 && (
              <>
                <button className="hero-ctrl prev" onClick={prev} aria-label="Banner anterior">
                  <i className="bi bi-chevron-left" />
                </button>
                <button className="hero-ctrl next" onClick={next} aria-label="Siguiente banner">
                  <i className="bi bi-chevron-right" />
                </button>
                <div className="hero-indicators" role="tablist" aria-label="Navegación de banners">
                  {banners.map((_, idx) => (
                    <button
                      key={idx} role="tab"
                      className={`hero-dot${idx === current ? " active" : ""}`}
                      onClick={() => goTo(idx)}
                      aria-label={`Banner ${idx + 1}`}
                      aria-selected={idx === current}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Pilares ── */}
      <div className="pilares-section">
        <div className="container">
          <div className="row align-items-center g-5">

            <div className="col-lg-6 pilares-left">
              <h2>Formando Futuro con <span>Excelencia</span></h2>
              <div className="pilares-btns">
                {PILARES.map(p => (
                  <div key={p.key} className={`pilar-btn ${p.cls}`}>
                    <span className="pilar-btn-icon"><i className={`bi ${p.icon}`} /></span>
                    {p.label}
                  </div>
                ))}
              </div>
              <div className="pilares-quote">
                <blockquote>
                  <p>"La educación es el arma más poderosa que puedes usar para cambiar el mundo."</p>
                  <footer>— Nelson Mandela</footer>
                  <small>
                    En Perú, donde el acceso a la ciencia, la disciplina en el estudio y el deporte
                    como herramienta de formación integral son aún desafíos, este lema cobra vida
                    cuando lo vivimos desde el aula, el campo y el laboratorio.
                  </small>
                </blockquote>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="pilares-card">
                <img
                  src="/img/Banners/BannerHome.jpg"
                  alt="Educación 360° en I.E. Andrés Avelino Cáceres"
                  onError={e => { e.target.style.display = "none"; }}
                />
                <div className="pilares-card-body">
                  <h5>Educación 360°</h5>
                  <p>
                    Con nuestra Educación 360°, tu hijo podrá desarrollar su máximo potencial —
                    desde la ciencia hasta el deporte, con disciplina como fundamento y valores como brújula.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}