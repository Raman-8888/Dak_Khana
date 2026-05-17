import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import AdminWorkspaceBar from '../../components/admin/AdminWorkspaceBar';
import './AdminDashboard.css';

function StatCard({ label, value, sub, color, icon, change, changeUp }) {
    return (
        <div className="adm-stat">
            <div className="adm-stat__top">
                <span className="adm-stat__icon" style={{ background: `${color}15`, color }}>{icon}</span>
                {change && <span className={`adm-stat__change ${changeUp ? 'up' : 'down'}`}>{changeUp ? '▲' : '▼'} {change}</span>}
            </div>
            <div className="adm-stat__value">{value}</div>
            <div className="adm-stat__label">{label}</div>
            {sub && <div className="adm-stat__sub">{sub}</div>}
        </div>
    );
}

function ActivityItem({ text, time, type }) {
    const colors = { success:'#45DB70', warning:'#f59e0b', error:'#ef4444', info:'#3b82f6' };
    return (
        <div className="activity-item">
            <span className="activity-dot" style={{ background: colors[type]??'#64748b' }}/>
            <div className="activity-body">
                <span className="activity-text">{text}</span>
                <span className="activity-time">{time}</span>
            </div>
        </div>
    );
}

function UserRow({ name, email, role, status, joined }) {
    const roleColor = { customer:'#45DB70', delivery_agent:'#3b82f6', admin:'#8b5cf6' };
    return (
        <tr className="adm-row">
            <td>
                <div className="adm-user-cell">
                    <div className="adm-user-avatar">{name.charAt(0)}</div>
                    <div>
                        <div className="adm-user-name">{name}</div>
                        <div className="adm-user-email">{email}</div>
                    </div>
                </div>
            </td>
            <td><span className="role-badge" style={{background:`${roleColor[role]??'#64748b'}18`,color:roleColor[role]??'#64748b'}}>{role.replace(/_/g,' ')}</span></td>
            <td><span className={`status-dot ${status}`}/> {status}</td>
            <td className="adm-meta">{joined}</td>
        </tr>
    );
}

const NAV = [
    { label:'Overview',   to:'/admin/dashboard',  icon:'⊞' },
    { label:'Users',      to:'/admin/users',       icon:'👥' },
    { label:'Roles',      to:'/admin/roles',       icon:'🔐' },
    { label:'Pricing',    to:'/admin/pricing',     icon:'💰' },
    { label:'Zones',      to:'/admin/zones',       icon:'🗺' },
    { label:'Audit Logs', to:'/admin/audit-logs',  icon:'📋' },
    { label:'System',     to:'/admin/system',      icon:'⚙️' },
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const handleLogout = async () => { await logout(); navigate('/login'); };

    return (
        <div className={`adm-layout ${sidebarOpen?'':'sidebar-collapsed'}`}>
            <aside className="adm-sidebar">
                <div className="adm-sidebar__logo">
                    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#45DB70"/>
                        <path d="M16 2L28 9L16 16L4 9L16 2Z" fill="#2ECC5E"/>
                    </svg>
                    <div><span className="adm-brand">DakExport</span><span className="adm-subbrand">Admin Console</span></div>
                </div>
                <nav className="adm-nav">
                    {NAV.map(n => (
                        <Link key={n.to} to={n.to} className={`adm-nav__item ${location.pathname===n.to?'active':''}`}>
                            <span className="adm-nav__icon">{n.icon}</span>
                            <span className="adm-nav__label">{n.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="adm-sidebar__footer">
                    <div className="adm-user-chip">
                        <div className="adm-chip-avatar">{user?.name?.charAt(0)??'A'}</div>
                        <div><div className="adm-chip-name">{user?.name??'Admin'}</div><div className="adm-chip-role">{user?.role?.replace(/_/g,' ')}</div></div>
                    </div>
                    <button className="adm-logout" onClick={handleLogout} title="Sign out">⎋</button>
                </div>
            </aside>

            <div className="adm-main">
                <header className="adm-topbar">
                    <button className="adm-menu-btn" onClick={()=>setSidebarOpen(!sidebarOpen)}>☰</button>
                    <div className="adm-topbar__content">
                        <h1>Platform Overview</h1>
                        <span>Live system metrics — use Preview as to open other workspaces with full access</span>
                    </div>
                    <div className="adm-topbar__right">
                        <AdminWorkspaceBar variant="inline" />
                        <div className="adm-health-badge"><span className="adm-health-dot"/>All Systems Operational</div>
                    </div>
                </header>

                <div className="adm-content">
                    {/* Stats */}
                    <section className="adm-stats-grid">
                        <StatCard label="Total Shipments" value="14,832" sub="All time"       color="#45DB70" change="12%" changeUp icon="📦"/>
                        <StatCard label="Revenue Today"   value="₹84,200" sub="Target ₹100K" color="#3b82f6" change="8%"  changeUp icon="💰"/>
                        <StatCard label="Active Agents"   value="23"      sub="4 on break"   color="#8b5cf6" icon="🚴"/>
                        <StatCard label="Fraud Alerts"    value="7"       sub="3 critical"   color="#ef4444" change="2"   changeUp={false} icon="⚠️"/>
                        <StatCard label="Users"           value="2,841"   sub="↑48 this week" color="#06b6d4" icon="👥"/>
                        <StatCard label="Delivery Rate"   value="97.4%"   sub="SLA: 95%"     color="#45DB70" change="0.8%" changeUp icon="✓"/>
                        <StatCard label="Pending Queue"   value="142"     sub="shipments"    color="#f59e0b" icon="⏳"/>
                        <StatCard label="Countries"       value="58"      sub="active routes" color="#ec4899" icon="🌐"/>
                    </section>

                    <div className="adm-two-col">
                        {/* Recent Users */}
                        <section className="adm-card">
                            <div className="adm-card__header">
                                <h2>Recent Users</h2>
                                <Link to="/admin/users" className="adm-view-all">View All</Link>
                            </div>
                            <div className="adm-table-wrap">
                                <table className="adm-table">
                                    <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
                                    <tbody>
                                        <UserRow name="Raman Negi"   email="raman@example.com"  role="customer"       status="active"   joined="12 May"/>
                                        <UserRow name="Priya Sharma" email="priya@example.com"  role="delivery_agent" status="active"   joined="11 May"/>
                                        <UserRow name="Arun Mehta"   email="arun@example.com"   role="customer"       status="active"   joined="10 May"/>
                                        <UserRow name="Sunita Rawat" email="sunita@example.com" role="delivery_agent" status="inactive" joined="09 May"/>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Activity Feed */}
                        <section className="adm-card">
                            <div className="adm-card__header">
                                <h2>System Activity</h2>
                                <Link to="/admin/audit-logs" className="adm-view-all">Audit Logs</Link>
                            </div>
                            <div className="activity-feed">
                                <ActivityItem type="success" text="DAK-2041 delivered successfully"     time="2 min ago"/>
                                <ActivityItem type="error"   text="Fraud alert on shipment DAK-2038"    time="8 min ago"/>
                                <ActivityItem type="info"    text="New agent Priya Sharma registered"   time="22 min ago"/>
                                <ActivityItem type="warning" text="SLA breach on DAK-2035 (Dubai)"      time="35 min ago"/>
                                <ActivityItem type="success" text="Payment ₹4,200 confirmed DAK-2040"   time="1 hr ago"/>
                                <ActivityItem type="warning" text="Agent missed 3 consecutive pickups"  time="3 hr ago"/>
                            </div>
                        </section>
                    </div>

                    {/* Admin Controls */}
                    <section className="adm-card">
                        <h2 className="adm-card__solo-title">Admin Controls</h2>
                        <div className="adm-controls-grid">
                            {[
                                { to:'/admin/users',      icon:'👥', label:'Manage Users',    color:'#45DB70' },
                                { to:'/admin/roles',      icon:'🔐', label:'Role Permissions', color:'#8b5cf6' },
                                { to:'/admin/pricing',    icon:'💰', label:'Pricing Rules',    color:'#3b82f6' },
                                { to:'/admin/zones',      icon:'🗺', label:'Country Zones',    color:'#06b6d4' },
                                { to:'/admin/audit-logs', icon:'📋', label:'Audit Logs',       color:'#f59e0b' },
                                { to:'/admin/system',     icon:'⚙️', label:'System Health',    color:'#ef4444' },
                            ].map(a => (
                                <Link key={a.to} to={a.to} className="adm-ctrl-btn" style={{'--ctrl-color':a.color}}>
                                    <span className="adm-ctrl-icon">{a.icon}</span>
                                    <span>{a.label}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
