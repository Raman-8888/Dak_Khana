import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './CustomerDashboard.css';

// ── Sub-components ────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, trend, trendUp, color }) {
    return (
        <div className="kpi-card">
            <div className="kpi-card__icon" style={{ background: `${color}15`, color }}>{icon}</div>
            <div className="kpi-card__body">
                <span className="kpi-card__value">{value}</span>
                <span className="kpi-card__label">{label}</span>
            </div>
            {trend && (
                <span className={`kpi-card__trend ${trendUp ? 'up' : 'down'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                </span>
            )}
        </div>
    );
}

function ShipmentRow({ id, destination, status, date, weight }) {
    const statusMeta = {
        delivered:  { label: 'Delivered',   color: '#45DB70' },
        in_transit: { label: 'In Transit',  color: '#3b82f6' },
        processing: { label: 'Processing',  color: '#f59e0b' },
        pending:    { label: 'Pending',     color: '#94a3b8' },
        on_hold:    { label: 'On Hold',     color: '#ef4444' },
    };
    const s = statusMeta[status] ?? { label: status, color: '#94a3b8' };
    return (
        <tr className="shipment-row">
            <td className="shipment-id">{id}</td>
            <td>{destination}</td>
            <td>
                <span className="status-pill" style={{ background: `${s.color}18`, color: s.color }}>
                    {s.label}
                </span>
            </td>
            <td className="shipment-meta">{weight}</td>
            <td className="shipment-meta">{date}</td>
            <td>
                <Link to="/customer/track" className="track-link">Track →</Link>
            </td>
        </tr>
    );
}

function QuickAction({ icon, label, to, color }) {
    const navigate = useNavigate();
    return (
        <button className="quick-action" onClick={() => navigate(to)}
                style={{ '--qa-color': color }}>
            <span className="quick-action__icon">{icon}</span>
            <span className="quick-action__label">{label}</span>
        </button>
    );
}

// ── Sidebar Nav ───────────────────────────────────────────────────────────────
const NAV = [
    { label: 'Dashboard',       to: '/customer/dashboard',       icon: '⊞' },
    { label: 'Create Shipment', to: '/customer/create-shipment', icon: '＋' },
    { label: 'My Shipments',    to: '/customer/my-shipments',    icon: '⬜' },
    { label: 'Documents',       to: '/customer/documents',       icon: '📄' },
    { label: 'Track Package',   to: '/customer/track',           icon: '📍' },
    { label: 'Billing',         to: '/customer/billing',         icon: '💳' },
    { label: 'Support',         to: '/customer/support',         icon: '💬' },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => { await logout(); navigate('/login'); };
    const firstName = user?.name?.split(' ')[0] ?? 'there';

    return (
        <div className={`cust-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>

            {/* ── Sidebar ── */}
            <aside className="cust-sidebar">
                <div className="cust-sidebar__logo">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#45DB70"/>
                        <path d="M16 2L28 9L16 16L4 9L16 2Z" fill="#2ECC5E"/>
                        <path d="M16 16L28 9V23L16 30V16Z" fill="#3BD468"/>
                        <path d="M16 16L4 9V23L16 30V16Z" fill="#45DB70"/>
                    </svg>
                    <span>DakExport</span>
                </div>

                <nav className="cust-nav">
                    {NAV.map((n) => (
                        <Link key={n.to} to={n.to}
                              className={`cust-nav__item ${location.pathname === n.to ? 'active' : ''}`}>
                            <span className="cust-nav__icon">{n.icon}</span>
                            <span className="cust-nav__label">{n.label}</span>
                        </Link>
                    ))}
                </nav>

                <button className="cust-sidebar__logout" onClick={handleLogout}>
                    <span>⎋</span> Sign Out
                </button>
            </aside>

            {/* ── Main Content ── */}
            <div className="cust-main">

                {/* Topbar */}
                <header className="cust-topbar">
                    <button className="cust-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}
                            title="Toggle sidebar">
                        ☰
                    </button>
                    <div className="cust-topbar__title">
                        <h1>Dashboard</h1>
                        <span>Welcome back, <strong>{firstName}</strong></span>
                    </div>
                    <div className="cust-topbar__right">
                        <button className="cust-notif-btn" title="Notifications">
                            🔔
                            <span className="cust-notif-dot" />
                        </button>
                        <div className="cust-avatar">
                            {user?.name?.charAt(0).toUpperCase() ?? 'C'}
                        </div>
                    </div>
                </header>

                <div className="cust-content">

                    {/* KPIs */}
                    <section className="kpi-row">
                        <KpiCard color="#45DB70"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                            label="Active Shipments" value="4" trend="2 this week" trendUp />
                        <KpiCard color="#3b82f6"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
                            label="Total Delivered" value="128" trend="12 this month" trendUp />
                        <KpiCard color="#f59e0b"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                            label="Pending Payments" value="₹2,840" />
                        <KpiCard color="#8b5cf6"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                            label="Documents" value="18" trend="3 pending" />
                    </section>

                    {/* Quick Actions */}
                    <section className="cust-section">
                        <h2 className="cust-section__title">Quick Actions</h2>
                        <div className="quick-actions-grid">
                            <QuickAction to="/customer/create-shipment" label="New Shipment" color="#45DB70"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>} />
                            <QuickAction to="/customer/track" label="Track Package" color="#3b82f6"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>} />
                            <QuickAction to="/customer/documents" label="Upload Docs" color="#f59e0b"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>} />
                            <QuickAction to="/customer/billing" label="View Invoice" color="#8b5cf6"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} />
                            <QuickAction to="/customer/support" label="Get Support" color="#06b6d4"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
                        </div>
                    </section>

                    {/* Recent Shipments */}
                    <section className="cust-section">
                        <div className="cust-section__header">
                            <h2 className="cust-section__title">Recent Shipments</h2>
                            <Link to="/customer/my-shipments" className="cust-view-all">View All</Link>
                        </div>
                        <div className="cust-table-wrap">
                            <table className="cust-table">
                                <thead>
                                    <tr>
                                        <th>Tracking ID</th>
                                        <th>Destination</th>
                                        <th>Status</th>
                                        <th>Weight</th>
                                        <th>Date</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <ShipmentRow id="DAK-2041" destination="🇺🇸 New York, USA"  status="in_transit" weight="1.2 kg" date="11 May 2026"/>
                                    <ShipmentRow id="DAK-2040" destination="🇬🇧 London, UK"     status="delivered"  weight="0.8 kg" date="10 May 2026"/>
                                    <ShipmentRow id="DAK-2039" destination="🇦🇺 Sydney, AUS"    status="processing" weight="2.5 kg" date="09 May 2026"/>
                                    <ShipmentRow id="DAK-2038" destination="🇩🇪 Berlin, GER"    status="pending"    weight="0.4 kg" date="08 May 2026"/>
                                    <ShipmentRow id="DAK-2037" destination="🇯🇵 Tokyo, JPN"     status="delivered"  weight="1.8 kg" date="07 May 2026"/>
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
