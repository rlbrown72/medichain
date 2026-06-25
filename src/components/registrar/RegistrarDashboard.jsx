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

    // Format phone number for E.164 country code standard formatting (+233)
    let formattedPhone = patientData.phoneNumber.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+233' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+233' + formattedPhone;
    }

    try {
      const fullName = `${patientData.firstName.trim()} ${patientData.lastName.trim()}`;

      // 🌐 ROUTING THROUGH SECURE API GATEWAY INFRASTRUCTURE
      const API_ENDPOINT = "https://s7muqo4m58.execute-api.us-west-2.amazonaws.com/prod/patients";
      
      const payload = {
        firstName: patientData.firstName.trim(),
        lastName: patientData.lastName.trim(),
        ghanaCardId: patientData.ghanaCardId.toUpperCase().trim(),
        phoneNumber: formattedPhone,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        bloodType: patientData.bloodType
      };

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to finalize database write via API context.");
      }

      // Extract generated patient ID context if returned by your Lambda
      const assignedId = responseData.id || "Secure ID Allocation";
      console.log("Successfully written record via API Gateway Proxy. Assigned ID:", assignedId);
      
      setMessage(`Success! Profile securely created in the cloud database for ${fullName}.`);
      
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
      console.error("Cloud Database Write Failure:", error);
      setMessage('Cloud synchronization failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registrar-container">
      <div className="registrar-sidebar">
        <h2>MediChain</h2>
        <p className="sidebar-role">Registration Desk</p>
        <div className="sidebar-menu">
          <button className="menu-item active">➕ Register Patient</button>
          <button className="menu-item">📋 Recent Records</button>
        </div>
      </div>

      <div className="registrar-main">
        <header className="registrar-header">
          <h1>Onboard New Patient</h1>
          <p>Create secure electronic medical records and identity profiles</p>
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
              <label>Mobile Number (For Access OTP Verification)</label>
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
              {loading ? 'Saving to Cloud Database...' : 'Create Secure Patient Profile'}
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