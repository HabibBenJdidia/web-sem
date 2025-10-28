#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to clean all transports from Fuseki and reload only ontology individuals
"""

import requests
from requests.auth import HTTPBasicAuth
import sys

# Fuseki configuration
FUSEKI_UPDATE_ENDPOINT = "http://localhost:3030/ecotourism/update"
FUSEKI_QUERY_ENDPOINT = "http://localhost:3030/ecotourism/query"
FUSEKI_USER = "admin"
FUSEKI_PASSWORD = "admin123"

def delete_all_transports():
    """Delete ALL transport-related triples from Fuseki"""
    print("Deleting all transports from Fuseki...")
    
    delete_query = """
    PREFIX eco: <http://example.org/eco-tourism#>
    
    DELETE {
        ?transport ?p ?o .
        ?empreinte ?ep ?eo .
    }
    WHERE {
        {
            ?transport a eco:Transport .
            ?transport ?p ?o .
            OPTIONAL {
                ?transport eco:aEmpreinte ?empreinte .
                ?empreinte ?ep ?eo .
            }
        }
        UNION
        {
            ?empreinte a eco:EmpreinteCarbone .
            ?empreinte ?ep ?eo .
        }
    }
    """
    
    try:
        response = requests.post(
            FUSEKI_UPDATE_ENDPOINT,
            data=delete_query.encode('utf-8'),
            headers={'Content-Type': 'application/sparql-update; charset=UTF-8'},
            auth=HTTPBasicAuth(FUSEKI_USER, FUSEKI_PASSWORD)
        )
        
        if response.status_code == 200 or response.status_code == 204:
            print("[OK] All transports deleted successfully!")
            return True
        else:
            print(f"[ERROR] Error deleting transports: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"[ERROR] Exception: {e}")
        return False

def count_transports():
    """Count remaining transports"""
    query = """
    PREFIX eco: <http://example.org/eco-tourism#>
    
    SELECT (COUNT(DISTINCT ?transport) as ?count)
    WHERE {
        ?transport a eco:Transport .
    }
    """
    
    try:
        response = requests.post(
            FUSEKI_QUERY_ENDPOINT,
            data={'query': query},
            auth=HTTPBasicAuth(FUSEKI_USER, FUSEKI_PASSWORD)
        )
        
        if response.status_code == 200:
            results = response.json()
            count = int(results['results']['bindings'][0]['count']['value'])
            return count
        return -1
    except Exception as e:
        print(f"Error counting: {e}")
        return -1

def main():
    print("=" * 60)
    print("   FUSEKI TRANSPORT CLEANUP")
    print("=" * 60)
    
    # Count before
    count_before = count_transports()
    print(f"\nTransports before cleanup: {count_before}")
    
    # Delete all
    if not delete_all_transports():
        print("\nCleanup failed!")
        sys.exit(1)
    
    # Count after
    count_after = count_transports()
    print(f"Transports after cleanup: {count_after}")
    
    if count_after == 0:
        print("\nCleanup successful! Fuseki is clean.")
        print("\nNext step: Run 'python load_ontology_to_fuseki.py' to reload ontology individuals")
    else:
        print(f"\nWarning: {count_after} transports still remain")
    
    print("=" * 60)

if __name__ == "__main__":
    main()

