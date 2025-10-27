import api from './api';

export const getEnergies = async () => {
  const response = await api.get('/api/energies');
  return response.data;
};

export const getEnergie = async (uri) => {
  const response = await api.get(`/api/energies/${encodeURIComponent(uri)}`);
  return response.data;
};

export const createEnergie = async (energieData) => {
  const response = await api.post('/api/energies', energieData);
  return response.data;
};

export const updateEnergie = async (uri, updateData) => {
  const response = await api.put(`/api/energies/${encodeURIComponent(uri)}`, updateData);
  return response.data;
};

export const deleteEnergie = async (uri) => {
  const response = await api.delete(`/api/energies/${encodeURIComponent(uri)}`);
  return response.data;
};
