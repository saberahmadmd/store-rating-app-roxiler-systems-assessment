import { Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = ({ onToggleSidebar }) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">StoreRatings</Link>

        <div className="desktop-auth">
          {isAuthenticated && (
            <>
              <span className="welcome">Welcome, {currentUser?.name}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>

        <button className="menu-toggle" onClick={onToggleSidebar}>
          <FaBars />
        </button>
      </div>
    </header>
  );
};

export default Header;
