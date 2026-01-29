import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
// import Spinner from '../../../common/Spinner'; // If you have one

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    // Return a simple loader or nothing while checking auth
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-main)',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // User is logged in but doesn't have permission
    // Redirect to dashboard or a "403" page
    // For now, dashboard is a safe default
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
