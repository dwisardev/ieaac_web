import "../../assets/css/pages/ResenaHistorica.css";
import bannerRH from "../../assets/img/bannerRH.jpg";

const HITOS = [
  {
    año: "2007",
    titulo: "Fundación",
    texto: `La I.E. "Andrés Avelino Cáceres" fue creada mediante Resolución Directoral N° 1142 el
            26 de junio del año 2007 como EIGECOM, en atención a la solicitud de ampliación del
            nivel primaria N° 501238 de Sirenachayocc, teniendo como su primer director al
            Prof. Héctor Huamaní De La Cruz.`,
  },
  {
    año: "2008",
    titulo: "Conversión a IE Pública",
    texto: `El 26 de junio del 2008 se autoriza, mediante R.D. N° 1242, la conversión a
            Institución Educativa de Gestión Pública de Educación Básica Regular, nivel
            secundario, con Código Modular N° 1372374.`,
  },
  {
    año: "2016",
    titulo: "Denominación Oficial",
    texto: `El 8 de noviembre del 2016, mediante Resolución Directoral N° 01139‑2016, se
            reconoce oficialmente el nombre "Andrés Avelino Cáceres" a la IE N° 501238 de
            Sirenachayocc, denominación que mantiene hasta la fecha.`,
  },
  {
    año: "2025",
    titulo: "Aniversario Institucional",
    texto: `En reunión de toda la comunidad educativa realizada el 19 de marzo del 2025, y
            conforme a los documentos existentes, se determinó bajo acta y R.D. N° 015 que el
            aniversario institucional se celebrará cada 26 de junio.`,
  },
];

export default function ResenaHistorica() {
  return (
    <section className="rh-page">

      {/* ── Hero ── */}
      <div className="rh-hero">
        <div className="rh-hero__overlay" />
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-7">
              <span className="rh-hero__tag">Nuestra institución</span>
              <h1 className="rh-hero__title">Reseña Histórica</h1>
              <p className="rh-hero__sub">
                Descubre los orígenes de nuestra institución educativa y su evolución a través del tiempo
              </p>
            </div>
          </div>
        </div>
        {/* Decoración geométrica sutil */}
        <div className="rh-hero__deco rh-hero__deco--tl" />
        <div className="rh-hero__deco rh-hero__deco--br" />
      </div>

      {/* ── Imagen ── */}
      <div className="rh-photo-wrap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up">
              <figure className="rh-photo">
                <img src={bannerRH} alt="I.E. Andrés Avelino Cáceres" className="rh-photo__img" />
                <figcaption className="rh-photo__caption">
                  <i className="bi bi-building me-2" />
                  Nuestra Institución Educativa en la actualidad
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="rh-timeline-wrap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">

              <div className="rh-section-head" data-aos="fade-up">
                <span className="rh-section-head__label">Historia</span>
                <h2 className="rh-section-head__title">Nuestra trayectoria</h2>
                <p className="rh-section-head__desc">
                  Desde su fundación, la institución ha recorrido un camino de crecimiento
                  y consolidación al servicio de la comunidad de Sirenachayocc.
                </p>
              </div>

              <ol className="rh-timeline">
                {HITOS.map((h, i) => (
                  <li
                    key={i}
                    className="rh-timeline__item"
                    data-aos={i % 2 === 0 ? "fade-right" : "fade-left"}
                    data-aos-delay={i * 100}
                  >
                    <div className="rh-timeline__dot">
                      <span className="rh-timeline__year">{h.año}</span>
                    </div>
                    <div className="rh-timeline__card">
                      <h3 className="rh-timeline__card-title">{h.titulo}</h3>
                      <p className="rh-timeline__card-text">{h.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>

            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
