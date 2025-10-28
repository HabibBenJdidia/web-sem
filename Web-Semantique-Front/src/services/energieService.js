// energieService.js
import api from './api';

export const getEnergies = async () => {
  const response = await api.get('/api/energies');
  return response.data;
};

export const getEnergie = async (id) => {
  // Now we pass the ID directly, not the URI
  const response = await api.get(`/api/energies/${id}`);
  return response.data;
};

export const createEnergie = async (energieData) => {
  const response = await api.post('/api/energies', energieData);
  return response.data;
};

export const updateEnergie = async (id, updateData) => {
  // Now we pass the ID directly, not the URI
  const response = await api.put(`/api/energies/${id}`, updateData);
  return response.data;
};

export const deleteEnergie = async (id) => {
  // Now we pass the ID directly, not the URI
  const response = await api.delete(`/api/energies/${id}`);
  return response.data;
};