import React, { useState, useEffect } from "react";
import ImageGenerator from "../../components/ImageGenerator";
import {
  Card, CardBody, CardFooter, Typography, Input, Button, Select, Option,
  IconButton, Dialog, DialogHeader, DialogBody, DialogFooter,
} from "@material-tailwind/react";
import ApiService from "@/services/api";
import { PencilIcon, TrashIcon, PlusIcon, MapPinIcon } from "@heroicons/react/24/solid";

const NAMESPACE = "http://example.org/eco-tourism#";

export function Hebergements() {
  const [hebergements, setHebergements] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHebergementUri, setEditingHebergementUri] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [promptForGenerator, setPromptForGenerator] = useState("");

  const [nomHebergement, setNomHebergement] = useState("");
  const [type, setType] = useState("");
  const [prix, setPrix] = useState("");
  const [nbChambres, setNbChambres] = useState("");
  const [niveauEco, setNiveauEco] = useState("");
  const [selectedPays, setSelectedPays] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");

  // ÉTAPE 1 : CHARGER LES DESTINATIONS D'ABORD
  const loadDestinations = async () => {
    try {
      const data = await ApiService.getDestinations();
      if (!data || !Array.isArray(data)) {
        setDestinations([]);
        return;
      }

      const destMap = new Map();
      data.forEach((t) => {
        if (!t?.s?.value || !t?.p?.value || !t?.o?.value) return;
        const uri = t.s.value;
        if (!destMap.has(uri)) destMap.set(uri, { uri });
        const dest = destMap.get(uri);
        const prop = t.p.value.split("#")[1];
        const value = t.o.value;
        if (prop === "nom") dest.nom = value;
        else if (prop === "pays") dest.pays = value;
        else if (prop === "climat") dest.climat = value;
      });

      const filtered = Array.from(destMap.values()).filter(
        (d) => d.uri && !d.uri.endsWith("#") && d.uri !== NAMESPACE
      );
      setDestinations(filtered);
      console.log("Destinations chargées :", filtered);
      return filtered;
    } catch (error) {
      console.error("Erreur destinations :", error);
      alert("Erreur chargement destinations");
      return [];
    }
  };

  // ÉTAPE 2 : CHARGER LES HÉBERGEMENTS APRÈS LES DESTINATIONS
 const loadHebergements = async () => {
   try {
     console.log("Attempting to fetch hebergements...");
     const response = await ApiService.getHebergements();
     console.log("Full API Response:", response);
     
     if (!response) {
       throw new Error("No response received from API");
     }
     
     // Handle both direct array and wrapped response formats
     let data;
     if (response.status === "success" && response.data) {
       data = response.data;
     } else if (Array.isArray(response)) {
       data = response;
     } else {
       throw new Error("Invalid response format");
     }
     
     console.log("Data to process:", data);
     
     if (!Array.isArray(data)) {
       console.error("Data is not an array:", data);
       setHebergements([]);
       return;
     }
     
     // If data is already processed (objects with properties), use it directly
     if (data.length > 0 && data[0].nom) {
       console.log("Data already processed, using directly");
       const filtered = data.filter((h) => h.uri && !h.uri.endsWith("#") && h.uri !== `${NAMESPACE}`);
       console.log("Final Hebergements Array:", filtered);
       setHebergements(filtered);
       return;
     }
     
     // Otherwise, process triples format
     const hebergementsMap = {};
     data.forEach((triple) => {
       if (!triple || !triple.s || !triple.p || !triple.o) {
         return;
       }
       
       const uri = triple.s.value;
       const predicate = triple.p.value;
       const value = triple.o.value;
       
       if (!hebergementsMap[uri]) {
         hebergementsMap[uri] = {
           uri,
           nom: "",
           type: "",
           prix: "",
           nb_chambres: "",
           niveau_eco: "",
           destination: { nom: "Destination inconnue", pays: "", climat: "" }
         };
       }
       
       // Extract property name from predicate URI
       if (predicate.includes('#')) {
         const propName = predicate.split('#')[1];
         
         if (propName === 'nom') {
           hebergementsMap[uri].nom = value;
         } else if (propName === 'type') {
           hebergementsMap[uri].type = value;
         } else if (propName === 'prix') {
           hebergementsMap[uri].prix = value;
         } else if (propName === 'nbChambres') {
           hebergementsMap[uri].nb_chambres = value;
         } else if (propName === 'niveauEco') {
           hebergementsMap[uri].niveau_eco = value;
         }
       }
     });
     
     let hebergements = Object.values(hebergementsMap);
     hebergements = hebergements.filter((h) => h.uri && !h.uri.endsWith("#") && h.uri !== `${NAMESPACE}`);
     
     console.log("Final Hebergements Array (after filtering):", hebergements);
     setHebergements(hebergements);
   } catch (error) {
     console.error("Error loading hebergements:", error);
     if (error.response) {
       console.error("Response Data:", error.response.data);
       console.error("Response Status:", error.response.status);
     } else {
       console.error("Error Details:", error.message);
     }
     alert("Erreur lors du chargement des hébergements: " + (error.message || "Unknown error"));
     setHebergements([]);
   }
 };

  // ÉTAPE 3 : CHARGER EN SÉQUENCE
  useEffect(() => {
    const loadAll = async () => {
      const dests = await loadDestinations();
      await loadHebergements(dests); // Passe les destinations chargées
    };
    loadAll();
  }, []);

  // Recharger après ajout/modif/suppression
  const refreshHebergements = async () => {
    await loadHebergements(destinations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomHebergement.trim()) return alert("Nom requis");
    if (!selectedDestination) return alert("Destination requise");

    const data = {
      nom: nomHebergement,
      type: type || null,
      prix: prix || null,
      nb_chambres: nbChambres || null,
      niveau_eco: niveauEco || null,
      situe_dans: selectedDestination,
    };

    try {
      if (editingHebergementUri) {
        await ApiService.updateHebergement(editingHebergementUri, data);
        alert("Mis à jour !");
      } else {
        await ApiService.createHebergement(data);
        alert("Ajouté !");
      }

      resetForm();
      await refreshHebergements();
    } catch (error) {
      console.error("Erreur création :", error);
      alert("Erreur : " + (error.message || "Inconnue"));
    }
  };

  const resetForm = () => {
    setNomHebergement("");
    setType("");
    setPrix("");
    setNbChambres("");
    setNiveauEco("");
    setSelectedPays("");
    setSelectedDestination("");
    setEditingHebergementUri(null);
    setOpenDialog(false);
    setPromptForGenerator("");
    setGeneratedImage(null);
  };

  const editHebergement = (uri) => {
    const hebergement = hebergements.find((h) => h.uri === uri);
    if (!hebergement) return;

    setNomHebergement(hebergement.nom || "");
    setType(hebergement.type || "");
    setPrix(hebergement.prix || "");
    setNbChambres(hebergement.nbChambres || hebergement.nb_chambres || "");
    setNiveauEco(hebergement.niveauEco || hebergement.niveau_eco || "");
    setSelectedPays(hebergement.destination?.pays || "");
    setSelectedDestination(hebergement.destination?.uri || hebergement.situe_dans || "");
    setEditingHebergementUri(uri);
    setOpenDialog(true);
  };

  const deleteHebergement = async (uri) => {
    if (!window.confirm("Supprimer cet hébergement ?")) return;
    try {
      await ApiService.deleteHebergement(uri);
      alert("Supprimé !");
      await refreshHebergements();
    } catch (error) {
      alert("Erreur suppression");
    }
  };

  const uniquePays = [...new Set(destinations.map((d) => d.pays))].filter(Boolean).sort();
  const destinationsByPays = destinations.filter((d) => d.pays === selectedPays);

  const handleGenerateImage = () => {
    if (!selectedPays || !type || !niveauEco) {
      alert("Remplis au moins un pays, un type et un niveau éco !");
      return;
    }

    const ecoLevel = niveauEco === "High" ? "high" : "medium";
    const prompt = `A luxury ${type} eco-friendly accommodation with ${ecoLevel} sustainability level in ${selectedPays}, panoramic nature view, sustainable architecture, natural materials, golden hour lighting, ultra-realistic photo.`;

    setPromptForGenerator(prompt);
    setGeneratedImage(null);
  };

  return (
    <div className="mt-12 max-w-7xl mx-auto p-4">
      <Typography variant="h3" className="mb-6 text-center">Gestion des Hébergements</Typography>

      <div className="flex justify-end mb-4">
        <Button color="green" size="sm" onClick={() => setOpenDialog(true)} className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" /> Ajouter
        </Button>
      </div>

      {/* DIALOG */}
      <Dialog open={openDialog} handler={setOpenDialog} size="lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>{editingHebergementUri ? "Modifier" : "Ajouter"} Hébergement</DialogHeader>
          <DialogBody divider className="space-y-4">
            <Input label="Nom *" value={nomHebergement} onChange={(e) => setNomHebergement(e.target.value)} required />
            <Select label="Type" value={type} onChange={setType}>
              <Option value="">Sélectionner</Option>
              <Option value="Hotel">Hôtel</Option>
              <Option value="Villa">Villa</Option>
              <Option value="Apartment">Appartement</Option>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Prix (€)" type="number" value={prix} onChange={(e) => setPrix(e.target.value)} />
              <Input label="Chambres" type="number" value={nbChambres} onChange={(e) => setNbChambres(e.target.value)} />
            </div>
            <Select label="Niveau Éco" value={niveauEco} onChange={setNiveauEco}>
              <Option value="">Sélectionner</Option>
              <Option value="Low">Faible</Option>
              <Option value="High">Élevé</Option>
            </Select>
            <Select label="Pays *" value={selectedPays} onChange={setSelectedPays}>
              <Option value="">Choisir un pays</Option>
              {uniquePays.map((p) => (
                <Option key={p} value={p}>{p}</Option>
              ))}
            </Select>
            <Select label="Destination *" value={selectedDestination} onChange={setSelectedDestination} disabled={!selectedPays} required>
              <Option value="">{selectedPays ? "Choisir une destination" : "Sélectionnez un pays"}</Option>
              {destinationsByPays.map((d) => (
                <Option key={d.uri} value={d.uri}>{d.nom} ({d.climat})</Option>
              ))}
            </Select>

            <Button color="purple" onClick={handleGenerateImage} className="w-full" disabled={!selectedPays || !type || !niveauEco}>
              Générer mon hébergement de rêve
            </Button>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <ImageGenerator initialPrompt={promptForGenerator} onImageGenerated={(b) => setGeneratedImage(`data:image/png;base64,${b}`)} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="text" onClick={resetForm}>Annuler</Button>
            <Button color="green" type="submit">{editingHebergementUri ? "Mettre à jour" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* IMAGE GÉNÉRÉE */}
      {generatedImage && (
        <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg text-center">
          <Typography variant="h5" className="mb-4 text-purple-800">Ton hébergement de rêve</Typography>
          <img src={generatedImage} alt="IA" className="max-w-2xl mx-auto rounded-lg shadow-2xl" />
          <Button color="green" className="mt-4" onClick={() => {
            const a = document.createElement("a");
            a.href = generatedImage;
            a.download = "hebergement-reve.png";
            a.click();
          }}>Télécharger</Button>
        </div>
      )}

      {/* LISTE DES HÉBERGEMENTS */}
      <div className="mt-8">
        {hebergements.length === 0 ? (
          <p className="text-center text-gray-500">Aucun hébergement trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hebergements.map((h) => (
              <Card key={h.uri} className="shadow hover:shadow-xl transition-shadow">
                <CardBody>
                  <Typography variant="h5" className="mb-2">{h.nom || "Sans nom"}</Typography>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div><strong>Type :</strong> {h.type || "N/A"}</div>
                    <div><strong>Prix :</strong> {h.prix ? `${h.prix}€` : "N/A"}</div>
                    {(h.nbChambres || h.nb_chambres) && <div><strong>Chambres :</strong> {h.nbChambres || h.nb_chambres}</div>}
                    <div><strong>Éco :</strong> {h.niveauEco || h.niveau_eco || "N/A"}</div>
                    {h.destination && h.destination.nom !== "Destination inconnue" && (
                      <div className="mt-3 p-2 bg-blue-50 rounded flex items-center gap-1 text-blue-800 text-xs">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{h.destination.nom}, {h.destination.pays}</span>
                      </div>
                    )}
                  </div>
                </CardBody>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <IconButton size="sm" color="amber" onClick={() => editHebergement(h.uri)}>
                    <PencilIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton size="sm" color="red" onClick={() => deleteHebergement(h.uri)}>
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Hebergements;