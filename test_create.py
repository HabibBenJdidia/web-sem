import requests
import json

# Test creating a Natural Zone
print("Testing CREATE Natural Zone...")
url = "http://localhost:5000/zone-naturelle"
data = {
    "nom": "Test Zone",
    "type": "Parc National"
}

response = requests.post(url, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
print()

# Test creating an Activity
print("Testing CREATE Activity...")
url = "http://localhost:5000/activite"
data = {
    "nom": "Test Activity",
    "difficulte": "Facile",
    "duree_heures": 2,
    "prix": 30,
    "est_dans_zone": "http://example.org/eco-tourism#ZoneNaturelle_Test_Zone"
}

response = requests.post(url, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
