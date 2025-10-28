"""
Script to load the ontology file into Fuseki triplestore
This will add the new transport individuals to your existing data
"""
import requests
from config import FUSEKI_UPDATE_ENDPOINT, FUSEKI_USER, FUSEKI_PASSWORD

def load_ontology():
    """Load the ontology file into Fuseki"""
    print("Loading ontology file into Fuseki...")
    
    # Read the ontology file
    with open('untitled-ontology-13', 'r', encoding='utf-8') as f:
        ontology_data = f.read()
    
    # Fuseki data upload endpoint
    upload_url = FUSEKI_UPDATE_ENDPOINT.replace('/update', '/data')
    
    print(f"Uploading to: {upload_url}")
    
    # Upload the RDF/XML data
    response = requests.post(
        upload_url,
        data=ontology_data.encode('utf-8'),
        headers={'Content-Type': 'application/rdf+xml'},
        auth=(FUSEKI_USER, FUSEKI_PASSWORD)
    )
    
    if response.status_code in [200, 201, 204]:
        print(f"[OK] Ontology loaded successfully! Status: {response.status_code}")
        
        # Verify the new transports
        print("\nVerifying new transports in Fuseki...")
        query = """
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?transport ?nom ?emission WHERE {
            ?transport a eco:Transport .
            ?transport eco:nom ?nom .
            OPTIONAL { ?transport eco:emissionCO2PerKm ?emission . }
        }
        ORDER BY ?emission
        """
        
        query_url = FUSEKI_UPDATE_ENDPOINT.replace('/update', '/query')
        verify_response = requests.post(
            query_url,
            data={'query': query},
            headers={'Accept': 'application/sparql-results+json'},
            auth=(FUSEKI_USER, FUSEKI_PASSWORD)
        )
        
        if verify_response.status_code == 200:
            results = verify_response.json()
            bindings = results.get('results', {}).get('bindings', [])
            print(f"\nTotal transports in Fuseki: {len(bindings)}")
            print("\nTransports found:")
            for i, binding in enumerate(bindings, 1):
                nom = binding.get('nom', {}).get('value', 'N/A')
                emission = binding.get('emission', {}).get('value', 'N/A')
                print(f"  {i}. {nom} - {emission} g/km")
        
        return True
    else:
        print(f"[ERROR] Error loading ontology: {response.status_code}")
        print(f"Response: {response.text}")
        return False

if __name__ == "__main__":
    success = load_ontology()
    if success:
        print("\n[SUCCESS] New transport individuals are now available in your application!")
        print("   - Velo Electrique (5 g/km)")
        print("   - Trottinette Electrique (10 g/km)")
        print("   - Metro (20 g/km)")
        print("   - Tramway (25 g/km)")
    else:
        print("\n[WARNING] Failed to load ontology. Please check Fuseki connection.")

