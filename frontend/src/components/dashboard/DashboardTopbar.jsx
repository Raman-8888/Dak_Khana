import { Link } from 'react-router-dom';

const NAV_LINKS = [
    { to: '/customer/dashboard',    label: '⊞ Home' },
    { to: '/customer/my-shipments', label: '📦 Shipments' },
    { to: '/customer/track',        label: '📍 Track' },
    { to: '/customer/billing',      label: '💳 Billing' },
];

export default function DashboardTopbar({
    firstName,
    userName,
    onToggleSidebar,
    notifOpen,
    onToggleNotif,
    notifItems,
}) {
    return (
        <header className="cust-topbar">
            <button className="cust-menu-btn" onClick={onToggleSidebar} title="Toggle sidebar">☰</button>

            <div className="cust-topbar__title">
                <h1>Dashboard</h1>
                <span>Welcome back, <strong>{firstName}</strong></span>
            </div>

            {/* Quick nav links — always visible in topbar */}
            <nav style={{ display: 'flex', gap: '2px', marginLeft: '12px' }}>
                {NAV_LINKS.map(({ to, label }) => (
                    <Link key={to} to={to} style={{
                        padding: '6px 11px', borderRadius: '8px', fontSize: '0.8rem',
                        fontWeight: 600, color: '#64748b', textDecoration: 'none',
                        transition: 'background 0.15s, color 0.15s', whiteSpace: 'nowrap',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        {label}
                    </Link>
                ))}
            </nav>

            <div className="cust-topbar__right">
                {/* Notification Bell */}
                <div style={{ position: 'relative' }}>
                    <button className="cust-notif-btn" title="Notifications" onClick={onToggleNotif}>
                        🔔
                        <span className="cust-notif-dot" />
                    </button>
                    {notifOpen && (
                        <div style={{
                            position: 'absolute', top: '100%', right: 0,
                            width: '320px', background: 'white', borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0', zIndex: 3000,
                            overflow: 'hidden', marginTop: '10px',
                        }}>
                            <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 'bold', color: '#0f172a' }}>
                                Notifications
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {notifItems.length > 0 ? notifItems.map(notif => (
                                    <div key={notif.id} className="notif-item" style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                                        <div style={{ fontSize: '0.85rem', color: notif.color, marginBottom: '4px', fontWeight: 'bold' }}>{notif.type}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#475569' }}>{notif.message}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>{notif.time}</div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '15px', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
                                        No new notifications
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Avatar */}
                <div className="cust-avatar">
                    {userName?.charAt(0).toUpperCase() ?? 'C'}
                </div>
            </div>
        </header>
    );
}
