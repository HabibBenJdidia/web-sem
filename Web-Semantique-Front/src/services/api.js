/**
 * API Service for Eco-Tourism Backend
 * Handles all communication with Flask/Fuseki backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * Login user
   */
  async login(email, password) {
    return this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Register new user (Tourist)
   */
  async register(userData) {
    return this.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return this.fetch('/auth/profile');
  }

  /**
   * Logout user
   */
  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ==================== PARTICIPATIONS ====================

  async getParticipations() {
    return this.fetch('/participations');
  }

  async addParticipation(activityUri) {
    return this.fetch('/participations', {
      method: 'POST',
      body: JSON.stringify({ activity_uri: activityUri }),
    });
  }

  async removeParticipation(activityUri) {
    return this.fetch(`/participations/${encodeURIComponent(activityUri)}`, {
      method: 'DELETE',
    });
  }

  // ==================== VISITS ====================

  async getVisits() {
    return this.fetch('/visits');
  }

  async addVisit(zoneUri) {
    return this.fetch('/visits', {
      method: 'POST',
      body: JSON.stringify({ zone_uri: zoneUri }),
    });
  }

  async removeVisit(zoneUri) {
    return this.fetch(`/visits/${encodeURIComponent(zoneUri)}`, {
      method: 'DELETE',
    });
  }

  // ==================== TOURISTE ENDPOINTS ====================

  /**
   * Get all tourists
   */
  async getTouristes() {
    return this.fetch('/touriste');
  }

  /**
   * Get tourist by URI
   */
  async getTouriste(uri) {
    return this.fetch(`/touriste/${encodeURIComponent(uri)}`);
  }

  /**
   * Create new tourist
   */
  async createTouriste(data) {
    return this.fetch('/touriste', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update tourist
   */
  async updateTouriste(uri, data) {
    return this.fetch(`/touriste/${encodeURIComponent(uri)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete tourist
   */
  async deleteTouriste(uri) {
    return this.fetch(`/touriste/${encodeURIComponent(uri)}`, {
      method: 'DELETE',
    });
  }

  // ==================== HEBERGEMENT ENDPOINTS ====================

  /**
   * Get all accommodations
   */
  async getHebergements() {
    return this.fetch('/hebergement');
  }

  /**
   * Get eco-friendly accommodations
   */
  async getEcoHebergements() {
    return this.fetch('/search/eco-hebergements');
  }

  /**
   * Create new accommodation
   */
  async createHebergement(data) {
    return this.fetch('/hebergement', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== ACTIVITE ENDPOINTS ====================

  /**
   * Get all activities
   */
  async getActivites() {
    return this.fetch('/activite');
  }

  /**
   * Get activity by URI
   */
  async getActivite(uri) {
    return this.fetch(`/activite/${encodeURIComponent(uri)}`);
  }

  /**
   * Get activities by difficulty
   */
  async getActivitesByDifficulty(difficulty) {
    return this.fetch(`/search/activities/${difficulty}`);
  }

  /**
   * Create new activity
   */
  async createActivite(data) {
    return this.fetch('/activite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update activity
   */
  async updateActivite(uri, data) {
    return this.fetch(`/activite/${encodeURIComponent(uri)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete activity
   */
  async deleteActivite(uri) {
    return this.fetch(`/activite/${encodeURIComponent(uri)}`, {
      method: 'DELETE',
    });
  }

  // ==================== ZONE NATURELLE ENDPOINTS ====================

  /**
   * Get all natural zones
   */
  async getZonesNaturelles() {
    return this.fetch('/zone-naturelle');
  }

  /**
   * Get natural zone by URI
   */
  async getZoneNaturelle(uri) {
    return this.fetch(`/zone-naturelle/${encodeURIComponent(uri)}`);
  }

  /**
   * Create new natural zone
   */
  async createZoneNaturelle(data) {
    return this.fetch('/zone-naturelle', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update natural zone
   */
  async updateZoneNaturelle(uri, data) {
    return this.fetch(`/zone-naturelle/${encodeURIComponent(uri)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete natural zone
   */
  async deleteZoneNaturelle(uri) {
    return this.fetch(`/zone-naturelle/${encodeURIComponent(uri)}`, {
      method: 'DELETE',
    });
  }

  // ==================== DESTINATION ENDPOINTS ====================

  /**
   * Get all destinations
   */
  async getDestinations() {
    return this.fetch('/destination');
  }

  /**
   * Get all cities
   */
  async getVilles() {
    return this.fetch('/ville');
  }

  // ==================== SEARCH ENDPOINTS ====================

  /**
   * Search by name
   */
  async searchByName(name) {
    return this.fetch(`/search/name/${encodeURIComponent(name)}`);
  }

  /**
   * Get bio products
   */
  async getBioProducts() {
    return this.fetch('/search/bio-products');
  }

  /**
   * Get zero emission transport
   */
  async getZeroEmissionTransport() {
    return this.fetch('/search/zero-emission-transport');
  }

  // ==================== AI ENDPOINTS ====================

  /**
   * Ask AI a question
   */
  async askAI(question) {
    return this.fetch('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  /**
   * Chat with AI
   */
  async chatAI(message) {
    return this.fetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Get activity recommendations
   */
  async getRecommendations(preferences) {
    return this.fetch('/ai/recommend-activities', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  /**
   * Get eco-score for entity
   */
  async getEcoScore(type, uri) {
    return this.fetch(`/ai/eco-score/${type}/${encodeURIComponent(uri)}`);
  }

  // ==================== GENERIC SPARQL ====================

  /**
   * Execute custom SPARQL query
   */
  async executeSPARQL(query) {
    return this.fetch('/ai/sparql', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }
}

export default new ApiService();

