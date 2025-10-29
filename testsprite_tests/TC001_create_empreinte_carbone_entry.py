import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_create_empreinte_carbone_entry():
    url = f"{BASE_URL}/api/empreinte_carbone"
    payload = {
        "valeur_co2_kg": 12.34
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"
        json_response = response.json()
        assert "valeur_co2_kg" in json_response, "Response JSON missing 'valeur_co2_kg' key"
        assert isinstance(json_response["valeur_co2_kg"], (int, float)), "'valeur_co2_kg' is not a number"
        assert json_response["valeur_co2_kg"] == payload["valeur_co2_kg"], "Returned 'valeur_co2_kg' does not match the input value"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_create_empreinte_carbone_entry()