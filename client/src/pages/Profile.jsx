import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { updateProfile } from '../services/authService';
import { validatePhone } from '../utils/validators';

export default function Profile() {
  const { user, loadUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.address?.phone || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || '');
      setZipCode(user.address?.zipCode || '');
    }
  }, [user]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (phone.trim() && !validatePhone(phone)) {
      e.phone = 'Phone number must be 10 digits';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name,
        address: { phone, street, city, state, zipCode }
      };
      await updateProfile(payload);
      await loadUser(); // reload updated state
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="profile-page animate-fadeIn">
        <div className="profile-header">
          <div className="profile-avatar">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1>Your Profile</h1>
            <p className="text-muted">{user?.email} • {user?.role}</p>
          </div>
        </div>

        <form className="card" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="prof-name">Full Name</label>
            <input
              type="text"
              id="prof-name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-phone">Phone Number</label>
            <input
              type="tel"
              id="prof-phone"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="10-digit mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>

          <h3 className="mb-4 mt-6">Default Delivery Address</h3>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-street">Street Address</label>
            <input
              type="text"
              id="prof-street"
              className="form-input"
              placeholder="Flat/House No, Building, Street Name"
              value={street}
              onChange={e => setStreet(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="prof-city">City</label>
              <input
                type="text"
                id="prof-city"
                className="form-input"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-state">State</label>
              <input
                type="text"
                id="prof-state"
                className="form-input"
                value={state}
                onChange={e => setState(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-zip">ZIP Code</label>
            <input
              type="text"
              id="prof-zip"
              className="form-input"
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg mt-4" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
