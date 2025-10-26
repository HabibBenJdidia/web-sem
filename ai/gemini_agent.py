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
    - Properties: nom, type (Bus/Train/Velo/Autre)
    - emission_co2_per_km (decimal)

13. **EcoTransport** (extends Transport)
    - Zero or low emission vehicles

14. **TransportNonMotorise** (extends Transport)
    - Non-motorized (bikes, walking)

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

**EXAMPLE QUERIES:**
- "Show tourists" → GET /touriste or SPARQL SELECT
- "Create a guide" → POST /guide with JSON
- "Eco hotels" → GET /search/eco-hebergements
- "Activities in zone X" → SPARQL with estDansZone filter

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
        Returns conversational response
        """
        result = self.process_message(question)
        
        if result['type'] == 'conversation':
            return result['response']
        elif result['type'] == 'action':
            return f"{result['explanation']}\n\nResult: {json.dumps(result['result'], indent=2)}"
        else:
            return f"Error: {result.get('error', 'Unknown error')}"
    
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

