from flask import Flask, request, jsonify
from flask_cors import CORS
from Mangage import SPARQLManager
from models import *
from config import NAMESPACE
from ai import AISalhi
from auth_routes import auth_bp
from email_service import init_mail
import re
import os
import sys

# Force UTF-8 encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # Support non-ASCII characters in JSON

# Configuration CORS plus permissive pour le développement
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Initialize Flask-Mail
init_mail(app)

manager = SPARQLManager()
# Initialize AISalhi - Advanced AI Assistant
ai_agent = AISalhi(manager)

# Register authentication blueprint
app.register_blueprint(auth_bp)

# Root endpoint
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Eco-Tourism API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "auth": {
                "register": "/auth/register (POST)",
                "login": "/auth/login (POST)",
                "profile": "/auth/profile (GET)",
                "verify-email": "/auth/verify-email (POST)",
                "forgot-password": "/auth/forgot-password (POST)",
                "reset-password": "/auth/reset-password (POST)"
            },
            "touriste": {
                "create": "/touriste (POST)",
                "get_all": "/touriste (GET)",
                "get_one": "/touriste/<uri> (GET)",
                "update": "/touriste/<uri> (PUT)",
                "delete": "/touriste/<uri> (DELETE)"
            },
            "guide": "/guide",
            "destination": "/destination",
            "ville": "/ville",
            "hebergement": "/hebergement",
            "activite": "/activite",
            "transport": "/transport",
            "restaurant": "/restaurant",
            "produit_local": "/produit-local",
            "certification": {
                "create": "/certification (POST)",
                "get_all": "/certification (GET)",
                "get_by_id": "/certification/id/<id> (GET)",
                "get_by_uri": "/certification/<uri> (GET)",
                "update_by_id": "/certification/id/<id> (PUT)",
                "update_by_uri": "/certification/<uri> (PUT)",
                "delete_by_id": "/certification/id/<id> (DELETE)",
                "delete_by_uri": "/certification/<uri> (DELETE)"
            },
            "evenement": {
                "create": "/evenement (POST)",
                "get_all": "/evenement (GET)",
                "get_by_id": "/evenement/id/<id> (GET)",
                "get_by_uri": "/evenement/<uri> (GET)",
                "update_by_id": "/evenement/id/<id> (PUT)",
                "update_by_uri": "/evenement/<uri> (PUT)",
                "delete_by_id": "/evenement/id/<id> (DELETE)",
                "delete_by_uri": "/evenement/<uri> (DELETE)"
            },
            "search": {
                "by_name": "/search/name/<name>",
                "eco_hebergements": "/search/eco-hebergements",
                "bio_products": "/search/bio-products",
                "zero_emission": "/search/zero-emission-transport"
            },
            "ai": {
                "help": "/ai/help (GET)",
                "chat": "/ai/chat (POST)",
                "ask": "/ai/ask (POST)",
                "sparql": "/ai/sparql (POST)",
                "recommend": "/ai/recommend-activities (POST)"
            }
        },
        "documentation": "https://github.com/your-repo/docs"
    })

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
        nom=data.get('nom'),
        age=data.get('age'),
        nationalite=data.get('nationalite'),
        sejourne_dans=data.get('sejourne_dans'),
        participe_a=data.get('participe_a', []),
        se_deplace_par=data.get('se_deplace_par', [])
    )
    result = manager.create(touriste)
    if result.get('success'):
        result['uri'] = touriste.uri
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

def parse_certifications(results):
    certs = []
    cert_dict = {}
    for res in results:
        uri = res['s']['value']
        prop = res['p']['value'].split('#')[-1]
        val = res['o']['value']

        if uri not in cert_dict:
            cert_dict[uri] = {"uri": uri, "id": None, "label_nom": None, "organisme": None, "annee_obtention": None}

        if prop == "id":
            cert_dict[uri]["id"] = int(val)
        elif prop == "labelNom":
            cert_dict[uri]["label_nom"] = val
        elif prop == "organisme":
            cert_dict[uri]["organisme"] = val
        elif prop == "anneeObtention":
            cert_dict[uri]["annee_obtention"] = val

    # Convert dict to list
    for uri, data in cert_dict.items():
        certs.append(data)
    
    return certs

# CERTIFICATION ECO
@app.route('/certification', methods=['POST'])
def create_certification():
    data = request.json
    cert = CertificationEco(
        label_nom=data.get('label_nom'),
        organisme=data.get('organisme'),
        annee_obtention=data.get('annee_obtention')
    )
    result = manager.create(cert)
    if result.get('success'):
        result['uri'] = cert.uri
    return jsonify(result)

@app.route('/certification', methods=['GET'])
def get_all_certifications():
    results = manager.get_all('CertificationEco')
    parsed = parse_certifications(results)
    return jsonify(parsed)



@app.route('/certification/id/<int:cert_id>', methods=['GET'])
def get_certification_by_id(cert_id):
    """Get certification by numeric ID"""
    # Query to find certification by ID
    query = f"""
    PREFIX eco: <{NAMESPACE}>
    
    SELECT ?uri ?p ?o
    WHERE {{
        ?uri a eco:CertificationEco .
        ?uri eco:id {cert_id} .
        ?uri ?p ?o .
    }}
    """
    results = manager.execute_query(query)
    
    if not results:
        return jsonify({"error": "Certification not found"}), 404
    
    # Parse results into a structured object
    cert = {"uri": None, "id": cert_id, "label_nom": None, "organisme": None, "annee_obtention": None}
    
    for res in results:
        if not cert["uri"]:
            cert["uri"] = res['uri']['value']
        
        prop = res['p']['value'].split('#')[-1]
        val = res['o']['value']
        
        if prop == "labelNom":
            cert["label_nom"] = val
        elif prop == "organisme":
            cert["organisme"] = val
        elif prop == "anneeObtention":
            cert["annee_obtention"] = val
    
    return jsonify(cert)

@app.route('/certification/<path:uri>', methods=['GET'])
def get_certification(uri):
    """Get certification by URI - handles both encoded and non-encoded URIs"""
    from urllib.parse import unquote
    
    # Decode URI in case it's encoded
    decoded_uri = unquote(uri)
    
    # If URI doesn't contain the namespace, it might have been truncated by the # character
    # In this case, return an error with helpful message
    if '#' not in decoded_uri and NAMESPACE.rstrip('#') in decoded_uri:
        return jsonify({
            "error": "Invalid URI format",
            "message": "The URI appears to be truncated. Please encode the URI properly.",
            "example": "Use /certification/id/<id> instead, or encode the full URI",
            "received_uri": decoded_uri
        }), 400
    
    results = manager.get_by_uri(decoded_uri)
    
    # Parse results into a structured object
    if not results:
        return jsonify({
            "error": "Certification not found",
            "message": "No certification found with this URI",
            "uri": decoded_uri,
            "tip": "Try using /certification/id/<id> endpoint or ensure the URI is properly encoded"
        }), 404
    
    cert = {"uri": decoded_uri, "label_nom": None, "organisme": None, "annee_obtention": None}
    for res in results:
        prop = res['p']['value'].split('#')[-1]
        val = res['o']['value']
        
        if prop == "labelNom":
            cert["label_nom"] = val
        elif prop == "organisme":
            cert["organisme"] = val
        elif prop == "anneeObtention":
            cert["annee_obtention"] = val
        elif prop == "id":
            cert["id"] = int(val)
    
    return jsonify(cert)

@app.route('/certification/id/<int:cert_id>', methods=['PUT'])
def update_certification_by_id(cert_id):
    """Update certification by numeric ID"""
    data = request.json
    
    # First, find the URI for this ID
    query = f"""
    PREFIX eco: <{NAMESPACE}>
    
    SELECT ?uri
    WHERE {{
        ?uri a eco:CertificationEco .
        ?uri eco:id {cert_id} .
    }}
    """
    results = manager.execute_query(query)
    
    if not results:
        return jsonify({"error": "Certification not found"}), 404
    
    uri = results[0]['uri']['value']
    
    # Delete old data
    manager.delete(uri)
    
    # Create new data with same URI and ID
    cert = CertificationEco(
        uri=uri,
        label_nom=data.get('label_nom'),
        organisme=data.get('organisme'),
        annee_obtention=data.get('annee_obtention')
    )
    # Restore the original ID
    cert.id = cert_id
    
    result = manager.create(cert)
    if result.get('success'):
        result['uri'] = uri
        result['id'] = cert_id
    
    return jsonify(result)

@app.route('/certification/<path:uri>', methods=['PUT'])
def update_certification(uri):
    """Update certification by URI - handles both encoded and non-encoded URIs"""
    from urllib.parse import unquote
    
    data = request.json
    
    # Decode URI in case it's encoded
    decoded_uri = unquote(uri)
    
    # Check if URI is valid
    if '#' not in decoded_uri and NAMESPACE.rstrip('#') in decoded_uri:
        return jsonify({
            "error": "Invalid URI format",
            "message": "The URI appears to be truncated. Please encode the URI properly.",
            "example": "Use /certification/id/<id> instead, or encode the full URI",
            "received_uri": decoded_uri
        }), 400
    
    # Delete old data
    delete_result = manager.delete(decoded_uri)
    
    # Create new data with same URI
    cert = CertificationEco(
        uri=decoded_uri,
        label_nom=data.get('label_nom'),
        organisme=data.get('organisme'),
        annee_obtention=data.get('annee_obtention')
    )
    result = manager.create(cert)
    
    if result.get('success'):
        result['uri'] = decoded_uri
    
    return jsonify(result)

@app.route('/certification/id/<int:cert_id>', methods=['DELETE'])
def delete_certification_by_id(cert_id):
    """Delete certification by numeric ID"""
    # First, find the URI for this ID
    query = f"""
    PREFIX eco: <{NAMESPACE}>
    
    SELECT ?uri
    WHERE {{
        ?uri a eco:CertificationEco .
        ?uri eco:id {cert_id} .
    }}
    """
    results = manager.execute_query(query)
    
    if not results:
        return jsonify({"error": "Certification not found"}), 404
    
    uri = results[0]['uri']['value']
    result = manager.delete(uri)
    
    if result.get('success'):
        result['deleted_uri'] = uri
        result['deleted_id'] = cert_id
    
    return jsonify(result)

@app.route('/certification/<path:uri>', methods=['DELETE'])
def delete_certification(uri):
    """Delete certification by URI - handles both encoded and non-encoded URIs"""
    from urllib.parse import unquote
    
    # Decode URI in case it's encoded
    decoded_uri = unquote(uri)
    
    # Check if URI is valid
    if '#' not in decoded_uri and NAMESPACE.rstrip('#') in decoded_uri:
        return jsonify({
            "error": "Invalid URI format",
            "message": "The URI appears to be truncated. Please encode the URI properly.",
            "example": "Use /certification/id/<id> instead, or encode the full URI",
            "received_uri": decoded_uri
        }), 400
    
    result = manager.delete(decoded_uri)
    
    if result.get('success'):
        result['deleted_uri'] = decoded_uri
    
    return jsonify(result)

def parse_evenements_from_sparql(results):
    evenements_dict = {}

    for result in results:
        uri = result['s']['value']
        predicate = result['p']['value'].split('#')[-1]  # dernier segment
        obj = result['o'].get('value')

        if uri not in evenements_dict:
            evenements_dict[uri] = {'uri': uri, 'id': None}

        # Mapper les propriétés
        if predicate == 'id':
            evenements_dict[uri]['id'] = int(obj)
        elif predicate == 'nom':
            evenements_dict[uri]['nom'] = obj
        elif predicate == 'eventDate':
            evenements_dict[uri]['event_date'] = obj
        elif predicate == 'eventDureeHeures':
            evenements_dict[uri]['event_duree_heures'] = int(obj)
        elif predicate == 'eventPrix':
            evenements_dict[uri]['event_prix'] = float(obj)
        elif predicate == 'aLieuDans':
            evenements_dict[uri]['a_lieu_dans'] = obj

    return list(evenements_dict.values())


# EVENEMENT
@app.route('/evenement', methods=['POST'])
def create_evenement():
    data = request.json
    event = Evenement(
        nom=data.get('nom'),
        event_date=data.get('event_date'),
        event_duree_heures=data.get('event_duree_heures'),
        event_prix=data.get('event_prix'),
        a_lieu_dans=data.get('a_lieu_dans')
    )
    result = manager.create(event)
    if result.get('success'):
        result['uri'] = event.uri
    return jsonify(result)

@app.route('/evenement', methods=['GET'])
def get_all_evenements():
    results = manager.get_all('Evenement')  # retourne les triplets bruts
    evenements = parse_evenements_from_sparql(results)
    return jsonify(evenements)

@app.route('/evenement/id/<int:event_id>', methods=['GET'])
def get_evenement_by_id(event_id):
    """Get evenement by numeric ID"""
    # Query to find evenement by ID
    query = f"""
    PREFIX eco: <{NAMESPACE}>
    
    SELECT ?uri ?p ?o
    WHERE {{
        ?uri a eco:Evenement .
        ?uri eco:id {event_id} .
        ?uri ?p ?o .
    }}
    """
    results = manager.execute_query(query)
    
    if not results:
        return jsonify({"error": "Evenement not found"}), 404
    
    # Parse results into a structured object
    event = {"uri": None, "id": event_id, "nom": None, "event_date": None, "event_duree_heures": None, "event_prix": None, "a_lieu_dans": None}
    
    for res in results:
        if not event["uri"]:
            event["uri"] = res['uri']['value']
        
        prop = res['p']['value'].split('#')[-1]
        val = res['o']['value']
        
        if prop == "nom":
            event["nom"] = val
        elif prop == "eventDate":
            event["event_date"] = val
        elif prop == "eventDureeHeures":
            event["event_duree_heures"] = int(val)
        elif prop == "eventPrix":
            event["event_prix"] = float(val)
        elif prop == "aLieuDans":
            event["a_lieu_dans"] = val
    
    return jsonify(event)

@app.route('/evenement/<path:uri>', methods=['GET'])
def get_evenement(uri):
    """Get evenement by URI - handles both encoded and non-encoded URIs"""
    from urllib.parse import unquote
    
    # Decode URI in case it's encoded
    decoded_uri = unquote(uri)
    
    # If URI doesn't contain the namespace, it might have been truncated by the # character
    if '#' not in decoded_uri and NAMESPACE.rstrip('#') in decoded_uri:
        return jsonify({
            "error": "Invalid URI format",
            "message": "The URI appears to be truncated. Please encode the URI properly.",
            "example": "Use /evenement/id/<id> instead, or encode the full URI",
            "received_uri": decoded_uri
        }), 400
    
    results = manager.get_by_uri(decoded_uri)
    
    # Parse results into a structured object
    if not results:
        return jsonify({
            "error": "Evenement not found",
            "message": "No evenement found with this URI",
            "uri": decoded_uri,
            "tip": "Try using /evenement/id/<id> endpoint or ensure the URI is properly encoded"
        }), 404
    
    event = {"uri": decoded_uri, "nom": None, "event_date": None, "event_duree_heures": None, "event_prix": None, "a_lieu_dans": None}
    for res in results:
        prop = res['p']['value'].split('#')[-1]
        val = res['o']['value']
        
        if prop == "nom":
            event["nom"] = val
        elif prop == "eventDate":
            event["event_date"] = val
        elif prop == "eventDureeHeures":
            event["event_duree_heures"] = val
        elif prop == "eventPrix":
            event["event_prix"] = val
        elif prop == "aLieuDans":
            event["a_lieu_dans"] = val
        elif prop == "id":
            event["id"] = int(val)
    
    return jsonify(event)

@app.route('/evenement/id/<int:event_id>', methods=['PUT'])
def update_evenement_by_id(event_id):
    """Update evenement by numeric ID"""
    data = request.json
    
    # First, find the URI for this ID
    query = f"""
    PREFIX eco: <{NAMESPACE}>
    
    SELECT ?uri
    WHERE {{
        ?uri a eco:Evenement .
        ?uri eco:id {event_id} .
    }}
    """
    results = manager.execute_query(query)
    
    if not results:
        return jsonify({"error": "Evenement not found"}), 404
    
    uri = results[0]['uri']['value']
    
    # Delete old data
    manager.delete(uri)
    
    # Create new data with same URI and ID
    event = Evenement(
        uri=uri,
        nom=data.get('nom'),
        event_date=data.get('event_date'),
        event_duree_heures=data.get('event_duree_heures'),
        event_prix=data.get('event_prix'),
        a_lieu_dans=data.get('a_lieu_dans')
    )
    # Restore the original ID
    event.id = event_id
    
    result = manager.create(event)
    if result.get('success'):
        result['uri'] = uri
        result['id'] = event_id
    
    return jsonify(result)

@app.route('/evenement/<path:uri>', methods=['PUT'])
def update_evenement(uri):
    """Update evenement by URI - handles both encoded and non-encoded URIs"""
    from urllib.parse import unquote
    
    data = request.json
    
    # Decode URI in case it's encoded
    decoded_uri = unquote(uri)
    
    # Check if URI is valid
    if '#' not in decoded_uri and NAMESPACE.rstrip('#') in decoded_uri:
        return jsonify({
            "error": "Invalid URI format",
            "message": "The URI appears to be truncated. Please encode the URI properly.",
            "example": "Use /evenement/id/<id> instead, or encode the full URI",
            "received_uri": decoded_uri
        }), 400
    
    # Delete old data
    manager.delete(decoded_uri)
    
    # Create new data with same URI
    event = Evenement(
        uri=decoded_uri,
        nom=data.get('nom'),
        event_date=data.get('event_date'),
        event_duree_heures=data.get('event_duree_heures'),
        event_prix=data.get('event_prix'),
        a_lieu_dans=data.get('a_lieu_dans')
    )
    result = manager.create(event)
    
    if result.get('success'):
        result['uri'] = decoded_uri
    
    return jsonify(result)

@app.route('/evenement/id/<int:event_id>', methods=['DELETE'])
def delete_evenement_by_id(event_id):
    """Delete evenement by numeric ID"""
    # First, find the URI for this ID
    query = f"""
    PREFIX eco: <{NAMESPACE}>
    
    SELECT ?uri
    WHERE {{
        ?uri a eco:Evenement .
        ?uri eco:id {event_id} .
    }}
    """
    results = manager.execute_query(query)
    
    if not results:
        return jsonify({"error": "Evenement not found"}), 404
    
    uri = results[0]['uri']['value']
    result = manager.delete(uri)
    
    if result.get('success'):
        result['deleted_uri'] = uri
        result['deleted_id'] = event_id
    
    return jsonify(result)

@app.route('/evenement/<path:uri>', methods=['DELETE'])
def delete_evenement(uri):
    """Delete evenement by URI - handles both encoded and non-encoded URIs"""
    from urllib.parse import unquote
    
    # Decode URI in case it's encoded
    decoded_uri = unquote(uri)
    
    # Check if URI is valid
    if '#' not in decoded_uri and NAMESPACE.rstrip('#') in decoded_uri:
        return jsonify({
            "error": "Invalid URI format",
            "message": "The URI appears to be truncated. Please encode the URI properly.",
            "example": "Use /evenement/id/<id> instead, or encode the full URI",
            "received_uri": decoded_uri
        }), 400
    
    result = manager.delete(decoded_uri)
    
    if result.get('success'):
        result['deleted_uri'] = decoded_uri
    
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
    try:
        # Get JSON data with UTF-8 support
        data = request.get_json(force=True)
        message = data.get('message', '')
        
        print(f"[AI Chat] Received message: {message}")
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        response = ai_agent.chat_message(message)
        print(f"[AI Chat] Response generated: {len(response)} chars")
        
        return jsonify({"response": response}), 200
    except Exception as e:
        print(f"[AI Chat] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

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
    Generate SPARQL query from natural language
    Body: {"query": "Find all eco-friendly hotels"}
    """
    try:
        data = request.json
        query = data.get('query', '')
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        result = ai_agent.generate_sparql(query)
        return jsonify(result)
    except Exception as e:
        print(f"Error in /ai/sparql: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/ai/recommend-activities', methods=['POST'])
def ai_recommend_activities():
    """
    Get AI-powered activity recommendations
    Body: {
        "age": 30,
        "nationalite": "France",
        "preferences": ["nature", "écologie"],
        "budget_min": 500,
        "budget_max": 2000
    }
    """
    try:
        data = request.json
        result = ai_agent.recommend_activities(data)
        return jsonify({"recommendations": result})
    except Exception as e:
        print(f"Error in /ai/recommend-activities: {str(e)}")
        return jsonify({"error": str(e)}), 500

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
    try:
        ai_agent.reset_chat()
        return jsonify({"message": "Chat session reset successfully", "status": "success"})
    except Exception as e:
        print(f"Error in /ai/reset: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/ai/analyze-video', methods=['POST', 'OPTIONS'])
def analyze_video():
    """Analyse une vidéo avec audio pour détecter l'ambiance et recommander des événements"""
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    try:
        # Get user message if provided
        user_message = request.form.get('message', '')
        
        # Vérifier si un fichier vidéo est présent
        if 'video' not in request.files:
            return jsonify({"error": "Aucun fichier vidéo fourni"}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({"error": "Nom de fichier vide"}), 400
        
        # Créer un répertoire temporaire pour stocker la vidéo
        import tempfile
        import os
        
        temp_dir = tempfile.mkdtemp()
        # Support multiple video formats
        file_ext = os.path.splitext(video_file.filename)[1] or '.webm'
        video_path = os.path.join(temp_dir, f'recording{file_ext}')
        
        # Sauvegarder le fichier vidéo temporairement
        video_file.save(video_path)
        app.logger.info(f"Vidéo sauvegardée: {video_path}, taille: {os.path.getsize(video_path)} bytes")
        
        # Use the AISalhi agent method for video analysis
        analysis_result = ai_agent.analyze_video_vibe(video_path, user_message)
        
        # Nettoyer le fichier temporaire
        try:
            os.remove(video_path)
            os.rmdir(temp_dir)
        except Exception as e:
            app.logger.warning(f"Impossible de supprimer le fichier temporaire: {e}")
        
        # Check for errors in analysis
        if 'error' in analysis_result:
            app.logger.error(f"Erreur d'analyse IA: {analysis_result['error']}")
            return jsonify({
                "error": analysis_result['error'],
                "vibe_analysis": {
                    "mood": "unknown",
                    "keywords": [],
                    "visual_description": "Erreur lors de l'analyse"
                },
                "event_recommendations": []
            }), 500
        
        app.logger.info("Analyse vidéo terminée avec succès")
        return jsonify(analysis_result), 200
        
    except Exception as e:
        app.logger.error(f"Erreur lors de l'analyse vidéo: {str(e)}")
        import traceback
        app.logger.error(traceback.format_exc())
        return jsonify({
            "error": f"Erreur lors de l'analyse: {str(e)}",
            "vibe_analysis": {
                "mood": "error",
                "keywords": ["erreur", "analyse"],
                "visual_description": f"Une erreur s'est produite: {str(e)}"
            },
            "event_recommendations": [],
            "full_analysis": f"Erreur: {str(e)}"
        }), 500

@app.route('/ai/help', methods=['GET'])
def ai_help():
    """Get AI capabilities and usage instructions"""
    return jsonify({
        "name": "AISalhi",
        "version": "1.0.0",
        "description": "Intelligent Eco-Tourism Assistant powered by advanced AI",
        "capabilities": [
            "Natural language conversation about eco-tourism",
            "Generate SPARQL queries from natural language",
            "Personalized activity recommendations",
            "Eco-friendliness score calculation",
            "Interactive chat with context memory",
            "Knowledge base exploration",
            "Video and audio analysis for vibe detection and event recommendations"
        ],
        "endpoints": {
            "POST /ai/chat": "Interactive chat (can execute actions)",
            "POST /ai/ask": "Simple question-answer",
            "POST /ai/sparql": "Execute SPARQL with AI explanation",
            "POST /ai/recommend-activities": "Get activity recommendations",
            "POST /ai/analyze-video": "Analyze video/audio for vibe detection and event recommendations",
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

