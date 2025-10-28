import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import '../landing/landing.css';

export function NaturalZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [visits, setVisits] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await api.getZonesNaturelles();
      const parsedZones = parseZones(data);
      setZones(parsedZones);

      if (user) {
        try {
          const visitData = await api.getVisits();
          const visitMap = {};
          (visitData.zones || []).forEach((uri) => {
            visitMap[uri] = true;
          });
          setVisits(visitMap);
        } catch (err) {
          console.error('Error loading visits:', err);
        }
      } else {
        setVisits({});
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseZones = (data) => {
    const zonesMap = {};
    
    data.forEach(item => {
      const uri = item.s?.value;
      const predicate = item.p?.value;
      const object = item.o?.value;
      
      if (!uri) return;
      
      if (!zonesMap[uri]) {
        zonesMap[uri] = { uri };
      }
      
      const propName = predicate?.split('#')[1];
      
      if (propName === 'nom') zonesMap[uri].nom = object;
      if (propName === 'type') zonesMap[uri].type = object;
    });
    
    return Object.values(zonesMap).filter(z => z.nom);
  };


  const getTypeColor = (type) => {
    const colors = {
      'Parc National': 'green',
      'Réserve Naturelle': 'blue',
      'Forêt': 'teal',
      'Montagne': 'gray',
      'Plage': 'cyan',
      'Désert': 'amber',
      'Lac': 'light-blue',
      'Rivière': 'blue-gray',
    };
    return colors[type] || 'gray';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Parc National': '🏞️',
      'Réserve Naturelle': '🌳',
      'Forêt': '🌲',
      'Montagne': '⛰️',
      'Plage': '🏖️',
      'Désert': '🏜️',
      'Lac': '🏞️',
      'Rivière': '🌊',
    };
    return icons[type] || '🗺️';
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
  };

  const handleVisit = async (zone) => {
    // Check if user is logged in
    if (!user) {
      showAlert('Please login to plan a visit', 'warning');
      setTimeout(() => navigate('/auth/sign-in'), 2000);
      return;
    }

    if (visits[zone.uri]) {
      try {
        await api.removeVisit(zone.uri);
        setVisits(prev => {
          const updated = { ...prev };
          delete updated[zone.uri];
          return updated;
        });
        showAlert(`Visit to "${zone.nom}" canceled`, 'info');
      } catch (error) {
        console.error('Error removing visit:', error);
        showAlert('Failed to cancel planned visit. Please try again.', 'error');
      }
      return;
    }

    try {
      await api.addVisit(zone.uri);
      setVisits(prev => ({
        ...prev,
        [zone.uri]: true
      }));
      showAlert(`Visit to "${zone.nom}" planned successfully! 🎉`, 'success');
    } catch (error) {
      console.error('Error planning visit:', error);
      showAlert('Failed to plan this visit. Please try again.', 'error');
    }
  };

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          zone.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || zone.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="landing-page">
        <Navbar />
        <main className="main" style={{ paddingTop: '7rem', minHeight: '100vh' }}>
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Navbar />
      
      <main className="main" style={{ paddingTop: '7rem' }}>
        {/* Alert Message */}
        {alert.show && (
          <div className="position-fixed top-0 start-50 translate-middle-x" style={{ zIndex: 9999, marginTop: '100px' }}>
            <div className={`alert alert-${
              alert.type === 'success' ? 'success' : 
              alert.type === 'warning' ? 'warning' : 
              alert.type === 'info' ? 'info' : 'danger'
            } alert-dismissible fade show shadow-lg`} role="alert">
              <strong>{alert.message}</strong>
              <button type="button" className="btn-close" onClick={() => setAlert({ show: false, message: '', type: '' })}></button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="pt-5 pb-5" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 text-center text-white">
                <h5 className="text-white mb-3">DISCOVER NATURE</h5>
                <h1 className="fs-xl-10 fs-lg-8 fs-7 fw-bold font-cursive text-capitalize mb-4">Natural Zones</h1>
                <p className="lead mb-0 fw-medium">
                  Explore protected natural areas, national parks, and pristine environments.<br className="d-none d-xl-block" />
                  Discover the beauty of eco-tourism destinations!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="pt-5 pb-3">
          <div className="container">
            <div className="row g-3">
              <div className="col-lg-6 col-md-6">
                <input
                  type="text"
                  className="form-control form-control-lg shadow-sm"
                  placeholder="Search natural zones by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-lg-6 col-md-6">
                <select
                  className="form-select form-select-lg shadow-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">All Zone Types</option>
                  <option value="Parc National">National Park</option>
                  <option value="Réserve Naturelle">Nature Reserve</option>
                  <option value="Forêt">Forest</option>
                  <option value="Montagne">Mountain</option>
                  <option value="Plage">Beach</option>
                  <option value="Désert">Desert</option>
                  <option value="Lac">Lake</option>
                  <option value="Rivière">River</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Zones Grid */}
        <section className="pt-3 pb-7">
          <div className="container">
            <div className="row g-4">
              {filteredZones.map((zone) => (
                <div key={zone.uri} className="col-lg-4 col-md-6 mb-4">
                  <div className="card overflow-hidden shadow h-100">
                    <div className="card-body py-4 px-3">
                      <div className="d-flex flex-column justify-content-between mb-3">
                        <h4 className="text-secondary fw-medium mb-3">
                          <a className="link-900 text-decoration-none" href="#!">{zone.nom}</a>
                        </h4>
                        <span className={`badge ${
                          zone.type === 'Parc National' ? 'bg-success' :
                          zone.type === 'Réserve Naturelle' ? 'bg-primary' :
                          zone.type === 'Forêt' ? 'bg-info' :
                          zone.type === 'Montagne' ? 'bg-secondary' :
                          zone.type === 'Plage' ? 'bg-info' :
                          zone.type === 'Désert' ? 'bg-warning text-dark' :
                          zone.type === 'Lac' ? 'bg-primary' : 'bg-info'
                        } w-fit mb-3`}>
                          {getTypeIcon(zone.type)} {zone.type}
                        </span>
                      </div>
                      
                      <button
                        className={`btn w-100 ${visits[zone.uri] ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => handleVisit(zone)}
                        disabled={visits[zone.uri]}
                      >
                        {visits[zone.uri] ? (
                          <>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="me-2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Visit Planned ✓
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="me-2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Plan a Visit
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredZones.length === 0 && (
              <div className="text-center py-5">
                <h4 className="text-muted">No natural zones found</h4>
                <p className="text-muted">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <section className="pt-7 pb-0">
          <div className="container">
            <hr className="text-300" />
            <div className="row justify-content-center py-3">
              <div className="col-12 text-center">
                <p className="fs--1 my-2 fw-medium text-200">All rights Reserved © Travel-Tourism 2025</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default NaturalZones;
