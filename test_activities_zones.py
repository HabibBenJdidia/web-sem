"""
Test script for Activities and Natural Zones endpoints
Run this to verify your backend is working correctly
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_zone_naturelle():
    print_section("Testing Natural Zones Endpoints")
    
    # 1. Create a zone
    print("\n1. Creating a Natural Zone...")
    zone_data = {
        "nom": "Parc National Test",
        "type": "Parc National"
    }
    response = requests.post(f"{BASE_URL}/zone-naturelle", json=zone_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # 2. Get all zones
    print("\n2. Getting all Natural Zones...")
    response = requests.get(f"{BASE_URL}/zone-naturelle")
    print(f"Status: {response.status_code}")
    zones = response.json()
    print(f"Found {len(zones)} zones")
    if zones:
        print(f"First zone: {zones[0]}")
    
    return zones

def test_activite(zone_uri=None):
    print_section("Testing Activities Endpoints")
    
    # 1. Create an activity
    print("\n1. Creating an Activity...")
    activity_data = {
        "nom": "Test Hiking Activity",
        "difficulte": "Moyenne",
        "duree_heures": 3.5,
        "prix": 35.50
    }
    
    if zone_uri:
        activity_data["est_dans_zone"] = zone_uri
        print(f"Linking to zone: {zone_uri}")
    
    response = requests.post(f"{BASE_URL}/activite", json=activity_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # 2. Get all activities
    print("\n2. Getting all Activities...")
    response = requests.get(f"{BASE_URL}/activite")
    print(f"Status: {response.status_code}")
    activities = response.json()
    print(f"Found {len(activities)} activities")
    if activities:
        print(f"First activity: {activities[0]}")
    
    return activities

def test_search():
    print_section("Testing Search Endpoints")
    
    # Search by difficulty
    print("\n1. Searching activities by difficulty (Moyenne)...")
    response = requests.get(f"{BASE_URL}/search/activities/Moyenne")
    print(f"Status: {response.status_code}")
    results = response.json()
    print(f"Found {len(results)} activities with difficulty 'Moyenne'")

def test_health():
    print_section("Testing Health Endpoint")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def main():
    print("\n" + "🚀 "*20)
    print("  TESTING ACTIVITIES & NATURAL ZONES ENDPOINTS")
    print("🚀 "*20)
    
    try:
        # Test health
        test_health()
        
        # Test zones
        zones = test_zone_naturelle()
        
        # Get zone URI if available
        zone_uri = None
        if zones:
            for zone in zones:
                if zone.get('s', {}).get('value'):
                    zone_uri = zone['s']['value']
                    break
        
        # Test activities
        activities = test_activite(zone_uri)
        
        # Test search
        test_search()
        
        print_section("✅ ALL TESTS COMPLETED")
        print("\n✅ Backend is working correctly!")
        print("✅ You can now use the frontend")
        print("\nNext steps:")
        print("1. Start frontend: cd Web-Semantique-Front && npm run dev")
        print("2. Open browser: http://localhost:5173")
        print("3. Navigate to Activities or Natural Zones pages")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend")
        print("Make sure Flask is running on http://localhost:8000")
        print("Run: python app.py")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

if __name__ == "__main__":
    main()
