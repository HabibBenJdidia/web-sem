#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import io
import requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

transports = [
    {'nom': 'Vélo', 'type': 'TransportNonMotorise', 'emission_co2_per_km': 0.0},
    {'nom': 'Bus Électrique', 'type': 'EcoTransport', 'emission_co2_per_km': 0.04},
    {'nom': 'Train', 'type': 'EcoTransport', 'emission_co2_per_km': 0.03},
    {'nom': 'Voiture', 'type': 'Transport', 'emission_co2_per_km': 0.12},
    {'nom': 'Avion', 'type': 'Transport', 'emission_co2_per_km': 0.25},
    {'nom': 'Bateau', 'type': 'Transport', 'emission_co2_per_km': 0.18},
    {'nom': 'Moto', 'type': 'Transport', 'emission_co2_per_km': 0.08}
]

for t in transports:
    requests.post('http://localhost:8000/transport', json=t)

print('✓ 7 transports créés pour le test frontend')

