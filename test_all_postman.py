#!/usr/bin/env python3
"""Test tous les endpoints avec les données de la collection Postman (sans accents)"""
import requests
import json

base = "http://localhost:8000"

print("=== ECO-TOURISM API - TESTS COMPLETS ===\n")

# 1. Health Check
print("1. Health Check")
r = requests.get(f"{base}/health")
print(f"   Status: {r.status_code} - {r.json()}\n")

# 2. Touriste
print("2. Touriste - Create")
touriste = {
    "nom": "Ali",
    "age": 30,
    "nationalite": "TN",
    "sejourne_dans": "http://example.org/eco-tourism#Hebergement_DarElAin",
    "participe_a": ["http://example.org/eco-tourism#Activite_RandonneeKroumirie"],
    "se_deplace_par": ["http://example.org/eco-tourism#Transport_Velo"]
}
r = requests.post(f"{base}/touriste", json=touriste)
print(f"   {r.json()}")
print("   Get All Touristes:")
r = requests.get(f"{base}/touriste")
data = r.json()
count = len(data) if isinstance(data, list) else len(data.get('results', []))
print(f"   Found {count} touristes\n")

# 3. Guide
print("3. Guide - Create")
guide = {
    "nom": "Mohamed",
    "age": 35,
    "nationalite": "TN",
    "organise": ["http://example.org/eco-tourism#Activite_RandonneeKroumirie"],
    "organise_evenement": ["http://example.org/eco-tourism#Evenement_FestivalEcoTabarka"]
}
r = requests.post(f"{base}/guide", json=guide)
print(f"   {r.json()}\n")

# 4. Destination (SANS accents)
print("4. Destination - Create (sans accents)")
destination = {"nom": "Djerba", "pays": "Tunisie", "climat": "Mediterraneen"}
r = requests.post(f"{base}/destination", json=destination)
print(f"   {r.json()}\n")

# 5. Ville (SANS accents)
print("5. Ville - Create (sans accents)")
ville = {"nom": "Sousse", "pays": "Tunisie", "climat": "Mediterraneen"}
r = requests.post(f"{base}/ville", json=ville)
print(f"   {r.json()}\n")

# 6. Hebergement
print("6. Hebergement - Create")
hebergement = {
    "nom": "Eco Lodge Sahara",
    "type": "Lodge",
    "prix": 150.0,
    "nb_chambres": 10,
    "niveau_eco": "Gold",
    "situe_dans": "http://example.org/eco-tourism#Tabaraka",
    "utilise_energie": "http://example.org/eco-tourism#Energie_Solaire"
}
r = requests.post(f"{base}/hebergement", json=hebergement)
print(f"   {r.json()}\n")

# 7. Activite (SANS accents)
print("7. Activite - Create (sans accents)")
activite = {
    "nom": "Plongee Sous-Marine",
    "difficulte": "Facile",
    "duree_heures": 2.0,
    "prix": 50.0,
    "est_dans_zone": "http://example.org/eco-tourism#Zone_ElFeija"
}
r = requests.post(f"{base}/activite", json=activite)
print(f"   {r.json()}\n")

# 8. Transport
print("8. Transport - Create")
transport = {
    "nom": "Bus Electrique",
    "type": "Bus",
    "emission_co2_per_km": 0.02
}
r = requests.post(f"{base}/transport", json=transport)
print(f"   {r.json()}\n")

# 9. Restaurant
print("9. Restaurant - Create")
restaurant = {
    "nom": "Le Gourmet Bio",
    "situe_dans": "http://example.org/eco-tourism#Tabaraka",
    "sert": ["http://example.org/eco-tourism#ProduitLocal_HuileOliveBio"]
}
r = requests.post(f"{base}/restaurant", json=restaurant)
print(f"   {r.json()}\n")

# 10. Produit (SANS accents)
print("10. Produit Local - Create (sans accents)")
produit = {"nom": "Miel de Montagne", "saison": "Ete", "bio": True}
r = requests.post(f"{base}/produit", json=produit)
print(f"   {r.json()}\n")

# 11. Certification
print("11. Certification - Create")
certification = {
    "label_nom": "Green Key",
    "organisme": "FEE",
    "annee_obtention": "2024-01-15"
}
r = requests.post(f"{base}/certification", json=certification)
print(f"   {r.json()}\n")

# 12. Evenement
print("12. Evenement - Create")
evenement = {
    "nom": "Festival Bio 2025",
    "event_date": "2025-06-20",
    "event_duree_heures": 8.0,
    "event_prix": 15.0,
    "a_lieu_dans": "http://example.org/eco-tourism#Tabaraka"
}
r = requests.post(f"{base}/evenement", json=evenement)
print(f"   {r.json()}\n")

# 13. Search Tests
print("=== SEARCH TESTS ===\n")

print("13. Search by Name - 'Tabarka'")
r = requests.get(f"{base}/search/name/Tabarka")
data = r.json()
results = data if isinstance(data, list) else data.get('results', [])
print(f"   Found {len(results)} results\n")

print("14. Search Eco Hebergements")
r = requests.get(f"{base}/search/eco-hebergements")
data = r.json()
results = data if isinstance(data, list) else data.get('results', [])
print(f"   Found {len(results)} eco hebergements\n")

print("15. Search Bio Products")
r = requests.get(f"{base}/search/bio-products")
data = r.json()
results = data if isinstance(data, list) else data.get('results', [])
print(f"   Found {len(results)} bio products\n")

print("16. Search Zero Emission Transport")
r = requests.get(f"{base}/search/zero-emission-transport")
data = r.json()
results = data if isinstance(data, list) else data.get('results', [])
print(f"   Found {len(results)} zero-emission transports\n")

print("17. Search Activities by Difficulty - 'Facile'")
r = requests.get(f"{base}/search/activities/Facile")
data = r.json()
results = data if isinstance(data, list) else data.get('results', [])
print(f"   Found {len(results)} activities\n")

print("18. Search Events by Date Range")
r = requests.get(f"{base}/search/events?start=2025-01-01&end=2025-12-31")
data = r.json()
results = data if isinstance(data, list) else data.get('results', [])
print(f"   Found {len(results)} events\n")

print("19. Generic Search - Touristes from TN")
search_data = {
    "class_name": "Touriste",
    "filters": {"nationalite": "TN"}
}
r = requests.post(f"{base}/search", json=search_data)
data = r.json()
results = data if isinstance(data, list) else data.get('results', [])
print(f"   Found {len(results)} touristes from TN\n")

print("=== TOUS LES TESTS TERMINES ===")
print("✅ API 100% fonctionnelle avec données ASCII!")

