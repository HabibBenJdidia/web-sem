import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "./Navbar.css";

export function Navbar() {
  const [openNav, setOpenNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDiscoverMenu, setShowDiscoverMenu] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  };

  const scrollToSection = (sectionId) => {
    // Si on n'est pas sur la page d'accueil, naviguer d'abord
    if (location.pathname !== "/") {
      navigate("/");
      // Attendre que la navigation soit terminée avant de scroller
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      // Si on est déjà sur la page d'accueil, scroller directement
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-light fixed-top d-block ${scrolled ? 'navbar-scrolled' : ''}`} data-navbar-on-scroll="data-navbar-on-scroll">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src="/assets/img/logo.svg" height="34" alt="logo" />
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setOpenNav(!openNav)}
          aria-expanded={openNav}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="navbar-collapse">
          <ul className="navbar-nav ms-auto pt-2 pt-lg-0 font-base align-items-lg-center align-items-start">
            <li className="nav-item px-3 px-xl-4">
              <Link className="nav-link fw-medium" to="/">Home</Link>
            </li>
            
            {/* Discover Dropdown */}
            <li className="nav-item px-3 px-xl-4 user-menu-container">
              <button 
                className="user-menu-trigger nav-link fw-medium"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => setShowDiscoverMenu(!showDiscoverMenu)}
              >
                <span>Discover</span>
                <svg className={`chevron ${showDiscoverMenu ? 'open' : ''}`} width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ marginLeft: '4px' }}>
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showDiscoverMenu && (
                <div className="user-dropdown">
                  <Link 
                    to="/client/activities" 
                    className="user-dropdown-item"
                    onClick={() => setShowDiscoverMenu(false)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Activities
                  </Link>
                  <Link 
                    to="/client/natural-zones" 
                    className="user-dropdown-item"
                    onClick={() => setShowDiscoverMenu(false)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Natural Zones
                  </Link>
                </div>
              )}
            </li>
            
            <li className="nav-item px-3 px-xl-4">
              <button 
                className="nav-link fw-medium" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => scrollToSection('destination')}
              >
                Destination
              </button>
            </li>
            <li className="nav-item px-3 px-xl-4">
              <Link className="nav-link fw-medium" to="/transport">Transport</Link>
            </li>
            <li className="nav-item px-3 px-xl-4">
              <Link className="nav-link fw-medium" to="/restaurants">Restaurants</Link>
            </li>
            <li className="nav-item px-3 px-xl-4">
              <Link className="nav-link fw-medium" to="/produits">Produits</Link>
            </li>
            
            {user && user.type === 'Touriste' && (
              <li className="nav-item px-3 px-xl-4">
                <Link className="nav-link fw-medium" to="/my-reservations">
                  Mes Réservations
                </Link>
              </li>
            )}
            
            {loading ? (
              <li className="nav-item px-3 px-xl-4">
                <span className="nav-link fw-medium" style={{ opacity: 0.5 }}>Loading...</span>
              </li>
            ) : !user ? (
              <>
                <li className="nav-item px-3 px-xl-4">
                  <Link className="nav-link fw-medium" to="/auth/sign-in">Login</Link>
                </li>
                <li className="nav-item px-3 px-xl-4">
                  <Link className="btn btn-outline-dark order-1 order-lg-0 fw-medium" to="/auth/sign-up">
                    Sign Up
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item px-3 px-xl-4 user-menu-container">
                <button 
                  className="user-menu-trigger"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="user-name">{user.nom}</span>
                  <svg className={`chevron ${showUserMenu ? 'open' : ''}`} width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-name">{user.nom}</div>
                      <div className="user-dropdown-email">{user.email}</div>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <Link 
                      to="/profile" 
                      className="user-dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className="user-dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Settings
                    </Link>
                    <Link 
                      to="/change-password" 
                      className="user-dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Change Password
                    </Link>
                    <div className="user-dropdown-divider"></div>
                    <button 
                      className="user-dropdown-item"
                      onClick={handleLogout}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}


