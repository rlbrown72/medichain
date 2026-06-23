import React, { useState } from 'react';
import '../../styles/AISafetyBox.css';
export default function AISafetyBox({ patient, onRunCheck, aiResult, loading }) {
  const [newDrug, setNewDrug] = useState('');

  if (!patient) return null;

  const handleScan = () => {
    if (!newDrug.trim()) return alert("Please type a prescription drug first.");
    onRunCheck(newDrug.trim());
  };

  return (
    <div className="card prescription-card">
      <h3>New Prescription & AI Safety Check</h3>
      <div className="form-group">
        <label>Drug Name & Dosage</label>
        <input
          type="text"
          value={newDrug}
          onChange={(e) => setNewDrug(e.target.value)}
          placeholder="e.g., Amoxicillin 500mg"
        />
      </div>
      
      <button onClick={handleScan} disabled={loading} className="btn-scan">
        {loading ? 'Running AI Diagnostics...' : 'Run MediChain AI Safety Scan'}
      </button>

      {aiResult && (
        <div className={`ai-alert-box ${aiResult.conflictDetected ? 'alert-danger' : 'alert-success'}`}>
          <h4>{aiResult.conflictDetected ? '⚠️ DANGEROUS DRUG CONFLICT DETECTED' : '✅ AI SAFETY CHECK PASSED'}</h4>
          <p>{aiResult.reason}</p>
        </div>
      )}
    </div>
  );
}