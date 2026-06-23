import React, { useState } from 'react';
import '../../styles/PatientSearch.css';

export default function PatientSearch({ onSearch, onAccessApproved }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [authStatus, setAuthStatus] = useState('none'); // 'none' | 'pending' | 'granted'

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (query === 'GH-ACC-2026-8902' || query.toLowerCase().includes('kwame')) {
      setShowResult(true);
      // Pass the ID up to DoctorDashboard so it loads the data from JSON into state
      onSearch('GH-ACC-2026-8902'); 
    } else {
      alert('Patient record not found on-chain. Try searching "GH-ACC-2026-8902"');
    }
  };

  const triggerAccessRequest = () => {
    setAuthStatus('pending');
  };

  const simulatePatientApproval = () => {
    setAuthStatus('granted');
    // CRITICAL: Tell the parent DoctorDashboard that access is officially open
    onAccessApproved(true); 
  };

  return (
    <div className="card patient-search-card">
      <h3>On-Chain Patient Query Ledger</h3>
      <form onSubmit={handleSearch} className="search-form-row">
        <input 
          type="text" 
          placeholder="Enter Patient Health ID (e.g., GH-ACC-2026-8902)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn-search">Query Registry</button>
      </form>

      {showResult && (
        <div className="search-result-container animate-fade">
          <div className="patient-preview-card">
            <div className="preview-meta">
              <h4>Kwame Mensah</h4>
              <span className="preview-sub">ID: GH-ACC-2026-8902 • Male</span>
            </div>

            {authStatus === 'none' && (
              <div className="auth-action-block">
                <p className="security-notice">⚠️ Vault Encrypted: You do not currently hold an active decryption token for this ledger folder.</p>
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
                <p className="sub-notice">The request has been sent directly to Kwame's portal link.</p>
                <button type="button" onClick={simulatePatientApproval} className="btn-demo-bypass">
                  ⚡ Simulate Patient App Accept (For Presentation Only)
                </button>
              </div>
            )}

            {authStatus === 'granted' && (
              <div className="auth-action-block auth-success">
                <p>✅ <strong>Decryption Token Active:</strong> Temporary access granted. Folder records unlocked.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}