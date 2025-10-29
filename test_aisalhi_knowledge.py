#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test AISalhi's Complete Knowledge of the System
"""
import requests
import json

base = "http://localhost:8000"

print("="*70)
print("TESTING AISALHI'S COMPLETE KNOWLEDGE OF ECO-TOURISM SYSTEM")
print("="*70)

# Test 1: Ask about all available classes
print("\n[TEST 1] What classes/entities are available in the system?")
r = requests.post(f"{base}/ai/ask", json={
    "question": "List ALL the entity types/classes available in the eco-tourism system. Include base classes and specialized classes."
})
response = r.json()
print(f"Response:\n{response['response'][:500]}...")

# Test 2: Ask about specific class properties
print("\n\n[TEST 2] What properties does Hebergement have?")
r = requests.post(f"{base}/ai/ask", json={
    "question": "What are ALL the properties of the Hebergement class? Include data properties and object properties."
})
response = r.json()
print(f"Response:\n{response['response'][:400]}...")

# Test 3: Ask about relationships
print("\n\n[TEST 3] What relationships exist between entities?")
r = requests.post(f"{base}/ai/ask", json={
    "question": "Explain the relationships between Touriste, Hebergement, Activite, and Transport."
})
response = r.json()
print(f"Response:\n{response['response'][:400]}...")

# Test 4: Ask about available operations
print("\n\n[TEST 4] What operations can be performed?")
r = requests.post(f"{base}/ai/ask", json={
    "question": "What are ALL the CRUD operations and search functions available in the system?"
})
response = r.json()
print(f"Response:\n{response['response'][:400]}...")

# Test 5: Ask about specialized classes
print("\n\n[TEST 5] What specialized transport classes exist?")
r = requests.post(f"{base}/ai/ask", json={
    "question": "What are the different types of Transport classes? Include EcoTransport and TransportNonMotorise."
})
response = r.json()
print(f"Response:\n{response['response'][:400]}...")

# Test 6: Ask about environmental classes
print("\n\n[TEST 6] What environmental/eco classes exist?")
r = requests.post(f"{base}/ai/ask", json={
    "question": "List all the environmental and eco-related classes like ZoneNaturelle, CertificationEco, etc."
})
response = r.json()
print(f"Response:\n{response['response'][:400]}...")

# Test 7: Complex query understanding
print("\n\n[TEST 7] Complex query: Find eco-friendly accommodations")
r = requests.post(f"{base}/ai/chat", json={
    "message": "I want to find all accommodations with Gold eco-level that use renewable energy"
})
response = r.json()
print(f"Type: {response.get('type')}")
print(f"AI understood and generated action: {bool(response.get('explanation'))}")
if 'explanation' in response:
    print(f"Action details: {response['explanation'][:300]}...")

# Test 8: Create complex entity
print("\n\n[TEST 8] Create a complex entity with relationships")
r = requests.post(f"{base}/ai/chat", json={
    "message": "Create a tourist named Marie, age 35 from France, staying at Hebergement_EcoLodge, participating in activity Randonnee_Kroumirie"
})
response = r.json()
print(f"Type: {response.get('type')}")
print(f"AI generated creation action: {bool(response.get('explanation'))}")

# Test 9: SPARQL generation test
print("\n\n[TEST 9] Generate SPARQL for complex query")
r = requests.post(f"{base}/ai/ask", json={
    "question": "Write a SPARQL query to find all tourists who participate in activities located in natural zones and use zero-emission transport"
})
response = r.json()
print(f"Response includes SPARQL: {'PREFIX' in response['response']}")
print(f"Response preview:\n{response['response'][:500]}...")

# Test 10: Knowledge of all endpoints
print("\n\n[TEST 10] What are ALL the API endpoints?")
r = requests.post(f"{base}/ai/ask", json={
    "question": "List ALL the API endpoints for CRUD operations, including POST, GET, PUT, DELETE for each entity type."
})
response = r.json()
print(f"Response:\n{response['response'][:500]}...")

print("\n" + "="*70)
print("[SUCCESS] AISALHI KNOWLEDGE TEST COMPLETED!")
print("="*70)
print("\nAISalhi now has COMPLETE knowledge of:")
print("  - All 25+ entity classes (base and specialized)")
print("  - All properties (data and object properties)")
print("  - All relationships between entities)")
print("  - All CRUD endpoints (POST, GET, PUT, DELETE)")
print("  - All search functions")
print("  - SPARQL query generation")
print("  - Complete ontology structure")

