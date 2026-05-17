const STATUS_META = {
    delivered:  { label: 'Delivered',  color: '#16a34a', bg: '#dcfce7' },
    in_transit: { label: 'In Transit', color: '#2563eb', bg: '#dbeafe' },
    processing: { label: 'Processing', color: '#d97706', bg: '#fef3c7' },
    pending:    { label: 'Pending',    color: '#64748b', bg: '#f1f5f9' },
    on_hold:    { label: 'On Hold',    color: '#dc2626', bg: '#fee2e2' },
    failed:     { label: 'Failed',     color: '#ef4444', bg: '#fee2e2' },
    draft:      { label: 'Draft',      color: '#475569', bg: '#e2e8f0' },
    cancelled:  { label: 'Cancelled',  color: '#991b1b', bg: '#fee2e2' },
    refunded:   { label: 'Refunded',   color: '#166534', bg: '#f0fdf4' },
    assigned:   { label: 'Assigned',   color: '#3730a3', bg: '#e0e7ff' },
};

export default function ShipmentRow({ id, name, destination, status, date, weight, onTrack }) {
    const s = STATUS_META[status] ?? {
        label: status?.replace('_', ' ') || 'Unknown',
        color: '#64748b',
        bg: '#f1f5f9',
    };

    return (
        <tr className="shipment-row">
            <td className="shipment-id">{id}</td>
            <td>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>{name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{destination}</div>
            </td>
            <td>
                <span className="status-pill" style={{ background: s.bg, color: s.color }}>
                    {s.label}
                </span>
            </td>
            <td className="shipment-meta">{weight} kg</td>
            <td className="shipment-meta">{new Date(date).toLocaleDateString()}</td>
            <td>
                <button className="track-link" onClick={onTrack}>Track →</button>
            </td>
        </tr>
    );
}
