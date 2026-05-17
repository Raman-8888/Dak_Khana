import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Unauthorized.css';

export default function Unauthorized() {
    const navigate    = useNavigate();
    const { user, getDashboardPath, logout } = useAuthStore();

    const handleGoHome = () => navigate(getDashboardPath());
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="unauth-page">
            <div className="unauth-card">
                {/* Icon */}
                <div className="unauth-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.5"
                         strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>

                <h1 className="unauth-code">403</h1>
                <h2 className="unauth-title">Access Restricted</h2>
                <p className="unauth-desc">
                    Your account role&nbsp;
                    {user?.role && (
                        <span className="unauth-role-badge">{user.role.replace(/_/g, ' ')}</span>
                    )}
                    &nbsp;does not have permission to view this page.
                </p>

                <div className="unauth-actions">
                    <button className="unauth-btn unauth-btn--primary" onClick={handleGoHome}>
                        Go to My Dashboard
                    </button>
                    <button className="unauth-btn unauth-btn--ghost" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
