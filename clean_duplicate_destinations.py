#!/usr/bin/env python3
"""
Clean duplicate destinations in Fuseki database
"""
from SPARQLWrapper import SPARQLWrapper, JSON
from config import FUSEKI_UPDATE_ENDPOINT, FUSEKI_QUERY_ENDPOINT, NAMESPACE, FUSEKI_USER, FUSEKI_PASSWORD

def get_all_destinations():
    """Get all destinations with their properties"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_ENDPOINT)
    sparql.setCredentials(FUSEKI_USER, FUSEKI_PASSWORD)
    query = f"""
    PREFIX ns: <{NAMESPACE}>
    SELECT ?destination ?nom ?pays ?climat
    WHERE {{
        ?destination a ns:Destination .
        OPTIONAL {{ ?destination ns:nom ?nom }}
        OPTIONAL {{ ?destination ns:pays ?pays }}
        OPTIONAL {{ ?destination ns:climat ?climat }}
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return results['results']['bindings']

def delete_all_destinations():
    """Delete ALL destination triples"""
    sparql = SPARQLWrapper(FUSEKI_UPDATE_ENDPOINT)
    sparql.setCredentials(FUSEKI_USER, FUSEKI_PASSWORD)
    query = f"""
    PREFIX ns: <{NAMESPACE}>
    DELETE WHERE {{
        ?destination a ns:Destination .
        ?destination ?p ?o .
    }}
    """
    sparql.setQuery(query)
    sparql.method = 'POST'
    sparql.query()
    print("Deleted all destination triples")

def create_destination(uri, nom, pays, climat):
    """Create a single destination"""
    sparql = SPARQLWrapper(FUSEKI_UPDATE_ENDPOINT)
    sparql.setCredentials(FUSEKI_USER, FUSEKI_PASSWORD)
    query = f"""
    PREFIX ns: <{NAMESPACE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        <{uri}> a ns:Destination .
        <{uri}> a ns:Ville .
        <{uri}> ns:nom "{nom}"^^xsd:string .
        <{uri}> ns:pays "{pays}"^^xsd:string .
        <{uri}> ns:climat "{climat}"^^xsd:string .
    }}
    """
    sparql.setQuery(query)
    sparql.method = 'POST'
    sparql.query()
    print(f"Created destination: {nom}")

def main():
    print("Cleaning duplicate destinations...")
    
    # Get all destinations
    destinations = get_all_destinations()
    print(f"Found {len(destinations)} destination entries")
    
    # Group by name to find duplicates
    dest_by_name = {}
    for dest in destinations:
        uri = dest.get('destination', {}).get('value', '')
        nom = dest.get('nom', {}).get('value', '')
        pays = dest.get('pays', {}).get('value', 'Tunisie')
        climat = dest.get('climat', {}).get('value', 'Mediterraneen')
        
        if nom and nom not in dest_by_name:
            dest_by_name[nom] = {
                'uri': uri,
                'nom': nom,
                'pays': pays,
                'climat': climat
            }
    
    print(f"Found {len(dest_by_name)} unique destinations:")
    for nom in dest_by_name.keys():
        print(f"  - {nom}")
    
    # Delete all destinations
    delete_all_destinations()
    
    # Recreate unique destinations
    print("\nRecreating unique destinations...")
    for dest in dest_by_name.values():
        # Clean URI - use consistent format
        clean_uri = f"{NAMESPACE}{dest['nom'].replace(' ', '_')}"
        create_destination(
            clean_uri,
            dest['nom'],
            dest['pays'],
            dest['climat']
        )
    
    print("\nDone! Destinations cleaned successfully!")
    print(f"Total unique destinations: {len(dest_by_name)}")

if __name__ == "__main__":
    main()

