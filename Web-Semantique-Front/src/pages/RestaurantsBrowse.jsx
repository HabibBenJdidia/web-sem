import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Input,
  Button,
  Spinner,
} from "@material-tailwind/react";
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  MicrophoneIcon,
  PaperAirplaneIcon,
  StopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";
import api from "@/services/api";
import apiBSila from "@/services/apiBSila";
import { useAuth } from "@/context/AuthContext";
import { ReservationDialog } from "@/components/ReservationDialog";
import "./landing/landing.css";

export function RestaurantsBrowse() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // AI BSila States
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [searchTerm, restaurants]);

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
      const [restaurantsData, destinationsData, produitsData] = await Promise.all([
        api.getRestaurants(),
        api.getDestinations(),
        api.getProduits(),
      ]);

      const parsedRestaurants = parseRestaurants(restaurantsData);
      setRestaurants(parsedRestaurants);
      setFilteredRestaurants(parsedRestaurants);
      setDestinations(parseDestinations(destinationsData));
      setProduits(parseProduits(produitsData));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseRestaurants = (data) => {
    if (!Array.isArray(data)) return [];
    
    const restaurantsMap = {};
    data.forEach((item) => {
      const uri = item.s?.value || "";
      const predicate = item.p?.value || "";
      const object = item.o?.value || "";

      if (!restaurantsMap[uri]) {
        restaurantsMap[uri] = { uri, sert: [] };
      }

      if (predicate.includes("#nom")) {
        restaurantsMap[uri].nom = object;
      } else if (predicate.includes("#situeDans")) {
        restaurantsMap[uri].situe_dans = object;
      } else if (predicate.includes("#sert")) {
        restaurantsMap[uri].sert.push(object);
      }
    });

    return Object.values(restaurantsMap);
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
      }
    });

    return Object.values(destinationsMap).filter(d => d.nom);
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
      } else if (predicate.includes("#bio")) {
        produitsMap[uri].bio = object === "true" || object === true;
      }
    });

    return Object.values(produitsMap).filter(p => p.nom);
  };

  const filterRestaurants = () => {
    if (!searchTerm.trim()) {
      setFilteredRestaurants(restaurants);
      return;
    }

    const filtered = restaurants.filter((restaurant) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = restaurant.nom?.toLowerCase().includes(searchLower);
      const locationMatch = getDestinationName(restaurant.situe_dans)
        ?.toLowerCase()
        .includes(searchLower);
      return nameMatch || locationMatch;
    });

    setFilteredRestaurants(filtered);
  };

  const getDestinationName = (uri) => {
    if (!uri) return "Unknown";
    const dest = destinations.find(d => d.uri === uri);
    return dest?.nom || uri.split('#')[1] || uri;
  };

  const getProduitName = (uri) => {
    const prod = produits.find(p => p.uri === uri);
    return prod?.nom || uri.split('#')[1] || uri;
  };

  const getProduit = (uri) => {
    return produits.find(p => p.uri === uri);
  };

  const handleBookNow = (restaurant) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/auth/sign-in');
      return;
    }
    setSelectedRestaurant(restaurant);
    setReservationDialogOpen(true);
  };

  const handleCloseReservationDialog = () => {
    setReservationDialogOpen(false);
    setSelectedRestaurant(null);
  };

  // AI BSila Functions
  const handleAiSearch = async (e) => {
    e?.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const response = await apiBSila.voiceQuery(aiQuery);

      setAiResponse(response);

      // Parse and filter restaurants based on AI response
      if (response.sparql_results && Array.isArray(response.sparql_results)) {
        const parsedResults = parseRestaurants(response.sparql_results);
        setFilteredRestaurants(parsedResults);
      }

      // Play voice response
      if (response.voice_audio) {
        playVoice(response.voice_audio);
      }

    } catch (error) {
      console.error("AI Search error:", error);
      setAiResponse({
        success: false,
        error: error.message
      });
    } finally {
      setAiLoading(false);
    }
  };

  const startListening = () => {
    setIsListening(true);

    const onResult = (transcript) => {
      setAiQuery(transcript);
      setIsListening(false);
    };

    const onError = (error) => {
      console.error("Speech recognition error:", error);
      setIsListening(false);
    };

    const recognitionInstance = apiBSila.startVoiceRecognition(onResult, onError);
    setRecognition(recognitionInstance);
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const playVoice = (base64Audio) => {
    if (currentAudio) {
      apiBSila.stopVoiceAudio(currentAudio);
    }

    const audio = apiBSila.playVoiceAudio(base64Audio);
    setCurrentAudio(audio);
    setIsSpeaking(true);

    if (audio) {
      audio.onended = () => setIsSpeaking(false);
    }
  };

  const stopVoice = () => {
    if (currentAudio) {
      apiBSila.stopVoiceAudio(currentAudio);
      setIsSpeaking(false);
    }
  };

  const resetSearch = () => {
    setAiQuery("");
    setAiResponse(null);
    setFilteredRestaurants(restaurants);
  };

  if (loading) {
    return (
      <div className="landing-page">
        <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '7rem' }}>
          <Typography variant="h6">Loading restaurants...</Typography>
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
                          to="/dashboard/restaurants" 
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          🍴
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
                  <i className="fas fa-leaf me-2"></i>
                  Eco-Friendly Dining
                </span>
              </div>
              <h1 className="fs-xl-10 fs-lg-8 fs-7 fw-bold mb-4" style={{ 
                animation: 'fadeIn 1s ease-out',
                textShadow: '0 2px 20px rgba(0,0,0,0.2)'
              }}>
                Discover Authentic Local Restaurants
              </h1>
              <p className="fs-5 fw-medium mb-4 px-lg-5" style={{ 
                animation: 'fadeIn 1.2s ease-out',
                lineHeight: '1.8'
              }}>
                Experience the finest eco-friendly dining with restaurants committed to sustainability,
                serving fresh local ingredients and organic products
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap" style={{ animation: 'fadeIn 1.4s ease-out' }}>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" 
                       style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <span className="fw-medium">Local Ingredients</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" 
                       style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <span className="fw-medium">Organic Products</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" 
                       style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <span className="fw-medium">Sustainable Dining</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-5 pb-9">
        <div className="container">
          {/* AI BSila Search */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="card shadow-lg border-0" style={{ 
                animation: 'fadeIn 0.5s ease-out',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                border: '2px solid #667eea !important'
              }}>
                <div className="card-body p-4">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center gap-2 mb-2">
                      <MicrophoneIcon className="h-8 w-8" style={{ color: '#667eea' }} />
                      <Typography variant="h5" className="fw-bold mb-0" style={{ color: '#667eea' }}>
                        AI BSila Assistant
                      </Typography>
                    </div>
                    <Typography variant="small" className="text-muted d-block">
                      Ask me anything about restaurants! Try: "Show me eco-friendly restaurants" or "Restaurants with organic products"
                    </Typography>
                  </div>

                  {/* Search Input */}
                  <form onSubmit={handleAiSearch} className="mb-3">
                    <div className="d-flex gap-2">
                      <div className="flex-grow-1">
                        <Input
                          placeholder="Ask AI BSila about restaurants..."
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          disabled={aiLoading || isListening}
                          size="lg"
                          className="!border-purple-300"
                        />
                      </div>
                      <Button
                        size="md"
                        color={isListening ? "red" : "purple"}
                        className="rounded-full px-4"
                        onClick={isListening ? stopListening : startListening}
                        type="button"
                      >
                        {isListening ? (
                          <StopIcon className="h-5 w-5" />
                        ) : (
                          <MicrophoneIcon className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        size="md"
                        color="blue"
                        className="rounded-full px-4"
                        type="submit"
                        disabled={aiLoading || !aiQuery.trim()}
                      >
                        {aiLoading ? (
                          <Spinner className="h-5 w-5" />
                        ) : (
                          <PaperAirplaneIcon className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </form>

                  {isListening && (
                    <div className="text-center mb-3">
                      <span className="badge bg-danger">
                        <MicrophoneIcon className="h-4 w-4 d-inline me-1" />
                        Listening...
                      </span>
                    </div>
                  )}

                  {/* AI Response */}
                  {aiResponse && (
                    <div className="mt-3">
                      {aiResponse.success !== false ? (
                        <div className="card bg-white border-0 shadow-sm">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Typography variant="small" className="fw-bold text-success">
                                AI Response:
                              </Typography>
                              {aiResponse.voice_audio && (
                                <Button
                                  size="sm"
                                  variant="text"
                                  color="green"
                                  onClick={() =>
                                    isSpeaking ? stopVoice() : playVoice(aiResponse.voice_audio)
                                  }
                                >
                                  {isSpeaking ? (
                                    <SpeakerXMarkIcon className="h-4 w-4" />
                                  ) : (
                                    <SpeakerWaveIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                            <Typography variant="small" className="text-secondary">
                              {aiResponse.vocal_response}
                            </Typography>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-danger mb-0">
                          <Typography variant="small">
                            Error: {aiResponse.error}
                          </Typography>
                        </div>
                      )}
                      <div className="text-center mt-3">
                        <Button
                          size="sm"
                          variant="outlined"
                          color="purple"
                          onClick={resetSearch}
                        >
                          Reset Search
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Count & Stats */}
          <div className="row mb-5">
            <div className="col-md-6 mb-3">
              <div className="d-flex align-items-center">
                <Typography variant="h6" className="text-secondary fw-bold mb-0">
                  <span className="badge" style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1rem',
                    padding: '0.5rem 1rem'
                  }}>
                    {filteredRestaurants.length} Restaurant{filteredRestaurants.length !== 1 ? 's' : ''} Found
                  </span>
                </Typography>
              </div>
            </div>
            <div className="col-md-6 mb-3 text-md-end">
              {user && user.type === 'Guide' && (
                <Link to="/dashboard/restaurants" className="btn btn-outline-primary btn-sm">
                  <i className="fas fa-cog me-2"></i>
                  Manage Restaurants
                </Link>
              )}
            </div>
          </div>

          {/* Restaurants Grid */}
          {filteredRestaurants.length === 0 ? (
            <div className="row">
              <div className="col-12">
                <div className="card shadow-hover text-center py-5" style={{ animation: 'fadeIn 0.6s ease-out' }}>
                  <div className="card-body">
                    <div style={{ fontSize: '4rem', opacity: 0.3 }}>🔍</div>
                    <Typography variant="h5" className="text-secondary mb-2">
                      No restaurants found
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
              {filteredRestaurants.map((restaurant, index) => (
                <div key={restaurant.uri} className="col-lg-4 col-md-6 mb-4" 
                     style={{ 
                       animation: `fadeIn 0.5s ease-out ${index * 0.1}s backwards`
                     }}>
                  <div className="card h-100 shadow-hover border-0 overflow-hidden hover-lift">
                    <div className="position-relative">
                      <div 
                        className="card-header border-0"
                        style={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          padding: '2rem 1.5rem'
                        }}
                      >
                        <div className="text-center">
                          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍽️</div>
                          <h5 className="text-white fw-bold mb-0">{restaurant.nom}</h5>
                        </div>
                      </div>
                      <div className="position-absolute top-0 end-0 m-3">
                        <span className="badge bg-light text-dark shadow-sm">
                          <i className="fas fa-star text-warning me-1"></i>
                          Featured
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-body p-4">
                      {/* Location */}
                      <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <MapPinIcon className="h-4 w-4 text-primary me-2" style={{ minWidth: '16px' }} />
                        <Typography variant="small" className="text-secondary fw-medium mb-0">
                          {getDestinationName(restaurant.situe_dans)}
                        </Typography>
                      </div>

                      {/* Products Served */}
                      <div className="mb-3">
                        <Typography variant="small" className="fw-bold mb-2 text-secondary d-block">
                          🌱 Menu Highlights
                        </Typography>
                        {restaurant.sert?.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2">
                            {restaurant.sert.slice(0, 4).map((produitUri, idx) => {
                              const produit = getProduit(produitUri);
                              return (
                                <span
                                  key={idx}
                                  className={`badge ${produit?.bio ? 'bg-success' : 'bg-primary'}`}
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  {produit?.bio && <i className="fas fa-leaf me-1"></i>}
                                  {getProduitName(produitUri)}
                                </span>
                              );
                            })}
                            {restaurant.sert.length > 4 && (
                              <span className="badge bg-light text-dark" style={{ fontSize: '0.75rem' }}>
                                +{restaurant.sert.length - 4} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <Typography variant="small" className="text-muted fst-italic">
                            Menu coming soon...
                          </Typography>
                        )}
                      </div>

                      {/* Bio Products Count */}
                      {restaurant.sert?.length > 0 && (
                        <div className="pt-3 border-top">
                          <div className="d-flex justify-content-between align-items-center">
                            <Typography variant="small" className="text-success fw-medium mb-0">
                              <i className="fas fa-check-circle me-1"></i>
                              {restaurant.sert.filter(uri => getProduit(uri)?.bio).length} Organic
                            </Typography>
                            <Typography variant="small" className="text-muted mb-0">
                              {restaurant.sert.length} Items
                            </Typography>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="card-footer bg-light border-0 p-3">
                      <button
                        onClick={() => handleBookNow(restaurant)}
                        className="btn w-100"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              ))}
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

      {/* Reservation Dialog */}
      <ReservationDialog
        open={reservationDialogOpen}
        onClose={handleCloseReservationDialog}
        restaurant={selectedRestaurant}
      />
    </div>
  );
}

export default RestaurantsBrowse;

