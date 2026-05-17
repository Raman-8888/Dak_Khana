import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../../components/layout/Navbar';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import { apiFetch } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import MockPaymentGateway from '../../components/payment/MockPaymentGateway';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import './LogisticsPage.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CACHE_KEY = 'dak_exports_cache';

function getCached() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || []; }
  catch { return []; }
}

function setCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); }
  catch {}
}

const getPaidShipments = () => {
  try { return JSON.parse(localStorage.getItem('dak_paid_shipments')) || []; }
  catch { return []; }
};

export default function LogisticsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const cached = getCached();
  const [exports, setExports] = useState(cached);
  // If we already have cached data, don't show the loading spinner at all
  const [loading, setLoading] = useState(cached.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [receiptState, setReceiptState] = useState({ isOpen: false, shipment: null });
  const [detailsState, setDetailsState] = useState({ isOpen: false, shipment: null });
  const [cancelState, setCancelState] = useState({ isOpen: false, shipment: null });
  const [refundState, setRefundState] = useState({ isOpen: false, shipment: null, step: 0 });
  const [paidShipments, setPaidShipments] = useState(getPaidShipments());
  const [paymentGateway, setPaymentGateway] = useState({ isOpen: false, amount: 0, shipmentId: null });
  const [formData, setFormData] = useState({
    service_type_id: '00000000-0000-0000-0000-000000000000',
    sender: { name: 'Default Sender', city: 'Mumbai', state: 'MH', postal_code: '400001', phone: '9876543210', address: '' },
    receiver: { name: '', from_address: '', to_address: '', distance: '', city: 'New York', state: 'NY', postal_code: '10001', country_code: '', phone: '' },
    package: { weight_kg: '', content_description: '', product_type: 'glass' },
    files: { image: null, document: null }
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
        
        // Sync paidShipments state from backend data
        const serverPaidIds = body.data
            .filter(e => e.tracking_events?.some(t => t.status === 'payment_completed'))
            .map(e => e.id);
        if (serverPaidIds.length > 0) {
            setPaidShipments(prev => {
                const combined = Array.from(new Set([...prev, ...serverPaidIds]));
                localStorage.setItem('dak_paid_shipments', JSON.stringify(combined));
                return combined;
            });
        }
      }
    } catch (error) {
      console.error('Error fetching exports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const uploadFile = async (file, folder) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const validateForm = () => {
    const errors = [];

    // Receiver / routing fields
    if (!formData.receiver.name.trim())           errors.push('Receiver Name is required.');
    if (!formData.receiver.country_code.trim())   errors.push('Country Code is required.');
    if (!formData.receiver.phone.trim())          errors.push('Receiver Phone is required.');
    if (!formData.receiver.from_address.trim())   errors.push('From Address is required.');
    if (!formData.receiver.to_address.trim())     errors.push('To Address is required.');
    if (!formData.receiver.distance)              errors.push('Distance is required.');

    // Package fields
    if (!formData.package.weight_kg || Number(formData.package.weight_kg) <= 0)
                                                  errors.push('Weight must be greater than 0.');
    if (!formData.package.content_description.trim())
                                                  errors.push('Content Description is required.');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Client-side validation ──
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showDialog(
        '⚠️ Please Fill All Required Fields',
        validationErrors.map((err, i) => `${i + 1}. ${err}`).join('\n'),
        'alert'
      );
      return; // keep modal open
    }

    setIsSubmitting(true);

    // 1. Upload files first
    let imageUrl = null;
    let documentUrl = null;
    
    try {
        if (formData.files.image) {
            imageUrl = await uploadFile(formData.files.image, 'images');
        }
        if (formData.files.document) {
            documentUrl = await uploadFile(formData.files.document, 'docs');
        }
    } catch (err) {
        console.error("File upload failed", err);
    }

    const weightKg = Number(formData.package.weight_kg);
    const weightGrams = weightKg * 1000;

    const payload = {
        service_type_id: formData.service_type_id,
        sender: {
            ...formData.sender,
            address: formData.receiver.from_address // Use from_address as sender address
        },
        receiver: {
            ...formData.receiver,
            address: formData.receiver.to_address, // Use to_address as receiver address
            distance: Number(formData.receiver.distance)
        },
        package: {
            weight_grams: weightGrams,
            content_description: formData.package.content_description,
            product_type: formData.package.product_type,
            image_url: imageUrl,
            document_url: documentUrl
        }
    };

    // Build an optimistic placeholder card that shows instantly
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticEntry = {
      id: optimisticId,
      tracking_number: 'Generating...',
      status: 'draft',
      created_at: new Date().toISOString(),
      receiver_detail: { 
        name: formData.receiver.name,
        from_address: formData.receiver.from_address,
        to_address: formData.receiver.to_address,
        distance: formData.receiver.distance
      },
      package_detail: { 
        weight_grams: weightGrams,
        product_type: formData.package.product_type,
        image_url: imageUrl,
        document_url: documentUrl
      },
      tracking_events: []
    };

    // Show placeholder card immediately
    setExports(prev => [optimisticEntry, ...prev]);
    setShowModal(false);

    // 2. Fire the real API call in the background
    try {
      const { ok, body: data } = await apiFetch('customer/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (ok && data.status === 'success') {
        setExports(prev => {
          const next = prev.map(e => e.id === optimisticId ? data.data : e);
          setCache(next);
          return next;
        });
      } else {
        // Rollback — remove the optimistic entry
        setExports(prev => prev.filter(e => e.id !== optimisticId));

        // If backend returned validation errors (422), format them nicely
        let friendlyMessage = data.message || 'Something went wrong. Please try again.';
        if (data.errors) {
          const fieldErrors = Object.values(data.errors).flat();
          friendlyMessage = fieldErrors.map((err, i) => `${i + 1}. ${err}`).join('\n');
        }
        showDialog('Failed to Create', friendlyMessage, 'alert');
      }
    } catch (error) {
      console.error('Error creating export:', error);
      setExports(prev => prev.filter(e => e.id !== optimisticId));
      showDialog('Network Error', 'Could not reach the server. Please try again.', 'alert');
    } finally {
        setIsSubmitting(false);
    }
  };

  const [dialogState, setDialogState] = useState({ isOpen: false, title: '', message: '', type: 'alert', onConfirm: null, amount: null, shipmentId: null });

  const showDialog = (title, message, type = 'alert', onConfirm = null, amount = null, shipmentId = null) => {
    setDialogState({ isOpen: true, title, message, type, onConfirm, amount, shipmentId });
  };

  const closeDialog = () => setDialogState({ ...dialogState, isOpen: false });

  const handlePaymentSuccess = async () => {
    try {
        const { ok, body } = await apiFetch(`customer/exports/${paymentGateway.shipmentId}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: paymentGateway.amount })
        });
        if (!ok) {
            console.error("Payment API error", body);
            showDialog('Error', 'Payment failed to process on server.', 'alert');
            return;
        }
    } catch (e) {
        console.error("Payment API error", e);
        showDialog('Error', 'Payment API network error.', 'alert');
        return;
    }
    
    const nextPaid = [...paidShipments, paymentGateway.shipmentId];
    setPaidShipments(nextPaid);
    localStorage.setItem('dak_paid_shipments', JSON.stringify(nextPaid));
    
    // Refresh the exports from the server to get updated status and payments
    try {
        const { ok, body } = await apiFetch('customer/exports', { method: 'GET' });
        if (ok && body?.status === 'success') {
            setExports(body.data);
            setCache(body.data);
        }
    } catch (e) {
        console.error("Error refreshing exports after payment", e);
    }
    
    showDialog('Success', 'Payment completed successfully!', 'payment_success', null, paymentGateway.amount, paymentGateway.shipmentId);
    setPaymentGateway({ isOpen: false, amount: 0, shipmentId: null });
  };

  const handleDownloadReceipt = (shipment) => {
    if (!shipment) return;
    const dist = parseFloat(shipment.receiver_detail?.distance || 0);
    const weightKg = shipment.package_detail?.weight_grams ? (shipment.package_detail.weight_grams / 1000) : 0;
    const total = ((dist * 5) + (weightKg * 1)).toFixed(2);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Receipt - ${shipment.tracking_number}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; max-width: 600px; margin: 0 auto; }
          h1 { color: #16a34a; font-size: 24px; margin-bottom: 5px; }
          h2 { color: #475569; font-size: 18px; margin-top: 0; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #334155; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
          th { font-weight: 600; color: #64748b; background: #f8fafc; }
          .total { font-weight: 800; font-size: 1.2rem; color: #0f172a; }
        </style>
      </head>
      <body>
        <h1>Dak Ghar Logistics & Export</h1>
        <h2>Official Payment Receipt</h2>
        <div class="row"><strong>Tracking Number:</strong> <span>${shipment.tracking_number}</span></div>
        <div class="row"><strong>Date:</strong> <span>${new Date().toLocaleString()}</span></div>
        <div class="row"><strong>Receiver:</strong> <span>${shipment.receiver_detail?.name || 'N/A'}</span></div>
        
        <table>
          <tr><th>Description</th><th style="text-align:right;">Amount</th></tr>
          <tr><td>Distance Charge (${dist} km)</td><td style="text-align:right;">$${(dist*5).toFixed(2)}</td></tr>
          <tr><td>Weight Charge (${weightKg.toFixed(2)} kg)</td><td style="text-align:right;">$${(weightKg*1).toFixed(2)}</td></tr>
          <tr><td class="total">Total Paid</td><td class="total" style="text-align:right;">$${total}</td></tr>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
  };

  const confirmCancel = async () => {
    setIsSubmitting(true);
    const shipment = cancelState.shipment;
    try {
      const { ok, body } = await apiFetch(`customer/exports/${shipment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (ok && body.status === 'success') {
        setExports(prev => {
          const next = prev.map(e => e.id === shipment.id ? { ...e, status: 'cancelled' } : e);
          setCache(next);
          return next;
        });
        setCancelState({ isOpen: false, shipment: null });
      } else {
        showDialog('Error', 'Failed to cancel delivery.');
      }
    } catch (e) {
      showDialog('Error', 'Network error while canceling delivery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRefundProcess = (shipment) => {
    setRefundState({ isOpen: true, shipment, step: 0 });
    
    const steps = [1, 2, 3, 4];
    steps.forEach((step, index) => {
      setTimeout(() => {
        setRefundState(prev => {
          if (!prev.isOpen) return prev;
          
          if (step === 4) {
            setExports(exportsPrev => {
               const next = exportsPrev.map(e => e.id === shipment.id ? { ...e, status: 'refunded' } : e);
               setCache(next);
               return next;
            });
            setTimeout(() => setRefundState(r => ({ ...r, isOpen: false })), 2000);
          }
          return { ...prev, step };
        });
      }, (index + 1) * 2000);
    });
  };

  const showTracking = (shipment) => {
    const isPaid = paidShipments.includes(shipment.id);
    const dist = parseFloat(shipment.receiver_detail?.distance || 0);
    const weightKg = shipment.package_detail?.weight_grams ? (shipment.package_detail.weight_grams / 1000) : 0;
    const price = ((dist * 5) + (weightKg * 1)).toFixed(2);
    
    let events = isPaid 
        ? `✅ Payment of $${price} done successfully.\n` 
        : `⏳ Payment Pending.\n`;
        
    events += shipment.tracking_events?.map(e => `- ${e.location}: ${e.notes}`).join('\n') || '- Online Portal: Export request draft created.';

    showDialog('Tracking Events', `Shipment ID: ${shipment.tracking_number}\nName: ${shipment.receiver_detail?.name || 'N/A'}\nDestination: ${shipment.receiver_detail?.country_code || 'N/A'}\nStatus: ${isPaid ? 'Payment Done' : 'Payment Pending'}\n\nTracking Events:\n${events}`, 'alert');
  };

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
    <div className="cust-layout">
      <LoadingOverlay isVisible={loading || isSubmitting} message={isSubmitting ? 'Creating Shipment...' : 'Loading...'} />
      <Navbar />
      <DashboardSidebar
          currentPath="/customer/my-shipments"
          onCreateShipment={() => setShowModal(true)}
          onLogout={async () => { await logout(); navigate('/login'); }}
      />
      <div className="cust-main">
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
              {exports.map(shipment => {
                const isDimmed = shipment.status === 'delivered' || shipment.status === 'refunded';
                return (
                <div key={shipment.id} className={`shipment-card ${isDimmed ? 'card--dimmed' : ''}`}>
                  <div className="shipment-card__header">
                    <span className="tracking-id">{shipment.tracking_number}</span>
                    <span className={`status-badge status--${shipment.status?.toLowerCase().replace('_', '-') || 'pending'}`}>
                      {shipment.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="shipment-card__body">
                    <div className="detail">
                      <label>Receiver:</label>
                      <span>{shipment.receiver_detail?.name || 'N/A'}</span>
                    </div>
                    <div className="detail">
                      <label>From:</label>
                      <span>{shipment.receiver_detail?.from_address || shipment.sender_detail?.address || 'N/A'}</span>
                    </div>
                    <div className="detail">
                      <label>To:</label>
                      <span>{shipment.receiver_detail?.to_address || shipment.receiver_detail?.address || 'N/A'}</span>
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
                  <div className="shipment-card__footer" style={{flexWrap: 'wrap'}}>
                    <button className="btn-text" onClick={() => setDetailsState({ isOpen: true, shipment })}>View Details</button>
                    <button className="btn-text" onClick={() => showTracking(shipment)}>Track</button>
                    {!paidShipments.includes(shipment.id) ? (
                      <button className="btn-text" style={{color: '#16a34a'}} onClick={() => {
                        const dist = parseFloat(shipment.receiver_detail?.distance || 0);
                        const weightKg = shipment.package_detail?.weight_grams ? (shipment.package_detail.weight_grams / 1000) : 0;
                        const price = (dist * 5) + (weightKg * 1);
                        showDialog('Payment Due', `The total amount due for this shipment is $${price.toFixed(2)}.`, 'payment', () => {
                            setPaymentGateway({ isOpen: true, amount: price, shipmentId: shipment.id });
                        });
                      }}>Payment</button>
                    ) : (
                      <button className="btn-text" style={{color: '#16a34a', fontWeight: 'bold'}} onClick={() => setReceiptState({ isOpen: true, shipment })}>View Receipt</button>
                    )}
                    
                    {shipment.status === 'delivered' ? (
                      <span style={{color: '#16a34a', fontWeight: 'bold', fontSize: '0.85rem', padding: '0.5rem'}}>Delivered Successfully</span>
                    ) : shipment.status === 'refunded' ? (
                      <span style={{color: '#16a34a', fontWeight: 'bold', fontSize: '0.85rem', padding: '0.5rem'}}>Refund Successfully</span>
                    ) : shipment.status === 'cancelled' ? (
                      <button className="btn-text" style={{color: '#f59e0b'}} onClick={() => startRefundProcess(shipment)}>Refund Progress</button>
                    ) : (shipment.status === 'in_transit' || shipment.status === 'assigned') ? (
                      <button className="btn-text" style={{color: '#dc2626'}} onClick={() => setCancelState({ isOpen: true, shipment })}>Cancel Delivery</button>
                    ) : (
                      <button className="btn-text" style={{color: '#dc2626'}} onClick={() => handleDelete(shipment.id)}>Delete</button>
                    )}
                  </div>
                </div>
              )})}
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
                {(dialogState.type === 'confirm' || dialogState.type === 'payment') && (
                  <button className="btn btn--secondary" style={dialogState.type === 'payment' ? { color: '#dc2626', background: '#fee2e2' } : {}} onClick={closeDialog}>Cancel</button>
                )}
                
                {dialogState.type === 'payment_success' ? (
                  <>
                    <button className="btn btn--secondary" onClick={() => {
                        const ship = exports.find(s => s.id === dialogState.shipmentId);
                        closeDialog();
                        setReceiptState({ isOpen: true, shipment: ship });
                    }}>View Receipt</button>
                    <button className="btn btn--secondary" onClick={() => {
                        const ship = exports.find(s => s.id === dialogState.shipmentId);
                        handleDownloadReceipt(ship);
                    }}>Download PDF</button>
                    <button className="btn btn--primary" onClick={closeDialog}>Done</button>
                  </>
                ) : (
                  <button 
                    className={`btn ${dialogState.type === 'confirm' ? 'btn--primary' : 'btn--primary'}`}
                    style={dialogState.type === 'confirm' ? { background: '#dc2626' } : dialogState.type === 'payment' ? { background: '#16a34a' } : {}}
                    onClick={() => {
                      if (dialogState.onConfirm) dialogState.onConfirm();
                      closeDialog();
                    }}
                  >
                    {dialogState.type === 'confirm' ? 'Confirm' : dialogState.type === 'payment' ? 'Pay Now' : 'OK'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
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
                      <label>From Address</label>
                      <input
                        type="text" required
                        value={formData.receiver.from_address}
                        onChange={(e) => setFormData({...formData, receiver: {...formData.receiver, from_address: e.target.value}})}
                      />
                    </div>
                    <div className="form-group">
                      <label>To Address</label>
                      <input
                        type="text" required
                        value={formData.receiver.to_address}
                        onChange={(e) => setFormData({...formData, receiver: {...formData.receiver, to_address: e.target.value}})}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Distance (km)</label>
                      <input
                        type="number" required
                        value={formData.receiver.distance}
                        onChange={(e) => setFormData({...formData, receiver: {...formData.receiver, distance: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Package Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number" required
                        value={formData.package.weight_kg}
                        onChange={(e) => setFormData({...formData, package: {...formData.package, weight_kg: e.target.value}})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Product Type</label>
                      <select 
                        value={formData.package.product_type}
                        onChange={(e) => setFormData({...formData, package: {...formData.package, product_type: e.target.value}})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#fff' }}
                      >
                        <option value="glass">Glass</option>
                        <option value="books">Books</option>
                        <option value="household">Household</option>
                        <option value="clothes">Clothes</option>
                        <option value="electronics">Electronics</option>
                        <option value="other">Other</option>
                      </select>
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
                  <div className="form-row">
                    <div className="form-group">
                        <label>Upload Image</label>
                        <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, files: {...formData.files, image: e.target.files[0]}})} />
                    </div>
                    <div className="form-group">
                        <label>Upload Document</label>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFormData({...formData, files: {...formData.files, document: e.target.files[0]}})} />
                    </div>
                  </div>
                </div>

                <div className="modal__actions">
                  <button type="button" className="btn btn--secondary" onClick={() => {
                      const weightKg = Number(formData.package.weight_kg) || 0;
                      const dist = Number(formData.receiver.distance) || 0;
                      const price = (dist * 5) + (weightKg * 1);
                      showDialog('Pricing Charges', `Based on your inputs:\n- Distance (${dist}km x $5): $${dist*5}\n- Weight (${weightKg}kg x $1): $${weightKg*1}\n\nTotal Estimated: $${price.toFixed(2)}`, 'alert');
                  }}>Show Prices</button>
                  <button type="button" className="btn btn--secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
                  <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {paymentGateway.isOpen && (
          <MockPaymentGateway 
            amount={paymentGateway.amount}
            onCancel={() => setPaymentGateway({ isOpen: false, amount: 0, shipmentId: null })}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {receiptState.isOpen && receiptState.shipment && (
          <div className="modal-overlay" style={{zIndex: 2500}}>
            <div className="modal" style={{maxWidth: '450px', padding: '0'}}>
              <div style={{background: '#f8fafc', padding: '20px', borderBottom: '1px solid #e2e8f0'}}>
                <h2 style={{margin: 0, color: '#0f172a', fontSize: '1.25rem'}}>Payment Receipt</h2>
              </div>
              <div style={{padding: '24px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{color: '#64748b'}}>Tracking ID</span>
                  <strong style={{color: '#0f172a'}}>{receiptState.shipment.tracking_number}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{color: '#64748b'}}>Date</span>
                  <span style={{color: '#0f172a'}}>{new Date().toLocaleDateString()}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                  <span style={{color: '#64748b'}}>Status</span>
                  <span style={{color: '#16a34a', fontWeight: 'bold'}}>Paid Successfully</span>
                </div>

                <div style={{background: '#f1f5f9', borderRadius: '12px', padding: '16px', marginBottom: '24px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <span>Distance ({receiptState.shipment.receiver_detail?.distance || 0} km)</span>
                        <span>${(parseFloat(receiptState.shipment.receiver_detail?.distance||0)*5).toFixed(2)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <span>Weight ({receiptState.shipment.package_detail?.weight_grams ? receiptState.shipment.package_detail.weight_grams/1000 : 0} kg)</span>
                        <span>${(parseFloat(receiptState.shipment.package_detail?.weight_grams||0)/1000*1).toFixed(2)}</span>
                    </div>
                    <hr style={{border: 'none', borderTop: '1px dashed #cbd5e1', margin: '12px 0'}} />
                    <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem'}}>
                        <span>Total Paid</span>
                        <span>${((parseFloat(receiptState.shipment.receiver_detail?.distance||0)*5) + (parseFloat(receiptState.shipment.package_detail?.weight_grams||0)/1000*1)).toFixed(2)}</span>
                    </div>
                </div>

                <div className="modal__actions" style={{marginTop: 0, justifyContent: 'space-between'}}>
                  <button className="btn btn--secondary" onClick={() => handleDownloadReceipt(receiptState.shipment)}>Download PDF</button>
                  <button className="btn btn--primary" onClick={() => setReceiptState({isOpen: false, shipment: null})}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Details Modal */}
        {detailsState.isOpen && detailsState.shipment && (
          <div className="modal-overlay" style={{zIndex: 2500}}>
            <div className="modal" style={{maxWidth: '550px', padding: '0'}}>
              <div style={{background: '#f8fafc', padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2 style={{margin: 0, color: '#0f172a', fontSize: '1.25rem'}}>Shipment Details</h2>
                <span className={`status-badge status--${detailsState.shipment.status?.toLowerCase().replace('_', '-') || 'pending'}`}>
                    {detailsState.shipment.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div style={{padding: '24px', maxHeight: '70vh', overflowY: 'auto'}}>
                
                <h3 style={{fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px'}}>Routing Information</h3>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{color: '#64748b'}}>Tracking ID</span>
                  <strong style={{color: '#0f172a'}}>{detailsState.shipment.tracking_number}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{color: '#64748b'}}>Created At</span>
                  <span style={{color: '#0f172a'}}>{new Date(detailsState.shipment.created_at).toLocaleString()}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{color: '#64748b'}}>From</span>
                  <span style={{color: '#0f172a', textAlign: 'right', maxWidth: '60%'}}>{detailsState.shipment.receiver_detail?.from_address || detailsState.shipment.sender_detail?.address || 'N/A'}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{color: '#64748b'}}>To</span>
                  <span style={{color: '#0f172a', textAlign: 'right', maxWidth: '60%'}}>{detailsState.shipment.receiver_detail?.to_address || detailsState.shipment.receiver_detail?.address || 'N/A'}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                  <span style={{color: '#64748b'}}>Distance</span>
                  <span style={{color: '#0f172a'}}>{detailsState.shipment.receiver_detail?.distance || 0} km</span>
                </div>

                <h3 style={{fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px'}}>Package Information</h3>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{color: '#64748b'}}>Receiver</span>
                  <span style={{color: '#0f172a'}}>{detailsState.shipment.receiver_detail?.name || 'N/A'}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{color: '#64748b'}}>Product Type</span>
                  <span style={{color: '#0f172a', textTransform: 'capitalize'}}>{detailsState.shipment.package_detail?.product_type || 'N/A'}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{color: '#64748b'}}>Weight</span>
                  <span style={{color: '#0f172a'}}>{detailsState.shipment.package_detail?.weight_grams ? (detailsState.shipment.package_detail.weight_grams / 1000).toFixed(2) : '0.00'} kg</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                  <span style={{color: '#64748b'}}>Description</span>
                  <span style={{color: '#0f172a', textAlign: 'right', maxWidth: '60%'}}>{detailsState.shipment.package_detail?.content_description || 'N/A'}</span>
                </div>

                {(detailsState.shipment.package_detail?.image_url || detailsState.shipment.package_detail?.document_url) && (
                    <>
                        <h3 style={{fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px'}}>Attached Documents</h3>
                        <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px'}}>
                            {detailsState.shipment.package_detail?.image_url && (
                                <div style={{flex: '1 1 calc(50% - 15px)', minWidth: '150px'}}>
                                    <span style={{display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px'}}>Package Image</span>
                                    <a href={detailsState.shipment.package_detail.image_url} target="_blank" rel="noopener noreferrer">
                                        <img src={detailsState.shipment.package_detail.image_url} alt="Package" style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                                    </a>
                                </div>
                            )}
                            {detailsState.shipment.package_detail?.document_url && (
                                <div style={{flex: '1 1 calc(50% - 15px)', minWidth: '150px'}}>
                                    <span style={{display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px'}}>Export Document</span>
                                    <a href={detailsState.shipment.package_detail.document_url} target="_blank" rel="noopener noreferrer" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold'}}>
                                        📄 View Document
                                    </a>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className="modal__actions" style={{marginTop: 0, justifyContent: 'flex-end'}}>
                  <button className="btn btn--primary" onClick={() => setDetailsState({isOpen: false, shipment: null})}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Delivery Modal */}
        {cancelState.isOpen && (
          <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal" style={{ maxWidth: '400px', padding: '30px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Cancel Delivery</h2>
              <p style={{ color: '#475569', marginBottom: '25px', lineHeight: '1.5' }}>
                Are you sure you want to cancel the delivery for shipment <strong>{cancelState.shipment?.tracking_number}</strong>?<br/><br/>
                This action will notify the assigned delivery agent.
              </p>
              <div className="modal__actions">
                <button className="btn btn--secondary" onClick={() => setCancelState({ isOpen: false, shipment: null })} disabled={isSubmitting}>Back</button>
                <button className="btn btn--danger" onClick={() => handleCancel(cancelState.shipment.id)} disabled={isSubmitting}>
                  {isSubmitting ? 'Canceling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Refund Progress Modal */}
        {refundState.isOpen && (
          <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal refund-progress-modal" style={{ maxWidth: '450px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Refund Progress</h2>
              
              <div className="refund-timeline" style={{ textAlign: 'left', padding: '10px 20px' }}>
                <div className={`refund-step ${refundState.step >= 1 ? 'completed' : refundState.step === 0 ? 'active' : ''}`}>
                  <span style={{ fontSize: '1.5rem' }}>{refundState.step >= 1 ? '✅' : '⏳'}</span>
                  Refund Initialized
                </div>
                <div className={`refund-step ${refundState.step >= 2 ? 'completed' : refundState.step === 1 ? 'active' : ''}`}>
                  <span style={{ fontSize: '1.5rem' }}>{refundState.step >= 2 ? '✅' : '⏳'}</span>
                  Refund Verification
                </div>
                <div className={`refund-step ${refundState.step >= 3 ? 'completed' : refundState.step === 2 ? 'active' : ''}`}>
                  <span style={{ fontSize: '1.5rem' }}>{refundState.step >= 3 ? '✅' : '⏳'}</span>
                  Refund to {user?.name?.split(' ')[0] || 'Customer'} Proceeded
                </div>
                <div className={`refund-step ${refundState.step >= 4 ? 'completed' : refundState.step === 3 ? 'active' : ''}`}>
                  <span style={{ fontSize: '1.5rem' }}>{refundState.step >= 4 ? '✅' : '⏳'}</span>
                  Refund Confirmed
                </div>
              </div>
              
              {refundState.step < 4 && (
                 <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>Processing securely. Please wait...</p>
              )}
            </div>
          </div>
        )}

      </div>
      </div>
    </div>
  );
}
