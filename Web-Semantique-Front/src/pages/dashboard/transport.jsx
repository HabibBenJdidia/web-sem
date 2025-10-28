import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  TruckIcon,
  CurrencyEuroIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline";
import api from "@/services/api";
import "./transport.css";

// Custom light backdrop component
const LightBackdrop = ({ open }) => {
  if (!open) return null; 
  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(248, 250, 252, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9998,
      }}
    />
  );
};

export function Transport() {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [priceCalcDialog, setPriceCalcDialog] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(""); // Catégorie sélectionnée
  const [formData, setFormData] = useState({
    nom: "",
    type: "",
    category: "", // EcoTransport ou TransportNonMotorise
    emission_co2_per_km: "",
  });
  const [priceCalcData, setPriceCalcData] = useState({
    distance: 10,
    selectedTransportType: "",
    priceBreakdown: null,
  });

  // Options de types par catégorie
  const TRANSPORT_OPTIONS = {
    "EcoTransport": [
      { label: "Vélo Électrique (5 g/km - Faible)", value: "Vélo Électrique", emission: 5.0 },
      { label: "Trottinette Électrique (10 g/km - Faible)", value: "Trottinette Électrique", emission: 10.0 },
      { label: "Métro (20 g/km - Faible)", value: "Métro", emission: 20.0 },
      { label: "Tramway (25 g/km - Faible)", value: "Tramway", emission: 25.0 },
      { label: "Train (30 g/km - Faible)", value: "Train", emission: 30.0 },
    ],
    "TransportNonMotorise": [
      { label: "Vélo (0 g/km - Zéro émission)", value: "Vélo", emission: 0.0 },
      { label: "Marche (0 g/km - Zéro émission)", value: "Marche", emission: 0.0 },
    ],
    "Standard": [
      { label: "Moto (1200 g/km - Moyenne)", value: "Moto", emission: 1200.0 },
      { label: "Voiture (1200 g/km - Moyenne)", value: "Voiture", emission: 1200.0 },
      { label: "Bus (6000 g/km - Élevée)", value: "Bus", emission: 6000.0 },
      { label: "Bateau (6000 g/km - Élevée)", value: "Bateau", emission: 6000.0 },
    ]
  };

  // Mapping automatique des émissions CO2 selon le type de transport (en g/km)
  const CO2_EMISSIONS_MAP = {
    "Vélo": 0.0,
    "Marche": 0.0,
    "Vélo Électrique": 5.0,
    "Trottinette Électrique": 10.0,
    "Métro": 20.0,
    "Tramway": 25.0,
    "Train": 30.0,
    "Moto": 1200.0,
    "Voiture": 1200.0,
    "Bus": 6000.0,
    "Bateau": 6000.0,
  };

  // Fonction pour obtenir l'émission CO2 selon le type
  const getCO2EmissionByType = (type) => {
    return CO2_EMISSIONS_MAP[type] !== undefined ? CO2_EMISSIONS_MAP[type] : 0.10;
  };

  // Handler pour le changement de type avec auto-attribution CO2
  const handleTypeChange = (selectedType) => {
    const co2Value = getCO2EmissionByType(selectedType);
    setFormData({ 
      ...formData, 
      type: selectedType,
      emission_co2_per_km: co2Value
    });
  };

  useEffect(() => {
    loadTransports();
  }, []);

  // Force light backdrop for dialogs
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body > div[data-dialog-backdrop],
      div[data-dialog-backdrop="true"] {
        background-color: rgba(248, 250, 252, 0.4) !important;
        backdrop-filter: blur(3px) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Force backdrop color change when dialogs open
  useEffect(() => {
    if (createDialog || editDialog || priceCalcDialog) {
      setTimeout(() => {
        const backdrops = document.querySelectorAll('[data-dialog-backdrop]');
        backdrops.forEach(backdrop => {
          backdrop.style.backgroundColor = 'rgba(248, 250, 252, 0.4)';
          backdrop.style.backdropFilter = 'blur(3px)';
        });
      }, 50);
    }
  }, [createDialog, editDialog, priceCalcDialog]);

  const loadTransports = async () => {
    try {
      setLoading(true);
      const response = await api.fetch('/transport');
      setTransports(response.transports || []);
    } catch (error) {
      console.error("Error loading transports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      nom: "",
      type: "",
      emission_co2_per_km: "",
    });
    setCreateDialog(true);
  };

  const handleEdit = (transport) => {
    setSelectedTransport(transport);
    setFormData({
      nom: transport.nom || "",
      type: transport.type || "",
      emission_co2_per_km: transport.emission_co2_per_km || "",
    });
    setEditDialog(true);
  };

  const handleSaveCreate = async () => {
    try {
      await api.fetch('/transport', {
        method: 'POST',
        body: JSON.stringify({
          nom: formData.nom,
          type: formData.type,
          emission_co2_per_km: parseFloat(formData.emission_co2_per_km) || 0,
        }),
      });
      
      setCreateDialog(false);
      loadTransports();
    } catch (error) {
      console.error("Error creating transport:", error);
      alert("Failed to create transport");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const uri = selectedTransport.uri;
      
      await api.fetch(`/transport/${encodeURIComponent(uri)}`, {
        method: 'PUT',
        body: JSON.stringify({
          nom: formData.nom,
          type: formData.type,
          emission_co2_per_km: parseFloat(formData.emission_co2_per_km) || 0,
        }),
      });
      
      setEditDialog(false);
      loadTransports();
    } catch (error) {
      console.error("Error updating transport:", error);
      alert("Failed to update transport");
    }
  };

  const handleDelete = async (transport) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${transport.nom}"?`)) return;

    try {
      const uri = transport.uri;
      
      await api.fetch(`/transport/${encodeURIComponent(uri)}`, {
        method: 'DELETE',
      });
      
      loadTransports();
    } catch (error) {
      console.error("Error deleting transport:", error);
      alert("Failed to delete transport");
    }
  };

  const handleOpenPriceCalc = (transport) => {
    setPriceCalcData({
      distance: 10,
      selectedTransportType: transport.type,
      selectedEmission: transport.emission_co2_per_km,
      priceBreakdown: null,
    });
    setPriceCalcDialog(true);
  };

  const calculatePrice = async () => {
    try {
      const response = await api.fetch('/transport/calculate-price', {
        method: 'POST',
        body: JSON.stringify({
          transport_type: priceCalcData.selectedTransportType,
          emission_co2_per_km: priceCalcData.selectedEmission,
          distance_km: parseFloat(priceCalcData.distance) || 0,
        }),
      });
      
      setPriceCalcData({
        ...priceCalcData,
        priceBreakdown: response.pricing,
      });
    } catch (error) {
      console.error("Error calculating price:", error);
      alert("Failed to calculate price");
    }
  };

  const getTransportTypeColor = (type) => {
    if (!type) return "gray";
    if (type.includes("EcoTransport") || type.includes("NonMotorise")) return "green";
    if (type === "Transport") return "blue";
    return "orange";
  };

  const getTransportTypeLabel = (type) => {
    if (!type) return "Standard";
    if (type.includes("EcoTransport")) return "Eco Transport";
    if (type.includes("NonMotorise")) return "Non Motorisé";
    return type;
  };

  if (loading) {
    return (
      <div className="mt-12 flex justify-center">
        <Typography>Chargement des transports...</Typography>
      </div>
    );
  }

  return (
    <>
      {/* Custom Light Backdrop */}
      <LightBackdrop open={createDialog || editDialog || priceCalcDialog} />
      
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <Card>
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <div className="flex items-center justify-between">
              <Typography variant="h6" color="white">
                Gestion des Transports
              </Typography>
              <div className="flex items-center gap-4">
                <Typography variant="small" color="white" className="opacity-80">
                  Total: {transports.length} transports
                </Typography>
                <Button 
                  size="sm" 
                  color="white" 
                  className="flex items-center gap-2"
                  onClick={handleCreate}
                >
                  <PlusIcon className="h-4 w-4" />
                  Nouveau Transport
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Nom", "Type", "Émission CO2 (g/km)", "Empreinte Carbone", "Actions"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transports.map((transport, key) => {
                  const className = `py-3 px-5 ${
                    key === transports.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  const nom = transport.nom || "Inconnu";
                  const type = transport.type || "Standard";
                  const emission = transport.emission_co2_per_km !== undefined 
                    ? transport.emission_co2_per_km.toFixed(2) 
                    : "N/A";
                  
                  // Empreinte data
                  const empreinte = transport.empreinte || null;
                  const empreinteCategory = empreinte?.category || "Non spécifié";
                  const empreinteColor = empreinte?.category_color || "gray";
                  const empreinteValue = empreinte?.valeur_co2_kg !== undefined 
                    ? empreinte.valeur_co2_kg.toFixed(4) 
                    : "N/A";

                  return (
                    <tr key={key}>
                      <td className={className}>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-md bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center">
                            <TruckIcon className="h-5 w-5 text-white" />
                          </div>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {nom}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={getTransportTypeColor(type)}
                          value={getTransportTypeLabel(type)}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {emission}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex flex-col gap-1">
                          <Chip
                            variant="gradient"
                            color={empreinteColor}
                            value={empreinteCategory}
                            className="py-0.5 px-2 text-[10px] font-medium w-fit"
                          />
                          <Typography className="text-[10px] text-blue-gray-500">
                            {empreinteValue} kg CO₂
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="text"
                            color="blue"
                            className="p-2"
                            onClick={() => handleOpenPriceCalc(transport)}
                            title="Calculer le prix"
                          >
                            <CalculatorIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="text"
                            color="blue"
                            onClick={() => handleEdit(transport)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="text"
                            color="red"
                            onClick={() => handleDelete(transport)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog 
        open={createDialog} 
        handler={() => setCreateDialog(!createDialog)} 
        size="md"
        className="bg-white shadow-2xl"
        dismiss={{
          enabled: true,
          escapeKey: true,
          referencePress: false,
          referencePressEvent: 'pointerdown',
          outsidePress: true,
          outsidePressEvent: 'pointerdown',
          ancestorScroll: false,
          bubbles: true,
        }}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
        style={{
          backgroundColor: 'white',
        }}
      >
        <DialogHeader className="bg-white">Nouveau Transport</DialogHeader>
        <DialogBody divider className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <Input
            label="Nom *"
            value={formData.nom || ""}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          
          <Select
            label="Catégorie *"
            value={formData.category || ""}
            onChange={(value) => {
              setFormData({ ...formData, category: value, type: "", emission_co2_per_km: "" });
              setSelectedCategory(value);
            }}
          >
            <Option value="EcoTransport">EcoTransport (Transports écologiques motorisés)</Option>
            <Option value="TransportNonMotorise">TransportNonMotorise (Sans moteur)</Option>
            <Option value="Standard">Standard (Transports classiques)</Option>
          </Select>

          {formData.category && (
            <Select
              label="Type *"
              value={formData.type || ""}
              onChange={handleTypeChange}
              key={`create-type-${formData.category}`}
            >
              {TRANSPORT_OPTIONS[formData.category]?.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          )}
          <Input
            label="Émission CO2 par km (g) - Auto-calculé"
            type="number"
            step="0.01"
            value={formData.emission_co2_per_km || ""}
            onChange={(e) => setFormData({ ...formData, emission_co2_per_km: e.target.value })}
            disabled={formData.type !== ""}
            className={formData.type !== "" ? "bg-blue-gray-50" : ""}
          />
          <Typography variant="small" color="gray" className="mt-2">
            * Champs obligatoires
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setCreateDialog(false)}
            className="mr-1"
          >
            Annuler
          </Button>
          <Button 
            variant="gradient" 
            color="green" 
            onClick={handleSaveCreate}
            disabled={!formData.nom}
          >
            Créer
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialog} 
        handler={() => setEditDialog(!editDialog)} 
        size="md"
        className="bg-white shadow-2xl"
        dismiss={{
          enabled: true,
          escapeKey: true,
          outsidePress: true,
        }}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
        style={{
          backgroundColor: 'white',
        }}
      >
        <DialogHeader className="bg-white">Modifier Transport</DialogHeader>
        <DialogBody divider className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <Input
            label="Nom *"
            value={formData.nom || ""}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          
          <Select
            label="Catégorie *"
            value={formData.category || ""}
            onChange={(value) => {
              setFormData({ ...formData, category: value, type: "", emission_co2_per_km: "" });
              setSelectedCategory(value);
            }}
          >
            <Option value="EcoTransport">EcoTransport (Transports écologiques motorisés)</Option>
            <Option value="TransportNonMotorise">TransportNonMotorise (Sans moteur)</Option>
            <Option value="Standard">Standard (Transports classiques)</Option>
          </Select>

          {formData.category && (
            <Select
              label="Type *"
              value={formData.type || ""}
              onChange={handleTypeChange}
              key={`edit-type-${formData.category}`}
            >
              {TRANSPORT_OPTIONS[formData.category]?.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          )}
          <Input
            label="Émission CO2 par km (g) - Auto-calculé"
            type="number"
            step="0.01"
            value={formData.emission_co2_per_km || ""}
            onChange={(e) => setFormData({ ...formData, emission_co2_per_km: e.target.value })}
            disabled={formData.type !== ""}
            className={formData.type !== "" ? "bg-blue-gray-50" : ""}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setEditDialog(false)}
            className="mr-1"
          >
            Annuler
          </Button>
          <Button 
            variant="gradient" 
            color="green" 
            onClick={handleSaveEdit}
            disabled={!formData.nom}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Price Calculator Dialog */}
      <Dialog 
        open={priceCalcDialog} 
        handler={() => setPriceCalcDialog(!priceCalcDialog)} 
        size="md"
        className="bg-white shadow-2xl"
        dismiss={{
          enabled: true,
          escapeKey: true,
          outsidePress: true,
        }}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
        style={{
          backgroundColor: 'white',
        }}
      >
        <DialogHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <div className="flex items-center gap-3">
            <CurrencyEuroIcon className="h-6 w-6" />
            Calculateur de Prix
          </div>
        </DialogHeader>
        <DialogBody divider className="flex flex-col gap-4">
          <div className="bg-blue-gray-50 p-4 rounded-lg">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Transport: {priceCalcData.selectedTransportType}
            </Typography>
            <Typography variant="small" color="gray">
              Émission: {priceCalcData.selectedEmission} g CO₂/km
            </Typography>
          </div>

          <Input
            label="Distance (km)"
            type="number"
            step="1"
            min="0"
            value={priceCalcData.distance || ""}
            onChange={(e) => setPriceCalcData({ ...priceCalcData, distance: e.target.value })}
            icon={<CalculatorIcon />}
          />

          <Button 
            variant="gradient" 
            color="blue" 
            onClick={calculatePrice}
            className="flex items-center gap-2 justify-center"
          >
            <CalculatorIcon className="h-5 w-5" />
            Calculer le Prix
          </Button>

              {priceCalcData.priceBreakdown && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-300">
              <Typography variant="h5" color="green" className="mb-3 font-bold">
                Prix Total: {priceCalcData.priceBreakdown.total} €
              </Typography>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="small" color="blue-gray">
                    Prix de base:
                  </Typography>
                  <Typography variant="small" className="font-semibold">
                    {priceCalcData.priceBreakdown.base_price} €
                  </Typography>
                </div>
                
                <div className="flex justify-between items-center">
                  <Typography variant="small" color="blue-gray">
                    Coût distance ({priceCalcData.priceBreakdown.distance_km} km):
                  </Typography>
                  <Typography variant="small" className="font-semibold">
                    {priceCalcData.priceBreakdown.distance_cost} €
                  </Typography>
                </div>
                
                <div className="flex justify-between items-center">
                  <Typography variant="small" color="blue-gray">
                    Taxe carbone ({priceCalcData.priceBreakdown.co2_kg} kg CO₂):
                  </Typography>
                  <Typography variant="small" className="font-semibold text-orange-600">
                    {priceCalcData.priceBreakdown.carbon_tax} €
                  </Typography>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-green-300">
                <Typography variant="small" color="gray" className="text-center">
                  Choisissez un transport écologique pour réduire les coûts!
                </Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setPriceCalcDialog(false)}
          >
            Fermer
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default Transport;

