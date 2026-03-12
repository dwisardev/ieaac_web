import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';

const PrivateRoute = ({ children, allowedRoles = null }) => {
  const { loading } = useAuth();

  /* Esperar a que AuthContext verifique el token antes de renderizar */
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0d1117',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid #30363d',
          borderTopColor: '#2f81f7',
          borderRadius: '50%',
          animation: 'spin .7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !authService.hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
