import google.generativeai as genai
import os
import json
from typing import Dict, Any, List

class GeminiAgent:
    """
    Intelligent AI Agent using Google Gemini
    Trained on eco-tourism ontology and SPARQL operations
    """
    
    def __init__(self, sparql_manager, api_key=None):
        self.sparql_manager = sparql_manager
        api_key = api_key or os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=api_key)
        
        # Initialize Gemini model - Using latest gemini-2.5-flash
        self.model = genai.GenerativeModel(
            'gemini-2.5-flash',
            generation_config={
                'temperature': 0.7,
                'top_p': 0.8,
                'top_k': 40,
                'max_output_tokens': 2048,
            }
        )
        
        # System knowledge about the eco-tourism system
        self.system_context = self._build_system_context()
        self.chat = None
        
    def _build_system_context(self) -> str:
        """Build comprehensive system knowledge for the AI"""
        return """You are an intelligent eco-tourism assistant with COMPLETE access to a semantic RDF/OWL knowledge base.

**COMPLETE ONTOLOGY STRUCTURE:**

**BASE CLASSES:**
1. **User** (Base class)
   - Properties: nom (string), age (integer), nationalite (string)
   
2. **Destination** (Base class)
   - Properties: nom (string), pays (string), climat (string)

**SPECIALIZED USER CLASSES:**
3. **Touriste** (extends User)
   - Additional: sejourne_dans (URI to Hebergement)
   - participe_a (array of URIs to Activite)
   - se_deplace_par (array of URIs to Transport)

4. **Guide** (extends User)
   - Additional: organise (array of URIs to Activite)
   - organise_evenement (array of URIs to Evenement)

**DESTINATION CLASSES:**
5. **Ville** (extends Destination)
   - Same as Destination parent

6. **Region** (extends Destination)
   - Same as Destination parent

**ACCOMMODATION CLASSES:**
7. **Hebergement** (Accommodation)
   - Properties: nom, type, prix (decimal), nb_chambres (integer)
   - niveau_eco (string: Bronze/Silver/Gold/Platinum)
   - situe_dans (URI to Destination)
   - utilise_energie (URI to EnergieRenouvelable)
   - a_certification (URI to CertificationEco)

8. **Hotel** (extends Hebergement)
   - Additional specialized properties

9. **MaisonHote** (Guest House, extends Hebergement)
   - Additional specialized properties

**ACTIVITY CLASSES:**
10. **Activite** (Activity)
    - Properties: nom, difficulte (Facile/Moyenne/Difficile)
    - duree_heures (decimal), prix (decimal)
    - est_dans_zone (URI to ZoneNaturelle)

11. **Randonnee** (Hiking, extends Activite)
    - Additional: distance_km, denivele

**TRANSPORT CLASSES:**
12. **Transport**
    - Properties: nom, type (Bus/Train/Velo/Voiture/Avion/etc.)
    - emission_co2_per_km (decimal in g/km)
    - a_empreinte (URI to EmpreinteCarbone)
    - **PRICING SYSTEM:**
      * Base price (€) - fixed cost per trip
      * Price per km (€/km) - distance-based cost
      * Carbon tax (€) - based on CO2 emissions (€0.08 per kg CO2)
      * Total price = base_price + (price_per_km × distance) + (CO2_kg × carbon_tax_rate)
      * Example prices per km:
        - Vélo/Marche: 0.00 €/km (free & zero emission)
        - Train: 0.15 €/km (eco-friendly)
        - Bus: 0.12 €/km
        - Voiture: 0.12 €/km
        - Avion: 0.80 €/km (expensive & high emission)
      * Carbon tax automatically calculated from emission_co2_per_km
      * Lower emissions = lower total price (incentivizes eco-friendly choices)

13. **EcoTransport** (extends Transport)
    - Zero or low emission vehicles
    - Lower pricing due to minimal carbon tax

14. **TransportNonMotorise** (extends Transport)
    - Non-motorized (bikes, walking)
    - Zero cost and zero emissions

**FOOD & PRODUCTS:**
15. **Restaurant**
    - Properties: nom, situe_dans (URI)
    - sert (array of URIs to ProduitLocal)

16. **RestaurantEco** (extends Restaurant)
    - Eco-certified restaurants

17. **ProduitLocal** (Local Product)
    - Properties: nom, saison (string), bio (boolean)

18. **ProduitLocalBio** (extends ProduitLocal)
    - Certified organic products

**EVENTS:**
19. **Evenement** (Event)
    - Properties: nom, event_date (date)
    - event_duree_heures (decimal), event_prix (decimal)
    - a_lieu_dans (URI to Destination)

20. **Festival** (extends Evenement)
    - Cultural/eco festivals

21. **Foire** (Fair, extends Evenement)
    - Local markets/fairs

**ENVIRONMENTAL CLASSES:**
22. **ZoneNaturelle** (Natural Zone)
    - Properties: nom, superficie_hectares
    - niveau_protection (string)

23. **CertificationEco** (Eco Certification)
    - Properties: label_nom, organisme, annee_obtention (date)

24. **EmpreinteCarbone** (Carbon Footprint)
    - Properties: valeur_kg_co2, periode

25. **EnergieRenouvelable** (Renewable Energy)
    - Properties: type_energie (Solaire/Eolienne/Hydraulique)
    - capacite_kw

**ALL AVAILABLE OPERATIONS:**

**CREATE Operations (POST endpoints):**
- POST /touriste - Create tourist
- POST /guide - Create guide
- POST /destination - Create destination
- POST /ville - Create city
- POST /hebergement - Create accommodation
- POST /activite - Create activity
- POST /transport - Create transport
- POST /restaurant - Create restaurant
- POST /produit - Create local product
- POST /certification - Create certification
- POST /evenement - Create event
- POST /zone_naturelle - Create natural zone

**READ Operations (GET endpoints):**
- GET /touriste - Get all tourists
- GET /guide - Get all guides
- GET /destination - Get all destinations
- GET /ville - Get all cities
- GET /hebergement - Get all accommodations
- GET /activite - Get all activities
- GET /transport - Get all transports
- GET /restaurant - Get all restaurants
- GET /produit - Get all products
- GET /certification - Get all certifications
- GET /evenement - Get all events
- GET /<entity>/<uri> - Get specific entity by URI

**UPDATE Operations (PUT endpoints):**
- PUT /<entity>/<uri> - Update entity properties

**DELETE Operations (DELETE endpoints):**
- DELETE /<entity>/<uri> - Delete entity

**ADVANCED SEARCH Functions:**
- POST /search - Generic search with filters
- GET /search/name/<name> - Search by name (any entity)
- GET /search/eco-hebergements - Eco-friendly accommodations
- GET /search/bio-products - Organic products
- GET /search/zero-emission-transport - Zero emission vehicles
- GET /search/activities/<difficulty> - Activities by difficulty
- GET /search/events?start=<date>&end=<date> - Events by date range

**SPARQL DIRECT ACCESS:**
- You can execute ANY SPARQL query on the RDF triplestore
- Namespace: http://example.org/eco-tourism#
- All properties use camelCase (e.g., sejourneDans, participeA)

**OBJECT PROPERTIES (Relationships):**
- sejourneDans: Tourist → Accommodation
- participeA: Tourist → Activity
- seDeplacePar: Tourist → Transport
- organise: Guide → Activity
- organiseEvenement: Guide → Event
- situeDans: Accommodation/Restaurant → Destination
- estDansZone: Activity → Natural Zone
- utiliseEnergie: Accommodation → Renewable Energy
- aCertification: Any entity → Certification
- sert: Restaurant → Local Product
- aLieuDans: Event → Destination

**DATA PROPERTIES (Attributes):**
- Strings: nom, type, difficulte, saison, nationalite, pays, climat
- Integers: age, nb_chambres
- Decimals: prix, duree_heures, emission_co2_per_km, superficie_hectares
- Booleans: bio
- Dates: event_date, annee_obtention

**RESPONSE GUIDELINES:**
1. When user asks about data, use GET /search or SPARQL
2. When user wants to create, provide POST endpoint with JSON
3. Always use correct property names (camelCase in SPARQL, snake_case in JSON)
4. For relationships, use full URIs (e.g., "http://example.org/eco-tourism#Hebergement_EcoLodge")
5. Promote eco-friendly options and sustainability
6. Respond in French or English based on user's language
7. **IMPORTANT**: When executing SPARQL queries, always respond with natural conversational text in French, NOT raw JSON
8. If no results found, suggest alternatives or explain why (e.g., "Aucun transport trouvé avec exactement 0.12g/km, mais il y a des transports avec 0.03g/km")
9. For numeric comparisons (CO2 emissions), consider using >= or <= instead of exact matches
10. Always format responses in a user-friendly, conversational manner
11. **PRICING EXPLANATIONS**: When asked about transport prices:
    - Always explain the 3 components: base price + distance cost + carbon tax
    - Show the calculation step by step
    - Emphasize that lower CO2 = lower price (eco-friendly = economical)
    - Compare with alternatives when relevant
    - Recommend greener options to save money
    - Example: "Le train coûte €17.74 pour 100km (€2.50 base + €15.00 distance + €0.24 taxe carbone). C'est bien moins cher que l'avion à €130.64 grâce à ses faibles émissions!"

**EXAMPLE QUERIES:**
- "Show tourists" → GET /touriste or SPARQL SELECT
- "Create a guide" → POST /guide with JSON
- "Eco hotels" → GET /search/eco-hebergements
- "Activities in zone X" → SPARQL with estDansZone filter
- "Transport with 0.12 CO2" → SPARQL: SELECT ?nom WHERE { ?t a eco:Transport . ?t eco:nom ?nom . ?t eco:emissionCO2PerKm "0.12"^^xsd:decimal }
- "Calculate price for Train 100km" → Explain: Train costs €2.50 base + €15.00 for 100km + €0.24 carbon tax = €17.74 total
- "Compare prices between Train and Avion" → Show price breakdown for both, recommend cheaper/greener option
- "Why is Avion more expensive than Train?" → Explain: Higher CO2 emissions (8000g vs 30g) lead to higher carbon tax + higher base price
- "Cheapest transport to travel 50km?" → Calculate and compare prices, recommend Vélo (€0) or Train (€10)

**IMPORTANT SPARQL NOTES:**
- Property name for CO2 emission in SPARQL: `emissionCO2PerKm` (camelCase)
- Always use xsd:decimal for numeric values: "0.12"^^xsd:decimal
- Decimal values must be strings with type annotation in SPARQL

You have COMPLETE knowledge of the entire system. Use it wisely!
"""

    def initialize_chat(self):
        """Initialize a new chat session with context"""
        self.chat = self.model.start_chat(history=[])
        # Send system context as first message
        response = self.chat.send_message(self.system_context)
        return response
    
    def process_message(self, user_message: str) -> Dict[str, Any]:
        """
        Process user message and determine if it requires function calling
        """
        if not self.chat:
            self.initialize_chat()
        
        # Enhance message with function calling instructions
        enhanced_message = f"""{user_message}

If this requires database operations, respond with a JSON in this format:
{{
    "action": "execute_sparql|create_entity|search|get_all|get_by_uri",
    "entity_type": "Touriste|Guide|Destination|etc",
    "parameters": {{...}},
    "explanation": "What you're doing"
}}

Otherwise, respond naturally in conversational format."""
        
        try:
            response = self.chat.send_message(enhanced_message)
            response_text = response.text
            
            # Check if response contains executable action
            if self._is_action_response(response_text):
                action_result = self._execute_action(response_text)
                return {
                    "type": "action",
                    "explanation": response_text,
                    "result": action_result
                }
            else:
                return {
                    "type": "conversation",
                    "response": response_text
                }
                
        except Exception as e:
            return {
                "type": "error",
                "error": str(e)
            }
    
    def _is_action_response(self, text: str) -> bool:
        """Check if response contains an executable action"""
        try:
            # Try to find JSON in response
            if '{' in text and '}' in text:
                start = text.index('{')
                end = text.rindex('}') + 1
                json_str = text[start:end]
                data = json.loads(json_str)
                return 'action' in data
        except:
            pass
        return False
    
    def _execute_action(self, response_text: str) -> Any:
        """Execute the action specified in the response"""
        try:
            # Extract JSON from response
            start = response_text.index('{')
            end = response_text.rindex('}') + 1
            json_str = response_text[start:end]
            action_data = json.loads(json_str)
            
            action = action_data.get('action')
            entity_type = action_data.get('entity_type')
            params = action_data.get('parameters', {})
            
            if action == 'execute_sparql':
                return self._execute_sparql_query(params.get('query'))
            elif action == 'get_all':
                return self.sparql_manager.get_all(entity_type)
            elif action == 'search':
                return self._execute_search(params)
            elif action == 'get_by_uri':
                return self.sparql_manager.get_by_uri(params.get('uri'))
            else:
                return {"info": "Action identified but not executed automatically for safety"}
                
        except Exception as e:
            return {"error": f"Failed to execute action: {str(e)}"}
    
    def _execute_sparql_query(self, query: str) -> Any:
        """Execute a SPARQL query"""
        try:
            return self.sparql_manager.execute_query(query)
        except Exception as e:
            return {"error": str(e)}
    
    def _execute_search(self, params: Dict) -> Any:
        """Execute a search operation"""
        search_type = params.get('type')
        
        if search_type == 'by_name':
            return self.sparql_manager.search_by_name(params.get('name'))
        elif search_type == 'eco_hebergements':
            return self.sparql_manager.search_eco_hebergements()
        elif search_type == 'bio_products':
            return self.sparql_manager.search_bio_products()
        elif search_type == 'zero_emission':
            return self.sparql_manager.search_zero_emission_transport()
        elif search_type == 'activities_by_difficulty':
            return self.sparql_manager.search_activities_by_difficulty(params.get('difficulty'))
        else:
            return self.sparql_manager.search(
                params.get('class_name'),
                params.get('filters', {})
            )
    
    def ask(self, question: str) -> str:
        """
        Simple question-answer interface
        Returns conversational response in French - NEVER returns JSON
        Uses REAL database data with AI-powered dynamic responses
        """
        # For transport-related questions, get real data first, then let AI format it
        question_lower = question.lower()
        transport_keywords = ['transport', 'vélo', 'train', 'bus', 'voiture', 'emission', 
                             'co2', 'écologique', 'type', 'disponible', 'hyhy', 'eaaeae']
        
        # Check if question is about transports
        if any(keyword in question_lower for keyword in transport_keywords):
            # Step 1: Get REAL data from database
            real_data = self._fetch_real_transport_data()
            
            # Step 2: Let AI format the response dynamically based on real data
            return self._generate_dynamic_response(question, real_data)
        
        # For non-transport questions, use AI with strict rules
        conversational_prompt = f"""Tu es un assistant transport écologique parlant français.
        
Question de l'utilisateur: {question}

RÈGLES IMPORTANTES:
1. Réponds UNIQUEMENT en texte conversationnel français naturel
2. N'utilise JAMAIS de format JSON dans ta réponse
3. N'utilise JAMAIS de blocs de code ou de syntaxe technique
4. N'INVENTE PAS de données - utilise uniquement ce qui est dans la base de données
5. Présente les résultats de façon claire, simple et conversationnelle

Réponds maintenant de manière CONVERSATIONNELLE UNIQUEMENT (pas de JSON, pas de code):"""

        if not self.chat:
            self.initialize_chat()
        
        try:
            response = self.chat.send_message(conversational_prompt)
            response_text = response.text.strip()
            
            # Remove any JSON blocks from the response
            if '{' in response_text and '}' in response_text:
                lines = response_text.split('\n')
                clean_lines = []
                in_json_block = False
                
                for line in lines:
                    if line.strip().startswith('{') or line.strip().startswith('}') or \
                       '"action"' in line or '"parameters"' in line or '"explanation"' in line:
                        in_json_block = True
                        continue
                    if in_json_block and line.strip().startswith('}'):
                        in_json_block = False
                        continue
                    if not in_json_block:
                        clean_lines.append(line)
                
                cleaned_response = '\n'.join(clean_lines).strip()
                
                if cleaned_response and len(cleaned_response) >= 20:
                    return cleaned_response
            
            return response_text
            
        except Exception as e:
            return "Je suis désolé, j'ai rencontré une difficulté technique. Pouvez-vous reformuler votre question ?"
    
    def _fetch_real_transport_data(self) -> list:
        """
        Fetch real transport data from database WITH empreinte carbone
        Returns list of transport dictionaries with empreinte data
        """
        try:
            query = """
            PREFIX eco: <http://example.org/eco-tourism#>
            SELECT ?nom ?type ?emission ?empreinteURI ?valeurCO2kg WHERE {
                ?transport a eco:Transport .
                ?transport eco:nom ?nom .
                OPTIONAL { ?transport eco:type ?type . }
                OPTIONAL { ?transport eco:emissionCO2PerKm ?emission . }
                OPTIONAL { 
                    ?transport eco:aEmpreinte ?empreinteURI .
                    ?empreinteURI eco:valeurCO2kg ?valeurCO2kg .
                }
            }
            """
            
            results = self.sparql_manager.execute_query(query)
            
            transports = []
            for result in results:
                valeur_co2_kg = result.get('valeurCO2kg', {}).get('value')
                
                # Calculate empreinte category
                empreinte_category = "Non spécifié"
                if valeur_co2_kg is not None:
                    val = float(valeur_co2_kg)
                    if val == 0:
                        empreinte_category = "Zéro émission"
                    elif val <= 1.0:
                        empreinte_category = "Faible"
                    elif val <= 5.0:
                        empreinte_category = "Moyenne"
                    else:
                        empreinte_category = "Élevée"
                
                transport = {
                    'nom': result.get('nom', {}).get('value', 'N/A'),
                    'type': result.get('type', {}).get('value', 'N/A'),
                    'emission': result.get('emission', {}).get('value', 'N/A'),
                    'empreinte_uri': result.get('empreinteURI', {}).get('value'),
                    'empreinte_valeur_kg': valeur_co2_kg if valeur_co2_kg else 'N/A',
                    'empreinte_category': empreinte_category
                }
                transports.append(transport)
            
            return transports
        except Exception as e:
            print(f"Error fetching transport data: {str(e)}")
            return []
    
    def _generate_dynamic_response(self, question: str, real_data: list) -> str:
        """
        Use AI to generate dynamic conversational response based on real data
        """
        if not real_data:
            return "Je n'ai trouvé aucun transport dans notre base de données pour le moment."
        
        # Prepare data summary for AI with empreinte data
        data_summary = "Données RÉELLES des transports dans la base:\n\n"
        for i, t in enumerate(real_data, 1):
            empreinte_info = ""
            if t.get('empreinte_valeur_kg') and t['empreinte_valeur_kg'] != 'N/A':
                empreinte_info = f", Empreinte Carbone: {t['empreinte_valeur_kg']} kg CO₂ (Catégorie: {t['empreinte_category']})"
            data_summary += f"{i}. Nom: {t['nom']}, Type: {t['type']}, Émission CO₂: {t['emission']} g/km{empreinte_info}\n"
        
        # Create AI prompt with real data
        ai_prompt = f"""Tu es un assistant transport écologique intelligent.

DONNÉES RÉELLES DE LA BASE DE DONNÉES (NE PAS INVENTER D'AUTRES DONNÉES):
{data_summary}

QUESTION DE L'UTILISATEUR:
{question}

INSTRUCTIONS STRICTES:
1. Utilise UNIQUEMENT les données ci-dessus (noms: {', '.join([t['nom'] for t in real_data])})
2. N'INVENTE AUCUN autre transport qui n'est pas dans la liste
3. Réponds de manière conversationnelle, dynamique et naturelle en français
4. Adapte ta réponse à la question spécifique posée
5. Si la question porte sur un transport spécifique, donne ses détails complets (émission ET empreinte carbone)
6. Si la question demande une liste, liste tous les transports réels avec leur catégorie d'empreinte
7. Si la question demande le plus écologique, compare les émissions ET les empreintes carbone
8. Utilise des emojis appropriés: 🌿 pour zéro émission, ✅ pour faible, ⚠️ pour moyenne, 🚗 pour élevée
9. Utilise du formatage Markdown pour rendre la réponse agréable et structurée
10. Sois concis mais informatif, mentionne TOUJOURS l'empreinte carbone quand disponible
11. N'utilise JAMAIS de format JSON ou code dans ta réponse

Réponds maintenant de manière CONVERSATIONNELLE et DYNAMIQUE:"""

        if not self.chat:
            self.initialize_chat()
        
        try:
            response = self.chat.send_message(ai_prompt)
            response_text = response.text.strip()
            
            # Clean any JSON if present
            if '{' in response_text and '}' in response_text:
                lines = response_text.split('\n')
                clean_lines = []
                skip_json = False
                
                for line in lines:
                    if '{' in line or '"action"' in line or '"parameters"' in line:
                        skip_json = True
                    if not skip_json:
                        clean_lines.append(line)
                    if '}' in line:
                        skip_json = False
                
                cleaned = '\n'.join(clean_lines).strip()
                if cleaned and len(cleaned) >= 20:
                    return cleaned
            
            return response_text
            
        except Exception as e:
            # Fallback to static response if AI fails
            return self._get_transport_info_directly(question)
    
    def _get_transport_info_directly(self, question: str) -> str:
        """
        Get transport info directly from database - REAL DATA ONLY with empreinte carbone
        """
        try:
            # Use the shared fetch method
            transports = self._fetch_real_transport_data()
            
            if not transports:
                return "Aucun transport n'est actuellement enregistré dans notre base de données."
            
            # Analyze the question
            question_lower = question.lower()
            
            # Check if asking about a specific transport by name
            for transport in transports:
                if transport['nom'].lower() in question_lower:
                    empreinte_text = ""
                    if transport.get('empreinte_valeur_kg') and transport['empreinte_valeur_kg'] != 'N/A':
                        empreinte_text = f" Son empreinte carbone est de **{transport['empreinte_valeur_kg']} kg CO₂** (catégorie: {transport['empreinte_category']})."
                    return f"Le transport **{transport['nom']}** est de type **{transport['type']}** avec des émissions de **{transport['emission']} g CO₂/km**.{empreinte_text}"
            
            # List all transports if asking for types or list
            if 'type' in question_lower or 'disponible' in question_lower or 'quels' in question_lower or 'liste' in question_lower:
                response = "Voici tous les transports actuellement disponibles dans notre base de données:\n\n"
                
                for i, t in enumerate(transports, 1):
                    emoji = "🌿" if t['empreinte_category'] == "Zéro émission" else "✅" if t['empreinte_category'] == "Faible" else "⚠️" if t['empreinte_category'] == "Moyenne" else "🚗"
                    emission_str = f"{t['emission']} g CO₂/km" if t['emission'] != 'N/A' else 'N/A'
                    empreinte_str = f" (Empreinte: {t['empreinte_category']})" if t.get('empreinte_category') else ""
                    response += f"{emoji} {i}. **{t['nom']}** (Type: {t['type']}) - Émissions: {emission_str}{empreinte_str}\n"
                
                response += "\nSouhaitez-vous plus de détails sur l'un de ces transports ?"
                return response
            
            # Looking for most ecological (based on empreinte)
            elif 'écologique' in question_lower or 'meilleur' in question_lower or 'plus' in question_lower or 'empreinte' in question_lower:
                # Sort by empreinte value in kg
                sorted_transports = sorted(
                    [t for t in transports if t['empreinte_valeur_kg'] != 'N/A'],
                    key=lambda x: float(x['empreinte_valeur_kg'])
                )
                
                if sorted_transports:
                    best = sorted_transports[0]
                    response = f"Le transport le plus écologique dans notre base est **{best['nom']}** "
                    response += f"(Type: {best['type']}) avec une empreinte carbone de **{best['empreinte_valeur_kg']} kg CO₂** "
                    response += f"(catégorie: {best['empreinte_category']}).\n\n"
                    response += "Voici le classement des transports par empreinte carbone:\n\n"
                    
                    for i, t in enumerate(sorted_transports, 1):
                        emoji = "🌿" if t['empreinte_category'] == "Zéro émission" else "✅" if t['empreinte_category'] == "Faible" else "⚠️" if t['empreinte_category'] == "Moyenne" else "🚗"
                        response += f"{emoji} {i}. **{t['nom']}** - {t['empreinte_valeur_kg']} kg CO₂ ({t['empreinte_category']})\n"
                    
                    return response
                else:
                    return "Je n'ai pas pu comparer les empreintes pour le moment."
            
            # Compare emissions/empreintes
            elif 'co2' in question_lower or 'emission' in question_lower or 'compare' in question_lower:
                response = "Comparaison des empreintes carbone des transports:\n\n"
                
                for t in sorted(transports, key=lambda x: float(x['empreinte_valeur_kg']) if x['empreinte_valeur_kg'] != 'N/A' else 999):
                    if t['empreinte_valeur_kg'] != 'N/A':
                        emoji = "🌿" if t['empreinte_category'] == "Zéro émission" else "✅" if t['empreinte_category'] == "Faible" else "⚠️" if t['empreinte_category'] == "Moyenne" else "🚗"
                        response += f"{emoji} **{t['nom']}** ({t['type']}) - {t['empreinte_valeur_kg']} kg CO₂ ({t['empreinte_category']})\n"
                
                return response
            
            # Default: provide general info
            else:
                return f"J'ai trouvé {len(transports)} transport(s) dans notre système. Posez-moi des questions sur:\n• Les types de transport disponibles\n• Le transport le plus écologique\n• Les émissions et empreintes carbone\n• Un transport spécifique (par son nom)"
                
        except Exception as e:
            return f"Je suis désolé, j'ai rencontré une difficulté technique: {str(e)}"
    
    def execute_sparql(self, query: str) -> Dict[str, Any]:
        """
        Direct SPARQL execution with AI explanation
        """
        try:
            results = self.sparql_manager.execute_query(query)
            
            # Ask AI to explain the results
            explanation_prompt = f"""I executed this SPARQL query:
{query}

Results: {json.dumps(results, indent=2)}

Please explain what this query does and summarize the results in a user-friendly way."""
            
            explanation = self.process_message(explanation_prompt)
            
            return {
                "query": query,
                "results": results,
                "explanation": explanation.get('response', 'Query executed successfully')
            }
        except Exception as e:
            return {
                "error": str(e),
                "query": query
            }
    
    def suggest_activities(self, tourist_profile: Dict) -> Dict[str, Any]:
        """
        AI-powered activity recommendations based on tourist profile
        """
        prompt = f"""Based on this tourist profile:
{json.dumps(tourist_profile, indent=2)}

Suggest the best eco-friendly activities. Consider:
- Age and difficulty level
- Eco-consciousness
- Location preferences
- Budget (prix)

Provide specific activity suggestions from our database."""
        
        return self.process_message(prompt)
    
    def calculate_eco_score(self, entity_type: str, entity_uri: str) -> Dict[str, Any]:
        """
        Calculate eco-friendliness score using AI analysis
        """
        # Get entity data
        entity_data = self.sparql_manager.get_by_uri(entity_uri)
        
        prompt = f"""Analyze the eco-friendliness of this {entity_type}:
{json.dumps(entity_data, indent=2)}

Provide:
1. Eco-score (0-100)
2. Strengths (eco-friendly aspects)
3. Areas for improvement
4. Recommendations"""
        
        return self.process_message(prompt)
    
    def reset_chat(self):
        """Reset chat session"""
        self.chat = None
        return {"status": "Chat reset successfully"}

