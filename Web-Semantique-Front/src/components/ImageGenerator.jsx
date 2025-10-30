import React, { useState, useEffect } from "react";
import { generateImageFromText } from "../services/stabilityAI";

const ImageGenerator = ({ onImageGenerated, initialPrompt = "" }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const base64Image = await generateImageFromText(prompt);
      onImageGenerated(base64Image);
    } catch (err) {
      setError(`Erreur lors de la génération de l'image: ${err.message || 'Erreur inconnue'}`);
      console.error("Détails de l'erreur:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Décrivez votre hébergement de rêve
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: Villa moderne avec piscine..."
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Génération..." : "Générer"}
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
};

export default ImageGenerator; // OBLIGATOIRE