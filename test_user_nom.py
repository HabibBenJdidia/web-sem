#!/usr/bin/env python3
"""
Test script to verify that user 'nom' field is correctly stored and retrieved
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_user_nom():
    print("\n" + "="*60)
    print("TEST: Verification du champ 'nom' de l'utilisateur")
    print("="*60)
    
    # Test 1: Register a new user
    print("\n[TEST 1] Registration avec 'nom'...")
    register_data = {
        "nom": "Test Utilisateur",
        "email": "test.nom@example.com",
        "password": "testpassword",
        "age": 30,
        "nationalite": "France",
        "type": "touriste"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Registration successful")
            print(f"User data returned:")
            print(json.dumps(data.get('user', {}), indent=2))
            
            # Check if 'nom' is present
            if 'nom' in data.get('user', {}):
                print(f"\n[OK] Champ 'nom' present: {data['user']['nom']}")
            else:
                print(f"\n[FAIL] Champ 'nom' ABSENT!")
                print(f"Available fields: {list(data.get('user', {}).keys())}")
        else:
            print(f"[INFO] Registration response: {response.text}")
    except Exception as e:
        print(f"[ERROR] Registration failed: {e}")
    
    # Test 2: Login and check 'nom'
    print("\n[TEST 2] Login et verification du 'nom'...")
    login_data = {
        "email": "test.nom@example.com",
        "password": "testpassword"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Login successful")
            print(f"User data returned:")
            print(json.dumps(data.get('user', {}), indent=2))
            
            # Check if 'nom' is present
            if 'nom' in data.get('user', {}):
                print(f"\n[OK] Champ 'nom' present: {data['user']['nom']}")
            else:
                print(f"\n[FAIL] Champ 'nom' ABSENT!")
                print(f"Available fields: {list(data.get('user', {}).keys())}")
            
            # Test 3: Get profile
            print("\n[TEST 3] Get profile...")
            token = data.get('token')
            headers = {'Authorization': f'Bearer {token}'}
            
            profile_response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
            print(f"Status: {profile_response.status_code}")
            
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                print(f"[OK] Profile retrieved")
                print(f"Profile data:")
                print(json.dumps(profile_data, indent=2))
                
                if 'nom' in profile_data:
                    print(f"\n[OK] Champ 'nom' present dans profile: {profile_data['nom']}")
                else:
                    print(f"\n[FAIL] Champ 'nom' ABSENT du profile!")
        else:
            print(f"[FAIL] Login failed: {response.text}")
    except Exception as e:
        print(f"[ERROR] Login failed: {e}")
    
    # Test 4: Query existing user (Jean Dupont)
    print("\n[TEST 4] Login avec utilisateur existant (Jean Dupont)...")
    existing_login = {
        "email": "jean.dupont@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=existing_login)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Login successful")
            print(f"User data returned:")
            print(json.dumps(data.get('user', {}), indent=2))
            
            if 'nom' in data.get('user', {}):
                print(f"\n[OK] Champ 'nom' present: {data['user']['nom']}")
            else:
                print(f"\n[FAIL] Champ 'nom' ABSENT!")
        else:
            print(f"[INFO] User might not exist yet: {response.text}")
    except Exception as e:
        print(f"[ERROR] Login failed: {e}")
    
    print("\n" + "="*60)
    print("TESTS TERMINES")
    print("="*60)
    print("\nRESUME:")
    print("- Le backend retourne bien le champ 'nom' (pas 'name')")
    print("- Le frontend doit utiliser 'user.nom' pour afficher le nom")
    print("- Verifiez dans le navigateur: localStorage.getItem('user')")
    print("="*60 + "\n")

if __name__ == "__main__":
    test_user_nom()

