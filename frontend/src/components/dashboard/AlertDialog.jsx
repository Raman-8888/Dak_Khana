/**
 * A simple alert/info dialog overlay.
 * Props: isOpen, title, message, onClose
 */
export default function AlertDialog({ isOpen, title, message, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal" style={{ maxWidth: '400px', padding: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{title}</h2>
                <p style={{ color: '#475569', marginBottom: '25px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                    {message}
                </p>
                <div className="modal__actions" style={{ marginTop: 0, justifyContent: 'flex-end' }}>
                    <button className="btn btn--primary" onClick={onClose}>OK</button>
                </div>
            </div>
        </div>
    );
}
