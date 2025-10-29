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

# Helper function to parse SPARQL SELECT results into user objects
def parse_users_from_query_results(results):
    """Parse SPARQL SELECT query results into structured user objects (OPTIMIZED)"""
    users_dict = {}
    
    for result in results:
        user_uri = result.get('user', {}).get('value', '')
        
        if user_uri not in users_dict:
            users_dict[user_uri] = {
                'uri': user_uri,
                'nom': None,
                'email': None,
                'age': None,
                'nationalite': None,
                'type': None
            }
        
        # Get user properties from SELECT columns
        if result.get('nom'):
            users_dict[user_uri]['nom'] = result['nom'].get('value')
        
        if result.get('email'):
            users_dict[user_uri]['email'] = result['email'].get('value')
        
        if result.get('age'):
            age_value = result['age'].get('value')
            users_dict[user_uri]['age'] = age_value
        
        if result.get('nationalite'):
            users_dict[user_uri]['nationalite'] = result['nationalite'].get('value')
        
        if result.get('type'):
            type_uri = result['type'].get('value')
            # Extract type name from URI (e.g., "http://example.org/eco-tourism#Touriste" -> "Touriste")
            if '#' in type_uri:
                users_dict[user_uri]['type'] = type_uri.split('#')[1]
    
    return list(users_dict.values())

# Legacy helper function (kept for backward compatibility if needed)
def parse_users_from_sparql(results):
    """Parse SPARQL triple results into structured user objects (LEGACY)"""
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

def parse_transports_from_query_results(results):
    """Parse SPARQL SELECT query results into structured transport objects with empreinte data"""
    from models.empreinte_carbone import EmpreinteCarbone
    
    transports_dict = {}
    
    for result in results:
        transport_uri = result.get('transport', {}).get('value', '')
        
        if transport_uri not in transports_dict:
            transports_dict[transport_uri] = {
                'uri': transport_uri,
                'nom': None,
                'type': None,
                'emission_co2_per_km': None,
                'empreinte': None
            }
        
        # Get transport properties
        if result.get('nom'):
            transports_dict[transport_uri]['nom'] = result['nom'].get('value')
        
        if result.get('type'):
            transports_dict[transport_uri]['type'] = result['type'].get('value')
        
        if result.get('emission'):
            emission_value = result['emission'].get('value')
            transports_dict[transport_uri]['emission_co2_per_km'] = float(emission_value) if emission_value else 0.0
        
        # Get empreinte data if present
        if result.get('empreinteURI') and result.get('valeurCO2kg'):
            empreinte_uri = result['empreinteURI'].get('value')
            valeur_co2_kg_str = result['valeurCO2kg'].get('value')
            valeur_co2_kg = float(valeur_co2_kg_str) if valeur_co2_kg_str else 0.0
            
            transports_dict[transport_uri]['empreinte'] = {
                'uri': empreinte_uri,
                'valeur_co2_kg': valeur_co2_kg,
                'is_faible': valeur_co2_kg <= 1.0,
                'category': EmpreinteCarbone.get_category(valeur_co2_kg),
                'category_color': EmpreinteCarbone.get_category_color(valeur_co2_kg)
            }
    
    return list(transports_dict.values())

def parse_transports_from_sparql(results):
    """Parse SPARQL triple results into structured transport objects with empreinte data (legacy)"""
    from models.empreinte_carbone import EmpreinteCarbone
    
    transports_dict = {}
    empreintes_dict = {}
    
    for result in results:
        uri = result.get('s', {}).get('value', '')
        predicate = result.get('p', {}).get('value', '')
        obj = result.get('o', {}).get('value', '')
        
        # Extract property name from URI
        if '#' in predicate:
            prop_name = predicate.split('#')[1]
            
            # Check if this is an EmpreinteCarbone entity
            if 'Empreinte_' in uri:
                if uri not in empreintes_dict:
                    empreintes_dict[uri] = {'uri': uri}
                
                if prop_name == 'valeurCO2kg':
                    empreintes_dict[uri]['valeur_co2_kg'] = float(obj) if obj else 0.0
                elif prop_name == 'type' and 'EmpreinteCarboneFaible' in obj:
                    empreintes_dict[uri]['is_faible'] = True
            else:
                # This is a Transport entity
                if uri not in transports_dict:
                    transports_dict[uri] = {'uri': uri}
                
                # Get the type property value (stored as string in RDF)
                if prop_name == 'type':
                    transports_dict[uri]['type'] = obj
                elif prop_name in ['nom', 'emissionCO2PerKm', 'aEmpreinte']:
                    if prop_name == 'emissionCO2PerKm':
                        transports_dict[uri]['emission_co2_per_km'] = float(obj) if obj else 0.0
                    elif prop_name == 'aEmpreinte':
                        transports_dict[uri]['a_empreinte'] = obj
                    else:
                        transports_dict[uri][prop_name] = obj
    
    # Enrich transports with empreinte data
    for transport in transports_dict.values():
        if transport.get('a_empreinte') and transport['a_empreinte'] in empreintes_dict:
            empreinte_data = empreintes_dict[transport['a_empreinte']]
            transport['empreinte'] = {
                'uri': empreinte_data.get('uri'),
                'valeur_co2_kg': empreinte_data.get('valeur_co2_kg', 0.0),
                'is_faible': empreinte_data.get('is_faible', False),
                'category': EmpreinteCarbone.get_category(empreinte_data.get('valeur_co2_kg')),
                'category_color': EmpreinteCarbone.get_category_color(empreinte_data.get('valeur_co2_kg'))
            }
    
    return list(transports_dict.values())

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
    """Get all users (Touristes and Guides) in a structured format - OPTIMIZED"""
    try:
        # Custom SPARQL query to get both Touristes and Guides in ONE query
        query = f"""
        PREFIX eco: <{NAMESPACE}>
        SELECT ?user ?nom ?email ?age ?nationalite ?type WHERE {{
            ?user a ?type .
            FILTER (?type = eco:Touriste || ?type = eco:Guide)
            OPTIONAL {{ ?user eco:nom ?nom . }}
            OPTIONAL {{ ?user eco:email ?email . }}
            OPTIONAL {{ ?user eco:age ?age . }}
            OPTIONAL {{ ?user eco:nationalite ?nationalite . }}
        }}
        """
        
        results = manager.execute_query(query)
        users = parse_users_from_query_results(results)
        
        return jsonify({
            'users': users,
            'total': len(users)
        })
    except Exception as e:
        print(f"Error in get_all_users: {str(e)}")
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

@app.route('/guide/<path:uri>', methods=['PUT'])
def update_guide(uri):
    data = request.json
    results = []
    for key, value in data.items():
        result = manager.update_property(uri, key, value, isinstance(value, str))
        results.append(result)
    return jsonify({"updates": results})

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
    """Get all transports in a structured format with empreinte data"""
    try:
        # Custom SPARQL query to get transports WITH empreinte data
        query = f"""
        PREFIX eco: <{NAMESPACE}>
        SELECT ?transport ?nom ?type ?emission ?empreinteURI ?valeurCO2kg WHERE {{
            ?transport a eco:Transport .
            OPTIONAL {{ ?transport eco:nom ?nom . }}
            OPTIONAL {{ ?transport eco:type ?type . }}
            OPTIONAL {{ ?transport eco:emissionCO2PerKm ?emission . }}
            OPTIONAL {{ 
                ?transport eco:aEmpreinte ?empreinteURI .
                ?empreinteURI eco:valeurCO2kg ?valeurCO2kg .
            }}
        }}
        """
        
        results = manager.execute_query(query)
        transports = parse_transports_from_query_results(results)
        
        # Add pricing info to each transport
        for transport_data in transports:
            transport = Transport(
                uri=transport_data['uri'],
                nom=transport_data.get('nom'),
                type_=transport_data.get('type'),
                emission_co2_per_km=transport_data.get('emission_co2_per_km')
            )
            transport_data['price_per_km'] = transport.get_price_per_km()
        
        return jsonify({
            'transports': transports,
            'total': len(transports)
        })
    except Exception as e:
        print(f"Error in get_all_transports: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/transport/<path:uri>', methods=['PUT'])
def update_transport(uri):
    data = request.json
    # Delete existing entity
    manager.delete(uri)
    # Create updated entity
    trans = Transport(
        uri=uri,
        nom=data.get('nom'),
        type_=data.get('type'),
        emission_co2_per_km=data.get('emission_co2_per_km')
    )
    result = manager.create(trans)
    return jsonify(result)

@app.route('/transport/<path:uri>', methods=['DELETE'])
def delete_transport(uri):
    result = manager.delete(uri)
    return jsonify(result)

@app.route('/transport/calculate-price', methods=['POST'])
def calculate_transport_price():
    """
    Calculate trip price for a transport
    Request body: { "transport_type": "Train", "emission_co2_per_km": 30, "distance_km": 100 }
    """
    try:
        data = request.json
        transport_type = data.get('transport_type')
        emission_co2 = data.get('emission_co2_per_km', 0)
        distance = data.get('distance_km', 0)
        
        if not transport_type or distance <= 0:
            return jsonify({'error': 'transport_type and distance_km required'}), 400
        
        transport = Transport(type_=transport_type, emission_co2_per_km=emission_co2)
        price_breakdown = transport.calculate_price(distance)
        
        return jsonify({
            'transport_type': transport_type,
            'pricing': price_breakdown
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/transport/compare-prices', methods=['POST'])
def compare_transport_prices():
    """
    Compare prices for multiple transports
    Request body: { "transports": [{"type": "Train", "emission": 30}, ...], "distance_km": 100 }
    """
    try:
        data = request.json
        transports_data = data.get('transports', [])
        distance = data.get('distance_km', 0)
        
        if not transports_data or distance <= 0:
            return jsonify({'error': 'transports array and distance_km required'}), 400
        
        comparisons = []
        for t_data in transports_data:
            transport = Transport(
                type_=t_data.get('type'),
                emission_co2_per_km=t_data.get('emission', 0)
            )
            price = transport.calculate_price(distance)
            comparisons.append({
                'type': t_data.get('type'),
                'pricing': price
            })
        
        # Sort by total price
        comparisons.sort(key=lambda x: x['pricing']['total'])
        
        return jsonify({
            'distance_km': distance,
            'comparisons': comparisons,
            'cheapest': comparisons[0] if comparisons else None,
            'most_expensive': comparisons[-1] if comparisons else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

@app.route('/restaurant/<path:uri>', methods=['GET'])
def get_restaurant(uri):
    """Get a single restaurant by URI"""
    query = f"""
        PREFIX ns: <{NAMESPACE}>
        SELECT ?p ?o WHERE {{
            <{uri}> ?p ?o .
        }}
    """
    result = manager.execute_query(query)
    return jsonify(result)

@app.route('/restaurant/<path:uri>', methods=['PUT'])
def update_restaurant(uri):
    """Update a restaurant"""
    data = request.json
    updates = {}
    if 'nom' in data:
        updates['nom'] = data['nom']
    if 'situe_dans' in data:
        updates['situe_dans'] = data['situe_dans']
    if 'sert' in data:
        updates['sert'] = data['sert']
    
    for key, value in updates.items():
        result = manager.update_property(uri, key, value, is_string=(key in ['nom']))
        if result.get('error'):
            return jsonify(result), 500
    
    return jsonify({"message": "Restaurant updated successfully", "uri": uri})

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

@app.route('/produit/<path:uri>', methods=['GET'])
def get_produit(uri):
    """Get a single product by URI"""
    query = f"""
        PREFIX ns: <{NAMESPACE}>
        SELECT ?p ?o WHERE {{
            <{uri}> ?p ?o .
        }}
    """
    result = manager.execute_query(query)
    return jsonify(result)

@app.route('/produit/<path:uri>', methods=['PUT'])
def update_produit(uri):
    """Update a product"""
    data = request.json
    updates = {}
    if 'nom' in data:
        updates['nom'] = data['nom']
    if 'saison' in data:
        updates['saison'] = data['saison']
    if 'bio' in data:
        updates['bio'] = data['bio']
    
    for key, value in updates.items():
        result = manager.update_property(uri, key, value, is_string=(key in ['nom', 'saison']))
        if result.get('error'):
            return jsonify(result), 500
    
    return jsonify({"message": "Product updated successfully", "uri": uri})

@app.route('/produit/<path:uri>', methods=['DELETE'])
def delete_produit(uri):
    result = manager.delete(uri)
    return jsonify(result)

# Aliases pour /produit-local (compatibilité frontend)
@app.route('/produit-local', methods=['POST'])
def create_produit_local():
    return create_produit()

@app.route('/produit-local', methods=['GET'])
def get_all_produits_local():
    return get_all_produits()

@app.route('/produit-local/<path:uri>', methods=['GET'])
def get_produit_local(uri):
    return get_produit(uri)

@app.route('/produit-local/<path:uri>', methods=['PUT'])
def update_produit_local(uri):
    return update_produit(uri)

@app.route('/produit-local/<path:uri>', methods=['DELETE'])
def delete_produit_local(uri):
    return delete_produit(uri)

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
                "message": "You already have a reservation at this time"
            }), 409
        
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
            }), 409
        
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
            SELECT ?p ?o WHERE {{
                <{uri}> ?p ?o .
            }}
        """
        results = manager.execute_query(query)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reservations-restaurant/touriste/<path:touriste_uri>', methods=['GET'])
def get_touriste_reservations(touriste_uri):
    """Get all reservations for a tourist"""
    try:
        query = f"""
            PREFIX ns: <{NAMESPACE}>
            SELECT ?s ?p ?o WHERE {{
                ?s a ns:ReservationRestaurant .
                ?s ns:reservePar <{touriste_uri}> .
                ?s ?p ?o .
            }}
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
    """Update reservation status"""
    try:
        data = request.json
        new_status = data.get('statut')
        
        if not new_status:
            return jsonify({"error": "Missing 'statut' field"}), 400
        
        valid_statuses = ['en_attente', 'confirmee', 'annulee']
        if new_status not in valid_statuses:
            return jsonify({"error": f"Invalid status. Must be one of: {valid_statuses}"}), 400
        
        result = manager.update_property(uri, 'statut', new_status, is_string=True)
        
        if result.get('error'):
            return jsonify({"error": result['error']}), 500
        
        return jsonify({"message": "Reservation status updated", "statut": new_status})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reservation-restaurant/<path:uri>', methods=['DELETE'])
def delete_reservation(uri):
    """Delete a reservation"""
    try:
        result = manager.delete(uri)
        
        if result.get('error'):
            return jsonify({"error": result['error']}), 500
        
        return jsonify({"message": "Reservation deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== AI BSILA VOICE ASSISTANT ENDPOINTS ====================

@app.route('/ai-bsila/voice-query', methods=['POST'])
def bsila_voice_query():
    """AI BSila Voice Query - Main endpoint"""
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
    """Convert audio to text using ElevenLabs"""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Audio file is required"}), 400
        
        audio_file = request.files['audio']
        result = bsila_agent.speech_to_text(audio_file)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/restaurants', methods=['GET'])
def bsila_get_restaurants():
    """Get all restaurants with voice response"""
    try:
        result = bsila_agent.get_restaurants()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/restaurants/eco', methods=['GET'])
def bsila_get_eco_restaurants():
    """Get ecological restaurants"""
    try:
        result = bsila_agent.get_eco_restaurants()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/products', methods=['GET'])
def bsila_get_products():
    """Get all local products"""
    try:
        result = bsila_agent.get_local_products()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/products/bio', methods=['GET'])
def bsila_get_bio_products():
    """Get organic products"""
    try:
        result = bsila_agent.get_bio_products()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/products/season/<season>', methods=['GET'])
def bsila_get_products_by_season(season):
    """Get products by season"""
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

@app.route('/ai-bsila/voices', methods=['GET'])
def bsila_get_voices():
    """Get list of available voices"""
    try:
        result = bsila_agent.get_available_voices()
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

@app.route('/ai-bsila/reset', methods=['POST'])
def bsila_reset():
    """Reset BSila chat session"""
    try:
        result = bsila_agent.reset_chat()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/help', methods=['GET'])
def bsila_help():
    """Get help information about AI BSila"""
    return jsonify({
        "name": "AI BSila Voice Assistant",
        "description": "Assistant vocal intelligent pour restaurants et produits locaux",
        "endpoints": {
            "POST /ai-bsila/voice-query": "Requête vocale principale",
            "POST /ai-bsila/speech-to-text": "Audio vers texte",
            "GET /ai-bsila/restaurants": "Liste tous les restaurants",
            "GET /ai-bsila/restaurants/eco": "Restaurants écologiques",
            "GET /ai-bsila/products": "Tous les produits locaux",
            "GET /ai-bsila/products/bio": "Produits biologiques",
            "GET /ai-bsila/products/season/<season>": "Produits par saison",
            "GET /ai-bsila/restaurant-products": "Produits servis dans un restaurant",
            "GET /ai-bsila/voices": "Liste des voix disponibles",
            "POST /ai-bsila/voice/set": "Changer de voix"
        },
        "features": [
            "Assistant vocal avec 60+ voix ElevenLabs",
            "Recherche par nom, localisation, produit",
            "Réponses duales (vocal + data)",
            "Speech-to-text intégré"
        ]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

