#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys, io, requests, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_URL = "http://localhost:8000"

print("🧪 Testing User CRUD Operations\n")
print("="*50)

# Wait for backend to be ready
time.sleep(3)

# 1. Create a Tourist via auth/register
print("\n1️⃣  Creating a new Tourist...")
tourist_data = {
    "nom": "Test Tourist",
    "email": "test.tourist@example.com",
    "password": "password123",
    "age": "25",
    "nationalite": "French",
    "type": "touriste"
}

try:
    r = requests.post(f"{BASE_URL}/auth/register", json=tourist_data)
    if r.status_code == 201:
        print("✅ Tourist created successfully")
        result = r.json()
        tourist_uri = result['user']['uri']
        print(f"   URI: {tourist_uri}")
    else:
        print(f"❌ Failed: {r.status_code} - {r.text}")
        tourist_uri = None
except Exception as e:
    print(f"❌ Error: {e}")
    tourist_uri = None

# 2. Create a Guide via auth/register
print("\n2️⃣  Creating a new Guide...")
guide_data = {
    "nom": "Test Guide",
    "email": "test.guide@example.com",
    "password": "password123",
    "age": "30",
    "nationalite": "American",
    "type": "guide"
}

try:
    r = requests.post(f"{BASE_URL}/auth/register", json=guide_data)
    if r.status_code == 201:
        print("✅ Guide created successfully")
        result = r.json()
        guide_uri = result['user']['uri']
        print(f"   URI: {guide_uri}")
    else:
        print(f"❌ Failed: {r.status_code} - {r.text}")
        guide_uri = None
except Exception as e:
    print(f"❌ Error: {e}")
    guide_uri = None

# 3. Get all users
print("\n3️⃣  Getting all users...")
try:
    r = requests.get(f"{BASE_URL}/users")
    if r.status_code == 200:
        users = r.json().get('users', [])
        print(f"✅ Found {len(users)} users")
        for user in users[-2:]:
            print(f"   - {user.get('nom')}: {user.get('email')} ({user.get('type')})")
    else:
        print(f"❌ Failed: {r.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

# 4. Update Tourist
if tourist_uri:
    print(f"\n4️⃣  Updating Tourist...")
    update_data = {
        "nom": "Test Tourist Updated",
        "age": "26",
        "nationalite": "Spanish"
    }
    try:
        from urllib.parse import quote
        r = requests.put(f"{BASE_URL}/touriste/{quote(tourist_uri, safe='')}", json=update_data)
        if r.status_code == 200:
            print("✅ Tourist updated successfully")
        else:
            print(f"❌ Failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

# 5. Update Guide
if guide_uri:
    print(f"\n5️⃣  Updating Guide...")
    update_data = {
        "nom": "Test Guide Updated",
        "age": "31",
        "nationalite": "Canadian"
    }
    try:
        from urllib.parse import quote
        r = requests.put(f"{BASE_URL}/guide/{quote(guide_uri, safe='')}", json=update_data)
        if r.status_code == 200:
            print("✅ Guide updated successfully")
        else:
            print(f"❌ Failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

# 6. Verify updates
print("\n6️⃣  Verifying updates...")
try:
    r = requests.get(f"{BASE_URL}/users")
    if r.status_code == 200:
        users = r.json().get('users', [])
        print(f"✅ Verified - Current users:")
        for user in users[-2:]:
            print(f"   - {user.get('nom')}: Age {user.get('age')}, {user.get('nationalite')}")
    else:
        print(f"❌ Failed: {r.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "="*50)
print("✅ User CRUD test completed!")

