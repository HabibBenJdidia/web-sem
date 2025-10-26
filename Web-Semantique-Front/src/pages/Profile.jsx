import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { countries } from "@/data/countries";
import { Navbar } from "@/components/Navbar";
import "./auth/auth.css";

export function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    age: "",
    nationalite: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        email: user.email || "",
        age: user.age || "",
        nationalite: user.nationalite || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);
      
      // Call API to update profile
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/touriste/${encodeURIComponent(user.uri)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          nom: formData.nom,
          age: parseInt(formData.age),
          nationalite: formData.nationalite,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update profile';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Try to parse JSON response, but don't fail if it's empty
      let responseData = null;
      try {
        const text = await response.text();
        if (text) {
          responseData = JSON.parse(text);
        }
      } catch (e) {
        // Response is not JSON or empty, that's okay for PUT requests
        console.log('Response is not JSON, but request was successful');
      }

      // Update local user data
      const updatedUser = {
        ...user,
        nom: formData.nom,
        age: parseInt(formData.age),
        nationalite: formData.nationalite,
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // If updateProfile is available, use it
      if (updateProfile) {
        try {
          await updateProfile({
            nom: formData.nom,
            age: parseInt(formData.age),
            nationalite: formData.nationalite,
          });
        } catch (e) {
          console.log('updateProfile method not available, updated localStorage directly');
        }
      }

      setSuccess(true);
      setIsEditing(false);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(false);
    // Reset form to original user data
    if (user) {
      setFormData({
        nom: user.nom || "",
        email: user.email || "",
        age: user.age || "",
        nationalite: user.nationalite || "",
      });
    }
  };

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="text-center">
            <h2>Please login to view your profile</h2>
            <Link to="/auth/sign-in" className="auth-link">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Profile Page */}
      <div className="auth-page" style={{ paddingTop: '100px' }}>
        <div className="auth-container" style={{ maxWidth: '800px' }}>
          <div className="auth-card" style={{ gridTemplateColumns: '1fr' }}>
            {/* Profile Section */}
            <div className="auth-form-section">
              {/* Profile Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                }}>
                  {user.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
                </div>
                <h1 className="auth-title" style={{ marginBottom: '0.5rem' }}>{user.nom}</h1>
                <p className="auth-subtitle">{user.email}</p>
                <div style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginTop: '0.5rem',
                }}>
                  {user.type === 'Guide' ? '🎯 Guide' : '🌍 Tourist'}
                </div>
              </div>

              {error && (
                <div className="auth-alert error">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-alert success">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '2px solid #f0f0f0',
                }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#14183E', margin: 0 }}>
                    Personal Information
                  </h2>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        border: '2px solid #667eea',
                        color: '#667eea',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#667eea';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#667eea';
                      }}
                    >
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Full Name</label>
                  <input
                    type="text"
                    name="nom"
                    placeholder="Your name"
                    value={formData.nom}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    className="auth-form-input"
                    style={{ background: isEditing ? 'white' : '#f8f9fa' }}
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    className="auth-form-input"
                    style={{ background: '#f8f9fa', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#5E6282', marginTop: '0.25rem', display: 'block' }}>
                    Email cannot be changed
                  </span>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="Your age"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    min="18"
                    max="120"
                    className="auth-form-input"
                    style={{ background: isEditing ? 'white' : '#f8f9fa' }}
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Nationality</label>
                  <select
                    name="nationalite"
                    value={formData.nationalite}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    className="auth-form-input"
                    style={{ background: isEditing ? 'white' : '#f8f9fa' }}
                  >
                    <option value="">Select your nationality</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.nationality}>
                        {country.nationality} ({country.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Account Type</label>
                  <input
                    type="text"
                    value={user.type === 'Guide' ? 'Guide' : 'Tourist'}
                    disabled={true}
                    className="auth-form-input"
                    style={{ background: '#f8f9fa', cursor: 'not-allowed' }}
                  />
                </div>

                {isEditing && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button 
                      type="submit" 
                      className="auth-button"
                      disabled={loading}
                      style={{ flex: 1 }}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCancel}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '0.875rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#5E6282',
                        background: 'white',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#ef4444';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.color = '#5E6282';
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {!isEditing && (
                  <div className="auth-footer" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Link to="/change-password" className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Change Password
                      </Link>
                      <Link to="/" className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Home
                      </Link>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;

