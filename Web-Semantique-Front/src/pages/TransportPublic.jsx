import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TransportChatBot } from "@/components/TransportChatBot";
import api from "@/services/api";
import "./TransportPublic.css";

// Map transport types to images and colors
const TRANSPORT_CONFIG = {
  "Vélo": {
    image: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400&h=300&fit=crop",
    color: "#10b981",
    icon: "🚴",
    description: "Eco-friendly cycling for sustainable travel"
  },
  "Train": {
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=300&fit=crop",
    color: "#3b82f6",
    icon: "🚆",
    description: "Comfortable and efficient rail transport"
  },
  "Bus": {
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop",
    color: "#f59e0b",
    icon: "🚌",
    description: "Affordable and accessible public transport"
  },
  "Voiture": {
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop",
    color: "#6b7280",
    icon: "🚗",
    description: "Standard vehicle transport option"
  },
  "Voiture électrique": {
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop",
    color: "#8b5cf6",
    icon: "⚡",
    description: "Zero-emission electric vehicle transport"
  },
  "Trottinette électrique": {
    image: "https://images.unsplash.com/photo-1583622797767-0cc1b0a2e61e?w=400&h=300&fit=crop",
    color: "#ec4899",
    icon: "🛴",
    description: "Quick and fun micro-mobility solution"
  },
  "Marche à pied": {
    image: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=300&fit=crop",
    color: "#14b8a6",
    icon: "🚶",
    description: "The most natural way to explore"
  },
  "EcoTransport": {
    image: "https://images.unsplash.com/photo-1500281781950-6cd80847ebcd?w=400&h=300&fit=crop",
    color: "#10b981",
    icon: "🌿",
    description: "Environmentally friendly sustainable transport"
  }
};

export function TransportPublic() {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [chatBotOpen, setChatBotOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [distance, setDistance] = useState(10);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      // api.fetch() already returns parsed JSON data
      const data = await api.fetch('/transport');
      // API returns { total, transports } format
      setTransports(data.transports || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transports:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransportConfig = (type) => {
    return TRANSPORT_CONFIG[type] || {
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
      color: "#6b7280",
      icon: "🚗",
      description: "Eco-friendly transport option"
    };
  };

  const filteredTransports = selectedType === "all" 
    ? transports 
    : transports.filter(t => t.type === selectedType);

  const transportTypes = ["all", ...new Set(transports.map(t => t.type))];

  const openPriceCalculator = (transport) => {
    setSelectedTransport(transport);
    setDistance(10);
    setPriceBreakdown(null);
    setPriceModalOpen(true);
  };

  const calculatePrice = async () => {
    if (!selectedTransport || distance <= 0) return;
    
    try {
      const data = await api.fetch('/transport/calculate-price', {
        method: 'POST',
        body: JSON.stringify({
          transport_type: selectedTransport.type,
          emission_co2_per_km: selectedTransport.emission_co2_per_km,
          distance_km: parseFloat(distance)
        })
      });
      
      setPriceBreakdown(data.pricing);
    } catch (err) {
      console.error('Error calculating price:', err);
      alert('Failed to calculate price');
    }
  };

  return (
    <div className="transport-public-page">
      <Navbar />
      
      {/* AI Assistant Button */}
      <button 
        className="ai-assistant-btn"
        onClick={() => setChatBotOpen(true)}
        title="AI Transport Assistant"
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
        </svg>
        <span>AI Assistant</span>
      </button>

      {/* ChatBot Component */}
      <TransportChatBot 
        isOpen={chatBotOpen} 
        onClose={() => setChatBotOpen(false)} 
      />
      
      <div className="transport-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Eco-Friendly Transport Options</h1>
          <p className="hero-subtitle">
            Explore sustainable ways to travel and reduce your carbon footprint
          </p>
        </div>
      </div>

      <div className="transport-container">
        {/* Filter Section */}
        <div className="filter-section">
          <h2 className="filter-title">Filter by Type</h2>
          <div className="filter-buttons">
            {transportTypes.map(type => (
              <button
                key={type}
                className={`filter-btn ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type === "all" ? "All Transports" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Transport Cards Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading transports...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p>Error loading transports: {error}</p>
          </div>
        ) : filteredTransports.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>No transports found</p>
          </div>
        ) : (
          <div className="transport-grid">
            {filteredTransports.map((transport, index) => {
              const config = getTransportConfig(transport.type);
              return (
                <div key={index} className="transport-card">
                  <div className="card-image-wrapper">
                    <img 
                      src={config.image} 
                      alt={transport.type} 
                      className="card-image"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop";
                      }}
                    />
                    <div className="card-badge" style={{ backgroundColor: config.color }}>
                      <span className="badge-text">{transport.type}</span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <h3 className="card-title">{transport.nom || `${transport.type} Transport`}</h3>
                    <p className="card-description">{config.description}</p>
                    
                    <div className="card-details">
                      <div className="detail-item">
                        <svg className="detail-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span className="detail-label">CO₂ Emission:</span>
                        <span className="detail-value co2">{transport.emission_co2_per_km || 0} g/km</span>
                      </div>
                      
                      <div className="detail-item">
                        <svg className="detail-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{transport.type}</span>
                      </div>
                      
                      {transport.empreinte && (
                        <div className="detail-item empreinte-item">
                          <svg className="detail-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                          <span className="detail-label">Empreinte:</span>
                          <span className={`detail-value empreinte-badge empreinte-${transport.empreinte.category_color}`}>
                            {transport.empreinte.category}
                          </span>
                        </div>
                      )}

                      {transport.price_per_km !== undefined && (
                        <div className="detail-item price-item">
                          <svg className="detail-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          <span className="detail-label">Prix:</span>
                          <span className="detail-value price">{transport.price_per_km.toFixed(2)} €/km</span>
                        </div>
                      )}
                    </div>

                    {transport.empreinte && transport.empreinte.valeur_co2_kg !== undefined && (
                      <div className="empreinte-detail">
                        <div className={`empreinte-value empreinte-bg-${transport.empreinte.category_color}`}>
                          <span className="empreinte-number">{transport.empreinte.valeur_co2_kg.toFixed(4)}</span>
                          <span className="empreinte-unit">kg CO₂</span>
                          {transport.empreinte.is_faible && (
                            <span className="empreinte-icon">✓</span>
                          )}
                        </div>
                      </div>
                    )}

                    {transport.emission_co2_per_km === 0 && (
                      <div className="eco-badge">
                        <span className="eco-badge-text">Zero Emission</span>
                      </div>
                    )}

                    <button 
                      className="calculate-price-btn"
                      onClick={() => openPriceCalculator(transport)}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                      </svg>
                      Calculer le Prix
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {!loading && !error && transports.length > 0 && (
        <div className="transport-stats">
          <div className="stat-card">
            <div className="stat-number">{transports.length}</div>
            <div className="stat-label">Transport Options</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {transports.filter(t => t.emission_co2_per_km === 0).length}
            </div>
            <div className="stat-label">Zero Emission</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {Math.round(transports.reduce((sum, t) => sum + (parseFloat(t.emission_co2_per_km) || 0), 0) / transports.length)}
            </div>
            <div className="stat-label">Avg CO₂ (g/km)</div>
          </div>
        </div>
      )}

      {/* Price Calculator Modal */}
      {priceModalOpen && selectedTransport && (
        <div className="modal-overlay" onClick={() => setPriceModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Calculateur de Prix</h2>
              <button className="modal-close" onClick={() => setPriceModalOpen(false)}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="transport-info">
                <div className="transport-name">{selectedTransport.nom || selectedTransport.type}</div>
                <div className="transport-type">{selectedTransport.type}</div>
                <div className="transport-emission">
                  {selectedTransport.emission_co2_per_km} g CO₂/km
                </div>
              </div>

              <div className="distance-input-group">
                <label htmlFor="distance">Distance (km)</label>
                <input
                  id="distance"
                  type="number"
                  min="0"
                  step="1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="distance-input"
                />
              </div>

              <button className="calculate-btn" onClick={calculatePrice}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                </svg>
                Calculer
              </button>

              {priceBreakdown && (
                <div className="price-result">
                  <div className="price-total">
                    <span className="price-label">Prix Total</span>
                    <span className="price-amount">{priceBreakdown.total} €</span>
                  </div>

                  <div className="price-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Prix de base</span>
                      <span className="breakdown-value">{priceBreakdown.base_price} €</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Coût distance ({priceBreakdown.distance_km} km)</span>
                      <span className="breakdown-value">{priceBreakdown.distance_cost} €</span>
                    </div>
                    <div className="breakdown-item carbon">
                      <span className="breakdown-label">Taxe carbone ({priceBreakdown.co2_kg} kg CO₂)</span>
                      <span className="breakdown-value">{priceBreakdown.carbon_tax} €</span>
                    </div>
                  </div>

                  <div className="eco-tip">
                    Choisissez un transport écologique pour réduire les coûts!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

