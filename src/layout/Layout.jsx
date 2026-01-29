import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/layout.css';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const Layout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Backwards compatibility: check user.fullName (context) or user.full_name (db raw) or fallback
  const username = user?.fullName || user?.full_name || 'User';

  return (
    <div className={`app-container`}>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`page-wrapper ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        <Topbar
          username={username}
          role={user?.role || 'User'}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
