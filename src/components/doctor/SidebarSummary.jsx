import React, { useState, useEffect } from 'react';

export default function SidebarSummary({ patient, onAddAllergy, onRemoveAllergy }) {
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({ bp: '', temp: '', weight: '', spo2: '' });
  const [localVitals, setLocalVitals] = useState({ bp: 'Not Recorded', temp: 'Not Recorded', weight: 'Not Recorded', spo2: 'Not Recorded' });
  
  // State for typing a new allergy
  const [newAllergyInput, setNewAllergyInput] = useState('');

  // Sync with incoming patient record data
  useEffect(() => {
    if (patient) {
      const vitals = patient.vitals || (patient.encounters && patient.encounters[0]?.vitals) || {};
      
      setLocalVitals({
        bp: vitals.bp || 'Not Recorded',
        temp: vitals.temp ? `${vitals.temp}°C` : 'Not Recorded',
        weight: vitals.weight || 'Not Recorded',
        spo2: vitals.spo2 || 'Not Recorded'
      });
      setVitalsForm(vitals);
    }
  }, [patient]);

  const handleVitalsSave = (e) => {
    e.preventDefault();
    setLocalVitals({
      bp: vitalsForm.bp || 'Not Recorded',
      temp: vitalsForm.temp ? `${vitalsForm.temp}°C` : 'Not Recorded',
      weight: vitalsForm.weight || 'Not Recorded',
      spo2: vitalsForm.spo2 || 'Not Recorded'
    });
    if (patient) patient.vitals = { ...vitalsForm }; 
    setIsEditingVitals(false);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newAllergyInput.trim()) return;
    if (onAddAllergy) {
      onAddAllergy(newAllergyInput.trim());
    }
    setNewAllergyInput('');
  };

  return (
    <div className="card sidebar-card animate-fade">
      
      {/* ALLERGIES SEGMENT */}
      <div className="section-block">
        <h3>Critical Allergies Matrix</h3>
        <div className="allergy-container" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px', marginBottom: '12px' }}>
          {patient?.allergies?.length > 0 ? (
            patient.allergies.map((allergy, index) => (
              <span 
                key={index} 
                className="allergy-badge" 
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#fee2e2', 
                  color: '#991b1b', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: '500' 
                }}
              >
                ⚠️ {allergy}
                <button
                  type="button"
                  onClick={() => onRemoveAllergy && onRemoveAllergy(allergy)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#991b1b',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0 2px',
                    fontSize: '11px'
                  }}
                  title={`Remove ${allergy}`}
                >
                  ✕
                </button>
              </span>
            ))
          ) : (
            <span style={{ fontSize: '12px', color: '#64748b' }}>No allergies registered.</span>
          )}
        </div>

        {/* Form to append a new allergy constraint */}
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Add new allergy..."
            value={newAllergyInput}
            onChange={(e) => setNewAllergyInput(e.target.value)}
            style={{
              flex: '1',
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '12px'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '6px 12px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            + Add
          </button>
        </form>
      </div>
      
      <hr className="divider" style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '15px 0' }} />
      
      {/* LIVE TRIAGE VITALS SEGMENT */}
      <div className="section-block">
        <div className="split-block-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Latest Triage Vitals</h3>
          <button 
            onClick={() => setIsEditingVitals(!isEditingVitals)} 
            className="btn-text-link"
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            {isEditingVitals ? '✕ Close' : '✏️ EDIT'}
          </button>
        </div>

        {isEditingVitals ? (
          <form onSubmit={handleVitalsSave} className="vitals-edit-form" style={{ marginTop: '10px' }}>
            {['bp', 'temp', 'weight', 'spo2'].map(field => (
              <div key={field} className="f-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '6px' }}>
                <label style={{ width: '90px', fontSize: '13px' }}>{field.toUpperCase()}:</label>
                <input style={{ flex: '1', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} type="text" value={vitalsForm[field] || ''} onChange={(e) => setVitalsForm({...vitalsForm, [field]: e.target.value})} />
              </div>
            ))}
            <button type="submit" className="btn-vitals-save" style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
              Save Snapshot Locally
            </button>
          </form>
        ) : (
          <div className="vitals-horizontal-grid" style={{ marginTop: '10px' }}>
            <div className="vital-pill-item"><span className="v-emoji">💓</span><div className="v-meta"><span className="v-lbl">BP</span><span className="v-val">{localVitals.bp}</span></div></div>
            <div className="vital-pill-item"><span className="v-emoji">🌡️</span><div className="v-meta"><span className="v-lbl">Temp</span><span className="v-val">{localVitals.temp}</span></div></div>
            <div className="vital-pill-item"><span className="v-emoji">⚖️</span><div className="v-lbl">Weight</div><span className="v-val">{localVitals.weight}</span></div>
            <div className="vital-pill-item"><span className="v-emoji">🫁</span><div className="v-lbl">SpO2</div><span className="v-val">{localVitals.spo2}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}