import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import { useAuthStore } from '../../store/authStore';
import { useLocation, useNavigate } from 'react-router-dom';
import './TrackShipment.css';

export default function TrackShipment() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isCustomerContext = location.pathname.startsWith('/customer');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShipment(null);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/tracking/${trackingNumber}`);
      const data = await response.json();
      
      if (response.ok) {
        setShipment(data.data);
      } else {
        setError('Shipment not found. Please check your tracking number.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="tracking-container">
      <div className="tracking-box">
        <h1>Track Your Shipment</h1>
          <p>Enter your Dak Ghar tracking number to get real-time updates.</p>
          
          <form onSubmit={handleTrack} className="tracking-form">
            <input
              type="text"
              placeholder="DK-XXXXXXXXXX"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>

          {error && <div className="tracking-error">{error}</div>}

          {shipment && (
            <div className="tracking-result">
              <div className="tracking-summary">
                <div className="summary-item">
                  <label>Status</label>
                  <span className={`status-text status--${shipment.status.toLowerCase().replace(' ', '-')}`}>
                    {shipment.status}
                  </span>
                </div>
                <div className="summary-item">
                  <label>Destination</label>
                  <span>{shipment.destination_country}</span>
                </div>
                <div className="summary-item">
                  <label>Weight</label>
                  <span>{shipment.weight} kg</span>
                </div>
              </div>

              <div className="tracking-timeline">
                <h3>History</h3>
                {shipment.shipment_logs.map((log, index) => (
                  <div key={log.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="log-status">{log.status}</span>
                        <span className="log-date">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <div className="log-location">{log.location}</div>
                      {log.message && <div className="log-message">{log.message}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );

  if (isCustomerContext) {
    return (
      <div className="cust-layout">
        <Navbar />
        <DashboardSidebar
            currentPath="/customer/track"
            onCreateShipment={() => navigate('/customer/my-shipments')}
            onLogout={async () => { await logout(); navigate('/login'); }}
        />
        <div className="cust-main">
          {content}
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {content}
    </>
  );
}
