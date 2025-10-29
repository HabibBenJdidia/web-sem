#!/usr/bin/env python3
"""
Script to create sample restaurants in Tabarka with destinations and products
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def create_destination(nom, pays="Tunisie", climat="Mediterraneen"):
    """Create a destination"""
    data = {
        "nom": nom,
        "pays": pays,
        "climat": climat
    }
    response = requests.post(f"{BASE_URL}/destination", json=data)
    print(f"Created destination: {nom}")
    return response.json()

def create_produit(nom, saison="Toute l'annee", bio=True):
    """Create a local product"""
    data = {
        "nom": nom,
        "saison": saison,
        "bio": bio
    }
    response = requests.post(f"{BASE_URL}/produit-local", json=data)
    print(f"Created product: {nom}")
    return response.json()

def create_restaurant(nom, destination_uri, produits_uris=[]):
    """Create a restaurant"""
    data = {
        "nom": nom,
        "situe_dans": destination_uri,
        "sert": produits_uris
    }
    response = requests.post(f"{BASE_URL}/restaurant", json=data)
    print(f"Created restaurant: {nom} in {destination_uri}")
    return response.json()

def get_all_destinations():
    """Get all destinations"""
    response = requests.get(f"{BASE_URL}/destination")
    return response.json()

def get_all_produits():
    """Get all products"""
    response = requests.get(f"{BASE_URL}/produit-local")
    return response.json()

def parse_uri_from_response(data):
    """Extract URI from response data"""
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict) and 's' in item:
                return item['s'].get('value', '')
    return None

def main():
    print("Creating Tabarka restaurants with destinations and products...")
    
    # 1. Create destinations
    print("\nCreating Destinations...")
    # Destinations already exist from clean script, just fetch them
    
    # Get all destinations to find URIs
    all_destinations = get_all_destinations()
    destinations_map = {}
    
    if isinstance(all_destinations, list):
        for item in all_destinations:
            uri = item.get('s', {}).get('value', '')
            if 'Tabarka' in uri or 'nom' in item.get('p', {}).get('value', ''):
                if item.get('o', {}).get('value') in ['Tabarka', 'Tozeur', 'Tunis']:
                    dest_name = item.get('o', {}).get('value')
                    if dest_name not in destinations_map:
                        destinations_map[dest_name] = uri
    
    print(f"Found destinations: {destinations_map}")
    
    # 2. Create products
    print("\nCreating Local Products...")
    huile_olive = create_produit("Huile d'olive de Tabarka", "Toute l'annee", True)
    poisson_frais = create_produit("Poisson frais", "Toute l'annee", False)
    couscous_bio = create_produit("Couscous bio", "Toute l'annee", True)
    dattes = create_produit("Dattes de Tozeur", "Automne", True)
    
    # Get all products to find URIs
    all_products = get_all_produits()
    products_map = {}
    
    if isinstance(all_products, list):
        for item in all_products:
            uri = item.get('s', {}).get('value', '')
            if 'nom' in item.get('p', {}).get('value', ''):
                prod_name = item.get('o', {}).get('value')
                if prod_name and prod_name not in products_map:
                    products_map[prod_name] = uri
    
    print(f"Found products: {list(products_map.keys())}")
    
    # 3. Create restaurants in Tabarka
    print("\nCreating Restaurants in Tabarka...")
    
    if 'Tabarka' in destinations_map:
        tabarka_uri = destinations_map['Tabarka']
        
        # Restaurant 1: Le Corail
        create_restaurant(
            "Le Corail",
            tabarka_uri,
            [products_map.get("Poisson frais", ""), products_map.get("Huile d'olive de Tabarka", "")]
        )
        
        # Restaurant 2: La Marina
        create_restaurant(
            "La Marina",
            tabarka_uri,
            [products_map.get("Poisson frais", ""), products_map.get("Couscous bio", "")]
        )
        
        # Restaurant 3: Dar El Bhar
        create_restaurant(
            "Dar El Bhar",
            tabarka_uri,
            [products_map.get("Huile d'olive de Tabarka", "")]
        )
    
    # Create one restaurant in Tozeur for comparison
    if 'Tozeur' in destinations_map:
        tozeur_uri = destinations_map['Tozeur']
        create_restaurant(
            "Oasis Restaurant",
            tozeur_uri,
            [products_map.get("Dattes de Tozeur", "")]
        )
    
    print("\nDone! Restaurants created successfully!")
    print("\nTest the AI BSila with: 'donner les restaurants de Tabarka'")

if __name__ == "__main__":
    main()

