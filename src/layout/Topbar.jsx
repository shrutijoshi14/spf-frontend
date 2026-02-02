import { Bell, LogOut, Menu, Moon, Settings as SettingsIcon, Sun, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import '../styles/topbar.css';
import API from '../utils/api';
import { formatDate } from '../utils/dateUtils';
import ProfileModal from './modals/ProfileModal';
const Topbar = ({ username, role, toggleSidebar, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();

  // Helper to format roles for display
  const formatRole = (r) => {
    if (!r) return 'User';
    if (r === 'SUPERADMIN') return 'Super Administrator';
    if (r === 'ADMIN') return 'Administrator';
    if (r === 'STAFF') return 'Staff Member';
    return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  };

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  // Track previous count to prevent toast spam on initial load (optional, or just toast all "unread"?)
  // Better UX: On initial load, don't spam. Only on *updates*.
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications((prev) => {
          const newData = res.data.data;

          if (!initialLoad && newData.length > prev.length) {
            // Find the new items
            const newItems = newData.slice(0, newData.length - prev.length);
            newItems.forEach((item) => {
              if (item.type === 'penalty') toast.error(item.title);
              else if (item.type === 'due_today') toast.warning(item.title);
              else toast.info(item.title);
            });
          }
          return newData;
        });
        setInitialLoad(false);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for smoother updates
    const interval = setInterval(fetchNotifications, 30000);

    const handleClickOutside = (event) => {
      if (!event.target.closest('.icon-wrapper')) {
        setShowNotif(false);
        setShowProfile(false); // Enable closing profile dropdown
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('full_name');
    window.location.href = '/';
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`, {});
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className={'topbar'}>
      {/* Left (Logo & Toggle) */}
      <div className="topbar-left">
        <button className="mobile-toggle-btn" onClick={toggleSidebar} aria-label="Open Menu">
          <Menu size={24} color="var(--text-main)" />
        </button>
      </div>

      {/* Center (App Name) */}
      <div className="topbar-center">
        <a href="/" aria-label="Go to Dashboard">
          <div className="logo-wrapper">
            <img
              src="/spf_logo.jpeg"
              alt="SP Finance Logo"
              className="logo-img"
              width="40"
              height="40"
              loading="lazy"
            />
          </div>
        </a>
        <h1>SP Finance</h1>
      </div>

      {/* Right (Notifications, Welcome, Profile) */}
      <div className="topbar-right">
        {/* Theme Toggle */}
        <div className="icon-wrapper">
          <div
            className="icon-btn-wrapper theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            role="button"
            tabIndex={0}
          >
            {theme === 'light' ? (
              <Moon size={20} color="var(--text-muted)" />
            ) : (
              <Sun size={20} color="var(--text-muted)" />
            )}
          </div>
        </div>

        {/* Notification */}
        <div className="icon-wrapper">
          <div
            className="icon-btn-wrapper"
            onClick={() => setShowNotif(!showNotif)}
            aria-label="Notifications"
            aria-expanded={showNotif}
            role="button"
            tabIndex={0}
          >
            <Bell size={20} color="var(--text-muted)" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>

          {showNotif && (
            <div className="dropdown notification-dropdown">
              <div className="dropdown-header">
                <p className="dropdown-title">Notifications</p>
                {notifications.length > 0 && (
                  <button
                    className="clear-all-btn"
                    onClick={async () => {
                      await API.delete('/notifications');
                      fetchNotifications();
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="dropdown-content">
                {notifications.length === 0 ? (
                  <p className="empty-msg">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`dropdown-item ${n.is_read ? '' : 'unread'}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="notif-icon">
                        {n.type === 'loan' ? '🏦' : n.type === 'payment' ? '💰' : '📌'}
                      </div>
                      <div className="notif-info">
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-msg">{n.message}</p>
                        <span className="notif-time">
                          {formatDate(n.created_at)} ·{' '}
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Welcome Username */}
        <span className="welcome-text">Welcome, {username} 👋</span>

        {/* Profile */}
        <div className="icon-wrapper">
          <div
            className="icon-btn-wrapper"
            onClick={() => setShowProfile(!showProfile)}
            aria-label="User Profile"
            aria-expanded={showProfile}
            role="button"
            tabIndex={0}
          >
            <div className="profile-circle">{username.charAt(0).toUpperCase()}</div>
          </div>

          {showProfile && (
            <div className="dropdown profile-dropdown">
              <div className="dropdown-user-info">
                <div className="user-icon-bg">
                  <User size={18} />
                </div>
                <div>
                  <p className="user-name">{username}</p>
                  <p className="user-role">{formatRole(role)}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <p className="dropdown-item" onClick={() => setOpenProfile(true)}>
                <User size={16} /> My Profile
              </p>
              <p className="dropdown-item" onClick={() => (window.location.href = '/settings')}>
                <SettingsIcon size={16} /> Settings
              </p>
              <div className="dropdown-divider"></div>
              <p className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </p>
            </div>
          )}
        </div>
      </div>
      <ProfileModal open={openProfile} onClose={() => setOpenProfile(false)} />
    </div>
  );
};

export default Topbar;
