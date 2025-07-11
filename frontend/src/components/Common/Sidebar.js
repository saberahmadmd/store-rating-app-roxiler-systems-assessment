import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaStore,
  FaStar,
  FaKey,
  FaUsers
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ role, isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();

  const adminLinks = [
    { to: '/admin', icon: <FaTachometerAlt />, text: 'Dashboard' },
    { to: '/admin/users', icon: <FaUsers />, text: 'Users' },
    { to: '/admin/stores', icon: <FaStore />, text: 'Stores' },
    { to: '/admin/add-user', icon: <FaUsers />, text: 'Add User' },
    { to: '/admin/add-store', icon: <FaStore />, text: 'Add Store' },
    { to: '/admin/password', icon: <FaKey />, text: 'Change Password' },
  ];

  const ownerLinks = [
    { to: '/owner', icon: <FaTachometerAlt />, text: 'Dashboard' },
    { to: '/owner/stores', icon: <FaStore />, text: 'My Stores' },
    { to: '/owner/ratings', icon: <FaStar />, text: 'All Ratings' },
    { to: '/owner/password', icon: <FaKey />, text: 'Change Password' },
  ];

  const userLinks = [
    { to: '/user', icon: <FaTachometerAlt />, text: 'Dashboard' },
    { to: '/user/stores', icon: <FaStore />, text: 'Stores' },
    { to: '/user/ratings', icon: <FaStar />, text: 'My Ratings' },
    { to: '/user/password', icon: <FaKey />, text: 'Change Password' },
  ];

  const links = role === 'admin' ? adminLinks :
                role === 'store_owner' ? ownerLinks :
                userLinks;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <nav className="sidebar-nav">
        {links.map((link, idx) => (
          <NavLink
            to={link.to}
            key={idx}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.text}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile-only welcome and logout */}
      {isOpen && (
        <div className="sidebar-auth mobile-only">
          <span className="sidebar-welcome">Welcome, {currentUser?.name}</span>
          <button className="sidebar-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;