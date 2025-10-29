import requests
import time

# Wait for Fuseki
print("Waiting for Fuseki...")
time.sleep(5)

# Create dataset
dataset_config = """
PREFIX :      <#>
PREFIX fuseki:  <http://jena.apache.org/fuseki#>
PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
PREFIX tdb2:    <http://jena.apache.org/2016/tdb#>
PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>

:service rdf:type fuseki:Service ;
    fuseki:name "ecotourism" ;
    fuseki:serviceQuery "query" ;
    fuseki:serviceQuery "sparql" ;
    fuseki:serviceUpdate "update" ;
    fuseki:serviceUpload "upload" ;
    fuseki:serviceReadGraphStore "get" ;
    fuseki:serviceReadWriteGraphStore "data" ;
    fuseki:dataset :dataset .

:dataset rdf:type ja:DatasetTxnMem ;
    ja:defaultGraph :graph .

:graph rdf:type ja:MemoryModel .
"""

try:
    # Create dataset
    print("Creating dataset...")
    response = requests.post(
        'http://localhost:3030/$/datasets',
        data={
            'dbName': 'ecotourism',
            'dbType': 'mem'
        },
        auth=('admin', 'admin')
    )
    
    if response.status_code in [200, 201, 409]:
        print("Dataset created/exists")
        
        # Load ontology
        print("Loading ontology...")
        with open('untitled-ontology-13', 'rb') as f:
            ontology_data = f.read()
        
        response = requests.post(
            'http://localhost:3030/ecotourism/data',
            data=ontology_data,
            headers={'Content-Type': 'application/rdf+xml'},
            auth=('admin', 'admin')
        )
        
        if response.status_code in [200, 201, 204]:
            print("Ontology loaded successfully!")
        else:
            print(f"Failed to load ontology: {response.status_code}")
            print(response.text)
    else:
        print(f"Failed to create dataset: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"Error: {e}")

