#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import io
import requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Test URI
test_uri = "http://example.org/eco-tourism#Transport_TestDirect"

# 1. Créer un transport
create_query = f"""PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
INSERT DATA {{
<{test_uri}> a <http://example.org/eco-tourism#Transport> .
<{test_uri}> <http://example.org/eco-tourism#nom> "Test Direct"^^xsd:string .
<{test_uri}> <http://example.org/eco-tourism#type> "Vélo"^^xsd:string .
<{test_uri}> <http://example.org/eco-tourism#emissionCO2PerKm> "0.0"^^xsd:decimal .
}}"""

print("=== CREATE ===")
print(create_query)
print()

r = requests.post(
    'http://localhost:3030/ecotourism/update',
    data=create_query,
    headers={'Content-Type': 'application/sparql-update; charset=UTF-8'},
    auth=('admin', 'admin')
)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:200] if r.text else 'OK'}")
print()

# 2. Vérifier
check_query = f"""SELECT * WHERE {{ <{test_uri}> ?p ?o }}"""
r = requests.post(
    'http://localhost:3030/ecotourism/query',
    data={'query': check_query},
    headers={'Accept': 'application/sparql-results+json'},
    auth=('admin', 'admin')
)
print(f"✓ Transport créé: {len(r.json()['results']['bindings'])} propriétés")
print()

# 3. DELETE
delete_query = f"""DELETE WHERE {{ <{test_uri}> ?p ?o . }}"""
print("=== DELETE ===")
print(delete_query)
print()

r = requests.post(
    'http://localhost:3030/ecotourism/update',
    data=delete_query,
    headers={'Content-Type': 'application/sparql-update; charset=UTF-8'},
    auth=('admin', 'admin')
)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:200] if r.text else 'OK'}")
print()

# 4. Recréer (UPDATE)
update_query = f"""PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
INSERT DATA {{
<{test_uri}> a <http://example.org/eco-tourism#Transport> .
<{test_uri}> <http://example.org/eco-tourism#nom> "MODIFIÉ"^^xsd:string .
<{test_uri}> <http://example.org/eco-tourism#type> "Train"^^xsd:string .
<{test_uri}> <http://example.org/eco-tourism#emissionCO2PerKm> "0.03"^^xsd:decimal .
}}"""

print("=== UPDATE (CREATE) ===")
print(update_query)
print()

r = requests.post(
    'http://localhost:3030/ecotourism/update',
    data=update_query,
    headers={'Content-Type': 'application/sparql-update; charset=UTF-8'},
    auth=('admin', 'admin')
)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:200] if r.text else 'OK'}")
print()

# 5. Vérifier final
r = requests.post(
    'http://localhost:3030/ecotourism/query',
    data={'query': check_query},
    headers={'Accept': 'application/sparql-results+json'},
    auth=('admin', 'admin')
)
results = r.json()['results']['bindings']
print(f"✓ Transport final: {len(results)} propriétés")
for prop in results:
    print(f"  - {prop['p']['value'].split('#')[-1]}: {prop['o']['value']}")

# Cleanup
requests.post(
    'http://localhost:3030/ecotourism/update',
    data=delete_query,
    headers={'Content-Type': 'application/sparql-update; charset=UTF-8'},
    auth=('admin', 'admin')
)
print("\n✓ Cleanup effectué")

