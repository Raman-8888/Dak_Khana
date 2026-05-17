import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
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
function AssignmentCard({ assignment, onPickup, onDeliver, onFail }) {
    const statusColor = {
        assigned:   '#f59e0b', // warning orange
        picked_up:  '#3b82f6', // blue
        in_transit: '#8b5cf6', // purple
        delivered:  '#16a34a', // green
        failed:     '#ef4444', // red
    };
    
    const status = assignment.status;
    const address = assignment.shipment?.receiver_detail?.from_address || assignment.shipment?.receiver_detail?.address || 'N/A';
    const isPriority = assignment.shipment?.is_priority;
    
    return (
        <div className={`assign-card ${isPriority ? 'assign-card--urgent' : ''}`}>
            <div className="assign-card__header">
                <span className="assign-card__id">{assignment.shipment?.tracking_number || `#${assignment.id}`}</span>
                <span className="assign-card__status"
                      style={{ background: `${statusColor[status] ?? '#64748b'}18`,
                               color: statusColor[status] ?? '#64748b' }}>
                    {status.replace(/_/g, ' ')}
                </span>
            </div>
            <p className="assign-card__address">{address}</p>
            <div className="assign-card__footer">
                <span className="assign-card__time">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Due {new Date(assignment.scheduled_for || assignment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                {isPriority && <span className="assign-card__urgent">URGENT</span>}
            </div>
            
            <div className="assign-card__actions">
                {status === 'assigned' && (
                    <button className="card-action-btn card-action-btn--primary" onClick={() => onPickup(assignment)}>Mark Pickup</button>
                )}
                {(status === 'picked_up' || status === 'in_transit') && (
                    <>
                        <button className="card-action-btn card-action-btn--primary" onClick={() => onDeliver(assignment)}>Deliver</button>
                        <button className="card-action-btn card-action-btn--danger" onClick={() => onFail(assignment)}>Report Fail</button>
                    </>
                )}
            </div>
        </div>
    );
}



// ── Available Shipment Card ───────────────────────────────────────────────────
function AvailableShipmentCard({ shipment, onAssign }) {
    const address = shipment.receiver_detail?.from_address || shipment.sender_detail?.address || 'N/A';
    const toAddress = shipment.receiver_detail?.to_address || shipment.receiver_detail?.address || 'N/A';
    
    return (
        <div className="assign-card">
            <div className="assign-card__header">
                <span className="assign-card__id">{shipment.tracking_number}</span>
                <span className="assign-card__status"
                      style={{ background: '#3b82f618', color: '#3b82f6' }}>
                    Available
                </span>
            </div>
            <p className="assign-card__address" style={{fontSize: '0.85rem', marginBottom: '4px'}}><strong>From:</strong> {address}</p>
            <p className="assign-card__address" style={{fontSize: '0.85rem'}}><strong>To:</strong> {toAddress}</p>
            <div className="assign-card__footer">
                <span className="assign-card__time">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Created {new Date(shipment.created_at).toLocaleDateString()}
                </span>
            </div>
            
            <div className="assign-card__actions">
                <button className="card-action-btn card-action-btn--primary" onClick={() => onAssign(shipment)}>Assign to me</button>
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
    const [assignments, setAssignments] = useState([]);
    const [availableDeliveries, setAvailableDeliveries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    
    // Modal states
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', type: 'alert' });
    const [deliverModal, setDeliverModal] = useState({ isOpen: false, assignment: null, otp: '', name: '' });
    const [failModal, setFailModal] = useState({ isOpen: false, assignment: null, reason: '' });

    const fetchAssignments = async () => {
        try {
            const [{ ok: assignOk, body: assignBody }, { ok: availOk, body: availBody }] = await Promise.all([
                apiFetch('agent/assignments', { method: 'GET' }),
                apiFetch('agent/assignments/available', { method: 'GET' })
            ]);

            if (assignOk && assignBody?.success) {
                const rows = assignBody.data || [];
                setAssignments(rows);
                setQueueCount(rows.filter((r) => !['delivered', 'cancelled', 'failed'].includes(r.status)).length);
                setDeliveredToday(rows.filter((r) => r.status === 'delivered').length);
                try { localStorage.setItem('dak_agent_assignments_cache', JSON.stringify(rows)); } catch {}
            }

            if (availOk && availBody?.success) {
                setAvailableDeliveries(availBody.data || []);
                try { localStorage.setItem('dak_agent_avail_cache', JSON.stringify(availBody.data || [])); } catch {}
            }
        } catch(e) {
             console.error("Fetch failed", e);
        }
    };

    useEffect(() => {
        try {
            const cachedAssign = JSON.parse(localStorage.getItem('dak_agent_assignments_cache'));
            if (cachedAssign) {
                setAssignments(cachedAssign);
                setQueueCount(cachedAssign.filter((r) => !['delivered', 'cancelled', 'failed'].includes(r.status)).length);
                setDeliveredToday(cachedAssign.filter((r) => r.status === 'delivered').length);
            }
            const cachedAvail = JSON.parse(localStorage.getItem('dak_agent_avail_cache'));
            if (cachedAvail) setAvailableDeliveries(cachedAvail);
        } catch {}
        fetchAssignments();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handlePickup = (assignment) => {
        apiFetch(`agent/assignments/${assignment.id}/pickup`, { method: 'POST' }).catch(() => {});
        setAssignments(prev => prev.map(a => a.id === assignment.id ? { ...a, status: 'picked_up' } : a));
        setDialog({ isOpen: true, title: 'Pickup Confirmed', message: 'Pickup successful! OTP generated and will be required to confirm the delivery.', type: 'alert' });
    };

    const handleSelfAssign = (shipment) => {
        apiFetch(`agent/assignments/self-assign/${shipment.id}`, { method: 'POST' }).catch(() => {});
        const newAssignment = { id: shipment.id, shipment, status: 'assigned', created_at: new Date().toISOString() };
        setAvailableDeliveries(prev => prev.filter(s => s.id !== shipment.id));
        setAssignments(prev => [newAssignment, ...prev]);
        setQueueCount(q => q + 1);
        setDialog({ isOpen: true, title: 'Assigned', message: 'Shipment added to your queue.', type: 'alert' });
    };

    const submitDelivery = (e) => {
        e.preventDefault();
        apiFetch(`agent/assignments/${deliverModal.assignment.id}/deliver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp: deliverModal.otp, recipient_name: deliverModal.name, proof_signature: 'dummy-signature', latitude: 40.7128, longitude: -74.0060 })
        }).catch(() => {});
        
        setAssignments(prev => prev.map(a => a.id === deliverModal.assignment.id ? { ...a, status: 'delivered' } : a));
        setQueueCount(q => Math.max(0, q - 1));
        setDeliveredToday(d => d + 1);
        setDeliverModal({ isOpen: false, assignment: null, otp: '', name: '' });
        setDialog({ isOpen: true, title: 'Delivered', message: 'Delivery confirmed successfully!', type: 'alert' });
    };

    const submitFailure = (e) => {
        e.preventDefault();
        apiFetch(`agent/assignments/${failModal.assignment.id}/fail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ failure_reason: failModal.reason })
        }).catch(() => {});
        
        setAssignments(prev => prev.map(a => a.id === failModal.assignment.id ? { ...a, status: 'failed' } : a));
        setQueueCount(q => Math.max(0, q - 1));
        setFailModal({ isOpen: false, assignment: null, reason: '' });
        setDialog({ isOpen: true, title: 'Reported', message: 'Failure reported to operations.', type: 'alert' });
    };

    return (
        <>
        <LoadingOverlay isVisible={isLoading} message={loadingMsg} />
        <Navbar />
        <div className="agent-dash">

            {/* ── Top Bar ── */}
            <header className="agent-topbar" style={{ padding: '15px 30px', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                <div className="agent-greeting" style={{ margin: 0 }}>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Good morning, </span>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{user?.name?.split(' ')[0] ?? 'Agent'}</strong>
                </div>

                <div className="agent-topbar__right">
                    {/* Shift Toggle */}
                    <button className="shift-toggle shift-toggle--on">
                        <span className="shift-dot" />
                        On Duty
                    </button>

                </div>
            </header>

            <main className="agent-main">

                {/* ── Earnings banner ── */}
                <div className="agent-earnings-banner">
                    <div className="agent-earnings-banner__content">
                        <div>
                            <p className="agent-earnings-label">Today's Earnings</p>
                            <p className="agent-earnings-amount">${assignments.filter(a => a.status === 'delivered').reduce((total, a) => {
                                const dist = parseFloat(a.shipment?.receiver_detail?.distance || 0);
                                const weightKg = (a.shipment?.package_detail?.weight_grams || 0) / 1000;
                                const cost = (dist * 5) + weightKg;
                                return total + (cost * 0.10); // 10% of cost
                            }, 0).toFixed(2)}</p>
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
                            <button type="button" className="agent-view-all" onClick={() => fetchAssignments()}>↻ Refresh</button>
                        </div>

                        <div className="assign-list">
                            {assignments.length === 0 ? (
                                <p style={{color: '#64748b'}}>No assignments found. Claim an available delivery below.</p>
                            ) : (
                                assignments.map(a => (
                                    <AssignmentCard 
                                        key={a.id} 
                                        assignment={a} 
                                        onPickup={handlePickup} 
                                        onDeliver={(a) => setDeliverModal({ isOpen: true, assignment: a, otp: '', name: '' })}
                                        onFail={(a) => setFailModal({ isOpen: true, assignment: a, reason: '' })}
                                    />
                                ))
                            )}
                        </div>

                        <div className="agent-section__header" style={{ marginTop: '40px' }}>
                            <h2>Available Deliveries</h2>
                        </div>
                        <div className="assign-list">
                            {availableDeliveries.length === 0 ? (
                                <p style={{color: '#64748b'}}>No available deliveries at the moment.</p>
                            ) : (
                                availableDeliveries.map(shipment => (
                                    <AvailableShipmentCard 
                                        key={shipment.id} 
                                        shipment={shipment} 
                                        onAssign={handleSelfAssign} 
                                    />
                                ))
                            )}
                        </div>
                    </section>

                    {/* Live Route Map */}
                    <section className="agent-section agent-map-section">
                        <div className="agent-section__header">
                            <h2>Live Route</h2>
                            <button className="agent-view-all">Open Full Map</button>
                        </div>
                        <div className="agent-map-container">
                            <iframe 
                                title="Live Route"
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight="0" 
                                marginWidth="0" 
                                src="https://www.openstreetmap.org/export/embed.html?bbox=77.9%2C30.2%2C78.1%2C30.4&amp;layer=mapnik&amp;marker=30.3165%2C78.0322"
                                style={{ border: 0 }}
                            ></iframe>
                        </div>
                    </section>
                </div>
            </main>

            {/* Modals */}
            {dialog.isOpen && (
                <div className="modal-overlay" style={{zIndex: 3000}}>
                    <div className="modal" style={{maxWidth: '400px'}}>
                        <h2 style={{color: '#0f172a', marginBottom: '10px'}}>{dialog.title}</h2>
                        <p style={{color: '#475569', marginBottom: '20px'}}>{dialog.message}</p>
                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <button className="card-action-btn card-action-btn--primary" style={{padding: '10px 20px', maxWidth: '100px'}} onClick={() => setDialog({ ...dialog, isOpen: false })}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            {deliverModal.isOpen && (
                <div className="modal-overlay" style={{zIndex: 2000}}>
                    <div className="modal" style={{maxWidth: '400px'}}>
                        <h2 style={{color: '#0f172a', marginBottom: '15px'}}>Mark Delivered</h2>
                        <form onSubmit={submitDelivery}>
                            <div style={{marginBottom: '15px'}}>
                                <label style={{display: 'block', marginBottom: '5px', color: '#475569', fontSize: '0.85rem'}}>4-Digit OTP from Customer</label>
                                <input type="text" maxLength="4" required style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1'}} value={deliverModal.otp} onChange={e => setDeliverModal({...deliverModal, otp: e.target.value})} />
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <label style={{display: 'block', marginBottom: '5px', color: '#475569', fontSize: '0.85rem'}}>Recipient Name</label>
                                <input type="text" required style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1'}} value={deliverModal.name} onChange={e => setDeliverModal({...deliverModal, name: e.target.value})} />
                            </div>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="button" className="card-action-btn" style={{background: '#e2e8f0', color: '#475569'}} onClick={() => setDeliverModal({...deliverModal, isOpen: false})}>Cancel</button>
                                <button type="submit" className="card-action-btn card-action-btn--primary">Confirm Delivery</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {failModal.isOpen && (
                <div className="modal-overlay" style={{zIndex: 2000}}>
                    <div className="modal" style={{maxWidth: '400px'}}>
                        <h2 style={{color: '#0f172a', marginBottom: '15px'}}>Report Failed Delivery</h2>
                        <form onSubmit={submitFailure}>
                            <div style={{marginBottom: '20px'}}>
                                <label style={{display: 'block', marginBottom: '5px', color: '#475569', fontSize: '0.85rem'}}>Failure Reason</label>
                                <select required style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1'}} value={failModal.reason} onChange={e => setFailModal({...failModal, reason: e.target.value})}>
                                    <option value="">Select reason...</option>
                                    <option value="Customer Unavailable">Customer Unavailable</option>
                                    <option value="Address Incorrect">Address Incorrect</option>
                                    <option value="Customer Refused">Customer Refused</option>
                                    <option value="Out of Time">Out of Time</option>
                                </select>
                            </div>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="button" className="card-action-btn" style={{background: '#e2e8f0', color: '#475569'}} onClick={() => setFailModal({...failModal, isOpen: false})}>Cancel</button>
                                <button type="submit" className="card-action-btn card-action-btn--danger">Report Failure</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}
