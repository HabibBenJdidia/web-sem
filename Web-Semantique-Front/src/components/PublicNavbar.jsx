import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "./Navbar.css";

export function PublicNavbar() {
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <nav
      className={`navbar navbar-expand-lg navbar-light fixed-top d-block ${
        scrolled ? "navbar-scrolled" : ""
      }`}
      data-navbar-on-scroll="data-navbar-on-scroll"
    >
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
        <div className="navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto pt-2 pt-lg-0 font-base align-items-lg-center align-items-start">
            <li className="nav-item px-3 px-xl-4">
              <button 
                className="nav-link fw-medium" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => scrollToSection('service')}
              >
                Service
              </button>
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
              <Link className="nav-link fw-medium" to="/public/certifications">Certifications</Link>
            </li>
            <li className="nav-item px-3 px-xl-4">
              <Link className="nav-link fw-medium" to="/public/evenements">Événements</Link>
            </li>

            <li className="nav-item px-3 px-xl-4 discover-menu-container">
              <button
                className="nav-link fw-medium btn-link"
                onClick={() => setShowDiscoverMenu(!showDiscoverMenu)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Découvrir ▾
              </button>
              {showDiscoverMenu && (
                <div className="discover-dropdown-menu">
                  <Link
                    className="dropdown-item"
                    to="/client/activities"
                    onClick={() => setShowDiscoverMenu(false)}
                  >
                    🎯 Activités
                  </Link>
                  <Link
                    className="dropdown-item"
                    to="/client/natural-zones"
                    onClick={() => setShowDiscoverMenu(false)}
                  >
                    🌿 Zones Naturelles
                  </Link>
                </div>
              )}
            </li>

            <li className="nav-item px-3 px-xl-4">
              <Link className="nav-link fw-medium" to="/transport">
                Transport
              </Link>
            </li>
            <li className="nav-item px-3 px-xl-4">
              <Link className="nav-link fw-medium" to="/restaurants">
                Restaurants
              </Link>
            </li>
            <li className="nav-item px-3 px-xl-4">
              <Link className="nav-link fw-medium" to="/hebergements">
                Hébergements
              </Link>
            </li>
            <li className="nav-item px-3 px-xl-4">
              <Link className="nav-link fw-medium" to="/produits">
                Produits
              </Link>
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
                  <Link className="nav-link fw-medium" to="/auth/sign-in">
                    Login
                  </Link>
                </li>
                <li className="nav-item px-3 px-xl-4">
                  <Link
                    className="btn btn-outline-dark order-1 order-lg-0 fw-medium"
                    to="/auth/sign-up"
                  >
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
                    {user.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-name">{user.nom || 'User'}</span>
                  <span className="user-type-badge">{user.type || 'User'}</span>
                </button>
                {showUserMenu && (
                  <div className="user-dropdown-menu">
                    <Link
                      className="dropdown-item"
                      to="/dashboard/profile"
                      onClick={() => setShowUserMenu(false)}
                    >
                      👤 Profile
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="/dashboard/home"
                      onClick={() => setShowUserMenu(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      🚪 Logout
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

export default PublicNavbar;

