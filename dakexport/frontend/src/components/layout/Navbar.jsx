import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (e, id) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const userEmail = user?.email ?? '';
  const firstName = user?.name?.split(' ')[0] ?? '';
  const rawRole   = user?.role ?? '';
  const greeting  = rawRole === 'delivery_agent'
    ? 'Hello, Agent'
    : firstName
      ? `Hello, ${firstName}`
      : 'Hello';
  const initials  = userEmail ? userEmail[0].toUpperCase() : '?';

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" id="navbar-logo">
          <div className="navbar__logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#45DB70" />
              <path d="M16 2L28 9L16 16L4 9L16 2Z" fill="#2ECC5E" />
              <path d="M16 16L28 9V23L16 30V16Z" fill="#3BD468" />
              <path d="M16 16L4 9V23L16 30V16Z" fill="#45DB70" />
              <path d="M10 12L16 8L22 12L16 16L10 12Z" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
        </Link>

        <div className="navbar__links" id="navbar-links">
          <Link to="/" className="navbar__link">Home</Link>
          <Link to="/logistics" className="navbar__link">Logistics</Link>
          <Link to="/track" className="navbar__link">Track</Link>
          <a href="#features" className="navbar__link" onClick={(e) => handleNav(e, 'features')}>Services</a>
          <a href="#stats" className="navbar__link" onClick={(e) => handleNav(e, 'stats')}>About</a>
        </div>

        <div className="navbar__auth">
          {isAuthenticated ? (
            <div className="navbar__user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="navbar__avatar">{initials}</div>
              <span className="navbar__user-email">{userEmail}</span>
              {userMenuOpen && (
                <div className="navbar__user-menu">
                  <div className="navbar__user-greeting">
                    <span className="navbar__user-greeting-text">{greeting}</span>
                  </div>
                  <div className="navbar__menu-divider" />
                  <Link to="/logistics" onClick={() => setUserMenuOpen(false)}>My Shipments</Link>
                  <button onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar__login-btn">Log In</Link>
              <Link to="/register" className="navbar__signup-btn">Sign Up</Link>
            </>
          )}
        </div>

        <button
          className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="navbar-hamburger"
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`navbar__mobile ${mobileOpen ? 'navbar__mobile--open' : ''}`} id="navbar-mobile-menu">
        <Link to="/" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link to="/logistics" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Logistics</Link>
        <Link to="/track" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Track</Link>
        <a href="#features" className="navbar__mobile-link" onClick={(e) => handleNav(e, 'features')}>Services</a>
        <a href="#stats" className="navbar__mobile-link" onClick={(e) => handleNav(e, 'stats')}>About</a>
        {isAuthenticated ? (
          <>
            <div className="navbar__mobile-greeting">{greeting}</div>
            <button className="navbar__mobile-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }} onClick={handleLogout}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Log In</Link>
            <Link to="/register" className="navbar__mobile-link" onClick={() => setMobileOpen(false)} style={{ color: '#45DB70' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
