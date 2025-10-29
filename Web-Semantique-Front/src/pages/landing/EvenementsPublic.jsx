import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from "@/services/api";
import './landing.css';

export function EvenementsPublic() {
  const [evenements, setEvenements] = useState([]);
  const [villes, setVilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVille, setSelectedVille] = useState("all");
  const [filterDate, setFilterDate] = useState("all"); // all, upcoming, past

  useEffect(() => {
    fetchEvenements();
    fetchVilles();
  }, []);

  const fetchEvenements = async () => {
    try {
      setLoading(true);
      const data = await api.getEvenements();
      setEvenements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVilles = async () => {
    try {
      const data = await api.getVilles();
      const villesList = [];
      const villesMap = new Map();
      
      if (Array.isArray(data)) {
        data.forEach(row => {
          const uri = row.s?.value || row.uri;
          const predicate = row.p?.value?.split('#')[1] || '';
          const value = row.o?.value;
          
          if (uri && !villesMap.has(uri)) {
            villesMap.set(uri, { uri, nom: null });
          }
          
          if (uri && predicate === 'nom' && value) {
            const ville = villesMap.get(uri);
            ville.nom = value;
          }
        });
        
        villesList.push(...Array.from(villesMap.values()).filter(v => v.nom));
      }
      
      setVilles(villesList);
    } catch (error) {
      console.error("Erreur lors du chargement des villes:", error);
    }
  };

  const getVilleNom = (villeUri) => {
    if (!villeUri) return "Non spécifié";
    const ville = villes.find(v => v.uri === villeUri);
    return ville?.nom || villeUri.split("#").pop();
  };

  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) >= new Date();
  };

  const filteredEvenements = evenements.filter((evt) => {
    const matchSearch = evt.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVille = selectedVille === "all" || evt.a_lieu_dans === selectedVille;
    
    let matchDate = true;
    if (filterDate === "upcoming") {
      matchDate = isUpcoming(evt.event_date);
    } else if (filterDate === "past") {
      matchDate = !isUpcoming(evt.event_date);
    }
    
    return matchSearch && matchVille && matchDate;
  });

  const upcomingEvents = evenements.filter(e => isUpcoming(e.event_date));

  return (
    <div className="evenements-public-page">
      {/* Hero Section */}
      <section className="py-5 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 text-center">
              <h1 className="display-4 fw-bold text-primary mb-3">
                📅 Événements Écologiques
              </h1>
              <p className="lead text-muted mb-4">
                Participez à des événements engagés pour un tourisme responsable
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Link to="/" className="btn btn-outline-primary">
                  ← Retour à l'accueil
                </Link>
                <a href="#upcoming" className="btn btn-primary">
                  Événements à venir
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-3 bg-primary text-white">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4">
              <h4 className="mb-0">{evenements.length}</h4>
              <small>Événements au total</small>
            </div>
            <div className="col-md-4">
              <h4 className="mb-0">{upcomingEvents.length}</h4>
              <small>À venir</small>
            </div>
            <div className="col-md-4">
              <h4 className="mb-0">{villes.length}</h4>
              <small>Villes</small>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-4 bg-white border-bottom">
        <div className="container">
          <div className="row g-3 align-items-end">
            {/* Search */}
            <div className="col-md-5">
              <label className="form-label fw-semibold">🔍 Rechercher</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Nom de l'événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter by Ville */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">📍 Ville</label>
              <select
                className="form-select form-select-lg"
                value={selectedVille}
                onChange={(e) => setSelectedVille(e.target.value)}
              >
                <option value="all">Toutes les villes</option>
                {villes.map((ville) => (
                  <option key={ville.uri} value={ville.uri}>
                    {ville.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Date */}
            <div className="col-md-2">
              <label className="form-label fw-semibold">🗓️ Date</label>
              <select
                className="form-select form-select-lg"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="upcoming">À venir</option>
                <option value="past">Passés</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="col-md-2 text-end">
              <p className="mb-0 fw-semibold text-muted">
                {filteredEvenements.length} résultat{filteredEvenements.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-5" id="upcoming">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement des événements...</p>
            </div>
          ) : filteredEvenements.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
              </div>
              <h3 className="text-muted">Aucun événement trouvé</h3>
              <p className="text-muted">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredEvenements.map((evt) => {
                const upcoming = isUpcoming(evt.event_date);
                return (
                  <div key={evt.id || evt.uri} className="col-md-6 col-lg-4">
                    <div className={`card h-100 border-0 shadow-sm hover-lift ${upcoming ? 'border-primary' : ''}`}>
                      {/* Card Header */}
                      <div className={`card-header ${upcoming ? 'bg-primary' : 'bg-secondary'} text-white`}>
                        <div className="d-flex align-items-center justify-content-between">
                          <h5 className="card-title mb-0 fw-bold">
                            📅 {evt.nom}
                          </h5>
                          {upcoming && (
                            <span className="badge bg-warning text-dark">
                              🔥 À venir
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="card-body">
                        {/* Date */}
                        <div className="mb-3 p-3 bg-light rounded">
                          <div className="d-flex align-items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                            </svg>
                            <div>
                              <small className="text-muted d-block">DATE</small>
                              <strong>
                                {evt.event_date ? new Date(evt.event_date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'Non spécifiée'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Lieu */}
                        <div className="mb-3">
                          <h6 className="text-muted mb-1 small">📍 LIEU</h6>
                          <p className="mb-0 fw-semibold text-primary">
                            {getVilleNom(evt.a_lieu_dans)}
                          </p>
                        </div>

                        {/* Details Grid */}
                        <div className="row g-2 mb-3">
                          {/* Durée */}
                          <div className="col-6">
                            <div className="p-2 bg-light rounded text-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-primary mb-1" viewBox="0 0 16 16">
                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                              </svg>
                              <div className="small text-muted">DURÉE</div>
                              <strong>{evt.event_duree_heures}h</strong>
                            </div>
                          </div>

                          {/* Prix */}
                          <div className="col-6">
                            <div className="p-2 bg-light rounded text-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-success mb-1" viewBox="0 0 16 16">
                                <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                              </svg>
                              <div className="small text-muted">PRIX</div>
                              <strong className="text-success">{evt.event_prix}€</strong>
                            </div>
                          </div>
                        </div>

                        {/* ID Badge */}
                        <div className="text-end">
                          <span className="badge bg-light text-dark border small">
                            ID: {evt.id}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="card-footer bg-transparent border-top">
                        <div className="d-flex justify-content-between align-items-center">
                          {upcoming ? (
                            <>
                              <span className="text-success small fw-semibold">
                                ✓ Inscriptions ouvertes
                              </span>
                              <button className="btn btn-sm btn-primary">
                                S'inscrire →
                              </button>
                            </>
                          ) : (
                            <span className="text-muted small">
                              📌 Événement terminé
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="mb-3">Organisez votre événement écologique</h2>
          <p className="lead mb-4">
            Rejoignez notre plateforme pour créer et gérer vos événements
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/auth/sign-in" className="btn btn-light btn-lg">
              Se connecter
            </Link>
            <Link to="/auth/sign-up" className="btn btn-outline-light btn-lg">
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        }
        .bg-gradient-to-br {
          background: linear-gradient(135deg, var(--bs-blue-50) 0%, var(--bs-indigo-50) 100%);
        }
      `}</style>
    </div>
  );
}

export default EvenementsPublic;
