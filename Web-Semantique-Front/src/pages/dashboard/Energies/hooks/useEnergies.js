import { useState, useEffect, useCallback } from 'react';
import { 
  getEnergies as fetchEnergies, 
  getEnergie as fetchEnergie,
  createEnergie as createNewEnergie,
  updateEnergie as updateExistingEnergie,
  deleteEnergie as deleteExistingEnergie
} from '@/services/energieService';

export const useEnergies = () => {
  const [energies, setEnergies] = useState([]);
  const [selectedEnergie, setSelectedEnergie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEnergies = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchEnergies();
      setEnergies(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des énergies:', err);
      setError('Impossible de charger les énergies. Veuillez réessayer.');
      setEnergies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEnergie = useCallback(async (uri) => {
    try {
      setIsLoading(true);
      const data = await fetchEnergie(uri);
      setSelectedEnergie(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'énergie:', err);
      setError('Impossible de charger les détails de l\'énergie.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEnergie = useCallback(async (energieData) => {
    try {
      setIsLoading(true);
      const newEnergie = await createNewEnergie(energieData);
      await loadEnergies();
      setError(null);
      return newEnergie;
    } catch (err) {
      console.error('Erreur lors de la création de l\'énergie:', err);
      setError('Impossible de créer l\'énergie. Veuillez vérifier les données et réessayer.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadEnergies]);

  const updateEnergie = useCallback(async (uri, updateData) => {
    try {
      setIsLoading(true);
      const updatedEnergie = await updateExistingEnergie(uri, updateData);
      await loadEnergies();
      setError(null);
      return updatedEnergie;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'énergie:', err);
      setError('Impossible de mettre à jour l\'énergie. Veuillez réessayer.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadEnergies]);

  const deleteEnergie = useCallback(async (uri) => {
    try {
      setIsLoading(true);
      await deleteExistingEnergie(uri);
      await loadEnergies();
      setError(null);
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'énergie:', err);
      setError('Impossible de supprimer l\'énergie. Veuillez réessayer.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadEnergies]);

  useEffect(() => {
    loadEnergies();
  }, [loadEnergies]);

  return {
    energies,
    selectedEnergie,
    isLoading,
    error,
    loadEnergies,
    getEnergie,
    createEnergie,
    updateEnergie,
    deleteEnergie,
    setSelectedEnergie,
    setError
  };
};

export default useEnergies;
