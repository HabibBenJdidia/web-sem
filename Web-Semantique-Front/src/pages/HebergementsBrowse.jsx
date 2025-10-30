import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
  Spinner,
} from "@material-tailwind/react";
import { 
  MagnifyingGlassIcon, 
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  HomeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import "./landing/landing.css";

const NAMESPACE = "http://example.org/eco-tourism#";

export function HebergementsBrowse() {
  const [hebergements, setHebergements] = useState([]);
  const [filteredHebergements, setFilteredHebergements] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterHebergements();
  }, [searchTerm, selectedType, hebergements]);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [hebergementsData, destinationsData] = await Promise.all([
        api.getHebergements(),
        api.getDestinations(),
      ]);

      const parsedHebergements = parseHebergements(hebergementsData);
      setHebergements(parsedHebergements);
      setFilteredHebergements(parsedHebergements);
      setDestinations(parseDestinations(destinationsData));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseHebergements = (data) => {
    // Handle both direct array and wrapped response formats
    let processData;
    if (data?.status === "success" && data?.data) {
      processData = data.data;
    } else if (Array.isArray(data)) {
      processData = data;
    } else {
      return [];
    }

    // If data is already processed (objects with properties), use it directly
    if (processData.length > 0 && processData[0].nom) {
      return processData.filter((h) => h.uri && !h.uri.endsWith("#") && h.uri !== NAMESPACE);
    }

    // Otherwise, process triples format
    const hebergementsMap = {};
    processData.forEach((triple) => {
      if (!triple || !triple.s || !triple.p || !triple.o) return;
      
      const uri = triple.s.value;
      const predicate = triple.p.value;
      const value = triple.o.value;
      
      if (!hebergementsMap[uri]) {
        hebergementsMap[uri] = {
          uri,
          nom: "",
          type: "",
          prix: "",
          nb_chambres: "",
          niveau_eco: "",
          situe_dans: ""
        };
      }
      
      if (predicate.includes('#')) {
        const propName = predicate.split('#')[1];
        
        if (propName === 'nom') {
          hebergementsMap[uri].nom = value;
        } else if (propName === 'type') {
          hebergementsMap[uri].type = value;
        } else if (propName === 'prix') {
          hebergementsMap[uri].prix = value;
        } else if (propName === 'nbChambres') {
          hebergementsMap[uri].nb_chambres = value;
        } else if (propName === 'niveauEco') {
          hebergementsMap[uri].niveau_eco = value;
        } else if (propName === 'situeDans') {
          hebergementsMap[uri].situe_dans = value;
        }
      }
    });
    
    return Object.values(hebergementsMap).filter(
      (h) => h.uri && !h.uri.endsWith("#") && h.uri !== NAMESPACE
    );
  };

  const parseDestinations = (data) => {
    if (!Array.isArray(data)) return [];
    
    const destinationsMap = {};
    data.forEach((item) => {
      const uri = item.s?.value || "";
      const predicate = item.p?.value || "";
      const object = item.o?.value || "";

      if (!destinationsMap[uri]) {
        destinationsMap[uri] = { uri };
      }

      if (predicate.includes("#nom")) {
        destinationsMap[uri].nom = object;
      } else if (predicate.includes("#pays")) {
        destinationsMap[uri].pays = object;
      }
    });

    return Object.values(destinationsMap).filter(d => d.nom);
  };

  const filterHebergements = () => {
    let filtered = hebergements;

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((h) => h.type === selectedType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((hebergement) => {
        const nameMatch = hebergement.nom?.toLowerCase().includes(searchLower);
        const typeMatch = hebergement.type?.toLowerCase().includes(searchLower);
        const locationMatch = getDestinationName(hebergement.situe_dans || hebergement.destination?.uri)
          ?.toLowerCase()
          .includes(searchLower);
        return nameMatch || typeMatch || locationMatch;
      });
    }

    setFilteredHebergements(filtered);
  };

  const getDestinationName = (uri) => {
    if (!uri) return "Unknown";
    const dest = destinations.find(d => d.uri === uri);
    return dest?.nom || uri.split('#')[1] || uri;
  };

  const getDestination = (uri) => {
    return destinations.find(d => d.uri === uri);
  };

  const getEcoLevelColor = (niveau) => {
    switch (niveau?.toLowerCase()) {
      case 'élevé':
      case 'eleve':
      case 'high':
        return 'bg-success';
      case 'moyen':
      case 'medium':
        return 'bg-warning';
      case 'faible':
      case 'low':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'hotel':
        return '🏨';
      case 'maison d\'hôte':
      case 'maison_hote':
        return '🏡';
      case 'auberge':
        return '🏠';
      case 'camping':
        return '⛺';
      default:
        return '🏘️';
    }
  };

  const uniqueTypes = ["all", ...new Set(hebergements.map(h => h.type).filter(Boolean))];

  if (loading) {
    return (
      <div className="landing-page">
        <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '7rem' }}>
          <div className="text-center">
            <Spinner className="h-12 w-12 mx-auto mb-4" />
            <Typography variant="h6">Loading accommodations...</Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Navbar - Same as RestaurantsBrowse */}
      <nav className={`navbar navbar-expand-lg navbar-light fixed-top d-block ${scrolled ? 'navbar-scrolled' : ''}`} data-navbar-on-scroll="data-navbar-on-scroll">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/assets/img/logo.svg" height="34" alt="logo" />
          </Link>
          <div className="navbar-collapse">
            <ul className="navbar-nav ms-auto pt-2 pt-lg-0 font-base align-items-lg-center align-items-start">
              <li className="nav-item px-3 px-xl-4">
                <a className="nav-link fw-medium" href="/#service">Service</a>
              </li>
              <li className="nav-item px-3 px-xl-4">
                <a className="nav-link fw-medium" href="/#destination">Destination</a>
              </li>
              <li className="nav-item px-3 px-xl-4">
                <Link className="nav-link fw-medium" to="/transport">Transport</Link>
              </li>
              <li className="nav-item px-3 px-xl-4">
                <Link className="nav-link fw-medium" to="/restaurants">Restaurants</Link>
              </li>
              <li className="nav-item px-3 px-xl-4">
                <Link className="nav-link fw-medium" to="/hebergements">Hébergements</Link>
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
              
              {!user ? (
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
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Profile
                      </Link>
                      {user.type === 'Guide' && (
                        <Link 
                          to="/dashboard/hebergements" 
                          className="user-dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd" />
                          </svg>
                          Dashboard
                        </Link>
                      )}
                      <Link 
                        to="/change-password" 
                        className="user-dropdown-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Change Password
                      </Link>
                      <div className="user-dropdown-divider"></div>
                      <button 
                        onClick={handleLogout}
                        className="user-dropdown-item logout"
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414 5.414 6l3.293 3.293L13.586 6 15 7.414z" clipRule="evenodd" />
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

      {/* Header */}
      <section style={{ 
        paddingTop: '7rem', 
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        position: 'relative',
        overflow: 'hidden'
      }} className="text-white py-16">
        <div className="position-absolute" style={{ 
          top: '50%', 
          left: '10%', 
          transform: 'translateY(-50%)',
          opacity: 0.1,
          fontSize: '15rem'
        }}>
          🏨
        </div>
        <div className="position-absolute" style={{ 
          bottom: '10%', 
          right: '10%', 
          opacity: 0.1,
          fontSize: '10rem'
        }}>
          🌿
        </div>
        
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <div className="mb-4" style={{ animation: 'fadeIn 0.8s ease-out' }}>
                <span className="badge bg-white bg-opacity-25 px-4 py-2 mb-3" style={{ fontSize: '1rem' }}>
                  <i className="fas fa-hotel me-2"></i>
                  Eco-Friendly Accommodations
                </span>
              </div>
              <h1 className="fs-xl-10 fs-lg-8 fs-7 fw-bold mb-4" style={{ 
                animation: 'fadeIn 1s ease-out',
                textShadow: '0 2px 20px rgba(0,0,0,0.2)'
              }}>
                Find Your Perfect Stay
              </h1>
              <p className="fs-5 fw-medium mb-4 px-lg-5" style={{ 
                animation: 'fadeIn 1.2s ease-out',
                lineHeight: '1.8'
              }}>
                Discover comfortable and sustainable accommodations committed to eco-friendly practices,
                from cozy guesthouses to modern eco-hotels
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap" style={{ animation: 'fadeIn 1.4s ease-out' }}>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" 
                       style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <span className="fw-medium">Sustainable Practices</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" 
                       style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <span className="fw-medium">Eco-Certified</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" 
                       style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <span className="fw-medium">Comfort & Nature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-5 pb-9">
        <div className="container">
          {/* Search & Filter */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="card shadow-lg border-0" style={{ 
                animation: 'fadeIn 0.5s ease-out',
                background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.05) 0%, rgba(245, 87, 108, 0.05) 100%)',
                border: '2px solid #f093fb !important'
              }}>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <Input
                        size="lg"
                        label="Search accommodations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                      />
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select form-select-lg"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        style={{ height: '42px' }}
                      >
                        {uniqueTypes.map(type => (
                          <option key={type} value={type}>
                            {type === "all" ? "All Types" : type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <Typography variant="h6" className="text-secondary fw-bold mb-0">
                <span className="badge" style={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  fontSize: '1rem',
                  padding: '0.5rem 1rem'
                }}>
                  {filteredHebergements.length} Accommodation{filteredHebergements.length !== 1 ? 's' : ''} Found
                </span>
              </Typography>
            </div>
            <div className="col-md-6 mb-3 text-md-end">
              {user && user.type === 'Guide' && (
                <Link to="/dashboard/hebergements" className="btn btn-outline-primary btn-sm">
                  <i className="fas fa-cog me-2"></i>
                  Manage Accommodations
                </Link>
              )}
            </div>
          </div>

          {/* Hebergements Grid */}
          {filteredHebergements.length === 0 ? (
            <div className="row">
              <div className="col-12">
                <div className="card shadow-hover text-center py-5" style={{ animation: 'fadeIn 0.6s ease-out' }}>
                  <div className="card-body">
                    <div style={{ fontSize: '4rem', opacity: 0.3 }}>🔍</div>
                    <Typography variant="h5" className="text-secondary mb-2">
                      No accommodations found
                    </Typography>
                    <Typography variant="small" className="text-muted">
                      Try adjusting your search criteria
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {filteredHebergements.map((hebergement, index) => {
                const destination = getDestination(hebergement.situe_dans || hebergement.destination?.uri);
                
                return (
                  <div key={hebergement.uri} className="col-lg-4 col-md-6 mb-4" 
                       style={{ 
                         animation: `fadeIn 0.5s ease-out ${index * 0.1}s backwards`
                       }}>
                    <div className="card h-100 shadow-hover border-0 overflow-hidden hover-lift">
                      <div className="position-relative">
                        <div 
                          className="card-header border-0"
                          style={{ 
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            padding: '2rem 1.5rem'
                          }}
                        >
                          <div className="text-center">
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                              {getTypeIcon(hebergement.type)}
                            </div>
                            <h5 className="text-white fw-bold mb-1">{hebergement.nom}</h5>
                            <span className="badge bg-white text-dark">
                              {hebergement.type || 'Hébergement'}
                            </span>
                          </div>
                        </div>
                        {hebergement.niveau_eco && (
                          <div className="position-absolute top-0 end-0 m-3">
                            <span className={`badge ${getEcoLevelColor(hebergement.niveau_eco)} shadow-sm`}>
                              <i className="fas fa-leaf me-1"></i>
                              {hebergement.niveau_eco}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-body p-4">
                        {/* Location */}
                        <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                          <MapPinIcon className="h-4 w-4 text-primary me-2" style={{ minWidth: '16px' }} />
                          <Typography variant="small" className="text-secondary fw-medium mb-0">
                            {destination?.nom || getDestinationName(hebergement.situe_dans)} 
                            {destination?.pays && `, ${destination.pays}`}
                          </Typography>
                        </div>

                        {/* Details */}
                        <div className="row g-3 mb-3">
                          {hebergement.prix && (
                            <div className="col-6">
                              <div className="d-flex align-items-center">
                                <CurrencyDollarIcon className="h-5 w-5 text-success me-2" />
                                <div>
                                  <Typography variant="small" className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                                    Prix/Nuit
                                  </Typography>
                                  <Typography variant="small" className="fw-bold text-success">
                                    {hebergement.prix}€
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {hebergement.nb_chambres && (
                            <div className="col-6">
                              <div className="d-flex align-items-center">
                                <HomeIcon className="h-5 w-5 text-info me-2" />
                                <div>
                                  <Typography variant="small" className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                                    Chambres
                                  </Typography>
                                  <Typography variant="small" className="fw-bold text-info">
                                    {hebergement.nb_chambres}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Eco Level Bar */}
                        {hebergement.niveau_eco && (
                          <div className="pt-3 border-top">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <Typography variant="small" className="text-muted mb-0">
                                <SparklesIcon className="h-4 w-4 d-inline me-1" />
                                Niveau Écologique
                              </Typography>
                              <Typography variant="small" className="fw-bold mb-0">
                                {hebergement.niveau_eco}
                              </Typography>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                              <div 
                                className={`progress-bar ${getEcoLevelColor(hebergement.niveau_eco).replace('bg-', 'bg-gradient-')}`}
                                style={{ 
                                  width: hebergement.niveau_eco?.toLowerCase() === 'élevé' || hebergement.niveau_eco?.toLowerCase() === 'high' ? '100%' :
                                         hebergement.niveau_eco?.toLowerCase() === 'moyen' || hebergement.niveau_eco?.toLowerCase() === 'medium' ? '66%' : '33%'
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-footer bg-light border-0 p-3">
                        <button
                          onClick={() => {
                            if (!user) {
                              navigate('/auth/sign-in');
                            } else {
                              alert('Booking functionality coming soon!');
                            }
                          }}
                          className="btn w-100"
                          style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            border: 'none',
                            fontWeight: '600',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <i className="fas fa-calendar-check me-2"></i>
                          {user ? 'Book Now' : 'Login to Book'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Back to Home */}
      <section className="pt-7 pb-0">
        <div className="container">
          <div className="text-center mb-5">
            <Link to="/" className="btn btn-primary">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="pt-7 pb-0">
        <div className="container">
          <hr className="text-300" />
          <div className="row justify-content-md-between justify-content-evenly py-3">
            <div className="col-12 col-sm-8 col-md-6 col-lg-auto text-center text-md-start">
              <p className="fs--1 my-2 fw-medium text-200">All rights Reserved © Travel-Tourism 2025</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HebergementsBrowse;

