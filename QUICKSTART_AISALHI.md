# 🚀 Démarrage Rapide - AISalhi

## Configuration en 3 Étapes

### 1. Variable d'Environnement

Créez ou modifiez votre fichier `.env` :

```bash
AISALHI_API_KEY=votre_clé_google_generative_ai
```

**Où obtenir la clé ?**
- Allez sur https://makersuite.google.com/app/apikey
- Créez une clé API
- Copiez-la dans `.env`

### 2. Démarrer le Backend

```powershell
python app.py
```

Vous devriez voir :
```
✅ AISalhi initialized successfully
🚀 Server running on http://localhost:8000
```

### 3. Tester

```powershell
# Test simple
curl http://localhost:8000/ai/help
```

## 🎯 Exemples d'Utilisation

### Exemple 1 : Question Simple

```powershell
curl -X POST http://localhost:8000/ai/ask `
  -H "Content-Type: application/json" `
  -d '{"question": "Quels sont les meilleurs hôtels écologiques ?"}'
```

**Réponse** :
```json
{
  "answer": "Les meilleurs hôtels écologiques sont certifiés...",
  "powered_by": "AISalhi"
}
```

### Exemple 2 : Conversion NL → SPARQL

```powershell
# Demande en langage naturel
"Trouve-moi les hôtels à Tunis"

# AISalhi génère automatiquement :
PREFIX eco: <http://example.org/eco-tourism#>
SELECT ?hotel ?nom WHERE {
  ?hotel a eco:Hebergement ;
         eco:nom ?nom ;
         eco:situe_dans ?ville .
  ?ville eco:nom "Tunis" .
}

# Et exécute la requête !
```

### Exemple 3 : Chat Interactif

```python
# Dans votre code Python
from ai import AISalhi

ai = AISalhi(sparql_manager)

# Conversation
response1 = ai.chat_message("Bonjour, je cherche un hôtel")
# AISalhi: "Bonjour ! Je peux vous aider..."

response2 = ai.chat_message("À Tunis, écologique")
# AISalhi: "J'ai trouvé 3 hôtels certifiés à Tunis..."

response3 = ai.chat_message("Le moins cher")
# AISalhi: "Le moins cher est EcoLodge à 80€/nuit..."
```

### Exemple 4 : Recommandations

```python
recommendations = ai.recommend_activities({
    "budget": 500,
    "duration_days": 3,
    "interests": ["nature", "bio", "culture"],
    "difficulty": "facile"
})

# Retourne top 5 activités personnalisées
```

### Exemple 5 : Score Écologique

```python
score = ai.calculate_eco_score(
    "Hebergement",
    "http://example.org/eco-tourism#Hotel_EcoLodge"
)

# Retourne :
{
    "score": 92,
    "strengths": ["Panneaux solaires", "Certification Green Key"],
    "improvements": ["Installer récupération eau pluie"],
    "comparison": "Meilleur que 85% des hôtels"
}
```

## 🎨 Frontend (React)

### Composant Simple

```jsx
import { useState } from 'react';
import api from '@/services/api';

function AISalhiChat() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  
  const askAISalhi = async () => {
    const result = await api.askAI(question);
    setResponse(result.answer);
  };
  
  return (
    <div>
      <input 
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Posez votre question à AISalhi..."
      />
      <button onClick={askAISalhi}>
        Demander à AISalhi
      </button>
      <div>{response}</div>
    </div>
  );
}
```

## 📊 Endpoints Disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/ai/help` | GET | Liste des endpoints |
| `/ai/ask` | POST | Question simple |
| `/ai/chat` | POST | Chat interactif |
| `/ai/sparql` | POST | NL → SPARQL |
| `/ai/recommend-activities` | POST | Recommandations |
| `/ai/eco-score/<type>/<uri>` | GET | Score écologique |
| `/ai/reset` | POST | Reset chat |

## 💡 Astuces

### 1. Questions Claires
```
❌ "hotel"
✅ "Quels sont les hôtels écologiques à Tunis ?"
```

### 2. Contexte
```
❌ "Le moins cher"
✅ "Parmi les hôtels écologiques à Tunis, lequel est le moins cher ?"
```

### 3. Spécificité
```
❌ "Des activités"
✅ "Des randonnées faciles pour famille avec enfants"
```

## 🐛 Dépannage

### Erreur : "AISALHI_API_KEY not found"
```bash
# Vérifier .env existe
ls .env

# Vérifier contenu
cat .env

# Doit contenir :
AISALHI_API_KEY=votre_clé
```

### Erreur : "Rate limit exceeded"
```
Vous avez dépassé les 15 requêtes/minute (free tier).
Solution : Attendre 1 minute ou upgrade plan.
```

### Réponses lentes
```
Normal pour première requête (2-3 sec).
Ensuite plus rapide avec cache.
```

## 📖 Documentation Complète

Consultez :
- `AISALHI_README.md` - Documentation complète
- `MIGRATION_AISALHI.md` - Guide migration
- `app.py` lignes 974-1074 - Code endpoints

## 🎉 C'est Tout !

Votre AISalhi est opérationnel ! Commencez à poser des questions sur le tourisme écologique ! 🌿
