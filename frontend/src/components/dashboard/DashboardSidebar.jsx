import { Link } from 'react-router-dom';

const NAV = [
    { label: 'Dashboard',     to: '/customer/dashboard',    icon: '⊞' },
    { label: 'My Shipments',  to: '/customer/my-shipments', icon: '⬜' },
    { label: 'Documents',     to: '/customer/documents',    icon: '📄' },
    { label: 'Track Package', to: '/customer/track',        icon: '📍' },
    { label: 'Billing',       to: '/customer/billing',      icon: '💳' },
    { label: 'Support',       to: '/customer/support',      icon: '💬' },
];

export default function DashboardSidebar({ currentPath, onCreateShipment, onLogout }) {
    return (
        <aside className="cust-sidebar">


            <nav className="cust-nav">
                {NAV.map((n) => (
                    <Link
                        key={n.to}
                        to={n.to}
                        className={`cust-nav__item ${currentPath === n.to ? 'active' : ''}`}
                    >
                        <span className="cust-nav__icon">{n.icon}</span>
                        <span className="cust-nav__label">{n.label}</span>
                    </Link>
                ))}
                <button className="cust-nav__btn create-btn" onClick={onCreateShipment}>
                    <span className="cust-nav__icon">＋</span>
                    <span className="cust-nav__label">New Shipment</span>
                </button>
            </nav>

            <button className="cust-sidebar__logout" onClick={onLogout}>
                <span>⎋</span> <span>Sign Out</span>
            </button>
        </aside>
    );
}
