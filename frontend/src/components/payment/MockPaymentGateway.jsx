import { useState, useEffect } from 'react';
import './MockPaymentGateway.css';

export default function MockPaymentGateway({ amount, onCancel, onSuccess }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [method, setMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '', expiry: '', cvv: '', name: '',
    accountNumber: '', ifsc: ''
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      onCancel();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onCancel]);

  const handlePay = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      onSuccess();
    }, 500); // fast mock — real gateway would take longer
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="mpg-overlay">
      <div className="mpg-container">
        <div className="mpg-header">
          <div className="mpg-logo">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#2563eb"/></svg>
            <span>Dak Ghar Secure Pay</span>
          </div>
          <div className="mpg-timer">
            ⏱ {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="mpg-body">
          <div className="mpg-amount-box">
            <span className="mpg-amount-label">Amount to Pay</span>
            <span className="mpg-amount-value">${amount.toFixed(2)}</span>
          </div>

          <div className="mpg-methods">
            <button type="button" className={`mpg-method-btn ${method === 'card' ? 'active' : ''}`} onClick={() => setMethod('card')}>Credit/Debit Card</button>
            <button type="button" className={`mpg-method-btn ${method === 'bank' ? 'active' : ''}`} onClick={() => setMethod('bank')}>Bank Transfer</button>
          </div>

          <form onSubmit={handlePay} className="mpg-form">
            {method === 'card' && (
              <>
                <div className="mpg-form-group">
                  <label>Card Number</label>
                  <input type="text" maxLength="19" placeholder="XXXX XXXX XXXX XXXX" required 
                         value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div className="mpg-form-row">
                  <div className="mpg-form-group">
                    <label>Expiry Date</label>
                    <input type="text" maxLength="5" placeholder="MM/YY" required 
                           value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} />
                  </div>
                  <div className="mpg-form-group">
                    <label>CVV</label>
                    <input type="password" maxLength="4" placeholder="123" required 
                           value={formData.cvv} onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})} />
                  </div>
                </div>
                <div className="mpg-form-group">
                  <label>Cardholder Name</label>
                  <input type="text" placeholder="John Doe" required 
                         value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </>
            )}

            {method === 'bank' && (
              <>
                <div className="mpg-form-group">
                  <label>Account Number</label>
                  <input type="text" placeholder="000123456789" required 
                         value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div className="mpg-form-group">
                  <label>Routing / IFSC Code</label>
                  <input type="text" placeholder="ABCD0123456" required 
                         value={formData.ifsc} onChange={e => setFormData({...formData, ifsc: e.target.value})} />
                </div>
              </>
            )}

            <div className="mpg-actions">
              <button type="button" className="mpg-btn mpg-btn-cancel" onClick={onCancel} disabled={isProcessing}>Cancel Payment</button>
              <button type="submit" className="mpg-btn mpg-btn-pay" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
              </button>
            </div>
          </form>
          
          <div className="mpg-footer">
            🔒 Payments are secured and encrypted. This is a demo gateway.
          </div>
        </div>
      </div>
    </div>
  );
}
