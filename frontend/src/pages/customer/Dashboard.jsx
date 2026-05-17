import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../lib/api';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import Navbar from '../../components/layout/Navbar';

// ── Dashboard sub-components ──────────────────────────────────────────────────
import KpiCard            from '../../components/dashboard/KpiCard';
import ShipmentRow        from '../../components/dashboard/ShipmentRow';
import QuickAction        from '../../components/dashboard/QuickAction';
import AlertDialog        from '../../components/dashboard/AlertDialog';
import DashboardSidebar   from '../../components/dashboard/DashboardSidebar';
import CreateShipmentModal from '../../components/dashboard/CreateShipmentModal';

import './CustomerDashboard.css';
import '../customer/LogisticsPage.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const CACHE_KEY = 'dak_exports_cache';
const getCached = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || []; } catch { return []; } };

const getPaidShipments = () => {
    try { return JSON.parse(localStorage.getItem('dak_paid_shipments')) || []; }
    catch { return []; }
};

const EMPTY_FORM = {
    service_type_id: '00000000-0000-0000-0000-000000000000',
    sender:   { name: 'Default Sender', city: 'Mumbai', state: 'MH', postal_code: '400001', phone: '9876543210', address: '' },
    receiver: { name: '', from_address: '', to_address: '', distance: '', city: 'New York', state: 'NY', postal_code: '10001', country_code: '', phone: '' },
    package:  { weight_kg: '', content_description: '', product_type: 'glass' },
};

function buildNotifications(exports) {
    let items = [];
    exports.forEach(exp => {
        const otpEvent = exp.tracking_events?.find(t => t.notes?.includes('OTP for delivery is:'));
        if (otpEvent) {
            const match = otpEvent.notes.match(/OTP for delivery is:\s*(\d+)/);
            if (match) items.push({ id: `otp-${exp.id}`, type: 'OTP Generated', color: '#10b981', message: `OTP for ${exp.tracking_number} is ${match[1]}.`, time: new Date(otpEvent.created_at).toLocaleString() });
        }
        if (exp.status !== 'draft' && exp.status !== 'pending') {
            items.push({ id: `status-${exp.id}`, type: 'Tracking Updated', color: '#3b82f6', message: `Shipment ${exp.tracking_number} is now ${exp.status?.replace('_', ' ')}.`, time: new Date(exp.updated_at).toLocaleString() });
        }
        const payEvent = exp.tracking_events?.find(t => t.status === 'payment_completed');
        if (payEvent) {
            items.push({ id: `payok-${exp.id}`, type: 'Payment Confirmed', color: '#16a34a', message: `Payment for ${exp.tracking_number} was successful.`, time: new Date(payEvent.created_at).toLocaleString() });
        }
        if ((exp.status === 'draft' || exp.status === 'pending') && !payEvent && !getPaidShipments().includes(exp.id)) {
            items.push({ id: `pay-${exp.id}`, type: 'Payment Required', color: '#f59e0b', message: `Please complete payment for ${exp.tracking_number}.`, time: new Date(exp.created_at).toLocaleString() });
        }
    });
    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user, logout } = useAuthStore();

    const cached = getCached();
    const [exports,         setExports]         = useState(cached);
    const [loading,         setLoading]         = useState(cached.length === 0); // only show spinner on first visit
    const [isSubmitting,    setIsSubmitting]     = useState(false);
    const [sidebarOpen,     setSidebarOpen]      = useState(true);
    const [showCreateModal, setShowCreateModal]  = useState(false);
    const [formData,        setFormData]         = useState(EMPTY_FORM);
    const [dialog,          setDialog]           = useState({ isOpen: false, title: '', message: '' });

    useEffect(() => { fetchExports(); }, []);

    // ── Data fetching ─────────────────────────────────────────────────────────
    const fetchExports = async () => {
        try {
            const { ok, body } = await apiFetch('customer/exports', { method: 'GET' });
            if (ok && body?.status === 'success') {
                setExports(body.data);
                try { localStorage.setItem(CACHE_KEY, JSON.stringify(body.data)); } catch {}
            }
        } catch (err) {
            console.error('Error fetching exports:', err);
        } finally {
            setLoading(false);
        }
    };

    // ── Dialog helper ─────────────────────────────────────────────────────────
    const showDialog = (title, message) => setDialog({ isOpen: true, title, message });
    const closeDialog = () => setDialog(d => ({ ...d, isOpen: false }));

    // ── Form validation ───────────────────────────────────────────────────────
    const validateForm = () => {
        const r = formData.receiver;
        const p = formData.package;
        const errors = [];
        if (!r.name.trim())         errors.push('Receiver Name is required.');
        if (!r.country_code.trim()) errors.push('Country Code is required.');
        if (!r.phone.trim())        errors.push('Receiver Phone is required.');
        if (!r.from_address.trim()) errors.push('From Address is required.');
        if (!r.to_address.trim())   errors.push('To Address is required.');
        if (!r.distance)            errors.push('Distance is required.');
        if (!p.weight_kg || Number(p.weight_kg) <= 0) errors.push('Weight must be greater than 0.');
        if (!p.content_description.trim()) errors.push('Content Description is required.');
        return errors;
    };

    // ── Create shipment ───────────────────────────────────────────────────────
    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (errors.length > 0) {
            showDialog('⚠️ Please Fill All Required Fields', errors.map((err, i) => `${i + 1}. ${err}`).join('\n'));
            return;
        }

        setIsSubmitting(true);
        const weightGrams = Number(formData.package.weight_kg) * 1000;

        const payload = {
            service_type_id: formData.service_type_id,
            sender:   { ...formData.sender,   address: formData.receiver.from_address },
            receiver: { ...formData.receiver, address: formData.receiver.to_address, distance: Number(formData.receiver.distance) },
            package:  { weight_grams: weightGrams, content_description: formData.package.content_description, product_type: formData.package.product_type },
        };

        const optimisticId = `optimistic-${Date.now()}`;
        const optimisticEntry = {
            id: optimisticId,
            tracking_number: 'Generating...',
            status: 'draft',
            created_at: new Date().toISOString(),
            receiver_detail: { name: formData.receiver.name, country_code: formData.receiver.country_code, from_address: formData.receiver.from_address, to_address: formData.receiver.to_address, distance: formData.receiver.distance },
            package_detail:  { weight_grams: weightGrams, product_type: formData.package.product_type },
            tracking_events: [],
        };

        setExports(prev => [optimisticEntry, ...prev]);
        setShowCreateModal(false);
        setFormData(EMPTY_FORM);

        try {
            const { ok, body: data } = await apiFetch('customer/exports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (ok && data.status === 'success') {
                setExports(prev => prev.map(e => e.id === optimisticId ? data.data : e));
                fetchExports(); // refresh for full relation data
            } else {
                setExports(prev => prev.filter(e => e.id !== optimisticId));
                const msg = data.errors
                    ? Object.values(data.errors).flat().map((err, i) => `${i + 1}. ${err}`).join('\n')
                    : (data.message || 'Something went wrong.');
                showDialog('Failed to Create', msg);
            }
        } catch (err) {
            console.error(err);
            setExports(prev => prev.filter(e => e.id !== optimisticId));
            showDialog('Network Error', 'Could not reach the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Tracking dialog ───────────────────────────────────────────────────────
    const showTracking = (shipment) => {
        const isPaid = getPaidShipments().includes(shipment.id);
        const dist    = parseFloat(shipment.receiver_detail?.distance || 0);
        const weightKg = (shipment.package_detail?.weight_grams || 0) / 1000;
        const price   = ((dist * 5) + weightKg).toFixed(2);
        const events  = shipment.tracking_events?.map(e => `- ${e.location}: ${e.notes}`).join('\n') || '- Online Portal: Export request draft created.';
        showDialog(
            'Tracking Details',
            `Shipment ID: ${shipment.tracking_number}\nName: ${shipment.receiver_detail?.name || 'N/A'}\nDestination: ${shipment.receiver_detail?.country_code || 'N/A'}\nStatus: ${isPaid ? 'Payment Done' : 'Payment Pending'}\n\n${isPaid ? `✅ Payment of $${price} done.\n` : '⏳ Payment Pending.\n'}Tracking Events:\n${events}`
        );
    };

    // ── Derived values ────────────────────────────────────────────────────────
    const firstName      = user?.name?.split(' ')[0] ?? 'there';
    const totalShipments = exports.length;
    const activeShipments = exports.filter(e => e.status !== 'delivered' && e.status !== 'draft').length;
    const totalDelivered = exports.filter(e => e.status === 'delivered').length;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={`cust-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <Navbar />
            <LoadingOverlay isVisible={loading || isSubmitting} message={isSubmitting ? 'Creating Shipment...' : 'Loading Data...'} />

            <DashboardSidebar
                currentPath={location.pathname}
                onCreateShipment={() => setShowCreateModal(true)}
                onLogout={async () => { await logout(); navigate('/login'); }}
            />

            <div className="cust-main">
                <div className="cust-content">
                    {/* KPIs */}
                    <section className="kpi-row">
                        <KpiCard color="#2563eb" label="Total Shipments" value={totalShipments}
                            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>} />
                        <KpiCard color="#f59e0b" label="Active Shipments" value={activeShipments}
                            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} />
                        <KpiCard color="#16a34a" label="Delivered" value={totalDelivered}
                            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} />
                        <KpiCard color="#8b5cf6" label="Documents" value="0"
                            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
                    </section>

                    {/* Quick Actions */}
                    <section className="cust-section">
                        <h2 className="cust-section__title">Quick Actions</h2>
                        <div className="quick-actions-grid">
                            <QuickAction label="New Shipment"  color="#45DB70" onClick={() => setShowCreateModal(true)}
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>} />
                            <QuickAction label="Track Package" color="#3b82f6" onClick={() => navigate('/customer/track')}
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>} />
                            <QuickAction label="Documents"   color="#f59e0b" onClick={() => navigate('/customer/documents')}
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>} />
                            <QuickAction label="View Invoice"  color="#8b5cf6" onClick={() => navigate('/customer/billing')}
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} />
                        </div>
                    </section>

                    {/* Recent Shipments */}
                    <section className="cust-section">
                        <div className="cust-section__header">
                            <h2 className="cust-section__title">Recent Shipments</h2>
                            <Link to="/customer/my-shipments" className="cust-view-all">View All</Link>
                        </div>
                        <div className="cust-table-wrap">
                            {loading ? (
                                <div className="loading-spinner-container"><div className="spinner" /></div>
                            ) : exports.length === 0 ? (
                                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                                    No shipments found. Create your first shipment!
                                </p>
                            ) : (
                                <table className="cust-table">
                                    <thead>
                                        <tr>
                                            <th>Tracking ID</th>
                                            <th>Receiver &amp; Destination</th>
                                            <th>Status</th>
                                            <th>Weight</th>
                                            <th>Date</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exports.slice(0, 5).map(shipment => (
                                            <ShipmentRow
                                                key={shipment.id}
                                                id={shipment.tracking_number}
                                                name={shipment.receiver_detail?.name || '—'}
                                                destination={
                                                    [shipment.receiver_detail?.from_address, shipment.receiver_detail?.country_code]
                                                        .filter(Boolean).join(' · ') || '—'
                                                }
                                                status={shipment.status?.toLowerCase()}
                                                weight={shipment.package_detail?.weight_grams ? (shipment.package_detail.weight_grams / 1000).toFixed(2) : '0.00'}
                                                date={shipment.created_at}
                                                onTrack={() => showTracking(shipment)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* ── Modals ── */}
            <CreateShipmentModal
                isOpen={showCreateModal}
                isSubmitting={isSubmitting}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateSubmit}
                onCancel={() => setShowCreateModal(false)}
                onShowPrices={() => showDialog('Pricing Charges', 'We charge based on distance and weight:\n\n- Distance: $5 per km\n- Weight: $1 per kg\n\nExample: A 10 kg package sent 5 km costs ($5 × 5) + ($1 × 10) = $35.')}
            />

            <AlertDialog
                isOpen={dialog.isOpen}
                title={dialog.title}
                message={dialog.message}
                onClose={closeDialog}
            />
        </div>
    );
}
