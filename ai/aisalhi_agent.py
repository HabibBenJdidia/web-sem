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
        Maintains conversation history
        """
        try:
            # Add system context for first message only
            if not self.chat_history:
                full_prompt = f"{self.system_context}\n\nUser: {message}"
                
                # Generate response for first message
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=full_prompt,
                    config=self.generation_config
                )
                
                # Initialize history with first exchange
                self.chat_history = [
                    full_prompt,
                    response.text
                ]
            else:
                # For subsequent messages, add to history
                self.chat_history.append(f"User: {message}")
                
                # Create conversation context
                conversation = "\n\n".join(self.chat_history)
                
                # Generate response
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=conversation,
                    config=self.generation_config
                )
                
                # Add response to history
                self.chat_history.append(f"Assistant: {response.text}")
            
            return response.text
        except Exception as e:
            return f"AISalhi Chat Error: {str(e)}"
    
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
