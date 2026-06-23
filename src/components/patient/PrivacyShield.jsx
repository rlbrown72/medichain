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
    <div className="privacy-shield-card">
      <div className="shield-header">
        <span className="shield-icon">{accessGranted ? "🔓" : "🔒"}</span>
        <h3>Ledger Access Shield</h3>
      </div>
      <p className="shield-desc">Control which providers can look into or add intake notes to your decentralized folder.</p>

      {accessGranted ? (
        <div className="access-active-box">
          <div className="status-indicator">
            <span className="pulse-dot green"></span>
            <strong>Live Access Token Active</strong>
          </div>
          <p className="token-text">Authorized: <span>{selectedDoctor}</span></p>
          <p className="expiry-text">⏰ Auto-Expires: {expiryTime}</p>
          <button onClick={() => setAccessGranted(false)} className="btn-revoke">Revoke Instantly</button>
        </div>
      ) : (
        <div className="access-locked-box">
          <p className="lock-notice">Your health vault is encrypted. No outside facility can query your logs.</p>
          <label className="select-label">Select Attending Physician</label>
          <select className="modern-select" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
            <option value="Dr. Emmanuel Mensah (Korle Bu)">Dr. Emmanuel Mensah — Korle Bu</option>
            <option value="Dr. Abigail Forster (Accra Central)">Dr. Abigail Forster — Accra Central</option>
            <option value="Emergency Trauma Desk (37 Military)">Emergency Desk — 37 Military</option>
          </select>
          <button onClick={grantOneWeekAccess} className="btn-grant">Authorize Doctor (1 Week Pass)</button>
        </div>
      )}
    </div>
  );
}