import React from 'react';
import './LoadingOverlay.css';

export default function LoadingOverlay({ isVisible, message = 'Loading...' }) {
    if (!isVisible) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-spinner" />
            {message && <div className="loading-message">{message}</div>}
        </div>
    );
}
