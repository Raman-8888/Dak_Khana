/**
 * Create Shipment modal form.
 *
 * Props:
 *   isOpen        - boolean
 *   isSubmitting  - boolean
 *   formData      - { receiver: {...}, package: {...} }
 *   setFormData   - state setter
 *   onSubmit      - form submit handler
 *   onCancel      - close modal handler
 *   onShowPrices  - show pricing dialog handler
 */
export default function CreateShipmentModal({
    isOpen,
    isSubmitting,
    formData,
    setFormData,
    onSubmit,
    onCancel,
    onShowPrices,
}) {
    if (!isOpen) return null;

    const setReceiver = (field, value) =>
        setFormData(prev => ({ ...prev, receiver: { ...prev.receiver, [field]: value } }));

    const setPkg = (field, value) =>
        setFormData(prev => ({ ...prev, package: { ...prev.package, [field]: value } }));

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
                <h2>Create Export Request</h2>

                <form onSubmit={onSubmit} className="export-form">
                    {/* ── Receiver Details ── */}
                    <div className="form-section">
                        <h3>Receiver Details</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Receiver Name</label>
                                <input
                                    type="text" required
                                    value={formData.receiver.name}
                                    onChange={e => setReceiver('name', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Country Code (e.g. US)</label>
                                <input
                                    type="text" maxLength="2" required
                                    value={formData.receiver.country_code}
                                    onChange={e => setReceiver('country_code', e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Receiver Phone</label>
                                <input
                                    type="text" required
                                    value={formData.receiver.phone}
                                    onChange={e => setReceiver('phone', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Distance (km)</label>
                                <input
                                    type="number" required min="0" step="any"
                                    value={formData.receiver.distance}
                                    onChange={e => setReceiver('distance', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>From Address</label>
                                <input
                                    type="text" required
                                    placeholder="Pickup address"
                                    value={formData.receiver.from_address}
                                    onChange={e => setReceiver('from_address', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>To Address</label>
                                <input
                                    type="text" required
                                    placeholder="Delivery address"
                                    value={formData.receiver.to_address}
                                    onChange={e => setReceiver('to_address', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Package Details ── */}
                    <div className="form-section">
                        <h3>Package Details</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Weight (kg)</label>
                                <input
                                    type="number" required step="any" min="0"
                                    placeholder="e.g. 12.98"
                                    value={formData.package.weight_kg}
                                    onChange={e => setPkg('weight_kg', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Product Type</label>
                                <select
                                    value={formData.package.product_type}
                                    onChange={e => setPkg('product_type', e.target.value)}
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
                                onChange={e => setPkg('content_description', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="modal__actions">
                        <button type="button" className="btn btn--secondary" onClick={onShowPrices}>
                            Show Prices
                        </button>
                        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
