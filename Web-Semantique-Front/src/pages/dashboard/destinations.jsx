import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Button,
  Select,
  Option,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import ApiService from "@/services/api";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/solid";

export function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [nomDest, setNomDest] = useState("");
  const [paysDest, setPaysDest] = useState("");
  const [climatDest, setClimatDest] = useState("");
  const [editingDestUri, setEditingDestUri] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      const data = await ApiService.getDestinations();
      if (!data || !Array.isArray(data)) {
        setDestinations([]);
        return;
      }

      const destMap = new Map();
      data.forEach((triple) => {
        if (!triple?.s || !triple?.p || !triple?.o) return;
        const uri = triple.s.value;
        if (!destMap.has(uri)) destMap.set(uri, { uri });
        const dest = destMap.get(uri);
        const prop = triple.p.value.split("#")[1];
        const value = triple.o.value;

        if (prop === "nom") dest.nom = value;
        else if (prop === "pays") dest.pays = value;
        else if (prop === "climat") dest.climat = value;
      });

      setDestinations(Array.from(destMap.values()));
    } catch (error) {
      alert("Erreur: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomDest.trim()) return alert("Le nom est requis");

    const data = { nom: nomDest, pays: paysDest, climat: climatDest };
    try {
      if (editingDestUri) {
        await ApiService.updateDestination(editingDestUri, data);
      } else {
        await ApiService.createDestination(data);
      }
      resetForm();
      await loadDestinations();
    } catch (error) {
      alert("Erreur: " + error.message);
    }
  };

  const resetForm = () => {
    setNomDest("");
    setPaysDest("");
    setClimatDest("");
    setEditingDestUri(null);
    setOpenDialog(false);
  };

  const editDestination = (dest) => {
    setNomDest(dest.nom || "");
    setPaysDest(dest.pays || "");
    setClimatDest(dest.climat || "");
    setEditingDestUri(dest.uri);
    setOpenDialog(true);
  };

  const deleteDestination = async (uri) => {
    if (window.confirm("Supprimer cette destination ?")) {
      try {
        await ApiService.deleteDestination(uri);
        await loadDestinations();
      } catch (error) {
        alert("Erreur: " + error.message);
      }
    }
  };

  return (
    <div className="mt-12 max-w-6xl mx-auto p-4">
      <Typography variant="h3" className="mb-6 text-center">
        Gestion des Destinations
      </Typography>

      <div className="flex justify-end mb-4">
        <Button
          color="blue"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setOpenDialog(true)}
        >
          <PlusIcon className="h-5 w-5" /> Ajouter
        </Button>
      </div>

      {/* Dialog pour Ajouter/Modifier */}
      <Dialog open={openDialog} handler={setOpenDialog}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            {editingDestUri ? "Modifier" : "Ajouter"} une Destination
          </DialogHeader>
          <DialogBody divider>
            <div className="space-y-4">
              <Input
                label="Nom *"
                value={nomDest}
                onChange={(e) => setNomDest(e.target.value)}
                required
              />
              <Input
                label="Pays"
                value={paysDest}
                onChange={(e) => setPaysDest(e.target.value)}
              />
              <Input
                label="Climat"
                value={climatDest}
                onChange={(e) => setClimatDest(e.target.value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="text" onClick={resetForm} className="mr-2">
              Annuler
            </Button>
            <Button color="blue" type="submit">
              {editingDestUri ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Liste des destinations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {destinations.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            Aucune destination trouvée.
          </p>
        ) : (
          destinations.map((dest) => (
            <Card key={dest.uri} className="shadow hover:shadow-lg transition-shadow">
              <CardBody>
                <Typography variant="h5" className="mb-2">
                  {dest.nom || "Sans nom"}
                </Typography>
                <Typography className="text-sm text-gray-600">
                  <strong>Pays:</strong> {dest.pays || "N/A"}
                </Typography>
                <Typography className="text-sm text-gray-600">
                  <strong>Climat:</strong> {dest.climat || "N/A"}
                </Typography>
              </CardBody>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <IconButton
                  size="sm"
                  color="amber"
                  onClick={() => editDestination(dest)}
                >
                  <PencilIcon className="h-4 w-4" />
                </IconButton>
                <IconButton
                  size="sm"
                  color="red"
                  onClick={() => deleteDestination(dest.uri)}
                >
                  <TrashIcon className="h-4 w-4" />
                </IconButton>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default Destinations;