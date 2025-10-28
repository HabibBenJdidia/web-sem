"""
Définir des émissions variées pour couvrir TOUTES les catégories d'empreinte
"""
from Mangage import SPARQLManager
from models.empreinte_carbone import EmpreinteCarbone
from config import NAMESPACE
import uuid

manager = SPARQLManager()

# Valeurs pour couvrir TOUTES les catégories:
# - Zéro émission: 0 kg
# - Faible: <= 1.0 kg (donc <= 1000 g/km)
# - Moyenne: <= 5.0 kg (donc <= 5000 g/km)
# - Élevée: > 5.0 kg (donc > 5000 g/km)

emissions_config = {
    "hyhy esprit": 0.0,      # Zéro émission (Vélo)
    "veloaeaea": 0.0,        # Zéro émission (Vélo)
    "rgrgbrrgr": 30.0,       # Faible - Train (0.030 kg)
    "dvd": 800.0,            # Faible - Bus (0.800 kg)
    "eaaeae": 3500.0,        # Moyenne - Voiture (3.500 kg)
    "fbdfbdf": 8000.0,       # Élevée - Avion (8.000 kg)
}

print("="*70)
print("CONFIGURATION DES EMISSIONS POUR TOUTES LES CATEGORIES")
print("="*70)
print(f"\n{'Transport':<15} {'Emission (g/km)':<18} {'Empreinte (kg)':<18} {'Categorie'}")
print("-"*70)

for nom, emission in emissions_config.items():
    empreinte_kg = emission / 1000.0
    category = EmpreinteCarbone.get_category(empreinte_kg)
    print(f"{nom:<15} {emission:<18.1f} {empreinte_kg:<18.4f} {category}")

print("\n" + "="*70)
print("APPLICATION DES MODIFICATIONS...")
print("="*70 + "\n")

# Récupérer les URIs des transports
get_transports = f"""
PREFIX eco: <{NAMESPACE}>
SELECT ?transport ?nom WHERE {{
    ?transport a eco:Transport .
    ?transport eco:nom ?nom .
}}
"""

transports = manager.execute_query(get_transports)
transports_dict = {}
for t in transports:
    uri = t.get('transport', {}).get('value')
    nom = t.get('nom', {}).get('value', '')
    if uri and nom and uri not in transports_dict:
        transports_dict[uri] = nom

# Mettre à jour les émissions
updated = 0
for uri, nom in transports_dict.items():
    if nom in emissions_config:
        new_emission = emissions_config[nom]
        
        # Supprimer l'ancienne valeur
        delete_query = f"""
        PREFIX eco: <{NAMESPACE}>
        DELETE WHERE {{
            <{uri}> eco:emissionCO2PerKm ?old .
        }}
        """
        manager.execute_update(delete_query)
        
        # Insérer la nouvelle
        insert_query = f"""
        PREFIX eco: <{NAMESPACE}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        INSERT DATA {{
            <{uri}> eco:emissionCO2PerKm "{new_emission}"^^xsd:decimal .
        }}
        """
        
        result = manager.execute_update(insert_query)
        if result.get('success'):
            print(f"[OK] {nom}: {new_emission} g/km")
            updated += 1

print(f"\n{updated} emissions mises a jour.\n")

# Supprimer et recréer les empreintes
print("Suppression des anciennes empreintes...")
manager.execute_update(f"PREFIX eco: <{NAMESPACE}> DELETE WHERE {{ ?t eco:aEmpreinte ?e . }}")
manager.execute_update(f"PREFIX eco: <{NAMESPACE}> DELETE WHERE {{ ?e a eco:EmpreinteCarbone . ?e ?p ?o . }}")

print("Creation des nouvelles empreintes...\n")

get_updated = f"""
PREFIX eco: <{NAMESPACE}>
SELECT ?transport ?nom ?emission WHERE {{
    ?transport a eco:Transport .
    ?transport eco:nom ?nom .
    ?transport eco:emissionCO2PerKm ?emission .
}}
"""

updated_transports = manager.execute_query(get_updated)
transports_final = {}
for t in updated_transports:
    uri = t.get('transport', {}).get('value')
    if uri and uri not in transports_final:
        transports_final[uri] = {
            'nom': t.get('nom', {}).get('value', 'Inconnu'),
            'emission': t.get('emission', {}).get('value')
        }

created = 0
for uri, data in transports_final.items():
    nom = data['nom']
    emission = data['emission']
    
    if emission:
        emission_value = float(emission)
        empreinte_id = str(uuid.uuid4())
        empreinte_uri = f"{NAMESPACE}Empreinte_{empreinte_id}"
        valeur_co2_kg = emission_value / 1000.0
        
        empreinte = EmpreinteCarbone(uri=empreinte_uri, valeur_co2_kg=valeur_co2_kg)
        empreinte_triples = empreinte.to_sparql_insert()
        link_triple = f'<{uri}> <{NAMESPACE}aEmpreinte> <{empreinte_uri}> .'
        
        insert_query = f"""
        PREFIX eco: <{NAMESPACE}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        INSERT DATA {{
            {empreinte_triples}
            {link_triple}
        }}
        """
        
        result = manager.execute_update(insert_query)
        if result.get('success'):
            category = EmpreinteCarbone.get_category(valeur_co2_kg)
            print(f"[OK] {nom}: {valeur_co2_kg:.4f} kg - {category}")
            created += 1

print(f"\n{created} empreintes creees.")
print("\n" + "="*70)
print("TERMINE! Rechargez le dashboard pour voir les changements.")
print("="*70 + "\n")

