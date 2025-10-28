import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { countries } from "@/data/countries";
import "./auth.css";

export function SignUp() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    age: "",
    nationalite: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [ageWarning, setAgeWarning] = useState(null);

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "birthDate") {
      const age = calculateAge(value);
      
      if (age < 18) {
        setAgeWarning("You must be at least 18 years old to register");
        setFormData({ ...formData, birthDate: value, age: "" });
      } else {
        setAgeWarning(null);
        setFormData({ ...formData, birthDate: value, age: age.toString() });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
    setError(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom || formData.nom.trim().length < 2) {
      errors.nom = "Name must be at least 2 characters long";
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.birthDate) {
      errors.birthDate = "Birth date is required";
    }
    
    if (!formData.age || parseInt(formData.age) < 18) {
      errors.age = "You must be at least 18 years old";
    }
    
    if (!formData.nationalite) {
      errors.nationalite = "Nationality is required";
    }
    
    if (!agreeTerms) {
      errors.terms = "You must agree to the terms and conditions";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      setError("Please fill in all required fields correctly");
      return;
    }

    try {
      const userData = {
        nom: formData.nom,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        nationalite: formData.nationalite,
        type: 'touriste', // Rôle par défaut: Touriste
      };

      await register(userData);
      setSuccess(true);
      // Show email verification message
      // Auto-redirect to home page after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="auth-navbar">
        <div className="container">
          <Link to="/" className="auth-navbar-logo">
            <img src="/assets/img/logo.svg" alt="Travel-Tourism" />
          </Link>
          <Link to="/" className="auth-navbar-link">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Auth Page */}
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            {/* Image Section - Left side for register */}
            <div className="auth-image">
              <div>
                <h2>Start Your Journey</h2>
                <p>
                  Create your account and join thousands of eco-conscious travelers 
                  exploring the world responsibly.
                </p>
                <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', lineHeight: '1.8' }}>
                  Travel sustainably<br />
                  Discover amazing destinations<br />
                  Join our global community
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="auth-form-section">
              <div className="auth-logo">
                <img src="/assets/img/logo.svg" alt="Travel-Tourism" />
              </div>
              
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join our eco-tourism community today</p>

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
                  <div>
                    <strong>Registration successful!</strong><br />
                    Please check your email to verify your account.
                  </div>
                </div>
              )}

              {ageWarning && (
                <div className="auth-alert error">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {ageWarning}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                <div className="auth-form-group">
                  <label className="auth-form-label">
                    Full Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    placeholder="John Doe"
                    value={formData.nom}
                    onChange={handleChange}
                    disabled={loading}
                    className={`auth-form-input ${formErrors.nom ? 'error' : ''}`}
                    required
                  />
                  {formErrors.nom && <span className="error-text">{formErrors.nom}</span>}
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">
                    Email Address <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
              placeholder="name@mail.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`auth-form-input ${formErrors.email ? 'error' : ''}`}
                    required
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">
                    Password <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className={`auth-form-input ${formErrors.password ? 'error' : ''}`}
                    required
                  />
                  {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">
                    Confirm Password <span style={{ color: 'red' }}>*</span>
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
                  {formErrors.confirmPassword && <span className="error-text">{formErrors.confirmPassword}</span>}
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">
                    Birth Date <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    disabled={loading}
                    max={new Date().toISOString().split('T')[0]}
                    className={`auth-form-input ${formErrors.birthDate || formErrors.age ? 'error' : ''}`}
                    required
                  />
                  {formData.age && (
                    <span style={{ fontSize: '0.875rem', color: '#5E6282', marginTop: '0.25rem', display: 'block' }}>
                      Age: {formData.age} years old
                    </span>
                  )}
                  {formErrors.age && <span className="error-text">{formErrors.age}</span>}
          </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">
                    Nationality <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="nationalite"
                    value={formData.nationalite}
                    onChange={handleChange}
                    disabled={loading}
                    className={`auth-form-input ${formErrors.nationalite ? 'error' : ''}`}
                    required
                  >
                    <option value="">Select your nationality</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.nationality}>
                        {country.nationality} ({country.name})
                      </option>
                    ))}
                  </select>
                  {formErrors.nationalite && <span className="error-text">{formErrors.nationalite}</span>}
                </div>

                <div className="auth-form-group">
                  <label className="auth-checkbox-label" style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <span style={{ flex: 1 }}>
                      I agree to the{" "}
                      <a href="#" className="auth-link">Terms and Conditions</a>
                      {" "}and{" "}
                      <a href="#" className="auth-link">Privacy Policy</a>
                    </span>
                  </label>
                  {formErrors.terms && <span className="error-text">{formErrors.terms}</span>}
                </div>

                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={loading || parseInt(formData.age) < 18}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

                <div className="auth-footer">
                  Already have an account?{" "}
                  <Link to="/auth/sign-in" className="auth-link">
                    Sign in
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

export default SignUp;
