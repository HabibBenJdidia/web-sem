"""
Script pour ajouter les EmpreintesCarbone manquantes aux transports existants
"""
import requests
from Mangage import SPARQLManager
from models.transport import Transport
from models.empreinte_carbone import EmpreinteCarbone
from config import NAMESPACE
import uuid

def fix_transports_empreintes():
    """Add missing EmpreinteCarbone to existing transports"""
    manager = SPARQLManager()
    
    print("Recuperation des transports existants...")
    
    # Query to get all transports
    query = """
    PREFIX eco: <http://example.org/eco-tourism#>
    SELECT ?transport ?nom ?type ?emission ?empreinte WHERE {
        ?transport a eco:Transport .
        OPTIONAL { ?transport eco:nom ?nom . }
        OPTIONAL { ?transport eco:type ?type . }
        OPTIONAL { ?transport eco:emissionCO2PerKm ?emission . }
        OPTIONAL { ?transport eco:aEmpreinte ?empreinte . }
    }
    """
    
    results = manager.execute_query(query)
    
    if not results:
        print("Aucun transport trouve")
        return
    
    # Group by transport URI
    transports_dict = {}
    for result in results:
        uri = result.get('transport', {}).get('value', '')
        if uri not in transports_dict:
            transports_dict[uri] = {
                'uri': uri,
                'nom': result.get('nom', {}).get('value'),
                'type': result.get('type', {}).get('value'),
                'emission': result.get('emission', {}).get('value'),
                'empreinte': result.get('empreinte', {}).get('value')
            }
    
    print(f"{len(transports_dict)} transport(s) trouve(s)\n")
    
    updated_count = 0
    skipped_count = 0
    
    for transport_data in transports_dict.values():
        uri = transport_data['uri']
        nom = transport_data['nom'] or 'Inconnu'
        emission = transport_data['emission']
        existing_empreinte = transport_data['empreinte']
        
        # Skip if already has empreinte
        if existing_empreinte:
            print(f"  {nom}: Empreinte deja presente, ignore")
            skipped_count += 1
            continue
        
        # Skip if no emission data
        if not emission:
            print(f"  {nom}: Pas de donnees d'emission, ignore")
            skipped_count += 1
            continue
        
        try:
            emission_value = float(emission)
            
            # Generate unique empreinte URI
            empreinte_id = str(uuid.uuid4())
            empreinte_uri = f"{NAMESPACE}Empreinte_{empreinte_id}"
            
            # Calculate CO2 value in kg
            valeur_co2_kg = emission_value / 1000.0
            
            # Create EmpreinteCarbone instance
            empreinte = EmpreinteCarbone(uri=empreinte_uri, valeur_co2_kg=valeur_co2_kg)
            
            # Generate SPARQL INSERT for empreinte
            empreinte_triples = empreinte.to_sparql_insert()
            
            # Add link from transport to empreinte
            link_triple = f'<{uri}> <{NAMESPACE}aEmpreinte> <{empreinte_uri}> .'
            
            # Combine all triples
            insert_query = f"""
            PREFIX eco: <{NAMESPACE}>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            
            INSERT DATA {{
                {empreinte_triples}
                {link_triple}
            }}
            """
            
            # Execute the insert
            result = manager.execute_update(insert_query)
            
            if result.get('success'):
                category = empreinte.get_category(valeur_co2_kg)
                print(f"[OK] {nom}: Empreinte creee ({valeur_co2_kg:.4f} kg CO2 - {category})")
                updated_count += 1
            else:
                print(f"[ERREUR] {nom}: Erreur lors de la creation - {result.get('error')}")
        
        except Exception as e:
            print(f"[ERREUR] {nom}: Exception - {str(e)}")
            continue
    
    print(f"\n{'='*60}")
    print(f"Mise a jour terminee!")
    print(f"{updated_count} empreinte(s) creee(s)")
    print(f"{skipped_count} transport(s) ignore(s)")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("FIX: Ajout des EmpreintesCarbone manquantes")
    print("="*60 + "\n")
    
    fix_transports_empreintes()
    
    print("\nScript termine! Rechargez la page dashboard pour voir les changements.\n")

