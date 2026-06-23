import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Import Doctor Views
import DoctorDashboard from './components/doctor/DoctorDashboard';

// Import Patient Views
import PatientDashboard from './components/patient/PatientDashboard';

// Import Global/App Styles
import './styles/global.css';
import './App.css'; // For the landing gate styling

// 1. SECURE GATEWAY LOGIN COMPONENT
function LoginGateway() {
  const navigate = useNavigate();

  const handlePortalSelect = (route) => {
    // Navigate to the clean React Router paths smoothly
    navigate(route);
  };

  return (
    <div className="login-viewport">
      <div className="login-card animate-fade">
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
            <button 
              onClick={() => handlePortalSelect('/doctor')} 
              className="btn-portal-select doctor-gate"
            >
              <span className="gate-icon">🩺</span>
              <div className="gate-text">
                <strong>Practitioner Node</strong>
                <span>Sign in as Dr. Emmanuel Mensah</span>
              </div>
            </button>

            <button 
              onClick={() => handlePortalSelect('/patient')} 
              className="btn-portal-select patient-gate"
            >
              <span className="gate-icon">👤</span>
              <div className="gate-text">
                <strong>Patient Sovereign Vault</strong>
                <span>Sign in as Kwame Mensah</span>
              </div>
            </button>
          </div>
        </div>

        <footer className="login-footer">
          Secure channel backed by AES-256 on-chain encryption keys.
        </footer>
      </div>
    </div>
  );
}

// 2. HELPER WRAPPER: Adds an instant navigation ribbon for effortless demo switching
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

// 3. MAIN APPLICATION ROUTER SETUP
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Secure root path configuration handles AWS entry gateway */}
        <Route path="/" element={<LoginGateway />} />

        {/* Link for the Doctors: localhost:3000/doctor */}
        <Route path="/doctor" element={
          <DemoPortalWrapper roleTitle="Practitioner Node (Korle Bu)" isPatient={false}>
            <DoctorDashboard />
          </DemoPortalWrapper>
        } />
        
        {/* Link for the Patients: localhost:3000/patient */}
        <Route path="/patient" element={
          <DemoPortalWrapper roleTitle="Sovereign Patient Wallet (Kwame Mensah)" isPatient={true}>
            <PatientDashboard />
          </DemoPortalWrapper>
        } />
        
        {/* Fallback route defaults back to secure central entry node */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}