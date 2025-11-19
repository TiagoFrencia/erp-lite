import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Ruta protegida para React Router v6:
 * - Si no hay sesión, redirige a /login y guarda "from"
 * - Si hay sesión, renderiza <Outlet /> y sigue con los hijos anidados
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
