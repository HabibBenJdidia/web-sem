import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import "./auth/auth.css";

export function AccessDenied() {
  return (
    <>
      <Navbar />
      
      <div className="auth-page" style={{ paddingTop: '100px' }}>
        <div className="auth-container" style={{ maxWidth: '600px' }}>
          <div className="auth-card" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
            <div className="auth-form-section">
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem',
                fontWeight: 'bold',
                margin: '0 auto 2rem',
                boxShadow: '0 8px 20px rgba(245, 87, 108, 0.3)',
              }}>
                <svg width="60" height="60" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h1 className="auth-title" style={{ color: '#f5576c', marginBottom: '1rem' }}>
                Access Denied
              </h1>
              <p className="auth-subtitle" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                You don't have permission to access this page.
              </p>
              
              <div style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem'
              }}>
                <p style={{ margin: 0, color: '#856404', fontSize: '0.95rem' }}>
                  <strong>Note:</strong> The dashboard is only accessible to guides.
                  If you're a tourist, you can explore our services from the home page.
                </p>
              </div>
              
              <div className="access-denied-buttons">
                <Link to="/" className="access-denied-btn-primary">
                  Go to Home
                </Link>
                <Link to="/profile" className="access-denied-btn-secondary">
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

