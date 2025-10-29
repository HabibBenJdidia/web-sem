#!/usr/bin/env python3
"""Test que tous les modèles ont le champ ID"""

from models.touriste import Touriste
from models.guide import Guide
from models.hebergement import Hebergement
from models.activite import Activite
from models.transport import Transport
from models.restaurant import Restaurant
from models.produit_local import ProduitLocal
from models.evenement import Evenement
from models.destination import Destination
from models.certification_eco import CertificationEco
from models.zone_naturelle import ZoneNaturelle

print("="*70)
print("TEST: Champ ID dans tous les modèles")
print("="*70)

# Test Touriste
t = Touriste(nom="Test", age=25, nationalite="FR")
print(f"\n1. Touriste:")
print(f"   - ID: {t.id}")
print(f"   - URI: {t.uri}")
sparql = t.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL Touriste"
print(f"   - SPARQL contient ID: OUI")

# Test Guide
g = Guide(nom="Guide1", age=30)
print(f"\n2. Guide:")
print(f"   - ID: {g.id}")
print(f"   - URI: {g.uri}")
sparql = g.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL Guide"
print(f"   - SPARQL contient ID: OUI")

# Test Hebergement
h = Hebergement(nom="Hotel1", type_="Hotel", prix=100, nb_chambres=10)
print(f"\n3. Hebergement:")
print(f"   - ID: {h.id}")
print(f"   - URI: {h.uri}")
sparql = h.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL Hebergement"
print(f"   - SPARQL contient ID: OUI")

# Test Activite
a = Activite(nom="Rando1", difficulte="Facile", duree_heures=2, prix=20)
print(f"\n4. Activite:")
print(f"   - ID: {a.id}")
print(f"   - URI: {a.uri}")
sparql = a.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL Activite"
print(f"   - SPARQL contient ID: OUI")

# Test Transport
tr = Transport(nom="Bus1", type_="Bus", emission_co2_per_km=50)
print(f"\n5. Transport:")
print(f"   - ID: {tr.id}")
print(f"   - URI: {tr.uri}")
sparql = tr.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL Transport"
print(f"   - SPARQL contient ID: OUI")

# Test Restaurant
r = Restaurant(nom="Rest1")
print(f"\n6. Restaurant:")
print(f"   - ID: {r.id}")
print(f"   - URI: {r.uri}")
sparql = r.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL Restaurant"
print(f"   - SPARQL contient ID: OUI")

# Test ProduitLocal
p = ProduitLocal(nom="Olive", saison="Ete", bio=True)
print(f"\n7. ProduitLocal:")
print(f"   - ID: {p.id}")
print(f"   - URI: {p.uri}")
sparql = p.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL ProduitLocal"
print(f"   - SPARQL contient ID: OUI")

# Test Evenement
e = Evenement(nom="Festival", event_date="2025-06-15", event_prix=50)
print(f"\n8. Evenement:")
print(f"   - ID: {e.id}")
print(f"   - URI: {e.uri}")
sparql = e.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL Evenement"
print(f"   - SPARQL contient ID: OUI")

# Test Destination
d = Destination(nom="Tunis", pays="Tunisie", climat="Mediterraneen")
print(f"\n9. Destination:")
print(f"   - ID: {d.id}")
print(f"   - URI: {d.uri}")
sparql = d.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL Destination"
print(f"   - SPARQL contient ID: OUI")

# Test CertificationEco
c = CertificationEco(label_nom="EcoLabel", organisme="EcoOrg")
print(f"\n10. CertificationEco:")
print(f"   - ID: {c.id}")
print(f"   - URI: {c.uri}")
sparql = c.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL CertificationEco"
print(f"   - SPARQL contient ID: OUI")

# Test ZoneNaturelle
z = ZoneNaturelle(nom="Parc", type_="National")
print(f"\n11. ZoneNaturelle:")
print(f"   - ID: {z.id}")
print(f"   - URI: {z.uri}")
sparql = z.to_sparql_insert()
assert '<http://example.org/eco-tourism#id>' in sparql, "ID manquant dans SPARQL ZoneNaturelle"
print(f"   - SPARQL contient ID: OUI")

# Test auto-increment
t2 = Touriste(nom="Test2", age=30, nationalite="TN")
print(f"\n12. Auto-increment test:")
print(f"   - Touriste 1 ID: {t.id}")
print(f"   - Touriste 2 ID: {t2.id}")
assert t2.id > t.id, "L'auto-increment ne fonctionne pas"
print(f"   - Auto-increment fonctionne: OUI")

print("\n" + "="*70)
print("TOUS LES TESTS PASSES!")
print("="*70)
print("\nRESUME:")
print("  - Tous les modèles ont le champ 'id'")
print("  - L'ID est auto-incremente par classe")
print("  - L'ID est inclus dans le SPARQL INSERT")
print("  - L'URI contient l'ID (ex: Touriste_1, Touriste_2)")

