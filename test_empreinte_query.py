"""
Test direct de la requête SPARQL pour les empreintes
"""
from Mangage import SPARQLManager
from config import NAMESPACE
import json

manager = SPARQLManager()

query = f"""
PREFIX eco: <{NAMESPACE}>
SELECT ?transport ?nom ?type ?emission ?empreinteURI ?valeurCO2kg WHERE {{
    ?transport a eco:Transport .
    OPTIONAL {{ ?transport eco:nom ?nom . }}
    OPTIONAL {{ ?transport eco:type ?type . }}
    OPTIONAL {{ ?transport eco:emissionCO2PerKm ?emission . }}
    OPTIONAL {{ 
        ?transport eco:aEmpreinte ?empreinteURI .
        ?empreinteURI eco:valeurCO2kg ?valeurCO2kg .
    }}
}}
LIMIT 5
"""

print("="*60)
print("TEST: Requete SPARQL pour transports avec empreinte")
print("="*60)
print("\nRequete:")
print(query)
print("\n" + "="*60)
print("Resultats:")
print("="*60 + "\n")

results = manager.execute_query(query)

if not results:
    print("AUCUN resultat retourne!")
else:
    print(f"Nombre de resultats: {len(results)}\n")
    
    for i, result in enumerate(results, 1):
        print(f"\n--- Resultat {i} ---")
        print(f"Transport URI: {result.get('transport', {}).get('value', 'N/A')}")
        print(f"Nom: {result.get('nom', {}).get('value', 'N/A')}")
        print(f"Type: {result.get('type', {}).get('value', 'N/A')}")
        print(f"Emission: {result.get('emission', {}).get('value', 'N/A')}")
        print(f"Empreinte URI: {result.get('empreinteURI', {}).get('value', 'N/A')}")
        print(f"Valeur CO2 kg: {result.get('valeurCO2kg', {}).get('value', 'N/A')}")
        
print("\n" + "="*60)
print("Analyse:")
print("="*60)

empreintes_trouvees = sum(1 for r in results if r.get('empreinteURI'))
print(f"Transports avec empreinte: {empreintes_trouvees}/{len(results)}")

if empreintes_trouvees == 0:
    print("\nPROBLEME: Aucune empreinte trouvee!")
    print("Verif: Les empreintes existent-elles dans Fuseki?")
    
    # Vérifier si les empreintes existent
    check_query = f"""
    PREFIX eco: <{NAMESPACE}>
    SELECT ?empreinte ?valeur WHERE {{
        ?empreinte a eco:EmpreinteCarbone .
        ?empreinte eco:valeurCO2kg ?valeur .
    }}
    """
    
    print("\nVerification des EmpreinteCarbone existantes:")
    empreintes = manager.execute_query(check_query)
    
    if empreintes:
        print(f"  -> {len(empreintes)} EmpreinteCarbone trouvees dans la base")
        for e in empreintes[:3]:
            print(f"     - {e.get('empreinte', {}).get('value', 'N/A')}: {e.get('valeur', {}).get('value', 'N/A')} kg")
    else:
        print("  -> AUCUNE EmpreinteCarbone dans la base!")
        
    # Vérifier les liens aEmpreinte
    link_query = f"""
    PREFIX eco: <{NAMESPACE}>
    SELECT ?transport ?empreinte WHERE {{
        ?transport eco:aEmpreinte ?empreinte .
    }}
    """
    
    print("\nVerification des liens aEmpreinte:")
    links = manager.execute_query(link_query)
    
    if links:
        print(f"  -> {len(links)} lien(s) aEmpreinte trouve(s)")
        for link in links[:3]:
            print(f"     - {link.get('transport', {}).get('value', 'N/A')}")
            print(f"       -> {link.get('empreinte', {}).get('value', 'N/A')}")
    else:
        print("  -> AUCUN lien aEmpreinte trouve!")
        print("  -> C'EST LE PROBLEME: les liens n'ont pas ete crees!")

print("\n")

