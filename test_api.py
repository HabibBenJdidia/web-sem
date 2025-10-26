import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    print("\n=== Testing Health Check ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_create_touriste():
    print("\n=== Testing Create Touriste ===")
    data = {
        "nom": "TestUser",
        "age": 28,
        "nationalite": "TN"
    }
    response = requests.post(f"{BASE_URL}/touriste", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_get_touristes():
    print("\n=== Testing Get All Touristes ===")
    response = requests.get(f"{BASE_URL}/touriste")
    print(f"Status: {response.status_code}")
    results = response.json()
    print(f"Found {len(results)} results")
    if results:
        print(f"Sample: {results[0]}")

def test_search_by_name():
    print("\n=== Testing Search by Name ===")
    response = requests.get(f"{BASE_URL}/search/name/Tabarka")
    print(f"Status: {response.status_code}")
    results = response.json()
    print(f"Found {len(results)} results")
    if results:
        print(f"Sample: {results[0]}")

def test_eco_hebergements():
    print("\n=== Testing Eco Hebergements Search ===")
    response = requests.get(f"{BASE_URL}/search/eco-hebergements")
    print(f"Status: {response.status_code}")
    results = response.json()
    print(f"Found {len(results)} results")

def test_bio_products():
    print("\n=== Testing Bio Products Search ===")
    response = requests.get(f"{BASE_URL}/search/bio-products")
    print(f"Status: {response.status_code}")
    results = response.json()
    print(f"Found {len(results)} results")

def test_zero_emission():
    print("\n=== Testing Zero Emission Transport ===")
    response = requests.get(f"{BASE_URL}/search/zero-emission-transport")
    print(f"Status: {response.status_code}")
    results = response.json()
    print(f"Found {len(results)} results")

if __name__ == '__main__':
    print("Waiting for API to be ready...")
    time.sleep(5)
    
    try:
        test_health()
        test_create_touriste()
        test_get_touristes()
        test_search_by_name()
        test_eco_hebergements()
        test_bio_products()
        test_zero_emission()
        print("\n✓ All tests completed!")
    except Exception as e:
        print(f"\n✗ Test failed: {e}")

