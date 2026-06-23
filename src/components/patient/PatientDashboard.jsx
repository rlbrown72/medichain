import React, { useState } from 'react';
import '../../styles/PatientDashboard.css';
import database from '../../mockData.json';

export default function PatientDashboard() {
  // Target the specific patient key inside your object store
  const targetPatientKey = "GH-ACC-2026-8902";
  const [patientRecord] = useState(database[targetPatientKey]);

  // Extract the latest vitals safely from the most recent encounter (visit-2)
  const latestVitals = patientRecord.encounters[0]?.vitalsSnapshot || { bp: "N/A", temp: "N/A", weight: "N/A" };

  // --- Dynamic UI State Management ---
  const [accessState, setAccessState] = useState("pending"); // "pending" | "granted" | "locked"
  const [expiryTime, setExpiryTime] = useState(null);
  const [expandedEncounter, setExpandedEncounter] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Simulating an incoming doctor request configuration
  const incomingRequest = {
    doctorName: "Dr. Emmanuel Mensah",
    facility: "Korle Bu Teaching Hospital",
    duration: "7 Days"
  };

  const handleAcceptAccess = () => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const displayFormat = oneWeekLater.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    }) + ' at ' + oneWeekLater.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setExpiryTime(displayFormat);
    setAccessState("granted");
  };

  return (
    <div className="patient-viewport">
      {/* Top Navbar Header */}
      <nav className="patient-navbar">
        <div className="brand-group">
          <div className="brand-logo">MediChain</div>
          <span className="pill-badge badge-green">Patient Portal</span>
        </div>
        <div className="patient-profile">
          <span>{patientRecord.fullName}</span>
          <div className="avatar-circle-pat">
            {patientRecord.fullName.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </nav>

      <div className="workspace-grid">
        {/* SIDEBAR PANEL: Permission Shield & Dynamically Pulled Vitals */}
        <aside className="workspace-sidebar">
          
          {/* PRIVACY PROMPT SHIELD CARD */}
          <div className="card privacy-shield-card">
            <div className="shield-header">
              <span className="shield-icon">🛡️</span>
              <h3>Ledger Access Shield</h3>
            </div>

            {accessState === "pending" && (
              <div className="prompt-request-box animate-pulse-subtle">
                <span className="incoming-tag">📥 INCOMING ACCESS REQUEST</span>
                <p className="prompt-text">
                  <strong>{incomingRequest.doctorName}</strong> from <em>{incomingRequest.facility}</em> is requesting temporary authorization to view and update your folder.
                </p>
                <div className="prompt-actions">
                  <button onClick={handleAcceptAccess} className="btn-accept">Accept & Share</button>
                  <button onClick={() => setAccessState("locked")} className="btn-decline">Decline</button>
                </div>
                <span className="helper-disclaimer">Grants a secure {incomingRequest.duration} pass on-chain.</span>
              </div>
            )}

            {accessState === "granted" && (
              <div className="access-active-box">
                <div className="status-indicator">
                  <span className="pulse-dot green"></span>
                  <strong>Access Token Active</strong>
                </div>
                <p className="token-details-text">Authorized: <span>{incomingRequest.doctorName}</span></p>
                <p className="expiry-text">⏰ Auto-Expires: {expiryTime}</p>
                <button onClick={() => setAccessState("locked")} className="btn-revoke">Revoke Pass Instantly</button>
              </div>
            )}

            {accessState === "locked" && (
              <div className="access-locked-box">
                <p className="lock-notice">🔒 Vault Encryption Active. No active external doctor can query your clinical logs.</p>
                <button onClick={() => setAccessState("pending")} className="btn-reset-demo">Reset Demo Request</button>
              </div>
            )}
          </div>

          {/* VITALS PANEL (Now pulling directly from latest encounter in JSON) */}
          <div className="card patient-sidebar-summary-card">
            <h3 className="sidebar-section-title">My Latest Vitals</h3>
            <div className="vitals-horizontal-grid">
              <div className="vital-pill-item">
                <span className="v-emoji">💓</span>
                <div className="v-meta"><span className="v-lbl">BP</span><span className="v-val">{latestVitals.bp}</span></div>
              </div>
              <div className="vital-pill-item">
                <span className="v-emoji">🌡️</span>
                <div className="v-meta"><span className="v-lbl">Temp</span><span className="v-val">{latestVitals.temp}</span></div>
              </div>
              <div className="vital-pill-item vital-highlight-pill">
                <span className="v-emoji">⚖️</span>
                <div className="v-meta"><span className="v-lbl">Weight</span><span className="v-val">{latestVitals.weight}</span></div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN FOLDER CONTENT WINDOW */}
        <main className="workspace-content">
          <div className="card medical-folder-card">
            
            <div className="folder-header">
              <div className="patient-identity">
                <h2>{patientRecord.fullName}</h2>
                <div className="meta-strip">
                  <span>ID: <strong style={{color: '#1e293b'}}>{patientRecord.patientId}</strong></span>
                  <span className="bullet"></span>
                  <span>DOB: {patientRecord.dob}</span>
                  <span className="bullet"></span>
                  <span>Gender: {patientRecord.gender}</span>
                  <span className="bullet"></span>
                  <span>Blood Group: <strong>{patientRecord.bloodType}</strong></span>
                </div>
              </div>
              <span className="status-tag encrypted">🔒 Read-Only Mode</span>
            </div>

            {/* Dynamic Allergies */}
            <div className="data-segment">
              <h3>Documented Allergies</h3>
              <div className="patient-allergy-row-display">
                {patientRecord.currentAllergies.map((allergy, idx) => (
                  <span key={idx} className="mini-med-tag allergy-style-tag">⚠️ {allergy}</span>
                ))}
              </div>
            </div>

            {/* Dynamic Active Medications */}
            <div className="data-segment">
              <h3>Current Active Medications Tracker</h3>
              <div className="meds-inner-list">
                {patientRecord.currentActiveMedications.map((med, idx) => (
                  <div key={idx} className="med-pill-row patient-read-pill">
                    <span className="indicator-dot"></span>
                    {med}
                  </div>
                ))}
              </div>
            </div>

            {/* INTERACTIVE DROPDOWN: Historic Encounters Ledger */}
            <div className="data-segment spec-dropdown-segment">
              <div 
                className={`history-dropdown-bar ${isHistoryOpen ? 'active' : ''}`}
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              >
                <h3>Verified Cross-Facility Medical Records Ledger</h3>
                <span className="dropdown-chevron">{isHistoryOpen ? '▲ Hide Records' : '▼ Expand Records'}</span>
              </div>
              
              {isHistoryOpen && (
                <div className="timeline-container dropdown-animated-content">
                  {patientRecord.encounters.map((encounter) => {
                    const isExpanded = expandedEncounter === encounter.id;
                    return (
                      <div key={encounter.id} className={`timeline-item ${isExpanded ? 'card-expanded' : ''}`}>
                        <div className="p-timeline-badge"></div>
                        <div 
                          className="timeline-payload clickable-header" 
                          onClick={() => setExpandedEncounter(isExpanded ? null : encounter.id)}
                        >
                          <div className="payload-meta">
                            <div className="encounter-title-group">
                              <h4>{encounter.diagnosis}</h4>
                              <span className="attending-doc">Attending: <strong>{encounter.doctorName}</strong></span>
                            </div>
                            <div className="facility-right-block">
                              <span className="facility-stamp">{encounter.date} @ <span className="highlight-facility">{encounter.facility}</span></span>
                              <span className="expand-indicator">{isExpanded ? 'Collapse ▲' : 'View Details ▼'}</span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="expanded-encounter-details">
                              <div className="encounter-vitals-strip">
                                <span className="v-tag">💓 BP: {encounter.vitalsSnapshot.bp}</span>
                                <span className="v-tag">🌡️ Temp: {encounter.vitalsSnapshot.temp}</span>
                                <span className="v-tag">⚖️ Weight: {encounter.vitalsSnapshot.weight}</span>
                              </div>
                              <p className="payload-notes"><strong>Clinical Notes:</strong> {encounter.notes}</p>
                              
                              <div className="visit-dispensed-meds">
                                <span className="meds-label">Prescriptions Issued:</span>
                                <div className="visit-med-tags">
                                  {encounter.medicationsPrescribed.map((med, i) => (
                                    <span key={i} className="mini-med-tag">{med}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}