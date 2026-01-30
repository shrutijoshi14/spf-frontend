import { createContext, useContext, useEffect, useState } from 'react';
import Loader from '../common/Loader';
import API from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [permissions, setPermissions] = useState([]);

  // Initialize auth state from local storage on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('userData');

      if (token && storedUser) {
        // Optimistically set user from storage
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
      // Always fetch fresh permissions even if user is from storage
      if (token) {
        await fetchPermissions();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchPermissions = async () => {
    try {
      // We need to fetch the full matrix to know what this role can do
      // Realistically this should be cached or part of login response, but fetching here is safer for consistency
      const res = await API.get('/settings/permissions');
      if (res.data.success) {
        setPermissions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load permissions:', err);
    }
  };

  const login = (data) => {
    // data should contain { token, role, full_name, userId }
    localStorage.setItem('token', data.token);
    const userData = {
      userId: data.userId,
      role: data.role,
      fullName: data.full_name,
      email: data.email,
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    fetchPermissions(); // Refresh permissions on login
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    setPermissions([]);
    // Ideally redirect to login is handled by the protected route or component
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (user.role === 'SUPERADMIN') return true;
    return allowedRoles.includes(user.role);
  };

  // ✅ New Granular Permission Check
  const hasPermission = (permissionCode) => {
    if (!user) return false;
    if (user.role === 'SUPERADMIN') return true; // Superadmin bypass

    // Find the permission row in the matrix
    const perm = permissions.find((p) => p.permission_code === permissionCode);
    if (!perm) return false; // Fail safe if permission undefined

    // Check strict boolean based on current user role (ADMIN or STAFF)
    return !!perm[user.role];
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    hasPermission,
    isSuperAdmin: user?.role === 'SUPERADMIN',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPERADMIN',
    isStaff: user?.role === 'STAFF',
    canManageUsers: user?.role === 'SUPERADMIN' || user?.role === 'ADMIN',
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-app)', // Use theme background
          color: 'var(--text-main)',
        }}
      >
        <Loader />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
