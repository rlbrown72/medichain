import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Import Views
import DoctorDashboard from './components/doctor/DoctorDashboard';
import PatientDashboard from './components/patient/PatientDashboard';
import RegistrarDashboard from './components/registrar/RegistrarDashboard';

// Import Styles
import './styles/global.css';
import './App.css';

// 1. THE MAIN LOGIN PORTAL & SYSTEM GATEWAY
function LoginGateway() {
  const navigate = useNavigate();
  
  // View states: 'gate' | 'register'
  const [activeView, setActiveView] = useState('gate');

  const handlePortalSelect = (route) => {
    navigate(route);
  };

  return (
    <div className="login-viewport">
      {/* GATEWAY LANDING SCREEN */}
      {activeView === 'gate' && (
        <div className="login-card animate-fade">
          <div className="login-brand">
            <span className="logo-shield">🛡️</span>
            <h1>MediChain</h1>
            <p>Secure Electronic Health Records & Medical Identity Portal</p>
          </div>

          <div className="aws-status-badge">
            <span className="pulse-dot green"></span>
            AWS Cognito Secure Authentication Active
          </div>

          <div className="login-action-zone">
            <h3>Select Access Portal</h3>
            
            <div className="login-button-grid">
              <button onClick={() => handlePortalSelect('/doctor')} className="btn-portal-select doctor-gate">
                <span className="gate-icon">🩺</span>
                <div className="gate-text">
                  <strong>Medical Practitioner Portal</strong>
                  <span>Sign in as Dr. Emmanuel Mensah</span>
                </div>
              </button>

              <button onClick={() => handlePortalSelect('/patient')} className="btn-portal-select patient-gate">
                <span className="gate-icon">👤</span>
                <div className="gate-text">
                  <strong>Patient Personal Portal</strong>
                  <span>Sign in securely via Mobile OTP Verification</span>
                </div>
              </button>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

              <button onClick={() => setActiveView('register')} className="btn-portal-select admin-gate" style={{ borderColor: '#94a3b8' }}>
                <span className="gate-icon">🏢</span>
                <div className="gate-text">
                  <strong>Hospital Registrar Desk</strong>
                  <span>Register and Intake a New Patient Profile</span>
                </div>
              </button>
            </div>
          </div>
          <footer className="login-footer">
            Secured and encrypted via AWS Cloud security standards.
          </footer>
        </div>
      )}

      {/* ADMINISTRATIVE REGISTRATION COMPONENT ROW */}
      {activeView === 'register' && (
        <div style={{ width: '100vw', minHeight: '100vh', background: '#f8fafc' }}>
          {/* Top Return navigation row */}
          <div style={{ background: '#0f172a', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '600' }}>🔒 System Mode: Secure Staff Registration Session</span>
            <button onClick={() => setActiveView('gate')} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
              ← Return to Login Portal
            </button>
          </div>
          <RegistrarDashboard />
        </div>
      )}
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
        <button onClick={() => navigate('/')}>🔒 Log Out</button>
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
          <DemoPortalWrapper roleTitle="Medical Practitioner View (Korle Bu)" isPatient={false}>
            <DoctorDashboard />
          </DemoPortalWrapper>
        } />
        
        <Route path="/patient" element={
          <DemoPortalWrapper roleTitle="Patient Profile View (Kwame Mensah)" isPatient={true}>
            <PatientDashboard />
          </DemoPortalWrapper>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}