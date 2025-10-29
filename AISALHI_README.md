# 🤖 AISalhi - Assistant IA Avancé

## Présentation

**AISalhi** est l'assistant d'intelligence artificielle avancé développé pour votre plateforme de tourisme écologique. Il combine la puissance des modèles de langage de dernière génération avec votre ontologie sémantique RDF/OWL.

## 🌟 Fonctionnalités

### 1. Conversion Langage Naturel → SPARQL
```python
# Exemple
ai_agent.generate_sparql("hôtels écologiques à Tunis")
# Retourne requête SPARQL + résultats
```

### 2. Chat Interactif
```python
ai_agent.chat_message("Recommande-moi des activités nature")
# Conversation contextuelle
```

### 3. Recommandations Personnalisées
```python
ai_agent.recommend_activities({
    "budget": 500,
    "duration": 3,
    "interests": ["nature", "bio"]
})
```

### 4. Score Écologique
```python
ai_agent.calculate_eco_score("Hebergement", "http://...")
# Score 0-100 + analyse détaillée
```

### 5. Génération d'Itinéraires
```python
ai_agent.generate_itinerary({
    "destination": "Tunis",
    "days": 3,
    "budget": 500
})
```

### 6. 🎥 **NOUVEAU : Analyse Vidéo avec Détection d'Ambiance**
```python
ai_agent.analyze_video_vibe("video.webm", "Je cherche des événements festifs")
# Analyse vidéo + audio → Recommandations d'événements
```

**Fonctionnalité vedette** :
- 📹 Enregistrement vidéo + audio via webcam
- 🤖 Analyse multimodale (vision + audio) avec Gemini 2.5 Flash
- 🎭 Détection d'ambiance (vibe, émotions, atmosphère)
- 🎯 Recommandations d'événements similaires
- 📊 Score de correspondance (0-100%)

**Documentation complète** : [VIDEO_ANALYZER_INDEX.md](./VIDEO_ANALYZER_INDEX.md)

## Configuration

### Variable d'Environnement
```bash
# Dans votre fichier .env
AISALHI_API_KEY=votre_clé_ici
```

### Utilisation dans le Code
```python
from ai import AISalhi

# Initialisation
ai = AISalhi(sparql_manager)

# Utilisation
response = ai.ask("Quels sont les meilleurs hôtels éco ?")
```

## API Endpoints

### POST /ai/chat
```json
{
  "message": "Trouve-moi des restaurants bio"
}
```

### POST /ai/ask
```json
{
  "question": "C'est quoi une certification Green Key ?"
}
```

### POST /ai/sparql
```json
{
  "query": "SELECT ?h WHERE { ?h a eco:Hotel }"
}
```

### POST /ai/recommend-activities
```json
{
  "budget": 200,
  "difficulty": "facile",
  "interests": ["nature"]
}
```

### GET /ai/eco-score/\<type\>/\<uri\>
```
GET /ai/eco-score/Hebergement/http://example.org/...
```

## Avantages

✅ **Intelligence Avancée** : Comprend le langage naturel  
✅ **Ontologie Complète** : Connaît toute votre structure RDF  
✅ **Multifonction** : Chat, SPARQL, recommandations, scores  
✅ **Personnalisé** : Adapté au tourisme écologique  
✅ **Évolutif** : Apprentissage continu

## Architecture Technique

```
User Question
    ↓
AISalhi Agent
    ↓
[Contexte Ontologie + Prompt Optimisé]
    ↓
Modèle IA (backend)
    ↓
SPARQL Generation / Response
    ↓
Validation & Exécution
    ↓
Résultats Formatés
```

## Différences avec Solutions Génériques

| Feature | AISalhi | ChatGPT Générique |
|---------|---------|-------------------|
| Connaissance Ontologie | ✅ Complète | ❌ Aucune |
| SPARQL Generation | ✅ Optimisé | ❌ Basique |
| Données Temps Réel | ✅ Oui | ❌ Non |
| Contexte Projet | ✅ Spécialisé | ❌ Générique |
| Coût | 💰 Optimisé | 💰💰 Plus cher |

## Roadmap

- [x] Conversion NL → SPARQL
- [x] Chat interactif
- [x] Recommandations
- [x] Scores écologiques
- [ ] Cache intelligent (prochainement)
- [ ] Streaming responses
- [ ] Multilingue (FR/EN/AR)
- [ ] Voice interface

## Support

Pour toute question sur AISalhi, consultez la documentation ou contactez l'équipe de développement.

---

**AISalhi** - Propulsant l'avenir du tourisme écologique avec l'intelligence artificielle.
