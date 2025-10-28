"""
Nettoyer et recréer toutes les empreintes carbone
"""
from Mangage import SPARQLManager
from models.empreinte_carbone import EmpreinteCarbone
from config import NAMESPACE
import uuid

def clean_and_recreate():
    manager = SPARQLManager()
    
    print("="*60)
    print("NETTOYAGE ET RECREATION DES EMPREINTES")
    print("="*60 + "\n")
    
    # ÉTAPE 1: Supprimer TOUS les liens aEmpreinte et EmpreinteCarbone existants
    print("ETAPE 1: Suppression des empreintes existantes...")
    
    delete_query = f"""
    PREFIX eco: <{NAMESPACE}>
    DELETE WHERE {{
        ?transport eco:aEmpreinte ?empreinte .
    }}
    """
    
    result = manager.execute_update(delete_query)
    print(f"  -> Liens aEmpreinte supprimes")
    
    delete_empreintes = f"""
    PREFIX eco: <{NAMESPACE}>
    DELETE WHERE {{
        ?empreinte a eco:EmpreinteCarbone .
        ?empreinte ?p ?o .
    }}
    """
    
    result = manager.execute_update(delete_empreintes)
    print(f"  -> Empreintes supprimees\n")
    
    # ÉTAPE 2: Récupérer tous les transports UNIQUES
    print("ETAPE 2: Recuperation des transports...")
    
    get_transports = f"""
    PREFIX eco: <{NAMESPACE}>
    SELECT DISTINCT ?transport ?nom ?emission WHERE {{
        ?transport a eco:Transport .
        OPTIONAL {{ ?transport eco:nom ?nom . }}
        OPTIONAL {{ ?transport eco:emissionCO2PerKm ?emission . }}
    }}
    """
    
    transports = manager.execute_query(get_transports)
    
    # Dédupliquer les transports par URI
    transports_dict = {}
    for t in transports:
        uri = t.get('transport', {}).get('value')
        if uri and uri not in transports_dict:
            transports_dict[uri] = {
                'uri': uri,
                'nom': t.get('nom', {}).get('value', 'Inconnu'),
                'emission': t.get('emission', {}).get('value')
            }
    
    print(f"  -> {len(transports_dict)} transport(s) unique(s) trouves\n")
    
    # ÉTAPE 3: Créer les empreintes pour chaque transport
    print("ETAPE 3: Creation des empreintes...")
    
    created = 0
    skipped = 0
    
    for transport in transports_dict.values():
        uri = transport['uri']
        nom = transport['nom']
        emission = transport['emission']
        
        if not emission:
            print(f"  [SKIP] {nom}: Pas de donnees d'emission")
            skipped += 1
            continue
        
        try:
            emission_value = float(emission)
            
            # Générer URI unique
            empreinte_id = str(uuid.uuid4())
            empreinte_uri = f"{NAMESPACE}Empreinte_{empreinte_id}"
            
            # Calculer valeur en kg
            valeur_co2_kg = emission_value / 1000.0
            
            # Créer l'empreinte
            empreinte = EmpreinteCarbone(uri=empreinte_uri, valeur_co2_kg=valeur_co2_kg)
            empreinte_triples = empreinte.to_sparql_insert()
            
            # Créer le lien
            link_triple = f'<{uri}> <{NAMESPACE}aEmpreinte> <{empreinte_uri}> .'
            
            # INSERT en une seule requête
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
                print(f"  [OK] {nom}: {valeur_co2_kg:.4f} kg CO2 ({category})")
                created += 1
            else:
                print(f"  [ERREUR] {nom}: {result.get('error')}")
                
        except Exception as e:
            print(f"  [ERREUR] {nom}: {str(e)}")
            continue
    
    print(f"\n{'='*60}")
    print(f"TERMINE!")
    print(f"  - {created} empreinte(s) creee(s)")
    print(f"  - {skipped} transport(s) ignore(s)")
    print(f"{'='*60}\n")
    
    # ÉTAPE 4: Vérification
    print("ETAPE 4: Verification...")
    
    verify_query = f"""
    PREFIX eco: <{NAMESPACE}>
    SELECT ?transport ?nom ?empreinte ?valeur WHERE {{
        ?transport a eco:Transport .
        ?transport eco:nom ?nom .
        ?transport eco:aEmpreinte ?empreinte .
        ?empreinte eco:valeurCO2kg ?valeur .
    }}
    LIMIT 5
    """
    
    verification = manager.execute_query(verify_query)
    
    if verification:
        print(f"  -> {len(verification)} lien(s) verifies avec succes!")
        for v in verification:
            print(f"     {v.get('nom', {}).get('value')}: {v.get('valeur', {}).get('value')} kg CO2")
    else:
        print("  -> ERREUR: Aucun lien trouve apres creation!")
    
    print("\n")

if __name__ == "__main__":
    clean_and_recreate()

