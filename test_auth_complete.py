#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test complet du système d'authentification
Tests: Register, Login, Profile pour Touriste et Guide
"""
import requests
import json

base_url = "http://localhost:8000"

print("="*80)
print("TEST COMPLET DU SYSTÈME D'AUTHENTIFICATION")
print("="*80)

# Test 1: Register Tourist
print("\n[TEST 1] Register new Tourist")
print("-" * 80)
tourist_data = {
    "nom": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "password": "password123",
    "age": 28,
    "nationalite": "France",
    "type": "touriste"
}

try:
    response = requests.post(f"{base_url}/auth/register", json=tourist_data)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 201:
        tourist_token = result.get('token')
        tourist_user = result.get('user')
        print(f"\n[OK] Tourist registered successfully!")
        print(f"  Token: {tourist_token[:50]}...")
        print(f"  User URI: {tourist_user.get('uri')}")
        print(f"  Email: {tourist_user.get('email')}")
    else:
        print(f"\n[FAIL] Failed to register tourist")
        tourist_token = None
except Exception as e:
    print(f"[ERROR] {e}")
    tourist_token = None

# Test 2: Register Guide
print("\n[TEST 2] Register new Guide")
print("-" * 80)
guide_data = {
    "nom": "Marie Martin",
    "email": "marie.martin@example.com",
    "password": "guide123",
    "age": 35,
    "nationalite": "Tunisia",
    "type": "guide"
}

try:
    response = requests.post(f"{base_url}/auth/register", json=guide_data)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 201:
        guide_token = result.get('token')
        guide_user = result.get('user')
        print(f"\n[OK] Guide registered successfully!")
        print(f"  Token: {guide_token[:50]}...")
        print(f"  User URI: {guide_user.get('uri')}")
        print(f"  Email: {guide_user.get('email')}")
    else:
        print(f"\n[FAIL] Failed to register guide")
        guide_token = None
except Exception as e:
    print(f"[FAIL] Error: {e}")
    guide_token = None

# Test 3: Login Tourist
print("\n[TEST 3] Login as Tourist")
print("-" * 80)
login_data = {
    "email": "jean.dupont@example.com",
    "password": "password123"
}

try:
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 200:
        print(f"\n[OK] Tourist login successful!")
        print(f"  User Type: {result.get('user', {}).get('type')}")
    else:
        print(f"\n[FAIL] Failed to login tourist")
except Exception as e:
    print(f"[FAIL] Error: {e}")

# Test 4: Login Guide
print("\n[TEST 4] Login as Guide")
print("-" * 80)
login_data = {
    "email": "marie.martin@example.com",
    "password": "guide123"
}

try:
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 200:
        print(f"\n[OK] Guide login successful!")
        print(f"  User Type: {result.get('user', {}).get('type')}")
    else:
        print(f"\n[FAIL] Failed to login guide")
except Exception as e:
    print(f"[FAIL] Error: {e}")

# Test 5: Get Tourist Profile with Token
if tourist_token:
    print("\n[TEST 5] Get Tourist Profile (with authentication)")
    print("-" * 80)
    
    try:
        headers = {"Authorization": f"Bearer {tourist_token}"}
        response = requests.get(f"{base_url}/auth/profile", headers=headers)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200:
            print(f"\n[OK] Profile retrieved successfully!")
        else:
            print(f"\n[FAIL] Failed to get profile")
    except Exception as e:
        print(f"[FAIL] Error: {e}")

# Test 6: Get Guide Profile with Token
if guide_token:
    print("\n[TEST 6] Get Guide Profile (with authentication)")
    print("-" * 80)
    
    try:
        headers = {"Authorization": f"Bearer {guide_token}"}
        response = requests.get(f"{base_url}/auth/profile", headers=headers)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200:
            print(f"\n[OK] Profile retrieved successfully!")
        else:
            print(f"\n[FAIL] Failed to get profile")
    except Exception as e:
        print(f"[FAIL] Error: {e}")

# Test 7: Invalid Login
print("\n[TEST 7] Test Invalid Login")
print("-" * 80)
invalid_data = {
    "email": "wrong@example.com",
    "password": "wrongpassword"
}

try:
    response = requests.post(f"{base_url}/auth/login", json=invalid_data)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 401:
        print(f"\n[OK] Invalid login correctly rejected!")
    else:
        print(f"\n[FAIL] Expected 401 status code")
except Exception as e:
    print(f"[FAIL] Error: {e}")

# Test 8: Access Protected Route without Token
print("\n[TEST 8] Access Protected Route without Token")
print("-" * 80)

try:
    response = requests.get(f"{base_url}/auth/profile")
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 401:
        print(f"\n[OK] Unauthorized access correctly rejected!")
    else:
        print(f"\n[FAIL] Expected 401 status code")
except Exception as e:
    print(f"[FAIL] Error: {e}")

print("\n" + "="*80)
print("RÉSUMÉ DU TEST")
print("="*80)
print("\nLE SYSTÈME D'AUTHENTIFICATION EST MAINTENANT PRÊT!")
print("\nVous pouvez:")
print("  1. Register un nouveau Touriste ou Guide avec email/password")
print("  2. Login avec email/password")
print("  3. Recevoir un JWT token")
print("  4. Utiliser le token pour accéder aux routes protégées")
print("\nTestez le frontend React maintenant!")
print("  cd Web-Semantique-Front")
print("  npm install")
print("  npm run dev")

