import { useRef } from 'react';

export default function Manual() {
  const iframeRef = useRef(null);

  const imprimir = () => {
    iframeRef.current?.contentWindow?.print();
  };

  return (
    <div className="page-section" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>

      {/* Cabecera */}
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="section-title">Manual de Usuario</h2>
          <p className="section-subtitle">Guía completa del sistema — portal web y panel administrativo</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={`${import.meta.env.BASE_URL}manual.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            title="Abrir en nueva pestaña"
          >
            <i className="fas fa-arrow-up-right-from-square" /> Abrir
          </a>
          <button className="btn btn-primary btn-sm" onClick={imprimir}>
            <i className="fas fa-print" /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* iframe con el manual */}
      <div style={{
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,.08)',
        minHeight: 'calc(100vh - 180px)',
      }}>
        <iframe
          ref={iframeRef}
          src={`${import.meta.env.BASE_URL}manual.html`}
          title="Manual de Usuario"
          style={{ width: '100%', height: '100%', border: 'none', minHeight: 'calc(100vh - 180px)' }}
        />
      </div>
    </div>
  );
}
