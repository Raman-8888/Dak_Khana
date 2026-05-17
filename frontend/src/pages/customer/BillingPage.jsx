import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import MockPaymentGateway from '../../components/payment/MockPaymentGateway';
import '../customer/CustomerDashboard.css';

const CACHE_KEY = 'dak_exports_cache';
const getCached = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || []; } catch { return []; } };

const getPaidShipments = () => {
    try { return JSON.parse(localStorage.getItem('dak_paid_shipments')) || []; }
    catch { return []; }
};

export default function BillingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const cached = getCached();
    const [exports, setExports] = useState(cached);
    const [loading, setLoading] = useState(cached.length === 0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [paidShipments, setPaidShipments] = useState(getPaidShipments());
    const [paymentGateway, setPaymentGateway] = useState({ isOpen: false, amount: 0, shipmentId: null });
    const [toast, setToast] = useState('');
    const firstName = user?.name?.split(' ')[0] ?? 'there';

    const fetchExports = async () => {
        try {
            const { ok, body } = await apiFetch('customer/exports', { method: 'GET' });
            if (ok && body?.status === 'success') {
                setExports(body.data);
                const serverPaid = body.data.filter(e => e.tracking_events?.some(t => t.status === 'payment_completed')).map(e => e.id);
                if (serverPaid.length) setPaidShipments(prev => { const c = [...new Set([...prev, ...serverPaid])]; localStorage.setItem('dak_paid_shipments', JSON.stringify(c)); return c; });
            }
        } catch {} finally { setLoading(false); }
    };

    useEffect(() => { fetchExports(); }, []);

    const calcPrice = (s) => {
        const dist = parseFloat(s.receiver_detail?.distance || 0);
        const kg = (s.package_detail?.weight_grams || 0) / 1000;
        return ((dist * 5) + kg).toFixed(2);
    };

    const handleDownloadInvoice = (s) => {
        const price = calcPrice(s);
        const dist = parseFloat(s.receiver_detail?.distance || 0);
        const kg = ((s.package_detail?.weight_grams || 0) / 1000).toFixed(2);
        const w = window.open('', '_blank');
        w.document.write(`<html><head><title>Invoice - ${s.tracking_number}</title>
        <style>body{font-family:Inter,sans-serif;padding:40px;color:#0f172a;max-width:600px;margin:0 auto}
        h1{color:#16a34a}table{width:100%;border-collapse:collapse;margin-top:20px}
        th,td{padding:12px;border-bottom:1px solid #e2e8f0;text-align:left}
        th{background:#f8fafc;color:#64748b;font-weight:600}.total{font-weight:800}</style></head>
        <body><h1>DakExport Invoice</h1>
        <p style="color:#64748b">Tracking: <strong>${s.tracking_number}</strong><br/>
        Date: ${new Date().toLocaleString()}<br/>Receiver: ${s.receiver_detail?.name || 'N/A'}</p>
        <table><tr><th>Description</th><th style="text-align:right">Amount</th></tr>
        <tr><td>Distance (${dist} km × $5)</td><td style="text-align:right">$${(dist*5).toFixed(2)}</td></tr>
        <tr><td>Weight (${kg} kg × $1)</td><td style="text-align:right">$${parseFloat(kg).toFixed(2)}</td></tr>
        <tr><td class="total">Total Paid</td><td class="total" style="text-align:right">$${price}</td></tr>
        </table></body></html>`);
        w.document.close(); setTimeout(() => w.print(), 250);
    };

    const handlePaymentSuccess = () => {
        // Fire-and-forget: mark paid on server (best-effort, localStorage is source of truth)
        apiFetch(`customer/exports/${paymentGateway.shipmentId}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: paymentGateway.amount }),
        }).catch(() => {});

        const next = [...paidShipments, paymentGateway.shipmentId];
        setPaidShipments(next);
        localStorage.setItem('dak_paid_shipments', JSON.stringify(next));
        setPaymentGateway({ isOpen: false, amount: 0, shipmentId: null });
        setToast('✅ Payment completed successfully!');
        setTimeout(() => setToast(''), 3500);
        fetchExports();
    };

    return (
        <div className={`cust-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <Navbar />
            <LoadingOverlay isVisible={loading} message="Loading Billing..." />
            <DashboardSidebar currentPath={location.pathname} onCreateShipment={() => navigate('/customer/my-shipments')} onLogout={async () => { await logout(); navigate('/login'); }} />
            <div className="cust-main">
                <div className="cust-content">
                    <section className="cust-section">
                        <div className="cust-section__header"><h2 className="cust-section__title">💳 Billing &amp; Payments</h2></div>
                        {toast && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600 }}>{toast}</div>}
                        {!loading && exports.length === 0 && <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}><div style={{ fontSize: '3rem' }}>💳</div><p>No shipments found.</p></div>}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
                            {exports.map(s => {
                                const isPaid = paidShipments.includes(s.id) || s.tracking_events?.some(t => t.status === 'payment_completed');
                                const price = calcPrice(s);
                                return (
                                    <div key={s.id} style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: `1px solid ${isPaid ? '#bbf7d0' : '#fde68a'}`, overflow: 'hidden' }}>
                                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: isPaid ? '#f0fdf4' : '#fffbeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{s.tracking_number}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{s.receiver_detail?.name || '—'} · {s.receiver_detail?.country_code || '—'}</div>
                                            </div>
                                            <span style={{ background: isPaid ? '#dcfce7' : '#fef3c7', color: isPaid ? '#166534' : '#92400e', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '999px' }}>
                                                {isPaid ? '✅ Paid' : '⏳ Unpaid'}
                                            </span>
                                        </div>
                                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
                                                <span>Distance ({s.receiver_detail?.distance || 0} km × $5)</span>
                                                <span>${(parseFloat(s.receiver_detail?.distance || 0) * 5).toFixed(2)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                                                <span>Weight ({((s.package_detail?.weight_grams || 0) / 1000).toFixed(2)} kg × $1)</span>
                                                <span>${((s.package_detail?.weight_grams || 0) / 1000).toFixed(2)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                                                <span>Total</span><span style={{ color: isPaid ? '#16a34a' : '#dc2626' }}>${price}</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '14px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            {isPaid ? (
                                                <>
                                                    <button onClick={() => navigate('/customer/track')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #3b82f6', background: '#fff', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>📍 Track</button>
                                                    <button onClick={() => handleDownloadInvoice(s)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>⬇ Download Invoice</button>
                                                </>
                                            ) : (
                                                <button onClick={() => setPaymentGateway({ isOpen: true, amount: parseFloat(price), shipmentId: s.id })} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>💳 Pay ${price}</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
            {paymentGateway.isOpen && <MockPaymentGateway amount={paymentGateway.amount} onCancel={() => setPaymentGateway({ isOpen: false, amount: 0, shipmentId: null })} onSuccess={handlePaymentSuccess} />}
        </div>
    );
}
