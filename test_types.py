#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys, io, requests
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

r = requests.get('http://localhost:8000/transport')
transports = r.json().get('transports', [])
print(f'✓ {len(transports)} transports trouvés\n')

for t in transports[:10]:
    nom = t.get('nom', 'N/A')
    type_val = t.get('type', 'N/A')
    co2 = t.get('emission_co2_per_km', 'N/A')
    print(f'  {nom:20s} → Type: {type_val:20s} CO2: {co2}')

