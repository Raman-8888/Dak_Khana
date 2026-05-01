import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          <a href="#hero-section" className="navbar__link navbar__link--active">Home</a>
          <a href="#features" className="navbar__link">Services</a>
          <a href="#stats" className="navbar__link">About</a>
          <a href="#workflow" className="navbar__link">Contact</a>
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
        <a href="#hero-section" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Home</a>
        <a href="#features" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Services</a>
        <a href="#stats" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>About</a>
        <a href="#workflow" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Contact</a>
      </div>
    </nav>
  );
}
