import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Import Views
import DoctorDashboard from './components/doctor/DoctorDashboard';
import PatientDashboard from './components/patient/PatientDashboard';

// Import Styles
import './styles/global.css';
import './App.css';

// 1. THE COMBINED LOGIN & ADMINISTRATIVE REGISTRY NODE
function LoginGateway() {
  const navigate = useNavigate();
  
  // View states: 'gate' | 'register'
  const [activeView, setActiveView] = useState('gate');

  // Registrar Form States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    bloodType: 'O+',
    ghanaCard: ''
  });

  const handlePortalSelect = (route) => {
    navigate(route);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.ghanaCard) {
      alert("Please complete all required fields and verify the physical Ghana Card.");
      return;
    }

    // Format fields to look uniform in the ledger
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    const cardId = formData.ghanaCard.trim().toUpperCase();
    
    // Mint a new standardized decentralized medical registry index token
    const mintedId = `GH-ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    alert(`
      🔒 LEDGER MINT SUCCESSFUL
      ---------------------------------
      Patient Registry: ${fullName}
      Assigned Decentralized ID: ${mintedId}
      Linked Auth: Verified Phone Link Activated via AWS Cognito OTP.
      
      You can now search this ID on the Practitioner Node!
    `);

    // Reset view
    setActiveView('gate');
    setFormData({ firstName: '', lastName: '', dob: '', gender: 'Male', bloodType: 'O+', ghanaCard: '' });
  };

  return (
    <div className="login-viewport">
      <div className="login-card animate-fade">
        
        {/* GATEWAY LANDING SCREEN */}
        {activeView === 'gate' && (
          <>
            <div className="login-brand">
              <span className="logo-shield">🛡️</span>
              <h1>MediChain Core</h1>
              <p>Decentralized Identity & Encrypted Health Ledger Gate</p>
            </div>

            <div className="aws-status-badge">
              <span className="pulse-dot green"></span>
              AWS Cognito Authentication Shield Active
            </div>

            <div className="login-action-zone">
              <h3>Select Portal Access Route</h3>
              <p className="login-subtitle">Simulating cryptographic identity resolution via JWT token attributes</p>
              
              <div className="login-button-grid">
                <button onClick={() => handlePortalSelect('/doctor')} className="btn-portal-select doctor-gate">
                  <span className="gate-icon">🩺</span>
                  <div className="gate-text">
                    <strong>Practitioner Node</strong>
                    <span>Sign in as Dr. Emmanuel Mensah</span>
                  </div>
                </button>

                <button onClick={() => handlePortalSelect('/patient')} className="btn-portal-select patient-gate">
                  <span className="gate-icon">👤</span>
                  <div className="gate-text">
                    <strong>Patient Sovereign Vault</strong>
                    <span>Sign in via Passwordless Mobile OTP Link</span>
                  </div>
                </button>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

                <button onClick={() => setActiveView('register')} className="btn-portal-select admin-gate" style={{ borderColor: '#94a3b8' }}>
                  <span className="gate-icon">🏢</span>
                  <div className="gate-text">
                    <strong>Hospital Registrar Node</strong>
                    <span>Intake New Verified Patient Ledger File</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ADMINISTRATIVE REGISTRATION FORM */}
        {activeView === 'register' && (
          <div className="registration-form-zone animate-fade">
            <div className="form-heading">
              <h2>New Patient File Intake</h2>
              <p>Verify physical identification before establishing on-chain health directory profiles.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-item-block">
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>First Name *</label>
                  <input type="text" placeholder="e.g., Kwame" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div className="form-item-block">
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Last Name *</label>
                  <input type="text" placeholder="e.g., Mensah" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div className="form-item-block">
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>National ID (Ghana Card Number) *</label>
                <input type="text" placeholder="e.g., GHA-712930192-4" value={formData.ghanaCard} onChange={(e) => setFormData({...formData, ghanaCard: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-item-block">
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Date of Birth *</label>
                  <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div className="form-item-block">
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Gender</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', boxSizing: 'border-box' }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-item-block">
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Blood Type Group</label>
                <select value={formData.bloodType} onChange={(e) => setFormData({...formData, bloodType: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', boxSizing: 'border-box' }}>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setActiveView('gate')} style={{ flex: '1', padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>Cancel</button>
                <button type="submit" style={{ flex: '2', padding: '12px', background: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: 'white' }}>Mint Decentralized File</button>
              </div>
            </form>
          </div>
        )}

        <footer className="login-footer">
          Secure channel backed by AES-256 on-chain encryption keys.
        </footer>
      </div>
    </div>
  );
}

// 2. HELPER DEMO WRAPPER
function DemoPortalWrapper({ children, roleTitle, isPatient }) {
  const navigate = useNavigate();
  return (
    <div className="portal-frame">
      <div className={`role-switcher-ribbon ${isPatient ? 'client-ribbon' : ''}`}>
        <span>Viewing Environment: <strong>{roleTitle}</strong></span>
        <button onClick={() => navigate('/')}>🔒 Switch Identity (Logout)</button>
      </div>
      {children}
    </div>
  );
}

// 3. APPLICATION ENGINE MAIN ENTRY
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginGateway />} />
        
        <Route path="/doctor" element={
          <DemoPortalWrapper roleTitle="Practitioner Node (Korle Bu)" isPatient={false}>
            <DoctorDashboard />
          </DemoPortalWrapper>
        } />
        
        <Route path="/patient" element={
          <DemoPortalWrapper roleTitle="Sovereign Patient Wallet (Kwame Mensah)" isPatient={true}>
            <PatientDashboard />
          </DemoPortalWrapper>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}