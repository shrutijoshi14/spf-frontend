import {
  BarChart3,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Settings,
  Users2,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { hasPermission } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      end: true,
      permission: null,
    },
    {
      path: '/loans',
      label: 'Loans',
      icon: <CircleDollarSign size={20} />,
      permission: 'loan.view',
    },
    {
      path: '/borrowers',
      label: 'Borrowers',
      icon: <Users2 size={20} />,
      permission: 'borrower.view',
    },
    {
      path: '/payments',
      label: 'Payments',
      icon: <FileText size={20} />,
      permission: 'payment.view',
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: <BarChart3 size={20} />,
      permission: 'reports.view',
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      permission: 'settings.view',
    },
  ];

  const visibleMenuItems = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  // Auto-close sidebar on mobile when a link is clicked
  const handleMobileClick = () => {
    if (window.innerWidth <= 768 && isOpen) {
      toggleSidebar();
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className={`sidebar-header ${isOpen ? 'open' : ''}`}>
        <div className="brand-container">
          <h1 className="brand-name">SPF</h1>
        </div>
        <button
          className={`toggle-btn ${!isOpen ? 'centered' : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <div className="bar-wrapper">
            <span className={`bar ${isOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isOpen ? 'open' : ''}`}></span>
          </div>
        </button>
      </div>

      <ul className="sidebar-menu">
        {visibleMenuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
              end={item.end}
              onClick={handleMobileClick}
            >
              <div className="icon">{item.icon}</div>
              <span className="tab">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
