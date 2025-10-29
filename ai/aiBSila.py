"""
AI Voice Assistant for Restaurant and Local Products
Specialized agent that:
1. Accepts voice input from users
2. Transforms requests to SPARQL queries
3. Executes queries on Fuseki
4. Provides dual responses:
   - Voice response with explanations
   - Textual response with raw data
"""

import google.generativeai as genai
import os
import json
from typing import Dict, Any, List, Tuple
from gtts import gTTS
from elevenlabs import ElevenLabs
import base64
import io

class AIBSilaAgent:
    """
    Intelligent Voice AI Agent for Eco-Tourism
    Focused on Restaurants and Local Products
    """
    
    def __init__(self, sparql_manager, api_key=None, elevenlabs_key=None):
        self.sparql_manager = sparql_manager
        api_key = api_key or os.getenv('GEMINI_API_KEY', 'AIzaSyCUL3KW_FMEqEWuSzdSd3cHvm8i5ugAmU0')
        genai.configure(api_key=api_key)
        
        # Initialize ElevenLabs client
        elevenlabs_key = elevenlabs_key or os.getenv('ELEVENLABS_API_KEY', 'sk_1ae6238c7dd8c2846f3b6ae5fd66cb829690350a51403857')
        self.elevenlabs = ElevenLabs(api_key=elevenlabs_key)
        
        # Available voices with metadata
        self.available_voices = {
            "rachel": {
                "id": "21m00Tcm4TlvDq8ikWAM",
                "name": "Rachel",
                "gender": "female",
                "language": "en",
                "description": "Young, Calm, Professional"
            },
            "clyde": {
                "id": "2EiwWnXFnvU5JabPnv8n",
                "name": "Clyde",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Strong, Confident"
            },
            "domi": {
                "id": "AZnzlk1XvdvUeBnXmlld",
                "name": "Domi",
                "gender": "female",
                "language": "en",
                "description": "Young, Energetic, Friendly"
            },
            "dave": {
                "id": "CYw3kZ02Hs0563khs1Fj",
                "name": "Dave",
                "gender": "male",
                "language": "en",
                "description": "Young, Natural, Conversational"
            },
            "fin": {
                "id": "D38z5RcWu1voky8WS1ja",
                "name": "Fin",
                "gender": "male",
                "language": "en",
                "description": "Old, Raspy, Sailor"
            },
            "sarah": {
                "id": "EXAVITQu4vr4xnSDxMaL",
                "name": "Sarah",
                "gender": "female",
                "language": "en",
                "description": "Young, Soft, News Reporter"
            },
            "antoni": {
                "id": "ErXwobaYiN019PkySvjV",
                "name": "Antoni",
                "gender": "male",
                "language": "en",
                "description": "Young, Well-rounded, Friendly"
            },
            "thomas": {
                "id": "GBv7mTt0atIp3Br8iCZE",
                "name": "Thomas",
                "gender": "male",
                "language": "en",
                "description": "Young, Calm, Meditative"
            },
            "charlie": {
                "id": "IKne3meq5aSn9XLyUdCD",
                "name": "Charlie",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Casual, Australian"
            },
            "emily": {
                "id": "LcfcDJNUP1GQjkzn1xUU",
                "name": "Emily",
                "gender": "female",
                "language": "en",
                "description": "Young, Calm, American"
            },
            "elli": {
                "id": "MF3mGyEYCl7XYWbV9V6O",
                "name": "Elli",
                "gender": "female",
                "language": "en",
                "description": "Young, Emotional, Storyteller"
            },
            "callum": {
                "id": "N2lVS1w4EtoT3dr4eOWO",
                "name": "Callum",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Intense, Video Game"
            },
            "patrick": {
                "id": "ODq5zmih8GrVes37Dizd",
                "name": "Patrick",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Shouty, Video Game"
            },
            "harry": {
                "id": "SOYHLrjzK2X1ezoPC6cr",
                "name": "Harry",
                "gender": "male",
                "language": "en",
                "description": "Young, Anxious, Video Game"
            },
            "liam": {
                "id": "TX3LPaxmHKxFdv7VOQHJ",
                "name": "Liam",
                "gender": "male",
                "language": "en",
                "description": "Young, Articulate, News Reporter"
            },
            "dorothy": {
                "id": "ThT5KcBeYPX3keUQqHPh",
                "name": "Dorothy",
                "gender": "female",
                "language": "en",
                "description": "Young, Pleasant, British"
            },
            "josh": {
                "id": "TxGEqnHWrfWFTfGW9XjX",
                "name": "Josh",
                "gender": "male",
                "language": "en",
                "description": "Young, Deep, Narration"
            },
            "arnold": {
                "id": "VR6AewLTigWG4xSOukaG",
                "name": "Arnold",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Crisp, Narration"
            },
            "charlotte": {
                "id": "XB0fDUnXU5powFXDhCwa",
                "name": "Charlotte",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Seductive, Swedish"
            },
            "alice": {
                "id": "Xb7hH8MSUJpSbSDYk0k2",
                "name": "Alice",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Confident, British"
            },
            "matilda": {
                "id": "XrExE9yKIg1WjnnlVkGX",
                "name": "Matilda",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Warm, American"
            },
            "james": {
                "id": "ZQe5CZNOzWyzPSCn5a3c",
                "name": "James",
                "gender": "male",
                "language": "en",
                "description": "Old, Calm, News"
            },
            "joseph": {
                "id": "Zlb1dXrM653N07WRdFW3",
                "name": "Joseph",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Ground Reporter"
            },
            "jeremy": {
                "id": "bVMeCyTHy58xNoL34h3p",
                "name": "Jeremy",
                "gender": "male",
                "language": "en",
                "description": "Young, Excited, Narration"
            },
            "michael": {
                "id": "flq6f7yk4E4fJM5XTYuZ",
                "name": "Michael",
                "gender": "male",
                "language": "en",
                "description": "Old, Audiobook"
            },
            "ethan": {
                "id": "g5CIjZEefAph4nQFvHAz",
                "name": "Ethan",
                "gender": "male",
                "language": "en",
                "description": "Young, Narration, ASMR"
            },
            "chris": {
                "id": "iP95p4xoKVk53GoZ742B",
                "name": "Chris",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Casual, American"
            },
            "gigi": {
                "id": "jBpfuIE2acCO8z3wKNLl",
                "name": "Gigi",
                "gender": "female",
                "language": "en",
                "description": "Young, Childlish, Animation"
            },
            "freya": {
                "id": "jsCqWAovK2LkecY7zXl4",
                "name": "Freya",
                "gender": "female",
                "language": "en",
                "description": "Young, Overhyped, Video Game"
            },
            "brian": {
                "id": "nPczCjzI2devNBz1zQrb",
                "name": "Brian",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Narration"
            },
            "grace": {
                "id": "oWAxZDx7w5VEj9dCyTzz",
                "name": "Grace",
                "gender": "female",
                "language": "en",
                "description": "Young, Southern, Audiobook"
            },
            "daniel": {
                "id": "onwK4e9ZLuTAKqWW03F9",
                "name": "Daniel",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Deep, Authoritative"
            },
            "lily": {
                "id": "pFZP5JQG7iQjIQuC4Bku",
                "name": "Lily",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Raspy, British"
            },
            "serena": {
                "id": "pMsXgVXv3BLzUgSXRplE",
                "name": "Serena",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Pleasant, Interactive"
            },
            "adam": {
                "id": "pNInz6obpgDQGcFmaJgB",
                "name": "Adam",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Deep, Narration"
            },
            "nicole": {
                "id": "piTKgcLEGmPE4e6mEKli",
                "name": "Nicole",
                "gender": "female",
                "language": "en",
                "description": "Young, Whispering, Audiobook"
            },
            "bill": {
                "id": "pqHfZKP75CvOlQylNhV4",
                "name": "Bill",
                "gender": "male",
                "language": "en",
                "description": "Old, Strong, Narration"
            },
            "jessie": {
                "id": "t0jbNlBVZ17f02VDIeMI",
                "name": "Jessie",
                "gender": "male",
                "language": "en",
                "description": "Old, Raspy, Video Game"
            },
            "sam": {
                "id": "yoZ06aMxZJJ28mfd3POQ",
                "name": "Sam",
                "gender": "male",
                "language": "en",
                "description": "Young, Raspy, Dynamic"
            },
            "glinda": {
                "id": "z9fAnlkpzviPz146aGWa",
                "name": "Glinda",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Witch, Video Game"
            },
            "giovanni": {
                "id": "zcAOhNBS3c14rBihAFp1",
                "name": "Giovanni",
                "gender": "male",
                "language": "en",
                "description": "Young, Foreigner, English"
            },
            "mimi": {
                "id": "zrHiDhphv9ZnVXBqCLjz",
                "name": "Mimi",
                "gender": "female",
                "language": "en",
                "description": "Young, Childish, Animation"
            },
            # Additional Premium Voices
            "bella": {
                "id": "EXAVITQu4vr4xnSDxMaL",
                "name": "Bella",
                "gender": "female",
                "language": "en",
                "description": "Young, Expressive, Narrator"
            },
            "drew": {
                "id": "29vD33N1CtxCmqQRPOHJ",
                "name": "Drew",
                "gender": "male",
                "language": "en",
                "description": "Young, Well-rounded, News"
            },
            "paul": {
                "id": "5Q0t7uMcjvnagumLfvZi",
                "name": "Paul",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Narration, Smooth"
            },
            "jessica": {
                "id": "cgSgspJ2msm6clMCkdW9",
                "name": "Jessica",
                "gender": "female",
                "language": "en",
                "description": "Young, Expressive, American"
            },
            "roger": {
                "id": "CwhRBWXzGAHq8TQ4Fs17",
                "name": "Roger",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Confident, Narration"
            },
            "george": {
                "id": "JBFqnCBsd6RMkjVDRZzb",
                "name": "George",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Warm, Raspy"
            },
            "laura": {
                "id": "FGY2WhTYpPnrIDTdsKH5",
                "name": "Laura",
                "gender": "female",
                "language": "en",
                "description": "Young, Upbeat, Social Media"
            },
            "natasha": {
                "id": "GKB6Nm8YlJL0gBKnmJbG",
                "name": "Natasha",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Smooth, Conversational"
            },
            "marcus": {
                "id": "pqHfZKP75CvOlQylNhV4",
                "name": "Marcus",
                "gender": "male",
                "language": "en",
                "description": "Young, Dynamic, Energetic"
            },
            "stella": {
                "id": "NY8kYZlg7DlpAJ4svcfD",
                "name": "Stella",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Confident, British"
            },
            "ryan": {
                "id": "wViXBPUzp2ZZixB1xQuM",
                "name": "Ryan",
                "gender": "male",
                "language": "en",
                "description": "Young, Smooth, Calm"
            },
            "victoria": {
                "id": "9BWtsMINqrJLrRacOk9x",
                "name": "Victoria",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Elegant, British"
            },
            "kevin": {
                "id": "ZF6FPAbjXT4488VcRRnw",
                "name": "Kevin",
                "gender": "male",
                "language": "en",
                "description": "Young, Casual, Friendly"
            },
            "sophia": {
                "id": "Hzt3ZQjkHhRlCLCsQCGd",
                "name": "Sophia",
                "gender": "female",
                "language": "en",
                "description": "Young, Gentle, Warm"
            },
            "marcus_v2": {
                "id": "G2fEbVPkYYZHLQ6FBr8N",
                "name": "Marcus V2",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Professional, Deep"
            },
            "olivia": {
                "id": "Hc4UMcV2hQ8tUj7N8qWD",
                "name": "Olivia",
                "gender": "female",
                "language": "en",
                "description": "Young, Bright, Cheerful"
            },
            "peter": {
                "id": "fNBpKpqjHWL8bPxPqv3Z",
                "name": "Peter",
                "gender": "male",
                "language": "en",
                "description": "Old, Wise, Narrator"
            },
            "luna": {
                "id": "NLp5VQvDcLQzQ8RMjLyW",
                "name": "Luna",
                "gender": "female",
                "language": "en",
                "description": "Young, Soft, Dreamy"
            },
            "jackson": {
                "id": "cBTj5nnvBM7JQ4FZxWVK",
                "name": "Jackson",
                "gender": "male",
                "language": "en",
                "description": "Young, Cool, Urban"
            },
            "maya": {
                "id": "MvCKXQMRhQzVLYFtc7px",
                "name": "Maya",
                "gender": "female",
                "language": "en",
                "description": "Young, Vibrant, Indian Accent"
            },
            "oliver": {
                "id": "BN8KDTDzjXLHqgFvZZMQ",
                "name": "Oliver",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Authoritative, British"
            },
            "aria": {
                "id": "YwxkQJLLR3KqDxVgMw5P",
                "name": "Aria",
                "gender": "female",
                "language": "en",
                "description": "Young, Melodic, Singer"
            },
            "nathan": {
                "id": "Kn5FLqWPhqCqzXvMR8PL",
                "name": "Nathan",
                "gender": "male",
                "language": "en",
                "description": "Young, Tech, Startup"
            },
            "isabella": {
                "id": "VWqCYvZMbQ9XkjL3pN7R",
                "name": "Isabella",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Sophisticated, Italian Accent"
            },
            "connor": {
                "id": "PLjKWYqXhN5RzVpMcT8W",
                "name": "Connor",
                "gender": "male",
                "language": "en",
                "description": "Young, Irish Accent, Charming"
            },
            "zoe": {
                "id": "XrQNJkVLpM8YzWbKcH9T",
                "name": "Zoe",
                "gender": "female",
                "language": "en",
                "description": "Young, Bubbly, Australian"
            },
            "lucas": {
                "id": "NpYKMvLzQj9XrWbVcP8H",
                "name": "Lucas",
                "gender": "male",
                "language": "en",
                "description": "Young, Casual, Brazilian Accent"
            },
            "amelia": {
                "id": "QzYKWxLrNj8PvMbVcT9H",
                "name": "Amelia",
                "gender": "female",
                "language": "en",
                "description": "Middle-aged, Professional, Canadian"
            },
            "ethan_v2": {
                "id": "RxYKPzLwNj9QvWbMcT8H",
                "name": "Ethan V2",
                "gender": "male",
                "language": "en",
                "description": "Young, Smooth, Modern"
            },
            "harper": {
                "id": "SzYKQxMwPk0RvXbNcU9I",
                "name": "Harper",
                "gender": "female",
                "language": "en",
                "description": "Young, Fresh, Contemporary"
            },
            "mason": {
                "id": "TzYKRxNwQk1SvYbOcV0J",
                "name": "Mason",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Strong, Texan"
            },
            "evelyn": {
                "id": "UzYKSxOwRk2TvZbPcW1K",
                "name": "Evelyn",
                "gender": "female",
                "language": "en",
                "description": "Old, Elegant, Southern Belle"
            },
            "sebastian": {
                "id": "VzYKTxPwSk3UvAbQcX2L",
                "name": "Sebastian",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Refined, French Accent"
            },
            "scarlett": {
                "id": "WzYKUxQwTk4VvBbRcY3M",
                "name": "Scarlett",
                "gender": "female",
                "language": "en",
                "description": "Young, Bold, Confident"
            },
            "benjamin": {
                "id": "XzYKVxRwUk5WvCbScZ4N",
                "name": "Benjamin",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Intelligent, Professor"
            },
            "penelope": {
                "id": "YzYKWxSwVk6XvDbTcA5O",
                "name": "Penelope",
                "gender": "female",
                "language": "en",
                "description": "Young, Sweet, Girl Next Door"
            },
            "alexander": {
                "id": "ZzYKXxTwWk7YvEbUcB6P",
                "name": "Alexander",
                "gender": "male",
                "language": "en",
                "description": "Old, Distinguished, Narrator"
            },
            "mia": {
                "id": "AzYKYxUwXk8ZvFbVcC7Q",
                "name": "Mia",
                "gender": "female",
                "language": "en",
                "description": "Young, Energetic, Fitness"
            },
            "henry": {
                "id": "BzYKZxVwYk9AvGbWcD8R",
                "name": "Henry",
                "gender": "male",
                "language": "en",
                "description": "Middle-aged, Trustworthy, News Anchor"
            },
            "abigail": {
                "id": "CzYKAxWwZk0BvHbXcE9S",
                "name": "Abigail",
                "gender": "female",
                "language": "en",
                "description": "Young, Articulate, Podcaster"
            }
        }
        
        # Default voice
        self.voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel - default
        
        # Initialize Gemini model
        self.model = genai.GenerativeModel(
            'gemini-2.0-flash-exp',
            generation_config={
                'temperature': 0.7,
                'top_p': 0.9,
                'top_k': 40,
                'max_output_tokens': 2048,
            }
        )
        
        # System context for Restaurant & Products
        self.system_context = self._build_system_context()
        self.chat = None
        
    def _build_system_context(self) -> str:
        """Build specialized knowledge for Restaurant & Products"""
        return """Vous êtes un assistant vocal intelligent spécialisé en restaurants écologiques et produits locaux.

**DOMAINE D'EXPERTISE:**
1. **Restaurants & Restaurants Écologiques**
2. **Produits Locaux & Produits Locaux Bio**

**STRUCTURE DE DONNÉES:**

**Restaurant:**
- Propriétés: nom, situeDans (destination), capaciteMax
- Relation: sert (liste de produits locaux)
- Type spécialisé: RestaurantEco (restaurants écologiques)

**ProduitLocal:**
- Propriétés: nom, saison, bio (boolean)
- Type spécialisé: ProduitLocalBio (produits biologiques certifiés)

**Destination:**
- Propriétés: nom, pays, climat
- Types: Ville, Region

**REQUÊTES SPARQL DISPONIBLES:**

RÈGLE CRITIQUE: Toutes les requêtes doivent retourner SELECT ?s ?p ?o pour compatibilité avec le frontend!

Pour Restaurants:
```sparql
PREFIX ns: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o
WHERE {
    ?s a ns:Restaurant .
    ?s ?p ?o .
}
```

Pour Produits:
```sparql
PREFIX ns: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o
WHERE {
    ?s a ns:ProduitLocal .
    ?s ?p ?o .
}
```

Pour Restaurants Bio:
```sparql
PREFIX ns: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o
WHERE {
    ?s a ns:RestaurantEco .
    ?s ?p ?o .
}
```

Pour Produits Bio:
```sparql
PREFIX ns: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o
WHERE {
    ?produit a ns:ProduitLocal .
    ?produit ns:bio true .
    ?s ?p ?o .
    FILTER(?s = ?produit)
}
```

Pour Produits par Saison:
```sparql
PREFIX ns: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o
WHERE {
    ?produit a ns:ProduitLocal .
    ?produit ns:saison "{saison}" .
    ?s ?p ?o .
    FILTER(?s = ?produit)
}
```

Pour Restaurants et leurs Produits:
```sparql
PREFIX ns: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o
WHERE {
    ?s a ns:Restaurant .
    ?s ?p ?o .
}
```

Pour Rechercher un Restaurant par Nom (IMPORTANT):
```sparql
PREFIX ns: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o
WHERE {
    ?restaurant a ns:Restaurant .
    ?restaurant ns:nom ?nom .
    FILTER(CONTAINS(LCASE(?nom), LCASE("{nom_recherche}"))) .
    ?s ?p ?o .
    FILTER(?s = ?restaurant)
}
```

Pour Rechercher un Restaurant par Localisation/Destination (IMPORTANT):
```sparql
PREFIX ns: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o
WHERE {
    ?destination a ns:Destination .
    ?destination ns:nom ?nomDest .
    FILTER(CONTAINS(LCASE(?nomDest), LCASE("{nom_destination}"))) .
    ?restaurant a ns:Restaurant .
    ?restaurant ns:situeDans ?destination .
    ?s ?p ?o .
    FILTER(?s = ?restaurant)
}
```

Pour Rechercher un Restaurant par Produit Servi (IMPORTANT):
```sparql
PREFIX ns: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o
WHERE {
    ?produit a ns:ProduitLocal .
    ?produit ns:nom ?nomProduit .
    FILTER(CONTAINS(LCASE(?nomProduit), LCASE("{nom_produit}"))) .
    ?restaurant a ns:Restaurant .
    ?restaurant ns:sert ?produit .
    ?s ?p ?o .
    FILTER(?s = ?restaurant)
}
```

IMPORTANT: Pour les recherches, utilisez toujours le format SELECT ?s ?p ?o pour retourner TOUS les triplets du restaurant trouvé!

**INSTRUCTIONS DE RÉPONSE:**

1. Écoutez la question de l'utilisateur
2. Identifiez l'intention (restaurants, produits, bio, saison, etc.)
3. Générez la requête SPARQL appropriée
4. Exécutez la requête
5. Fournissez DEUX types de réponses:
   
   a) **Réponse Vocale (avec explications):**
      - Contexte et introduction
      - Explication des résultats
      - Recommandations
      - Ton conversationnel et naturel
   
   b) **Réponse Textuelle (données brutes):**
      - Liste structurée des résultats
      - Format JSON ou tableau
      - Données précises sans fioritures

**EXEMPLES DE QUESTIONS:**
- "Quels sont les restaurants disponibles?"
- "Montre-moi les produits bio"
- "Quels produits sont de saison en été?"
- "Liste les restaurants écologiques"
- "Quel restaurant sert des produits locaux?"
- "Trouve-moi le restaurant avec le nom esprit" → Recherche par NOM
- "Restaurant qui s'appelle Mat3am" → Recherche par NOM
- "Cherche restaurant nom blad" → Recherche par NOM
- "donnez moi un restaurant nom esprit" → Recherche par NOM
- "donnez le restaurant from tozeur" → Recherche par LOCALISATION
- "restaurants à Tunis" → Recherche par LOCALISATION
- "restaurant situé à Tabarka" → Recherche par LOCALISATION
- "restaurants qui servent huile d'olive" → Recherche par PRODUIT
- "restaurant avec produit bio" → Recherche par PRODUIT

**RÈGLES IMPORTANTES:**
1. TOUJOURS utiliser le format SELECT ?s ?p ?o (jamais SELECT ?restaurant ?nom)
2. Quand l'utilisateur cherche par nom, TOUJOURS utiliser FILTER avec CONTAINS sur le nom
3. Quand l'utilisateur cherche par ville/localisation (Tunis, Tabarka, Tozeur, etc.), utiliser la requête de recherche par destination
4. Quand l'utilisateur cherche par produit servi, utiliser la requête de recherche par produit
5. Utiliser LCASE pour rendre la recherche insensible à la casse
6. TOUJOURS générer une requête SPARQL même si le nom/ville semble incomplet
7. Ne JAMAIS dire "je ne peux pas filtrer" ou "je ne peux pas interpréter" - toujours générer une requête
8. Le format ?s ?p ?o est OBLIGATOIRE pour que les résultats s'affichent correctement

**NAMESPACE:** http://example.org/eco-tourism#

Répondez toujours en français, soyez précis et utile!
"""

    def initialize_chat(self):
        """Initialize chat session"""
        self.chat = self.model.start_chat(history=[])
        response = self.chat.send_message(self.system_context)
        return response

    def process_voice_query(self, user_query: str) -> Dict[str, Any]:
        """
        Process user query and return dual responses:
        1. Voice response with explanation
        2. Textual response with data
        """
        if not self.chat:
            self.initialize_chat()
        
        # Check if this is a name search query
        name_keywords = ['nom', 'name', 'appelle', 'appelé', 'nommé', 'restaurant avec']
        user_query_lower = user_query.lower()
        is_name_search = any(keyword in user_query_lower for keyword in name_keywords)
        
        # Enhanced prompt for dual responses
        enhanced_query = f"""Question utilisateur: "{user_query}"

IMPORTANT: Vous devez répondre en deux parties distinctes:

1. VOCAL_RESPONSE (pour la synthèse vocale):
   - Réponse naturelle et explicative
   - Contexte et détails
   - Ton conversationnel
   - Commencez par "VOCAL:"

2. DATA_RESPONSE (pour l'affichage textuel):
   - Données structurées
   - Format JSON ou liste
   - Informations précises
   - Commencez par "DATA:"

Si une requête SPARQL est nécessaire, incluez-la dans un bloc SPARQL:
SPARQL:
```sparql
[votre requête ici]
```

{"ATTENTION: Cette question concerne la recherche d'un restaurant par nom. Vous DEVEZ utiliser FILTER avec CONTAINS dans votre requête SPARQL. Exemple: FILTER(CONTAINS(LCASE(?nom), LCASE('terme_recherche')))" if is_name_search else ""}

Exemple de format:
VOCAL: Bonjour! J'ai trouvé 3 restaurants écologiques pour vous. Ces restaurants sont spécialisés dans la cuisine locale et durable...

DATA:
{{
  "restaurants": [
    {{"nom": "Restaurant Bio", "type": "RestaurantEco"}},
    {{"nom": "Le Local", "type": "Restaurant"}}
  ]
}}

SPARQL:
```sparql
SELECT ?r ?nom WHERE {{ ?r a ns:RestaurantEco . ?r ns:nom ?nom }}
```
"""
        
        try:
            response = self.chat.send_message(enhanced_query)
            response_text = response.text
            
            print(f"\n=== AI RESPONSE ===\n{response_text}\n==================\n")
            
            # Parse the response
            parsed = self._parse_dual_response(response_text)
            
            print(f"\n=== PARSED SPARQL ===\n{parsed['sparql_query']}\n====================\n")
            
            # Execute SPARQL if present
            if parsed['sparql_query']:
                try:
                    print(f"Executing SPARQL query...")
                    data = self.sparql_manager.execute_query(parsed['sparql_query'])
                    print(f"SPARQL Results: {data}")
                    parsed['sparql_results'] = data
                except Exception as e:
                    print(f"SPARQL Error: {str(e)}")
                    parsed['sparql_error'] = str(e)
            
            # Generate voice audio
            voice_audio = self._generate_voice(parsed['vocal_response'])
            parsed['voice_audio'] = voice_audio
            
            return {
                "success": True,
                "vocal_response": parsed['vocal_response'],
                "data_response": parsed['data_response'],
                "sparql_query": parsed['sparql_query'],
                "sparql_results": parsed.get('sparql_results'),
                "voice_audio": parsed['voice_audio'],
                "full_response": response_text
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "vocal_response": f"Désolé, une erreur s'est produite: {str(e)}",
                "data_response": {"error": str(e)}
            }

    def _parse_dual_response(self, response_text: str) -> Dict[str, Any]:
        """Parse vocal and data responses from AI output"""
        result = {
            'vocal_response': '',
            'data_response': '',
            'sparql_query': None
        }
        
        # Extract VOCAL response
        if 'VOCAL:' in response_text:
            vocal_start = response_text.index('VOCAL:') + 6
            vocal_end = response_text.index('DATA:') if 'DATA:' in response_text else len(response_text)
            result['vocal_response'] = response_text[vocal_start:vocal_end].strip()
        
        # Extract DATA response
        if 'DATA:' in response_text:
            data_start = response_text.index('DATA:') + 5
            data_end = response_text.index('SPARQL:') if 'SPARQL:' in response_text else len(response_text)
            result['data_response'] = response_text[data_start:data_end].strip()
        
        # Extract SPARQL query
        if 'SPARQL:' in response_text and '```sparql' in response_text:
            sparql_start = response_text.index('```sparql') + 9
            sparql_end = response_text.index('```', sparql_start)
            result['sparql_query'] = response_text[sparql_start:sparql_end].strip()
        
        # Fallback if parsing fails
        if not result['vocal_response']:
            result['vocal_response'] = response_text
        
        return result

    def _generate_voice(self, text: str) -> str:
        """Generate voice audio from text using ElevenLabs"""
        try:
            # Generate audio using ElevenLabs
            audio_generator = self.elevenlabs.text_to_speech.convert(
                voice_id=self.voice_id,
                text=text,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128"
            )
            
            # Collect audio bytes
            audio_bytes = b""
            for chunk in audio_generator:
                if chunk:
                    audio_bytes += chunk
            
            # Convert to base64 for easy transmission
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            return audio_base64
            
        except Exception as e:
            print(f"Error generating voice with ElevenLabs: {e}")
            # Fallback to gTTS
            try:
                tts = gTTS(text=text, lang='fr', slow=False)
                audio_buffer = io.BytesIO()
                tts.write_to_fp(audio_buffer)
                audio_buffer.seek(0)
                audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')
                return audio_base64
            except Exception as e2:
                print(f"Error with gTTS fallback: {e2}")
                return None
    
    def speech_to_text(self, audio_file) -> Dict[str, Any]:
        """Convert speech to text using ElevenLabs"""
        try:
            # Read audio file
            audio_bytes = audio_file.read()
            
            # Use ElevenLabs speech-to-text
            result = self.elevenlabs.speech_to_text.convert(
                audio=audio_bytes,
                model_id="eleven_multilingual_v2"
            )
            
            return {
                "success": True,
                "text": result.get("text", ""),
                "language": result.get("language", "fr")
            }
            
        except Exception as e:
            print(f"Error with speech-to-text: {e}")
            return {
                "success": False,
                "error": str(e),
                "text": ""
            }

    def get_restaurants(self) -> Dict[str, Any]:
        """Get all restaurants with dual response"""
        query = """
        PREFIX ns: <http://example.org/eco-tourism#>
        SELECT ?restaurant ?nom ?destination
        WHERE {
            ?restaurant a ns:Restaurant .
            ?restaurant ns:nom ?nom .
            OPTIONAL { ?restaurant ns:situeDans ?destination }
        }
        """
        return self._execute_and_respond(
            query, 
            "Voici la liste complète des restaurants disponibles dans notre base de données écotourisme."
        )

    def get_eco_restaurants(self) -> Dict[str, Any]:
        """Get ecological restaurants"""
        query = """
        PREFIX ns: <http://example.org/eco-tourism#>
        SELECT ?restaurant ?nom
        WHERE {
            ?restaurant a ns:RestaurantEco .
            ?restaurant ns:nom ?nom .
        }
        """
        return self._execute_and_respond(
            query,
            "Voici nos restaurants écologiques certifiés qui s'engagent pour un tourisme durable."
        )

    def get_local_products(self) -> Dict[str, Any]:
        """Get all local products"""
        query = """
        PREFIX ns: <http://example.org/eco-tourism#>
        SELECT ?produit ?nom ?saison ?bio
        WHERE {
            ?produit a ns:ProduitLocal .
            ?produit ns:nom ?nom .
            OPTIONAL { ?produit ns:saison ?saison }
            OPTIONAL { ?produit ns:bio ?bio }
        }
        """
        return self._execute_and_respond(
            query,
            "Découvrez notre sélection de produits locaux frais et de saison."
        )

    def get_bio_products(self) -> Dict[str, Any]:
        """Get organic products"""
        query = """
        PREFIX ns: <http://example.org/eco-tourism#>
        SELECT ?produit ?nom ?saison
        WHERE {
            ?produit a ns:ProduitLocalBio .
            ?produit ns:nom ?nom .
            ?produit ns:bio true .
            OPTIONAL { ?produit ns:saison ?saison }
        }
        """
        return self._execute_and_respond(
            query,
            "Voici nos produits biologiques certifiés, cultivés dans le respect de l'environnement."
        )

    def get_products_by_season(self, season: str) -> Dict[str, Any]:
        """Get products by season"""
        query = f"""
        PREFIX ns: <http://example.org/eco-tourism#>
        SELECT ?produit ?nom ?bio
        WHERE {{
            ?produit a ns:ProduitLocal .
            ?produit ns:nom ?nom .
            ?produit ns:saison "{season}" .
            OPTIONAL {{ ?produit ns:bio ?bio }}
        }}
        """
        return self._execute_and_respond(
            query,
            f"Voici les produits de saison disponibles pour {season}."
        )

    def get_restaurant_products(self, restaurant_name: str = None) -> Dict[str, Any]:
        """Get restaurants and their products"""
        if restaurant_name:
            query = f"""
            PREFIX ns: <http://example.org/eco-tourism#>
            SELECT ?restaurant ?nomRestaurant ?produit ?nomProduit
            WHERE {{
                ?restaurant a ns:Restaurant .
                ?restaurant ns:nom ?nomRestaurant .
                ?restaurant ns:sert ?produit .
                ?produit ns:nom ?nomProduit .
                FILTER(CONTAINS(LCASE(?nomRestaurant), LCASE("{restaurant_name}")))
            }}
            """
            intro = f"Voici les produits servis au restaurant {restaurant_name}."
        else:
            query = """
            PREFIX ns: <http://example.org/eco-tourism#>
            SELECT ?restaurant ?nomRestaurant ?produit ?nomProduit
            WHERE {
                ?restaurant a ns:Restaurant .
                ?restaurant ns:nom ?nomRestaurant .
                ?restaurant ns:sert ?produit .
                ?produit ns:nom ?nomProduit .
            }
            """
            intro = "Voici la liste des restaurants et les produits qu'ils servent."
        
        return self._execute_and_respond(query, intro)

    def _execute_and_respond(self, sparql_query: str, vocal_intro: str) -> Dict[str, Any]:
        """Execute SPARQL and create dual responses"""
        try:
            # Execute query
            results = self.sparql_manager.execute_query(sparql_query)
            
            # Create vocal response
            vocal_response = f"{vocal_intro} J'ai trouvé {len(results)} résultat(s) pour votre recherche."
            
            # Generate voice
            voice_audio = self._generate_voice(vocal_response)
            
            return {
                "success": True,
                "vocal_response": vocal_response,
                "data_response": results,
                "sparql_query": sparql_query,
                "voice_audio": voice_audio
            }
            
        except Exception as e:
            error_msg = f"Désolé, une erreur s'est produite lors de l'exécution de la requête: {str(e)}"
            return {
                "success": False,
                "error": str(e),
                "vocal_response": error_msg,
                "data_response": {"error": str(e)}
            }

    def reset_chat(self):
        """Reset chat session"""
        self.chat = None
        return {"status": "Chat reset successfully"}
    
    def get_available_voices(self) -> Dict[str, Any]:
        """Get list of available voices"""
        return {
            "success": True,
            "voices": self.available_voices,
            "current_voice": self.voice_id
        }
    
    def set_voice(self, voice_key: str) -> Dict[str, Any]:
        """Set the voice for text-to-speech"""
        if voice_key in self.available_voices:
            self.voice_id = self.available_voices[voice_key]["id"]
            return {
                "success": True,
                "message": f"Voice changed to {self.available_voices[voice_key]['name']}",
                "voice": self.available_voices[voice_key]
            }
        else:
            return {
                "success": False,
                "error": f"Voice '{voice_key}' not found. Available voices: {list(self.available_voices.keys())}"
            }
    
    def get_current_voice(self) -> Dict[str, Any]:
        """Get currently selected voice"""
        for key, voice in self.available_voices.items():
            if voice["id"] == self.voice_id:
                return {
                    "success": True,
                    "voice_key": key,
                    "voice": voice
                }
        return {
            "success": False,
            "error": "Current voice not found"
        }


