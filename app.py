from flask import Flask, request, jsonify
from flask_cors import CORS
from Mangage import SPARQLManager
from models import *
from config import NAMESPACE
from ai import GeminiAgent
from auth_routes import auth_bp
from email_service import init_mail
import re
import os

app = Flask(__name__)
CORS(app)

# Initialize Flask-Mail
init_mail(app)

manager = SPARQLManager()
# Initialize AI Agent
ai_agent = GeminiAgent(manager)

# Register authentication blueprint
app.register_blueprint(auth_bp)

# Helper function to parse SPARQL results into user objects
def parse_users_from_sparql(results):
    """Parse SPARQL triple results into structured user objects"""
    users_dict = {}
    
    for result in results:
        uri = result.get('s', {}).get('value', '')
        predicate = result.get('p', {}).get('value', '')
        obj = result.get('o', {}).get('value', '')
        
        if uri not in users_dict:
            users_dict[uri] = {'uri': uri}
        
        # Extract property name from URI
        if '#' in predicate:
            prop_name = predicate.split('#')[1]
            
            if prop_name == 'type' and f'{NAMESPACE}' in obj:
                users_dict[uri]['type'] = obj.split('#')[1]
            elif prop_name in ['nom', 'email', 'age', 'nationalite']:
                users_dict[uri][prop_name] = obj
    
    # Filter only users with type Touriste or Guide
    filtered_users = []
    for user in users_dict.values():
        if user.get('type') in ['Touriste', 'Guide']:
            filtered_users.append(user)
    
    return filtered_users

def clean_uri_name(name):
    """Clean name for use in URI - remove spaces and special chars"""
    if not name:
        return "Unknown"
    # Replace spaces and special chars with underscore
    cleaned = re.sub(r'[^\w\-]', '_', str(name))
    # Remove consecutive underscores
    cleaned = re.sub(r'_+', '_', cleaned)
    return cleaned

# Helper function to parse joined Hebergement and Destination data
def parse_hebergements_with_destinations(hebergement_results):
    hebergement_dict = {}
    destination_dict = {}
    
    for result in hebergement_results:
        s = result.get('s', {}).get('value', '')
        p = result.get('p', {}).get('value', '')
        o = result.get('o', {}).get('value', '')
        
        if s.startswith(f'{NAMESPACE}Hebergement'):
            if s not in hebergement_dict:
                hebergement_dict[s] = {'uri': s}
            prop_name = p.split('#')[1]
            if prop_name in ['nom', 'type', 'prix', 'nbChambres', 'niveauEco', 'id']:
                hebergement_dict[s][prop_name] = o
            elif prop_name == 'situeDans':
                hebergement_dict[s]['destinationUri'] = o
        elif s.startswith(f'{NAMESPACE}Destination'):
            if s not in destination_dict:
                destination_dict[s] = {'uri': s}
            prop_name = p.split('#')[1]
            if prop_name in ['nom', 'pays', 'climat', 'id']:
                destination_dict[s][prop_name] = o
    
    # Join the data
    joined_results = []
    for h in hebergement_dict.values():
        dest_uri = h.get('destinationUri')
        if dest_uri and dest_uri in destination_dict:
            h['destination'] = destination_dict[dest_uri]
        joined_results.append(h)
    
    return joined_results

# USERS MANAGEMENT ENDPOINT
@app.route('/users', methods=['GET'])
def get_all_users():
    """Get all users (Touristes and Guides) in a structured format"""
    try:
        # Get all tourists
        touriste_results = manager.get_all('Touriste')
        # Get all guides
        guide_results = manager.get_all('Guide')
        
        # Combine results
        all_results = touriste_results + guide_results
        
        # Parse into structured format
        users = parse_users_from_sparql(all_results)
        
        return jsonify({
            'users': users,
            'total': len(users)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# TOURISTE
@app.route('/touriste', methods=['POST'])
def create_touriste():
    data = request.json
    touriste = Touriste(
        uri=f"{NAMESPACE}Touriste_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        age=data.get('age'),
        nationalite=data.get('nationalite'),
        sejourne_dans=data.get('sejourne_dans'),
        participe_a=data.get('participe_a', []),
        se_deplace_par=data.get('se_deplace_par', [])
    )
    result = manager.create(touriste)
    return jsonify(result)

@app.route('/touriste/<path:uri>', methods=['GET'])
def get_touriste(uri):
    result = manager.get_by_uri(uri)
    return jsonify(result)

@app.route('/touriste', methods=['GET'])
def get_all_touristes():
    result = manager.get_all('Touriste')
    return jsonify(result)

@app.route('/touriste/<path:uri>', methods=['PUT'])
def update_touriste(uri):
    data = request.json
    results = []
    for key, value in data.items():
        result = manager.update_property(uri, key, value, isinstance(value, str))
        results.append(result)
    return jsonify({"updates": results})

@app.route('/touriste/<path:uri>', methods=['DELETE'])
def delete_touriste(uri):
    result = manager.delete(uri)
    return jsonify(result)

# GUIDE
@app.route('/guide', methods=['POST'])
def create_guide():
    data = request.json
    guide = Guide(
        uri=f"{NAMESPACE}Guide_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        age=data.get('age'),
        nationalite=data.get('nationalite'),
        organise=data.get('organise', []),
        organise_evenement=data.get('organise_evenement', [])
    )
    result = manager.create(guide)
    return jsonify(result)

@app.route('/guide', methods=['GET'])
def get_all_guides():
    result = manager.get_all('Guide')
    return jsonify(result)

@app.route('/guide/<path:uri>', methods=['GET'])
def get_guide(uri):
    result = manager.get_by_uri(uri)
    return jsonify(result)

@app.route('/guide/<path:uri>', methods=['DELETE'])
def delete_guide(uri):
    result = manager.delete(uri)
    return jsonify(result)

# DESTINATION
@app.route('/destination', methods=['POST'])
def create_destination():
    """Create a new Destination"""
    data = request.json
    if not data or not data.get('nom'):
        return jsonify({"error": "Nom is required"}), 400
    
    dest = Destination(nom=data.get('nom'), pays=data.get('pays'), climat=data.get('climat'))
    result = manager.create(dest)
    return jsonify(result), 201

@app.route('/destination/<path:uri>', methods=['GET'])
def get_destination(uri):
    """Read a Destination by URI"""
    result = manager.get_by_uri(uri)
    if not result:
        return jsonify({"error": "Destination not found"}), 404
    return jsonify(result), 200

@app.route('/destinations', methods=['GET'])
def get_all_destinations():
    """Read all Destinations"""
    result = manager.get_all('Destination')
    return jsonify(result), 200

@app.route('/destination/<path:uri>', methods=['PUT'])
def update_destination(uri):
    """Update a Destination by URI"""
    data = request.json
    if not data:
        return jsonify({"error": "Data required for update"}), 400
    
    updates = []
    for key, value in data.items():
        if key in ['nom', 'pays', 'climat']:
            result = manager.update_property(uri, key, value, isinstance(value, str))
            updates.append(result)
    return jsonify({"updates": updates}), 200

@app.route('/destination/<path:uri>', methods=['DELETE'])
def delete_destination(uri):
    """Delete a Destination by URI"""
    result = manager.delete(uri)
    return jsonify(result), 200

# VILLE
@app.route('/ville', methods=['POST'])
def create_ville():
    data = request.json
    ville = Ville(
        uri=f"{NAMESPACE}Ville_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        pays=data.get('pays'),
        climat=data.get('climat')
    )
    result = manager.create(ville)
    return jsonify(result)

@app.route('/ville', methods=['GET'])
def get_all_villes():
    result = manager.get_all('Ville')
    return jsonify(result)

# HEBERGEMENT
@app.route('/hebergement', methods=['POST'])
def create_hebergement():
    """Create a new Hebergement"""
    data = request.json
    if not data or not data.get('nom'):
        return jsonify({"error": "Nom is required"}), 400
    
    heb = Hebergement(
        uri=f"{NAMESPACE}Hebergement_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        type_=data.get('type'),
        prix=data.get('prix'),
        nb_chambres=data.get('nb_chambres'),
        niveau_eco=data.get('niveau_eco'),
        situe_dans=data.get('situe_dans'),  # Link to Destination URI
        utilise_energie=data.get('utilise_energie')
    )
    result = manager.create(heb)
    return jsonify(result), 201

@app.route('/hebergement/<path:uri>', methods=['GET'])
def get_hebergement(uri):
    """Read a Hebergement by URI"""
    result = manager.get_by_uri(uri)
    if not result:
        return jsonify({"error": "Hebergement not found"}), 404
    return jsonify(result), 200

@app.route('/hebergements', methods=['GET'])
def get_all_hebergements():
    """Read all Hebergements with joined Destination data"""
    try:
        print("=" * 70)
        print("GET /hebergements endpoint called")
        
        # Simple query to get all hebergements with their destinations
        query = f"""
            PREFIX eco: <{NAMESPACE}>
            
            SELECT ?hebUri ?hebNom ?hebType ?hebPrix ?hebChambres ?hebEco 
                   ?destUri ?destNom ?destPays ?destClimat
            WHERE {{
                ?hebUri a eco:Hebergement .
                
                OPTIONAL {{ ?hebUri eco:nom ?hebNom }}
                OPTIONAL {{ ?hebUri eco:type ?hebType }}
                OPTIONAL {{ ?hebUri eco:prix ?hebPrix }}
                OPTIONAL {{ ?hebUri eco:nbChambres ?hebChambres }}
                OPTIONAL {{ ?hebUri eco:niveauEco ?hebEco }}
                
                OPTIONAL {{
                    ?hebUri eco:situeDans ?destUri .
                    ?destUri a eco:Destination .
                    OPTIONAL {{ ?destUri eco:nom ?destNom }}
                    OPTIONAL {{ ?destUri eco:pays ?destPays }}
                    OPTIONAL {{ ?destUri eco:climat ?destClimat }}
                }}
            }}
        """
        
        print("Executing query...")
        results = manager.execute_query(query)
        print(f"Query returned {len(results)} rows")
        
        if not results:
            print("No hebergements found")
            return jsonify({"status": "success", "data": []}), 200
        
        # Group results by hebergement URI
        hebergements_dict = {}
        
        for row in results:
            heb_uri = row.get('hebUri', {}).get('value', '')
            
            if not heb_uri:
                continue
            
            if heb_uri not in hebergements_dict:
                # Initialize hebergement
                hebergements_dict[heb_uri] = {
                    'uri': heb_uri,
                    'nom': row.get('hebNom', {}).get('value', ''),
                    'type': row.get('hebType', {}).get('value', ''),
                    'prix': row.get('hebPrix', {}).get('value', ''),
                    'nbChambres': row.get('hebChambres', {}).get('value', ''),
                    'niveauEco': row.get('hebEco', {}).get('value', ''),
                    'destination': None
                }
                
                # Add destination if exists
                dest_uri = row.get('destUri', {}).get('value', '')
                if dest_uri:
                    hebergements_dict[heb_uri]['destination'] = {
                        'uri': dest_uri,
                        'nom': row.get('destNom', {}).get('value', 'Non spécifié'),
                        'pays': row.get('destPays', {}).get('value', ''),
                        'climat': row.get('destClimat', {}).get('value', '')
                    }
        
        hebergements_list = list(hebergements_dict.values())
        
        print(f"Processed {len(hebergements_list)} hebergements")
        if hebergements_list:
            print(f"First hebergement sample: {hebergements_list[0]}")
        
        return jsonify({"status": "success", "data": hebergements_list}), 200
        
    except Exception as e:
        print("=" * 70)
        print(f"ERROR in get_all_hebergements: {str(e)}")
        import traceback
        traceback.print_exc()
        print("=" * 70)
        return jsonify({"status": "error", "message": str(e)}), 500
@app.route('/hebergement/<path:uri>', methods=['PUT'])
def update_hebergement(uri):
    """Update a Hebergement by URI"""
    data = request.json
    if not data:
        return jsonify({"error": "Data required for update"}), 400
    
    updates = []
    for key, value in data.items():
        if key in ['nom', 'type', 'prix', 'nb_chambres', 'niveau_eco', 'situe_dans', 'utilise_energie']:
            result = manager.update_property(uri, key, value, isinstance(value, str))
            updates.append(result)
    return jsonify({"updates": updates}), 200

@app.route('/hebergement/<path:uri>', methods=['DELETE'])
def delete_hebergement(uri):
    """Delete a Hebergement by URI"""
    result = manager.delete(uri)
    return jsonify(result), 200

# ACTIVITE
@app.route('/activite', methods=['POST'])
def create_activite():
    data = request.json
    act = Activite(
        uri=f"{NAMESPACE}Activite_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        difficulte=data.get('difficulte'),
        duree_heures=data.get('duree_heures'),
        prix=data.get('prix'),
        est_dans_zone=data.get('est_dans_zone')
    )
    result = manager.create(act)
    return jsonify(result)

@app.route('/activite', methods=['GET'])
def get_all_activites():
    result = manager.get_all('Activite')
    return jsonify(result)

@app.route('/activite/<path:uri>', methods=['DELETE'])
def delete_activite(uri):
    result = manager.delete(uri)
    return jsonify(result)

# TRANSPORT
@app.route('/transport', methods=['POST'])
def create_transport():
    data = request.json
    trans = Transport(
        uri=f"{NAMESPACE}Transport_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        type_=data.get('type'),
        emission_co2_per_km=data.get('emission_co2_per_km')
    )
    result = manager.create(trans)
    return jsonify(result)

@app.route('/transport', methods=['GET'])
def get_all_transports():
    result = manager.get_all('Transport')
    return jsonify(result)

@app.route('/transport/<path:uri>', methods=['DELETE'])
def delete_transport(uri):
    result = manager.delete(uri)
    return jsonify(result)

# RESTAURANT
@app.route('/restaurant', methods=['POST'])
def create_restaurant():
    data = request.json
    rest = Restaurant(
        uri=f"{NAMESPACE}Restaurant_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        situe_dans=data.get('situe_dans'),
        sert=data.get('sert', [])
    )
    result = manager.create(rest)
    return jsonify(result)

@app.route('/restaurant', methods=['GET'])
def get_all_restaurants():
    result = manager.get_all('Restaurant')
    return jsonify(result)

@app.route('/restaurant/<path:uri>', methods=['DELETE'])
def delete_restaurant(uri):
    result = manager.delete(uri)
    return jsonify(result)

# PRODUIT LOCAL
@app.route('/produit', methods=['POST'])
def create_produit():
    data = request.json
    prod = ProduitLocal(
        uri=f"{NAMESPACE}ProduitLocal_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        saison=data.get('saison'),
        bio=data.get('bio')
    )
    result = manager.create(prod)
    return jsonify(result)

@app.route('/produit', methods=['GET'])
def get_all_produits():
    result = manager.get_all('ProduitLocal')
    return jsonify(result)

@app.route('/produit/<path:uri>', methods=['DELETE'])
def delete_produit(uri):
    result = manager.delete(uri)
    return jsonify(result)

# CERTIFICATION
@app.route('/certification', methods=['POST'])
def create_certification():
    data = request.json
    cert = CertificationEco(
        uri=f"{NAMESPACE}Certification_{clean_uri_name(data.get('label_nom'))}",
        label_nom=data.get('label_nom'),
        organisme=data.get('organisme'),
        annee_obtention=data.get('annee_obtention')
    )
    result = manager.create(cert)
    return jsonify(result)

@app.route('/certification', methods=['GET'])
def get_all_certifications():
    result = manager.get_all('CertificationEco')
    return jsonify(result)

# EVENEMENT
@app.route('/evenement', methods=['POST'])
def create_evenement():
    data = request.json
    event = Evenement(
        uri=f"{NAMESPACE}Evenement_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        event_date=data.get('event_date'),
        event_duree_heures=data.get('event_duree_heures'),
        event_prix=data.get('event_prix'),
        a_lieu_dans=data.get('a_lieu_dans')
    )
    result = manager.create(event)
    return jsonify(result)

@app.route('/evenement', methods=['GET'])
def get_all_evenements():
    result = manager.get_all('Evenement')
    return jsonify(result)

@app.route('/evenement/<path:uri>', methods=['DELETE'])
def delete_evenement(uri):
    result = manager.delete(uri)
    return jsonify(result)

# SEARCH ENDPOINTS
@app.route('/search', methods=['POST'])
def search():
    data = request.json
    result = manager.search(
        class_name=data.get('class_name'),
        filters=data.get('filters')
    )
    return jsonify(result)

@app.route('/search/name/<name>', methods=['GET'])
def search_by_name(name):
    result = manager.search_by_name(name)
    return jsonify(result)

@app.route('/search/eco-hebergements', methods=['GET'])
def search_eco_hebergements():
    result = manager.get_eco_hebergements()
    return jsonify(result)

@app.route('/search/bio-products', methods=['GET'])
def search_bio_products():
    result = manager.get_bio_products()
    return jsonify(result)

@app.route('/search/zero-emission-transport', methods=['GET'])
def search_zero_emission():
    result = manager.get_zero_emission_transport()
    return jsonify(result)

@app.route('/search/activities/<difficulty>', methods=['GET'])
def search_activities_by_difficulty(difficulty):
    result = manager.get_activities_by_difficulty(difficulty)
    return jsonify(result)

@app.route('/search/events', methods=['GET'])
def search_events():
    start = request.args.get('start')
    end = request.args.get('end')
    result = manager.get_events_by_date_range(start, end)
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "running"})

# AI AGENT ENDPOINTS
@app.route('/ai/chat', methods=['POST'])
def ai_chat():
    """
    Chat with AI agent
    Body: {"message": "your question here"}
    """
    data = request.json
    message = data.get('message', '')
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
    
    result = ai_agent.process_message(message)
    return jsonify(result)

@app.route('/ai/ask', methods=['POST'])
def ai_ask():
    """
    Simple question to AI (returns text response)
    Body: {"question": "your question"}
    """
    data = request.json
    question = data.get('question', '')
    
    if not question:
        return jsonify({"error": "Question is required"}), 400
    
    response = ai_agent.ask(question)
    return jsonify({"response": response})

@app.route('/ai/sparql', methods=['POST'])
def ai_sparql():
    """
    Execute SPARQL query with AI explanation
    Body: {"query": "SELECT * WHERE {...}"}
    """
    data = request.json
    query = data.get('query', '')
    
    if not query:
        return jsonify({"error": "SPARQL query is required"}), 400
    
    result = ai_agent.execute_sparql(query)
    return jsonify(result)

@app.route('/ai/recommend-activities', methods=['POST'])
def ai_recommend_activities():
    """
    Get AI-powered activity recommendations
    Body: {
        "age": 30,
        "nationalite": "TN",
        "preferences": ["eco-friendly", "nature"],
        "budget": 100
    }
    """
    data = request.json
    result = ai_agent.suggest_activities(data)
    return jsonify(result)

@app.route('/ai/eco-score/<entity_type>/<path:uri>', methods=['GET'])
def ai_eco_score(entity_type, uri):
    """
    Calculate eco-friendliness score for an entity
    Example: GET /ai/eco-score/Hebergement/http://example.org/eco-tourism#Hebergement_EcoLodge
    """
    result = ai_agent.calculate_eco_score(entity_type, uri)
    return jsonify(result)

@app.route('/ai/reset', methods=['POST'])
def ai_reset():
    """Reset AI chat session"""
    result = ai_agent.reset_chat()
    return jsonify(result)

@app.route('/ai/help', methods=['GET'])
def ai_help():
    """Get AI capabilities and usage instructions"""
    return jsonify({
        "name": "Eco-Tourism AI Agent",
        "description": "Intelligent assistant powered by Google Gemini",
        "capabilities": [
            "Natural language conversation about eco-tourism",
            "Execute SPARQL queries",
            "Search and retrieve data from knowledge base",
            "Recommend activities based on tourist profiles",
            "Calculate eco-friendliness scores",
            "Explain complex ontology relationships"
        ],
        "endpoints": {
            "POST /ai/chat": "Interactive chat (can execute actions)",
            "POST /ai/ask": "Simple question-answer",
            "POST /ai/sparql": "Execute SPARQL with AI explanation",
            "POST /ai/recommend-activities": "Get activity recommendations",
            "GET /ai/eco-score/<entity_type>/<uri>": "Calculate eco score",
            "POST /ai/reset": "Reset chat session",
            "GET /ai/help": "This help message"
        },
        "examples": {
            "chat": {
                "url": "/ai/chat",
                "body": {"message": "Show me all tourists from Tunisia"}
            },
            "ask": {
                "url": "/ai/ask",
                "body": {"question": "What eco-friendly activities are available?"}
            },
            "sparql": {
                "url": "/ai/sparql",
                "body": {
                    "query": f"PREFIX {NAMESPACE[:-1]}: <{NAMESPACE}>\nSELECT ?tourist ?name WHERE {{\n  ?tourist a {NAMESPACE}Touriste .\n  ?tourist {NAMESPACE}nom ?name .\n}}"
                }
            },
            "recommend": {
                "url": "/ai/recommend-activities",
                "body": {
                    "age": 30,
                    "nationalite": "TN",
                    "preferences": ["nature", "eco-friendly"],
                    "budget": 100
                }
            }
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)