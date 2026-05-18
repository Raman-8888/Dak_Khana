import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Navbar from '../../components/layout/Navbar';
import './AgentDashboard.css';

const SHEET_URL = import.meta.env.VITE_SUPPORT_SHEET_URL;

export default function AgentSupportPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const [form, setForm] = useState({
        name: user?.name || '',
        mobile_no: '',
        email: user?.email || '',
        message: '',
    });
    const [status, setStatus] = useState('idle'); // idle | sending | success | error

    const handleChange = (field, value) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await fetch(SHEET_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    name: form.name,
                    mobile_no: form.mobile_no,
                    email: form.email,
                    message: form.message,
                }),
                mode: 'no-cors',
            });
            setStatus('success');
            setForm({ name: user?.name || '', mobile_no: '', email: user?.email || '', message: '' });
        } catch {
            setStatus('error');
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '10px',
        border: '1px solid #e2e8f0', fontSize: '1rem', fontFamily: 'Inter, sans-serif',
        outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#0f172a',
        transition: 'border-color 0.2s',
    };

    return (
        <>
            <Navbar />
            <div className="agent-dash">
                {/* Top bar matching agent UI style */}
                <header className="agent-topbar" style={{ padding: '15px 30px', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                    <div className="agent-greeting" style={{ margin: 0 }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Support — </span>
                        <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{user?.name?.split(' ')[0] ?? 'Agent'}</strong>
                    </div>
                    <div className="agent-topbar__right">
                        <button className="shift-toggle shift-toggle--on">
                            <span className="shift-dot" />
                            On Duty
                        </button>
                    </div>
                </header>

                <main className="agent-main" style={{ alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '640px' }}>

                        <div style={{ marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                                💬 Agent Support
                            </h2>
                            <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                                Having a problem with a delivery or the platform? Fill in the form and our team will get back to you within 24 hours.
                            </p>
                        </div>

                        {status === 'success' ? (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                                <h3 style={{ color: '#166534', margin: '0 0 8px' }}>Message Sent!</h3>
                                <p style={{ color: '#64748b', margin: 0 }}>We've received your request and will respond within 24 hours.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#45DB70', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '0.9rem' }}>Full Name *</label>
                                        <input style={inputStyle} type="text" required placeholder="Your full name" value={form.name} onChange={e => handleChange('name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '0.9rem' }}>Mobile Number *</label>
                                        <input style={inputStyle} type="tel" required placeholder="e.g. 9876543210" value={form.mobile_no} onChange={e => handleChange('mobile_no', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '0.9rem' }}>Email Address *</label>
                                    <input style={inputStyle} type="email" required placeholder="you@example.com" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '0.9rem' }}>Message *</label>
                                    <textarea style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }} required placeholder="Describe your issue or question..." value={form.message} onChange={e => handleChange('message', e.target.value)} />
                                </div>
                                {status === 'error' && (
                                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem' }}>
                                        Something went wrong. Please try again.
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    style={{ padding: '13px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #45DB70, #2ECC5E)', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: status === 'sending' ? 'not-allowed' : 'pointer', opacity: status === 'sending' ? 0.7 : 1 }}
                                >
                                    {status === 'sending' ? '⏳ Sending...' : '📨 Send Message'}
                                </button>
                            </form>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
