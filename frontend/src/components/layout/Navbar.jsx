import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const homeUrl = isAuthenticated ? (rawRole === 'delivery_agent' ? '/agent/dashboard' : '/customer/dashboard') : '/';

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner">
        <Link to={homeUrl} className="navbar__logo" id="navbar-logo">
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
          {rawRole !== 'delivery_agent' && (
              <>
                <Link to="/customer/dashboard" className="navbar__link">Dashboard</Link>
                {rawRole !== 'customer' && (
                  <>
                    <Link to="/logistics" className="navbar__link">Logistics</Link>
                    <Link to="/track" className="navbar__link">Track</Link>
                  </>
                )}
                <a href="#features" className="navbar__link" onClick={(e) => handleNav(e, 'features')}>Services</a>
                <a href="#stats" className="navbar__link" onClick={(e) => handleNav(e, 'stats')}>About</a>
                {rawRole === 'customer' && (
                    <Link to="/customer/support" className="navbar__link">Support</Link>
                )}
              </>
          )}
          {rawRole === 'delivery_agent' && (
              <>
                <Link to="/agent/dashboard" className="navbar__link">Dashboard</Link>
                <Link to="/agent/earnings" className="navbar__link">Earnings</Link>
                <Link to="/agent/history" className="navbar__link">History</Link>
                <Link to="/agent/support" className="navbar__link">Support</Link>
              </>
          )}
        </div>

        <div className="navbar__auth">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="navbar__notifications" style={{ position: 'relative' }} ref={notifRef}>
                  <button 
                      onClick={() => setNotifOpen(!notifOpen)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', position: 'relative' }}
                  >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      {(() => {
                          let count = 0;
                          try {
                              if (rawRole === 'delivery_agent') {
                                  count = (JSON.parse(localStorage.getItem('dak_agent_assignments_cache')) || []).filter(a => ['assigned', 'in_transit'].includes(a.status) || a.shipment?.status === 'cancelled').length;
                              } else {
                                  const exportsCache = JSON.parse(localStorage.getItem('dak_exports_cache')) || [];
                                  const paidShipments = JSON.parse(localStorage.getItem('dak_paid_shipments')) || [];
                                  count = exportsCache.filter(e => {
                                      const hasPaymentEvent = e.tracking_events?.some(t => t.status === 'payment_completed');
                                      const isPaid = paidShipments.includes(e.id);
                                      if (e.status !== 'draft' && e.status !== 'pending') return true;
                                      if (!isPaid && !hasPaymentEvent) return true;
                                      if (hasPaymentEvent) return true;
                                      return false;
                                  }).length;
                              }
                          } catch {}
                          return count > 0 ? <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count > 9 ? '9+' : count}</span> : null;
                      })()}
                  </button>
                  {notifOpen && (
                      <div style={{ position: 'absolute', top: '40px', right: '-10px', width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 3000, overflow: 'hidden' }}>
                          <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 'bold', color: '#0f172a' }}>Notifications</div>
                          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                              {rawRole === 'delivery_agent' ? (() => {
                                  let agentNotifs = [];
                                  try {
                                      const agentAssignments = JSON.parse(localStorage.getItem('dak_agent_assignments_cache')) || [];
                                      agentAssignments.forEach(a => {
                                          if (a.status === 'assigned') {
                                              agentNotifs.push({ id: `assign-${a.id}`, type: 'New Delivery Assigned', color: '#3b82f6', message: `Shipment ${a.shipment?.tracking_number || '#' + a.id} is ready for pickup.`, time: new Date(a.assigned_at || a.created_at).toLocaleString() });
                                          }
                                          if (a.status === 'in_transit') {
                                              agentNotifs.push({ id: `pickup-${a.id}`, type: 'Pickup Successful', color: '#10b981', message: `You have picked up ${a.shipment?.tracking_number || '#' + a.id}. OTP sent to customer.`, time: new Date(a.picked_at || a.updated_at).toLocaleString() });
                                          }
                                          if (a.status === 'delivered') {
                                              agentNotifs.push({ id: `deliver-${a.id}`, type: 'Delivery Completed', color: '#16a34a', message: `${a.shipment?.tracking_number || '#' + a.id} delivered successfully.`, time: new Date(a.delivered_at || a.updated_at).toLocaleString() });
                                          }
                                          if (a.status === 'failed') {
                                              agentNotifs.push({ id: `fail-${a.id}`, type: 'Delivery Failed', color: '#ef4444', message: `${a.shipment?.tracking_number || '#' + a.id} reported as failed.`, time: new Date(a.updated_at || a.created_at).toLocaleString() });
                                          }
                                          if (a.shipment?.status === 'cancelled') {
                                              agentNotifs.push({ id: `cancel-${a.id}`, type: 'Delivery Cancelled', color: '#ef4444', message: `Shipment ${a.shipment?.tracking_number || '#' + a.id} has been cancelled by customer.`, time: new Date(a.updated_at).toLocaleString() });
                                          }
                                      });
                                      agentNotifs.sort((a, b) => new Date(b.time) - new Date(a.time));
                                      agentNotifs = agentNotifs.slice(0, 6);
                                  } catch (e) { console.error('Agent notif error', e); }

                                  return (
                                      <>
                                          {agentNotifs.length > 0 ? agentNotifs.map(notif => (
                                              <div key={notif.id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} className="notif-item">
                                                  <div style={{ fontSize: '0.85rem', color: notif.color, marginBottom: '4px', fontWeight: 'bold' }}>{notif.type}</div>
                                                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>{notif.message}</div>
                                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>{notif.time}</div>
                                              </div>
                                          )) : (
                                              <div style={{ padding: '15px', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>No notifications yet</div>
                                          )}
                                      </>
                                  );
                              })() : (() => {
                                  let notifItems = [];
                                  try {
                                      const exports = JSON.parse(localStorage.getItem('dak_exports_cache')) || [];
                                      const getPaidShipments = () => { try { return JSON.parse(localStorage.getItem('dak_paid_shipments')) || []; } catch { return []; } };
                                      exports.forEach(exp => {
                                          const otpEvent = exp.tracking_events?.find(t => t.notes && t.notes.includes('OTP for delivery is:'));
                                          if (otpEvent) {
                                              const match = otpEvent.notes.match(/OTP for delivery is:\s*(\d+)/);
                                              if (match) {
                                                  notifItems.push({ id: `otp-${exp.id}`, type: 'OTP Generated', color: '#10b981', message: `OTP for tracking ${exp.tracking_number} is ${match[1]}.`, time: new Date(otpEvent.created_at).toLocaleString() });
                                              }
                                          }
                                          
                                          const paymentEvent = exp.tracking_events?.find(t => t.status === 'payment_completed');
                                          if (paymentEvent) {
                                              notifItems.push({ id: `payok-${exp.id}`, type: 'Payment Confirmed', color: '#16a34a', message: `Payment for shipment ${exp.tracking_number} was successful.`, time: new Date(paymentEvent.created_at).toLocaleString() });
                                          }

                                          if (exp.status !== 'draft' && exp.status !== 'pending') {
                                              notifItems.push({ id: `status-${exp.id}`, type: 'Tracking Updated', color: '#3b82f6', message: `Shipment ${exp.tracking_number} is now ${exp.status?.replace('_', ' ')}.`, time: new Date(exp.updated_at).toLocaleString() });
                                          }
                                          
                                          if (exp.status === 'draft' || exp.status === 'pending') {
                                              if (!getPaidShipments().includes(exp.id) && !paymentEvent) {
                                                  notifItems.push({ id: `pay-${exp.id}`, type: 'Payment Required', color: '#f59e0b', message: `Please complete payment for shipment ${exp.tracking_number}.`, time: new Date(exp.created_at).toLocaleString() });
                                              }
                                          }
                                      });
                                      notifItems.sort((a, b) => new Date(b.time) - new Date(a.time));
                                      notifItems = notifItems.slice(0, 5);
                                  } catch (e) { console.error('Error parsing notifications', e); }

                                  return (
                                      <>
                                          {notifItems.length > 0 ? notifItems.map(notif => (
                                              <div key={notif.id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} className="notif-item">
                                                  <div style={{ fontSize: '0.85rem', color: notif.color, marginBottom: '4px', fontWeight: 'bold' }}>{notif.type}</div>
                                                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>{notif.message}</div>
                                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>{notif.time}</div>
                                              </div>
                                          )) : (
                                              <div style={{ padding: '15px', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>No new notifications</div>
                                          )}
                                      </>
                                  );
                              })()}
                          </div>
                      </div>
                  )}
              </div>

              <div className="navbar__user" onClick={() => setUserMenuOpen(!userMenuOpen)} ref={profileRef}>
                <div className="navbar__avatar">{initials}</div>
                <span className="navbar__user-email">{userEmail}</span>
                {userMenuOpen && (
                  <div className="navbar__user-menu">
                    <div className="navbar__user-greeting">
                      <span className="navbar__user-greeting-text">{greeting}</span>
                    </div>
                    <div className="navbar__menu-divider" />
                    {rawRole !== 'delivery_agent' ? (
                        <>
                            <Link to="/customer/dashboard" onClick={() => setUserMenuOpen(false)}>Dashboard</Link>
                            <Link to="/logistics" onClick={() => setUserMenuOpen(false)}>My Shipments</Link>
                        </>
                    ) : (
                        <Link to="/agent/dashboard" onClick={() => setUserMenuOpen(false)}>Dashboard</Link>
                    )}
                    <button onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>
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
        {rawRole !== 'delivery_agent' && (
            <>
                {rawRole !== 'customer' && (
                    <>
                        <Link to="/logistics" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Logistics</Link>
                        <Link to="/track" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Track</Link>
                    </>
                )}
                <a href="#features" className="navbar__mobile-link" onClick={(e) => handleNav(e, 'features')}>Services</a>
                <a href="#stats" className="navbar__mobile-link" onClick={(e) => handleNav(e, 'stats')}>About</a>
                {rawRole === 'customer' && (
                    <Link to="/customer/support" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Support</Link>
                )}
            </>
        )}
        {isAuthenticated ? (
          <>
            <div className="navbar__mobile-greeting">{greeting}</div>
            {rawRole !== 'delivery_agent' && (
              <Link to="/customer/dashboard" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            )}
            {rawRole === 'delivery_agent' && (
              <>
                <Link to="/agent/dashboard" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link to="/agent/earnings" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Earnings</Link>
                <Link to="/agent/history" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>History</Link>
                <Link to="/agent/support" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Support</Link>
              </>
            )}
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
