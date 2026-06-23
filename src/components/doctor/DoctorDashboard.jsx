import React, { useState } from 'react';
import mockDatabase from '../../mockData.json';
import PatientSearch from './PatientSearch';
import AISafetyBox from './AISafetyBox';
import '../../styles/DoctorDashboard.css';

// Sub-component for individual interactive historical cards
function EncounterCard({ encounter }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`timeline-item ${isOpen ? 'card-expanded' : ''}`}>
      <div className="timeline-badge"></div>
      <div className="timeline-payload clickable-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="payload-meta">
          <div className="encounter-title-group">
            <h4>{encounter.diagnosis}</h4>
            <span className="attending-doc">Attended to by: <strong>{encounter.doctorName}</strong></span>
          </div>
          <div className="facility-right-block">
            <span className="facility-stamp">{encounter.date} @ <span className="highlight-facility">{encounter.facility}</span></span>
            <span className="expand-indicator">{isOpen ? '▲ Collapse' : '▼ View Details'}</span>
          </div>
        </div>

        {isOpen && (
          <div className="expanded-encounter-details">
            <div className="encounter-vitals-strip">
              <span className="v-tag"><strong>BP:</strong> {encounter.vitalsSnapshot.bp}</span>
              <span className="v-tag"><strong>Temp:</strong> {encounter.vitalsSnapshot.temp}</span>
              <span className="v-tag"><strong>Weight:</strong> {encounter.vitalsSnapshot.weight}</span>
              <span className="v-tag"><strong>SpO2:</strong> {encounter.vitalsSnapshot.spo2 || '98%'}</span>
            </div>

            <p className="payload-notes"><strong>Clinical Findings:</strong> {encounter.notes}</p>
            {encounter.comments && (
              <p className="payload-comments"><strong>Doctor Comments:</strong> <em>{encounter.comments}</em></p>
            )}
            
            <div className="visit-dispensed-meds">
              <span className="meds-label">Medications Administered:</span>
              <div className="visit-med-tags">
                {encounter.medicationsPrescribed.map((m, i) => (
                  <span key={i} className="mini-med-tag">{m}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const [patient, setPatient] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- THE SECURITY GATEKEEPER STATE ---
  // Controls if access token passport has been fully granted by patient
  const [isRecordUnlocked, setIsRecordUnlocked] = useState(false);

  // States for Editable Fields
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [newMedInput, setNewMedInput] = useState('');
  
  // Vitals Editing States
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({ bp: '', temp: '', weight: '', spo2: '' });

  // Current Doctor New Findings Form States
  const [currentFindings, setCurrentFindings] = useState({
    diagnosis: '',
    notes: '',
    comments: '',
    prescriptions: ''
  });

  const handleSearch = (id) => {
    // Reset permissions gate whenever a fresh search query is fired
    setIsRecordUnlocked(false);
    setAiResult(null); 
    
    const data = mockDatabase[id];
    if (data) {
      const latestEncounter = data.encounters && data.encounters.length > 0 ? data.encounters[0] : null;
      
      setPatient({
        fullName: data.fullName,
        dob: data.dob,
        bloodType: data.bloodType,
        gender: data.gender,
        ghanaCard: data.ghanaCard,
        allergies: data.currentAllergies || [],
        vitals: data.vitals || (latestEncounter ? { ...latestEncounter.vitalsSnapshot, spo2: latestEncounter.vitalsSnapshot.spo2 || '98%' } : { bp: "120/80 mmHg", temp: "36.7°C", weight: "75 kg", spo2: "98%" }),
        currentMedications: data.currentActiveMedications || [],
        encounters: data.encounters || []
      });

      // Initialize vitals form
      if (latestEncounter) {
        setVitalsForm({
          bp: latestEncounter.vitalsSnapshot.bp,
          temp: latestEncounter.vitalsSnapshot.temp,
          weight: latestEncounter.vitalsSnapshot.weight,
          spo2: latestEncounter.vitalsSnapshot.spo2 || '98%'
        });
      }
    } else {
      alert("Patient record not found. Use mock ID: GH-ACC-2026-8902");
    }
  };

  // Allergy Modification Handlers
  const addAllergy = (e) => {
    e.preventDefault();
    if (!newAllergyInput.trim()) return;
    setPatient({ ...patient, allergies: [...patient.allergies, newAllergyInput.trim()] });
    setNewAllergyInput('');
  };

  const removeAllergy = (indexToRemove) => {
    const updated = patient.allergies.filter((_, idx) => idx !== indexToRemove);
    setPatient({ ...patient, allergies: updated });
  };

  // Active Medication Stack Modification Handlers
  const addMedication = (e) => {
    e.preventDefault();
    if (!newMedInput.trim()) return;
    setPatient({ ...patient, currentMedications: [...patient.currentMedications, newMedInput.trim()] });
    setNewMedInput('');
  };

  const removeMedication = (indexToRemove) => {
    const updated = patient.currentMedications.filter((_, idx) => idx !== indexToRemove);
    setPatient({ ...patient, currentMedications: updated });
  };

  // Save Vitals Update Handler
  const handleVitalsSave = (e) => {
    e.preventDefault();
    setPatient({ ...patient, vitals: { ...vitalsForm } });
    setIsEditingVitals(false);
  };

  // Logging current session doctor findings to list history layout
  const submitCurrentFindings = (e) => {
    e.preventDefault();
    if (!currentFindings.diagnosis.trim() || !currentFindings.notes.trim()) {
      alert("Please specify a baseline Diagnosis and Clinical Notes before archiving.");
      return;
    }

    const medArray = currentFindings.prescriptions
      ? currentFindings.prescriptions.split(',').map(m => m.trim())
      : [];

    const newEncounterInstance = {
      id: `visit-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      facility: "Korle Bu Teaching Hospital",
      doctorName: "Dr. Emmanuel Mensah",
      vitalsSnapshot: { ...patient.vitals },
      diagnosis: currentFindings.diagnosis,
      notes: currentFindings.notes,
      comments: currentFindings.comments,
      medicationsPrescribed: medArray
    };

    setPatient({
      ...patient,
      encounters: [newEncounterInstance, ...patient.encounters],
      currentMedications: medArray.length > 0 ? [...patient.currentMedications, ...medArray] : patient.currentMedications
    });

    setCurrentFindings({ diagnosis: '', notes: '', comments: '', prescriptions: '' });
    alert("Success: Session findings archived and synced to MediChain ledger.");
  };

  const handleAICheck = (drugName) => {
    setLoading(true);
    setTimeout(() => {
      const inputLower = drugName.toLowerCase();
      const hasPenicillinAllergy = patient.allergies.some(a => a.toLowerCase().includes('penicillin'));
      const hasSulfaAllergy = patient.allergies.some(a => a.toLowerCase().includes('sulfa'));

      if ((inputLower.includes('amoxicillin') || inputLower.includes('penicillin')) && hasPenicillinAllergy) {
        setAiResult({
          conflictDetected: true,
          reason: "CRITICAL ALERT: Dynamic lookup detects an active Penicillin allergy badge on this file. Amoxicillin exposure risk: Anaphylactic Shock. Action: DENIED."
        });
      } else if (inputLower.includes('co-trimoxazole') && hasSulfaAllergy) {
        setAiResult({
          conflictDetected: true,
          reason: "CRITICAL ALERT: Dynamic lookup detects an active Sulfa allergy badge on this file. Co-Trimoxazole contains sulfonamide and is contraindicated. Action: DENIED."
        });
      } else {
        setAiResult({
          conflictDetected: false,
          reason: `No interaction conflicts or known allergic matching found between "${drugName}" and current records. Safe to proceed with dispensing.`
        });
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="app-viewport">
      <header className="main-navbar">
        <div className="brand-group">
          <div className="brand-logo">MediChain</div>
          <span className="pill-badge badge-cyan">Ghana's Medical Cloud Core</span>
        </div>
        <div className="doctor-meta-profile">
          <div className="avatar-circle">DM</div>
          <div className="profile-text">
            <span className="doc-name">Dr. Emmanuel Mensah</span>
            <span className="doc-sub">Senior Consultant Cardiologist</span>
          </div>
          <div className="location-tag"><span className="pulse-dot"></span>Korle Bu Teaching Hospital</div>
          <span className="pill-badge badge-red font-mono">MVP Build</span>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="workspace-sidebar">
          {/* Enhanced Patient Search with structural callback handling */}
          <PatientSearch 
            onSearch={handleSearch} 
            onAccessApproved={setIsRecordUnlocked} 
            isUnlocked={isRecordUnlocked}
          />
          
          {/* SIDEBAR PANEL: Interactive Vitals & Allergies Manager - Only Visible when Unlocked */}
          {patient && isRecordUnlocked && (
            <div className="card sidebar-card animate-fade">
              
              {/* Dynamic Allergy Section */}
              <div className="section-block">
                <h3>Critical Allergies Matrix</h3>
                <div className="allergy-container">
                  {patient.allergies.map((allergy, index) => (
                    <span key={index} className="allergy-badge deleteable">
                      {allergy}
                      <button onClick={() => removeAllergy(index)} className="btn-badge-del">×</button>
                    </span>
                  ))}
                </div>
                <form onSubmit={addAllergy} className="mini-inline-form">
                  <input 
                    type="text" 
                    placeholder="Add allergy..." 
                    value={newAllergyInput}
                    onChange={(e) => setNewAllergyInput(e.target.value)}
                  />
                  <button type="submit">+</button>
                </form>
              </div>
              
              <hr className="divider" />
              
              {/* Dynamic Triage Vitals Section */}
              <div className="section-block">
                <div className="split-block-header">
                  <h3>Triage Vitals Metrics</h3>
                  <button onClick={() => setIsEditingVitals(!isEditingVitals)} className="btn-text-link">
                    {isEditingVitals ? '✕ Close' : '✏️ EDIT'}
                  </button>
                </div>

                {isEditingVitals ? (
                  <form onSubmit={handleVitalsSave} className="vitals-edit-form">
                    <div className="f-row">
                      <label>💓 BP:</label>
                      <input type="text" value={vitalsForm.bp} onChange={(e) => setVitalsForm({...vitalsForm, bp: e.target.value})} />
                    </div>
                    <div className="f-row">
                      <label>🌡️ Temp (°C):</label>
                      <input type="text" value={vitalsForm.temp} onChange={(e) => setVitalsForm({...vitalsForm, temp: e.target.value})} />
                    </div>
                    <div className="f-row">
                      <label>⚖️ Weight:</label>
                      <input type="text" value={vitalsForm.weight} onChange={(e) => setVitalsForm({...vitalsForm, weight: e.target.value})} />
                    </div>
                    <div className="f-row">
                      <label>🫁 SpO2 (%):</label>
                      <input type="text" value={vitalsForm.spo2} onChange={(e) => setVitalsForm({...vitalsForm, spo2: e.target.value})} />
                    </div>
                    <button type="submit" className="btn-vitals-save">Save Snapshot</button>
                  </form>
                ) : (
                  <div className="vitals-horizontal-grid">
                    <div className="vital-pill-item">
                      <span className="v-emoji">💓</span>
                      <div className="v-meta">
                        <span className="v-lbl">BP</span>
                        <span className="v-val">{patient.vitals.bp}</span>
                      </div>
                    </div>
                    
                    <div className="vital-pill-item">
                      <span className="v-emoji">🌡️</span>
                      <div className="v-meta">
                        <span className="v-lbl">Temp</span>
                        <span className="v-val">{patient.vitals.temp}</span>
                      </div>
                    </div>

                    <div className="vital-pill-item">
                      <span className="v-emoji">⚖️</span>
                      <div className="v-meta">
                        <span className="v-lbl">Weight</span>
                        <span className="v-val">{patient.vitals.weight}</span>
                      </div>
                    </div>

                    <div className="vital-pill-item vital-highlight-pill">
                      <span className="v-emoji">🫁</span>
                      <div className="v-meta">
                        <span className="v-lbl">SpO2</span>
                        <span className="v-val">{patient.vitals.spo2}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
          
          {/* Informational baseline helper state if record is locked */}
          {patient && !isRecordUnlocked && (
            <div className="card sidebar-card empty-sidebar-state">
              <p style={{textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '10px 0'}}>
                🛡️ Vitals metrics sealed inside decentralized storage node.
              </p>
            </div>
          )}
        </aside>

        <main className="workspace-content">
          {/* ONLY SHOW FULL BODY DATA WORKFLOWS IF RECORD IS UNLOCKED */}
          {patient && isRecordUnlocked ? (
            <div className="card medical-folder-card animate-fade">
              <div className="folder-header">
                <div className="patient-identity">
                  <h2 className="fullname">{patient.fullName}</h2>
                  <div className="meta-strip">
                    <span><strong>DOB:</strong> {patient.dob}</span>
                    <span className="bullet"></span>
                    <span><strong>Sex:</strong> {patient.gender}</span>
                    <span className="bullet"></span>
                    <span><strong>National ID:</strong> {patient.ghanaCard}</span>
                    <span className="bullet"></span>
                    <span><strong>Blood Type:</strong> {patient.bloodType}</span>
                  </div>
                </div>
                <span className="status-tag active">Decrypted Record Connected</span>
              </div>

              <div className="folder-body">
                
                {/* SECTION 1: Dynamic Active Treatment Stack */}
                <section className="data-segment segment-meds">
                  <h3>Global Active Medications Stack</h3>
                  <div className="meds-inner-list-edit">
                    {patient.currentMedications.map((med, idx) => (
                      <div key={idx} className="med-pill-row-manage">
                        <span className="m-text">{med}</span>
                        <button onClick={() => removeMedication(idx)} className="btn-med-del">x</button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={addMedication} className="meds-append-form">
                    <input 
                      type="text" 
                      placeholder="Type alternative chronic prescription medication to track..." 
                      value={newMedInput} 
                      onChange={(e) => setNewMedInput(e.target.value)}
                    />
                    <button type="submit">Add Medication</button>
                  </form>
                </section>

                {/* SECTION 2: Current Session Case Findings Input Block */}
                <section className="data-segment segment-workspace-entry">
                  <h3>Active Consultation Entry (Your Findings)</h3>
                  <form onSubmit={submitCurrentFindings} className="consult-entry-form">
                    <div className="input-grid-2">
                      <div className="form-element">
                        <label>Primary Diagnosis / Impression *</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Acute Hypertension Crisis"
                          value={currentFindings.diagnosis}
                          onChange={(e) => setCurrentFindings({...currentFindings, diagnosis: e.target.value})}
                        />
                      </div>
                      <div className="form-element">
                        <label>Prescriptions Administered This Visit (Please Seperate by Commas)</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Amlodipine 5mg, Paracetamol"
                          value={currentFindings.prescriptions}
                          onChange={(e) => setCurrentFindings({...currentFindings, prescriptions: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="form-element mt-12">
                      <label>Clinical History Findings / Case Assessment Notes *</label>
                      <textarea 
                        rows="3" 
                        placeholder="Detail symptom timelines, review of cardiovascular/respiratory indicators or imaging metrics..."
                        value={currentFindings.notes}
                        onChange={(e) => setCurrentFindings({...currentFindings, notes: e.target.value})}
                      />
                    </div>

                    <div className="form-element mt-12">
                      <label>Extra Internal Comments / Discretionary Notes</label>
                      <textarea 
                        rows="2" 
                        placeholder="Add secondary operational remarks, follow-up dates, or diagnostic requests..."
                        value={currentFindings.comments}
                        onChange={(e) => setCurrentFindings({...currentFindings, comments: e.target.value})}
                      />
                    </div>

                    <button type="submit" className="btn-archive-encounter">
                      Commit Intake Session to Cloud History
                    </button>
                  </form>
                </section>

                {/* SECTION 3: Cross-Facility Timeline Logs */}
                <section className="data-segment">
                  <h3>Cross-Facility Historical Encounters Ledger</h3>
                  <p className="helper-caption">Click a record card below to investigate diagnostic historical footprints.</p>
                  <div className="timeline-container">
                    {patient.encounters.map((encounter) => (
                      <EncounterCard key={encounter.id} encounter={encounter} />
                    ))}
                  </div>
                </section>

              </div>
            </div>
          ) : (
            /* LOCKED CONTAINER / NO PATIENT PLACEHOLDER CARD */
            <div className="card placeholder-state-card">
              <div className="placeholder-icon">🔒</div>
              <h3>{patient ? "Patient Data Encrypted" : "No Record Loaded"}</h3>
              <p>
                {patient 
                  ? `Found record for ${patient.fullName}. Please execute an access authorization request to view historical health footprints.`
                  : "Execute a query using a verified patient ID  to load  health record."
                }
              </p>
            </div>
          )}

          {/* Render the AI check segment only if full access token is active */}
          {patient && isRecordUnlocked && (
            <AISafetyBox patient={patient} onRunCheck={handleAICheck} aiResult={aiResult} loading={loading} />
          )}
        </main>
      </div>
    </div>
  );
}