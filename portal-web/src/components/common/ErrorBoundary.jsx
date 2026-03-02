// ErrorBoundary.jsx — Ruta: src/components/common/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a1940 0%, #0f2348 55%, #1a3a6e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        <div style={{
          background: '#fff', borderRadius: 18, maxWidth: 520, width: '100%',
          overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.35)',
          animation: 'scaleIn .3s cubic-bezier(.4,0,.2,1)',
        }}>

          {/* Header rojo */}
          <div style={{
            background: 'linear-gradient(135deg,#c0392b,#e74c3c)',
            padding: '2.5rem 2rem 2rem', textAlign: 'center',
          }}>
            <div style={{
              width: 70, height: 70, background: 'rgba(255,255,255,.15)',
              borderRadius: '50%', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem', fontSize: '2rem',
            }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ color: '#fff' }} />
            </div>
            <h2 style={{
              color: '#fff', fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.5rem', fontWeight: 700, margin: '0 0 .4rem',
            }}>
              ¡Ups! Algo salió mal
            </h2>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '.875rem', margin: 0 }}>
              Ocurrió un error inesperado en la aplicación.
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '2rem' }}>
            <p style={{
              color: '#616161', fontSize: '.9rem', lineHeight: 1.7,
              textAlign: 'center', marginBottom: '1.75rem',
            }}>
              Lo sentimos por los inconvenientes. Puedes intentar recargar la página
              o regresar al inicio para continuar navegando.
            </p>

            {/* Botones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <button
                onClick={this.handleReset}
                style={{
                  background: '#1a3a6e', color: '#fff', border: 'none',
                  padding: '.85rem', borderRadius: 10, fontSize: '.9rem',
                  fontWeight: 600, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                  transition: 'background .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#0f2348'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a3a6e'}
              >
                <i className="bi bi-house-door-fill" />
                Volver al inicio
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'transparent', color: '#1a3a6e',
                  border: '2px solid #1a3a6e', padding: '.75rem', borderRadius: 10,
                  fontSize: '.9rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                  transition: 'background .2s, color .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='#1a3a6e'; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#1a3a6e'; }}
              >
                <i className="bi bi-arrow-clockwise" />
                Recargar página
              </button>
            </div>

            {/* Detalles técnicos — solo en DEV */}
            {import.meta.env.DEV && this.state.error && (
              <details style={{ marginTop: '1.5rem' }}>
                <summary style={{
                  color: '#9e9e9e', fontSize: '.78rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '.3rem',
                  listStyle: 'none', userSelect: 'none',
                }}>
                  <i className="bi bi-bug" />
                  Detalles técnicos (solo visible en desarrollo)
                </summary>
                <div style={{
                  marginTop: '.75rem', background: '#1a1a2e', borderRadius: 8,
                  padding: '1rem', maxHeight: 200, overflowY: 'auto',
                }}>
                  <pre style={{ color: '#ff6b6b', fontSize: '.72rem', margin: '0 0 .5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre style={{ color: '#ffd93d', fontSize: '.68rem', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '.75rem 2rem', borderTop: '1px solid #f0ece2',
            textAlign: 'center', background: '#fafafa',
          }}>
            <small style={{ color: '#bdbdbd', fontSize: '.72rem' }}>
              I.E. Andrés Avelino Cáceres · Si el problema persiste, contacta al administrador.
            </small>
          </div>
        </div>

        <style>{`
          @keyframes scaleIn {
            from { transform: scale(.93); opacity: 0; }
            to   { transform: scale(1);   opacity: 1; }
          }
        `}</style>
      </div>
    );
  }
}

export default ErrorBoundary;