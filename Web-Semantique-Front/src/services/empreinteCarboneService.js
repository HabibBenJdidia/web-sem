const API_BASE_URL = 'http://localhost:8000/api';
const EMPREINTE_CARBONE_BASE_URL = `${API_BASE_URL}/empreinte_carbone`;

/**
 * Helper function to handle fetch requests
 */
async function fetchData(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && !(config.body instanceof FormData) && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Invalid response format: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${url}]:`, error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Please check if the backend server is running');
    }
    
    throw error;
  }
}

/**
 * Get all empreinte carbone entries
 * @returns {Promise<Array>} List of empreinte carbone entries
 */
export const getEmpreinteCarbone = async () => {
  const data = await fetchData(EMPREINTE_CARBONE_BASE_URL);
  return Array.isArray(data) ? data : [];
};

/**
 * Get a single empreinte carbone entry by ID
 * @param {string} id - The ID of the empreinte carbone entry
 * @returns {Promise<Object>} The empreinte carbone entry data
 */
export const getEmpreinteCarboneById = async (id) => {
  return fetchData(`${EMPREINTE_CARBONE_BASE_URL}/${id}`);
};

/**
 * Create a new empreinte carbone entry
 * @param {Object} empreinteCarboneData - The data for the new empreinte carbone entry
 * @returns {Promise<Object>} The created empreinte carbone entry data
 */
export const createEmpreinteCarbone = async (empreinteCarboneData) => {
  // Handle FormData for file uploads
  if (empreinteCarboneData instanceof FormData) {
    return fetchData(EMPREINTE_CARBONE_BASE_URL, {
      method: 'POST',
      body: empreinteCarboneData,
      // Don't set Content-Type for FormData, let browser set it with boundary
    });
  }
  
  // Handle JSON data - backend expects all fields
  const backendData = {
    valeur_co2_kg: empreinteCarboneData.valeur_co2_kg,
    name: empreinteCarboneData.name,
    description: empreinteCarboneData.description || '',
    image: empreinteCarboneData.image || ''
  };
  
  return fetchData(EMPREINTE_CARBONE_BASE_URL, {
    method: 'POST',
    body: backendData,
  });
};

/**
 * Update an existing empreinte carbone entry
 * @param {string} id - The ID of the empreinte carbone entry to update
 * @param {Object} empreinteCarboneData - The updated data for the empreinte carbone entry
 * @returns {Promise<Object>} The updated empreinte carbone entry data
 */
export const updateEmpreinteCarbone = async (id, empreinteCarboneData) => {
  // Handle FormData for file uploads
  if (empreinteCarboneData instanceof FormData) {
    return fetchData(`${EMPREINTE_CARBONE_BASE_URL}/${id}`, {
      method: 'PUT',
      body: empreinteCarboneData,
      // Don't set Content-Type for FormData, let browser set it with boundary
    });
  }
  
  // Handle JSON data - backend expects all fields that need to be updated
  const backendData = {};
  
  // Only include fields that are provided (partial update support)
  if (empreinteCarboneData.valeur_co2_kg !== undefined) {
    backendData.valeur_co2_kg = empreinteCarboneData.valeur_co2_kg;
  }
  if (empreinteCarboneData.name !== undefined) {
    backendData.name = empreinteCarboneData.name;
  }
  if (empreinteCarboneData.description !== undefined) {
    backendData.description = empreinteCarboneData.description;
  }
  if (empreinteCarboneData.image !== undefined) {
    backendData.image = empreinteCarboneData.image;
  }
  
  return fetchData(`${EMPREINTE_CARBONE_BASE_URL}/${id}`, {
    method: 'PUT',
    body: backendData,
  });
};

/**
 * Delete an empreinte carbone entry
 * @param {string} id - The ID of the empreinte carbone entry to delete
 * @returns {Promise<Object>} A confirmation message
 */
export const deleteEmpreinteCarbone = async (id) => {
  return fetchData(`${EMPREINTE_CARBONE_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
};