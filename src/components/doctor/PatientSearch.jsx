import React, { useState } from 'react';
import '../../styles/PatientSearch.css';

export default function PatientSearch({ onSearch, onAccessApproved }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [patientIdToUnlock, setPatientIdToUnlock] = useState('');
  const [authStatus, setAuthStatus] = useState('none'); 
  const [checking, setChecking] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    setChecking(true);
    setShowResult(false);
    setAuthStatus('none');
    
    // Safety check: only call if it exists
    if (onAccessApproved) onAccessApproved(false);

    try {
      const API_ENDPOINT = `https://s7muqo4m58.execute-api.us-west-2.amazonaws.com/prod/patients/${cleanQuery}`;
      const response = await fetch(API_ENDPOINT, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Patient record not found in the cloud database.");
        }
        throw new Error("Failed to verify patient folder against cloud registry.");
      }

      setPatientIdToUnlock(cleanQuery);
      setShowResult(true);

    } catch (error) {
      console.error("Registry Verification Error:", error);
      alert(error.message);
    } finally {
      setChecking(false);
    }
  };

  const triggerAccessRequest = () => {
    setAuthStatus('pending');
  };

  const simulatePatientApproval = () => {
    setAuthStatus('granted');
    // Call props safely
    if (onSearch) onSearch(patientIdToUnlock); 
    if (onAccessApproved) onAccessApproved(true); 
  };

  return (
    <div className="card patient-search-card">
      <h3>Patient Query Registry</h3>
      <form onSubmit={handleSearch} className="search-form-row">
        <input 
          type="text" 
          placeholder="Enter Patient ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          disabled={checking}
        />
        <button type="submit" className="btn-search" disabled={checking}>
          {checking ? "Querying..." : "Query Registry"}
        </button>
      </form>

      {showResult && (
        <div className="search-result-container animate-fade">
          <div className="patient-preview-card">
            <div className="preview-meta">
              <h4>File Identity Found</h4>
              <span className="preview-sub">ID: {patientIdToUnlock.toUpperCase()}</span>
            </div>

            {authStatus === 'none' && (
              <div className="auth-action-block">
                <p className="security-notice">⚠️ Vault Encrypted: Requires decryption token.</p>
                <button type="button" onClick={triggerAccessRequest} className="btn-request-access">
                  🔑 Request Access Authorization
                </button>
              </div>
            )}

            {authStatus === 'pending' && (
              <div className="auth-action-block auth-waiting">
                <div className="waiting-spinner-row">
                  <span className="pulse-dot amber"></span>
                  <p><strong>Awaiting Patient Consent...</strong></p>
                </div>
                <button type="button" onClick={simulatePatientApproval} className="btn-demo-bypass">
                  ⚡ Simulate Patient App Accept
                </button>
              </div>
            )}

            {authStatus === 'granted' && (
              <div className="auth-action-block auth-success">
                <p>✅ <strong>Decryption Token Active:</strong> Records unlocked.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}