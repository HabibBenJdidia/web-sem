import requests
import json

# The backend is running in Docker on port 8000
BASE_URL = "http://localhost:8000"

print("=" * 60)
print("Testing Backend CREATE endpoints")
print("=" * 60)

# Test 1: Create Natural Zone
print("\n1. Testing CREATE Natural Zone...")
print("-" * 60)
url = f"{BASE_URL}/zone-naturelle"
data = {
    "nom": "Test Zone Backend",
    "type": "Parc National"
}

print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    response = requests.post(url, json=data, timeout=5)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Natural Zone created successfully!")
    else:
        print("❌ Failed to create Natural Zone")
except requests.exceptions.ConnectionError:
    print("❌ ERROR: Cannot connect to backend.")
    print("   Make sure Docker containers are running:")
    print("   docker-compose ps")
except Exception as e:
    print(f"❌ ERROR: {e}")

# Test 2: Create Activity
print("\n\n2. Testing CREATE Activity...")
print("-" * 60)
url = f"{BASE_URL}/activite"
data = {
    "nom": "Test Activity Backend",
    "difficulte": "Facile",
    "duree_heures": 2.5,
    "prix": 30.0
}

print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    response = requests.post(url, json=data, timeout=5)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Activity created successfully!")
    else:
        print("❌ Failed to create Activity")
except requests.exceptions.ConnectionError:
    print("❌ ERROR: Cannot connect to backend.")
    print("   Make sure Docker containers are running:")
    print("   docker-compose ps")
except Exception as e:
    print(f"❌ ERROR: {e}")

# Test 3: Get all zones to verify
print("\n\n3. Verifying - Getting all Natural Zones...")
print("-" * 60)
url = f"{BASE_URL}/zone-naturelle"

try:
    response = requests.get(url, timeout=5)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total results: {len(data)}")
        
        # Try to find our test zone
        found = False
        for item in data:
            if item.get('o', {}).get('value', '') == 'Test Zone Backend':
                found = True
                print("✅ Found our test zone in the database!")
                break
        
        if not found:
            print("⚠️  Test zone not found in results")
            print("   This might mean it wasn't created or has a different name")
    else:
        print(f"❌ Failed to get zones: {response.text}")
except Exception as e:
    print(f"❌ ERROR: {e}")

print("\n" + "=" * 60)
print("Test Complete")
print("=" * 60)
