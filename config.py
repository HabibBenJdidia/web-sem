import os
from dotenv import load_dotenv

load_dotenv()

FUSEKI_URL = os.getenv('FUSEKI_URL', 'http://localhost:3030/ecotourism')
FUSEKI_QUERY_ENDPOINT = f"{FUSEKI_URL}/query"
FUSEKI_UPDATE_ENDPOINT = f"{FUSEKI_URL}/update"
FUSEKI_DATA_ENDPOINT = f"{FUSEKI_URL}/data"
FUSEKI_USER = os.getenv('FUSEKI_USER', 'admin')
FUSEKI_PASSWORD = os.getenv('FUSEKI_PASSWORD', 'admin')

NAMESPACE = "http://example.org/eco-tourism#"

# AI Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Transport Pricing Configuration (Realistic pricing model)
TRANSPORT_PRICING = {
    # Base price (€) - fixed cost per trip
    'base_prices': {
        'Vélo': 0.0,
        'Marche': 0.0,
        'TransportNonMotorise': 0.0,
        'Vélo Électrique': 1.5,
        'Trottinette Électrique': 1.0,
        'Métro': 1.9,
        'Tramway': 1.7,
        'Train': 2.5,
        'Bus': 1.5,
        'Bus Électrique': 2.0,
        'EcoTransport': 2.0,
        'Transport': 2.0,
        'Moto': 0.0,
        'Voiture': 0.0,
        'Voiture Hybride': 0.0,
        'Voiture Diesel': 0.0,
        '4x4': 0.0,
        'Bateau': 15.0,
        'Avion': 50.0,
        'Hélicoptère': 200.0,
    },
    # Price per km (€/km) - variable cost based on distance
    'price_per_km': {
        'Vélo': 0.0,
        'Marche': 0.0,
        'TransportNonMotorise': 0.0,
        'Vélo Électrique': 0.15,
        'Trottinette Électrique': 0.20,
        'Métro': 0.10,
        'Tramway': 0.10,
        'Train': 0.15,
        'Bus': 0.12,
        'Bus Électrique': 0.10,
        'EcoTransport': 0.10,
        'Transport': 0.15,
        'Moto': 0.08,  # Fuel cost
        'Voiture': 0.12,
        'Voiture Hybride': 0.09,
        'Voiture Diesel': 0.10,
        '4x4': 0.18,
        'Bateau': 2.50,
        'Avion': 0.80,
        'Hélicoptère': 15.0,
    },
    # Carbon tax rate (€ per kg of CO2)
    'carbon_tax_per_kg': 0.08,  # EU average ~80€/ton
}