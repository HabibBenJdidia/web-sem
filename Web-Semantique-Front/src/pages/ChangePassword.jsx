import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import "./auth/auth.css";

export function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
    setError(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    
    if (!formData.newPassword || formData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters long";
    }
    
    if (formData.newPassword === formData.currentPassword) {
      errors.newPassword = "New password must be different from current password";
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      setError("Please fill in all fields correctly");
      return;
    }

    try {
      setLoading(true);
      
      // Call API to change password
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          email: user.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="text-center">
            <h2>Please login to change your password</h2>
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

      {/* Change Password Page */}
      <div className="auth-page" style={{ paddingTop: '100px' }}>
        <div className="auth-container" style={{ maxWidth: '600px' }}>
          <div className="auth-card" style={{ gridTemplateColumns: '1fr' }}>
            {/* Form Section */}
            <div className="auth-form-section">
              <div className="auth-logo">
                <img src="/assets/img/logo.svg" alt="Travel-Tourism" />
              </div>
              
              <h1 className="auth-title">Change Password</h1>
              <p className="auth-subtitle">Update your account password</p>

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
                  Password changed successfully! Redirecting...
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-form-group">
                  <label className="auth-form-label">
                    Current Password <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="••••••••"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={`auth-form-input ${formErrors.currentPassword ? 'error' : ''}`}
                    required
                  />
                  {formErrors.currentPassword && (
                    <span className="error-text">{formErrors.currentPassword}</span>
                  )}
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">
                    New Password <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={`auth-form-input ${formErrors.newPassword ? 'error' : ''}`}
                    required
                  />
                  {formErrors.newPassword && (
                    <span className="error-text">{formErrors.newPassword}</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#5E6282', marginTop: '0.25rem', display: 'block' }}>
                    Must be at least 6 characters long
                  </span>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">
                    Confirm New Password <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={`auth-form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                    required
                  />
                  {formErrors.confirmPassword && (
                    <span className="error-text">{formErrors.confirmPassword}</span>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? "Changing Password..." : "Change Password"}
                </button>

                <div className="auth-footer">
                  <Link to="/" className="auth-link">
                    ← Back to Home
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChangePassword;

