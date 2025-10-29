#!/usr/bin/env python3
import re
from models.touriste import Touriste
from config import NAMESPACE

def clean_uri_name(name):
    if not name:
        return "Unknown"
    cleaned = re.sub(r'[^\w\-]', '_', str(name))
    cleaned = re.sub(r'_+', '_', cleaned)
    return cleaned

# Test avec les mêmes données que l'API
nom = 'Ali Ben Ahmed'
t = Touriste(
    uri=f"{NAMESPACE}Touriste_{clean_uri_name(nom)}",
    nom=nom,
    age=28,
    nationalite='Tunisie'
)

print("=== URI ===")
print(t.uri)
print("\n=== SPARQL Triples ===")
print(t.to_sparql_insert())
print("\n=== Full SPARQL Query ===")
query = f"""PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
INSERT DATA {{
{t.to_sparql_insert()}}}"""
print(query)
print("\n=== Testing with manager ===")
from Mangage import SPARQLManager
manager = SPARQLManager()
result = manager.create(t)
print("Result:", result)
