import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Input,
  Button,
  Tabs,
  TabsHeader,
  Tab,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import "./landing/landing.css";

export function ProduitsBrowse() {
  const [produits, setProduits] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const seasons = [
    { label: "All Products", value: "all" },
    { label: "🌸 Spring", value: "Printemps" },
    { label: "☀️ Summer", value: "Été" },
    { label: "🍂 Autumn", value: "Automne" },
    { label: "❄️ Winter", value: "Hiver" },
    { label: "🌍 Year-round", value: "Toute l'année" },
  ];

  useEffect(() => {
    loadProduits();
  }, []);

  useEffect(() => {
    filterProduits();
  }, [searchTerm, filterType, produits]);

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

  const loadProduits = async () => {
    try {
      setLoading(true);
      const data = await api.getProduits();
      const parsed = parseProduits(data);
      setProduits(parsed);
      setFilteredProduits(parsed);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseProduits = (data) => {
    if (!Array.isArray(data)) return [];
    
    const produitsMap = {};
    data.forEach((item) => {
      const uri = item.s?.value || "";
      const predicate = item.p?.value || "";
      const object = item.o?.value || "";

      if (!produitsMap[uri]) {
        produitsMap[uri] = { uri, bio: false };
      }

      if (predicate.includes("#nom")) {
        produitsMap[uri].nom = object;
      } else if (predicate.includes("#saison")) {
        produitsMap[uri].saison = object;
      } else if (predicate.includes("#bio")) {
        produitsMap[uri].bio = object === "true" || object === true;
      }
    });

    return Object.values(produitsMap).filter(p => p.nom);
  };

  const filterProduits = () => {
    let filtered = [...produits];

    // Filter by season
    if (filterType !== "all") {
      filtered = filtered.filter(p => p.saison === filterType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.nom?.toLowerCase().includes(searchLower) ||
        p.saison?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProduits(filtered);
  };

  const getSeasonColor = (saison) => {
    const colors = {
      "Printemps": "pink",
      "Été": "yellow",
      "Automne": "orange",
      "Hiver": "blue",
      "Toute l'année": "green",
    };
    return colors[saison] || "gray";
  };

  const getSeasonEmoji = (saison) => {
    const emojis = {
      "Printemps": "🌸",
      "Été": "☀️",
      "Automne": "🍂",
      "Hiver": "❄️",
      "Toute l'année": "🌍",
    };
    return emojis[saison] || "🌱";
  };

  const bioProducts = filteredProduits.filter(p => p.bio);
  const regularProducts = filteredProduits.filter(p => !p.bio);

  if (loading) {
    return (
      <div className="landing-page">
        <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '7rem' }}>
          <Typography variant="h6">Loading products...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Navbar - Same as Landing Page */}
      <nav className={`navbar navbar-expand-lg navbar-light fixed-top d-block ${scrolled ? 'navbar-scrolled' : ''}`} data-navbar-on-scroll="data-navbar-on-scroll">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/assets/img/logo.svg" height="34" alt="logo" />
          </Link>
          <div className="navbar-collapse">
            <ul className="navbar-nav ms-auto pt-2 pt-lg-0 font-base align-items-lg-center align-items-start">
              <li className="nav-item px-3 px-xl-4">
                <Link className="nav-link fw-medium" to="/">Home</Link>
              </li>
              <li className="nav-item px-3 px-xl-4">
                <Link className="nav-link fw-medium" to="/restaurants">Restaurants</Link>
              </li>
              <li className="nav-item px-3 px-xl-4">
                <Link className="nav-link fw-medium" to="/produits">Local Products</Link>
              </li>
              
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
                          to="/dashboard/produits" 
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
          top: '20%', 
          left: '5%', 
          opacity: 0.1,
          fontSize: '12rem'
        }}>
          🥕
        </div>
        <div className="position-absolute" style={{ 
          bottom: '15%', 
          right: '8%', 
          opacity: 0.1,
          fontSize: '15rem'
        }}>
          🍅
        </div>
        
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <div className="mb-4" style={{ animation: 'fadeIn 0.8s ease-out' }}>
                <span className="badge bg-white bg-opacity-25 px-4 py-2 mb-3" style={{ fontSize: '1rem' }}>
                  <i className="fas fa-seedling me-2"></i>
                  Farm to Table
                </span>
              </div>
              <h1 className="fs-xl-10 fs-lg-8 fs-7 fw-bold mb-4" style={{ 
                animation: 'fadeIn 1s ease-out',
                textShadow: '0 2px 20px rgba(0,0,0,0.2)'
              }}>
                Fresh Local Products Marketplace
              </h1>
              <p className="fs-5 fw-medium mb-4 px-lg-5" style={{ 
                animation: 'fadeIn 1.2s ease-out',
                lineHeight: '1.8'
              }}>
                Discover the freshest seasonal products from local farmers and producers,
                featuring certified organic options and traditional specialties
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap" style={{ animation: 'fadeIn 1.4s ease-out' }}>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" 
                       style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <span className="fw-medium">Fresh & Seasonal</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" 
                       style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <span className="fw-medium">Organic Certified</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" 
                       style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <span className="fw-medium">Local Farmers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-5 pb-9">
        <div className="container">
          {/* Search and Filter */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="card shadow-lg border-0" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <Input
                      label="Search products"
                      icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="lg"
                    />
                  </div>

                  <Tabs value={filterType} className="w-full">
                    <TabsHeader
                      className="bg-transparent"
                      indicatorProps={{
                        className: "shadow-none",
                        style: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
                      }}
                    >
                      {seasons.map(({ label, value }) => (
                        <Tab
                          key={value}
                          value={value}
                          onClick={() => setFilterType(value)}
                          className={filterType === value ? "text-white" : "text-gray-700"}
                        >
                          {label}
                        </Tab>
                      ))}
                    </TabsHeader>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card border-0 shadow-hover h-100" 
                   style={{ 
                     background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                     animation: 'fadeIn 0.6s ease-out'
                   }}>
                <div className="card-body text-center text-white p-4">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
                  <h2 className="fw-bold mb-1">{bioProducts.length}</h2>
                  <p className="mb-0 fw-medium">Organic Products</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-hover h-100" 
                   style={{ 
                     background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                     animation: 'fadeIn 0.7s ease-out'
                   }}>
                <div className="card-body text-center text-white p-4">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌾</div>
                  <h2 className="fw-bold mb-1">{filteredProduits.length}</h2>
                  <p className="mb-0 fw-medium">Total Products</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-hover h-100" 
                   style={{ 
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     animation: 'fadeIn 0.8s ease-out'
                   }}>
                <div className="card-body text-center text-white p-4">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍎</div>
                  <h2 className="fw-bold mb-1">{regularProducts.length}</h2>
                  <p className="mb-0 fw-medium">Regular Products</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <Typography variant="h6" className="text-secondary fw-bold mb-0">
                <span className="badge" style={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  fontSize: '1rem',
                  padding: '0.5rem 1rem'
                }}>
                  {filteredProduits.length} Product{filteredProduits.length !== 1 ? 's' : ''}
                </span>
              </Typography>
            </div>
            <div className="col-md-6 mb-3 text-md-end">
              {user && user.type === 'Guide' && (
                <Link to="/dashboard/produits" className="btn btn-outline-danger btn-sm">
                  <i className="fas fa-cog me-2"></i>
                  Manage Products
                </Link>
              )}
            </div>
          </div>

          {/* Organic Products Section */}
          {bioProducts.length > 0 && (
            <div className="mb-5">
              <div className="d-flex align-items-center gap-2 mb-4">
                <SparklesIcon className="h-6 w-6 text-success" />
                <h4 className="text-success fw-bold mb-0">Organic Products</h4>
                <span className="badge bg-success">{bioProducts.length}</span>
              </div>
              <div className="row g-4">
                {bioProducts.map((produit, index) => (
                  <div key={produit.uri} className="col-lg-3 col-md-4 col-sm-6"
                       style={{ 
                         animation: `fadeIn 0.5s ease-out ${index * 0.05}s backwards`
                       }}>
                    <div className="card h-100 shadow-hover border-0 overflow-hidden hover-lift" 
                         style={{ borderLeft: '4px solid #43e97b' }}>
                      <div className="position-relative">
                        <div 
                          className="card-header border-0 text-center"
                          style={{ 
                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            padding: '1.5rem 1rem'
                          }}
                        >
                          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                            {getSeasonEmoji(produit.saison)}
                          </div>
                        </div>
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-success">
                            <i className="fas fa-leaf me-1"></i>BIO
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-body p-3">
                        <h6 className="fw-bold text-secondary mb-2">{produit.nom}</h6>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="badge bg-light text-dark">
                            {produit.saison || "N/A"}
                          </span>
                          <span className="text-success">
                            <i className="fas fa-check-circle"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Products Section */}
          {regularProducts.length > 0 && (
            <div className="mb-5">
              <h4 className="text-secondary fw-bold mb-4">Regular Products</h4>
              <div className="row g-4">
                {regularProducts.map((produit, index) => (
                  <div key={produit.uri} className="col-lg-3 col-md-4 col-sm-6"
                       style={{ 
                         animation: `fadeIn 0.5s ease-out ${(bioProducts.length * 0.05) + (index * 0.05)}s backwards`
                       }}>
                    <div className="card h-100 shadow-hover border-0 overflow-hidden hover-lift">
                      <div className="position-relative">
                        <div 
                          className="card-header border-0 text-center"
                          style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '1.5rem 1rem'
                          }}
                        >
                          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                            {getSeasonEmoji(produit.saison)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-body p-3">
                        <h6 className="fw-bold text-secondary mb-2">{produit.nom}</h6>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="badge bg-light text-dark">
                            {produit.saison || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredProduits.length === 0 && (
            <div className="row">
              <div className="col-12">
                <div className="card shadow-hover text-center py-5" style={{ animation: 'fadeIn 0.6s ease-out' }}>
                  <div className="card-body">
                    <div style={{ fontSize: '4rem', opacity: 0.3 }}>🔍</div>
                    <Typography variant="h5" className="text-secondary mb-2">
                      No products found
                    </Typography>
                    <Typography variant="small" className="text-muted">
                      Try adjusting your search or filter criteria
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Back to Home */}
      <section className="pt-7 pb-0">
        <div className="container">
          <div className="text-center mb-5">
            <Link to="/" className="btn btn-danger">
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

export default ProduitsBrowse;

