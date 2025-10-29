from flask import Flask, request, jsonify
from flask_cors import CORS
from Mangage import SPARQLManager
from models import *
from config import NAMESPACE
from ai import GeminiAgent
from ai.aiBSila import AIBSilaAgent
from auth_routes import auth_bp
from email_service import init_mail
import re
import os

app = Flask(__name__)
CORS(app)

# Initialize Flask-Mail
init_mail(app)

manager = SPARQLManager()
# Initialize AI Agents
ai_agent = GeminiAgent(manager)
bsila_agent = AIBSilaAgent(manager)

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
            
            if prop_name == 'type' and 'eco-tourism#' in obj:
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
    data = request.json
    dest = Destination(
        uri=f"{NAMESPACE}Destination_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        pays=data.get('pays'),
        climat=data.get('climat')
    )
    result = manager.create(dest)
    return jsonify(result)

@app.route('/destination', methods=['GET'])
def get_all_destinations():
    result = manager.get_all('Destination')
    return jsonify(result)

@app.route('/destination/<path:uri>', methods=['DELETE'])
def delete_destination(uri):
    result = manager.delete(uri)
    return jsonify(result)

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
    data = request.json
    heb = Hebergement(
        uri=f"{NAMESPACE}Hebergement_{clean_uri_name(data.get('nom'))}",
        nom=data.get('nom'),
        type_=data.get('type'),
        prix=data.get('prix'),
        nb_chambres=data.get('nb_chambres'),
        niveau_eco=data.get('niveau_eco'),
        situe_dans=data.get('situe_dans'),
        utilise_energie=data.get('utilise_energie')
    )
    result = manager.create(heb)
    return jsonify(result)

@app.route('/hebergement', methods=['GET'])
def get_all_hebergements():
    result = manager.get_all('Hebergement')
    return jsonify(result)

@app.route('/hebergement/<path:uri>', methods=['DELETE'])
def delete_hebergement(uri):
    result = manager.delete(uri)
    return jsonify(result)

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

# ============================================
# AI AGENT ENDPOINTS
# ============================================

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
                    "query": "PREFIX eco: <http://example.org/eco-tourism#>\nSELECT ?tourist ?name WHERE {\n  ?tourist a eco:Touriste .\n  ?tourist eco:nom ?name .\n}"
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

# ==================== RESERVATION RESTAURANT ROUTES ====================

@app.route('/reservation-restaurant', methods=['POST'])
def create_reservation_restaurant():
    """Create a new restaurant reservation with conflict checking"""
    try:
        data = request.json
        
        # Required fields validation
        required_fields = ['touriste', 'restaurant', 'date_reservation', 'heure', 'nombre_personnes']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        restaurant_uri = data['restaurant']
        touriste_uri = data['touriste']
        date_reservation = data['date_reservation']
        heure = data['heure']
        nombre_personnes = data['nombre_personnes']
        
        # 1. Check if tourist already has a reservation at this time
        tourist_available = ReservationRestaurant.check_tourist_conflict(
            manager, 
            touriste_uri, 
            date_reservation, 
            heure
        )
        
        if not tourist_available:
            return jsonify({
                "error": "Vous avez déjà une réservation à cette heure",
                "message": "You already have a reservation at this time. You cannot make multiple reservations for the same time slot."
            }), 409  # HTTP 409 Conflict
        
        # 2. Check restaurant capacity
        capacity_available, current_reserved, max_capacity, capacity_message = ReservationRestaurant.check_restaurant_capacity(
            manager, 
            restaurant_uri, 
            date_reservation, 
            heure,
            nombre_personnes
        )
        
        if not capacity_available:
            return jsonify({
                "error": "Le restaurant est complet pour ce créneau horaire",
                "message": capacity_message,
                "current_reserved": current_reserved,
                "max_capacity": max_capacity
            }), 409  # HTTP 409 Conflict
        
        # 3. Final check - time slot availability (legacy check, kept for compatibility)
        is_available = ReservationRestaurant.check_availability(
            manager, 
            restaurant_uri, 
            date_reservation, 
            heure
        )
        
        if not is_available:
            return jsonify({
                "error": "Ce créneau horaire est déjà réservé",
                "message": "This time slot is already booked. Please choose another time."
            }), 409  # HTTP 409 Conflict
        
        # Create the reservation
        reservation = ReservationRestaurant(
            touriste=touriste_uri,
            restaurant=restaurant_uri,
            date_reservation=date_reservation,
            heure=heure,
            nombre_personnes=nombre_personnes,
            statut=data.get('statut', 'en_attente'),
            notes_speciales=data.get('notes_speciales'),
            telephone=data.get('telephone'),
            email=data.get('email')
        )
        
        result = manager.create(reservation)
        
        if result.get('error'):
            return jsonify({"error": result['error']}), 500
        
        return jsonify({
            "message": "Reservation created successfully",
            "uri": reservation.uri,
            "statut": "en_attente"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reservation-restaurant/<path:uri>', methods=['GET'])
def get_reservation_restaurant(uri):
    """Get reservation details by URI"""
    try:
        query = f"""
            PREFIX ns: <{NAMESPACE}>
            SELECT ?p ?o WHERE {{{{
                <{uri}> ?p ?o .
            }}}}
        """
        results = manager.execute_query(query)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reservations-restaurant/touriste/<path:touriste_uri>', methods=['GET'])
def get_touriste_reservations(touriste_uri):
    """Get all reservations for a tourist"""
    try:
        print(f"Fetching reservations for tourist: {touriste_uri}")
        
        query = f"""
            PREFIX ns: <{NAMESPACE}>
            SELECT ?s ?p ?o WHERE {{
                ?s a ns:ReservationRestaurant .
                ?s ns:reservePar <{touriste_uri}> .
                ?s ?p ?o .
            }}
        """
        results = manager.execute_query(query)
        print(f"Found {len(results)} reservation triples")
        
        # Parse results into structured reservations
        reservations_map = {}
        for result in results:
            uri = result.get('s', {}).get('value', '')
            predicate = result.get('p', {}).get('value', '')
            obj = result.get('o', {}).get('value', '')
            
            if uri not in reservations_map:
                reservations_map[uri] = {'uri': uri}
            
            if '#' in predicate:
                prop_name = predicate.split('#')[1]
                reservations_map[uri][prop_name] = obj
        
        # Get restaurant names for each reservation
        for res_uri, reservation in reservations_map.items():
            if 'reservePour' in reservation:
                restaurant_uri = reservation['reservePour']
                restaurant_query = f"""
                    PREFIX ns: <{NAMESPACE}>
                    SELECT ?nom WHERE {{
                        <{restaurant_uri}> ns:nom ?nom .
                    }}
                """
                restaurant_results = manager.execute_query(restaurant_query)
                if restaurant_results and len(restaurant_results) > 0:
                    reservation['restaurant_nom'] = restaurant_results[0].get('nom', {}).get('value', 'Unknown')
        
        print(f"Returning {len(reservations_map)} reservations")
        return jsonify(list(reservations_map.values()))
    except Exception as e:
        print(f"Error fetching reservations: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/reservations-restaurant/restaurant/<path:restaurant_uri>', methods=['GET'])
def get_restaurant_reservations(restaurant_uri):
    """Get all reservations for a restaurant (for admins/guides)"""
    try:
        query = f"""
            PREFIX ns: <{NAMESPACE}>
            SELECT ?s ?p ?o WHERE {{{{
                ?s a ns:ReservationRestaurant .
                ?s ns:reservePour <{restaurant_uri}> .
                ?s ?p ?o .
            }}}}
        """
        results = manager.execute_query(query)
        
        # Parse results into structured reservations
        reservations_map = {}
        for result in results:
            uri = result.get('s', {}).get('value', '')
            predicate = result.get('p', {}).get('value', '')
            obj = result.get('o', {}).get('value', '')
            
            if uri not in reservations_map:
                reservations_map[uri] = {'uri': uri}
            
            if '#' in predicate:
                prop_name = predicate.split('#')[1]
                reservations_map[uri][prop_name] = obj
        
        return jsonify(list(reservations_map.values()))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reservations-restaurant/all', methods=['GET'])
def get_all_reservations():
    """Get all reservations (for admins/guides)"""
    try:
        query = f"""
            PREFIX ns: <{NAMESPACE}>
            SELECT ?s ?p ?o WHERE {{{{
                ?s a ns:ReservationRestaurant .
                ?s ?p ?o .
            }}}}
        """
        results = manager.execute_query(query)
        
        # Parse results into structured reservations
        reservations_map = {}
        for result in results:
            uri = result.get('s', {}).get('value', '')
            predicate = result.get('p', {}).get('value', '')
            obj = result.get('o', {}).get('value', '')
            
            if uri not in reservations_map:
                reservations_map[uri] = {'uri': uri}
            
            if '#' in predicate:
                prop_name = predicate.split('#')[1]
                reservations_map[uri][prop_name] = obj
        
        return jsonify(list(reservations_map.values()))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reservation-restaurant/<path:uri>/status', methods=['PUT'])
def update_reservation_status(uri):
    """Update reservation status (confirm, cancel)"""
    try:
        data = request.json
        new_status = data.get('statut')
        
        if not new_status:
            return jsonify({"error": "Missing 'statut' field"}), 400
        
        # Valid status values
        valid_statuses = ['en_attente', 'confirmee', 'annulee']
        if new_status not in valid_statuses:
            return jsonify({"error": f"Invalid status. Must be one of: {valid_statuses}"}), 400
        
        # Update the status
        result = manager.update_property(uri, 'statut', new_status, is_string=True)
        
        if result.get('error'):
            return jsonify({"error": result['error']}), 500
        
        return jsonify({"message": "Reservation status updated", "statut": new_status})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reservation-restaurant/<path:uri>', methods=['DELETE'])
def delete_reservation(uri):
    """Delete/Cancel a reservation"""
    try:
        result = manager.delete(uri)
        
        if result.get('error'):
            return jsonify({"error": result['error']}), 500
        
        return jsonify({"message": "Reservation deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reservation-restaurant/check-availability', methods=['POST'])
def check_availability():
    """Check if a time slot is available including capacity and tourist conflicts"""
    try:
        data = request.json
        restaurant_uri = data.get('restaurant')
        touriste_uri = data.get('touriste')
        date_reservation = data.get('date_reservation')
        heure = data.get('heure')
        nombre_personnes = data.get('nombre_personnes', 1)
        
        if not all([restaurant_uri, date_reservation, heure]):
            return jsonify({"error": "Missing required fields"}), 400
        
        response = {
            "available": True,
            "restaurant": restaurant_uri,
            "date": date_reservation,
            "heure": heure,
            "checks": {}
        }
        
        # Check tourist conflict if tourist URI is provided
        if touriste_uri:
            tourist_available = ReservationRestaurant.check_tourist_conflict(
                manager, 
                touriste_uri, 
                date_reservation, 
                heure
            )
            response['checks']['tourist_available'] = tourist_available
            if not tourist_available:
                response['available'] = False
                response['message'] = "You already have a reservation at this time"
                return jsonify(response), 200
        
        # Check restaurant capacity
        capacity_available, current_reserved, max_capacity, capacity_message = ReservationRestaurant.check_restaurant_capacity(
            manager, 
            restaurant_uri, 
            date_reservation, 
            heure,
            nombre_personnes
        )
        
        response['checks']['capacity_available'] = capacity_available
        response['checks']['current_reserved'] = current_reserved
        response['checks']['max_capacity'] = max_capacity
        response['checks']['capacity_message'] = capacity_message
        
        if not capacity_available:
            response['available'] = False
            response['message'] = capacity_message
            return jsonify(response), 200
        
        # Final check - time slot availability
        is_available = ReservationRestaurant.check_availability(
            manager, 
            restaurant_uri, 
            date_reservation, 
            heure
        )
        
        response['checks']['time_slot_available'] = is_available
        
        if not is_available:
            response['available'] = False
            response['message'] = "This time slot is already fully booked"
        else:
            response['message'] = f"Available! {max_capacity - current_reserved if max_capacity else 'Unlimited'} seats remaining"
        
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== AI BSILA VOICE ASSISTANT ENDPOINTS ====================

@app.route('/ai-bsila/voice-query', methods=['POST'])
def bsila_voice_query():
    """
    AI BSila Voice Query
    Accepts user query and returns:
    1. Voice response (base64 audio)
    2. Textual data response
    3. SPARQL query & results
    """
    try:
        data = request.get_json()
        user_query = data.get('query')
        
        if not user_query:
            return jsonify({"error": "Query is required"}), 400
        
        result = bsila_agent.process_voice_query(user_query)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/speech-to-text', methods=['POST'])
def bsila_speech_to_text():
    """
    Convert audio to text using ElevenLabs Speech-to-Text
    Expects audio file in request
    """
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Audio file is required"}), 400
        
        audio_file = request.files['audio']
        
        # Use ElevenLabs speech-to-text
        result = bsila_agent.speech_to_text(audio_file)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/restaurants', methods=['GET'])
def bsila_get_restaurants():
    """Get all restaurants with voice + text response"""
    try:
        result = bsila_agent.get_restaurants()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/restaurants/eco', methods=['GET'])
def bsila_get_eco_restaurants():
    """Get ecological restaurants with voice + text response"""
    try:
        result = bsila_agent.get_eco_restaurants()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/products', methods=['GET'])
def bsila_get_products():
    """Get all local products with voice + text response"""
    try:
        result = bsila_agent.get_local_products()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/products/bio', methods=['GET'])
def bsila_get_bio_products():
    """Get organic products with voice + text response"""
    try:
        result = bsila_agent.get_bio_products()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/products/season/<season>', methods=['GET'])
def bsila_get_products_by_season(season):
    """Get products by season with voice + text response"""
    try:
        result = bsila_agent.get_products_by_season(season)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/restaurant-products', methods=['GET'])
def bsila_get_restaurant_products():
    """Get restaurants and their products"""
    try:
        restaurant_name = request.args.get('restaurant')
        result = bsila_agent.get_restaurant_products(restaurant_name)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/reset', methods=['POST'])
def bsila_reset():
    """Reset BSila chat session"""
    try:
        result = bsila_agent.reset_chat()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/voices', methods=['GET'])
def bsila_get_voices():
    """Get list of available voices"""
    try:
        result = bsila_agent.get_available_voices()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/voice/current', methods=['GET'])
def bsila_get_current_voice():
    """Get currently selected voice"""
    try:
        result = bsila_agent.get_current_voice()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/voice/set', methods=['POST'])
def bsila_set_voice():
    """Set the voice for text-to-speech"""
    try:
        data = request.get_json()
        voice_key = data.get('voice_key')
        
        if not voice_key:
            return jsonify({"error": "voice_key is required"}), 400
        
        result = bsila_agent.set_voice(voice_key)
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/help', methods=['GET'])
def bsila_help():
    """Get help information about AI BSila"""
    return jsonify({
        "name": "AI BSila Voice Assistant",
        "description": "Assistant vocal intelligent pour restaurants et produits locaux",
        "endpoints": {
            "POST /ai-bsila/voice-query": {
                "description": "Requête vocale principale",
                "body": {"query": "Votre question en français"},
                "response": {
                    "vocal_response": "Réponse avec explication",
                    "data_response": "Données structurées",
                    "voice_audio": "Audio base64",
                    "sparql_query": "Requête SPARQL exécutée"
                }
            },
            "GET /ai-bsila/restaurants": "Liste tous les restaurants",
            "GET /ai-bsila/restaurants/eco": "Liste les restaurants écologiques",
            "GET /ai-bsila/products": "Liste tous les produits locaux",
            "GET /ai-bsila/products/bio": "Liste les produits biologiques",
            "GET /ai-bsila/products/season/<season>": "Produits par saison",
            "GET /ai-bsila/restaurant-products?restaurant=<nom>": "Produits servis dans un restaurant"
        },
        "examples": [
            "Quels sont les restaurants disponibles?",
            "Montre-moi les produits bio",
            "Quels produits sont de saison en été?",
            "Liste les restaurants écologiques"
        ]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

