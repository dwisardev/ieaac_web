// Loader.jsx — Ruta: src/components/ui/Loader.jsx
import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import "../../assets/css/ui/Loader.css";

const MESSAGES = [
  "Cargando recursos...",
  "Un momento, por favor...",
  "Preparando tu experiencia...",
  "Optimizando contenidos...",
  "Conectando con el servidor...",
  "¡Ya casi estamos!",
];

export default function Loader() {
  const [text, setText] = useState(MESSAGES[0]);

  useEffect(() => {
    const id = setInterval(() => {
      setText(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="loader-overlay" role="status" aria-label="Cargando aplicación">
      <div className="loader-container">

        {/* Marca */}
        <div className="loader-brand">
          <span className="loader-brand-name">I.E. Andrés Avelino Cáceres</span>
          <span className="loader-brand-sub">Sirenachayocc · Cusco</span>
        </div>

        {/* Icono giratorio */}
        <LoaderCircle className="loader-icon" size={72} aria-hidden="true" />

        {/* Texto animado */}
        <p className="loader-text">{text}</p>

        {/* Barra de progreso */}
        <div className="loader-progress-bar" role="progressbar" aria-label="Progreso de carga">
          <div className="loader-progress-fill" />
        </div>

        {/* Puntos */}
        <div className="loader-dots" aria-hidden="true">
          <span /><span /><span />
        </div>

      </div>
    </div>
  );
}