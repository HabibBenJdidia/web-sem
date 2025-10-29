import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from "@/services/api";
import './landing.css';

export function CertificationsPublic() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const data = await api.getCertifications();
      setCertifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des certifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertifications = certifications.filter((cert) => {
    // Support both old schema (label_nom, organisme) and new schema (nom, organisme_certificateur)
    const nom = cert.nom || cert.label_nom || '';
    const organisme = cert.organisme_certificateur || cert.organisme || '';
    const type = cert.type_certification || cert.type_certif || '';
    
    const matchSearch = nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       organisme.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === "all" || type === selectedType;
    return matchSearch && matchType;
  });

  const certificationTypes = [...new Set(certifications.map(c => c.type_certification || c.type_certif))].filter(Boolean);

  return (
    <div className="certifications-public-page">
      {/* Header */}
      <section className="py-5 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 text-center">
              <h1 className="display-4 fw-bold text-success mb-3">
                🌿 Certifications Écologiques
              </h1>
              <p className="lead text-muted mb-4">
                Découvrez les certifications environnementales reconnues pour un tourisme durable
              </p>
              <Link to="/" className="btn btn-outline-success">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-4 bg-white border-bottom">
        <div className="container">
          <div className="row g-3 align-items-end">
            {/* Search */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">🔍 Rechercher</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Nom de certification, organisme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter by Type */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">📋 Type</label>
              <select
                className="form-select form-select-lg"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Tous les types</option>
                {certificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="col-md-2 text-end">
              <p className="mb-0 fw-semibold text-muted">
                {filteredCertifications.length} résultat{filteredCertifications.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="py-5">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement des certifications...</p>
            </div>
          ) : filteredCertifications.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
              </div>
              <h3 className="text-muted">Aucune certification trouvée</h3>
              <p className="text-muted">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredCertifications.map((cert) => (
                <div key={cert.id || cert.uri} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm hover-lift">
                    {/* Card Header */}
                    <div className="card-header bg-success text-white">
                      <div className="d-flex align-items-center justify-content-between">
                        <h5 className="card-title mb-0 fw-bold">
                           {cert.nom || cert.label_nom || 'Certification'}
                        </h5>
                        {(cert.certification_valide || cert.annee_obtention) && (
                          <span className="badge bg-light text-success">
                            ✓ {cert.annee_obtention ? new Date(cert.annee_obtention).getFullYear() : 'Valide'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      {/* Type */}
                      {(cert.type_certification || cert.type_certif) && (
                        <div className="mb-3">
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                            📋 {cert.type_certification || cert.type_certif}
                          </span>
                        </div>
                      )}

                      {/* Organisme */}
                      <div className="mb-3">
                        <h6 className="text-muted mb-1 small">ORGANISME CERTIFICATEUR</h6>
                        <p className="mb-0 fw-semibold">
                          🏢 {cert.organisme_certificateur || cert.organisme || "Non spécifié"}
                        </p>
                      </div>

                      {/* Critères */}
                      {cert.criteres_certification && (
                        <div className="mb-3">
                          <h6 className="text-muted mb-1 small">CRITÈRES</h6>
                          <p className="mb-0 text-secondary small">
                            {cert.criteres_certification}
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      <div className="d-flex align-items-center gap-2 text-muted small">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                        {cert.date_certification ? (
                          <span>{new Date(cert.date_certification).toLocaleDateString('fr-FR')}</span>
                        ) : (
                          <span>Date non spécifiée</span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="card-footer bg-transparent border-top-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-light text-dark border">
                          ID: {cert.id}
                        </span>
                        {cert.certification_valide ? (
                          <span className="text-success small fw-semibold">
                            ✓ Certification active
                          </span>
                        ) : (
                          <span className="text-warning small fw-semibold">
                            ⚠ À renouveler
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h2 className="display-4 text-success mb-0">{certifications.length}</h2>
                  <p className="text-muted mb-0">Certifications</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h2 className="display-4 text-success mb-0">
                    {certifications.filter(c => c.certification_valide).length}
                  </h2>
                  <p className="text-muted mb-0">Actives</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h2 className="display-4 text-success mb-0">{certificationTypes.length}</h2>
                  <p className="text-muted mb-0">Types</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h2 className="display-4 text-success mb-0">
                    {[...new Set(certifications.map(c => c.organisme_certificateur))].length}
                  </h2>
                  <p className="text-muted mb-0">Organismes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-5 bg-success text-white">
        <div className="container text-center">
          <h2 className="mb-3">Intéressé par une certification ?</h2>
          <p className="lead mb-4">
            Rejoignez notre plateforme pour gérer vos certifications écologiques
          </p>
          <Link to="/auth/sign-in" className="btn btn-light btn-lg">
            Se connecter →
          </Link>
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
      `}</style>
    </div>
  );
}

export default CertificationsPublic;
