"""
Mettre à jour les émissions CO2 avec des valeurs réalistes et variées
pour tester toutes les catégories d'empreinte carbone
"""
from Mangage import SPARQLManager
from models.empreinte_carbone import EmpreinteCarbone
from config import NAMESPACE
import uuid

def update_emissions():
    manager = SPARQLManager()
    
    print("="*70)
    print("MISE A JOUR DES EMISSIONS CO2 AVEC DES VALEURS REALISTES")
    print("="*70 + "\n")
    
    # Valeurs réalistes d'émissions CO2 par km pour différents transports
    realistic_emissions = {
        "hyhy esprit": {
            "emission_g_km": 0.0,     # Vélo/Marche - Zéro émission
            "description": "Transport non motorise (Velo/Marche)"
        },
        "eaaeae": {
            "emission_g_km": 120.0,   # Voiture essence - Moyenne
            "description": "Voiture essence standard"
        },
        "veloaeaea": {
            "emission_g_km": 0.0,     # Vélo - Zéro émission
            "description": "Velo"
        },
        "rgrgbrrgr": {
            "emission_g_km": 30.0,    # Train - Faible
            "description": "Train electrique"
        },
        "dvd": {
            "emission_g_km": 60.0,    # Bus - Moyenne
            "description": "Bus diesel"
        },
        "fbdfbdf": {
            "emission_g_km": 250.0,   # Avion - Élevée
            "description": "Avion court-courrier"
        }
    }
    
    print("Valeurs cibles:")
    print("-" * 70)
    for nom, data in realistic_emissions.items():
        emission = data['emission_g_km']
        empreinte_kg = emission / 1000.0
        category = EmpreinteCarbone.get_category(empreinte_kg)
        print(f"  {nom:15} -> {emission:6.1f} g/km ({empreinte_kg:.4f} kg) - {category}")
        print(f"                  {data['description']}")
    print()
    
    # ÉTAPE 1: Récupérer tous les transports
    print("ETAPE 1: Recuperation des transports...")
    get_transports = f"""
    PREFIX eco: <{NAMESPACE}>
    SELECT ?transport ?nom WHERE {{
        ?transport a eco:Transport .
        ?transport eco:nom ?nom .
    }}
    """
    
    transports = manager.execute_query(get_transports)
    
    # Dédupliquer
    transports_dict = {}
    for t in transports:
        uri = t.get('transport', {}).get('value')
        nom = t.get('nom', {}).get('value', '')
        if uri and nom and uri not in transports_dict:
            transports_dict[uri] = nom
    
    print(f"  -> {len(transports_dict)} transport(s) trouve(s)\n")
    
    # ÉTAPE 2: Mettre à jour les émissions
    print("ETAPE 2: Mise a jour des emissions...")
    
    updated = 0
    
    for uri, nom in transports_dict.items():
        if nom not in realistic_emissions:
            print(f"  [SKIP] {nom}: Pas de valeur definie")
            continue
        
        new_emission = realistic_emissions[nom]['emission_g_km']
        
        try:
            # Supprimer l'ancienne valeur d'émission
            delete_query = f"""
            PREFIX eco: <{NAMESPACE}>
            DELETE WHERE {{
                <{uri}> eco:emissionCO2PerKm ?oldEmission .
            }}
            """
            
            manager.execute_update(delete_query)
            
            # Insérer la nouvelle valeur
            insert_query = f"""
            PREFIX eco: <{NAMESPACE}>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            
            INSERT DATA {{
                <{uri}> eco:emissionCO2PerKm "{new_emission}"^^xsd:decimal .
            }}
            """
            
            result = manager.execute_update(insert_query)
            
            if result.get('success'):
                empreinte_kg = new_emission / 1000.0
                category = EmpreinteCarbone.get_category(empreinte_kg)
                print(f"  [OK] {nom:15} -> {new_emission:6.1f} g/km ({category})")
                updated += 1
            else:
                print(f"  [ERREUR] {nom}: {result.get('error')}")
                
        except Exception as e:
            print(f"  [ERREUR] {nom}: {str(e)}")
            continue
    
    print(f"\n{'='*70}")
    print(f"Emissions mises a jour: {updated}/{len(realistic_emissions)}")
    print(f"{'='*70}\n")
    
    # ÉTAPE 3: Recréer les empreintes avec les nouvelles valeurs
    print("ETAPE 3: Recreation des empreintes carbone...")
    
    # Supprimer toutes les empreintes existantes
    delete_links = f"""
    PREFIX eco: <{NAMESPACE}>
    DELETE WHERE {{
        ?transport eco:aEmpreinte ?empreinte .
    }}
    """
    manager.execute_update(delete_links)
    
    delete_empreintes = f"""
    PREFIX eco: <{NAMESPACE}>
    DELETE WHERE {{
        ?empreinte a eco:EmpreinteCarbone .
        ?empreinte ?p ?o .
    }}
    """
    manager.execute_update(delete_empreintes)
    
    # Récupérer les transports avec nouvelles émissions
    get_updated = f"""
    PREFIX eco: <{NAMESPACE}>
    SELECT ?transport ?nom ?emission WHERE {{
        ?transport a eco:Transport .
        ?transport eco:nom ?nom .
        ?transport eco:emissionCO2PerKm ?emission .
    }}
    """
    
    updated_transports = manager.execute_query(get_updated)
    
    # Dédupliquer
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
        
        if not emission:
            continue
        
        try:
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
                color = EmpreinteCarbone.get_category_color(valeur_co2_kg)
                print(f"  [OK] {nom:15} -> Empreinte: {category} ({color})")
                created += 1
                
        except Exception as e:
            print(f"  [ERREUR] {nom}: {str(e)}")
            continue
    
    print(f"\n{'='*70}")
    print(f"Empreintes creees: {created}")
    print(f"{'='*70}\n")
    
    # ÉTAPE 4: Vérification finale
    print("ETAPE 4: Verification finale...")
    
    verify_query = f"""
    PREFIX eco: <{NAMESPACE}>
    SELECT ?nom ?emission ?valeurCO2kg WHERE {{
        ?transport a eco:Transport .
        ?transport eco:nom ?nom .
        ?transport eco:emissionCO2PerKm ?emission .
        OPTIONAL {{
            ?transport eco:aEmpreinte ?empreinte .
            ?empreinte eco:valeurCO2kg ?valeurCO2kg .
        }}
    }}
    ORDER BY ?emission
    """
    
    final_results = manager.execute_query(verify_query)
    
    # Dédupliquer
    final_dict = {}
    for r in final_results:
        nom = r.get('nom', {}).get('value', '')
        if nom and nom not in final_dict:
            emission = float(r.get('emission', {}).get('value', 0))
            valeur_kg_str = r.get('valeurCO2kg', {}).get('value')
            valeur_kg = float(valeur_kg_str) if valeur_kg_str else None
            final_dict[nom] = {
                'emission': emission,
                'valeur_kg': valeur_kg
            }
    
    print("\nResultat final:")
    print("-" * 70)
    print(f"{'Transport':<20} {'Emission (g/km)':<18} {'Empreinte':<25} {'Categorie':<15}")
    print("-" * 70)
    
    for nom, data in sorted(final_dict.items(), key=lambda x: x[1]['emission']):
        emission = data['emission']
        valeur_kg = data['valeur_kg']
        
        if valeur_kg is not None:
            category = EmpreinteCarbone.get_category(valeur_kg)
            color = EmpreinteCarbone.get_category_color(valeur_kg)
            empreinte_str = f"{valeur_kg:.4f} kg CO2"
            
            # Emoji selon catégorie
            emoji = "🌿" if color == "green" else "✅" if color == "light-green" else "⚠️" if color == "orange" else "🚗"
            
            print(f"{nom:<20} {emission:<18.1f} {empreinte_str:<25} {emoji} {category}")
        else:
            print(f"{nom:<20} {emission:<18.1f} {'N/A':<25} {'?'}")
    
    print("-" * 70)
    print("\nLegende des categories:")
    print("  - Zero emission (0.0000 kg):        Vert fonce")
    print("  - Faible (<= 0.0010 kg = 1.0 g):   Vert clair")
    print("  - Moyenne (<= 0.0050 kg = 5.0 g):  Orange")
    print("  - Elevee (> 0.0050 kg = 5.0 g):    Rouge")
    print("\n")

if __name__ == "__main__":
    update_emissions()

