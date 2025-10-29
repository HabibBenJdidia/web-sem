import { useState, useEffect, useRef } from "react";
import {
  Typography,
  Card,
  CardBody,
  Button,
  Input,
  Spinner,
} from "@material-tailwind/react";
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  StopIcon,
  TrashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";
import apiBSila from "@/services/apiBSila";

export function AIBSilaPage() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    ecoRestaurants: 0,
    totalProducts: 0,
  });
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [restaurants, ecoRestaurants, products] = await Promise.all([
        apiBSila.getRestaurants(),
        apiBSila.getEcoRestaurants(),
        apiBSila.getProducts(),
      ]);

      // Extract counts from responses
      const restaurantCount = restaurants.sparql_results?.length || 0;
      const ecoCount = ecoRestaurants.sparql_results?.length || 0;
      const productCount = products.sparql_results?.length || 0;

      setStats({
        totalRestaurants: restaurantCount,
        ecoRestaurants: ecoCount,
        totalProducts: productCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Send text query
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = { type: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

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
      
      // Refresh stats after query
      fetchStats();
    } catch (error) {
      const errorMessage = {
        type: "error",
        text: error.message || "Une erreur s'est produite",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Start voice recognition
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

    const recognitionInstance = apiBSila.startVoiceRecognition(
      onResult,
      onError
    );
    setRecognition(recognitionInstance);
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  // Play voice audio
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

  // Stop voice audio
  const stopVoice = () => {
    if (currentAudio) {
      apiBSila.stopVoiceAudio(currentAudio);
      setIsSpeaking(false);
    }
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    apiBSila.reset();
  };

  // Quick action buttons
  const quickActions = [
    { label: "Tous les Restaurants", query: "Liste tous les restaurants" },
    { label: "Restaurants Éco", query: "Liste les restaurants écologiques" },
    { label: "Produits Bio", query: "Montre-moi les produits biologiques" },
    { label: "Produits d'Été", query: "Quels produits sont de saison en été?" },
  ];

  const handleQuickAction = (actionQuery) => {
    setQuery(actionQuery);
  };

  // Render data response in clean format
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
                    className={`${
                      rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50"
                    } hover:bg-blue-100 transition-colors`}
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
                  className={`${
                    rowIdx % 2 === 0 ? "bg-white" : "bg-green-50"
                  } hover:bg-green-100 transition-colors duration-150`}
                >
                  {Object.keys(firstItem).map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-6 py-3 text-sm text-gray-900 font-medium border-r border-gray-300 last:border-r-0"
                    >
                      {typeof row[col] === "boolean"
                        ? row[col]
                          ? "✓ Oui"
                          : "✗ Non"
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
                  <Typography
                    variant="small"
                    className="font-semibold text-gray-700 mb-2 capitalize"
                  >
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
                            className={`${
                              rowIdx % 2 === 0 ? "bg-white" : "bg-emerald-50"
                            } hover:bg-emerald-100 transition-colors duration-200`}
                          >
                            {Object.keys(value[0]).map((col, colIdx) => (
                              <td
                                key={colIdx}
                                className="px-5 py-3 text-gray-900 font-medium border-r border-emerald-200 last:border-r-0"
                              >
                                {typeof row[col] === "boolean"
                                  ? row[col]
                                    ? "✓ Oui"
                                    : "✗ Non"
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
            } else if (typeof value === "object" && !Array.isArray(value)) {
              return (
                <div key={key} className="bg-gray-50 rounded p-3">
                  <Typography
                    variant="small"
                    className="font-semibold text-gray-700 mb-1 capitalize"
                  >
                    {key.replace(/_/g, " ")}
                  </Typography>
                  <div className="text-sm text-gray-600">
                    {JSON.stringify(value, null, 2)}
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={key}
                  className="flex justify-between items-center bg-gray-50 rounded p-2"
                >
                  <Typography
                    variant="small"
                    className="font-semibold text-gray-700 capitalize"
                  >
                    {key.replace(/_/g, " ")}:
                  </Typography>
                  <Typography variant="small" className="text-gray-600">
                    {String(value)}
                  </Typography>
                </div>
              );
            }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section with Stats */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <MicrophoneIcon className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              🎤 AI BSila Assistant
            </h1>
            <p className="text-xl text-white/90 font-medium">
              Votre assistant vocal intelligent pour restaurants et produits locaux
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {/* Active Members / Total Restaurants */}
            <Card className="bg-gradient-to-br from-purple-500 to-purple-700 shadow-2xl border-0">
              <CardBody className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                </div>
                <Typography variant="h6" className="text-white/80 font-medium mb-2">
                  Restaurants
                </Typography>
                <Typography variant="h2" className="text-white font-bold">
                  {stats.totalRestaurants}
                </Typography>
                <Typography variant="small" className="text-white/70 mt-2">
                  Restaurants disponibles
                </Typography>
              </CardBody>
            </Card>

            {/* Total Trainers / Eco Restaurants */}
            <Card className="bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-2xl border-0">
              <CardBody className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <Typography variant="h6" className="text-white/80 font-medium mb-2">
                  Éco-Restaurants
                </Typography>
                <Typography variant="h2" className="text-white font-bold">
                  {stats.ecoRestaurants}
                </Typography>
                <Typography variant="small" className="text-white/70 mt-2">
                  Certifiés écologiques
                </Typography>
              </CardBody>
            </Card>

            {/* Total Revenue / Total Products */}
            <Card className="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl border-0">
              <CardBody className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
                <Typography variant="h6" className="text-white/80 font-medium mb-2">
                  Produits Locaux
                </Typography>
                <Typography variant="h2" className="text-white font-bold">
                  {stats.totalProducts}
                </Typography>
                <Typography variant="small" className="text-white/70 mt-2">
                  Produits disponibles
                </Typography>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border border-gray-200">
              <CardBody>
                <Typography variant="h5" color="blue-gray" className="mb-4 font-bold">
                  Actions Rapides
                </Typography>
                <div className="space-y-3">
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      color="blue"
                      size="sm"
                      fullWidth
                      className="text-left justify-start normal-case"
                      onClick={() => handleQuickAction(action.query)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outlined"
                    color="red"
                    size="sm"
                    fullWidth
                    onClick={clearChat}
                    className="flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Effacer le Chat
                  </Button>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <Typography variant="small" className="font-semibold text-blue-900 mb-2">
                    💡 Astuce
                  </Typography>
                  <Typography variant="small" className="text-blue-800">
                    Posez des questions sur les restaurants et produits locaux.
                    Utilisez le micro pour parler ou tapez votre question!
                  </Typography>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border border-gray-200 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MicrophoneIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <Typography variant="h6" color="gray" className="mb-2">
                      Commencez une conversation
                    </Typography>
                    <Typography variant="small" color="gray">
                      Posez une question vocale ou écrite
                    </Typography>
                  </div>
                )}

                {messages.map((message, idx) => (
                  <div key={idx}>
                    {/* User Message */}
                    {message.type === "user" && (
                      <div className="flex justify-end">
                        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-6 py-3 max-w-md shadow-md">
                          <Typography variant="small" className="text-white">
                            {message.text}
                          </Typography>
                        </div>
                      </div>
                    )}

                    {/* AI Message */}
                    {message.type === "ai" && (
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-none px-6 py-4 max-w-2xl shadow-md border border-gray-200">
                          {/* Voice Response */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <Typography
                                variant="small"
                                className="font-semibold text-green-600"
                              >
                                🔊 Réponse Vocale
                              </Typography>
                              {message.voiceAudio && (
                                <Button
                                  size="sm"
                                  variant="text"
                                  color="green"
                                  onClick={() =>
                                    isSpeaking
                                      ? stopVoice()
                                      : playVoice(message.voiceAudio)
                                  }
                                  className="flex items-center gap-1"
                                >
                                  {isSpeaking ? (
                                    <>
                                      <SpeakerXMarkIcon className="h-4 w-4" />
                                      Stop
                                    </>
                                  ) : (
                                    <>
                                      <SpeakerWaveIcon className="h-4 w-4" />
                                      Jouer
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                            <Typography variant="small" className="text-gray-700">
                              {message.vocalResponse}
                            </Typography>
                          </div>

                          {/* Data Response */}
                          {message.dataResponse && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Typography
                                variant="small"
                                className="font-semibold text-blue-600 mb-2"
                              >
                                📊 Données
                              </Typography>
                              {renderDataResponse(message.dataResponse)}
                            </div>
                          )}

                          {/* SPARQL Query */}
                          {message.sparqlQuery && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Typography
                                variant="small"
                                className="font-semibold text-purple-600 mb-2"
                              >
                                🔍 Requête SPARQL
                              </Typography>
                              <div className="bg-purple-50 rounded p-2 max-h-32 overflow-y-auto">
                                <pre className="text-xs text-purple-900">
                                  {message.sparqlQuery}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {message.type === "error" && (
                      <div className="flex justify-center">
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-2">
                          <Typography variant="small">{message.text}</Typography>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-6 py-4 shadow-md border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        <Typography variant="small" color="gray">
                          AI BSila réfléchit...
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Posez une question..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      disabled={loading || isListening}
                      className="!border-gray-300"
                      labelProps={{
                        className: "hidden",
                      }}
                    />
                  </div>

                  {/* Voice Button */}
                  <Button
                    size="lg"
                    color={isListening ? "red" : "purple"}
                    className="rounded-full p-3"
                    onClick={isListening ? stopListening : startListening}
                    type="button"
                  >
                    {isListening ? (
                      <StopIcon className="h-6 w-6" />
                    ) : (
                      <MicrophoneIcon className="h-6 w-6" />
                    )}
                  </Button>

                  {/* Send Button */}
                  <Button
                    size="lg"
                    color="blue"
                    className="rounded-full p-3"
                    type="submit"
                    disabled={loading || !query.trim()}
                  >
                    <PaperAirplaneIcon className="h-6 w-6" />
                  </Button>
                </form>

                {isListening && (
                  <div className="mt-2 text-center">
                    <Typography variant="small" color="red" className="font-medium">
                      🎤 Écoute en cours...
                    </Typography>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIBSilaPage;



