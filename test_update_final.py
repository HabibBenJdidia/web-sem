#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys, io, requests, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

time.sleep(2)
r = requests.get('http://localhost:8000/transport')
ts = r.json().get('transports', [])
print(f'✓ {len(ts)} transports trouvés')

if ts:
    t = ts[0]
    print(f'Test update sur: {t["nom"]}')
    
    ru = requests.put(
        f'http://localhost:8000/transport/{requests.utils.quote(t["uri"], safe="")}',
        json={'nom': 'MODIFIÉ ✓', 'type': 'Train', 'emission_co2_per_km': 0.03}
    )
    
    res = ru.json()
    if 'success' in res:
        print(f'✓✓ UPDATE RÉUSSI!')
        time.sleep(1)
        r2 = requests.get('http://localhost:8000/transport')
        ts2 = r2.json().get('transports', [])
        upd = next((x for x in ts2 if 'MODIFIÉ' in x.get('nom', '')), None)
        print(f'Résultat: {upd["nom"] if upd else "❌ Transport non trouvé"}')
    else:
        print(f'❌ Erreur: {res.get("error", "Unknown")[:80]}')

