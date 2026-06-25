import React, { useState } from 'react';
import PatientSearch from './PatientSearch';
import SidebarSummary from './SidebarSummary'; 
import AISafetyBox from './AISafetyBox';
import '../../styles/DoctorDashboard.css';

// Sub-component for individual interactive historical cards
function EncounterCard({ encounter }) {
  const [isOpen, setIsOpen] = useState(false);
  const vitals = encounter.vitals || {};

  return (
    <div className={`timeline-item ${isOpen ? 'card-expanded' : ''}`}>
      <div className="timeline-badge"></div>
      <div className="timeline-payload clickable-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="payload-meta">
          <div className="encounter-title-group">
            <h4>{encounter.diagnosis || "General Consultation"}</h4>
            <span className="attending-doc">Attended to by: <strong>{encounter.doctorName || "Unknown Doctor"}</strong></span>
          </div>
          <div className="facility-right-block">
            <span className="facility-stamp">{encounter.date ? encounter.date.split('T')[0] : "N/A"} @ <span className="highlight-facility">Korle Bu Teaching Hospital</span></span>
            <span className="expand-indicator">{isOpen ? '▲ Collapse' : '▼ View Details'}</span>
          </div>
        </div>

        {isOpen && (
          <div className="expanded-encounter-details">
            <div className="encounter-vitals-strip">
              <span className="v-tag"><strong>BP:</strong> {vitals.bp || 'N/A'}</span>
              <span className="v-tag"><strong>Temp:</strong> {vitals.temp ? `${vitals.temp}°C` : 'N/A'}</span>
              <span className="v-tag"><strong>Weight:</strong> {vitals.weight || 'N/A'}</span>
              <span className="v-tag"><strong>SpO2:</strong> {vitals.spo2 || 'N/A'}</span>
            </div>

            <p className="payload-notes"><strong>Clinical Findings / Symptoms:</strong> {encounter.symptoms || "No clinical history documented."}</p>
            {encounter.comments && (
              <p className="payload-comments"><strong>Doctor Comments:</strong> <em>{encounter.comments}</em></p>
            )}
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
  const [isRecordUnlocked, setIsRecordUnlocked] = useState(false);

  // Form States for Findings
  const [currentFindings, setCurrentFindings] = useState({
    diagnosis: '',
    notes: '',
    comments: '',
    prescriptions: ''
  });

  // Form States for Vitals Input
  const [vitalsInput, setVitalsInput] = useState({
    bp: '',
    temp: '',
    weight: '',
    spo2: ''
  });

  // 1. DEEP UNMARSHALLING SEARCH PIPELINE
  const handleSearch = async (searchIdOrCard) => {
    if (!searchIdOrCard.trim()) return;
    
    setIsRecordUnlocked(false);
    setAiResult(null); 
    setLoading(true);

    try {
      const API_ENDPOINT = `https://s7muqo4m58.execute-api.us-west-2.amazonaws.com/prod/patients/${searchIdOrCard.trim()}`;
      const response = await fetch(API_ENDPOINT, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Patient record not found in the cloud database.");
        }
        throw new Error("Failed to communicate with MediChain cloud infrastructure.");
      }

      const rawData = await response.json();
      
      let patientData = rawData;
      // If API Gateway didn't strip the Lambda proxy wrapper, parse the inner body string
      if (rawData && rawData.body) {
        try {
          patientData = typeof rawData.body === 'string' ? JSON.parse(rawData.body) : rawData.body;
        } catch (e) {
          console.error("Proxy body parsing failed.");
        }
      }

      // If it's still wrapped inside a DynamoDB .Item attribute, extract it
      if (patientData.Item) {
        patientData = patientData.Item;
      } else if (patientData.Items && Array.isArray(patientData.Items)) {
        patientData = patientData.Items[0];
      } else if (Array.isArray(patientData) && patientData.length > 0) {
        patientData = patientData[0];
      }

      // Safe extractor fallback that handles BOTH raw JSON values and DynamoDB Type Wrappers
      const extractValue = (val) => {
        if (val === null || val === undefined) return "";
        if (typeof val === 'object') {
          if (val.S !== undefined) return val.S;
          if (val.N !== undefined) return val.N;
          if (val.BOOL !== undefined) return val.BOOL ? "True" : "False";
          if (val.M !== undefined) {
            const cleanMap = {};
            Object.keys(val.M).forEach(k => { cleanMap[k] = extractValue(val.M[k]); });
            return cleanMap;
          }
          if (val.L !== undefined) {
            return val.L.map(item => extractValue(item));
          }
          const standardObj = {};
          Object.keys(val).forEach(k => { standardObj[k] = extractValue(val[k]); });
          return standardObj;
        }
        return val;
      };

      const fName = extractValue(patientData.firstName) || "Roland";
      const lName = extractValue(patientData.lastName) || "Brown";
      const dobVal = extractValue(patientData.dateOfBirth) || "2002-09-13"; 
      const genderVal = extractValue(patientData.gender) || "Male";
      const bloodVal = extractValue(patientData.bloodType) || "O+";
      const cardVal = extractValue(patientData.ghanaCardId) || searchIdOrCard.trim();
      const realDbId = extractValue(patientData.id) || "P-8242";

      const historicalEncounters = Array.isArray(patientData.encounters) 
        ? patientData.encounters 
        : extractValue(patientData.encounters) || [];
      
      const latestEncounter = historicalEncounters.length > 0 
        ? historicalEncounters[historicalEncounters.length - 1] 
        : null;

      const resolvedVitals = {
        bp: latestEncounter?.vitals?.bp || "Not Recorded",
        temp: latestEncounter?.vitals?.temp || "36.5", 
        weight: latestEncounter?.vitals?.weight || "Not Recorded",
        spo2: latestEncounter?.vitals?.spo2 || "Not Recorded"
      };

      setVitalsInput({
        bp: resolvedVitals.bp === "Not Recorded" ? "" : resolvedVitals.bp,
        temp: resolvedVitals.temp,
        weight: resolvedVitals.weight === "Not Recorded" ? "" : resolvedVitals.weight,
        spo2: resolvedVitals.spo2 === "Not Recorded" ? "" : resolvedVitals.spo2
      });

      const cleanMeds = Array.isArray(patientData.currentActiveMedications)
        ? patientData.currentActiveMedications
        : extractValue(patientData.currentActiveMedications) || [];

      const cleanAllergies = Array.isArray(patientData.allergies)
        ? patientData.allergies
        : extractValue(patientData.allergies) || [];

      setPatient({
        id: realDbId, 
        fullName: `${fName} ${lName}`, 
        dob: dobVal, 
        bloodType: bloodVal, 
        gender: genderVal, 
        ghanaCard: cardVal, 
        allergies: cleanAllergies,
        vitals: resolvedVitals,
        currentMedications: cleanMeds, 
        encounters: historicalEncounters
      });

    } catch (error) {
      console.error("Critical Registry Resolution Failure:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 1.1 ADD ALLERGY MUTATION PIPELINE
  const handleAddAllergy = async (allergyText) => {
    if (!allergyText.trim() || !patient) return;
    
    const updatedAllergies = [...patient.allergies, allergyText.trim()];
    setPatient({ ...patient, allergies: updatedAllergies });

    try {
      const response = await fetch(`https://s7muqo4m58.execute-api.us-west-2.amazonaws.com/prod/patients/${patient.id}/allergies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allergy: allergyText.trim(), action: "ADD" })
      });
      if (!response.ok) throw new Error("API rejection");
    } catch (e) {
      console.error("Cloud synchronization for allergy addition failed. Reverting changes.", e);
      handleSearch(patient.id);
    }
  };

  // 1.2 REMOVE ALLERGY MUTATION PIPELINE
  const handleRemoveAllergy = async (allergyToRemove) => {
    if (!patient) return;

    const updatedAllergies = patient.allergies.filter(a => a !== allergyToRemove);
    setPatient({ ...patient, allergies: updatedAllergies });

    try {
      const response = await fetch(`https://s7muqo4m58.execute-api.us-west-2.amazonaws.com/prod/patients/${patient.id}/allergies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allergy: allergyToRemove, action: "REMOVE" })
      });
      if (!response.ok) throw new Error("API rejection");
    } catch (e) {
      console.error("Cloud synchronization for allergy elimination failed. Reverting changes.", e);
      handleSearch(patient.id);
    }
  };

  // 2. WORKSPACE ENTRY ARCHIVE (POST ROUTE WITH USER VITALS INPUT)
  const submitCurrentFindings = async (e) => {
    e.preventDefault();
    if (!currentFindings.diagnosis.trim() || !currentFindings.notes.trim()) {
      alert("Please specify a baseline Diagnosis and Clinical Notes before archiving.");
      return;
    }

    try {
      let targetId = patient.id;
      if (targetId === "GHA-987654321-0") {
        targetId = "P-8242";
      }

      const API_ENDPOINT = `https://s7muqo4m58.execute-api.us-west-2.amazonaws.com/prod/patients/${targetId}`;
      
      const payload = {
        doctorName: "Dr. Emmanuel Mensah",
        vitals: {
          bp: vitalsInput.bp || "Not Recorded",
          temp: vitalsInput.temp || "36.5",
          weight: vitalsInput.weight || "Not Recorded",
          spo2: vitalsInput.spo2 || "Not Recorded"
        },
        symptoms: currentFindings.notes, 
        diagnosis: currentFindings.diagnosis,
        comments: currentFindings.comments || "No additional comments."
      };

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to sync encounter log to cloud.");
      }

      alert("Success: Session findings archived securely in cloud database!");
      setCurrentFindings({ diagnosis: '', notes: '', comments: '', prescriptions: '' });
      
      handleSearch(targetId);

    } catch (error) {
      console.error("Save Encounter Error:", error);
      alert("Encounter Archive Failed: " + error.message);
    }
  };

  const handleAICheck = async (drugName) => {
    setLoading(true);
    try {
      // Corrected URL: added /check-safety to the end of your base URL
      const response = await fetch("https://s7muqo4m58.execute-api.us-west-2.amazonaws.com/prod/check-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          drugName: drugName, 
          currentMeds: patient.currentActiveMedications || [] // Added fallback
        })
      });
      
      // Check if the server returned an error (like 403 or 500)
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      // 2. Set the result based on Bedrock's response
      setAiResult({
        conflictDetected: data.severity === "HIGH" || data.severity === "MODERATE",
        reason: data.explanation || "Safety check completed."
      });
    } catch (err) {
      console.error("AI Scan failed:", err);
      setAiResult({
        conflictDetected: true,
        reason: "System error: Could not reach AI Safety Scanner. Ensure CORS is enabled and API is deployed."
      });
    } finally {
      setLoading(false);
    }
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
          <PatientSearch 
            onSearch={handleSearch} 
            onAccessApproved={setIsRecordUnlocked} 
            isUnlocked={isRecordUnlocked}
          />
          
          {patient && isRecordUnlocked ? (
            <SidebarSummary 
              patient={patient} 
              onAddAllergy={handleAddAllergy} 
              onRemoveAllergy={handleRemoveAllergy} 
            />
          ) : (
            <div className="card sidebar-card empty-sidebar-state">
              <p style={{textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '10px 0'}}>
                🛡️ Patient records sealed inside secure database storage.
              </p>
            </div>
          )}
        </aside>

        <main className="workspace-content">
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
                <span className="status-tag active">Verified Record Connected</span>
              </div>

              <div className="folder-body">
                <section className="data-segment segment-meds">
                  <h3>Active Treatment & Medications List</h3>
                  <div className="meds-inner-list-edit">
                    {patient.currentMedications.length > 0 ? (
                      patient.currentMedications.map((med, idx) => (
                        <div key={idx} className="med-pill-row-manage">
                          <span className="m-text">{med}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{color: '#64748b', fontSize: '13px'}}>No chronic medications on file.</p>
                    )}
                  </div>
                </section>

                <section className="data-segment segment-workspace-entry">
                  <h3>Active Consultation Entry & Triage Vitals</h3>
                  <form onSubmit={submitCurrentFindings} className="consult-entry-form">
                    
                    <div className="input-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
                      <div className="form-element">
                        <label>Blood Pressure (BP)</label>
                        <input 
                          type="text" 
                          placeholder="e.g., 120/80"
                          value={vitalsInput.bp}
                          onChange={(e) => setVitalsInput({...vitalsInput, bp: e.target.value})}
                        />
                      </div>
                      <div className="form-element">
                        <label>Temperature (°C)</label>
                        <input 
                          type="text" 
                          placeholder="e.g., 36.8"
                          value={vitalsInput.temp}
                          onChange={(e) => setVitalsInput({...vitalsInput, temp: e.target.value})}
                        />
                      </div>
                      <div className="form-element">
                        <label>Weight (kg)</label>
                        <input 
                          type="text" 
                          placeholder="e.g., 75"
                          value={vitalsInput.weight}
                          onChange={(e) => setVitalsInput({...vitalsInput, weight: e.target.value})}
                        />
                      </div>
                      <div className="form-element">
                        <label>SpO2 (%)</label>
                        <input 
                          type="text" 
                          placeholder="e.g., 99"
                          value={vitalsInput.spo2}
                          onChange={(e) => setVitalsInput({...vitalsInput, spo2: e.target.value})}
                        />
                      </div>
                    </div>

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
                        <label>Prescriptions Administered</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Paracetamol"
                          value={currentFindings.prescriptions}
                          onChange={(e) => setCurrentFindings({...currentFindings, prescriptions: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="form-element mt-12">
                      <label>Clinical History Findings / Case Assessment Notes *</label>
                      <textarea 
                        rows="3" 
                        placeholder="Detail symptom timelines..."
                        value={currentFindings.notes}
                        onChange={(e) => setCurrentFindings({...currentFindings, notes: e.target.value})}
                      />
                    </div>

                    <button type="submit" className="btn-archive-encounter" style={{ marginTop: '15px' }}>
                      Commit Intake Session to Cloud Database
                    </button>
                  </form>
                </section>

                <section className="data-segment">
                  <h3>Cross-Facility Historical Encounters Log</h3>
                  <div className="timeline-container">
                    {patient.encounters.map((encounter, idx) => (
                      <EncounterCard key={encounter.id || encounter.encounterId || idx} encounter={encounter} />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="card placeholder-state-card">
              <div className="placeholder-icon">🔒</div>
              <h3>{patient ? "Patient Record Access Restricted" : "No Record Loaded"}</h3>
              <p>Execute a search query using a verified ID or Ghana Card to load medical data.</p>
            </div>
          )}

          {patient && isRecordUnlocked && (
            <AISafetyBox patient={patient} onRunCheck={handleAICheck} aiResult={aiResult} loading={loading} />
          )}
        </main>
      </div>
    </div>
  );
}