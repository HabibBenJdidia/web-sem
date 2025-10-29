/**
 * AI BSila Voice Assistant API Service
 * Handles voice queries for Restaurants and Local Products
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class AIBSilaService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Generic fetch wrapper
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
      console.error(`AI BSila API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== VOICE QUERY ====================

  /**
   * Send voice query to AI BSila
   * Returns vocal response + textual data + voice audio
   */
  async voiceQuery(query) {
    return this.fetch('/ai-bsila/voice-query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // ==================== RESTAURANTS ====================

  /**
   * Get all restaurants with voice response
   */
  async getRestaurants() {
    return this.fetch('/ai-bsila/restaurants');
  }

  /**
   * Get ecological restaurants
   */
  async getEcoRestaurants() {
    return this.fetch('/ai-bsila/restaurants/eco');
  }

  // ==================== PRODUCTS ====================

  /**
   * Get all local products
   */
  async getProducts() {
    return this.fetch('/ai-bsila/products');
  }

  /**
   * Get organic products
   */
  async getBioProducts() {
    return this.fetch('/ai-bsila/products/bio');
  }

  /**
   * Get products by season
   */
  async getProductsBySeason(season) {
    return this.fetch(`/ai-bsila/products/season/${encodeURIComponent(season)}`);
  }

  // ==================== RESTAURANT PRODUCTS ====================

  /**
   * Get restaurant products
   */
  async getRestaurantProducts(restaurantName = null) {
    const query = restaurantName ? `?restaurant=${encodeURIComponent(restaurantName)}` : '';
    return this.fetch(`/ai-bsila/restaurant-products${query}`);
  }

  // ==================== UTILITY ====================

  /**
   * Play audio from base64 string
   */
  playVoiceAudio(base64Audio) {
    if (!base64Audio) {
      console.error('No audio data provided');
      return;
    }

    try {
      // Create audio element
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      
      // Play audio
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });

      return audio;
    } catch (error) {
      console.error('Error creating audio:', error);
    }
  }

  /**
   * Stop currently playing audio
   */
  stopVoiceAudio(audioElement) {
    if (audioElement && !audioElement.paused) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  }

  /**
   * Reset BSila chat session
   */
  async reset() {
    return this.fetch('/ai-bsila/reset', {
      method: 'POST',
    });
  }

  /**
   * Get help information
   */
  async getHelp() {
    return this.fetch('/ai-bsila/help');
  }

  // ==================== VOICE SELECTION ====================

  /**
   * Get available voices
   */
  async getVoices() {
    return this.fetch('/ai-bsila/voices');
  }

  /**
   * Get current voice
   */
  async getCurrentVoice() {
    return this.fetch('/ai-bsila/voice/current');
  }

  /**
   * Set voice for text-to-speech
   */
  async setVoice(voiceKey) {
    return this.fetch('/ai-bsila/voice/set', {
      method: 'POST',
      body: JSON.stringify({ voice_key: voiceKey }),
    });
  }

  // ==================== TEXT TO SPEECH ====================

  /**
   * Use Web Speech API for text-to-speech (alternative to backend)
   */
  speakText(text, lang = 'fr-FR') {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
      return utterance;
    } else {
      console.error('Speech synthesis not supported');
      return null;
    }
  }

  /**
   * Stop speech synthesis
   */
  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // ==================== SPEECH RECOGNITION ====================

  /**
   * Use Web Speech API for voice input (optional)
   */
  startVoiceRecognition(onResult, onError) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError('Speech recognition not supported in this browser');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      onError(event.error);
    };

    recognition.start();
    return recognition;
  }
}

export default new AIBSilaService();



