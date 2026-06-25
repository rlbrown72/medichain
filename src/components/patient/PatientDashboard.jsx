import React, { useState, useEffect } from 'react';
import '../../styles/PatientDashboard.css';

export default function PatientDashboard() {
  // SET UP STATES FOR THE LIVE CLOUD DATA
  const [patientRecord, setPatientRecord] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // EFFECT HOOK TO FETCH LIVE RECORD DIRECTLY FROM DYNAMODB
  // EFFECT HOOK TO FETCH LIVE RECORD DIRECTLY FROM DYNAMODB
  useEffect(() => {
    // 1. Define the helper function inside the scope where it is used
    const extractValue = (obj) => {
      if (!obj) return null;
      if (typeof obj !== 'object') return obj;
      return obj.S || obj.N || obj.BOOL || obj.L || obj.M || obj;
    };

    async function loadCloudPatient() {
      try {
        const TARGET_PATIENT_ID = "GH-ACC-2026-8902"; 
        const API_ENDPOINT = `https://s7muqo4m58.execute-api.us-west-2.amazonaws.com/prod/patients/${TARGET_PATIENT_ID}`;
        
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const rawResponse = await response.json();
        
        // FIX: Parse the body string returned by API Gateway
        const data = typeof rawResponse.body === 'string' 
                     ? JSON.parse(rawResponse.body) 
                     : rawResponse.body;

        const historicalEncounters = data.encounters || [];
        
        const latestEncounter = historicalEncounters.length > 0 
          ? historicalEncounters[historicalEncounters.length - 1] 
          : null;

        setPatientRecord({
          fullName: `${data.firstName || 'Unknown'} ${data.lastName || ''}`,
          patientId: data.id || TARGET_PATIENT_ID,
          dob: data.dateOfBirth || "Not Recorded",
          gender: data.gender || "Not Recorded",
          bloodType: data.bloodType || "O+",
          ghanaCard: data.ghanaCardId,
          currentAllergies: data.allergies || ["None Registered"],
          currentActiveMedications: data.currentActiveMedications || [],
          vitals: {
            bp: latestEncounter?.vitals?.bp || "Not Recorded",
            temp: latestEncounter?.vitals?.temp ? `${latestEncounter.vitals.temp}°C` : "36.5°C",
            weight: latestEncounter?.vitals?.weight || "Not Recorded",
            spo2: latestEncounter?.vitals?.spo2 || "Not Recorded"
          },
          encounters: historicalEncounters
        });

      } catch (err) {
        console.error("Cloud lookup error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadCloudPatient();
  }, []); 

  const handleAcceptAccess = () => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const displayFormat = oneWeekLater.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    }) + ' at ' + oneWeekLater.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setExpiryTime(displayFormat);
    setAccessState("granted");
  };

  // Render baseline screen state while fetch completes
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>
        🔄 Loading encrypted medical profile from cloud core...
      </div>
    );
  }

  // Handle fallback state cleanly if table search returns blank
  if (!patientRecord) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#ef4444' }}>
        ⚠️ Medical Record could not be pulled from AWS us-west-2. Verify item attributes in the DynamoDB console.
      </div>
    );
  }

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
            {patientRecord.fullName ? patientRecord.fullName.split(' ').map(n => n[0]).join('') : "PT"}
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

          {/* VITALS PANEL */}
          <div className="card patient-sidebar-summary-card">
            <h3 className="sidebar-section-title">My Latest Vitals</h3>
            <div className="vitals-horizontal-grid">
              <div className="vital-pill-item">
                <span className="v-emoji">💓</span>
                <div className="v-meta"><span className="v-lbl">BP</span><span className="v-val">{patientRecord.vitals.bp}</span></div>
              </div>
              <div className="vital-pill-item">
                <span className="v-emoji">🌡️</span>
                <div className="v-meta"><span className="v-lbl">Temp</span><span className="v-val">{patientRecord.vitals.temp}</span></div>
              </div>
              <div className="vital-pill-item">
                <span className="v-emoji">⚖️</span>
                <div className="v-meta"><span className="v-lbl">Weight</span><span className="v-val">{patientRecord.vitals.weight}</span></div>
              </div>
              <div className="vital-pill-item vital-highlight-pill">
                <span className="v-emoji">🫁</span>
                <div className="v-meta"><span className="v-lbl">SpO2</span><span className="v-val">{patientRecord.vitals.spo2}</span></div>
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
              <h3>Documented Allergies Matrix</h3>
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
                {patientRecord.currentActiveMedications.length > 0 ? (
                  patientRecord.currentActiveMedications.map((med, idx) => (
                    <div key={idx} className="med-pill-row patient-read-pill">
                      <span className="indicator-dot"></span>
                      {med}
                    </div>
                  ))
                ) : (
                  <p style={{color: '#64748b', fontSize: '13px', paddingLeft: '4px'}}>No chronic tracking prescriptions active.</p>
                )}
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
                  {patientRecord.encounters.length === 0 ? (
                    <p style={{ padding: '15px 10px', color: '#64748b', fontSize: '13px' }}>No historical visit logs currently archived on-chain.</p>
                  ) : (
                    patientRecord.encounters.map((encounter, idx) => {
                      const encounterId = encounter.id || encounter.encounterId || idx;
                      const isExpanded = expandedEncounter === encounterId;
                      const encVitals = encounter.vitals || {};
                      
                      return (
                        <div key={encounterId} className={`timeline-item ${isExpanded ? 'card-expanded' : ''}`}>
                          <div className="p-timeline-badge"></div>
                          <div 
                            className="timeline-payload clickable-header" 
                            onClick={() => setExpandedEncounter(isExpanded ? null : encounterId)}
                          >
                            <div className="payload-meta">
                              <div className="encounter-title-group">
                                <h4>{encounter.diagnosis || "General Consultation"}</h4>
                                <span className="attending-doc">Attending: <strong>{encounter.doctorName || "Unknown Doctor"}</strong></span>
                              </div>
                              <div className="facility-right-block">
                                <span className="facility-stamp">
                                  {encounter.date ? encounter.date.split('T')[0] : "N/A"} @ <span className="highlight-facility">Korle Bu Teaching Hospital</span>
                                </span>
                                <span className="expand-indicator">{isExpanded ? 'Collapse ▲' : 'View Details ▼'}</span>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="expanded-encounter-details">
                                <div className="encounter-vitals-strip">
                                  <span className="v-tag">💓 BP: {encVitals.bp || 'N/A'}</span>
                                  <span className="v-tag">🌡️ Temp: {encVitals.temp ? `${encVitals.temp}°C` : 'N/A'}</span>
                                  <span className="v-tag">⚖️ Weight: {encVitals.weight || 'N/A'}</span>
                                  <span className="v-tag">🫁 SpO2: {encVitals.spo2 || 'N/A'}</span>
                                </div>
                                <p className="payload-notes"><strong>Clinical Assessment / Symptoms:</strong> {encounter.symptoms || "No clinical observations documented."}</p>
                                {encounter.comments && (
                                  <p className="payload-notes" style={{marginTop: '6px'}}><strong>Doctor Comments:</strong> <em>{encounter.comments}</em></p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}