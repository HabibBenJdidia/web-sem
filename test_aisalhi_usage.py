#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Guide d'Utilisation d'AISalhi - Exemples Python
Démonstration de tous les endpoints disponibles
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def print_header(title):
    """Afficher un en-tête formaté"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def print_success(message):
    """Afficher un message de succès"""
    print(f"✓ {message}")

def print_error(message):
    """Afficher un message d'erreur"""
    print(f"✗ {message}")

# ========================================
# 1. HELP - Obtenir les informations
# ========================================
print_header("1. Informations sur AISalhi")
print(f"GET {BASE_URL}/ai/help\n")

try:
    response = requests.get(f"{BASE_URL}/ai/help")
    data = response.json()
    print_success(f"Nom: {data['name']}")
    print_success(f"Description: {data['description']}")
    print("\nCapacités:")
    for capability in data['capabilities']:
        print(f"  - {capability}")
except Exception as e:
    print_error(f"Erreur: {e}")

# ========================================
# 2. ASK - Question Simple
# ========================================
print_header("2. Question Simple (Ask)")
print(f"POST {BASE_URL}/ai/ask\n")

question = "Bonjour AISalhi, explique-moi ce que tu peux faire en une phrase"
payload = {"question": question}

try:
    response = requests.post(
        f"{BASE_URL}/ai/ask",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    data = response.json()
    print(f"Question: {question}")
    print(f"\nRéponse AISalhi:")
    print(f"  {data['response']}")
except Exception as e:
    print_error(f"Erreur: {e}")

# ========================================
# 3. CHAT - Conversation Interactive
# ========================================
print_header("3. Chat Interactif")
print(f"POST {BASE_URL}/ai/chat\n")

message = "Quelles sont les destinations écologiques disponibles?"
payload = {"message": message}

try:
    response = requests.post(
        f"{BASE_URL}/ai/chat",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    data = response.json()
    print(f"Message: {message}")
    print(f"\nRéponse AISalhi:")
    print(f"  {data.get('response', data)}")
except Exception as e:
    print_error(f"Erreur: {e}")

# ========================================
# 4. SPARQL - Requêtes sur la Base de Données
# ========================================
print_header("4. Exécution de Requête SPARQL")
print(f"POST {BASE_URL}/ai/sparql\n")

sparql_query = """
PREFIX eco: <http://example.org/eco-tourism#>
SELECT ?cert ?label ?organisme WHERE {
    ?cert a eco:CertificationEco .
    ?cert eco:labelNom ?label .
    ?cert eco:organisme ?organisme .
} LIMIT 5
"""

payload = {"query": sparql_query}

try:
    response = requests.post(
        f"{BASE_URL}/ai/sparql",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    data = response.json()
    print_success("Requête exécutée avec succès")
    
    if 'results' in data:
        print(f"\nNombre de résultats: {len(data['results'])}")
        print("\nPremières certifications:")
        for cert in data['results'][:3]:
            print(f"  - {cert.get('label', 'N/A')} ({cert.get('organisme', 'N/A')})")
except Exception as e:
    print_error(f"Erreur: {e}")

# ========================================
# 5. RECOMMANDATIONS - Activités
# ========================================
print_header("5. Recommandations d'Activités")
print(f"POST {BASE_URL}/ai/recommend-activities\n")

profile = {
    "age": 28,
    "nationalite": "FR",
    "preferences": ["nature", "randonnée", "écologie"],
    "budget": 200
}

try:
    response = requests.post(
        f"{BASE_URL}/ai/recommend-activities",
        json=profile,
        headers={"Content-Type": "application/json"}
    )
    data = response.json()
    
    print(f"Profil:")
    print(f"  - Age: {profile['age']} ans")
    print(f"  - Nationalité: {profile['nationalite']}")
    print(f"  - Budget: {profile['budget']}€")
    print(f"  - Préférences: {', '.join(profile['preferences'])}")
    
    print(f"\nRecommandations AISalhi:")
    print(f"  {data.get('recommendations', data)}")
except Exception as e:
    print_error(f"Erreur: {e}")

# ========================================
# 6. QUESTIONS SUR LES DONNÉES
# ========================================
print_header("6. Questions sur les Données")

questions = [
    "Combien de villes sont disponibles dans le système?",
    "Quelles sont les certifications écologiques disponibles?",
    "Quels sont les événements à venir?"
]

for i, question in enumerate(questions, 1):
    print(f"\nQuestion {i}: {question}")
    payload = {"question": question}
    
    try:
        response = requests.post(
            f"{BASE_URL}/ai/ask",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        data = response.json()
        print(f"Réponse: {data['response']}")
    except Exception as e:
        print_error(f"Erreur: {e}")

# ========================================
# 7. GÉNÉRATION DE REQUÊTE SPARQL
# ========================================
print_header("7. Génération de Requête SPARQL (Langage Naturel)")
print(f"POST {BASE_URL}/ai/ask\n")

nl_query = "Génère une requête SPARQL pour trouver tous les touristes tunisiens"
payload = {"question": nl_query}

try:
    response = requests.post(
        f"{BASE_URL}/ai/ask",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    data = response.json()
    print(f"Demande: {nl_query}")
    print(f"\nRéponse AISalhi:")
    print(f"  {data['response']}")
except Exception as e:
    print_error(f"Erreur: {e}")

# ========================================
# 8. RESET - Réinitialiser la Session
# ========================================
print_header("8. Réinitialisation de la Session")
print(f"POST {BASE_URL}/ai/reset\n")

try:
    response = requests.post(f"{BASE_URL}/ai/reset")
    data = response.json()
    print_success(f"Session réinitialisée: {data.get('message', 'OK')}")
except Exception as e:
    print_error(f"Erreur: {e}")

# ========================================
# RÉSUMÉ FINAL
# ========================================
print_header("Résumé des Endpoints AISalhi")

endpoints = [
    ("GET",  "/ai/help",                    "Informations et capacités"),
    ("POST", "/ai/ask",                     "Question simple"),
    ("POST", "/ai/chat",                    "Chat interactif"),
    ("POST", "/ai/sparql",                  "Exécuter requête SPARQL"),
    ("POST", "/ai/recommend-activities",    "Recommandations personnalisées"),
    ("GET",  "/ai/eco-score/<type>/<uri>",  "Calculer score écologique"),
    ("POST", "/ai/reset",                   "Réinitialiser session")
]

print("\nEndpoints disponibles:\n")
for method, endpoint, description in endpoints:
    print(f"  {method:4} {endpoint:35} - {description}")

print("\n" + "=" * 60)
print("  Tests Terminés avec Succès!")
print("=" * 60)

print("\nDocumentation:")
print("  - AISALHI_README.md       : Guide complet")
print("  - QUICKSTART_AISALHI.md   : Démarrage rapide")
print("  - MIGRATION_AISALHI.md    : Migration Gemini → AISalhi")
print("  - CHANGEMENTS_AISALHI.md  : Résumé des changements\n")
