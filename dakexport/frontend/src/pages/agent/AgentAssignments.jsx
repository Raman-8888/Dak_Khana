import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import './AgentAssignments.css';

function formatAddress(shipment) {
    const r = shipment?.receiver_detail;
    if (!r) return '—';
    return [r.address, r.city, r.postal_code, r.country_code].filter(Boolean).join(', ');
}

export default function AgentAssignments() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busyId, setBusyId] = useState(null);

    const load = async () => {
        setError('');
        const { ok, body } = await apiFetch('agent/assignments', { method: 'GET' });
        setLoading(false);
        if (!ok || !body?.success) {
            setError(body?.message || 'Could not load assignments');
            return;
        }
        setItems(body.data || []);
    };

    useEffect(() => {
        load();
    }, []);

    const pickup = async (id) => {
        setBusyId(id);
        const { ok, body } = await apiFetch(`agent/assignments/${id}/pickup`, { method: 'POST' });
        setBusyId(null);
        if (!ok || !body?.success) {
            alert(body?.message || 'Pickup failed');
            return;
        }
        if (body.dev_otp) {
            alert(`DEV build — delivery OTP: ${body.dev_otp}`);
        }
        await load();
    };

    const deliver = async (id) => {
        const otp = window.prompt('Enter 4-digit delivery OTP:');
        if (!otp) return;
        const recipient = window.prompt('Recipient name:');
        if (!recipient) return;
        setBusyId(id);
        const { ok, body } = await apiFetch(`agent/assignments/${id}/deliver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp, recipient_name: recipient }),
        });
        setBusyId(null);
        if (!ok || !body?.success) {
            alert(body?.message || 'Delivery failed');
            return;
        }
        await load();
    };

    const fail = async (id) => {
        const reason = window.prompt('Failure reason (required):');
        if (!reason) return;
        setBusyId(id);
        const { ok, body } = await apiFetch(`agent/assignments/${id}/fail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ failure_reason: reason }),
        });
        setBusyId(null);
        if (!ok || !body?.success) {
            alert(body?.message || 'Could not record failure');
            return;
        }
        await load();
    };

    return (
        <div className="agent-assign-page">
            <header className="agent-assign-top">
                <Link to="/agent/dashboard" className="agent-assign-back">← Dashboard</Link>
                <h1>My assignments</h1>
                <button type="button" className="agent-assign-logout" onClick={async () => { await logout(); navigate('/login'); }}>
                    Sign out
                </button>
            </header>

            {loading && <p className="agent-assign-muted">Loading…</p>}
            {error && <p className="agent-assign-error">{error}</p>}

            <div className="agent-assign-list">
                {items.map((a) => {
                    const s = a.shipment;
                    const tn = s?.tracking_number ?? a.id;
                    return (
                        <article key={a.id} className="agent-assign-card">
                            <div className="agent-assign-card__head">
                                <span className="agent-assign-tn">{tn}</span>
                                <span className="agent-assign-status">{a.status?.replace(/_/g, ' ')}</span>
                            </div>
                            <p className="agent-assign-addr">{formatAddress(s)}</p>
                            <div className="agent-assign-actions">
                                <button type="button" disabled={busyId === a.id || !['assigned', 'rescheduled'].includes(a.status)} onClick={() => pickup(a.id)}>
                                    Pickup
                                </button>
                                <button type="button" disabled={busyId === a.id || !['in_transit', 'picked_up'].includes(a.status)} onClick={() => deliver(a.id)}>
                                    Deliver
                                </button>
                                <button type="button" className="danger" disabled={busyId === a.id} onClick={() => fail(a.id)}>
                                    Fail
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {!loading && items.length === 0 && !error && (
                <p className="agent-assign-muted">No assignments right now.</p>
            )}
        </div>
    );
}
