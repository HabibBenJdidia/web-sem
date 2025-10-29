"""
Test script for Restaurant and Product CRUD endpoints
Run with: python test_restaurant_product_endpoints.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_create_restaurant():
    """Test creating a restaurant"""
    print("\n" + "="*50)
    print("TEST: Create Restaurant")
    print("="*50)
    
    data = {
        "nom": "Test Restaurant Eco",
        "situe_dans": "http://example.org/eco-tourism#Ville_Paris",
        "sert": [],
        "capacite_max": 50
    }
    
    response = requests.post(f"{BASE_URL}/restaurant", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print("✅ Restaurant created successfully!")
        return response.json().get('uri')
    else:
        print("❌ Failed to create restaurant")
        return None

def test_get_all_restaurants():
    """Test getting all restaurants"""
    print("\n" + "="*50)
    print("TEST: Get All Restaurants")
    print("="*50)
    
    response = requests.get(f"{BASE_URL}/restaurant")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Found {len(data)} restaurant(s)")
        print("✅ Retrieved restaurants successfully!")
    else:
        print("❌ Failed to retrieve restaurants")

def test_create_product():
    """Test creating a product"""
    print("\n" + "="*50)
    print("TEST: Create Product")
    print("="*50)
    
    data = {
        "nom": "Tomates Bio Test",
        "saison": "Été",
        "bio": True
    }
    
    response = requests.post(f"{BASE_URL}/produit", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print("✅ Product created successfully!")
        return response.json().get('uri')
    else:
        print("❌ Failed to create product")
        return None

def test_get_all_products():
    """Test getting all products"""
    print("\n" + "="*50)
    print("TEST: Get All Products")
    print("="*50)
    
    response = requests.get(f"{BASE_URL}/produit")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Found {len(data)} product(s)")
        print("✅ Retrieved products successfully!")
    else:
        print("❌ Failed to retrieve products")

def test_update_restaurant(uri):
    """Test updating a restaurant"""
    if not uri:
        print("\n⚠️ Skipping update restaurant test - no URI available")
        return
    
    print("\n" + "="*50)
    print("TEST: Update Restaurant")
    print("="*50)
    
    data = {
        "nom": "Updated Test Restaurant"
    }
    
    response = requests.put(f"{BASE_URL}/restaurant/{requests.utils.quote(uri, safe='')}", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Restaurant updated successfully!")
    else:
        print("❌ Failed to update restaurant")

def test_update_product(uri):
    """Test updating a product"""
    if not uri:
        print("\n⚠️ Skipping update product test - no URI available")
        return
    
    print("\n" + "="*50)
    print("TEST: Update Product")
    print("="*50)
    
    data = {
        "saison": "Automne"
    }
    
    response = requests.put(f"{BASE_URL}/produit/{requests.utils.quote(uri, safe='')}", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Product updated successfully!")
    else:
        print("❌ Failed to update product")

def main():
    print("\n" + "🎯 "*20)
    print("Testing Restaurant and Product Endpoints")
    print("🎯 "*20)
    
    try:
        # Test Restaurant endpoints
        restaurant_uri = test_create_restaurant()
        test_get_all_restaurants()
        test_update_restaurant(restaurant_uri)
        
        # Test Product endpoints
        product_uri = test_create_product()
        test_get_all_products()
        test_update_product(product_uri)
        
        print("\n" + "="*50)
        print("🎉 All tests completed!")
        print("="*50 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to backend at", BASE_URL)
        print("Make sure the Flask server is running on port 8000")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

if __name__ == "__main__":
    main()

