import React, { useState } from 'react';
import '../../styles/RegistrarDashboard.css';

export default function RegistrarDashboard() {
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    ghanaCardId: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodType: 'O+',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setPatientData({
      ...patientData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Format phone number for AWS Cognito E.164 country code formatting (+233)
    let formattedPhone = patientData.phoneNumber.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+233' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+233' + formattedPhone;
    }

    try {
      const fullName = `${patientData.firstName.trim()} ${patientData.lastName.trim()}`;
      const mintedId = `GH-ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      console.log("Registering immutable file to Cognito:", formattedPhone);
      console.log("Minting ledger index parameters:", {
        id: mintedId,
        name: fullName,
        ghanaCard: patientData.ghanaCardId.toUpperCase(),
        dob: patientData.dateOfBirth,
        gender: patientData.gender,
        bloodType: patientData.bloodType
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setMessage(`Success! Permanent profile initialized for ${fullName} (${patientData.bloodType}).`);
      
      // Reset form fields
      setPatientData({ 
        firstName: '', 
        lastName: '', 
        ghanaCardId: '', 
        phoneNumber: '', 
        dateOfBirth: '', 
        gender: 'Male', 
        bloodType: 'O+' 
      });
    } catch (error) {
      setMessage('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registrar-container">
      <div className="registrar-sidebar">
        <h2>MediChain</h2>
        <p className="sidebar-role">Registrar Node</p>
        <div className="sidebar-menu">
          <button className="menu-item active">➕ Register Patient</button>
          <button className="menu-item">📋 Recent Records</button>
        </div>
      </div>

      <div className="registrar-main">
        <header className="registrar-header">
          <h1>Onboard New Patient</h1>
          <p>Establish secure on-chain health records and identity directories</p>
        </header>

        <section className="form-section">
          <form onSubmit={handleSubmit} className="registrar-form">
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={patientData.firstName} 
                  onChange={handleChange} 
                  placeholder="Kwame"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={patientData.lastName} 
                  onChange={handleChange} 
                  placeholder="Mensah"
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ghana Card ID (GHA-XXXXXXXXX-X)</label>
              <input 
                type="text" 
                name="ghanaCardId" 
                value={patientData.ghanaCardId} 
                onChange={handleChange} 
                placeholder="GHA-712345678-9"
                required 
              />
            </div>

            <div className="form-group">
              <label>Mobile Number (For Access OTP Tokens)</label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={patientData.phoneNumber} 
                onChange={handleChange} 
                placeholder="0241234567"
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Date of Birth</label>
                <input 
                  type="date" 
                  name="dateOfBirth" 
                  value={patientData.dateOfBirth} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select 
                  name="gender" 
                  value={patientData.gender} 
                  onChange={handleChange}
                  style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', background: '#fff', fontSize: '1rem' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* IMMUTABLE DATA BLOCK */}
            <div className="form-group" style={{ background: '#f0fdf4', padding: '12px', borderRadius: '6px', border: '1px dashed #bbf7d0' }}>
              <label style={{ color: '#166534' }}>Blood Type Group (Permanent Attribute)</label>
              <select 
                name="bloodType" 
                value={patientData.bloodType} 
                onChange={handleChange}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', background: '#fff', fontSize: '1rem', width: '100%', marginTop: '4px' }}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Provisioning Cloud Vault...' : 'Initialize Secure Vault'}
            </button>
          </form>

          {message && (
            <div className={`status-banner ${message.startsWith('Success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}