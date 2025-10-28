#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys, io, requests, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

time.sleep(2)

# Créer des transports de test
transports_test = [
    {'nom': 'Mon Vélo', 'type': 'Vélo', 'emission_co2_per_km': 0.0},
    {'nom': 'Mon Train', 'type': 'Train', 'emission_co2_per_km': 0.03},
    {'nom': 'Mon Avion', 'type': 'Avion', 'emission_co2_per_km': 0.25},
]

print('Création des transports de test...')
for t in transports_test:
    r = requests.post('http://localhost:8000/transport', json=t)
    if r.status_code == 200:
        print(f'  ✓ {t["nom"]} créé')
    else:
        print(f'  ✗ Erreur: {t["nom"]}')

time.sleep(1)

# Vérifier
r = requests.get('http://localhost:8000/transport')
transports = r.json().get('transports', [])
print(f'\n✓ {len(transports)} transports trouvés\n')

for t in transports[-3:]:
    nom = t.get('nom', 'N/A')
    type_val = t.get('type', 'N/A')
    co2 = t.get('emission_co2_per_km', 'N/A')
    print(f'  {nom:15s} → Type: "{type_val:20s}" CO2: {co2} kg/km')

