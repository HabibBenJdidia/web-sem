"""
Simplified Flask app for testing AI BSila WITHOUT Fuseki
Only AI BSila endpoints are active
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Mock SPARQL Manager
class MockSPARQLManager:
    def execute_query(self, query):
        # Return mock restaurant data
        if "Restaurant" in query and "RestaurantEco" not in query:
            return [
                {
                    'restaurant': {'value': 'http://example.org/eco-tourism#Restaurant_1'},
                    'nom': {'value': 'Le Jardin Bio'},
                    'destination': {'value': 'http://example.org/eco-tourism#Ville_1'}
                },
                {
                    'restaurant': {'value': 'http://example.org/eco-tourism#Restaurant_2'},
                    'nom': {'value': 'La Table Verte'}
                }
            ]
        elif "RestaurantEco" in query:
            return [
                {
                    'restaurant': {'value': 'http://example.org/eco-tourism#RestaurantEco_1'},
                    'nom': {'value': 'Restaurant Écologique'}
                }
            ]
        elif "ProduitLocalBio" in query or "bio true" in query.lower():
            return [
                {
                    'produit': {'value': 'http://example.org/eco-tourism#ProduitLocalBio_1'},
                    'nom': {'value': 'Tomates Bio'},
                    'saison': {'value': 'Été'}
                }
            ]
        elif "ProduitLocal" in query:
            return [
                {
                    'produit': {'value': 'http://example.org/eco-tourism#ProduitLocal_1'},
                    'nom': {'value': 'Tomates locales'},
                    'saison': {'value': 'Été'},
                    'bio': {'value': 'true'}
                }
            ]
        return []

# Initialize mock manager
manager = MockSPARQLManager()

# Initialize AI BSila with mock manager
from ai.aiBSila import AIBSilaAgent
bsila_agent = AIBSilaAgent(manager)

print("=" * 60)
print("🎤 AI BSila Test Server Starting...")
print("=" * 60)
print("Using MOCK data (no Fuseki required)")
print("API Key:", os.getenv('GEMINI_API_KEY', 'Not set')[:20] + "...")
print("=" * 60)

# Health check
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "AI BSila Test Server"})

# AI BSILA ENDPOINTS
@app.route('/ai-bsila/voice-query', methods=['POST'])
def bsila_voice_query():
    try:
        data = request.get_json()
        user_query = data.get('query')
        
        if not user_query:
            return jsonify({"error": "Query is required"}), 400
        
        result = bsila_agent.process_voice_query(user_query)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/restaurants', methods=['GET'])
def bsila_get_restaurants():
    try:
        result = bsila_agent.get_restaurants()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/restaurants/eco', methods=['GET'])
def bsila_get_eco_restaurants():
    try:
        result = bsila_agent.get_eco_restaurants()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/products', methods=['GET'])
def bsila_get_products():
    try:
        result = bsila_agent.get_local_products()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/products/bio', methods=['GET'])
def bsila_get_bio_products():
    try:
        result = bsila_agent.get_bio_products()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/products/season/<season>', methods=['GET'])
def bsila_get_products_by_season(season):
    try:
        result = bsila_agent.get_products_by_season(season)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/restaurant-products', methods=['GET'])
def bsila_get_restaurant_products():
    try:
        restaurant_name = request.args.get('restaurant')
        result = bsila_agent.get_restaurant_products(restaurant_name)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/reset', methods=['POST'])
def bsila_reset():
    try:
        result = bsila_agent.reset_chat()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-bsila/help', methods=['GET'])
def bsila_help():
    return jsonify({
        "name": "AI BSila Test Server",
        "description": "Voice assistant with MOCK data (no Fuseki)",
        "endpoints": {
            "POST /ai-bsila/voice-query": "Main voice query",
            "GET /ai-bsila/restaurants": "Get restaurants",
            "GET /ai-bsila/restaurants/eco": "Get eco restaurants",
            "GET /ai-bsila/products": "Get products",
            "GET /ai-bsila/products/bio": "Get bio products",
        }
    })

if __name__ == '__main__':
    print("\n✅ Server ready at http://localhost:8000")
    print("🎤 AI BSila endpoints active")
    print("📝 Test: http://localhost:8000/ai-bsila/help\n")
    app.run(host='0.0.0.0', port=8000, debug=True)




