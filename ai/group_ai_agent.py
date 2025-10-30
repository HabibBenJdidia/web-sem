import google.generativeai as genai
import os
from typing import Dict, Any, List

class GroupAIAgent:
    """
    GroupAI - Universal Eco-Tourism Chatbot
    Can search across ALL entities using SPARQL
    """
    
    def __init__(self, sparql_manager, api_key=None):
        self.sparql_manager = sparql_manager
        api_key = api_key or os.getenv('GROUPAI_API_KEY', 'AIzaSyD20FVZADQgMxt_2GHuJWMeNaYgnqS2_aw')
        genai.configure(api_key=api_key)
        
        self.model = genai.GenerativeModel(
            'gemini-2.0-flash-exp',
            generation_config={
                'temperature': 0.7,
                'top_p': 0.9,
                'top_k': 40,
                'max_output_tokens': 3000,
            }
        )
        
        self.system_context = self._build_system_context()
        self.chat = None
        
    def _build_system_context(self) -> str:
        return """Tu es GroupAI, un assistant intelligent pour l'écotourisme.

**EXEMPLES DE REQUÊTES SPARQL (APPRENDS DE CES PATTERNS):**

1. **Chercher tous les transports:**
```sparql
SELECT DISTINCT ?nom ?type ?emission WHERE {
    ?t a eco:Transport .
    ?t eco:nom ?nom .
    OPTIONAL { ?t eco:type ?type . }
    OPTIONAL { ?t eco:emissionCO2PerKm ?emission . }
}
```

2. **Chercher transports par émission CO2:**
```sparql
SELECT ?nom ?emission WHERE {
    ?t a eco:Transport .
    ?t eco:nom ?nom .
    ?t eco:emissionCO2PerKm ?emission .
    FILTER(?emission = 10.0)
}
```

3. **Chercher restaurants par ville:**
```sparql
SELECT ?nom ?ville WHERE {
    ?r a eco:Restaurant .
    ?r eco:nom ?nom .
    ?r eco:situeDans ?d .
    ?d eco:nom ?ville .
    FILTER(?ville = "Bizerte")
}
```

4. **Chercher hébergements écologiques:**
```sparql
SELECT ?nom ?niveau WHERE {
    ?h a eco:Hebergement .
    ?h eco:nom ?nom .
    ?h eco:niveauEco ?niveau .
}
```

5. **Chercher activités par difficulté:**
```sparql
SELECT ?nom ?difficulte WHERE {
    ?a a eco:Activite .
    ?a eco:nom ?nom .
    ?a eco:difficulte ?difficulte .
    FILTER(?difficulte = "Facile")
}
```

6. **Chercher produits bio:**
```sparql
SELECT ?nom ?saison WHERE {
    ?p a eco:ProduitLocal .
    ?p eco:nom ?nom .
    ?p eco:bio true .
    OPTIONAL { ?p eco:saison ?saison . }
}
```

**PROPRIÉTÉS IMPORTANTES:**
- Transport: nom, type, emissionCO2PerKm (en g/km, stocké comme float)
- Restaurant: nom, situeDans (URI vers Destination)
- Hebergement: nom, type, prix, niveauEco
- Activite: nom, difficulte (Facile/Moyenne/Difficile)
- ProduitLocal: nom, saison, bio (boolean)
- Destination: nom, pays, climat

**INSTRUCTIONS CRITIQUES:**
1. NE MONTRE JAMAIS le code SPARQL à l'utilisateur
2. Réponds UNIQUEMENT en français conversationnel
3. Liste TOUS les résultats trouvés (pas "... et X autres")
4. Utilise DISTINCT dans les requêtes pour éviter les doublons
5. Pour les émissions CO2: stockées en g/km comme float (ex: 10.0, 0.0, 1200.0)
6. Utilise du formatage Markdown (**, *, listes)
7. Sois précis sur le nombre exact de résultats
"""

    def initialize_chat(self):
        """Initialize chat with context"""
        self.chat = self.model.start_chat(history=[])
        self.chat.send_message(self.system_context)
        return {"status": "Chat initialized"}
    
    def chat_message(self, user_message: str) -> str:
        """
        Main chat interface - returns conversational French response
        Automatically executes queries and returns formatted results
        """
        if not self.chat:
            self.initialize_chat()
        
        # Analyze question and fetch real data
        query_lower = user_message.lower()
        real_data = None
        entity_type = None
        
        # Detect entity type and fetch data
        if any(word in query_lower for word in ['destination', 'ville', 'region', 'pays']):
            real_data = self._fetch_destinations()
            entity_type = "destinations"
        elif any(word in query_lower for word in ['hébergement', 'hebergement', 'hotel', 'maison']):
            real_data = self._fetch_hebergements()
            entity_type = "hébergements"
        elif any(word in query_lower for word in ['restaurant', 'manger', 'cuisine']):
            real_data = self._fetch_restaurants()
            entity_type = "restaurants"
        elif any(word in query_lower for word in ['produit', 'product', 'local', 'bio']):
            real_data = self._fetch_produits()
            entity_type = "produits"
        elif any(word in query_lower for word in ['transport', 'déplacement', 'vélo', 'train', 'bus']):
            real_data = self._fetch_transports()
            entity_type = "transports"
        elif any(word in query_lower for word in ['événement', 'evenement', 'festival', 'foire']):
            real_data = self._fetch_evenements()
            entity_type = "événements"
        elif any(word in query_lower for word in ['certification', 'label', 'certifié']):
            real_data = self._fetch_certifications()
            entity_type = "certifications"
        elif any(word in query_lower for word in ['activité', 'activite', 'activity', 'randonnée', 'randonnee', 'difficulté', 'difficulte', 'difficulty']):
            real_data = self._fetch_activites()
            entity_type = "activités"
        elif any(word in query_lower for word in ['zone', 'naturelle', 'parc', 'réserve']):
            real_data = self._fetch_zones()
            entity_type = "zones naturelles"
        elif any(word in query_lower for word in ['empreinte', 'carbone', 'co2', 'émission']):
            real_data = self._fetch_empreintes()
            entity_type = "empreintes carbone"
        elif any(word in query_lower for word in ['énergie', 'energie', 'energy', 'renouvelable', 'renewable', 'solaire', 'solar', 'éolien', 'hydraulique', 'hydraulic']):
            real_data = self._fetch_energies()
            entity_type = "énergies renouvelables"
        elif any(word in query_lower for word in ['touriste', 'guide', 'utilisateur', 'user']):
            real_data = self._fetch_users()
            entity_type = "utilisateurs"
        
        # Filter data based on location or other criteria
        if real_data and entity_type:
            # Check for location filters
            for city in ['bizerte', 'tunis', 'sousse', 'sfax', 'paris', 'lyon']:
                if city in query_lower:
                    real_data = self._filter_by_location(real_data, city.capitalize())
                    break
            
            # Check for difficulty filters (for activities)
            if entity_type == "activités":
                for difficulty in ['facile', 'moyenne', 'difficile', 'easy', 'medium', 'hard']:
                    if difficulty in query_lower:
                        # Map English to French
                        difficulty_map = {'easy': 'Facile', 'medium': 'Moyenne', 'hard': 'Difficile'}
                        filter_value = difficulty_map.get(difficulty, difficulty.capitalize())
                        real_data = self._filter_by_difficulty(real_data, filter_value)
                        break
            
            # Check for name filter (for all entities)
            if 'name' in query_lower or 'nom' in query_lower:
                # Extract potential name from query
                words = user_message.split()
                for i, word in enumerate(words):
                    if word.lower() in ['name', 'nom', 'appelé', 'appelée', 'nommé', 'nommée']:
                        if i + 1 < len(words):
                            search_name = words[i + 1].strip('.,!?')
                            real_data = self._filter_by_name(real_data, search_name)
                            break
            
            # Check for season filter (for products)
            if entity_type == "produits":
                for season in ['printemps', 'été', 'ete', 'automne', 'hiver', 'spring', 'summer', 'autumn', 'fall', 'winter']:
                    if season in query_lower:
                        # Map English to French
                        season_map = {
                            'spring': 'Printemps',
                            'summer': 'Été',
                            'autumn': 'Automne',
                            'fall': 'Automne',
                            'winter': 'Hiver'
                        }
                        filter_value = season_map.get(season, season.capitalize())
                        real_data = self._filter_by_season(real_data, filter_value)
                        break
            
            # Check for energy type filter (for energies)
            if entity_type == "énergies renouvelables":
                for energy_type in ['solaire', 'solar', 'éolien', 'éolienne', 'wind', 'hydraulique', 'hydraulic', 'hydro']:
                    if energy_type in query_lower:
                        # Map English to French
                        energy_map = {
                            'solar': 'Solaire',
                            'wind': 'Éolienne',
                            'hydraulic': 'Hydraulique',
                            'hydro': 'Hydraulique'
                        }
                        filter_value = energy_map.get(energy_type, energy_type.capitalize())
                        real_data = self._filter_by_energy_type(real_data, filter_value)
                        break
        
        # Build prompt with real data
        if real_data:
            data_summary = self._format_data_summary(real_data)
            prompt = f"""Question: {user_message}

DONNÉES RÉELLES TROUVÉES DANS LA BASE ({len(real_data)} résultat(s)):
{data_summary}

INSTRUCTIONS STRICTES:
1. NE MONTRE JAMAIS de code SPARQL dans ta réponse
2. Réponds UNIQUEMENT en français conversationnel naturel
3. Liste TOUS les résultats trouvés (il y en a exactement {len(real_data)})
4. Utilise du formatage Markdown (**, *, listes à puces)
5. Pour chaque résultat, montre le nom et les détails importants
6. NE DIS PAS "... et X autres résultats" - liste-les TOUS
7. Sois clair, structuré et complet

Réponds maintenant:"""
        else:
            prompt = f"""Question: {user_message}

Aucune donnée trouvée pour cette recherche.

Réponds en français conversationnel. Suggère des alternatives ou explique pourquoi aucun résultat n'a été trouvé."""
        
        try:
            response = self.chat.send_message(prompt)
            text = response.text.strip()
            
            # Remove any SPARQL code blocks from response
            if '```sparql' in text.lower() or 'select' in text.lower():
                lines = text.split('\n')
                clean_lines = []
                skip = False
                for line in lines:
                    if '```' in line or 'SELECT' in line or 'PREFIX' in line or 'WHERE' in line:
                        skip = True
                        continue
                    if not skip and 'sparql' not in line.lower():
                        clean_lines.append(line)
                text = '\n'.join(clean_lines).strip()
            
            return text if text else "Désolé, je n'ai pas pu traiter votre demande."
        except Exception as e:
            return f"Désolé, j'ai rencontré une erreur: {str(e)}"
    
    def _filter_by_location(self, data: List[Dict], location: str) -> List[Dict]:
        """Filter data by location"""
        filtered = []
        for item in data:
            # Check if any value contains the location
            for key, val in item.items():
                if isinstance(val, str) and location.lower() in val.lower():
                    filtered.append(item)
                    break
        return filtered if filtered else data
    
    def _filter_by_difficulty(self, data: List[Dict], difficulty: str) -> List[Dict]:
        """Filter activities by difficulty"""
        filtered = []
        for item in data:
            if 'difficulte' in item and item['difficulte']:
                if item['difficulte'].lower() == difficulty.lower():
                    filtered.append(item)
        return filtered if filtered else data
    
    def _filter_by_name(self, data: List[Dict], name: str) -> List[Dict]:
        """Filter entities by name (partial match)"""
        filtered = []
        for item in data:
            if 'nom' in item and item['nom']:
                if name.lower() in item['nom'].lower():
                    filtered.append(item)
        return filtered if filtered else data
    
    def _filter_by_season(self, data: List[Dict], season: str) -> List[Dict]:
        """Filter products by season"""
        filtered = []
        for item in data:
            if 'saison' in item and item['saison']:
                # Handle both single season and multi-season (e.g., "Automne-Hiver")
                if season.lower() in item['saison'].lower():
                    filtered.append(item)
        return filtered if filtered else data
    
    def _filter_by_energy_type(self, data: List[Dict], energy_type: str) -> List[Dict]:
        """Filter energies by type"""
        filtered = []
        for item in data:
            if 'type' in item and item['type']:
                if energy_type.lower() in item['type'].lower():
                    filtered.append(item)
        return filtered if filtered else data
    
    def _deduplicate_by_uri(self, data: List[Dict]) -> List[Dict]:
        """Remove duplicates based on URI"""
        seen = set()
        unique_results = []
        for item in data:
            uri = item.get('uri', '')
            if uri and uri not in seen:
                seen.add(uri)
                unique_results.append(item)
            elif not uri:
                # If no URI, keep the item (shouldn't happen but safe)
                unique_results.append(item)
        return unique_results
    
    def _fetch_destinations(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?pays ?climat WHERE {
            ?uri a eco:Destination .
            ?uri eco:nom ?nom .
            OPTIONAL { ?uri eco:pays ?pays . }
            OPTIONAL { ?uri eco:climat ?climat . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_hebergements(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?type ?prix ?niveau WHERE {
            ?uri a eco:Hebergement .
            ?uri eco:nom ?nom .
            OPTIONAL { ?uri eco:type ?type . }
            OPTIONAL { ?uri eco:prix ?prix . }
            OPTIONAL { ?uri eco:niveauEco ?niveau . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_restaurants(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?type ?ville WHERE {
            ?uri a eco:Restaurant .
            ?uri eco:nom ?nom .
            OPTIONAL { ?uri eco:type ?type . }
            OPTIONAL { 
                ?uri eco:situeDans ?dest .
                ?dest eco:nom ?ville .
            }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_produits(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?saison ?bio WHERE {
            ?uri a eco:ProduitLocal .
            ?uri eco:nom ?nom .
            OPTIONAL { ?uri eco:saison ?saison . }
            OPTIONAL { ?uri eco:bio ?bio . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_transports(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?type ?emission WHERE {
            ?uri a eco:Transport .
            ?uri eco:nom ?nom .
            OPTIONAL { ?uri eco:type ?type . }
            OPTIONAL { ?uri eco:emissionCO2PerKm ?emission . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_evenements(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?date ?prix WHERE {
            ?uri a eco:Evenement .
            ?uri eco:nom ?nom .
            OPTIONAL { ?uri eco:eventDate ?date . }
            OPTIONAL { ?uri eco:eventPrix ?prix . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_certifications(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?organisme ?annee WHERE {
            ?uri a eco:CertificationEco .
            OPTIONAL { ?uri eco:labelNom ?nom . }
            OPTIONAL { ?uri eco:nom ?nom . }
            OPTIONAL { ?uri eco:organisme ?organisme . }
            OPTIONAL { ?uri eco:organismecertificateur ?organisme . }
            OPTIONAL { ?uri eco:anneeObtention ?annee . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_activites(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?difficulte ?duree ?prix WHERE {
            ?uri a eco:Activite .
            ?uri eco:nom ?nom .
            OPTIONAL { ?uri eco:difficulte ?difficulte . }
            OPTIONAL { ?uri eco:dureeHeures ?duree . }
            OPTIONAL { ?uri eco:prix ?prix . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_zones(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?superficie ?protection WHERE {
            ?uri a eco:ZoneNaturelle .
            ?uri eco:nom ?nom .
            OPTIONAL { ?uri eco:superficieHectares ?superficie . }
            OPTIONAL { ?uri eco:niveauProtection ?protection . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_empreintes(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?valeur ?periode WHERE {
            ?uri a eco:EmpreinteCarbone .
            OPTIONAL { ?uri eco:valeurCO2kg ?valeur . }
            OPTIONAL { ?uri eco:periode ?periode . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_energies(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?type ?capacite WHERE {
            ?uri a eco:EnergieRenouvelable .
            OPTIONAL { ?uri eco:nom ?nom . }
            OPTIONAL { ?uri eco:typeEnergie ?type . }
            OPTIONAL { ?uri eco:capaciteKw ?capacite . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _fetch_users(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?nom ?age ?nationalite WHERE {
            { ?uri a eco:Touriste . } UNION { ?uri a eco:Guide . }
            ?uri eco:nom ?nom .
            OPTIONAL { ?uri eco:age ?age . }
            OPTIONAL { ?uri eco:nationalite ?nationalite . }
        }
        """
        return self._deduplicate_by_uri(self._execute_and_parse(query))
    
    def _execute_and_parse(self, query: str) -> List[Dict]:
        try:
            results = self.sparql_manager.execute_query(query)
            parsed = []
            for r in results:
                item = {}
                for key, val in r.items():
                    if isinstance(val, dict) and 'value' in val:
                        item[key] = val['value']
                    else:
                        item[key] = val
                parsed.append(item)
            return parsed
        except Exception as e:
            print(f"Error executing query: {e}")
            return []
    
    def _format_data_summary(self, data: List[Dict]) -> str:
        if not data:
            return "Aucune donnée trouvée."
        
        summary = f"Nombre total: {len(data)}\n\n"
        
        # Show all items if 20 or less, otherwise show first 15
        display_count = min(len(data), 20)
        for i, item in enumerate(data[:display_count], 1):
            summary += f"{i}. "
            for key, val in item.items():
                if key != 'uri' and val:
                    summary += f"{key}: {val}, "
            summary = summary.rstrip(', ') + "\n"
        
        if len(data) > 20:
            summary += f"\n... et {len(data) - 20} autres résultats (total: {len(data)})"
        
        return summary
    
    def execute_sparql(self, query: str) -> Dict[str, Any]:
        """Execute custom SPARQL query"""
        try:
            results = self.sparql_manager.execute_query(query)
            return {
                "success": True,
                "results": results,
                "count": len(results) if isinstance(results, list) else 0
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def reset_chat(self):
        """Reset chat session"""
        self.chat = None
        return {"status": "Chat reset"}

