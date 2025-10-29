import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Textarea,
  Spinner,
  Alert,
  IconButton,
  Tooltip
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getEnergies, createEnergie, updateEnergie, deleteEnergie } from "@/services/energieService";
import { useAuth } from "@/context/AuthContext";

export function Energies() {
  const [energies, setEnergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formDialog, setFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedEnergie, setSelectedEnergie] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    type: "solaire",
    description: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user: currentUser } = useAuth();

  const typesEnergie = [
    { value: 'solaire', label: 'Solaire' },
    { value: 'eolien', label: 'Éolien' },
    { value: 'hydraulique', label: 'Hydraulique' },
    { value: 'biomasse', label: 'Biomasse' },
    { value: 'geothermie', label: 'Géothermie' },
    { value: 'autre', label: 'Autre' }
  ];

  // Helper function to extract ID from URI
  const extractIdFromUri = (uri) => {
    if (!uri) return null;
    const parts = uri.split('EnergieRenouvelable_');
    return parts.length > 1 ? parts[1] : null;
  };

  useEffect(() => {
    loadEnergies();
  }, []);

  const loadEnergies = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await getEnergies();
      
      // Process the response data
      const processedData = Array.isArray(data) 
        ? data.map(energie => ({
            ...energie,
            // Ensure we have an ID, either from the response or extracted from URI
            id: energie.id || extractIdFromUri(energie.uri) || `temp-${Date.now()}`
          }))
        : [];
      
      setEnergies(processedData);
      
    } catch (error) {
      console.error("Error loading energies:", error);
      setError(error.message || "Erreur lors du chargement des énergies. Veuillez réessayer.");
      setEnergies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEnergie = () => {
    setSelectedEnergie(null);
    setFormData({
      nom: "",
      type: "solaire",
      description: ""
    });
    setFormDialog(true);
  };

  const handleEditEnergie = (energie) => {
    setSelectedEnergie(energie);
    setFormData({
      nom: energie.nom || "",
      type: energie.type || "solaire",
      description: energie.description || ""
    });
    setFormDialog(true);
  };

  const handleDeleteClick = (energie) => {
    setSelectedEnergie(energie);
    setDeleteDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      
      if (selectedEnergie) {
        // Update existing energie
        const id = selectedEnergie.id || extractIdFromUri(selectedEnergie.uri);
        if (!id) {
          throw new Error("ID de l'énergie introuvable");
        }
        
        await updateEnergie(id, formData);
        setSuccess("Énergie mise à jour avec succès");
      } else {
        // Create new energie
        await createEnergie(formData);
        setSuccess("Énergie créée avec succès");
      }
      
      setFormDialog(false);
      await loadEnergies();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving energie:", error);
      setError(error.message || "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEnergie) return;
    
    try {
      setLoading(true);
      setError("");
      
      const id = selectedEnergie.id || extractIdFromUri(selectedEnergie.uri);
      
      if (!id) {
        throw new Error("ID de l'énergie introuvable");
      }
      
      await deleteEnergie(id);
      setSuccess("Énergie supprimée avec succès");
      setDeleteDialog(false);
      await loadEnergies();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting energie:", error);
      setError(error.message || "Erreur lors de la suppression de l'énergie.");
    } finally {
      setLoading(false);
    }
  };

  const cellClasses = "p-4 border-b border-blue-gray-50";
  const headerCellClasses = "p-4 border-b border-blue-gray-100 bg-blue-gray-50/50 text-left";

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      <Card className="border-0 shadow-sm">
        <CardHeader 
          variant="gradient" 
          color="gray" 
          className="mb-0 p-6"
          floated={false}
          shadow={false}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Typography variant="h5" color="white" className="mb-1">
                Gestion des Énergies Renouvelables
              </Typography>
              <Typography variant="small" className="text-white/80">
                Gérez les différentes sources d'énergie renouvelable ({energies.length} énergie{energies.length !== 1 ? 's' : ''})
              </Typography>
            </div>
            <Button
              color="white"
              size="sm"
              className="flex items-center gap-2 shadow-md hover:shadow-lg"
              onClick={handleAddEnergie}
            >
              <PlusIcon className="h-4 w-4" />
              Ajouter une énergie
            </Button>
          </div>
        </CardHeader>
        
        <CardBody className="p-0">
          {error && (
            <Alert color="red" className="m-4">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert color="green" className="m-4">
              {success}
            </Alert>
          )}
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <table className="w-full min-w-max table-auto">
                <thead>
                  <tr>
                    <th className={headerCellClasses}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        Nom
                      </Typography>
                    </th>
                    <th className={headerCellClasses}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        Type
                      </Typography>
                    </th>
                    <th className={headerCellClasses}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        Description
                      </Typography>
                    </th>
                    <th className={headerCellClasses}></th>
                  </tr>
                </thead>
                <tbody>
                  {energies.length > 0 ? (
                    energies.map((energie, index) => {
                      const key = energie.id || energie.uri || `energie-${index}`;
                      return (
                        <tr key={key} className="hover:bg-blue-gray-50/50">
                          <td className={cellClasses}>
                            <Typography variant="small" color="blue-gray" className="font-normal">
                              {energie.nom || '-'}
                            </Typography>
                          </td>
                          <td className={cellClasses}>
                            <Typography variant="small" color="blue-gray" className="font-normal">
                              {typesEnergie.find(t => t.value === energie.type)?.label || energie.type || '-'}
                            </Typography>
                          </td>
                          <td className={cellClasses}>
                            <Typography variant="small" color="blue-gray" className="font-normal">
                              {energie.description || '-'}
                            </Typography>
                          </td>
                          <td className={`${cellClasses} w-24`}>
                            <div className="flex items-center gap-2">
                              <Tooltip content="Modifier">
                                <IconButton
                                  variant="text"
                                  color="blue-gray"
                                  size="sm"
                                  onClick={() => handleEditEnergie(energie)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip content="Supprimer">
                                <IconButton
                                  variant="text"
                                  color="red"
                                  size="sm"
                                  onClick={() => handleDeleteClick(energie)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-8 text-center">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          Aucune énergie enregistrée
                        </Typography>
                        <Typography variant="small" color="gray" className="mt-2">
                          Cliquez sur "Ajouter une énergie" pour commencer
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Form Dialog */}
      <Dialog 
        open={formDialog} 
        handler={() => !loading && setFormDialog(false)}
        size="lg"
      >
        <DialogHeader>
          {selectedEnergie ? 'Modifier une énergie' : 'Ajouter une nouvelle énergie'}
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Nom *
                </Typography>
                <Input
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom de l'énergie"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Type d'énergie *
                </Typography>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={(value) => handleSelectChange(value, 'type')}
                  label="Sélectionner un type"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                >
                  {typesEnergie.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Description
                </Typography>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description détaillée de la source d'énergie"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900 min-h-[100px]"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="text"
                color="gray"
                onClick={() => setFormDialog(false)}
                disabled={loading}
                className="px-4"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                color="blue"
                disabled={loading}
                className="flex items-center gap-2 px-6"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  <>{selectedEnergie ? 'Mettre à jour' : 'Créer'}</>
                )}
              </Button>
            </div>
          </form>
        </DialogBody>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={deleteDialog}
        handler={() => !loading && setDeleteDialog(false)}
        size="sm"
      >
        <DialogHeader>Confirmer la suppression</DialogHeader>
        <DialogBody>
          Êtes-vous sûr de vouloir supprimer l'énergie "{selectedEnergie?.nom}" ? Cette action est irréversible.
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button
            variant="text"
            color="gray"
            onClick={() => setDeleteDialog(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={handleDeleteConfirm}
            disabled={loading}
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Energies;