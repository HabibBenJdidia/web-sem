from google import genai
import os
import json
from typing import Dict, Any, List

class AISalhi:
    """
    AISalhi - Intelligent AI Agent for Eco-Tourism
    Advanced semantic search and SPARQL operations
    Powered by cutting-edge language models
    """
    
    def __init__(self, sparql_manager, api_key=None):
        self.sparql_manager = sparql_manager
        api_key = api_key or os.getenv('AISALHI_API_KEY')
        
        # Initialize client with new Google GenAI SDK
        self.client = genai.Client(api_key=api_key)
        self.model_name = 'gemini-2.5-flash'
        
        # Generation configuration
        self.generation_config = {
            'temperature': 0.7,
            'top_p': 0.8,
            'top_k': 40,
            'max_output_tokens': 2048,
        }
        
        # System knowledge about the eco-tourism system
        self.system_context = self._build_system_context()
        self.chat_history = []
        
    def _build_system_context(self) -> str:
        """Build comprehensive system knowledge for AISalhi"""
        return """You are AISalhi, an intelligent eco-tourism assistant with COMPLETE access to a semantic RDF/OWL knowledge base.

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
   - specialise_dans (string: nature, culture, adventure)

**DESTINATION CLASSES:**
5. **Ville** (extends Destination)
   - Additional: population (integer)
   - a_hotel (boolean)

6. **Region** (extends Destination)
   - Additional: superficie (float)
   - contient (array of URIs to Ville)

7. **ZoneNaturelle** (extends Destination)
   - Additional: type_zone (string: foret, montagne, mer, desert)
   - niveau_protection (string: reserve, parc_national, site_protege)

**HEBERGEMENT CLASSES:**
8. **Hebergement** (Base class)
   - Properties: nom (string), capacite (integer), prix_par_nuit (float)
   - situe_dans (URI to Ville)
   - certifie_par (URI to CertificationEco)

9. **Hotel** (extends Hebergement)
   - Additional: nombre_etoiles (integer 1-5)
   - a_piscine (boolean)
   - a_spa (boolean)

10. **MaisonHote** (extends Hebergement)
    - Additional: type_chambre (string)
    - petit_dejeuner_inclus (boolean)

**RESTAURANT CLASSES:**
11. **Restaurant** (Base class)
    - Properties: nom (string), type_cuisine (string)
    - situe_dans (URI to Ville)
    - prix_moyen (float)

12. **RestaurantEco** (extends Restaurant)
    - Additional: produits_locaux (boolean)
    - certification_bio (boolean)
    - zero_dechet (boolean)

**TRANSPORT CLASSES:**
13. **Transport** (Base class)
    - Properties: nom (string), type_transport (string)
    - capacite (integer)
    - empreinte_carbone (float kg CO2)

14. **EcoTransport** (extends Transport)
    - Additional: energie_renouvelable (boolean)
    - emission_zero (boolean)

15. **TransportNonMotorise** (extends Transport)
    - Additional: type_non_motorise (string: velo, marche, velo_electrique)

**ACTIVITE CLASSES:**
16. **Activite** (Base class)
    - Properties: nom (string), description (string)
    - duree_heures (integer)
    - niveau_difficulte (string: facile, moyen, difficile)
    - prix (float)

17. **Randonnee** (extends Activite)
    - Additional: distance_km (float)
    - denivele_m (integer)
    - type_terrain (string)

18. **Festival** (extends Activite)
    - Additional: date_debut (date), date_fin (date)
    - theme (string)

**CERTIFICATION CLASSES:**
19. **CertificationEco**
    - Properties: nom (string), organisme_certificateur (string)
    - type_certification (string)
    - date_certification (date)
    - criteres_certification (string)
    - certification_valide (boolean)

**EVENEMENT CLASSES:**
20. **Evenement**
    - Properties: nom (string), event_date (date)
    - event_duree_heures (integer)
    - event_prix (float)
    - a_lieu_dans (URI to Ville)

**PRODUIT CLASSES:**
21. **ProduitLocal**
    - Properties: nom (string), categorie (string)
    - prix (float)
    - origine (string)
    - produit_par (string)

22. **ProduitLocalBio** (extends ProduitLocal)
    - Additional: certification_bio (string)
    - sans_pesticides (boolean)

**ENERGY CLASSES:**
23. **EnergieRenouvelable**
    - Properties: type_energie (string: solaire, eolienne, hydraulique)
    - capacite_kwh (float)
    - utilise_par (URI to Hebergement or Restaurant)

24. **EmpreinteCarbone**
    - Properties: quantite_co2_kg (float)
    - source (string)
    - calculee_pour (URI to any entity)

**FOIRE CLASS:**
25. **Foire** (extends Evenement)
    - Additional: type_foire (string)
    - nombre_exposants (integer)

**KEY RELATIONSHIPS:**
- Touriste → sejourne_dans → Hebergement
- Touriste → participe_a → Activite
- Touriste → se_deplace_par → Transport
- Hebergement → situe_dans → Ville
- Hebergement → certifie_par → CertificationEco
- Restaurant → situe_dans → Ville
- Activite → se_deroule_dans → ZoneNaturelle or Ville
- Guide → organise → Activite
- EnergieRenouvelable → utilise_par → Hebergement or Restaurant

**SPARQL QUERY CAPABILITIES:**
You can query and manipulate ALL above classes and relationships.
Use PREFIX eco: <http://example.org/eco-tourism#> for all queries.

**EXAMPLE QUERIES:**

1. Find all eco-certified hotels in a city:
```sparql
PREFIX eco: <http://example.org/eco-tourism#>
SELECT ?hotel ?nom WHERE {
  ?hotel a eco:Hotel ;
         eco:nom ?nom ;
         eco:situe_dans ?ville ;
         eco:certifie_par ?cert .
  ?ville eco:nom "Tunis" .
}
```

2. Find eco-friendly activities:
```sparql
SELECT ?act ?nom ?difficulte WHERE {
  ?act a eco:Activite ;
       eco:nom ?nom ;
       eco:niveau_difficulte ?difficulte ;
       eco:prix ?prix .
  FILTER(?prix < 50)
}
```

3. Calculate carbon footprint:
```sparql
SELECT (SUM(?co2) as ?total_co2) WHERE {
  ?transport eco:empreinte_carbone ?co2 .
  ?touriste eco:se_deplace_par ?transport .
  ?touriste eco:nom "John Doe" .
}
```

**YOUR ROLE:**
- Answer questions about eco-tourism destinations, activities, accommodations
- Provide SPARQL queries when asked for data
- Suggest eco-friendly alternatives
- Calculate environmental impact
- Recommend personalized itineraries
- Explain certifications and eco-practices

**TONE:** Professional, helpful, eco-conscious, knowledgeable.
"""
    
    def ask(self, question: str) -> str:
        """
        Simple question-answer using AISalhi
        One-shot answer without chat history
        """
        try:
            prompt = f"{self.system_context}\n\nQuestion: {question}\n\nAnswer:"
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=self.generation_config
            )
            return response.text
        except Exception as e:
            return f"AISalhi Error: {str(e)}"
    
    def chat_message(self, message: str) -> str:
        """
        Interactive chat with AISalhi
        Maintains conversation history and automatically executes SPARQL queries
        """
        try:
            # Enhanced system context with instruction to return actual data
            enhanced_context = f"""{self.system_context}

**IMPORTANT INSTRUCTIONS:**
- When user asks about data (certifications, destinations, activities, etc.), YOU MUST:
  1. Generate the appropriate SPARQL query
  2. Execute it using the knowledge base
  3. Present the ACTUAL RESULTS in a clear, human-readable format
  4. DO NOT just show the SPARQL query - show the RESULTS!
  
- Format results as a clear, structured response with:
  • A brief introduction
  • The actual data found (names, details, etc.)
  • A helpful summary or next steps

- NEVER show SPARQL queries to users unless they explicitly ask "show me the query"
"""
            
            # Add system context for first message only
            if not self.chat_history:
                full_prompt = f"{enhanced_context}\n\nUser: {message}"
                
                # Generate response for first message
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=full_prompt,
                    config=self.generation_config
                )
                
                # Check if response contains SPARQL - if yes, execute it
                response_text = self._process_and_execute_sparql(response.text, message)
                
                # Ensure response_text is not None
                if response_text is None:
                    response_text = "Désolé, je n'ai pas pu générer une réponse."
                
                # Initialize history with first exchange
                self.chat_history = [
                    str(full_prompt),
                    str(response_text)
                ]
            else:
                # For subsequent messages, add to history
                self.chat_history.append(f"User: {message}")
                
                # Create conversation context - ensure all items are strings
                conversation = "\n\n".join([str(item) for item in self.chat_history if item is not None])
                
                # Generate response
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=conversation,
                    config=self.generation_config
                )
                
                # Check if response contains SPARQL - if yes, execute it
                response_text = self._process_and_execute_sparql(response.text, message)
                
                # Ensure response_text is not None
                if response_text is None:
                    response_text = "Désolé, je n'ai pas pu générer une réponse."
                
                # Add response to history
                self.chat_history.append(f"Assistant: {str(response_text)}")
            
            return response_text
        except Exception as e:
            return f"AISalhi Chat Error: {str(e)}"
    
    def _process_and_execute_sparql(self, ai_response: str, user_message: str) -> str:
        """
        Check if AI response contains SPARQL query and execute it
        Returns the AI response with actual data instead of just the query
        """
        try:
            # Handle None or empty response
            if not ai_response:
                return "Désolé, je n'ai pas pu générer une réponse."
            
            # Check if response contains SPARQL query
            if '```sparql' in ai_response.lower() or 'PREFIX eco:' in ai_response:
                # Extract SPARQL query
                sparql_query = ai_response
                if '```sparql' in sparql_query:
                    sparql_query = sparql_query.split('```sparql')[1].split('```')[0].strip()
                elif '```' in sparql_query:
                    sparql_query = sparql_query.split('```')[1].split('```')[0].strip()
                
                # Execute the query
                try:
                    results = self.sparql_manager.execute_query(sparql_query)
                    
                    if results and len(results) > 0:
                        # Format results in a human-readable way
                        formatted_response = self._format_query_results(results, user_message)
                        return formatted_response if formatted_response else "Je n'ai pas pu formater les résultats."
                    else:
                        return "Je n'ai trouvé aucun résultat correspondant à votre question dans la base de connaissances. Voulez-vous reformuler votre question ?"
                except Exception as query_error:
                    print(f"Error executing SPARQL query: {query_error}")
                    return f"Désolé, j'ai rencontré une erreur lors de l'exécution de la requête. Veuillez reformuler votre question."
            
            # If no SPARQL detected, return original response
            return ai_response
        except Exception as e:
            print(f"Error processing SPARQL in chat: {e}")
            import traceback
            traceback.print_exc()
            # Return original response if query execution fails
            return ai_response if ai_response else "Erreur lors du traitement de votre question."
    
    def _format_query_results(self, results: List[Dict], user_message: str) -> str:
        """
        Format SPARQL query results into human-readable response
        """
        try:
            if not results:
                return "Aucun résultat trouvé."
            
            # Detect what type of data was requested
            message_lower = user_message.lower()
            
            if 'certification' in message_lower:
                return self._format_certifications(results)
            elif 'destination' in message_lower or 'ville' in message_lower:
                return self._format_destinations(results)
            elif 'activité' in message_lower or 'activity' in message_lower:
                return self._format_activities(results)
            elif 'hébergement' in message_lower or 'hotel' in message_lower:
                return self._format_accommodations(results)
            elif 'restaurant' in message_lower:
                return self._format_restaurants(results)
            elif 'transport' in message_lower:
                return self._format_transports(results)
            else:
                # Generic formatting
                return self._format_generic(results)
        except Exception as e:
            return f"Erreur de formatage des résultats: {str(e)}"
    
    def _format_certifications(self, results: List[Dict]) -> str:
        """Format certification results"""
        response = f"🌿 **Certifications Écologiques Disponibles** ({len(results)} trouvée(s))\n\n"
        for i, cert in enumerate(results, 1):
            nom = cert.get('nomCertification', {}).get('value', cert.get('nom', {}).get('value', 'N/A'))
            organisme = cert.get('organisme', {}).get('value', cert.get('organisme_certificateur', {}).get('value', 'N/A'))
            type_cert = cert.get('typeCertification', {}).get('value', cert.get('type_certification', {}).get('value', 'N/A'))
            valide = cert.get('valide', {}).get('value', cert.get('certification_valide', {}).get('value', 'N/A'))
            
            response += f"{i}. **{nom}**\n"
            response += f"   • Organisme: {organisme}\n"
            response += f"   • Type: {type_cert}\n"
            response += f"   • Valide: {'✅ Oui' if valide == 'true' or valide == True else '❌ Non'}\n\n"
        
        response += "\n💡 Ces certifications garantissent des pratiques écologiques et durables dans le secteur du tourisme."
        return response
    
    def _format_generic(self, results: List[Dict]) -> str:
        """Generic formatting for any results"""
        response = f"📊 **Résultats** ({len(results)} trouvé(s))\n\n"
        for i, result in enumerate(results[:5], 1):  # Limit to 5 results
            response += f"{i}. "
            for key, value in result.items():
                if isinstance(value, dict) and 'value' in value:
                    response += f"{key}: {value['value']}, "
            response = response.rstrip(', ') + "\n"
        
        if len(results) > 5:
            response += f"\n... et {len(results) - 5} autres résultats."
        
        return response
    
    def _format_destinations(self, results: List[Dict]) -> str:
        """Format destination results"""
        response = f"🗺️ **Destinations** ({len(results)} trouvée(s))\n\n"
        for i, dest in enumerate(results[:10], 1):
            nom = dest.get('nom', {}).get('value', 'N/A')
            pays = dest.get('pays', {}).get('value', 'N/A')
            climat = dest.get('climat', {}).get('value', 'N/A')
            response += f"{i}. **{nom}** ({pays}) - Climat: {climat}\n"
        return response
    
    def _format_activities(self, results: List[Dict]) -> str:
        """Format activity results"""
        response = f"🎯 **Activités** ({len(results)} trouvée(s))\n\n"
        for i, act in enumerate(results[:10], 1):
            nom = act.get('nom', {}).get('value', 'N/A')
            difficulte = act.get('difficulte', {}).get('value', 'N/A')
            duree = act.get('duree_heures', {}).get('value', act.get('dureeHeures', {}).get('value', 'N/A'))
            prix = act.get('prix', {}).get('value', 'N/A')
            response += f"{i}. **{nom}** - Difficulté: {difficulte}, Durée: {duree}h, Prix: {prix}€\n"
        return response
    
    def _format_accommodations(self, results: List[Dict]) -> str:
        """Format accommodation results"""
        response = f"🏨 **Hébergements** ({len(results)} trouvé(s))\n\n"
        for i, acc in enumerate(results[:10], 1):
            nom = acc.get('nom', {}).get('value', 'N/A')
            type_h = acc.get('type', {}).get('value', 'N/A')
            prix = acc.get('prix', {}).get('value', 'N/A')
            response += f"{i}. **{nom}** ({type_h}) - Prix: {prix}€/nuit\n"
        return response
    
    def _format_restaurants(self, results: List[Dict]) -> str:
        """Format restaurant results"""
        response = f"🍽️ **Restaurants** ({len(results)} trouvé(s))\n\n"
        for i, rest in enumerate(results[:10], 1):
            nom = rest.get('nom', {}).get('value', 'N/A')
            response += f"{i}. **{nom}**\n"
        return response
    
    def _format_transports(self, results: List[Dict]) -> str:
        """Format transport results"""
        response = f"🚗 **Transports** ({len(results)} trouvé(s))\n\n"
        for i, trans in enumerate(results[:10], 1):
            nom = trans.get('nom', {}).get('value', 'N/A')
            type_t = trans.get('type', {}).get('value', 'N/A')
            emission = trans.get('emissionCO2', {}).get('value', 'N/A')
            response += f"{i}. **{nom}** ({type_t}) - Émissions: {emission} kg CO2\n"
        return response
    
    def reset_chat(self):
        """Reset chat history"""
        self.chat_history = []
    
    def generate_sparql(self, natural_query: str) -> Dict[str, Any]:
        """
        Convert natural language to SPARQL using AISalhi
        """
        try:
            prompt = f"""{self.system_context}

Convert this natural language query to SPARQL:
"{natural_query}"

Return ONLY the SPARQL query, no explanation.
"""
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=self.generation_config
            )
            sparql = response.text.strip()
            
            # Clean up response
            if '```sparql' in sparql:
                sparql = sparql.split('```sparql')[1].split('```')[0].strip()
            elif '```' in sparql:
                sparql = sparql.split('```')[1].split('```')[0].strip()
            
            # Execute query
            results = self.sparql_manager.execute_query(sparql)
            
            return {
                'natural_query': natural_query,
                'sparql': sparql,
                'results': results,
                'count': len(results) if results else 0
            }
        except Exception as e:
            return {
                'natural_query': natural_query,
                'error': str(e),
                'sparql': None,
                'results': []
            }
    
    def explain_query(self, sparql: str) -> str:
        """
        Explain what a SPARQL query does using AISalhi
        """
        try:
            prompt = f"""Explain this SPARQL query in simple terms:

{sparql}

Provide a clear, concise explanation for non-technical users.
"""
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=self.generation_config
            )
            return response.text
        except Exception as e:
            return f"Cannot explain query: {str(e)}"
    
    def recommend_activities(self, preferences: Dict[str, Any]) -> List[Dict]:
        """
        Get personalized activity recommendations using AISalhi
        """
        try:
            pref_str = json.dumps(preferences, indent=2)
            prompt = f"""{self.system_context}

User preferences:
{pref_str}

Based on the ontology, recommend 5 activities that match these preferences.
For each recommendation, provide:
1. Activity name
2. Why it matches
3. Difficulty level
4. Estimated price
5. SPARQL query to find it

Return as JSON array.
"""
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=self.generation_config
            )
            
            # Try to parse JSON response
            try:
                recommendations = json.loads(response.text)
                return recommendations
            except:
                # If not JSON, return text explanation
                return [{'explanation': response.text}]
        except Exception as e:
            return [{'error': str(e)}]
    
    def calculate_eco_score(self, entity_type: str, entity_uri: str) -> Dict[str, Any]:
        """
        Calculate eco-friendliness score using AISalhi
        """
        try:
            # First, get entity data
            query = f"""
            PREFIX eco: <http://example.org/eco-tourism#>
            SELECT ?p ?o WHERE {{
              <{entity_uri}> ?p ?o .
            }}
            """
            entity_data = self.sparql_manager.execute_query(query)
            
            # Ask AISalhi to calculate score
            prompt = f"""{self.system_context}

Analyze this {entity_type} and calculate an eco-score (0-100):

Entity URI: {entity_uri}
Properties:
{json.dumps(entity_data, indent=2)}

Provide:
1. Overall eco-score (0-100)
2. Strengths (3-5 bullet points)
3. Areas for improvement (2-3 suggestions)
4. Certification status
5. Comparison to similar entities

Return as JSON.
"""
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=self.generation_config
            )
            
            try:
                score_data = json.loads(response.text)
                return score_data
            except:
                return {'analysis': response.text}
        except Exception as e:
            return {'error': str(e)}
    
    def generate_itinerary(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate travel itinerary using AISalhi
        """
        try:
            params_str = json.dumps(params, indent=2)
            prompt = f"""{self.system_context}

Generate a complete eco-tourism itinerary with these parameters:
{params_str}

Create a day-by-day plan including:
- Accommodations (with certifications)
- Activities (eco-friendly)
- Restaurants (local/bio)
- Transportation (low carbon)
- Estimated costs
- Total carbon footprint

Return as structured JSON.
"""
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=self.generation_config
            )
            
            try:
                itinerary = json.loads(response.text)
                return itinerary
            except:
                return {'itinerary': response.text}
        except Exception as e:
            return {'error': str(e)}
    
    def analyze_video_vibe(self, video_file_path: str, user_message: str = "") -> Dict[str, Any]:
        """
        Analyze video content to detect vibe/ambiance and recommend similar events
        
        Args:
            video_file_path: Path to the uploaded video file
            user_message: Optional user message about what they're looking for
        
        Returns:
            Dict with vibe analysis and event recommendations
        """
        try:
            import os
            import time
            import mimetypes
            
            # Vérifier la taille du fichier
            file_size = os.path.getsize(video_file_path)
            if file_size < 1000:  # Moins de 1KB, probablement pas une vraie vidéo
                # Mode fallback pour les tests
                if user_message:
                    return {
                        'vibe_analysis': {
                            'mood': 'test_mode',
                            'keywords': ['test', 'demo'],
                            'visual_description': f'Test mode - User message: {user_message}',
                            'atmosphere': 'Simulation pour tests',
                            'energy_level': 'medium'
                        },
                        'event_recommendations': [
                            {
                                'event_name': 'Festival Écologique Test',
                                'event_type': 'Festival',
                                'match_score': 85,
                                'why_similar': 'Recommandation de test basée sur le message utilisateur',
                                'description': 'Événement écologique simulé pour les tests'
                            }
                        ],
                        'confidence_score': 70,
                        'note': 'Mode test - vidéo trop petite pour être analysée'
                    }
                else:
                    return {'error': 'Fichier vidéo trop petit ou invalide'}
            
            # Lire le fichier vidéo
            with open(video_file_path, 'rb') as f:
                video_bytes = f.read()
            
            # Log info pour debug
            print(f"[AISalhi] Analyzing video: {len(video_bytes)} bytes")
            print(f"[AISalhi] File path: {video_file_path}")
            print(f"[AISalhi] First bytes: {video_bytes[:20].hex()}")
            
            # Déterminer le mime type
            mime_type, _ = mimetypes.guess_type(video_file_path)
            if not mime_type or not mime_type.startswith('video'):
                # Fallback basé sur l'extension
                file_ext = os.path.splitext(video_file_path)[1].lower()
                mime_type_map = {
                    '.webm': 'video/webm',
                    '.mp4': 'video/mp4',
                    '.mov': 'video/quicktime',
                    '.avi': 'video/x-msvideo'
                }
                mime_type = mime_type_map.get(file_ext, 'video/webm')
            
            print(f"[AISalhi] Using mime type: {mime_type}")
            
            # Utiliser l'analyse directe sans upload de fichier
            # Créer le prompt d'analyse
            analysis_prompt = f"""{self.system_context}

**VIDEO VIBE ANALYSIS TASK:**

Analyze the uploaded video to understand its atmosphere, mood, and vibe. Then recommend similar eco-tourism events from the knowledge base.

User message: {user_message if user_message else "No specific message"}

**ANALYSIS STEPS:**
1. **Visual Analysis**: Describe the setting, environment, activities, people, colors, lighting
2. **Audio Analysis**: Describe sounds, music, conversations, ambient noise, energy level
3. **Vibe Detection**: Identify the overall mood/atmosphere (festive, calm, adventurous, cultural, artistic, social, energetic, relaxing, etc.)
4. **Event Type Mapping**: Based on the vibe, determine what types of events would match:
   - Festival (music, art, cultural)
   - Foire (market, food, craft)
   - Randonnée (hiking, nature)
   - Concert/Performance
   - Workshop/Educational
   - Sports/Adventure
   - Wellness/Relaxation

5. **Recommendations**: Suggest similar eco-tourism events that match the detected vibe.

**OUTPUT FORMAT (JSON):**
{{
  "vibe_analysis": {{
    "visual_description": "description of what you see",
    "audio_description": "description of what you hear",
    "mood": "primary mood/vibe detected",
    "atmosphere": "detailed atmosphere description",
    "energy_level": "low/medium/high",
    "keywords": ["keyword1", "keyword2", ...]
  }},
  "event_recommendations": [
    {{
      "event_name": "name",
      "event_type": "Festival/Foire/Randonnée",
      "match_score": 0-100,
      "why_similar": "explanation of similarity",
      "description": "description"
    }}
  ],
  "confidence_score": 0-100
}}
"""
            
            # Analyse avec inline_data au lieu de file upload
            import base64
            video_base64 = base64.b64encode(video_bytes).decode('utf-8')
            
            print(f"[AISalhi] Base64 encoded, length: {len(video_base64)}")
            print(f"[AISalhi] Sending request to Gemini API...")
            
            response = None
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=[
                        {
                            'role': 'user',
                            'parts': [
                                {'inline_data': {'mime_type': mime_type, 'data': video_base64}},
                                {'text': analysis_prompt}
                            ]
                        }
                    ],
                    config=self.generation_config
                )
                
                print(f"[AISalhi] Response received: {response.text[:200]}...")
                
            except Exception as api_error:
                print(f"[AISalhi] API Error: {str(api_error)}")
                # Si l'erreur est liée au format vidéo invalide, essayer le fallback
                if "INVALID_ARGUMENT" in str(api_error) or "invalid" in str(api_error).lower():
                    print("[AISalhi] Video format not accepted by API, using text-based fallback...")
                    if user_message:
                        fallback_prompt = f"""Based on this user description: "{user_message}"
                        
Generate event recommendations in JSON format:
{{
  "vibe_analysis": {{
    "mood": "detected mood",
    "keywords": ["keyword1", "keyword2"],
    "visual_description": "User described: {user_message}",
    "atmosphere": "atmosphere based on description",
    "energy_level": "medium"
  }},
  "event_recommendations": [
    {{
      "event_name": "Festival Eco Nature",
      "event_type": "Festival",
      "match_score": 85,
      "why_similar": "Based on user description",
      "description": "Eco-friendly event matching the described atmosphere"
    }}
  ],
  "confidence_score": 70,
  "note": "Analysis based on text description only (video format not supported)"
}}"""
                        try:
                            response = self.client.models.generate_content(
                                model=self.model_name,
                                contents=fallback_prompt,
                                config=self.generation_config
                            )
                        except Exception as fallback_error:
                            print(f"[AISalhi] Fallback also failed: {fallback_error}")
                            return {
                                'error': f'Video and fallback analysis failed: {str(fallback_error)}',
                                'vibe_analysis': {'mood': 'error', 'keywords': [], 'visual_description': 'Analysis failed'},
                                'event_recommendations': []
                            }
                    else:
                        return {
                            'error': 'Video format not supported by API. Please try recording again or provide a description.',
                            'technical_details': str(api_error),
                            'vibe_analysis': {'mood': 'error', 'keywords': [], 'visual_description': 'Video format not supported'},
                            'event_recommendations': []
                        }
                else:
                    # Re-raise si ce n'est pas un problème de format
                    return {
                        'error': f'API Error: {str(api_error)}',
                        'vibe_analysis': {'mood': 'error', 'keywords': [], 'visual_description': 'API error occurred'},
                        'event_recommendations': []
                    }
            
            # Parse response (only if we got one)
            if response and response.text:
                try:
                    import json
                    import re
                    
                    # Clean response text (remove markdown code blocks)
                    response_text = response.text.strip()
                    if response_text.startswith('```json'):
                        response_text = response_text[7:]  # Remove ```json
                    if response_text.startswith('```'):
                        response_text = response_text[3:]  # Remove ```
                    if response_text.endswith('```'):
                        response_text = response_text[:-3]  # Remove trailing ```
                    response_text = response_text.strip()
                    
                    print(f"[AISalhi] Cleaned response: {response_text[:200]}...")
                    
                    result = json.loads(response_text)
                    return result
                except json.JSONDecodeError as e:
                    print(f"[AISalhi] JSON decode error: {e}")
                    # If not JSON, return as text
                    return {
                        'vibe_analysis': {
                            'raw_analysis': response.text,
                            'mood': 'unknown',
                            'keywords': [],
                            'visual_description': response.text[:500]
                        },
                        'event_recommendations': [],
                        'note': 'AI response was not in JSON format'
                    }
            else:
                return {
                    'error': 'No response received from API',
                    'vibe_analysis': {'mood': 'error', 'keywords': [], 'visual_description': 'No response from API'},
                    'event_recommendations': []
                }
                
        except Exception as e:
            error_message = str(e)
            
            # Si c'est une erreur d'API Gemini avec des vidéos invalides, fournir un fallback
            if "INVALID_ARGUMENT" in error_message or "invalid" in error_message.lower():
                # Fallback: analyse basée uniquement sur le message utilisateur
                if user_message:
                    try:
                        fallback_prompt = f"""Based on this user description: "{user_message}"
                        
Generate event recommendations in JSON format:
{{
  "vibe_analysis": {{
    "mood": "detected mood",
    "keywords": ["keyword1", "keyword2"],
    "visual_description": "User described: {user_message}",
    "atmosphere": "atmosphere based on description",
    "energy_level": "medium"
  }},
  "event_recommendations": [
    {{
      "event_name": "Festival Eco Nature",
      "event_type": "Festival",
      "match_score": 85,
      "why_similar": "Based on user description",
      "description": "Eco-friendly event matching the described atmosphere"
    }}
  ],
  "confidence_score": 70,
  "note": "Analysis based on text description only (video analysis unavailable)"
}}"""
                        response = self.client.models.generate_content(
                            model=self.model_name,
                            contents=fallback_prompt,
                            config=self.generation_config
                        )
                        
                        import json
                        try:
                            result = json.loads(response.text)
                            result['fallback_mode'] = True
                            return result
                        except:
                            pass
                    except:
                        pass
            
            return {'error': f'Video analysis error: {error_message}'}
    
    def analyze_video_from_base64(self, video_base64: str, user_message: str = "") -> Dict[str, Any]:
        """
        Analyze video from base64 encoded data
        
        Args:
            video_base64: Base64 encoded video data
            user_message: Optional user message
        
        Returns:
            Dict with vibe analysis and event recommendations
        """
        try:
            import base64
            import tempfile
            
            # Decode base64 and save to temporary file
            video_data = base64.b64decode(video_base64)
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
                tmp_file.write(video_data)
                tmp_file_path = tmp_file.name
            
            # Analyze the video
            result = self.analyze_video_vibe(tmp_file_path, user_message)
            
            # Clean up temporary file
            import os
            try:
                os.remove(tmp_file_path)
            except:
                pass
            
            return result
            
        except Exception as e:
            return {'error': f'Base64 video analysis error: {str(e)}'}
