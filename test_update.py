#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import io
import requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Récupérer les transports
response = requests.get('http://localhost:8000/transport')
transports = response.json().get('transports', [])

print(f"Transports disponibles: {len(transports)}")

if not transports:
    print("Aucun transport à tester. Créons-en un...")
    r = requests.post('http://localhost:8000/transport', json={
        'nom': 'Test Vélo',
        'type': 'Vélo',
        'emission_co2_per_km': 0.0
    })
    print(f"Transport créé: {r.json()}")
    
    # Re-récupérer les transports
    response = requests.get('http://localhost:8000/transport')
    transports = response.json().get('transports', [])

if transports:
    transport = transports[0]
    print(f"\nTransport à modifier: {transport['nom']} ({transport.get('type', 'N/A')})")
    
    # Tester l'update
    uri = transport['uri']
    update_data = {
        'nom': 'TRANSPORT MODIFIÉ',
        'type': 'Train',
        'emission_co2_per_km': 0.03
    }
    
    print(f"\nEnvoi de l'update avec données: {update_data}")
    
    r = requests.put(
        f"http://localhost:8000/transport/{requests.utils.quote(uri, safe='')}",
        json=update_data
    )
    
    print(f"Status code: {r.status_code}")
    
    if r.status_code == 200:
        print(f"✓ Update réussi: {r.json()}")
        
        # Vérifier le résultat
        response = requests.get('http://localhost:8000/transport')
        transports = response.json().get('transports', [])
        updated = next((t for t in transports if t['uri'] == uri), None)
        
        if updated:
            print(f"\n✓ Transport après update: {updated['nom']} - Type: {updated.get('type', 'N/A')} - CO2: {updated.get('emission_co2_per_km', 'N/A')}")
        else:
            print("\n✗ Transport non trouvé après update")
    else:
        print(f"✗ Erreur: {r.text[:500]}")
else:
    print("Impossible de tester l'update")

