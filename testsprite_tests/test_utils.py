import requests
import json

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def get_jwt_token(email, password, user_type="touriste"):
    """
    Registers a user and logs them in to obtain a JWT token.
    """
    register_url = f"{BASE_URL}/auth/register"
    register_payload = {
        "nom": "Test User",
        "email": email,
        "password": password,
        "age": 30,
        "nationalite": "Testland",
        "type": user_type
    }
    
    try:
        # Attempt to register the user first
        register_response = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
        if register_response.status_code == 201:
            print(f"User {email} registered successfully.")
            return register_response.json().get('token')
        elif register_response.status_code == 409: # User already exists
            print(f"User {email} already exists. Attempting to log in.")
            login_url = f"{BASE_URL}/auth/login"
            login_payload = {
                "email": email,
                "password": password
            }
            login_response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
            if login_response.status_code == 200:
                print(f"User {email} logged in successfully.")
                return login_response.json().get('token')
            else:
                print(f"Failed to log in user {email}. Status: {login_response.status_code}, Response: {login_response.text}")
                return None
        else:
            print(f"Failed to register user {email}. Status: {register_response.status_code}, Response: {register_response.text}")
            return None
    except requests.RequestException as e:
        print(f"Request failed during JWT token retrieval: {e}")
        return None