import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ADMIN_WORKSPACES, DEFAULT_ADMIN_WORKSPACE } from '../../constants/adminWorkspaces';
import './AdminWorkspaceBar.css';

const PATH_PREFIX_TO_WORKSPACE = [
    ['/admin', 'admin'],
    ['/ops', 'operations_executive'],
    ['/warehouse', 'warehouse_manager'],
    ['/finance', 'finance'],
    ['/support', 'support_agent'],
    ['/regional', 'regional_manager'],
];

/**
 * Lets admin / super_admin jump between operational workspaces (same account, full access).
 */
export default function AdminWorkspaceBar({ variant = 'floating' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((s) => s.user);
    const adminWorkspace = useAuthStore((s) => s.adminWorkspace);
    const setAdminWorkspace = useAuthStore((s) => s.setAdminWorkspace);

    const elevated = user?.role === 'admin' || user?.role === 'super_admin';

    useEffect(() => {
        if (!elevated) {
            return;
        }
        for (const [prefix, id] of PATH_PREFIX_TO_WORKSPACE) {
            if (location.pathname.startsWith(prefix)) {
                if (adminWorkspace !== id) {
                    setAdminWorkspace(id);
                }
                return;
            }
        }
    }, [elevated, location.pathname, adminWorkspace, setAdminWorkspace]);

    if (!elevated) {
        return null;
    }

    const active = ADMIN_WORKSPACES.some((w) => w.id === adminWorkspace)
        ? adminWorkspace
        : DEFAULT_ADMIN_WORKSPACE;

    const onPick = (ws) => {
        setAdminWorkspace(ws.id);
        navigate(ws.path);
    };

    return (
        <div className={`admin-ws-bar admin-ws-bar--${variant}`} role="navigation" aria-label="Admin workspace preview">
            <span className="admin-ws-bar__label">Preview as</span>
            <div className="admin-ws-bar__toggles">
                {ADMIN_WORKSPACES.map((ws) => (
                    <button
                        key={ws.id}
                        type="button"
                        className={`admin-ws-bar__btn ${active === ws.id ? 'admin-ws-bar__btn--active' : ''}`}
                        onClick={() => onPick(ws)}
                        title={`Open ${ws.label} workspace`}
                    >
                        <span className="admin-ws-bar__icon" aria-hidden>{ws.icon}</span>
                        <span className="admin-ws-bar__text">{ws.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
