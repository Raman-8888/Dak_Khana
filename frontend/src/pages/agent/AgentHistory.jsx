import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Navbar from '../../components/layout/Navbar';
import './AgentDashboard.css';

export default function AgentHistory() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [history, setHistory] = useState([]);
    
    useEffect(() => {
        try {
            const cachedAssign = JSON.parse(localStorage.getItem('dak_agent_assignments_cache')) || [];
            // Get only delivered ones
            setHistory(cachedAssign.filter(a => a.status === 'delivered'));
        } catch {}
    }, []);

    const calcEarnings = (shipment) => {
        const dist = parseFloat(shipment?.receiver_detail?.distance || 0);
        const weightKg = (shipment?.package_detail?.weight_grams || 0) / 1000;
        const cost = (dist * 5) + weightKg;
        return (cost * 0.10).toFixed(2);
    };

    return (
        <>
            <Navbar />
            <div className="agent-dash">
                <main className="agent-main" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '40px' }}>
                    <div className="agent-section__header">
                        <h2>Delivery History</h2>
                    </div>

                    <div className="assign-list">
                        {history.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No delivered packages yet.</p>
                        ) : (
                            history.map(a => (
                                <div key={a.id} className="assign-card" style={{ borderLeft: '4px solid #16a34a' }}>
                                    <div className="assign-card__header">
                                        <span className="assign-card__id">{a.shipment?.tracking_number || `#${a.id}`}</span>
                                        <span className="assign-card__status" style={{ background: '#dcfce7', color: '#16a34a' }}>
                                            Delivered
                                        </span>
                                    </div>
                                    <p className="assign-card__address" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                        <strong>From:</strong> {a.shipment?.receiver_detail?.from_address || a.shipment?.sender_detail?.address || 'N/A'}
                                    </p>
                                    <p className="assign-card__address" style={{ fontSize: '0.85rem' }}>
                                        <strong>To:</strong> {a.shipment?.receiver_detail?.to_address || a.shipment?.receiver_detail?.address || 'N/A'}
                                    </p>
                                    
                                    <div style={{ marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '10px' }}>Package Details</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                                            <div>
                                                <span style={{ color: '#64748b' }}>Weight: </span>
                                                <strong style={{ color: '#334155' }}>{((a.shipment?.package_detail?.weight_grams || 0) / 1000).toFixed(2)} kg</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: '#64748b' }}>Distance: </span>
                                                <strong style={{ color: '#334155' }}>{a.shipment?.receiver_detail?.distance || 0} km</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: '#64748b' }}>Delivered On: </span>
                                                <strong style={{ color: '#334155' }}>{new Date(a.updated_at || a.created_at).toLocaleDateString()}</strong>
                                            </div>
                                            <div style={{ background: '#dcfce7', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', width: 'max-content' }}>
                                                <span style={{ color: '#166534', fontWeight: 'bold' }}>Earned: ${calcEarnings(a.shipment)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
