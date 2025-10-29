/**
 * AISalhi Service - Advanced AI Assistant for Eco-Tourism
 * Provides intelligent recommendations, natural language queries, and semantic search
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class AISalhiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.aiEndpoint = '/ai';
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[AISalhi] Error at ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get AISalhi capabilities and help information
   */
  async getHelp() {
    return this.fetch(`${this.aiEndpoint}/help`);
  }

  /**
   * Ask AISalhi a simple question
   * Returns a text response
   * 
   * @param {string} question - The question to ask
   * @returns {Promise<{response: string}>}
   */
  async ask(question) {
    if (!question || typeof question !== 'string') {
      throw new Error('Question must be a non-empty string');
    }

    return this.fetch(`${this.aiEndpoint}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  /**
   * Interactive chat with AISalhi
   * Can execute actions based on the conversation
   * 
   * @param {string} message - The chat message
   * @returns {Promise<{response: string, action?: string, data?: any}>}
   */
  async chat(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message must be a non-empty string');
    }

    return this.fetch(`${this.aiEndpoint}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Execute a SPARQL query with AI assistance
   * AISalhi will explain the results
   * 
   * @param {string} query - SPARQL query to execute
   * @returns {Promise<{results: Array, explanation?: string}>}
   */
  async executeSPARQL(query) {
    if (!query || typeof query !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    return this.fetch(`${this.aiEndpoint}/sparql`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  /**
   * Get personalized activity recommendations
   * 
   * @param {Object} profile - User profile
   * @param {number} profile.age - User age
   * @param {string} profile.nationalite - User nationality
   * @param {Array<string>} profile.preferences - User preferences
   * @param {number} profile.budget - User budget
   * @returns {Promise<{recommendations: string, activities?: Array}>}
   */
  async getRecommendations(profile) {
    const requiredFields = ['age', 'nationalite', 'preferences', 'budget'];
    const missingFields = requiredFields.filter(field => !profile[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return this.fetch(`${this.aiEndpoint}/recommend-activities`, {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  /**
   * Calculate eco-friendliness score for an entity
   * 
   * @param {string} entityType - Type of entity (e.g., 'Hebergement', 'Transport')
   * @param {string} uri - URI of the entity
   * @returns {Promise<{score: number, details: Object}>}
   */
  async getEcoScore(entityType, uri) {
    if (!entityType || !uri) {
      throw new Error('Entity type and URI are required');
    }

    return this.fetch(`${this.aiEndpoint}/eco-score/${entityType}/${encodeURIComponent(uri)}`);
  }

  /**
   * Generate an eco-tourism itinerary
   * 
   * @param {Object} params - Itinerary parameters
   * @param {string} params.destination - Destination city/region
   * @param {number} params.duration - Duration in days
   * @param {Array<string>} params.interests - User interests
   * @param {number} params.budget - Budget per day
   * @returns {Promise<{itinerary: Array, total_cost: number}>}
   */
  async generateItinerary(params) {
    return this.fetch(`${this.aiEndpoint}/generate-itinerary`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Reset chat session (clears conversation history)
   * 
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async resetChat() {
    return this.fetch(`${this.aiEndpoint}/reset`, {
      method: 'POST',
    });
  }

  /**
   * Get insights about the knowledge base
   * Ask questions like "How many hotels?", "List all certifications"
   * 
   * @param {string} query - Natural language query
   * @returns {Promise<{answer: string, data?: any}>}
   */
  async getInsights(query) {
    return this.ask(query);
  }

  /**
   * Compare two entities (e.g., hotels, activities)
   * 
   * @param {string} entity1Uri - URI of first entity
   * @param {string} entity2Uri - URI of second entity
   * @returns {Promise<{comparison: string, scores: Object}>}
   */
  async compareEntities(entity1Uri, entity2Uri) {
    const question = `Compare these two entities: ${entity1Uri} and ${entity2Uri}. Focus on eco-friendliness and sustainability.`;
    return this.ask(question);
  }

  /**
   * Get suggestions for improving eco-score
   * 
   * @param {string} entityType - Type of entity
   * @param {string} uri - URI of entity
   * @returns {Promise<{suggestions: Array<string>}>}
   */
  async getImprovementSuggestions(entityType, uri) {
    const question = `What improvements can be made to increase the eco-score of this ${entityType}: ${uri}?`;
    return this.ask(question);
  }

  /**
   * Search entities using natural language
   * 
   * @param {string} searchQuery - Natural language search query
   * @returns {Promise<{results: Array, count: number}>}
   */
  async naturalLanguageSearch(searchQuery) {
    return this.chat(`Search for: ${searchQuery}`);
  }

  /**
   * Analyze video to detect vibe and recommend events
   * 
   * @param {Blob} videoBlob - Video file blob
*   * @param {string} message - Optional user message describing what they're looking for
   * @returns {Promise<{vibe_analysis: Object, event_recommendations: Array}>}
   */
  async analyzeVideo(videoBlob, message = '') {
    const formData = new FormData();
    formData.append('video', videoBlob, 'recording.webm');
    if (message.trim()) {
      formData.append('message', message.trim());
    }

    const url = `${this.baseUrl}${this.aiEndpoint}/analyze-video`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[AISalhi] Error analyzing video:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AISalhiService();
