#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import io
import requests
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

time.sleep(2)  # Attendre que le serveur démarre

# Test update
response = requests.get('http://localhost:8000/transport')
transports = response.json().get('transports', [])

if transports:
    t = transports[0]
    print(f"✓ Transport à tester: {t['nom']}")
    
    r = requests.put(
        f"http://localhost:8000/transport/{requests.utils.quote(t['uri'], safe='')}",
        json={'nom': 'UPDATE RÉUSSI ✓', 'type': 'Train', 'emission_co2_per_km': 0.03}
    )
    
    result = r.json()
    if 'error' in result:
        print(f"✗ Erreur: {result['error'][:100]}")
    else:
        print(f"✓ Update envoyé: {result}")
        
        # Vérifier
        time.sleep(1)
        response2 = requests.get('http://localhost:8000/transport')
        transports2 = response2.json().get('transports', [])
        updated = next((x for x in transports2 if 'UPDATE' in x.get('nom', '')), None)
        
        if updated:
            print(f"✓✓ UPDATE FONCTIONNE! Transport trouvé: {updated['nom']}")
        else:
            print(f"✗ Transport pas trouvé après update")
            print(f"Transports actuels: {[x['nom'] for x in transports2]}")
else:
    print("Aucun transport pour tester")

