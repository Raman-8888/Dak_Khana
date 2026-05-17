import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { apiFetch } from '../../lib/api';
import './LogisticsPage.css';

const CACHE_KEY = 'dak_exports_cache';

function getCached() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || []; }
  catch { return []; }
}

function setCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); }
  catch {}
}

export default function LogisticsPage() {
  const cached = getCached();
  const [exports, setExports] = useState(cached);
  // If we already have cached data, don't show the loading spinner at all
  const [loading, setLoading] = useState(cached.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    service_type_id: '00000000-0000-0000-0000-000000000000',
    sender: { name: 'Default Sender', address: '123 Main St', city: 'Mumbai', state: 'MH', postal_code: '400001', phone: '9876543210' },
    receiver: { name: '', address: '', city: 'New York', state: 'NY', postal_code: '10001', country_code: '', phone: '' },
    package: { weight_grams: '', content_description: '', declared_value: '' }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async (showRefreshIndicator = true) => {
    if (showRefreshIndicator && getCached().length > 0) setRefreshing(true);
    try {
      const { ok, body } = await apiFetch('customer/exports', { method: 'GET' });
      if (ok && body?.status === 'success') {
        setCache(body.data);
        setExports(body.data);
      }
    } catch (error) {
      console.error('Error fetching exports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build an optimistic placeholder card that shows instantly
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticEntry = {
      id: optimisticId,
      tracking_number: 'Generating...',
      status: 'draft',
      created_at: new Date().toISOString(),
      receiver_detail: { country_code: formData.receiver.country_code, name: formData.receiver.name },
      package_detail: { weight_grams: Number(formData.package.weight_grams) },
      tracking_events: []
    };

    // 1. Close modal & show placeholder card immediately (feels instant)
    setExports(prev => [optimisticEntry, ...prev]);
    setShowModal(false);
    setIsSubmitting(false);

    // 2. Fire the real API call in the background
    try {
      const { ok, body: data } = await apiFetch('customer/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (ok && data.status === 'success') {
        setExports(prev => {
          const next = prev.map(e => e.id === optimisticId ? data.data : e);
          setCache(next);
          return next;
        });
      } else {
        // Rollback — remove the optimistic entry and show error
        setExports(prev => prev.filter(e => e.id !== optimisticId));
        showDialog('Failed to Create', data.message || 'Something went wrong. Please try again.', 'alert');
      }
    } catch (error) {
      console.error('Error creating export:', error);
      setExports(prev => prev.filter(e => e.id !== optimisticId));
      showDialog('Network Error', 'Could not reach the server. Please try again.', 'alert');
    }
  };

  const [dialogState, setDialogState] = useState({ isOpen: false, title: '', message: '', type: 'alert', onConfirm: null });

  const showDialog = (title, message, type = 'alert', onConfirm = null) => {
    setDialogState({ isOpen: true, title, message, type, onConfirm });
  };

  const closeDialog = () => setDialogState({ ...dialogState, isOpen: false });

  const handleDelete = (id) => {
    showDialog('Confirm Deletion', 'Are you sure you want to permanently delete this export request?', 'confirm', async () => {
      // Optimistic update for instant deletion feedback
      setExports(prev => prev.filter(e => e.id !== id));
      
      try {
        const { ok, body: data } = await apiFetch(`customer/exports/${id}`, { method: 'DELETE' });
        if (!ok || data.status !== 'success') {
          showDialog('Error', data.message || 'Failed to delete request', 'alert');
          fetchExports(); // rollback on failure
        }
      } catch (error) {
        console.error('Error deleting export:', error);
        showDialog('Error', 'Network or server error occurred while deleting', 'alert');
        fetchExports(); // rollback on failure
      }
    });
  };

  return (
    <>
      <Navbar />
      <div className="logistics-page">
        {/* ... existing header ... */}
        <div className="logistics-page__header">
          <h1>Dak Ghar Logistics & Export</h1>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}>
            New Export Request
          </button>
        </div>

        <div className="logistics-page__stats">
          <div className="stat-card">
            <span className="stat-card__label">Total Shipments</span>
            <span className="stat-card__value">{exports.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">In Transit</span>
            <span className="stat-card__value">{exports.filter(e => e.status !== 'Pending' && e.status !== 'Delivered').length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Delivered</span>
            <span className="stat-card__value">{exports.filter(e => e.status === 'Delivered').length}</span>
          </div>
        </div>

        <div className="logistics-page__content">
          {refreshing && (
            <div className="refresh-pill">↻ Syncing latest data...</div>
          )}
          {loading ? (
            <div className="shipment-grid">
              {[1,2,3].map(n => (
                <div key={n} className="shipment-card skeleton-card">
                  <div className="skeleton-line skeleton-line--wide" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line--short" />
                </div>
              ))}
            </div>
          ) : (
            <div className="shipment-grid">
              {exports.map(shipment => (
                <div key={shipment.id} className="shipment-card">
                  <div className="shipment-card__header">
                    <span className="tracking-id">{shipment.tracking_number}</span>
                    <span className={`status-badge status--${shipment.status?.toLowerCase().replace('_', '-') || 'pending'}`}>
                      {shipment.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="shipment-card__body">
                    <div className="detail">
                      <label>Destination:</label>
                      <span>{shipment.receiver_detail?.country_code || 'N/A'}</span>
                    </div>
                    <div className="detail">
                      <label>Weight:</label>
                      <span>{shipment.package_detail?.weight_grams ? (shipment.package_detail.weight_grams / 1000).toFixed(2) : '0.00'} kg</span>
                    </div>
                    <div className="detail">
                      <label>Created:</label>
                      <span>{new Date(shipment.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="shipment-card__footer">
                    <button className="btn-text" onClick={() => showDialog('Shipment Details', `Receiver: ${shipment.receiver_detail?.name}\nAddress: ${shipment.receiver_detail?.address}\nStatus: ${shipment.status}`, 'alert')}>View Details</button>
                    <button className="btn-text" onClick={() => showDialog('Tracking Events', `${shipment.tracking_events?.map(e => `- ${e.location}: ${e.notes}`).join('\n') || 'No tracking events yet'}`, 'alert')}>Track</button>
                    <button className="btn-text" style={{color: '#dc2626'}} onClick={() => handleDelete(shipment.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Dialog */}
        {dialogState.isOpen && (
          <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal" style={{ maxWidth: '400px', padding: '30px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{dialogState.title}</h2>
              <p style={{ color: '#475569', marginBottom: '25px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{dialogState.message}</p>
              <div className="modal__actions" style={{ marginTop: 0, justifyContent: 'flex-end' }}>
                {dialogState.type === 'confirm' && (
                  <button className="btn btn--secondary" onClick={closeDialog}>Cancel</button>
                )}
                <button 
                  className={`btn ${dialogState.type === 'confirm' ? 'btn--primary' : 'btn--primary'}`}
                  style={dialogState.type === 'confirm' ? { background: '#dc2626' } : {}}
                  onClick={() => {
                    if (dialogState.onConfirm) dialogState.onConfirm();
                    closeDialog();
                  }}
                >
                  {dialogState.type === 'confirm' ? 'Confirm' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal modal--large">
              <h2>Create Export Request</h2>
              <form onSubmit={handleSubmit} className="export-form">
                <div className="form-section">
                  <h3>Receiver Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text" required
                        value={formData.receiver.name}
                        onChange={(e) => setFormData({...formData, receiver: {...formData.receiver, name: e.target.value}})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Country Code (e.g. US)</label>
                      <input
                        type="text" maxLength="2" required
                        value={formData.receiver.country_code}
                        onChange={(e) => setFormData({...formData, receiver: {...formData.receiver, country_code: e.target.value}})}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="text" required
                        value={formData.receiver.phone}
                        onChange={(e) => setFormData({...formData, receiver: {...formData.receiver, phone: e.target.value}})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text" required
                        value={formData.receiver.address}
                        onChange={(e) => setFormData({...formData, receiver: {...formData.receiver, address: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Package Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight (grams)</label>
                      <input
                        type="number" required
                        value={formData.package.weight_grams}
                        onChange={(e) => setFormData({...formData, package: {...formData.package, weight_grams: e.target.value}})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Declared Value (INR)</label>
                      <input
                        type="number" required
                        value={formData.package.declared_value}
                        onChange={(e) => setFormData({...formData, package: {...formData.package, declared_value: e.target.value}})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Content Description</label>
                    <input
                      type="text" required
                      value={formData.package.content_description}
                      onChange={(e) => setFormData({...formData, package: {...formData.package, content_description: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="modal__actions">
                  <button type="button" className="btn btn--secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
                  <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
