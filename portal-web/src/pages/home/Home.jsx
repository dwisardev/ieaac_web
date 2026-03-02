// Home.jsx — src/pages/home/Home.jsx
import { useState, useEffect } from "react";
import HeroSection from "./HeroSection";
import Noticias    from "./Noticias";
import Accesos     from "../../components/ui/Accesos";
import { comunicadosService } from "../../services/comunicadosService";

/* ── Modal de comunicado destacado ─────────────────────────────────────── */
function ComunicadoModal({ comunicado, onClose }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const fecha = comunicado.fecha_publicacion
    ? new Date(comunicado.fecha_publicacion).toLocaleDateString("es-PE", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="comunicado-titulo"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        background: "rgba(10,25,60,.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem", animation: "fadeInBg .25s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16,
          maxWidth: 720, width: "100%", maxHeight: "88vh", overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,.3)",
          animation: "slideUp .3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "1.1rem 1.5rem", borderBottom: "1px solid #f0ece2",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg,#1a3a6e,#2855a0)",
          borderRadius: "16px 16px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className="bi bi-megaphone-fill" style={{ color: "#c8952a", fontSize: "1.2rem" }} />
            <h5 id="comunicado-titulo" style={{
              margin: 0, color: "#fff",
              fontFamily: "Playfair Display,serif", fontSize: "1.05rem",
            }}>
              {comunicado.titulo}
            </h5>
          </div>
          <button
            onClick={onClose} aria-label="Cerrar comunicado"
            style={{
              background: "rgba(255,255,255,.15)", border: "none", color: "#fff",
              width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            <i className="bi bi-x" />
          </button>
        </div>

        {/* Imagen */}
        {comunicado.imagen && (
          <img
            src={comunicado.imagen} alt={comunicado.titulo}
            style={{ width: "100%", maxHeight: "45vh", objectFit: "contain", display: "block" }}
            onError={e => { e.target.style.display = "none"; }}
          />
        )}

        {/* Cuerpo */}
        <div style={{ padding: "1.5rem" }}>
          {fecha && (
            <p style={{
              fontSize: ".8rem", color: "#9e9e9e", marginBottom: "1rem",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <i className="bi bi-calendar3" style={{ color: "#c8952a" }} />{fecha}
            </p>
          )}
          <div style={{ fontSize: ".925rem", color: "#2d2d2d", lineHeight: 1.8 }}>
            {comunicado.contenido}
          </div>
          {comunicado.archivo_pdf && (
            <div style={{ marginTop: "1.5rem" }}>
              <a
                href={comunicado.archivo_pdf}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#c0392b", color: "#fff",
                  padding: ".6rem 1.25rem", borderRadius: 8,
                  fontSize: ".85rem", fontWeight: 600, textDecoration: "none",
                }}
              >
                <i className="bi bi-file-pdf-fill" />Descargar PDF
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: ".75rem 1.5rem", borderTop: "1px solid #f0ece2",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <small style={{ color: "#9e9e9e", fontSize: ".72rem" }}>
            Este comunicado se mostrará solo una vez por visita.
          </small>
          <button
            onClick={onClose}
            style={{
              background: "#1a3a6e", color: "#fff", border: "none",
              padding: ".45rem 1.1rem", borderRadius: 6,
              fontSize: ".8rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp  { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

/* ── Home ───────────────────────────────────────────────────────────────── */
export default function Home() {
  const [comunicado, setComunicado] = useState(null);

  // AOS ya fue inicializado en App.jsx — no se repite aquí.
  // El modal de comunicado se activa una sola vez por sesión.
  useEffect(() => {
    // Descomenta cuando el backend tenga el endpoint /api/comunicados:
    /*
    if (!sessionStorage.getItem("comunicadoMostrado")) {
      comunicadosService.getDestacado?.()
        .then(data => {
          if (data) {
            setComunicado(data);
            sessionStorage.setItem("comunicadoMostrado", "1");
          }
        })
        .catch(() => {});
    }
    */
  }, []);

  return (
    <main>
      <section id="hero">
        <HeroSection />
      </section>

      <section id="noticias">
        <Noticias />
      </section>

      <section id="accesos" className="py-5">
        <Accesos />
      </section>

      {comunicado && (
        <ComunicadoModal
          comunicado={comunicado}
          onClose={() => setComunicado(null)}
        />
      )}
    </main>
  );
}