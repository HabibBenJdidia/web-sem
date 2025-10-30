import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageGenerator from "@/components/ImageGenerator";
import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
  Spinner,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
} from "@material-tailwind/react";
import { 
  MagnifyingGlassIcon, 
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  HomeIcon,
  SparklesIcon,
  PlusIcon,
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
  
  // Form Dialog States
  const [openDialog, setOpenDialog] = useState(false);
  const [nomHebergement, setNomHebergement] = useState("");
  const [type, setType] = useState("");
  const [prix, setPrix] = useState("");
  const [nbChambres, setNbChambres] = useState("");
  const [niveauEco, setNiveauEco] = useState("");
  const [selectedPays, setSelectedPays] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [promptForGenerator, setPromptForGenerator] = useState("");

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

  // Form handling functions
  const uniquePays = [...new Set(destinations.map((d) => d.pays))].filter(Boolean).sort();
  const destinationsByPays = destinations.filter((d) => d.pays === selectedPays);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomHebergement.trim()) {
      alert("Le nom est requis");
      return;
    }
    if (!selectedDestination) {
      alert("La destination est requise");
      return;
    }

    const data = {
      nom: nomHebergement,
      type: type || null,
      prix: prix || null,
      nb_chambres: nbChambres || null,
      niveau_eco: niveauEco || null,
      situe_dans: selectedDestination,
    };

    try {
      await api.createHebergement(data);
      alert("Hébergement ajouté avec succès!");
      resetForm();
      // Reload data
      await loadData();
    } catch (error) {
      console.error("Erreur création:", error);
      alert("Erreur lors de la création: " + (error.message || "Inconnue"));
    }
  };

  const resetForm = () => {
    setNomHebergement("");
    setType("");
    setPrix("");
    setNbChambres("");
    setNiveauEco("");
    setSelectedPays("");
    setSelectedDestination("");
    setOpenDialog(false);
    setPromptForGenerator("");
    setGeneratedImage(null);
  };

  const handleGenerateImage = () => {
    if (!selectedPays || !type || !niveauEco) {
      alert("Remplis au moins un pays, un type et un niveau éco !");
      return;
    }
    // Generate prompt in English (required by Stability AI)
    const ecoText = niveauEco === "High" || niveauEco === "Élevé" ? "highly eco-friendly" : 
                    niveauEco === "Moyen" ? "moderately eco-friendly" : "eco-friendly";
    const generatedPrompt = `A ${type} ${ecoText} located in ${selectedPays}, modern and sustainable architecture, natural environment, panoramic view, photorealistic, 4k`;
    setPromptForGenerator(generatedPrompt);
  };

  const openAddDialog = () => {
    if (!user) {
      alert("Vous devez être connecté pour ajouter un hébergement");
      navigate('/auth/sign-in');
      return;
    }
    setOpenDialog(true);
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
          {/* Add Accommodation Button - Centered */}
          <div className="row">
            <div className="col-12 text-center">
              <button
                onClick={openAddDialog}
                className="btn btn-lg"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  padding: '1rem 2rem',
                  fontSize: '1.2rem',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                }}
              >
                <PlusIcon className="h-5 w-5 d-inline me-2" style={{ width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle' }} />
                Add Hebergement
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Add Accommodation Dialog */}
      <Dialog open={openDialog} handler={setOpenDialog} size="lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>Ajouter Hébergement</DialogHeader>
          <DialogBody divider className="space-y-4">
            <Input 
              label="Nom *" 
              value={nomHebergement} 
              onChange={(e) => setNomHebergement(e.target.value)} 
              required 
            />
            <Select label="Type" value={type} onChange={setType}>
              <Option value="">Sélectionner</Option>
              <Option value="Hotel">Hôtel</Option>
              <Option value="Villa">Villa</Option>
              <Option value="Apartment">Appartement</Option>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Prix (€)" 
                type="number" 
                value={prix} 
                onChange={(e) => setPrix(e.target.value)} 
              />
              <Input 
                label="Chambres" 
                type="number" 
                value={nbChambres} 
                onChange={(e) => setNbChambres(e.target.value)} 
              />
            </div>
            <Select label="Niveau Éco" value={niveauEco} onChange={setNiveauEco}>
              <Option value="">Sélectionner</Option>
              <Option value="Low">Faible</Option>
              <Option value="High">Élevé</Option>
            </Select>
            <Select label="Pays *" value={selectedPays} onChange={setSelectedPays}>
              <Option value="">Choisir un pays</Option>
              {uniquePays.map((p) => (
                <Option key={p} value={p}>{p}</Option>
              ))}
            </Select>
            <Select 
              label="Destination *" 
              value={selectedDestination} 
              onChange={setSelectedDestination} 
              disabled={!selectedPays} 
              required
            >
              <Option value="">
                {selectedPays ? "Choisir une destination" : "Sélectionnez un pays"}
              </Option>
              {destinationsByPays.map((d) => (
                <Option key={d.uri} value={d.uri}>
                  {d.nom} ({d.climat})
                </Option>
              ))}
            </Select>

            <Button 
              color="purple" 
              onClick={handleGenerateImage} 
              className="w-full" 
              disabled={!selectedPays || !type || !niveauEco}
              type="button"
            >
              Générer mon hébergement de rêve
            </Button>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <ImageGenerator 
                initialPrompt={promptForGenerator} 
                onImageGenerated={(b) => setGeneratedImage(`data:image/png;base64,${b}`)} 
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="text" onClick={resetForm}>Annuler</Button>
            <Button color="green" type="submit">Ajouter</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* IMAGE GÉNÉRÉE */}
      {generatedImage && (
        <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg text-center" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, maxWidth: '90%', maxHeight: '90%', overflow: 'auto' }}>
          <Typography variant="h5" className="mb-4 text-purple-800">Ton hébergement de rêve</Typography>
          <img src={generatedImage} alt="IA" className="max-w-2xl mx-auto rounded-lg shadow-2xl" style={{ maxWidth: '100%', height: 'auto' }} />
          <div className="flex gap-3 justify-center mt-4">
            <Button color="green" onClick={() => {
              const a = document.createElement("a");
              a.href = generatedImage;
              a.download = "hebergement-reve.png";
              a.click();
            }}>Télécharger</Button>
            <Button color="gray" onClick={() => setGeneratedImage(null)}>Fermer</Button>
          </div>
        </div>
      )}

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

