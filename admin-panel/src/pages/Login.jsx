import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth';
import '../assets/css/Login.css'



// Importa tu imagen descargada aquí:
import welcomeImg from '../assets/img/welcome.png'

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username:   '',
    password:   '',
    rememberMe: false,
  });
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const result = await login(
        formData.username.trim(),
        formData.password,
        formData.rememberMe,
      );
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.message || 'Credenciales incorrectas');
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ══════════════════════════════════════
          PANEL IZQUIERDO — Ilustración
      ══════════════════════════════════════ */}
      <div className="login-left">
        {/* Círculo decorativo extra */}
        <div className="login-left-circle" />

        {/* Imagen ilustrativa
            → Descarga la imagen del diseño de referencia
            → Ponla en src/assets/images/welcome.png
            → Descomenta el import de arriba y reemplaza welcomeImg
        */}
        <div className="login-illustration">
          <img src={welcomeImg} alt="Bienvenido al sistema" />
        </div>

        {/* Texto de bienvenida */}
        <div className="login-left-text">
          <h2>Bienvenido de nuevo</h2>
          <p>Accede al panel de administración de la I.E. Andrés Avelino Cáceres</p>
        </div>

        {/* Puntos indicadores */}
        <div className="login-dots">
          <div className="login-dot active" />
          <div className="login-dot" />
          <div className="login-dot" />
        </div>
      </div>

      {/* ══════════════════════════════════════
          PANEL DERECHO — Formulario
      ══════════════════════════════════════ */}
      <div className="login-right">

        {/* Logo institucional */}
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <i className="fas fa-school" />
          </div>
          <div className="login-logo-text">
            <h3>I.E. Andrés Avelino Cáceres</h3>
            <span>Panel de Administración</span>
          </div>
        </div>

        {/* Título */}
        <div className="login-title">
          <h1>Iniciar sesión</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        {/* Formulario */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {/* Error */}
          {error && (
            <div className="lp-alert" role="alert">
              <i className="fas fa-exclamation-circle" />
              <span>{error}</span>
            </div>
          )}

          {/* Usuario */}
          <div className="lp-field">
            <label className="lp-label" htmlFor="username">Usuario</label>
            <div className="lp-input-wrap">
              <input
                id="username"
                name="username"
                type="text"
                className="lp-input"
                placeholder="username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="lp-field">
            <label className="lp-label" htmlFor="password">Contraseña</label>
            <div className="lp-input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="lp-input has-icon-right"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="lp-input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`} />
              </button>
            </div>
          </div>

          {/* Recordar + Olvidé */}
          <div className="lp-row-opts">
            <label className="lp-check-wrap">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
              />
              <span className="lp-check-label">Recordar sesión</span>
            </label>
            <a href="#" className="lp-forgot" tabIndex={-1}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Botón principal */}
          <button
            type="submit"
            className="lp-btn-submit"
            disabled={loading}
          >
            {loading
              ? <><i className="fas fa-spinner fa-spin" />Iniciando sesión...</>
              : <><i className="fas fa-arrow-right-to-bracket" />Iniciar Sesión</>
            }
          </button>
        </form>

        {/* Footer */}
        <div className="login-right-footer">
          <p>Solo personal autorizado · v1.0.0 · 2025</p>
        </div>
      </div>

      {/* Overlay de carga */}
      {loading && (
        <div className="lp-loading-overlay">
          <div className="lp-spinner" />
          <p>Verificando credenciales...</p>
        </div>
      )}

    </div>
  );
};

export default Login;