import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import '../customer/CustomerDashboard.css';

const CACHE_KEY = 'dak_exports_cache';
const getCached = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || []; } catch { return []; } };

export default function DocumentsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const cached = getCached();
    const [exports, setExports] = useState(cached);
    const [loading, setLoading] = useState(cached.length === 0);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const firstName = user?.name?.split(' ')[0] ?? 'there';

    useEffect(() => {
        apiFetch('customer/exports', { method: 'GET' })
            .then(({ ok, body }) => {
                if (ok && body?.status === 'success') {
                    setExports(body.data);
                    try { localStorage.setItem(CACHE_KEY, JSON.stringify(body.data)); } catch {}
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const shipments = exports.filter(e =>
        e.package_detail?.image_url || e.package_detail?.document_url
    );

    return (
        <div className={`cust-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <Navbar />
            <LoadingOverlay isVisible={loading} message="Loading Documents..." />

            <DashboardSidebar
                currentPath={location.pathname}
                onCreateShipment={() => navigate('/customer/my-shipments')}
                onLogout={async () => { await logout(); navigate('/login'); }}
            />

            <div className="cust-main">
                <div className="cust-content">
                    <section className="cust-section">
                        <div className="cust-section__header">
                            <h2 className="cust-section__title">📄 My Documents</h2>
                        </div>

                        {loading ? null : shipments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📂</div>
                                <p style={{ fontSize: '1.1rem', margin: 0 }}>No uploaded documents found.</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Upload images or documents when creating a shipment.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                {shipments.map(shipment => (
                                    <div key={shipment.id} style={{
                                        background: '#fff', borderRadius: '16px',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                        border: '1px solid #e2e8f0', overflow: 'hidden',
                                    }}>
                                        {/* Card Header */}
                                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                                                    {shipment.tracking_number}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                                                    {shipment.receiver_detail?.name || '—'} · {shipment.receiver_detail?.country_code || '—'}
                                                </div>
                                            </div>
                                            <span style={{
                                                background: '#dbeafe', color: '#2563eb',
                                                fontSize: '0.75rem', fontWeight: 600,
                                                padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase',
                                            }}>
                                                {shipment.status}
                                            </span>
                                        </div>

                                        {/* Documents */}
                                        <div style={{ padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                            {shipment.package_detail?.image_url && (
                                                <a href={shipment.package_detail.image_url} target="_blank" rel="noopener noreferrer"
                                                    style={{ flex: '1 1 calc(50% - 6px)', minWidth: '120px' }}>
                                                    <img
                                                        src={shipment.package_detail.image_url}
                                                        alt="Package"
                                                        style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'block' }}
                                                    />
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', textAlign: 'center' }}>📷 Package Image</div>
                                                </a>
                                            )}
                                            {shipment.package_detail?.document_url && (
                                                <a href={shipment.package_detail.document_url} target="_blank" rel="noopener noreferrer"
                                                    style={{
                                                        flex: '1 1 calc(50% - 6px)', minWidth: '120px',
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                        justifyContent: 'center', height: '110px',
                                                        background: '#f1f5f9', borderRadius: '10px',
                                                        border: '1px solid #cbd5e1', color: '#3b82f6',
                                                        textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                                                    }}>
                                                    <span style={{ fontSize: '2rem' }}>📄</span>
                                                    <span style={{ marginTop: '6px' }}>View Document</span>
                                                </a>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#94a3b8' }}>
                                            Created: {new Date(shipment.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
