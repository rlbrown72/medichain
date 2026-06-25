import React, { useState } from 'react';

export default function PrivacyShield() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("Dr. Emmanuel Mensah (Korle Bu)");
  const [expiryTime, setExpiryTime] = useState(null);

  const grantOneWeekAccess = () => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const displayFormat = oneWeekLater.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    }) + ' at ' + oneWeekLater.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setExpiryTime(displayFormat);
    setAccessGranted(true);
  };

  return (
    <div className="card privacy-shield-card animate-fade">
      <div className="shield-header">
        <span className="shield-icon">{accessGranted ? "🔓" : "🔒"}</span>
        <h3>Ledger Access Shield</h3>
      </div>
      <p className="shield-desc" style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
        Control which providers can look into or add intake notes to your decentralized folder.
      </p>

      {accessGranted ? (
        <div className="access-active-box">
          <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span className="pulse-dot green"></span>
            <strong style={{ color: '#16a34a' }}>Live Access Token Active</strong>
          </div>
          <p className="token-text" style={{ fontSize: '14px', margin: '4px 0' }}>Authorized: <strong style={{ color: '#1e293b' }}>{selectedDoctor}</strong></p>
          <p className="expiry-text" style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 12px 0' }}>⏰ Auto-Expires: {expiryTime}</p>
          <button onClick={() => setAccessGranted(false)} className="btn-revoke" style={{ width: '100%' }}>
            Revoke Instantly
          </button>
        </div>
      ) : (
        <div className="access-locked-box">
          <p className="lock-notice" style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
            Your health vault is encrypted. No outside facility can query your logs.
          </p>
          <div className="form-element" style={{ marginBottom: '12px' }}>
            <label className="select-label" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              Select Attending Physician
            </label>
            <select 
              className="modern-select" 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="Dr. Emmanuel Mensah (Korle Bu)">Dr. Emmanuel Mensah — Korle Bu</option>
              <option value="Dr. Abigail Forster (Accra Central)">Dr. Abigail Forster — Accra Central</option>
              <option value="Emergency Trauma Desk (37 Military)">Emergency Desk — 37 Military</option>
            </select>
          </div>
          <button onClick={grantOneWeekAccess} className="btn-grant" style={{ width: '100%' }}>
            Authorize Doctor (1 Week Pass)
          </button>
        </div>
      )}
    </div>
  );
}