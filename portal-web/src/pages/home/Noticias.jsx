// Noticias.jsx — Ruta: src/pages/home/Noticias.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../assets/css/pages/Noticias.css";
import { noticiasService } from "../../services/noticiasService";

function SkeletonGrid() {
  return (
    <div className="noticias-skeleton-grid">
      {[1,2,3,4].map(i => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-img" />
          <div className="skeleton-body">
            <div className="skeleton-line short" />
            <div className="skeleton-line title" />
            <div className="skeleton-line long" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line short" style={{ marginTop: 14 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ImagenModal({ src, titulo, onClose }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="modal-img-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-img-content" onClick={e => e.stopPropagation()}>
        <button className="modal-img-close" onClick={onClose} aria-label="Cerrar">
          <i className="bi bi-x" />
        </button>
        <img
          src={src}
          alt={titulo || 'Noticia'}
          onError={e => { e.target.src = '/img/Noticias/default.jpg'; }}
        />
        {titulo && <p className="modal-img-caption">{titulo}</p>}
      </div>
    </div>
  );
}

function NoticiaCard({ noticia, onVerImagen }) {
  const imgSrc = noticiasService.getImagenUrl(noticia);

  const formatFecha = (f) => {
    if (!f) return null;
    return new Date(f).toLocaleDateString('es-PE', { day:'numeric', month:'short', year:'numeric' });
  };

  return (
    <article className="noticia-card">
      <div
        className="noticia-card-img-wrap"
        onClick={() => onVerImagen(imgSrc, noticia.titulo)}
        title="Ver imagen completa"
      >
        <img
          src={imgSrc}
          alt={noticia.titulo}
          loading="lazy"
          onError={e => { if (!e.target.dataset.err) { e.target.dataset.err='1'; e.target.src='/img/Noticias/default.jpg'; } }}
        />
        <div className="noticia-card-img-overlay">
          <span className="noticia-img-icon"><i className="bi bi-zoom-in" /></span>
        </div>
        {noticia.categoria && (
          <span className={`noticia-badge${noticia.destacada ? ' destacada' : ''}`}>{noticia.categoria}</span>
        )}
        {!noticia.categoria && noticia.destacada && (
          <span className="noticia-badge destacada">
            <i className="bi bi-star-fill me-1" style={{ fontSize:'.6rem' }} />Destacada
          </span>
        )}
      </div>

      <div className="noticia-card-body">
        <div className="noticia-card-meta">
          {noticia.fecha && (
            <span className="noticia-meta-item">
              <i className="bi bi-calendar3" />{formatFecha(noticia.fecha)}
            </span>
          )}
          {noticia.autor && (
            <span className="noticia-meta-item">
              <i className="bi bi-person" />{noticia.autor}
            </span>
          )}
        </div>

        <h3 className="noticia-card-title">{noticia.titulo}</h3>
        {noticia.descripcion && <p className="noticia-card-desc">{noticia.descripcion}</p>}

        <div className="noticia-card-footer">
          <span className="noticia-autor">
            <i className="bi bi-newspaper" />{noticia.categoria || 'General'}
          </span>
          <button className="noticia-ver-btn" onClick={() => onVerImagen(imgSrc, noticia.titulo)}>
            Ver imagen<i className="bi bi-arrow-right" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => { cargarNoticias(); }, []);

  const cargarNoticias = async () => {
    try {
      setLoading(true); setError(null);
      const data = await noticiasService.getAll();
      setNoticias(data.filter(n => n.destacada).slice(0, 4));
    } catch (err) {
      console.error('Error al cargar noticias:', err);
      setError('No se pudieron cargar las noticias.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="noticias-section" aria-labelledby="noticias-heading">
      <div className="container">
        <div className="noticias-header">
          <span className="noticias-eyebrow">
            <i className="bi bi-newspaper" />Actualidad institucional
          </span>
          <h2 className="noticias-title" id="noticias-heading">Últimas Noticias</h2>
          <p className="noticias-subtitle">
            Entérate de los acontecimientos más importantes en nuestra institución educativa.
          </p>
        </div>

        {loading ? <SkeletonGrid /> : error ? (
          <div className="noticias-empty">
            <i className="bi bi-exclamation-circle" /><p>{error}</p>
            <button className="btn-noticias-mas" onClick={cargarNoticias} style={{ marginTop:'1rem' }}>
              <i className="bi bi-arrow-clockwise" />Reintentar
            </button>
          </div>
        ) : noticias.length === 0 ? (
          <div className="noticias-empty">
            <i className="bi bi-journal-x" /><p>No hay noticias destacadas en este momento.</p>
          </div>
        ) : (
          <div className="noticias-grid">
            {noticias.map(n => (
              <NoticiaCard key={n.id} noticia={n} onVerImagen={(src, titulo) => setModalImg({ src, titulo })} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <div className="noticias-cta">
            <Link to="/Comunicados" className="btn-noticias-mas">
              Ver todas las noticias<i className="bi bi-arrow-right" />
            </Link>
          </div>
        )}
      </div>

      {modalImg && (
        <ImagenModal src={modalImg.src} titulo={modalImg.titulo} onClose={() => setModalImg(null)} />
      )}
    </section>
  );
}