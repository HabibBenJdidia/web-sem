import { useState, useEffect, useRef } from "react";
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
  IconButton,
  Chip,
  Spinner,
} from "@material-tailwind/react";
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  StopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";
import api from "@/services/api";
import apiBSila from "@/services/apiBSila";

export function Restaurants() {
  // CRUD States
  const [restaurants, setRestaurants] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    situe_dans: "",
    sert: [],
  });

  // AI BSila States
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    ecoRestaurants: 0,
    totalProducts: 0,
  });
  const [voices, setVoices] = useState({});
  const [currentVoice, setCurrentVoice] = useState(null);
  const [voiceSelectorOpen, setVoiceSelectorOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadData();
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const voicesData = await apiBSila.getVoices();
      if (voicesData.success) {
        setVoices(voicesData.voices);
      }
      
      const currentVoiceData = await apiBSila.getCurrentVoice();
      if (currentVoiceData.success) {
        setCurrentVoice(currentVoiceData);
      }
    } catch (error) {
      console.error("Error loading voices:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [restaurantsData, destinationsData, produitsData] = await Promise.all([
        api.getRestaurants(),
        api.getDestinations(),
        api.getProduits(),
      ]);

      const parsedRestaurants = parseRestaurants(restaurantsData);
      const parsedDestinations = parseDestinations(destinationsData);
      const parsedProduits = parseProduits(produitsData);

      setRestaurants(parsedRestaurants);
      setDestinations(parsedDestinations);
      setProduits(parsedProduits);

      // Update stats with loaded data
      const ecoCount = parsedRestaurants.filter(r => 
        r.uri && r.uri.includes('RestaurantEco')
      ).length;

      setStats({
        totalRestaurants: parsedRestaurants.length,
        ecoRestaurants: ecoCount,
        totalProducts: parsedProduits.length,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Use the regular API to get real data counts
      const [restaurantsData, produitsData] = await Promise.all([
        api.getRestaurants(),
        api.getProduits(),
      ]);

      // Parse the data
      const parsedRestaurants = parseRestaurants(restaurantsData);
      const parsedProduits = parseProduits(produitsData);
      
      // Count eco-restaurants (those with RestaurantEco type)
      const ecoCount = parsedRestaurants.filter(r => 
        r.uri && r.uri.includes('RestaurantEco')
      ).length;

      setStats({
        totalRestaurants: parsedRestaurants.length,
        ecoRestaurants: ecoCount,
        totalProducts: parsedProduits.length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to showing current state counts
      setStats({
        totalRestaurants: restaurants.length,
        ecoRestaurants: 0,
        totalProducts: produits.length,
      });
    }
  };

  const parseRestaurants = (data) => {
    if (!Array.isArray(data)) return [];
    
    const restaurantsMap = {};
    data.forEach((item) => {
      const uri = item.s?.value || "";
      const predicate = item.p?.value || "";
      const object = item.o?.value || "";

      if (!restaurantsMap[uri]) {
        restaurantsMap[uri] = { uri, sert: [] };
      }

      if (predicate.includes("#nom")) {
        restaurantsMap[uri].nom = object;
      } else if (predicate.includes("#situeDans")) {
        restaurantsMap[uri].situe_dans = object;
      } else if (predicate.includes("#sert")) {
        restaurantsMap[uri].sert.push(object);
      }
    });

    return Object.values(restaurantsMap);
  };

  const parseDestinations = (data) => {
    if (!Array.isArray(data)) return [];
    
    const destinationsMap = {};
    data.forEach((item) => {
      const uri = item.s?.value || "";
      const predicate = item.p?.value || "";
      const object = item.o?.value || "";

      if (!destinationsMap[uri]) {
        destinationsMap[uri] = { uri };
      }

      if (predicate.includes("#nom")) {
        destinationsMap[uri].nom = object;
      }
    });

    return Object.values(destinationsMap).filter(d => d.nom);
  };

  const parseProduits = (data) => {
    if (!Array.isArray(data)) return [];
    
    const produitsMap = {};
    data.forEach((item) => {
      const uri = item.s?.value || "";
      const predicate = item.p?.value || "";
      const object = item.o?.value || "";

      if (!produitsMap[uri]) {
        produitsMap[uri] = { uri };
      }

      if (predicate.includes("#nom")) {
        produitsMap[uri].nom = object;
      }
    });

    return Object.values(produitsMap).filter(p => p.nom);
  };

  const handleOpenDialog = (restaurant = null) => {
    if (restaurant) {
      setEditingRestaurant(restaurant);
      setFormData({
        nom: restaurant.nom || "",
        situe_dans: restaurant.situe_dans || "",
        sert: restaurant.sert || [],
      });
    } else {
      setEditingRestaurant(null);
      setFormData({
        nom: "",
        situe_dans: "",
        sert: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRestaurant(null);
    setFormData({
      nom: "",
      situe_dans: "",
      sert: [],
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingRestaurant) {
        await api.updateRestaurant(editingRestaurant.uri, formData);
      } else {
        await api.createRestaurant(formData);
      }
      await loadData();
      await fetchStats();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving restaurant:", error);
      alert("Failed to save restaurant");
    }
  };

  const handleDelete = async (uri) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await api.deleteRestaurant(uri);
        await loadData();
        await fetchStats();
      } catch (error) {
        console.error("Error deleting restaurant:", error);
        alert("Failed to delete restaurant");
      }
    }
  };

  const getDestinationName = (uri) => {
    const dest = destinations.find(d => d.uri === uri);
    return dest?.nom || uri.split('#')[1] || uri;
  };

  const getProduitName = (uri) => {
    const prod = produits.find(p => p.uri === uri);
    return prod?.nom || uri.split('#')[1] || uri;
  };

  const handleProduitToggle = (produitUri) => {
    setFormData(prev => ({
      ...prev,
      sert: prev.sert.includes(produitUri)
        ? prev.sert.filter(p => p !== produitUri)
        : [...prev.sert, produitUri]
    }));
  };

  // AI BSila Functions
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!query.trim() || aiLoading) return;

    const userMessage = { type: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setAiLoading(true);

    try {
      const response = await apiBSila.voiceQuery(query);

      let parsedDataResponse = response.data_response;
      if (typeof parsedDataResponse === "string") {
        try {
          parsedDataResponse = JSON.parse(parsedDataResponse);
        } catch (e) {
          console.warn("Could not parse data_response as JSON:", e);
        }
      }

      const aiMessage = {
        type: "ai",
        vocalResponse: response.vocal_response,
        dataResponse: parsedDataResponse,
        sparqlQuery: response.sparql_query,
        sparqlResults: response.sparql_results,
        voiceAudio: response.voice_audio,
        success: response.success,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (response.voice_audio) {
        playVoice(response.voice_audio);
      }

      setQuery("");
      fetchStats();
    } catch (error) {
      const errorMessage = {
        type: "error",
        text: error.message || "Une erreur s'est produite",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  const startListening = () => {
    setIsListening(true);

    const onResult = (transcript) => {
      setQuery(transcript);
      setIsListening(false);
    };

    const onError = (error) => {
      console.error("Speech recognition error:", error);
      setIsListening(false);
      alert(`Erreur de reconnaissance vocale: ${error}`);
    };

    const recognitionInstance = apiBSila.startVoiceRecognition(onResult, onError);
    setRecognition(recognitionInstance);
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const playVoice = (base64Audio) => {
    if (currentAudio) {
      apiBSila.stopVoiceAudio(currentAudio);
    }

    const audio = apiBSila.playVoiceAudio(base64Audio);
    setCurrentAudio(audio);
    setIsSpeaking(true);

    if (audio) {
      audio.onended = () => setIsSpeaking(false);
    }
  };

  const stopVoice = () => {
    if (currentAudio) {
      apiBSila.stopVoiceAudio(currentAudio);
      setIsSpeaking(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    apiBSila.reset();
  };

  const handleVoiceChange = async (voiceKey) => {
    try {
      const result = await apiBSila.setVoice(voiceKey);
      if (result.success) {
        setCurrentVoice({ voice_key: voiceKey, voice: voices[voiceKey] });
        setVoiceSelectorOpen(false);
        
        // Add a message to indicate voice change
        setMessages((prev) => [
          ...prev,
          {
            type: "system",
            content: `Voice changed to ${voices[voiceKey].name} (${voices[voiceKey].description})`,
          },
        ]);
      }
    } catch (error) {
      console.error("Error changing voice:", error);
    }
  };

  const quickActions = [
    { label: "Tous les Restaurants", query: "Liste tous les restaurants" },
    { label: "Restaurants Éco", query: "Liste les restaurants écologiques" },
    { label: "Produits Bio", query: "Montre-moi les produits biologiques" },
    { label: "Produits d'Été", query: "Quels produits sont de saison en été?" },
  ];

  const handleQuickAction = (actionQuery) => {
    setQuery(actionQuery);
  };

  const renderDataResponse = (data) => {
    if (typeof data === "string") {
      let cleanedData = data.trim();
      if (cleanedData.startsWith("```json") || cleanedData.startsWith("```")) {
        cleanedData = cleanedData
          .replace(/^```json?\s*/i, "")
          .replace(/```\s*$/, "")
          .trim();
      }

      try {
        data = JSON.parse(cleanedData);
      } catch (e) {
        return (
          <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
            {cleanedData}
          </div>
        );
      }
    }

    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      const isSparqlFormat = Object.values(firstItem).some(
        (val) => val && typeof val === "object" && "value" in val
      );

      if (isSparqlFormat) {
        const columns = Object.keys(firstItem);
        return (
          <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-300">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-400 last:border-r-0"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`${rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-100 transition-colors`}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-6 py-3 text-sm text-gray-800 font-medium border-r border-gray-200 last:border-r-0"
                      >
                        {row[col]?.value || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      return (
        <div className="overflow-x-auto shadow-md rounded-lg border-2 border-gray-300">
          <table className="min-w-full bg-white">
            <thead className="bg-gradient-to-r from-green-500 to-green-600">
              <tr>
                {Object.keys(firstItem).map((col, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-green-400 last:border-r-0"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`${rowIdx % 2 === 0 ? "bg-white" : "bg-green-50"} hover:bg-green-100 transition-colors duration-150`}
                >
                  {Object.keys(firstItem).map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-6 py-3 text-sm text-gray-900 font-medium border-r border-gray-300 last:border-r-0"
                    >
                      {typeof row[col] === "boolean"
                        ? row[col] ? "✓ Oui" : "✗ Non"
                        : row[col] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (typeof data === "object" && !Array.isArray(data)) {
      return (
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              return (
                <div key={key}>
                  <Typography variant="small" className="font-semibold text-gray-700 mb-2 capitalize">
                    {key.replace(/_/g, " ")}
                  </Typography>
                  <div className="overflow-x-auto shadow-lg rounded-lg border-2 border-emerald-300">
                    <table className="min-w-full bg-white text-sm">
                      <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600">
                        <tr>
                          {Object.keys(value[0]).map((col, idx) => (
                            <th
                              key={idx}
                              className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wide border-r border-emerald-400 last:border-r-0"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-200">
                        {value.map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            className={`${rowIdx % 2 === 0 ? "bg-white" : "bg-emerald-50"} hover:bg-emerald-100 transition-colors duration-200`}
                          >
                            {Object.keys(value[0]).map((col, colIdx) => (
                              <td
                                key={colIdx}
                                className="px-5 py-3 text-gray-900 font-medium border-r border-emerald-200 last:border-r-0"
                              >
                                {typeof row[col] === "boolean"
                                  ? row[col] ? "✓ Oui" : "✗ Non"
                                  : row[col] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    return (
      <div className="bg-gray-50 rounded p-3 max-h-60 overflow-y-auto">
        <pre className="text-xs text-gray-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Typography variant="h6">Loading restaurants...</Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* CRUD Section */}
      <Card>
        <CardHeader variant="gradient" color="green" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              Restaurant Management
            </Typography>
            <Button
              color="white"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => handleOpenDialog()}
            >
              <PlusIcon className="h-4 w-4" />
              Add Restaurant
            </Button>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Name", "Location", "Products Served", "Actions"].map((el) => (
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
              {restaurants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-3 px-5 text-center">
                    <Typography variant="small" color="blue-gray">
                      No restaurants found. Add your first restaurant!
                    </Typography>
                  </td>
                </tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr key={restaurant.uri}>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {restaurant.nom}
                      </Typography>
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                        {restaurant.situe_dans ? getDestinationName(restaurant.situe_dans) : "N/A"}
                      </Typography>
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <div className="flex flex-wrap gap-1">
                        {restaurant.sert?.length > 0 ? (
                          restaurant.sert.slice(0, 3).map((produitUri, idx) => (
                            <Chip
                              key={idx}
                              value={getProduitName(produitUri)}
                              size="sm"
                              color="green"
                              className="text-xs"
                            />
                          ))
                        ) : (
                          <Typography variant="small" className="text-xs text-blue-gray-400">
                            No products
                          </Typography>
                        )}
                        {restaurant.sert?.length > 3 && (
                          <Chip
                            value={`+${restaurant.sert.length - 3} more`}
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <div className="flex gap-2">
                        <IconButton
                          variant="text"
                          color="blue"
                          onClick={() => handleOpenDialog(restaurant)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => handleDelete(restaurant.uri)}
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
        </CardBody>
      </Card>

      {/* AI BSila Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 py-8 px-6 rounded-xl shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <MicrophoneIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              🎤 AI BSila Assistant
            </h2>
            <p className="text-lg text-white/90 font-medium">
              Posez des questions sur les restaurants et produits locaux
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-700 shadow-xl border-0">
              <CardBody className="p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <div>
                    <Typography variant="small" className="text-white/70">
                      Restaurants
                    </Typography>
                    <Typography variant="h4" className="text-white font-bold">
                      {stats.totalRestaurants}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-xl border-0">
              <CardBody className="p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <Typography variant="small" className="text-white/70">
                      Éco-Restaurants
                    </Typography>
                    <Typography variant="h4" className="text-white font-bold">
                      {stats.ecoRestaurants}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl border-0">
              <CardBody className="p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <Typography variant="small" className="text-white/70">
                      Produits Locaux
                    </Typography>
                    <Typography variant="h4" className="text-white font-bold">
                      {stats.totalProducts}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-xl">
            <CardBody>
              {/* Voice Selector Section */}
              <div className="mb-6">
                <Typography variant="h6" color="blue-gray" className="mb-3 font-bold flex items-center gap-2">
                  🎙️ Voice Assistant
                </Typography>
                <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-200">
                  <Typography variant="small" className="font-semibold mb-2">
                    Current Voice:
                  </Typography>
                  <div className="mb-3 p-2 bg-white rounded border border-purple-300">
                    <Typography variant="small" className="font-bold text-purple-900">
                      {currentVoice ? (
                        <>
                          {currentVoice.voice.gender === "male" ? "♂️" : "♀️"} {currentVoice.voice.name}
                          <Typography variant="small" className="text-xs text-gray-600">
                            {currentVoice.voice.description}
                          </Typography>
                        </>
                      ) : (
                        "Loading..."
                      )}
                    </Typography>
                  </div>
                  <Button
                    variant="gradient"
                    color="purple"
                    size="sm"
                    fullWidth
                    onClick={() => setVoiceSelectorOpen(!voiceSelectorOpen)}
                    className="flex items-center justify-center gap-2"
                  >
                    🎤 Change Voice
                  </Button>
                </div>

                {/* Voice Selection Dropdown */}
                {voiceSelectorOpen && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                    <Typography variant="small" className="font-semibold mb-3 text-center">
                      Choose a Voice:
                    </Typography>
                    <div className="space-y-2">
                      {Object.entries(voices).map(([key, voice]) => (
                        <Button
                          key={key}
                          size="sm"
                          variant={currentVoice?.voice_key === key ? "filled" : "outlined"}
                          color="purple"
                          fullWidth
                          className="justify-start text-left px-3 py-2 normal-case"
                          onClick={() => handleVoiceChange(key)}
                        >
                          <div className="flex items-start gap-2 w-full">
                            <span className="text-lg">
                              {voice.gender === "male" ? "♂️" : "♀️"}
                            </span>
                            <div className="flex-1">
                              <Typography variant="small" className="font-semibold">
                                {voice.name}
                              </Typography>
                              <Typography variant="small" className="text-xs opacity-70">
                                {voice.description}
                              </Typography>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Typography variant="h6" color="blue-gray" className="mb-4 font-bold">
                Actions Rapides
              </Typography>
              <div className="space-y-2">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    color="blue"
                    size="sm"
                    fullWidth
                    className="text-left justify-start normal-case text-xs"
                    onClick={() => handleQuickAction(action.query)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outlined"
                  color="red"
                  size="sm"
                  fullWidth
                  onClick={clearChat}
                  className="flex items-center justify-center gap-2 text-xs"
                >
                  <TrashIcon className="h-3 w-3" />
                  Effacer
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="shadow-xl h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MicrophoneIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <Typography variant="h6" color="gray" className="mb-1 text-sm">
                    Commencez une conversation
                  </Typography>
                  <Typography variant="small" color="gray" className="text-xs">
                    Posez une question vocale ou écrite
                  </Typography>
                </div>
              )}

              {messages.map((message, idx) => (
                <div key={idx}>
                  {message.type === "user" && (
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-4 py-2 max-w-md shadow">
                        <Typography variant="small" className="text-white text-sm">
                          {message.text}
                        </Typography>
                      </div>
                    </div>
                  )}

                  {message.type === "ai" && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-xl rounded-tl-none px-4 py-3 max-w-2xl shadow border">
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <Typography variant="small" className="font-semibold text-green-600 text-xs">
                              🔊 Réponse
                            </Typography>
                            {message.voiceAudio && (
                              <Button
                                size="sm"
                                variant="text"
                                color="green"
                                onClick={() =>
                                  isSpeaking ? stopVoice() : playVoice(message.voiceAudio)
                                }
                                className="p-1 text-xs"
                              >
                                {isSpeaking ? (
                                  <SpeakerXMarkIcon className="h-3 w-3" />
                                ) : (
                                  <SpeakerWaveIcon className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                          <Typography variant="small" className="text-gray-700 text-sm">
                            {message.vocalResponse}
                          </Typography>
                        </div>

                        {message.dataResponse && (
                          <div className="mt-2 pt-2 border-t">
                            <Typography variant="small" className="font-semibold text-blue-600 mb-1 text-xs">
                              📊 Données
                            </Typography>
                            {renderDataResponse(message.dataResponse)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {message.type === "error" && (
                    <div className="flex justify-center">
                      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2">
                        <Typography variant="small" className="text-xs">{message.text}</Typography>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-xl px-4 py-3 shadow border">
                    <div className="flex items-center gap-2">
                      <Spinner className="h-3 w-3" />
                      <Typography variant="small" color="gray" className="text-xs">
                        AI BSila réfléchit...
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-3 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Posez une question..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={aiLoading || isListening}
                    className="!border-gray-300"
                    size="md"
                    labelProps={{ className: "hidden" }}
                  />
                </div>
                <Button
                  size="sm"
                  color={isListening ? "red" : "purple"}
                  className="rounded-full p-2"
                  onClick={isListening ? stopListening : startListening}
                  type="button"
                >
                  {isListening ? (
                    <StopIcon className="h-4 w-4" />
                  ) : (
                    <MicrophoneIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  color="blue"
                  className="rounded-full p-2"
                  type="submit"
                  disabled={aiLoading || !query.trim()}
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </Button>
              </form>
              {isListening && (
                <div className="mt-1 text-center">
                  <Typography variant="small" color="red" className="font-medium text-xs">
                    🎤 Écoute...
                  </Typography>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* CRUD Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader>
          {editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
        </DialogHeader>
        <DialogBody divider className="max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-4">
            <Input
              label="Restaurant Name"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />

            <Select
              label="Location (Destination)"
              value={formData.situe_dans}
              onChange={(value) => setFormData({ ...formData, situe_dans: value })}
            >
              {destinations.map((dest) => (
                <Option key={dest.uri} value={dest.uri}>
                  {dest.nom}
                </Option>
              ))}
            </Select>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Products Served
              </Typography>
              <div className="max-h-48 overflow-y-auto border border-blue-gray-200 rounded-lg p-3">
                {produits.length === 0 ? (
                  <Typography variant="small" className="text-center text-blue-gray-400">
                    No products available
                  </Typography>
                ) : (
                  <div className="flex flex-col gap-2">
                    {produits.map((produit) => (
                      <label
                        key={produit.uri}
                        className="flex items-center gap-2 cursor-pointer hover:bg-blue-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.sert.includes(produit.uri)}
                          onChange={() => handleProduitToggle(produit.uri)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <Typography variant="small">{produit.nom}</Typography>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleCloseDialog} className="mr-2">
            Cancel
          </Button>
          <Button variant="gradient" color="green" onClick={handleSubmit}>
            {editingRestaurant ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Restaurants;
