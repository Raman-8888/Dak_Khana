import { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import './AgentDashboard.css';

export default function AgentEarnings() {
    const [earnings, setEarnings] = useState(0);
    const [deliveries, setDeliveries] = useState(0);

    useEffect(() => {
        try {
            const cachedAssign = JSON.parse(localStorage.getItem('dak_agent_assignments_cache')) || [];
            const delivered = cachedAssign.filter(a => a.status === 'delivered');
            setDeliveries(delivered.length);
            
            const total = delivered.reduce((acc, a) => {
                const dist = parseFloat(a.shipment?.receiver_detail?.distance || 0);
                const weightKg = (a.shipment?.package_detail?.weight_grams || 0) / 1000;
                const cost = (dist * 5) + weightKg;
                return acc + (cost * 0.10);
            }, 0);
            setEarnings(total);
        } catch {}
    }, []);

    return (
        <>
            <Navbar />
            <div className="agent-dash">
                <main className="agent-main" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '40px' }}>
                    
                    <div className="agent-earnings-banner" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', marginBottom: '40px' }}>
                        <div className="agent-earnings-banner__content">
                            <div>
                                <p className="agent-earnings-label">Total Lifetime Earnings</p>
                                <p className="agent-earnings-amount" style={{ fontSize: '3rem' }}>${earnings.toFixed(2)}</p>
                            </div>
                            <div className="agent-earnings-meta">
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{deliveries} Successful Deliveries</span>
                            </div>
                        </div>
                        <svg className="agent-earnings-bg" viewBox="0 0 200 80" fill="none">
                            <path d="M0 60 C40 20, 80 70, 120 40 S160 10, 200 30 L200 80 L0 80Z" fill="rgba(255,255,255,0.05)"/>
                        </svg>
                    </div>

                    <div className="agent-section" style={{ padding: '30px', borderRadius: '16px', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ marginBottom: '20px', color: '#0f172a' }}>Earnings Breakdown</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Commission Rate</h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>10%</p>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Of total shipment cost</p>
                            </div>
                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Current Balance</h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>${earnings.toFixed(2)}</p>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Available for next payout</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
