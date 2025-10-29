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
  Spinner,
  Chip,
} from "@material-tailwind/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import api from "@/services/api";
import { toast } from "@/utils/toast";

export function Certifications() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCertification, setCurrentCertification] = useState(null);
  const [formData, setFormData] = useState({
    label_nom: "",
    organisme: "",
    annee_obtention: "",
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const data = await api.getCertifications();
      setCertifications(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement des certifications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (certification = null) => {
    if (certification) {
      setEditMode(true);
      setCurrentCertification(certification);
      setFormData({
        label_nom: certification.label_nom || "",
        organisme: certification.organisme || "",
        annee_obtention: certification.annee_obtention || "",
      });
    } else {
      setEditMode(false);
      setCurrentCertification(null);
      setFormData({
        label_nom: "",
        organisme: "",
        annee_obtention: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentCertification(null);
    setFormData({
      label_nom: "",
      organisme: "",
      annee_obtention: "",
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
    if (!formData.label_nom || !formData.organisme || !formData.annee_obtention) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      if (editMode && currentCertification) {
        await api.updateCertificationById(currentCertification.id, formData);
        toast.success("Certification mise à jour avec succès");
      } else {
        await api.createCertification(formData);
        toast.success("Certification créée avec succès");
      }
      handleCloseDialog();
      fetchCertifications();
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
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette certification ?")) {
      return;
    }

    try {
      await api.deleteCertificationById(id);
      toast.success("Certification supprimée avec succès");
      fetchCertifications();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    }
  };

  const filteredCertifications = certifications.filter((cert) =>
    cert.label_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.organisme?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="green" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              Certifications Écologiques
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
              label="Rechercher..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" color="green" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["ID", "Label", "Organisme", "Année", "Actions"].map((head) => (
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
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCertifications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 px-5 text-center">
                        <Typography variant="small" color="blue-gray">
                          Aucune certification trouvée
                        </Typography>
                      </td>
                    </tr>
                  ) : (
                    filteredCertifications.map((cert) => (
                      <tr key={cert.id || cert.uri}>
                        <td className="py-3 px-5">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {cert.id}
                          </Typography>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-medium"
                            >
                              {cert.label_nom}
                            </Typography>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <Typography variant="small" color="blue-gray">
                            {cert.organisme}
                          </Typography>
                        </td>
                        <td className="py-3 px-5">
                          <Chip
                            value={cert.annee_obtention}
                            color="blue-gray"
                            size="sm"
                            className="w-fit"
                          />
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex gap-2">
                            <IconButton
                              variant="text"
                              color="blue"
                              size="sm"
                              onClick={() => handleOpenDialog(cert)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              variant="text"
                              color="red"
                              size="sm"
                              onClick={() => handleDelete(cert.id)}
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
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader>
          {editMode ? "Modifier la Certification" : "Nouvelle Certification"}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody divider className="space-y-4">
            <Input
              label="Label / Nom *"
              name="label_nom"
              value={formData.label_nom}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Organisme *"
              name="organisme"
              value={formData.organisme}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Année d'Obtention *"
              name="annee_obtention"
              type="number"
              min="1900"
              max="2100"
              value={formData.annee_obtention}
              onChange={handleInputChange}
              required
            />
          </DialogBody>
          <DialogFooter className="space-x-2">
            <Button variant="text" color="red" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button variant="gradient" color="green" type="submit">
              {editMode ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

export default Certifications;
