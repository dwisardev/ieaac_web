import { Navigate } from 'react-router-dom';
import authService from '../../services/auth';

const PrivateRoute = ({ children, allowedRoles = null }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar roles si se especifican
  if (allowedRoles && !authService.hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default PrivateRoute;