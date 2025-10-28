import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import '../landing/landing.css';

export function Activities() {
  const [activities, setActivities] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [participations, setParticipations] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitesData, zonesData] = await Promise.all([
        api.getActivites(),
        api.getZonesNaturelles()
      ]);
      
      const parsedActivities = parseActivities(activitesData);
      const parsedZones = parseZones(zonesData);
      setActivities(parsedActivities);
      setZones(parsedZones);

      if (user) {
        try {
          const participationData = await api.getParticipations();
          const participationMap = {};
          (participationData.activities || []).forEach((uri) => {
            participationMap[uri] = true;
          });
          setParticipations(participationMap);
        } catch (err) {
          console.error('Error loading participations:', err);
        }
      } else {
        setParticipations({});
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseActivities = (data) => {
    const activitiesMap = {};
    
    data.forEach(item => {
      const uri = item.s?.value;
      const predicate = item.p?.value;
      const object = item.o?.value;
      
      if (!uri) return;
      
      if (!activitiesMap[uri]) {
        activitiesMap[uri] = { uri };
      }
      
      const propName = predicate?.split('#')[1];
      
      if (propName === 'nom') activitiesMap[uri].nom = object;
      if (propName === 'difficulte') activitiesMap[uri].difficulte = object;
      if (propName === 'dureeHeures') activitiesMap[uri].duree_heures = parseFloat(object);
      if (propName === 'prix') activitiesMap[uri].prix = parseFloat(object);
      if (propName === 'estDansZone') activitiesMap[uri].est_dans_zone = object;
    });
    
    return Object.values(activitiesMap).filter(a => a.nom);
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


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'green';
      case 'Moyenne': return 'amber';
      case 'Difficile': return 'red';
      default: return 'gray';
    }
  };

  const getZoneName = (zoneUri) => {
    const zone = zones.find(z => z.uri === zoneUri);
    return zone?.nom || 'Unknown Zone';
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
  };

  const handleParticipate = async (activity) => {
    // Check if user is logged in
    if (!user) {
      showAlert('Please login to participate in activities', 'warning');
      setTimeout(() => navigate('/auth/sign-in'), 2000);
      return;
    }

    if (participations[activity.uri]) {
      try {
        await api.removeParticipation(activity.uri);
        setParticipations(prev => {
          const updated = { ...prev };
          delete updated[activity.uri];
          return updated;
        });
        showAlert(`You are no longer registered for "${activity.nom}"`, 'info');
      } catch (error) {
        console.error('Error removing participation:', error);
        showAlert('Failed to cancel participation. Please try again.', 'error');
      }
      return;
    }

    try {
      await api.addParticipation(activity.uri);
      setParticipations(prev => ({
        ...prev,
        [activity.uri]: true
      }));
      showAlert(`Successfully registered for "${activity.nom}"! 🎉`, 'success');
    } catch (error) {
      console.error('Error adding participation:', error);
      showAlert('Failed to register for this activity. Please try again.', 'error');
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || activity.difficulte === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="landing-page">
        <Navbar />
        <main className="main" style={{ paddingTop: '7rem', minHeight: '100vh' }}>
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
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
        <section className="pt-5 pb-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 text-center text-white">
                <h5 className="text-white mb-3">EXPLORE ACTIVITIES</h5>
                <h1 className="fs-xl-10 fs-lg-8 fs-7 fw-bold font-cursive text-capitalize mb-4">Eco-Friendly Activities</h1>
                <p className="lead mb-0 fw-medium">
                  Discover amazing outdoor activities in beautiful natural zones.<br className="d-none d-xl-block" />
                  From easy walks to challenging hikes, find your perfect adventure!
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
                  placeholder="Search activities by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-lg-6 col-md-6">
                <select
                  className="form-select form-select-lg shadow-sm"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">All Difficulty Levels</option>
                  <option value="Facile">Easy (Facile)</option>
                  <option value="Moyenne">Medium (Moyenne)</option>
                  <option value="Difficile">Difficult (Difficile)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Activities Grid */}
        <section className="pt-3 pb-7">
          <div className="container">
            <div className="row g-4">
              {filteredActivities.map((activity) => (
                <div key={activity.uri} className="col-lg-4 col-md-6 mb-4">
                  <div className="card overflow-hidden shadow h-100">
                    <div className="card-body py-4 px-3">
                      <div className="d-flex flex-column flex-lg-row justify-content-between mb-3">
                        <h4 className="text-secondary fw-medium">
                          <a className="link-900 text-decoration-none" href="#!">{activity.nom}</a>
                        </h4>
                        <span className="fs-1 fw-medium text-primary">${activity.prix}</span>
                      </div>
                      
                      <div className="mb-3">
                        <span className={`badge ${
                          activity.difficulte === 'Facile' ? 'bg-success' :
                          activity.difficulte === 'Moyenne' ? 'bg-warning text-dark' : 'bg-danger'
                        } me-2`}>
                          {activity.difficulte}
                        </span>
                        <span className="text-muted fw-medium">{activity.duree_heures} hours</span>
                      </div>
                      
                      {activity.est_dans_zone && (
                        <div className="d-flex align-items-center mb-3">
                          <span className="text-muted small">📍 Location: {getZoneName(activity.est_dans_zone)}</span>
                        </div>
                      )}
                      
                      <button
                        className={`btn w-100 ${participations[activity.uri] ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => handleParticipate(activity)}
                      >
                        {participations[activity.uri] ? (
                          <>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="me-2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Registered ✓ (Click to cancel)
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="me-2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                            </svg>
                            Participate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-5">
                <h4 className="text-muted">No activities found</h4>
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

export default Activities;
