/**
 * Exemple d'utilisation du service AISalhi
 * Ce fichier montre comment intégrer AISalhi dans vos composants
 */

import AISalhiService from '@/services/aisalhi.service';

// ==========================================
// EXEMPLE 1: Question Simple
// ==========================================
export async function askSimpleQuestion() {
  try {
    const response = await AISalhiService.ask(
      "Combien de certifications écologiques sont disponibles?"
    );
    console.log('Réponse AISalhi:', response.response);
    return response;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ==========================================
// EXEMPLE 2: Chat Interactif
// ==========================================
export async function startChat() {
  try {
    const response = await AISalhiService.chat(
      "Trouve-moi des activités de randonnée écologiques"
    );
    console.log('Réponse chat:', response);
    return response;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ==========================================
// EXEMPLE 3: Recommandations Personnalisées
// ==========================================
export async function getPersonalizedRecommendations() {
  try {
    const userProfile = {
      age: 28,
      nationalite: 'FR',
      preferences: ['nature', 'randonnée', 'photographie'],
      budget: 120
    };

    const recommendations = await AISalhiService.getRecommendations(userProfile);
    console.log('Recommandations:', recommendations);
    return recommendations;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ==========================================
// EXEMPLE 4: Requête SPARQL
// ==========================================
export async function executeSparqlQuery() {
  try {
    const query = `
      PREFIX eco: <http://example.org/eco-tourism#>
      SELECT ?ville ?nom WHERE {
        ?ville a eco:Ville .
        ?ville eco:nom ?nom .
      } LIMIT 10
    `;

    const results = await AISalhiService.executeSPARQL(query);
    console.log('Résultats SPARQL:', results);
    return results;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ==========================================
// EXEMPLE 5: Score Écologique
// ==========================================
export async function getEcoScore() {
  try {
    const hotelUri = 'http://example.org/eco-tourism#Hotel_EcoLodge';
    const score = await AISalhiService.getEcoScore('Hebergement', hotelUri);
    console.log('Score écologique:', score);
    return score;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ==========================================
// EXEMPLE 6: Recherche en Langage Naturel
// ==========================================
export async function naturalSearch() {
  try {
    const results = await AISalhiService.naturalLanguageSearch(
      "Hôtels écologiques près de la mer avec prix modéré"
    );
    console.log('Résultats recherche:', results);
    return results;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ==========================================
// EXEMPLE 7: Comparaison d'Entités
// ==========================================
export async function compareHotels() {
  try {
    const hotel1 = 'http://example.org/eco-tourism#Hotel_A';
    const hotel2 = 'http://example.org/eco-tourism#Hotel_B';
    
    const comparison = await AISalhiService.compareEntities(hotel1, hotel2);
    console.log('Comparaison:', comparison);
    return comparison;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ==========================================
// EXEMPLE 8: Suggestions d'Amélioration
// ==========================================
export async function getImprovements() {
  try {
    const hotelUri = 'http://example.org/eco-tourism#Hotel_Standard';
    const suggestions = await AISalhiService.getImprovementSuggestions(
      'Hebergement',
      hotelUri
    );
    console.log('Suggestions:', suggestions);
    return suggestions;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ==========================================
// EXEMPLE 9: Réinitialiser Session
// ==========================================
export async function resetAISalhiSession() {
  try {
    const result = await AISalhiService.resetChat();
    console.log('Session réinitialisée:', result);
    return result;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ==========================================
// EXEMPLE 10: Informations sur AISalhi
// ==========================================
export async function getAISalhiInfo() {
  try {
    const info = await AISalhiService.getHelp();
    console.log('Info AISalhi:', info);
    console.log('Nom:', info.name);
    console.log('Description:', info.description);
    console.log('Capacités:', info.capabilities);
    return info;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// ==========================================
// EXEMPLE D'UTILISATION DANS UN COMPOSANT REACT
// ==========================================

/*
import React, { useState, useEffect } from 'react';
import { Button, Card, Typography } from '@material-tailwind/react';
import AISalhiService from '@/services/aisalhi.service';

export function MyComponent() {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    try {
      const response = await AISalhiService.ask(
        "Quelles sont les destinations écologiques?"
      );
      setAnswer(response.response);
    } catch (error) {
      setAnswer('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Button onClick={handleAsk} disabled={loading}>
        {loading ? 'Chargement...' : 'Demander à AISalhi'}
      </Button>
      {answer && (
        <Typography className="mt-4">
          {answer}
        </Typography>
      )}
    </Card>
  );
}
*/

// ==========================================
// TESTER TOUS LES EXEMPLES
// ==========================================
export async function testAllExamples() {
  console.log('🚀 Début des tests AISalhi...\n');

  console.log('1️⃣ Test: Question Simple');
  await askSimpleQuestion();
  
  console.log('\n2️⃣ Test: Chat');
  await startChat();
  
  console.log('\n3️⃣ Test: Recommandations');
  await getPersonalizedRecommendations();
  
  console.log('\n4️⃣ Test: SPARQL');
  await executeSparqlQuery();
  
  console.log('\n5️⃣ Test: Score Écologique');
  await getEcoScore();
  
  console.log('\n6️⃣ Test: Recherche Naturelle');
  await naturalSearch();
  
  console.log('\n7️⃣ Test: Comparaison');
  await compareHotels();
  
  console.log('\n8️⃣ Test: Suggestions');
  await getImprovements();
  
  console.log('\n9️⃣ Test: Réinitialiser');
  await resetAISalhiSession();
  
  console.log('\n🔟 Test: Info AISalhi');
  await getAISalhiInfo();
  
  console.log('\n✅ Tests terminés!');
}

// Pour tester dans la console du navigateur:
// import { testAllExamples } from './src/examples/aisalhi.examples.js';
// testAllExamples();
