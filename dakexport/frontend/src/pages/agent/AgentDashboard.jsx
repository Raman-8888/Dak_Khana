import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../lib/api';
import './AgentDashboard.css';

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = '#45DB70' }) {
    return (
        <div className="agent-stat-card">
            <div className="agent-stat-icon" style={{ background: `${color}18`, color }}>
                {icon}
            </div>
            <div className="agent-stat-body">
                <span className="agent-stat-value">{value}</span>
                <span className="agent-stat-label">{label}</span>
                {sub && <span className="agent-stat-sub">{sub}</span>}
            </div>
        </div>
    );
}

// ── Assignment Card ───────────────────────────────────────────────────────────
function AssignmentCard({ number, address, status, time, priority }) {
    const statusColor = {
        assigned:   '#f59e0b',
        picked_up:  '#3b82f6',
        in_transit: '#8b5cf6',
        delivered:  '#45DB70',
        failed:     '#ef4444',
    };
    return (
        <div className={`assign-card assign-card--${priority}`}>
            <div className="assign-card__header">
                <span className="assign-card__id">#{number}</span>
                <span className="assign-card__status"
                      style={{ background: `${statusColor[status] ?? '#64748b'}18`,
                               color: statusColor[status] ?? '#64748b' }}>
                    {status.replace(/_/g, ' ')}
                </span>
            </div>
            <p className="assign-card__address">{address}</p>
            <div className="assign-card__footer">
                <span className="assign-card__time">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {time}
                </span>
                {priority === 'urgent' && (
                    <span className="assign-card__urgent">URGENT</span>
                )}
            </div>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AgentDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [queueCount, setQueueCount] = useState(0);
    const [deliveredToday, setDeliveredToday] = useState(0);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const { ok, body } = await apiFetch('agent/assignments', { method: 'GET' });
            if (cancelled || !ok || !body?.success) return;
            const rows = body.data || [];
            setQueueCount(rows.filter((r) => !['delivered', 'cancelled', 'failed'].includes(r.status)).length);
            setDeliveredToday(rows.filter((r) => r.status === 'delivered').length);
        })();
        return () => { cancelled = true; };
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="agent-dash">

            {/* ── Top Bar ── */}
            <header className="agent-topbar">
                <div className="agent-topbar__left">
                    <div className="agent-logo">
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#45DB70"/>
                            <path d="M16 2L28 9L16 16L4 9L16 2Z" fill="#2ECC5E"/>
                            <path d="M16 16L28 9V23L16 30V16Z" fill="#3BD468"/>
                            <path d="M16 16L4 9V23L16 30V16Z" fill="#45DB70"/>
                        </svg>
                        <span>DakExport</span>
                    </div>
                    <div className="agent-greeting">
                        <span>Good morning,</span>
                        <strong>{user?.name?.split(' ')[0] ?? 'Agent'}</strong>
                    </div>
                </div>

                <div className="agent-topbar__right">
                    {/* Shift Toggle */}
                    <button className="shift-toggle shift-toggle--on">
                        <span className="shift-dot" />
                        On Duty
                    </button>

                    {/* Notifications */}
                    <button className="agent-icon-btn" title="Notifications">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        <span className="agent-icon-btn__badge">3</span>
                    </button>

                    {/* Avatar */}
                    <button className="agent-avatar" onClick={handleLogout}
                            title="Click to sign out">
                        {user?.name?.charAt(0).toUpperCase() ?? 'A'}
                    </button>
                </div>
            </header>

            <main className="agent-main">

                {/* ── Earnings banner ── */}
                <div className="agent-earnings-banner">
                    <div className="agent-earnings-banner__content">
                        <div>
                            <p className="agent-earnings-label">Today's Earnings</p>
                            <p className="agent-earnings-amount">—</p>
                        </div>
                        <div className="agent-earnings-meta">
                            <span>{deliveredToday} delivered&nbsp;·&nbsp;{queueCount} in queue</span>
                            <span className="agent-earnings-streak">🔥 3-day streak</span>
                        </div>
                    </div>
                    <svg className="agent-earnings-bg" viewBox="0 0 200 80" fill="none">
                        <path d="M0 60 C40 20, 80 70, 120 40 S160 10, 200 30 L200 80 L0 80Z"
                              fill="rgba(255,255,255,0.05)"/>
                    </svg>
                </div>

                {/* ── Stats Row ── */}
                <div className="agent-stats-row">
                    <StatCard
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
                        label="Delivered"
                        value={String(deliveredToday)}
                        sub="Today"
                        color="#45DB70"
                    />
                    <StatCard
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                        label="Pending"
                        value={String(queueCount)}
                        sub="In queue"
                        color="#f59e0b"
                    />
                    <StatCard
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                        label="Success Rate"
                        value="97%"
                        sub="This week"
                        color="#8b5cf6"
                    />
                    <StatCard
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                        label="Ranking"
                        value="#4"
                        sub="Zone leader"
                        color="#06b6d4"
                    />
                </div>

                {/* ── Two column layout: Assignments + Map ── */}
                <div className="agent-content-grid">

                    {/* Assignments Queue */}
                    <section className="agent-section">
                        <div className="agent-section__header">
                            <h2>Today's Queue</h2>
                            <button type="button" className="agent-view-all" onClick={() => navigate('/agent/assignments')}>View All</button>
                        </div>

                        <div className="assign-list">
                            <AssignmentCard number="DAK-2041" address="12/A, Green Park, Dehradun — 248001"
                                            status="in_transit" time="Due 11:30 AM" priority="urgent"/>
                            <AssignmentCard number="DAK-2042" address="Plot 5, Rajpur Road, Dehradun — 248009"
                                            status="assigned" time="Due 12:00 PM" priority="normal"/>
                            <AssignmentCard number="DAK-2043" address="Lane 7, Balliwala Chowk — 248001"
                                            status="assigned" time="Due 1:00 PM" priority="normal"/>
                            <AssignmentCard number="DAK-2044" address="Saharanpur Road, Majra — 248171"
                                            status="picked_up" time="Due 2:30 PM" priority="normal"/>
                        </div>
                    </section>

                    {/* Map Placeholder */}
                    <section className="agent-section agent-map-section">
                        <div className="agent-section__header">
                            <h2>Live Route</h2>
                            <button className="agent-view-all">Open Maps</button>
                        </div>
                        <div className="agent-map-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                                 stroke="rgba(69,219,112,0.4)" strokeWidth="1.5">
                                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                                <line x1="9" y1="3" x2="9" y2="18"/>
                                <line x1="15" y1="6" x2="15" y2="21"/>
                            </svg>
                            <p>Map loads when On Duty</p>
                            <p className="agent-map-coming">Leaflet / Google Maps integration — Phase 2</p>
                        </div>
                    </section>
                </div>

                {/* ── Quick Actions ── */}
                <div className="agent-quick-actions">
                    <button className="qa-btn qa-btn--green">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Mark Delivered
                    </button>
                    <button className="qa-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                        Mark Pickup
                    </button>
                    <button className="qa-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                        Report Failed
                    </button>
                    <button className="qa-btn qa-btn--red">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Emergency
                    </button>
                </div>

            </main>
        </div>
    );
}
