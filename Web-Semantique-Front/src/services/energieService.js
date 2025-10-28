const API_BASE_URL = 'http://localhost:8000/api';
const ENERGIE_BASE_URL = `${API_BASE_URL}/energie`;

/**
 * Helper function to handle fetch requests
 */
async function fetchData(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${url}]:`, error);
    throw error;
  }
}

/**
 * Get all energies
 * @returns {Promise<Array>} List of energies
 */
export const getEnergies = async () => {
  const data = await fetchData(ENERGIE_BASE_URL);
  return Array.isArray(data) ? data : [];
};

/**
 * Get a single energie by ID
 * @param {string} id - The ID of the energie to fetch
 * @returns {Promise<Object>} The energie data
 */
export const getEnergie = async (id) => {
  return fetchData(`${ENERGIE_BASE_URL}/${id}`);
};

/**
 * Create a new energie
 * @param {Object} energieData - The energie data to create
 * @param {string} energieData.nom - The name of the energie (required)
 * @param {string} energieData.type - The type of the energie (required)
 * @param {string} [energieData.description] - Optional description
 * @returns {Promise<Object>} The created energie data
 */
export const createEnergie = async (energieData) => {
  if (!energieData.nom || !energieData.type) {
    throw new Error('Nom and type are required fields');
  }

  return fetchData(ENERGIE_BASE_URL, {
    method: 'POST',
    body: {
      nom: energieData.nom,
      type: energieData.type,
      description: energieData.description || ''
    }
  });
};

/**
 * Update an existing energie
 * @param {string} id - The ID of the energie to update
 * @param {Object} updateData - The fields to update
 * @returns {Promise<Object>} The updated energie data
 */
export const updateEnergie = async (id, updateData) => {
  return fetchData(`${ENERGIE_BASE_URL}/${id}`, {
    method: 'PUT',
    body: updateData
  });
};

/**
 * Delete an energie
 * @param {string} id - The ID of the energie to delete
 * @returns {Promise<Object>} The delete confirmation
 */
export const deleteEnergie = async (id) => {
  return fetchData(`${ENERGIE_BASE_URL}/${id}`, {
    method: 'DELETE'
  });
};