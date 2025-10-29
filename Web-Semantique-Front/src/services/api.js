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

  // ==================== RESTAURANT ENDPOINTS ====================

  /**
   * Get all restaurants
   */
  async getRestaurants() {
    return this.fetch('/restaurant');
  }

  /**
   * Get restaurant by URI
   */
  async getRestaurant(uri) {
    return this.fetch(`/restaurant/${encodeURIComponent(uri)}`);
  }

  /**
   * Create new restaurant
   */
  async createRestaurant(data) {
    return this.fetch('/restaurant', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update restaurant
   */
  async updateRestaurant(uri, data) {
    return this.fetch(`/restaurant/${encodeURIComponent(uri)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete restaurant
   */
  async deleteRestaurant(uri) {
    return this.fetch(`/restaurant/${encodeURIComponent(uri)}`, {
      method: 'DELETE',
    });
  }

  // ==================== PRODUIT LOCAL ENDPOINTS ====================

  /**
   * Get all local products
   */
  async getProduits() {
    return this.fetch('/produit');
  }

  /**
   * Get product by URI
   */
  async getProduit(uri) {
    return this.fetch(`/produit/${encodeURIComponent(uri)}`);
  }

  /**
   * Create new product
   */
  async createProduit(data) {
    return this.fetch('/produit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update product
   */
  async updateProduit(uri, data) {
    return this.fetch(`/produit/${encodeURIComponent(uri)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete product
   */
  async deleteProduit(uri) {
    return this.fetch(`/produit/${encodeURIComponent(uri)}`, {
      method: 'DELETE',
    });
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

  // ==================== RESERVATION ENDPOINTS ====================

  /**
   * Create a new restaurant reservation
   */
  async createReservation(reservationData) {
    return this.fetch('/reservation-restaurant', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  /**
   * Get all reservations for a tourist
   */
  async getTouristeReservations(touristeUri) {
    return this.fetch(`/reservations-restaurant/touriste/${encodeURIComponent(touristeUri)}`);
  }

  /**
   * Get all reservations for a restaurant (admin/guide only)
   */
  async getRestaurantReservations(restaurantUri) {
    return this.fetch(`/reservations-restaurant/restaurant/${encodeURIComponent(restaurantUri)}`);
  }

  /**
   * Get all reservations (admin/guide only)
   */
  async getAllReservations() {
    return this.fetch('/reservations-restaurant/all');
  }

  /**
   * Get a single reservation by URI
   */
  async getReservation(uri) {
    return this.fetch(`/reservation-restaurant/${encodeURIComponent(uri)}`);
  }

  /**
   * Update reservation status
   */
  async updateReservationStatus(uri, statut) {
    return this.fetch(`/reservation-restaurant/${encodeURIComponent(uri)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ statut }),
    });
  }

  /**
   * Cancel/Delete a reservation
   */
  async deleteReservation(uri) {
    return this.fetch(`/reservation-restaurant/${encodeURIComponent(uri)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Check if a time slot is available
   */
  async checkAvailability(restaurant, date_reservation, heure, touriste = null, nombre_personnes = 1) {
    return this.fetch('/reservation-restaurant/check-availability', {
      method: 'POST',
      body: JSON.stringify({ 
        restaurant, 
        date_reservation, 
        heure, 
        touriste,
        nombre_personnes 
      }),
    });
  }
}

export default new ApiService();

