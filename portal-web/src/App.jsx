// App.jsx — src/App.jsx  (portal-web)

import { useEffect, useState } from "react";
import { Routes, Route }       from "react-router-dom";

// ── AOS ──
import AOS        from "aos";
import "aos/dist/aos.css";

// ── Bootstrap ──
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// ── Estilos globales ──
import "./assets/css/global/variables.css";
import "./assets/css/global/utilities.css";

// ── Componentes base ──
import ErrorBoundary from "./components/common/ErrorBoundary";
import Layout        from "./components/layout/Layout";
import Loader        from "./components/ui/Loader";

// ── Páginas activas ──
import Home from "./pages/home/Home";

/*
 * Páginas pendientes — descomentar cuando existan:
 *
 * import ResenaHistorica         from "./pages/Nosotros/ResenaHistorica";
 * import NormasConvivencia       from "./pages/Nosotros/NormasConvivencia";
 * import Mision                  from "./pages/Nosotros/Mision";
 * import Vision                  from "./pages/Nosotros/Vision";
 * import Directorio              from "./pages/Nosotros/Directorio";
 * import NuestrosLogros          from "./pages/Nosotros/NuestrosLogros";
 * import NuestraFamilia          from "./pages/Comunidad/NuestraFamilia";
 * import PortafoliodeActividades from "./pages/Fondep/PortafolioActividades";
 * import CronogramaProyecto      from "./pages/Fondep/CronogramaProyecto";
 * import EstrategiasProyecto     from "./pages/Fondep/EstrategiasProyecto";
 * import SistemaMonitoreo        from "./pages/Fondep/SistemaMonitoreo";
 * import InformeFinal            from "./pages/Fondep/InformeFinal";
 * import PlanLector              from "./pages/Recursos/PlanLector";
 * import DocumentosGestion       from "./pages/Recursos/DocumentosGestion";
 * import HorariosEscolares       from "./pages/Recursos/HorariosEscolares";
 * import BibliotecaVirtual       from "./pages/Recursos/BibliotecaVirtual";
 * import Pedidos                 from "./pages/Recursos/Biblioteca/PedidoLibro";
 * import Categoria               from "./pages/Recursos/Biblioteca/Categoria";
 * import Contacto                from "./pages/contacto/Contacto";
 * import Comunicados             from "./pages/comunicados/Comunicados";
 */

/* ── 404 ── */
function NotFound() {
  return (
    <div style={{
      minHeight: "70vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: "2rem", textAlign: "center",
    }}>
      <div style={{
        fontSize: "6rem", fontWeight: 700, lineHeight: 1,
        background: "linear-gradient(135deg,#1a3a6e,#c8952a)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: ".5rem",
      }}>404</div>
      <h2 style={{ color: "#1a3a6e", fontFamily: "'Playfair Display',serif", marginBottom: "1rem" }}>
        Página no encontrada
      </h2>
      <p style={{ color: "#616161", maxWidth: 400, marginBottom: "2rem", lineHeight: 1.7 }}>
        La página que buscas no existe o fue movida. Regresa al inicio para continuar navegando.
      </p>
      <a href="/" style={{
        display: "inline-flex", alignItems: "center", gap: ".5rem",
        background: "#1a3a6e", color: "#fff", padding: ".85rem 2rem",
        borderRadius: 50, textDecoration: "none", fontWeight: 600, fontSize: ".9rem",
        boxShadow: "0 4px 16px rgba(26,58,110,.25)",
      }}>
        <i className="bi bi-house-door-fill" /> Volver al inicio
      </a>
    </div>
  );
}

/* ── App ── */
export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ once: true, duration: 900, offset: 60 });
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <Loader />;

  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          {/* Nosotros — descomentar cuando existan:
          <Route path="/ResenaHistorica"   element={<ResenaHistorica />} />
          <Route path="/NormasConvivencia" element={<NormasConvivencia />} />
          <Route path="/Mision"            element={<Mision />} />
          <Route path="/Vision"            element={<Vision />} />
          <Route path="/Directorio"        element={<Directorio />} />
          <Route path="/NuestrosLogros"    element={<NuestrosLogros />} /> */}

          {/* Comunidad:
          <Route path="/NuestraFamilia" element={<NuestraFamilia />} /> */}

          {/* FONDEP:
          <Route path="/PortafoliodeActividades" element={<PortafoliodeActividades />} />
          <Route path="/CronogramaProyecto"      element={<CronogramaProyecto />} />
          <Route path="/EstrategiasProyecto"     element={<EstrategiasProyecto />} />
          <Route path="/SistemaManitoreo"        element={<SistemaMonitoreo />} />
          <Route path="/InformeFinal"            element={<InformeFinal />} /> */}

          {/* Recursos:
          <Route path="/HorariosEscolares" element={<HorariosEscolares />} />
          <Route path="/DocumentosGestion" element={<DocumentosGestion />} />
          <Route path="/BibliotecaVirtual" element={<BibliotecaVirtual />} />
          <Route path="/PlanLector"        element={<PlanLector />} />
          <Route path="/Pedidos"           element={<Pedidos />} />
          <Route path="/Categoria"         element={<Categoria />} /> */}

          {/* Comunicación:
          <Route path="/Contacto"    element={<Contacto />} />
          <Route path="/Comunicados" element={<Comunicados />} /> */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}