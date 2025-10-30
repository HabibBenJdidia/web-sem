// src/services/stabilityAI.js

const API_KEY = 'sk-0bf6uWSha3fKvZYIgHDMAOkRz6s6ziIhz9lFRSbaRJVuMWfG'; // Clé en dur

export const generateImageFromText = async (prompt) => {
  try {
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.artifacts[0].base64;
  } catch (error) {
    console.error("Erreur Stability AI:", error);
    throw error;
  }
};