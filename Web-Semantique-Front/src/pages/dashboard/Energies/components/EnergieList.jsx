import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardBody, 
  Typography, 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter,
  Spinner,
  Alert
} from "@material-tailwind/react";
import { PlusIcon } from '@heroicons/react/24/solid';
import { DataGrid } from '@/components/ui/DataGrid';
import { getEnergies, deleteEnergie } from '@/services/energieService';
import { EnergieForm } from './EnergieForm';

export const EnergieList = () => {
  const [energies, setEnergies] = useState([]);
  const [selectedEnergie, setSelectedEnergie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadEnergies = async () => {
    try {
      setIsLoading(true);
      const data = await getEnergies();
      setEnergies(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des énergies:', err);
      setError('Erreur lors du chargement des énergies. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnergies();
  }, []);

  const handleEdit = (energie) => {
    setSelectedEnergie(energie);
    setShowForm(true);
  };

  const handleDeleteClick = (energie) => {
    setDeleteId(energie.uri);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    try {
      setDeleteLoading(true);
      await deleteEnergie(deleteId);
      await loadEnergies();
      setDeleteId(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de l\'énergie');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveSuccess = () => {
    setShowForm(false);
    loadEnergies();
  };

  const columns = [
    { key: 'nom', header: 'Nom' },
    { key: 'type', header: 'Type' },
    { key: 'capacite', header: 'Capacité (MW)' },
    { key: 'localisation', header: 'Localisation' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Typography variant="h5" color="blue-gray" className="mb-1">
            Liste des Énergies
          </Typography>
          <Typography variant="small" className="text-gray-600">
            {energies.length} énergie(s) trouvée(s)
          </Typography>
        </div>
        <Button 
          color="blue" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {
            setSelectedEnergie(null);
            setShowForm(true);
          }}
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter une énergie
        </Button>
      </div>

      {error && (
        <Alert color="red" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-blue-gray-100 overflow-hidden">
        <DataGrid
          columns={columns}
          data={energies}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={isLoading}
        />
      </div>

      {/* Formulaire modal */}
      <Dialog 
        open={showForm} 
        handler={setShowForm}
        size="lg"
      >
        <DialogHeader>
          {selectedEnergie ? 'Modifier une énergie' : 'Ajouter une nouvelle énergie'}
        </DialogHeader>
        <DialogBody>
          <EnergieForm
            energie={selectedEnergie}
            onSave={handleSaveSuccess}
            onCancel={() => setShowForm(false)}
          />
        </DialogBody>
      </Dialog>

      {/* Confirmation de suppression */}
      <Dialog 
        open={!!deleteId}
        handler={() => !deleteLoading && setDeleteId(null)}
        size="sm"
      >
        <DialogHeader>Confirmer la suppression</DialogHeader>
        <DialogBody>
          Êtes-vous sûr de vouloir supprimer cette énergie ? Cette action est irréversible.
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button
            variant="text"
            color="gray"
            onClick={() => setDeleteId(null)}
            disabled={deleteLoading}
          >
            Annuler
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default EnergieList;
