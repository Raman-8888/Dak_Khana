import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Auth.css';

const ROLES = [
  {
    id: 'customer',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    label: 'Exporter',
    sub: 'I want to ship & export packages globally',
  },
  {
    id: 'delivery_agent',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        <path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
      </svg>
    ),
    label: 'Delivery Agent',
    sub: 'I deliver and handle last-mile logistics',
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, getDashboardPath, register, init } = useAuthStore();

  const [step, setStep]       = useState('role');
  const [role, setRole]       = useState('');
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isAuthenticated) navigate(getDashboardPath(), { replace: true });
  }, [isAuthenticated, navigate, getDashboardPath]);

  const selectRole = (id) => { setRole(id); setStep('form'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      await register({
        name,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        password_confirmation: form.confirmPassword,
        role,
        phone: null,
      });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.id === role);

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#45DB70" />
            <path d="M16 2L28 9L16 16L4 9L16 2Z" fill="#2ECC5E" />
            <path d="M16 16L28 9V23L16 30V16Z" fill="#3BD468" />
            <path d="M16 16L4 9V23L16 30V16Z" fill="#45DB70" />
          </svg>
          <span>Dak Ghar</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start exporting globally today</p>

        {/* ── STEP 1: Role Picker ── */}
        {step === 'role' && (
          <>
            <p className="role-prompt">I am joining as a…</p>
            <div className="role-grid">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`role-card${role === r.id ? ' role-card--active' : ''}`}
                  onClick={() => selectRole(r.id)}
                >
                  <span className="role-card__icon">{r.icon}</span>
                  <span className="role-card__label">{r.label}</span>
                  <span className="role-card__sub">{r.sub}</span>
                  <span className="role-card__check">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
                      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
              ))}
            </div>
            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}

        {/* ── STEP 2: Registration Form ── */}
        {step === 'form' && (
          <>
            {/* Back + selected role badge */}
            <div className="role-back-bar">
              <button className="role-back-btn" type="button" onClick={() => { setStep('role'); setError(''); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <span className="role-badge">
                {selectedRole?.icon}
                {selectedRole?.label}
              </span>
            </div>

            {error   && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-row">
                <div className="auth-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Raman"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="auth-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Negi"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Email address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="auth-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
      </div>

      {/* Right Visual Panel */}
      <div className="auth-visual">
        <div className="auth-visual__content">
          <h2>Join thousands of exporters</h2>
          <p>Manage all your international shipments from one powerful, modern dashboard.</p>
          <div className="auth-stats">
            <div><strong>10K+</strong><span>Users</span></div>
            <div><strong>50+</strong><span>Countries</span></div>
            <div><strong>Free</strong><span>To Start</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
