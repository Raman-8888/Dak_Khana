import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#45DB70" />
              <path d="M8 14L12 18L20 10" stroke="#FEFFFE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Dak Ghar</span>
          </Link>
          <p className="footer__tagline">
            Modern logistics platform for seamless international exports.
          </p>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__links-title">Product</h4>
          <a href="#features" className="footer__link">Features</a>
          <a href="#workflow" className="footer__link">Workflow</a>
          <Link to="/track" className="footer__link">Tracking</Link>
          <a href="#stats" className="footer__link">Stats</a>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__links-title">Company</h4>
          <a href="#" className="footer__link">About</a>
          <a href="#" className="footer__link">Careers</a>
          <a href="#" className="footer__link">Blog</a>
          <a href="#" className="footer__link">Contact</a>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__links-title">Legal</h4>
          <a href="#" className="footer__link">Privacy</a>
          <a href="#" className="footer__link">Terms</a>
          <a href="#" className="footer__link">Security</a>
        </div>
      </div>

      <div className="footer__bottom">
        <span className="footer__copy">
          &copy; {new Date().getFullYear()} Dak Ghar Export System. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
