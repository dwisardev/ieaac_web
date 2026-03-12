import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { comunicadosService } from '../../services/comunicadosService';
import './ComunicadosFloat.css';

const LS_KEY = 'comunicados_cerrados';
const DIAS_RECIENTE = 14;

function esReciente(fecha) {
  if (!fecha) return false;
  const diff = (Date.now() - new Date(fecha).getTime()) / 86400000;
  return diff <= DIAS_RECIENTE;
}

function getCerrados() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

function saveCerrados(ids) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export default function ComunicadosFloat() {
  const [items,    setItems]    = useState([]);
  const [cerrados, setCerrados] = useState(() => getCerrados());
  const [abierto,  setAbierto]  = useState(true);
  const [cargado,  setCargado]  = useState(false);

  useEffect(() => {
    comunicadosService.getAll()
      .then(lista => {
        // Mostrar solo los recientes o destacados
        const filtrados = lista.filter(c =>
          c.destacado || c.destacada || esReciente(c.fecha)
        );
        setItems(filtrados);
      })
      .catch(() => {})
      .finally(() => setCargado(true));
  }, []);

  const cerrarItem = (id) => {
    const next = [...cerrados, id];
    setCerrados(next);
    saveCerrados(next);
  };

  const cerrarTodos = () => {
    const ids = items.map(c => c.id);
    const next = [...new Set([...cerrados, ...ids])];
    setCerrados(next);
    saveCerrados(next);
  };

  const visibles = items.filter(c => !cerrados.includes(c.id));

  if (!cargado || visibles.length === 0) return null;

  return (
    <div className={`cf-wrapper${abierto ? ' cf-open' : ' cf-collapsed'}`}>
      {/* Cabecera */}
      <div className="cf-header">
        <span className="cf-header-title">
          <i className="bi bi-megaphone-fill" />
          Comunicados nuevos
          <span className="cf-badge">{visibles.length}</span>
        </span>
        <div className="cf-header-actions">
          <button
            className="cf-btn-toggle"
            onClick={() => setAbierto(a => !a)}
            title={abierto ? 'Minimizar' : 'Expandir'}
          >
            <i className={`bi ${abierto ? 'bi-chevron-down' : 'bi-chevron-up'}`} />
          </button>
          <button
            className="cf-btn-close"
            onClick={cerrarTodos}
            title="Cerrar todos"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      </div>

      {/* Lista */}
      {abierto && (
        <>
          <ul className="cf-list">
            {visibles.map(c => (
              <li key={c.id} className="cf-item">
                <div className="cf-item-body">
                  {(c.destacado || c.destacada) && (
                    <span className="cf-item-badge">
                      <i className="bi bi-star-fill" /> Destacado
                    </span>
                  )}
                  <p className="cf-item-titulo">{c.titulo}</p>
                  {c.fecha && (
                    <span className="cf-item-fecha">
                      <i className="bi bi-calendar3" />
                      {new Date(c.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <button
                  className="cf-item-cerrar"
                  onClick={() => cerrarItem(c.id)}
                  title="Cerrar"
                >
                  <i className="bi bi-x" />
                </button>
              </li>
            ))}
          </ul>

          <div className="cf-footer">
            <Link to="/comunicados" className="cf-link-todos">
              Ver todos los comunicados <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
