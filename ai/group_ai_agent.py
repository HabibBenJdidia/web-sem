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

**TU PEUX CHERCHER DANS TOUTES CES ENTITÉS:**

1. **Destination et Hébergement**
   - Destination: nom, pays, climat
   - Ville, Region (types de Destination)
   - Hebergement: nom, type, prix, nb_chambres, niveau_eco
   - Hotel, MaisonHote (types d'Hébergement)

2. **Restaurant et Produit Local**
   - Restaurant: nom, situe_dans
   - RestaurantEco (restaurants certifiés)
   - ProduitLocal: nom, saison, bio
   - ProduitLocalBio (produits bio certifiés)

3. **User et Transport**
   - User: nom, age, nationalite
   - Touriste: sejourne_dans, participe_a, se_deplace_par
   - Guide: organise, organise_evenement
   - Transport: nom, type, emission_co2_per_km
   - EcoTransport, TransportNonMotorise

4. **Evenement et CertificationEco**
   - Evenement: nom, event_date, event_duree_heures, event_prix
   - Festival, Foire (types d'Événement)
   - CertificationEco: label_nom, organisme, annee_obtention

5. **Activite et Zone Naturelle**
   - Activite: nom, difficulte, duree_heures, prix
   - Randonnee (type d'Activité)
   - ZoneNaturelle: nom, superficie_hectares, niveau_protection

6. **Empreinte Carbone et EnergieRenouvelable**
   - EmpreinteCarbone: valeur_kg_co2, periode
   - EnergieRenouvelable: type_energie, capacite_kw

**NAMESPACE SPARQL:**
PREFIX eco: <http://example.org/eco-tourism#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

**PROPRIÉTÉS IMPORTANTES:**
- Object Properties: sejourneDans, participeA, seDeplacePar, organise, situeDans, estDansZone, utiliseEnergie, aCertification, sert, aLieuDans, aEmpreinte
- Data Properties: nom, type, prix, age, nationalite, difficulte, bio, saison, emission_co2_per_km, valeur_kg_co2

**INSTRUCTIONS:**
1. Réponds TOUJOURS en français conversationnel
2. Utilise SPARQL pour chercher les données réelles
3. Ne réponds JAMAIS en JSON ou code
4. Sois précis et informatif
5. Propose des alternatives si aucun résultat
6. Mets en valeur les options écologiques
7. Utilise du formatage Markdown pour la lisibilité

**EXEMPLES DE RECHERCHES:**
- "Montre-moi les destinations" → SELECT ?nom WHERE { ?d a eco:Destination . ?d eco:nom ?nom }
- "Hébergements écologiques" → SELECT ?nom ?niveau WHERE { ?h a eco:Hebergement . ?h eco:nom ?nom . ?h eco:niveauEco ?niveau }
- "Restaurants à Paris" → SELECT ?nom WHERE { ?r a eco:Restaurant . ?r eco:nom ?nom . ?r eco:situeDans ?d . ?d eco:nom "Paris" }
- "Transports zéro émission" → SELECT ?nom WHERE { ?t a eco:Transport . ?t eco:nom ?nom . ?t eco:emissionCO2PerKm "0.0"^^xsd:float }
- "Événements en 2025" → SELECT ?nom ?date WHERE { ?e a eco:Evenement . ?e eco:nom ?nom . ?e eco:eventDate ?date . FILTER(YEAR(?date) = 2025) }
- "Activités faciles" → SELECT ?nom WHERE { ?a a eco:Activite . ?a eco:nom ?nom . ?a eco:difficulte "Facile" }
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
        elif any(word in query_lower for word in ['produit', 'local', 'bio']):
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
        elif any(word in query_lower for word in ['activité', 'activite', 'randonnée', 'randonnee']):
            real_data = self._fetch_activites()
            entity_type = "activités"
        elif any(word in query_lower for word in ['zone', 'naturelle', 'parc', 'réserve']):
            real_data = self._fetch_zones()
            entity_type = "zones naturelles"
        elif any(word in query_lower for word in ['empreinte', 'carbone', 'co2', 'émission']):
            real_data = self._fetch_empreintes()
            entity_type = "empreintes carbone"
        elif any(word in query_lower for word in ['énergie', 'energie', 'renouvelable', 'solaire', 'éolien']):
            real_data = self._fetch_energies()
            entity_type = "énergies renouvelables"
        elif any(word in query_lower for word in ['touriste', 'guide', 'utilisateur', 'user']):
            real_data = self._fetch_users()
            entity_type = "utilisateurs"
        
        # Filter data based on location if specified
        if real_data and entity_type:
            # Check for location filters
            for city in ['bizerte', 'tunis', 'sousse', 'sfax', 'paris', 'lyon']:
                if city in query_lower:
                    real_data = self._filter_by_location(real_data, city.capitalize())
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
        return self._execute_and_parse(query)
    
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
        return self._execute_and_parse(query)
    
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
        return self._execute_and_parse(query)
    
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
        return self._execute_and_parse(query)
    
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
        return self._execute_and_parse(query)
    
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
        return self._execute_and_parse(query)
    
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
        return self._execute_and_parse(query)
    
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
        return self._execute_and_parse(query)
    
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
        return self._execute_and_parse(query)
    
    def _fetch_empreintes(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?valeur ?periode WHERE {
            ?uri a eco:EmpreinteCarbone .
            OPTIONAL { ?uri eco:valeurCO2kg ?valeur . }
            OPTIONAL { ?uri eco:periode ?periode . }
        }
        """
        return self._execute_and_parse(query)
    
    def _fetch_energies(self) -> List[Dict]:
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?uri ?type ?capacite WHERE {
            ?uri a eco:EnergieRenouvelable .
            OPTIONAL { ?uri eco:typeEnergie ?type . }
            OPTIONAL { ?uri eco:capaciteKw ?capacite . }
        }
        """
        return self._execute_and_parse(query)
    
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
        return self._execute_and_parse(query)
    
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

