import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "./auth.css";

export function SignIn() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await login(formData.email, formData.password);
      setSuccess(true);
      
      // Redirect based on user role
      setTimeout(() => {
        if (response.user.type === 'Guide') {
          // Guide -> Dashboard Admin
          navigate("/dashboard/home");
        } else {
          // Touriste -> Landing Page
          navigate("/");
        }
      }, 1000);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
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
            {/* Form Section */}
            <div className="auth-form-section">
              <div className="auth-logo">
                <img src="/assets/img/logo.svg" alt="Travel-Tourism" />
              </div>
              
              <h1 className="auth-title">Welcome Back!</h1>
              <p className="auth-subtitle">Sign in to access your eco-tourism dashboard</p>

              {(error || authError) && (
                <div className="auth-alert error">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error || authError}
                </div>
              )}

              {success && (
                <div className="auth-alert success">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Login successful! Redirecting...
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-form-group">
                  <label className="auth-form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@mail.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="auth-form-input"
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="auth-form-input"
                    required
                  />
                </div>

                <div className="auth-checkbox-group">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <Link to="/auth/forgot-password" className="auth-link">
                    Forgot Password?
                  </Link>
                </div>

                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <div className="auth-footer">
                  Don't have an account?{" "}
                  <Link to="/auth/sign-up" className="auth-link">
                    Create account
                  </Link>
                </div>
              </form>
            </div>

            {/* Image Section */}
            <div className="auth-image">
              <div>
                <h2>Travel with Purpose</h2>
                <p>
                  Join our eco-friendly travel community and explore the world 
                  while making a positive impact on the environment.
                </p>
                <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', lineHeight: '1.8' }}>
                  Discover sustainable destinations<br />
                  Experience eco-friendly accommodations<br />
                  Travel carbon-neutral
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignIn;
