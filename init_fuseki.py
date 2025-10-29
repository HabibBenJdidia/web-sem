import requests
import time
import os
from config import FUSEKI_DATA_ENDPOINT, FUSEKI_USER, FUSEKI_PASSWORD

def wait_for_fuseki():
    """Wait for Fuseki to be ready"""
    print("Waiting for Fuseki...")
    fuseki_host = 'fuseki' if 'FUSEKI_URL' in os.environ and 'fuseki' in os.environ['FUSEKI_URL'] else 'localhost'
    for i in range(30):
        try:
            response = requests.get(f'http://{fuseki_host}:3030/$/ping')
            if response.status_code == 200:
                print("Fuseki is ready!")
                return True
        except:
            pass
        time.sleep(2)
        print(f"Attempt {i+1}/30...")
    return False

def load_ontology():
    """Load the ontology file into Fuseki"""
    print("Loading ontology...")
    
    with open('untitled-ontology-13', 'r', encoding='utf-8') as f:
        ontology_data = f.read()
    
    headers = {
        'Content-Type': 'application/rdf+xml'
    }
    
    try:
        response = requests.post(
            FUSEKI_DATA_ENDPOINT,
            data=ontology_data,
            headers=headers,
            auth=(FUSEKI_USER, FUSEKI_PASSWORD)
        )
        
        if response.status_code in [200, 201, 204]:
            print("✓ Ontology loaded successfully!")
            return True
        else:
            print(f"✗ Failed to load ontology: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"✗ Error loading ontology: {e}")
        return False

if __name__ == '__main__':
    if wait_for_fuseki():
        time.sleep(2)
        load_ontology()
    else:
        print("✗ Fuseki not available")

