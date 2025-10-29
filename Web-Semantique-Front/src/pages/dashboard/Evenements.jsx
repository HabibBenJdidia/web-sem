import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Spinner,
  Chip,
} from "@material-tailwind/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";
import api from "@/services/api";
import { toast } from "@/utils/toast";

export function Evenements() {
  const [evenements, setEvenements] = useState([]);
  const [villes, setVilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEvenement, setCurrentEvenement] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    event_date: "",
    event_duree_heures: "",
    event_prix: "",
    a_lieu_dans: "",
  });

  useEffect(() => {
    fetchEvenements();
    fetchVilles();
  }, []);

  const fetchEvenements = async () => {
    try {
      setLoading(true);
      const data = await api.getEvenements();
      setEvenements(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement des événements");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVilles = async () => {
    try {
      const data = await api.getVilles();
      console.log("Raw villes data:", data); // Debug
      
      // Parser les données SPARQL
      const villesList = [];
      const villesMap = new Map();
      
      if (Array.isArray(data)) {
        data.forEach(row => {
          const uri = row.s?.value || row.uri;
          const predicate = row.p?.value?.split('#')[1] || '';
          const value = row.o?.value;
          
          if (uri && !villesMap.has(uri)) {
            villesMap.set(uri, { uri, nom: null });
          }
          
          if (uri && predicate === 'nom' && value) {
            const ville = villesMap.get(uri);
            ville.nom = value;
          }
        });
        
        // Convertir Map en Array et filtrer les villes avec un nom
        villesList.push(...Array.from(villesMap.values()).filter(v => v.nom));
      }
      
      console.log("Parsed villes:", villesList); // Debug
      setVilles(villesList);
    } catch (error) {
      console.error("Erreur lors du chargement des villes:", error);
    }
  };

  const handleOpenDialog = (evenement = null) => {
    if (evenement) {
      setEditMode(true);
      setCurrentEvenement(evenement);
      setFormData({
        nom: evenement.nom || "",
        event_date: evenement.event_date || "",
        event_duree_heures: evenement.event_duree_heures || "",
        event_prix: evenement.event_prix || "",
        a_lieu_dans: evenement.a_lieu_dans || "",
      });
    } else {
      setEditMode(false);
      setCurrentEvenement(null);
      setFormData({
        nom: "",
        event_date: "",
        event_duree_heures: "",
        event_prix: "",
        a_lieu_dans: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentEvenement(null);
    setFormData({
      nom: "",
      event_date: "",
      event_duree_heures: "",
      event_prix: "",
      a_lieu_dans: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.nom || !formData.event_date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const submitData = {
        ...formData,
        event_duree_heures: parseInt(formData.event_duree_heures) || 0,
        event_prix: parseFloat(formData.event_prix) || 0,
      };

      if (editMode && currentEvenement) {
        await api.updateEvenementById(currentEvenement.id, submitData);
        toast.success("Événement mis à jour avec succès");
      } else {
        await api.createEvenement(submitData);
        toast.success("Événement créé avec succès");
      }
      handleCloseDialog();
      fetchEvenements();
    } catch (error) {
      toast.error(
        editMode
          ? "Erreur lors de la mise à jour"
          : "Erreur lors de la création"
      );
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      return;
    }

    try {
      await api.deleteEvenementById(id);
      toast.success("Événement supprimé avec succès");
      fetchEvenements();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const filteredEvenements = evenements.filter((evt) =>
    evt.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour obtenir le nom de la ville depuis son URI
  const getVilleNom = (villeUri) => {
    if (!villeUri) return "N/A";
    const ville = villes.find(v => v.uri === villeUri);
    return ville?.nom || villeUri.split("#").pop();
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              Événements Écologiques
            </Typography>
            <Button
              size="sm"
              color="white"
              className="flex items-center gap-2"
              onClick={() => handleOpenDialog()}
            >
              <PlusIcon className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          {/* Search Bar */}
          <div className="px-6 mb-4">
            <Input
              label="Rechercher un événement..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" color="blue" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["ID", "Nom", "Date", "Durée", "Prix", "Lieu", "Actions"].map(
                      (head) => (
                        <th
                          key={head}
                          className="border-b border-blue-gray-50 py-3 px-5 text-left"
                        >
                          <Typography
                            variant="small"
                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                          >
                            {head}
                          </Typography>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredEvenements.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 px-5 text-center">
                        <Typography variant="small" color="blue-gray">
                          Aucun événement trouvé
                        </Typography>
                      </td>
                    </tr>
                  ) : (
                    filteredEvenements.map((evt) => (
                      <tr key={evt.id || evt.uri}>
                        <td className="py-3 px-5">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {evt.id}
                          </Typography>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-blue-500" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-medium"
                            >
                              {evt.nom}
                            </Typography>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <Typography variant="small" color="blue-gray">
                            {formatDate(evt.event_date)}
                          </Typography>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                            <Typography variant="small" color="blue-gray">
                              {evt.event_duree_heures}h
                            </Typography>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                            <Typography variant="small" color="blue-gray">
                              {evt.event_prix}€
                            </Typography>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <Chip
                            icon={<MapPinIcon className="h-3 w-3" />}
                            value={getVilleNom(evt.a_lieu_dans)}
                            size="sm"
                            color="cyan"
                            className="w-fit"
                          />
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex gap-2">
                            <IconButton
                              variant="text"
                              color="blue"
                              size="sm"
                              onClick={() => handleOpenDialog(evt)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              variant="text"
                              color="red"
                              size="sm"
                              onClick={() => handleDelete(evt.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="lg">
        <DialogHeader>
          {editMode ? "Modifier l'Événement" : "Nouvel Événement"}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody divider className="space-y-4 max-h-[70vh] overflow-y-auto">
            <Input
              label="Nom de l'événement *"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Date *"
              name="event_date"
              type="date"
              value={formData.event_date}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Durée (heures)"
              name="event_duree_heures"
              type="number"
              min="0"
              value={formData.event_duree_heures}
              onChange={handleInputChange}
            />
            <Input
              label="Prix (€)"
              name="event_prix"
              type="number"
              step="0.01"
              min="0"
              value={formData.event_prix}
              onChange={handleInputChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu (Ville)
              </label>
              <select
                name="a_lieu_dans"
                value={formData.a_lieu_dans}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Sélectionner une ville --</option>
                {villes.map((ville, index) => (
                  <option key={ville.uri || index} value={ville.uri}>
                    {ville.nom}
                  </option>
                ))}
              </select>
            </div>
          </DialogBody>
          <DialogFooter className="space-x-2">
            <Button variant="text" color="red" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button variant="gradient" color="blue" type="submit">
              {editMode ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

export default Evenements;
