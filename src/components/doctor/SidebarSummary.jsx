import React from 'react';
import '../../styles/SidebarSummary.css';
export default function SidebarSummary({ patient }) {
  if (!patient) return null;

  return (
    <div className="card sidebar-card">
      <div className="section-block">
        <h3>Critical Allergies</h3>
        <div className="allergy-container">
          {patient.allergies.map((allergy, index) => (
            <span key={index} className="allergy-badge">{allergy}</span>
          ))}
        </div>
      </div>
      
      <hr className="divider" />
      
      <div className="section-block">
        <h3>Latest Triage Vitals</h3>
        <div className="vitals-grid">
          <div className="vital-item"><p className="lbl">BP</p><p className="val">{patient.vitals.bp}</p></div>
          <div className="vital-item"><p className="lbl">Temp</p><p className="val">{patient.vitals.temp}</p></div>
          <div className="vital-item"><p className="lbl">Weight</p><p className="val">{patient.vitals.weight}</p></div>
        </div>
      </div>
    </div>
  );
}