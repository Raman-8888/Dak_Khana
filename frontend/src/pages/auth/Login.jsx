import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Auth.css';

export default function Login() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { isAuthenticated, getDashboardPath, login, init } = useAuthStore();

    const [form, setForm]   = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname;
            navigate(from ?? getDashboardPath(), { replace: true });
        }
    }, [isAuthenticated, navigate, location, getDashboardPath]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email.trim().toLowerCase(), form.password);
        } catch (err) {
            setError(err.message || 'Sign in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#45DB70"/>
                        <path d="M16 2L28 9L16 16L4 9L16 2Z" fill="#2ECC5E"/>
                        <path d="M16 16L28 9V23L16 30V16Z" fill="#3BD468"/>
                        <path d="M16 16L4 9V23L16 30V16Z" fill="#45DB70"/>
                    </svg>
                    <span>Dak Ghar</span>
                </div>

                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your account to continue</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
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
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account? <Link to="/register">Create one</Link>
                </p>
            </div>

            <div className="auth-visual">
                <div className="auth-visual__content">
                    <h2>Export with confidence</h2>
                    <p>India&apos;s most trusted postal export platform — track, manage, and deliver globally.</p>
                    <div className="auth-stats">
                        <div><strong>10K+</strong><span>Shipments</span></div>
                        <div><strong>50+</strong><span>Countries</span></div>
                        <div><strong>99.8%</strong><span>On-time</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
